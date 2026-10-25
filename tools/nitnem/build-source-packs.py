"""GLP-001 Full Nitnem — compile exact hashed DIGITAL SOURCE CANDIDATES into private QA.
This does NOT grant edition/rights/scholar approval. No web/OCR, no translation,
no live app changes. Source is pinned to separate reviewed GitHub PR20 commit.
Generated source packages are NEVER copied to accepted public GitHub Pages.
"""
from __future__ import annotations
import argparse,datetime,hashlib,json,subprocess
from pathlib import Path

PROJECT=Path(__file__).resolve().parents[2]
PINNED_SOURCE_SHA="373ccc34f4a1c0ccb6ce36654bf6e9574087200f"
SOURCES=[
 ("jaap","n3-dasam-jaap/jaap-199-original-candidate.json","271b9b5f53d9630733b04dcf78b30bb77331fc5f46253b9b519f64545c2b9fc6",199,782,"ਜਾਪੁ ਸਾਹਿਬ","Jaap Sahib","Morning","Dasam Bani · 199 numbered chhands","Digital source; 67 chhand-group discrepancies await review"),
 ("savaiye","n3-dasam-savaiye/savaiye-ten-original-candidate.json","6e3dc42d58a3a1d851023b37b1532b35f554da0fbd7deca3d67185fc30a7f9f3",10,40,"ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ","Tav-Prasad Savaiye","Morning","Akal Ustat · ten Sravag Sudh Savaiye","Digital source; 13 lines differ in comparison"),
 ("chaupai","n3-chaupai-variants/chaupai-site-expanded-29-pauri-candidate.json","56707f8695e3e3026f417d01ececb4b9feb5c5806b939b949bf29c14d28a5195",29,116,"ਬੇਨਤੀ ਚੌਪਈ ਸਾਹਿਬ","Benti Chaupai Sahib","Morning","Site-expanded 29-pauri variant · morning boundary NOT adjudicated","29-pauri digital website variant; the 25-pauri Rehras excerpt is separate"),
 ("anand","n2-anand/anand-40-original-candidate.json","4b78b5cc06622e6a21086a95594f90bdf6ead649c774faa532da595947bb6667",40,208,"ਅਨੰਦੁ ਸਾਹਿਬ","Anand Sahib","Morning","Sri Guru Granth Sahib Ji, Ang 917–922 · full forty pauris","Pauri 24 has a quarantined digital Unicode source line"),
 ("rehras","n4-rehras-composite/rehras-sgpc-digital-composite-candidate.json","c10d38174e50ce2b21e23edada29dc39238eac7d5565e5295fcdc5e151d3369a",44,159,"ਰਹਿਰਾਸਿ ਸਾਹਿਬ","Sodar Rehras Sahib","Evening","SGPC six-section sequence · composite SGGS + Dasam Bani","Digital source variant; SGGS Ang and additional verses await review"),
 ("sohila","n1-sohila/sohila-candidate-original.json","e1e6485a47222f4126d9ed4d29e61a31063cfc6bbb1e633328c67be2fa3ae953",5,56,"ਕੀਰਤਨ ਸੋਹਿਲਾ","Kirtan Sohila","Night","Sri Guru Granth Sahib Ji, Ang 12–13 · five shabads","Five source-heading/segmentation comparisons need review")
]
def sha(b):return hashlib.sha256(b if isinstance(b,bytes) else b.encode('utf-8')).hexdigest()
def dump(x):return (json.dumps(x,ensure_ascii=False,indent=2,separators=(",",": "))+"\n").encode("utf-8")
def require(condition,why):
 if not condition:raise RuntimeError("SOURCE QA STOP: "+why)
def build(source_root):
 source_root=source_root.resolve(strict=True)
 rev=subprocess.check_output(["git","-C",str(source_root),"rev-parse","HEAD"],text=True).strip()
 require(rev==PINNED_SOURCE_SHA,"source branch HEAD differs from pinned reviewed source")
 result={}
 usedIDs=set()
 for name,rel,expected,unit_count,line_count,title_pa,title,day,anchor,caveat in SOURCES:
  path=source_root/"docs/research"/rel
  require(path.is_file() and not path.is_symlink(),"source file not plain immutable file: "+rel)
  raw=path.read_bytes()
  require(sha(raw)==expected,"pinned SHA-256 mismatch "+rel)
  original=json.loads(raw.decode("utf-8"))
  if name=="rehras":
   require(original["sourceApproved"] is False and original["readerEnabled"] is False,"Rehras candidate falsely approved")
   units_in=[u for section in original["sections"] for u in section["units"]]
   sourceFamily="composite"
   sections=[{"id":s["componentId"],"sourceFamily":s["sourceFamily"],"units":len(s["units"])} for s in original["sections"]]
   editionId="sgpc-digital-composite-unreviewed-20261025"
   pref=[]
  else:
   require(original["ui"]["readable"] is False and original["edition"]["humanCollationApproved"] is False,"source claims recitation approval: "+rel)
   units_in=original["units"]
   sourceFamily=original["edition"]["sourceFamily"]
   sections=[]
   editionId=original["edition"]["editionId"]
   pref=original.get("prefaceOriginalCandidate") or original.get("prefaceOriginalDigitalCandidates") or []
  require(len(units_in)==unit_count,"incorrect "+name+" source unit count")
  exported_units=[]
  ids=set()
  for index,u in enumerate(units_in):
   lines=[]
   for l in u["lines"]:
    require(l["id"] not in ids and isinstance(l["text"],str) and bool(l["text"]),"duplicate or blank original "+name)
    ids.add(l["id"])
    require(sha(l["text"])==l["sha256"],"original Gurmukhi line hash mismatch "+l["id"])
    family=l.get("sourceFamily",sourceFamily)
    loc=l["location"]
    require(loc.get("system") in ("ang","dasam_section","sggs_rehras_section"),"unexpected source location "+l["id"])
    if family=="dasam":require("ang" not in loc,"false SGGS Ang on Dasam original "+l["id"])
    lines.append({"id":l["id"],"text":l["text"],"sha256":l["sha256"],"family":family,
                  "location":loc,"held":bool(l.get("humanTextEditionReviewNeeded") or l.get("unresolvedSourceReview"))})
   headings=u.get("metricalHeadingsDigitalCandidates") or u.get("meterHeadingDigitalCandidate") or []
   for h in headings:require(sha(h["text"])==h["sha256"],"Original metre heading hash mismatch")
   exported_units.append({"id":u["unitId"],"title":u["title"],"sourceFamily":u.get("sourceFamily",sourceFamily),
                          "componentId":next((s["componentId"] for s in original.get("sections",[]) if u in s["units"]),""),
                          "sourceHeadingIncluded":bool(u.get("sourceHeadingIncludedInLines")),
                          "metricalHeadings":[{"text":h["text"],"sha256":h["sha256"]} for h in headings],
                          "lines":lines})
  require(len(ids)==line_count,"incorrect "+name+" original source-line count")
  source_pref=[]
  for p in pref:
   t=p.get("text",p.get("originalText"))
   digest=p.get("sha256",p.get("originalSha256"))
   require(sha(t)==digest,"preface original text SHA mismatch "+name)
   source_pref.append({"text":t,"sha256":digest})
  if name=="anand":
   holds=[x["id"] for u in exported_units for x in u["lines"] if x["held"]]
   require(holds==["anand24.line03"],"Anand Pauri24 mandatory source hold missing")
  else:require(not any(x["held"] for u in exported_units for x in u["lines"]),"unexpected source line held "+name)
  pack={
   "schema":"GLP-001-NITNEM-SOURCE-REVIEW-V1",
   "compositionId":name,"originalCompositionId":original["compositionId"],
   "title":title,"titleGurmukhi":title_pa,"daypart":day,"sourceFamily":sourceFamily,
   "reference":anchor,"caveat":caveat,
   "sourceFileSha256":expected,"sourceRepositoryCommit":PINNED_SOURCE_SHA,"editionId":editionId,
   "sourceStatus":"DIGITAL_ORIGINAL_CANDIDATE_UNAPPROVED",
   "humanCollationApproved":False,"rightsCleared":False,"translationApproved":False,
   "publishedAsFamilyScripture":False,
   "sections":sections,"preface":source_pref,
   "unitCount":unit_count,"originalLineCount":line_count,"units":exported_units
  }
  result[name]=pack
 return result

def main():
 parser=argparse.ArgumentParser()
 parser.add_argument("--source-root",required=True,type=Path)
 parser.add_argument("--output",required=True,type=Path)
 parser.add_argument("--verify",action="store_true")
 args=parser.parse_args()
 data=build(args.source_root)
 if args.verify:
  print(json.dumps({"sourceRevision":PINNED_SOURCE_SHA,"originalLines":{k:v["originalLineCount"] for k,v in data.items()},"mode":"VERIFY_ONLY","approval":"PENDING"}))
  return
 out=args.output.resolve()
 require(str(out).startswith(str(PROJECT/"nitnem"/"data")),"output outside QA data directory forbidden")
 out.mkdir(parents=True,exist_ok=True)
 files={}
 for name,x in data.items():
  path=out/(name+".json")
  content=dump(x)
  if path.exists():require(path.read_bytes()==content,"refuse overwrite of different source asset "+name)
  else:path.write_bytes(content)
  files[name]={"path":"data/"+name+".json","sha256":sha(content),"units":x["unitCount"],
               "lines":x["originalLineCount"],"title":x["title"],"titleGurmukhi":x["titleGurmukhi"],
               "editionId":x["editionId"],"daypart":x["daypart"]}
 manifest={"schema":"GLP-001-INTERNAL-NITNEM-REVIEW-V1","sourceCommit":PINNED_SOURCE_SHA,
           "sourceFamilySite":"gurbani-learning-library",
           "releaseStatus":"PRIVATE_SOURCE_QA_ONLY_NOT_FAMILY_APPROVED",
           "canonicalJapji":"../full-japji.html",
           "familyReady":False,"sourceCleared":False,"audioSynced":False,
           "entries":files}
 mf=out/"library.json"
 content=dump(manifest)
 if mf.exists():require(mf.read_bytes()==content,"refuse rewrite of library manifest")
 else:mf.write_bytes(content)
 print(json.dumps({"build":"SOURCE_QA_ONLY","sources":len(data),"totalLines":sum(x["originalLineCount"] for x in data.values()),
                    "pinnedCommit":PINNED_SOURCE_SHA,"libraryManifestSha256":sha(content),"familyRelease":False},indent=2))
if __name__=="__main__":main()
