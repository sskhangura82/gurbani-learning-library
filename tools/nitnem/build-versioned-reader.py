"""Build a separate immutable Full Nitnem continuous-reading review path.
The old /nitnem/ app, cache, saved learning, Japji root, and raw source stay intact.
No external requests, no data transformations, no public release authority.
"""
from __future__ import annotations
import argparse,hashlib,json,re,shutil
from pathlib import Path

PROJECT=Path(__file__).resolve().parents[2]
SOURCE=PROJECT/'nitnem'
FILES=[
 'index.html','reader.css','reader.js','continuous-core.js','sw.js',
 'data/library.json','data/jaap.json','data/savaiye.json',
 'data/chaupai.json','data/anand.json','data/rehras.json','data/sohila.json'
]
OLD_PREFIX='const PREFIX="glp-nitnem-source-review:";'
NEW_PREFIX='const PREFIX="glp-nitnem-continuous-review:";'
def sha(v):return hashlib.sha256(v).hexdigest()
def ensure(b,why):
 if not b:raise RuntimeError('NONSHIPPING VERSIONED READER STOP: '+why)
def build(output:Path,verify_only=False):
 ensure((SOURCE/'sw.js').is_file(),'source SW missing')
 data=json.loads((SOURCE/'data/library.json').read_text())
 ensure(data['sourceCommit']=='373ccc34f4a1c0ccb6ce36654bf6e9574087200f',
        'source commit changed without approved source review')
 ensure(data['familyReady'] is False and data['sourceCleared'] is False,'false publication approval')
 text=(SOURCE/'reader.js').read_text()
 ensure("view:'continuous'" in text and 'updateScrolledLine' in text,
        'continuous-mode engineer changes missing')
 original_worker=(SOURCE/'sw.js').read_text()
 ensure(original_worker.count(OLD_PREFIX)==1,'legacy source scope marker missing')
 versioned_worker=original_worker.replace(OLD_PREFIX,NEW_PREFIX)
 ensure(OLD_PREFIX not in versioned_worker,'old service-worker cache namespace would be shared')
 match=re.search(r'^const EXPECTED=(\{[^\n]+\});',original_worker,re.M)
 ensure(match is not None,'private worker hashes absent')
 cached=json.loads(match.group(1))
 ensure(set(cached)=={'./'+x for x in FILES if x!='sw.js'},'versioned cache file set changed')
 for filename in FILES:
  file=SOURCE/filename
  ensure(file.is_file() and not file.is_symlink(),'missing or symlinked source: '+filename)
  if filename!='sw.js':
   ensure(cached['./'+filename]==sha(file.read_bytes()),'source changed after SW was generated: '+filename)
 hashes={filename:sha((SOURCE/filename).read_bytes() if filename!='sw.js' else versioned_worker.encode()) for filename in FILES}
 record={'status':'NONSHIPPING_PRIVATE_SOURCE_REVIEW','sourceCommit':data['sourceCommit'],
         'path':'/nitnem-continuous/','assetHashes':hashes,
         'cacheNamespace':NEW_PREFIX[len('const PREFIX="'):-2],
         'canonicalJapjiRootWorkerUnchanged':True,
         'originalNitnemWorkerUnchanged':True,'sourceEditionsHumanApproved':False}
 if verify_only:
  if output.exists():
   for name,expected in hashes.items():
    file=output/name
    ensure(file.is_file() and sha(file.read_bytes())==expected,'existing versioned asset drift: '+name)
  print(json.dumps({'status':'PASS','assets':len(FILES),'cacheNamespace':record['cacheNamespace'],
                    'sourceApproved':False,'versionedOutputVerified':output.exists()}))
  return record
 ensure(not output.exists(),'refuse to overwrite prior private versioned asset output')
 output.mkdir(parents=True,mode=0o700)
 try:
  for filename in FILES:
   target=output/filename
   target.parent.mkdir(parents=True,exist_ok=True)
   if filename=='sw.js':target.write_text(versioned_worker)
   else:shutil.copyfile(SOURCE/filename,target)
   target.chmod(0o444)
  (output/'data').chmod(0o500)
  output.chmod(0o500)
 except Exception:
  shutil.rmtree(output,ignore_errors=True)
  raise
 print(json.dumps({'status':record['status'],'assets':len(FILES),'output':str(output),
                   'workerSha256':hashes['sw.js'],
                   'sourceRevision':data['sourceCommit'],'familyPublished':False},indent=2))
 return record
def main():
 p=argparse.ArgumentParser()
 p.add_argument('--output',required=True,type=Path)
 p.add_argument('--verify',action='store_true')
 x=p.parse_args()
 build(x.output.resolve(),x.verify)
if __name__=='__main__':main()
