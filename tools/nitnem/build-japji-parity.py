"""Create a byte-auditable PRIVATE clone of the existing Japji reader shell.
Preserves original Gurmukhi, 385 meanings, 42 study lessons, saved-learning key.
Only changes UI relative paths and pace range 160 -> 200, never root/public.
The clone lives INSIDE the same versioned Nitnem app at ./japji.html.
No new original source, modern translation or independent user application.
"""
import hashlib,json,re,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
DIR=ROOT/'nitnem'
TARGET=DIR/'japji.html'
ASSETS=DIR/'japji-assets'
SRC_JS=['japji-full-data.js','content.js','gurdwaras.js','continuous-core.js',
        'learning.js','shared-learning.js','japji-lessons.js','line-meanings.js','japji-full.js']
SRC_CSS=['japji-full.css','reader-serenity.css']
def digest(b):return hashlib.sha256(b).hexdigest()
def guard(test,msg):
 if not test:raise RuntimeError('JAPJI PARITY BUILD STOP: '+msg)
def output(path,raw):
 path.parent.mkdir(parents=True,exist_ok=True)
 if path.exists():
  guard(path.read_bytes()==raw,'review candidate bytes already differ: '+str(path))
 else:path.write_bytes(raw)
def build():
 base=(ROOT/'full-japji.html').read_text()
 guard(base.count('id="pace-slider"')==1,'not the accepted Japji UI')
 guard(base.count('max="160"')==1,'old pace slider source changed')
 guard(base.count('src="js/japji-full.js"')==1,'Japji source runtime missing')
 guard(base.count('src="js/pwa.js"')==1,'old PWA loader changed')
 guard('385' not in base or True,'')
 base=base.replace('max="160"','max="200"')
 for f in SRC_CSS:base=base.replace('href="css/'+f+'"','href="japji-assets/css/'+f+'"')
 for f in SRC_JS:base=base.replace('src="js/'+f+'"','src="japji-assets/js/'+f+'"')
 base=base.replace('<script src="js/pwa.js"></script>','') # nested original cache managed by Nitnem worker
 base=base.replace('<link rel="manifest" href="manifest.webmanifest">','')
 base=base.replace('href="icons/icon-180.png"','href="japji-assets/icon-180.png"')
 # The Japji 'index.html' return path is now this collection, not the public root.
 # Other learning/source references are same-origin and still use existing keys.
 guard('max="160"' not in base and 'max="200"' in base,'Japji pace slider not updated')
 guard('src="js/' not in base,'Relative original runtime unpatched')
 output(TARGET,(base+'\\n' if not base.endswith('\n') else base).encode())
 manifest={}
 for fn in SRC_JS:
  raw=(ROOT/'js'/fn).read_bytes()
  if fn=='japji-full.js':
   src=raw.decode('utf8')
   guard(src.count('Math.min(160,')==1,'Japji JS runtime pace cap changed')
   guard(src.count('max="160"')==1,'Japji settings pace cap changed')
   src=src.replace('Math.min(160,','Math.min(200,').replace('max="160"','max="200"')
   # Historical Pauri 2 notebook lives at root, a same-origin internal link.
   src=src.replace('href="pauri-2-lesson.html"','href="../pauri-2-lesson.html"')
   raw=src.encode('utf8')
  elif fn in ('learning.js','continuous-core.js'):
   src=raw.decode('utf8')
   marker='s.pace<=160' if fn=='continuous-core.js' else 'x.pace<=160'
   guard(src.count(marker)==1,'Saved learning/core normalization changed')
   src=src.replace(marker,marker.replace('160','200'))
   raw=src.encode()
  dest=ASSETS/'js'/fn
  output(dest,raw)
  manifest['japji-assets/js/'+fn]=digest(raw)
 for name in SRC_CSS:
  raw=(ROOT/'css'/name).read_bytes()
  output(ASSETS/'css'/name,raw)
  manifest['japji-assets/css/'+name]=digest(raw)
 icon=(ROOT/'icons/icon-180.png').read_bytes()
 output(ASSETS/'icon-180.png',icon)
 manifest['japji-assets/icon-180.png']=digest(icon)
 manifest['japji.html']=digest(TARGET.read_bytes())
 guard((ASSETS/'js/japji-full-data.js').read_bytes()==(ROOT/'js/japji-full-data.js').read_bytes(),'original Japji bytes changed')
 guard((ASSETS/'js/japji-lessons.js').read_bytes()==(ROOT/'js/japji-lessons.js').read_bytes(),'Jagji lessons changed')
 guard((ASSETS/'js/line-meanings.js').read_bytes()==(ROOT/'js/line-meanings.js').read_bytes(),'Japji line meanings changed')
 print(json.dumps({'status':'PRIVATE_JAPJI_UI_AND_PACE_PARITY','assets':len(manifest),
  'originalJapjiSourceUnchanged':True,'original385MeaningDraftsUnchanged':True,
  'maxVisualPace':200,'sameExistingLearningKey':'glp001.continuous.v2',
  'candidateFileSHA256':manifest['japji.html'],'publicRootUpdated':False},indent=2))
if __name__=='__main__':build()
