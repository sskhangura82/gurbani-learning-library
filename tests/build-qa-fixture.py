"""Prepare a curated, namespaced static fixture; never deploys or copies learning."""
import argparse
from pathlib import Path
import shutil, subprocess
parser=argparse.ArgumentParser()
parser.add_argument('--source',required=True,type=Path)
parser.add_argument('--output',required=True,type=Path)
parser.add_argument('--version',required=True)
args=parser.parse_args()
if not args.version.startswith('qa-'):parser.error('Use a unique qa- worker version.')
if args.output.exists():parser.error('Output must be a new directory; no existing files are overwritten.')
root=Path(__file__).resolve().parent.parent
files=['index.html','full-japji.html','pauri-2-lesson.html','css/app.css','css/japji-full.css','js/app.js','js/content.js','js/core.js','js/gurdwaras.js','js/places.js','js/continuous-core.js','js/japji-full-data.js','js/japji-full.js','js/japji-lessons.js','js/line-meanings.js','js/learning.js','js/shared-learning.js','js/pwa.js','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png','manifest.webmanifest']
for name in files:
 source=args.source/name
 if not source.is_file():parser.error('Missing public runtime file: '+name)
args.output.mkdir(parents=True)
for name in files:
 dest=args.output/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(args.source/name,dest)
for name in ['sw-browser.html','sw-browser.js','build-sw.mjs']:
 dest=args.output/'tests'/name;dest.parent.mkdir(exist_ok=True);shutil.copy2(root/'tests'/name,dest)
for path in args.output.rglob('*.js'):
 path.write_text(path.read_text().replace('glp001.','glp001.qa-r6.'))
p=args.output/'tests/sw-browser.html'
p.write_text(p.read_text().replace('Synthetic learning only. This harness refuses to seed the family GitHub Pages origin.','Synthetic learning only. Dedicated QA namespace; family learning keys are untouched.'))
subprocess.run(['node','tests/build-sw.mjs',args.version],cwd=args.output,check=True)
(args.output/'tests/build-sw.mjs').unlink()
print('Prepared public-only fixture:',args.output)
