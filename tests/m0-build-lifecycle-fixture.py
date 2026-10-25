"""Build four isolated loopback bundles. No server, browser control or production writes.
Each stage uses its OWN release asset list, so R7 is not given candidate-only CSS.
The pwa.js protocol exception is strictly fixture-only: source production JS is never changed.
"""
import argparse,ast,json,re,shutil,subprocess,datetime
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument('--r7',required=True,type=Path)
p.add_argument('--candidate',type=Path,default=Path(__file__).resolve().parent.parent)
p.add_argument('--output',required=True,type=Path)
a=p.parse_args()
if a.output.exists(): p.error('Output must be new; existing files are never overwritten')
root=Path(__file__).resolve().parent.parent

def release_assets(source):
 builder=source/'tests/build-sw.mjs'
 if not builder.is_file(): p.error('Missing release builder: '+str(builder))
 match=re.search(r'const names=(\[.*?\]);',builder.read_text())
 if not match: p.error('Cannot parse source asset list: '+str(builder))
 return list(dict.fromkeys(x or 'index.html' for x in ast.literal_eval(match.group(1))))

for source in [a.r7,a.candidate]:
 for name in release_assets(source):
  if not (source/name).is_file(): p.error('Missing release asset: '+str(source/name))

a.output.mkdir(parents=True)
run_id=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
stages=[('01-r7',a.r7),('02-m0',a.candidate),('03-r7-rollback',a.r7),('04-m0-repeat',a.candidate)]
for stage,source in stages:
 dest=a.output/stage
 dest.mkdir()
 for name in release_assets(source):
  target=dest/name
  target.parent.mkdir(parents=True,exist_ok=True)
  shutil.copy2(source/name,target)
 # A fixture must not share storage keys with the family's real reader.
 for path in dest.rglob('*.js'):
  path.write_text(path.read_text().replace('glp001.','glp001.qa-m0.'))
 # Production PWA deliberately registers only on HTTPS; this QA-only copy
 # permits trusted loopback so the actual install/wait/activate can be tested.
 pwa=dest/'js/pwa.js'
 before=pwa.read_text()
 original="if('serviceWorker' in navigator&&location.protocol==='https:')"
 loopback="if('serviceWorker' in navigator&&(location.protocol==='https:'||(location.protocol==='http:'&&location.hostname==='127.0.0.1'&&isSecureContext)))"
 if before.count(original)!=1: p.error('Unexpected PWA registration guard: '+str(pwa))
 pwa.write_text(before.replace(original,loopback))
 (dest/'tests').mkdir()
 for name in ['m0-sw-browser.html','m0-sw-browser.js']:
  shutil.copy2(root/'tests'/name,dest/'tests'/name)
 shutil.copy2(source/'tests/build-sw.mjs',dest/'tests/build-sw.mjs')
 version='qa-m0-'+stage+'-'+run_id
 subprocess.run(['node','tests/build-sw.mjs',version],cwd=dest,check=True)
 (dest/'tests/build-sw.mjs').unlink()
 (dest/'fixture-stage.json').write_text(json.dumps({'stage':stage,'version':version,'assetCount':len(release_assets(source))}))
(a.output/'current').symlink_to('01-r7',target_is_directory=True)
print('Built QA-only R7→M0→R7→M0 loopback fixture. No browser test has run.')