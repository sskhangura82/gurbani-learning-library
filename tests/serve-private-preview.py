"""Loopback-only static allowlist server for a single GLP review snapshot.
Explicitly refuses Git metadata, docs, test harnesses, uploads and directory listing.
Tailnet exposure must be configured separately by a trusted operator.
"""
import argparse
import http.server
import json
import re
from pathlib import Path
from urllib.parse import urlsplit, unquote
p=argparse.ArgumentParser()
p.add_argument('snapshot',type=Path)
p.add_argument('--port',type=int,default=8897)
a=p.parse_args()
root=a.snapshot.resolve(strict=True)
if not (root/'sw.js').is_file():p.error('Missing snapshot worker')
worker=(root/'sw.js').read_text()
match=re.search(r'^const EXPECTED=(\{[^\n]+\});',worker,re.M)
if not match:p.error('Missing worker manifest')
hashes=json.loads(match.group(1))
routes={'/sw.js':'sw.js','/':'index.html'}
for asset in hashes:
 if not asset.startswith('./'):p.error('Unrecognized asset path')
 routes['/'+(asset[2:] or 'index.html')]=asset[2:] or 'index.html'
for route,rel in routes.items():
 if not (root/rel).is_file() or (root/rel).is_symlink():p.error('Missing or symlinked allowlisted file '+route)
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
 def resolve(self):
  raw=urlsplit(self.path).path
  decoded=unquote(raw)
  return routes.get(decoded)
 def do_GET(self):
  rel=self.resolve()
  if not rel:
   self.send_error(404,'Not in QA static allowlist');return
  self.path='/'+rel
  super().do_GET()
 def do_HEAD(self):
  rel=self.resolve()
  if not rel:
   self.send_error(404,'Not in QA static allowlist');return
  self.path='/'+rel
  super().do_HEAD()
 def do_POST(self):
  self.send_error(405,'QA preview is read only')
 def end_headers(self):
  self.send_header('Cache-Control','no-store')
  self.send_header('X-Content-Type-Options','nosniff')
  self.send_header('X-Robots-Tag','noindex, nofollow, noarchive')
  self.send_header('Referrer-Policy','no-referrer')
  super().end_headers()
 def log_message(self,*args):pass
 def list_directory(self,path):
  self.send_error(403,'QA listing disabled');return None
print('GLP QA static allowlist server on 127.0.0.1:'+str(a.port)+'; '+str(len(routes))+' allowed routes',flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
