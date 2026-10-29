"""Test a generated private version using synthetic credentials and fixtures.
No real invitation, host snapshot, live gateway or existing profile is used.
Older fixture routes are synthetic; actual old snapshot preservation is separate.
"""
import argparse,ast,base64,hashlib,json,secrets,shutil,socket,subprocess,sys,tempfile,time,urllib.error,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
a=argparse.ArgumentParser();a.add_argument('--site',type=Path,required=True);a.add_argument('--version',type=int,required=True);a.add_argument('--report',type=Path,required=True);args=a.parse_args()
site=args.site.resolve(strict=True);version=args.version;prefix=f'nitnem-learning-v{version}/';gateway=ROOT/f'tests/serve-gated-nitnem-v{version}.py'
assert gateway.is_file() and (site/f'learning/course.v{version}.json').is_file()
def sha(data):return hashlib.sha256(data).hexdigest()
node=next(n for n in ast.parse(gateway.read_text()).body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='approved_extra' for t in n.targets))
names=ast.literal_eval(node.value)
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):return None
client=urllib.request.build_opener(NoRedirect)
checks=[]
def ok(name,value):
 assert value,name
 checks.append(name)
def stop(p):
 if p.poll() is None:
  p.terminate()
  try:p.wait(timeout=5)
  except subprocess.TimeoutExpired:p.kill();p.wait(timeout=5)
with tempfile.TemporaryDirectory(prefix=f'glp-v{version}-gateway-') as temp:
 d=Path(temp);root=d/'snapshot';root.mkdir()
 worker=(ROOT/'sw.js').read_text();rootmanifest=json.loads(worker.split('const EXPECTED=',1)[1].split(';',1)[0])
 for rel in [x[2:] or 'index.html' for x in rootmanifest]+['sw.js']:
  src=ROOT/rel;assert src.is_file() and not src.is_symlink();dst=root/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
 hashes={}
 for rel in sorted(names):
  assert '..' not in Path(rel).parts and not rel.startswith('/')
  if rel.startswith(prefix):src=site/rel[len(prefix):]
  elif rel.split('/')[0].startswith('nitnem') and '/' in rel:src=ROOT/'nitnem'/rel.split('/',1)[1]
  else:src=ROOT/rel
  assert src.is_file() and not src.is_symlink(),str(src)
  dst=root/rel;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst);hashes[rel]=sha(dst.read_bytes())
 secret=d/'auth.json';token=secrets.token_urlsafe(32)
 secret.write_text(json.dumps({'invitation_sha256':sha(token.encode()),'cookie_key':base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip('='),'invitation_expires_unix':int(time.time())+3600}));secret.chmod(0o600)
 manifest=d/'allowlist.json';manifest.write_text(json.dumps(hashes));manifest.chmod(0o600)
 with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
 host=f'http://127.0.0.1:{port}'
 def req(path,cookie=None,method='GET'):
  r=urllib.request.Request(host+path,headers={'Cookie':cookie} if cookie else {},method=method)
  try:
   with client.open(r,timeout=8) as res:return res.status,dict(res.headers),res.read()
  except urllib.error.HTTPError as e:return e.code,dict(e.headers),e.read()
 def launch(m):return subprocess.Popen([sys.executable,str(gateway),'--snapshot',str(root),'--config',str(secret),'--extra-manifest',str(m),'--port',str(port)],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,text=True)
 fake=dict(hashes);fake[prefix+f'learning/course.v{version}.json']='0'*64;bad=d/'tampered.json';bad.write_text(json.dumps(fake))
 p=launch(bad)
 try:
  try:p.wait(timeout=8)
  except subprocess.TimeoutExpired:raise AssertionError('Tampered manifest did not fail startup')
  ok('Tampered manifest prevents startup',p.returncode!=0)
 finally:stop(p)
 p=launch(manifest)
 try:
  for _ in range(100):
   if p.poll() is not None:raise RuntimeError('Synthetic gateway exited: '+p.stderr.read())
   try:
    if req('/'+prefix+'index.html')[0]==401:break
   except OSError:pass
   time.sleep(.05)
  ok('Anonymous new reader denied',req('/'+prefix+'index.html')[0]==401)
  ok('Anonymous course denied',req('/'+prefix+f'learning/course.v{version}.json')[0]==401)
  ok('Anonymous historical reader denied',req('/full-japji.html')[0]==401)
  ok('Invalid invitation denied',req('/access/not-the-owner')[0]==403)
  status,h,_=req('/access/'+token);ok('Existing invitation format redirects to the new version',status==303 and h.get('Location')=='/'+prefix+'index.html')
  ok('Session cookie protections retained',all(x in h.get('Set-Cookie','') for x in ['Secure','HttpOnly','SameSite=Lax','Max-Age=']))
  cookie=h['Set-Cookie'].split(';')[0]
  for rel,digest in hashes.items():
   status,_,data=req('/'+rel,cookie);ok('Exact fixture asset: '+rel,status==200 and sha(data)==digest)
  for rel in ['full-japji.html','sw.js']:
   status,_,data=req('/'+rel,cookie);ok('Root fixture: '+rel,status==200 and sha(data)==sha((root/rel).read_bytes()))
  f=root/prefix/f'learning/course.v{version}.json';original=f.read_bytes();f.write_bytes(original+b' ')
  ok('Runtime tampering fails closed',req('/'+prefix+f'learning/course.v{version}.json',cookie)[0]==503)
  f.write_bytes(original);ok('Restored exact bytes recover',req('/'+prefix+f'learning/course.v{version}.json',cookie)[0]==200)
  for rel in ['.git/config','tests/hidden.py',prefix+'trust/private.json','auth.json']:
   ok('Unlisted engineering or secret denied: '+rel,req('/'+rel,cookie)[0]==404)
  ok('Forged cookie denied',req('/'+prefix+'index.html','glp_qa_access=forged.bad.signature')[0]==401)
  ok('POST denied',req('/'+prefix+'index.html',cookie,'POST')[0]==405)
  status,h,_=req('/'+prefix+'index.html',cookie,'HEAD');ok('No cache, referrer or indexing',status==200 and h.get('Cache-Control')=='no-store' and h.get('Referrer-Policy')=='no-referrer' and 'noindex' in h.get('X-Robots-Tag',''))
 finally:stop(p)
report={'status':'PASS','checks':len(checks),'version':version,'extraRoutes':len(names),'syntheticCredentials':True,'historicalRoutesAreSyntheticFixtures':True,'liveDeployment':False,'cases':checks}
args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='cases'},indent=2))
