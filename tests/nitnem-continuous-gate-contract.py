"""GLP-001 private in-app Nitnem security gate CI, with throwaway secrets.
Only localhost. Never reads a real invitation or contacts any network provider.
"""
import base64,hashlib,json,os,secrets,subprocess,sys,tempfile,time,urllib.error,urllib.request,atexit,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
TEMP_VERSIONED=ROOT/'nitnem-continuous'
if TEMP_VERSIONED.exists():
 raise RuntimeError('Refuse to overwrite an existing continuous source preview for ephemeral QA')
subprocess.run([sys.executable,str(ROOT/'tools/nitnem/build-versioned-reader.py'),'--output',str(TEMP_VERSIONED)],stdout=subprocess.DEVNULL,check=True)
def clean_versioned():
 if TEMP_VERSIONED.exists():
  for folder in sorted((x for x in TEMP_VERSIONED.rglob('*') if x.is_dir()),key=lambda x:len(x.parts),reverse=True):folder.chmod(0o700)
  TEMP_VERSIONED.chmod(0o700)
  shutil.rmtree(TEMP_VERSIONED)
atexit.register(clean_versioned)
PORT=8997
BASE="http://127.0.0.1:"+str(PORT)
CHILD_ASSETS=[
 "nitnem/index.html","nitnem/reader.css","nitnem/reader.js",
 "nitnem/continuous-core.js","nitnem/sw.js",
 "nitnem/data/library.json","nitnem/data/jaap.json","nitnem/data/savaiye.json",
 "nitnem/data/chaupai.json","nitnem/data/anand.json",
 "nitnem/data/rehras.json","nitnem/data/sohila.json"
]
OLD=["nitnem-today.html","css/nitnem-today.css","js/nitnem-today.js"]
VERSIONED=["nitnem-continuous/"+p.split("nitnem/",1)[1] for p in CHILD_ASSETS]
def sha(b):return hashlib.sha256(b).hexdigest()
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
opener=urllib.request.build_opener(NoRedirect)
def request(route,method='GET',headers=None):
 req=urllib.request.Request(BASE+route,method=method,headers=headers or {})
 try:
  with opener.open(req,timeout=5) as r:return r.status,dict(r.headers),r.read()
 except urllib.error.HTTPError as e:return e.code,dict(e.headers),e.read()
def start(config,extras):
 return subprocess.Popen([sys.executable,str(ROOT/'tests/serve-gated-continuous-nitnem.py'),
                          '--snapshot',str(ROOT),'--config',str(config),
                          '--extra-manifest',str(extras),'--port',str(PORT)],
                          stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def stop(p):
 p.terminate()
 try:p.wait(timeout=5)
 except subprocess.TimeoutExpired:p.kill();p.wait(timeout=5)
def main():
 checks=[]
 def test(label,ok):
  if not ok:raise AssertionError(label)
  checks.append(label)
 with tempfile.TemporaryDirectory(prefix='glp-internal-gate-') as temp:
  home=Path(temp);invite=secrets.token_urlsafe(32)
  auth={'invitation_sha256':sha(invite.encode()),
        'cookie_key':base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip('='),
        'invitation_expires_unix':int(time.time())+3600}
  authfile=home/'auth.json';authfile.write_text(json.dumps(auth));authfile.chmod(0o600)
  extras={name:sha((ROOT/name).read_bytes()) for name in OLD+CHILD_ASSETS+VERSIONED}
  assert len(extras)==27
  manifest=home/'review-assets.json';manifest.write_text(json.dumps(extras));manifest.chmod(0o600)
  wrong=home/'tampered-manifest.json';modified=dict(extras);modified['nitnem-continuous/data/anand.json']='f'*64
  wrong.write_text(json.dumps(modified));wrong.chmod(0o600)
  proc=start(authfile,wrong)
  try:
   deadline=time.time()+10
   while proc.poll() is None and time.time()<deadline:time.sleep(.1)
   test('Source-tampered SHA-256 access manifest refuses to start',proc.poll() is not None and proc.returncode!=0)
  finally:
   if proc.poll() is None:stop(proc)
  proc=start(authfile,manifest)
  try:
   online=False
   for _ in range(100):
    if proc.poll() is not None:raise AssertionError('QA private gate did not start')
    try:
     if request('/nitnem-continuous/index.html')[0]==401:online=True;break
    except Exception:time.sleep(.1)
   test('Private QA gated server starts on loopback',online)
   test('Anonymous Nitnem collection denied',request('/nitnem-continuous/index.html')[0]==401)
   test('Anonymous original SGGS/Dasam source denied',request('/nitnem/data/jaap.json')[0]==401)
   test('Anonymous original Japji denied',request('/full-japji.html')[0]==401)
   test('Anonymous cache-worker denied',request('/nitnem/sw.js')[0]==401)
   test('Unknown or forged invitation refused',request('/access/not-a-real-token')[0]==403)
   status,headers,_=request('/access/'+invite)
   test('Original invitation redirects to ALL-INTERNAL Nitnem page',status==303 and headers.get('Location')=='/nitnem-continuous/index.html')
   cookie=headers.get('Set-Cookie','')
   test('Session cookie uses Secure, HttpOnly, SameSite and explicit expiry',all(x in cookie for x in ['Secure','HttpOnly','SameSite=Lax','Max-Age=']))
   granted={'Cookie':cookie.split(';')[0]}
   for f in OLD+CHILD_ASSETS+VERSIONED+['full-japji.html','sw.js']:
    status,_,body=request('/'+f,headers=granted)
    test('Only source-hash-pinned asset readable: '+f,status==200 and len(body)>200)
   test('Forged signed cookie is never accepted',request('/nitnem-continuous/index.html',headers={'Cookie':'glp_qa_access=123.fake.abcdef'})[0]==401)
   for f in ['/.git/config','/tests/nitnem-internal-source-contract.mjs',
             '/tools/nitnem/build-source-packs.py','/docs/NITNEM_INTERNAL_PRIVATE_REVIEW.md',
             '/nitnem/source_approval.txt','/nitnem/data/not-a-bani.json','/%2e%2e/sw.js']:
    test('Nonallowlisted private engineering files are unavailable: '+f,request(f,headers=granted)[0]==404)
   test('POST on private Nitnem page prohibited',request('/nitnem-continuous/index.html',headers=granted,method='POST')[0]==405)
   status,h,_=request('/nitnem-continuous/index.html',headers=granted,method='HEAD')
   test('HEAD works without returning content',status==200)
   test('No invitation referrer and no gateway cache',h.get('Referrer-Policy')=='no-referrer' and h.get('Cache-Control')=='no-store')
   test('No indexing or cross-origin resource embedding',h.get('X-Robots-Tag','').startswith('noindex') and h.get('Cross-Origin-Resource-Policy')=='same-origin')
   print(json.dumps({'status':'PASS','checks':len(checks),'purpose':'Throwaway local private-gate + source integrity only','identityAuth':False,'publicRelease':False},indent=2))
  finally:stop(proc)
if __name__=='__main__':main()
