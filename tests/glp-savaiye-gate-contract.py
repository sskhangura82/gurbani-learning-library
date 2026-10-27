"""GLP-001 Meaning+Learn private gateway regression, synthetic owner secret.
Exact 58 route allowlist, source and trust SHA, backward compatibility.
All old-version directories here are synthetic CI fixtures; actual Mac old
binary snapshots are verified separately. No public tunnel, no user data.
"""
import atexit,base64,hashlib,json,os,secrets,shutil,subprocess,sys,tempfile,time,urllib.error,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
CHILD=['index.html','reader.css','reader.js','continuous-core.js','sw.js',
       'data/library.json','data/jaap.json','data/savaiye.json','data/chaupai.json',
       'data/anand.json','data/rehras.json','data/sohila.json']
LEARNING=CHILD+['learning/learning-ui.js','learning/course.v1.json']
TRUST=LEARNING+['trust/index.html','trust/corrections.html','trust/trust.css']
JAPJI=['japji.html','japji-assets/icon-180.png','japji-assets/css/japji-full.css',
'japji-assets/css/reader-serenity.css']+['japji-assets/js/'+p for p in
 ['japji-full-data.js','content.js','gurdwaras.js','continuous-core.js','learning.js',
 'shared-learning.js','japji-lessons.js','line-meanings.js','japji-full.js']]
PARITY=TRUST+JAPJI
SOHILA=PARITY+['learning/course.v2.json']
SAVAIYE=SOHILA+['learning/course.v3.json']

OLD=['nitnem-today.html','css/nitnem-today.css','js/nitnem-today.js']
SIM_CONT=ROOT/'nitnem-continuous'
SIM_LEARN=ROOT/'nitnem-learning'
SIM_TRUST=ROOT/'nitnem-trust'
SIM_PARITY=ROOT/'nitnem-parity'
SIM_SOHILA=ROOT/'nitnem-sohila'
PREVIEW=ROOT/'nitnem-savaiye'
if any(folder.exists() for folder in [SIM_CONT,SIM_LEARN,SIM_TRUST,SIM_PARITY,SIM_SOHILA,PREVIEW]):
 raise RuntimeError('Refuse to overwrite a prior source/review application or synthetic test folder')
subprocess.run([sys.executable,str(ROOT/'tools/nitnem/build-savaiye-reader.py'),'--output',str(PREVIEW)],check=True,stdout=subprocess.DEVNULL)
for folder,subset in [(SIM_CONT,CHILD),(SIM_LEARN,LEARNING),(SIM_TRUST,TRUST),(SIM_PARITY,PARITY),(SIM_SOHILA,SOHILA)]:
 folder.mkdir(mode=0o700)
 for name in subset:
  target=folder/name;target.parent.mkdir(parents=True,exist_ok=True)
  shutil.copyfile(PREVIEW/name,target)
def cleanup():
 for root in [SIM_CONT,SIM_LEARN,SIM_TRUST,SIM_PARITY,SIM_SOHILA,PREVIEW]:
  if root.exists():
   for folder in sorted((x for x in root.rglob('*') if x.is_dir()),key=lambda x:len(x.parts),reverse=True):folder.chmod(0o700)
   root.chmod(0o700)
   shutil.rmtree(root)
atexit.register(cleanup)
def sha(b):return hashlib.sha256(b).hexdigest()
HOST='http://127.0.0.1:9027'
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kw):return None
client=urllib.request.build_opener(NoRedirect)
def req(path,headers=None,method='GET'):
 request=urllib.request.Request(HOST+path,headers=headers or {},method=method)
 try:
  with client.open(request,timeout=7) as r:return r.status,dict(r.headers),r.read()
 except urllib.error.HTTPError as e:return e.code,dict(e.headers),e.read()
def server(secret,manifest):
 return subprocess.Popen([sys.executable,str(ROOT/'tests/serve-gated-savaiye-nitnem.py'),
 '--snapshot',str(ROOT),'--config',str(secret),'--extra-manifest',str(manifest),'--port','9027'],
 stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def stop(process):
 process.terminate()
 try:process.wait(timeout=5)
 except subprocess.TimeoutExpired:process.kill();process.wait(timeout=5)
def main():
 checks=[]
 def ok(name,v):
  assert v,name
  checks.append(name)
 with tempfile.TemporaryDirectory(prefix='glp-savaiye-source-meaning-security-') as directory:
  dir=Path(directory)
  token=secrets.token_urlsafe(32)
  secret=dir/'auth.json'
  secret.write_text(json.dumps({'invitation_sha256':sha(token.encode()),
    'cookie_key':base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip('='),
    'invitation_expires_unix':int(time.time())+3600}))
  secret.chmod(0o600)
  names=OLD+['nitnem/'+x for x in CHILD]+['nitnem-continuous/'+x for x in CHILD]+['nitnem-learning/'+x for x in LEARNING]+['nitnem-trust/'+x for x in TRUST]+['nitnem-parity/'+x for x in PARITY]+['nitnem-sohila/'+x for x in SOHILA]+['nitnem-savaiye/'+x for x in SAVAIYE]
  assert len(names)==151 and len(set(names))==151
  filehash={n:sha((ROOT/n).read_bytes()) for n in names}
  correct=dir/'allowlist.json'
  correct.write_text(json.dumps(filehash));correct.chmod(0o600)
  tampered=dir/'tampered.json'
  fake=dict(filehash);fake['nitnem-savaiye/learning/course.v3.json']='0'*64
  tampered.write_text(json.dumps(fake));tampered.chmod(0o600)
  test=server(secret,tampered)
  try:
   deadline=time.time()+10
   while test.poll() is None and time.time()<deadline:time.sleep(.1)
   ok('Tampered complete-Savaiye bilingual course digest refuses gate startup',test.poll() is not None and test.returncode!=0)
  finally:
   if test.poll() is None:stop(test)
  p=server(secret,correct)
  try:
   ready=False
   for _ in range(100):
    if p.poll() is not None:raise RuntimeError('Private learning gate failed to start')
    try:
     if req('/nitnem-savaiye/index.html')[0]==401:ready=True;break
    except Exception:time.sleep(.1)
   ok('Private gate starts only on loopback',ready)
   for name in ['/nitnem-savaiye/index.html','/nitnem-savaiye/learning/course.v2.json','/nitnem-savaiye/japji.html','/nitnem-savaiye/japji-assets/js/japji-full.js','/nitnem-savaiye/trust/index.html','/nitnem-savaiye/trust/corrections.html','/nitnem-savaiye/learning/course.v1.json',
                '/nitnem-savaiye/data/jaap.json','/full-japji.html']:
    ok('Anonymous protected route 401: '+name,req(name)[0]==401)
   ok('Invalid invitation returns 403',req('/access/not-the-owner')[0]==403)
   status,h,_=req('/access/'+token)
   ok('Owner invitation opens same-site complete Savaiye and Sohila bilingual Meaning + Study private reader',status==303 and h.get('Location')=='/nitnem-savaiye/index.html')
   cookies=h.get('Set-Cookie','')
   ok('Cookie is secure HttpOnly SameSite',all(x in cookies for x in ('Secure','HttpOnly','SameSite=Lax','Max-Age=')))
   granted={'Cookie':cookies.split(';')[0]}
   for name in names+['full-japji.html','sw.js']:
    c,_,content=req('/'+name,granted)
    ok('Only hash-allowlisted original or teaching asset served: '+name,c==200 and len(content)>200)
   for name in ['/.git/config','/tests/nitnem-teaching-contract.mjs','/tools/nitnem/lesson-drafts.mjs',
                '/nitnem-savaiye/trust/hidden-approval.json','/nitnem-savaiye/trust/private-note.json']:
    ok('Private engineering and unapproved files cannot be served: '+name,req(name,granted)[0]==404)
   ok('Forged session cookie denied',req('/nitnem-savaiye/index.html',{'Cookie':'glp_qa_access=forged.bad.signature'})[0]==401)
   ok('Source reader refuses POST',req('/nitnem-savaiye/index.html',granted,'POST')[0]==405)
   status,h,_=req('/nitnem-savaiye/index.html',granted,'HEAD')
   ok('No outward referrer, no HTTP caching and no search indexing',
      status==200 and h.get('Referrer-Policy')=='no-referrer' and h.get('Cache-Control')=='no-store' and 'noindex' in h.get('X-Robots-Tag',''))
   print(json.dumps({'status':'PASS','checks':len(checks),'syntheticTestOnly':True,'familyRelease':False,'humanSourceApproval':False},indent=2))
  finally:stop(p)
if __name__=='__main__':main()
