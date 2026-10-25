"""GLP Nitnem Today gateway QA — ephemeral signed access, all local, no uploads.
CI builds a temporary extra manifest from these 3 files and uses randomized
credentials. It never contacts Cloudflare, stores tokens in Git or touches family data.
"""
import base64
import hashlib
import json
import os
import secrets
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

root=Path(__file__).resolve().parents[1]
origin="http://127.0.0.1:8995"
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect)
def fetch(path,method="GET",headers=None):
 req=urllib.request.Request(origin+path,method=method,headers=headers or {})
 try:
  with opener.open(req,timeout=5) as r:return r.status,dict(r.headers),r.read()
 except urllib.error.HTTPError as e:return e.code,dict(e.headers),e.read()
with tempfile.TemporaryDirectory(prefix="glp-nitnem-today-ci-") as td:
 base=Path(td)
 token=secrets.token_urlsafe(32)
 conf={
  "invitation_sha256":hashlib.sha256(token.encode()).hexdigest(),
  "invitation_expires_unix":int(time.time())+3600,
  "cookie_key":base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip("=")
 }
 auth=base/"auth.json";auth.write_text(json.dumps(conf));auth.chmod(0o600)
 extra={name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in [
  "nitnem-today.html","css/nitnem-today.css","js/nitnem-today.js"]}
 ex=base/"extra.json";ex.write_text(json.dumps(extra));ex.chmod(0o600)
 command=[sys.executable,str(root/"tests/serve-gated-nitnem-today.py"),
          "--snapshot",str(root),"--config",str(auth),"--extra-manifest",str(ex),"--port","8995"]
 process=subprocess.Popen(command,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 checks=[]
 def confirm(condition,label):
  assert condition,label
  checks.append(label)
 try:
  ready=False
  for _ in range(90):
   if process.poll() is not None:raise AssertionError("Gated QA server could not start")
   try:
    if fetch("/nitnem-today.html")[0]==401:
     ready=True;break
   except Exception:time.sleep(.10)
  confirm(ready,"No anonymous Nitnem page access")
  confirm(fetch("/full-japji.html")[0]==401,"No anonymous Japji page access")
  confirm(fetch("/js/nitnem-today.js")[0]==401,"No anonymous JavaScript access")
  confirm(fetch("/access/nope")[0]==403,"Invalid invite rejected")
  code,head,_=fetch("/access/"+token)
  confirm(code==303 and head.get("Location")=="/nitnem-today.html","Valid invitation lands on Full Nitnem today")
  cookie_head=head.get("Set-Cookie","")
  confirm(all(x in cookie_head for x in ["Secure","HttpOnly","SameSite=Lax","Max-Age="]),"Authenticated browser gets safe private cookie")
  cookie={"Cookie":cookie_head.split(";")[0]}
  for route in ["nitnem-today.html","css/nitnem-today.css","js/nitnem-today.js","full-japji.html","sw.js"]:
   status,_,data=fetch("/"+route,headers=cookie)
   confirm(status==200 and len(data)>1000,"Approved original/hash-pinned "+route)
  confirm(fetch("/nitnem-today.html",headers={"Cookie":"glp_qa_access=bad.forged.value"})[0]==401,"Forged cookie rejected")
  for forbidden in ["/.git/config","/tests/nitnem-today-browser.mjs","/docs/NITNEM_TODAY_LINKED_READING_20261025.md","/%2e%2e/sw.js"]:
   confirm(fetch(forbidden,headers=cookie)[0]==404,"Private file 404 "+forbidden)
  confirm(fetch("/nitnem-today.html",method="POST",headers=cookie)[0]==405,"No site writes allowed")
  confirm(fetch("/nitnem-today.html",method="HEAD",headers=cookie)[0]==200,"HEAD metadata allowed")
  h=fetch("/nitnem-today.html",headers=cookie)[1]
  confirm(h.get("Referrer-Policy")=="no-referrer","No outbound bearer referrer")
  confirm(h.get("Cache-Control")=="no-store","No HTTP gateway cache persistence")
  print(json.dumps({"status":"PASS","checks":len(checks),"scope":"Local synthetic invite + source-allowlisted preview; no network or user data"},indent=2))
 finally:
  process.terminate()
  try:process.wait(timeout=4)
  except subprocess.TimeoutExpired:process.kill();process.wait(timeout=4)
