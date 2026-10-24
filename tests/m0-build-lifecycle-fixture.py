"""Build four isolated loopback bundles. No server, browser control or production writes."""
import argparse,ast,json,re,shutil,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--r7',required=True,type=Path);p.add_argument('--candidate',type=Path,default=Path(__file__).resolve().parent.parent);p.add_argument('--output',required=True,type=Path);a=p.parse_args()
if a.output.exists():p.error('Output must be new; existing files are never overwritten')
root=Path(__file__).resolve().parent.parent
names=ast.literal_eval(re.search(r'const names=(\[.*?\]);', (root/'tests/build-sw.mjs').read_text()).group(1))
names=list(dict.fromkeys(x or 'index.html' for x in names))
for source in [a.r7,a.candidate]:
 for name in names:
  if not (source/name).is_file():p.error('Missing runtime file: '+str(source/name))
a.output.mkdir(parents=True)
for stage,source in [('01-r7',a.r7),('02-m0',a.candidate),('03-r7-rollback',a.r7),('04-m0-repeat',a.candidate)]:
 dest=a.output/stage;dest.mkdir()
 for name in names:
  target=dest/name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source/name,target)
 for path in dest.rglob('*.js'):path.write_text(path.read_text().replace('glp001.','glp001.qa-m0.'))
 (dest/'tests').mkdir()
 for name in ['m0-sw-browser.html','m0-sw-browser.js','build-sw.mjs']:shutil.copy2(root/'tests'/name,dest/'tests'/name)
 version='qa-m0-'+stage+'-20261024'
 subprocess.run(['node','tests/build-sw.mjs',version],cwd=dest,check=True)
 (dest/'tests/build-sw.mjs').unlink()
 (dest/'fixture-stage.json').write_text(json.dumps({'stage':stage,'version':version}))
(a.output/'current').symlink_to('01-r7',target_is_directory=True)
print('Built isolated fixture. See docs/M0_ROLLBACK_AND_LIFECYCLE.md. No browser test has run.')
