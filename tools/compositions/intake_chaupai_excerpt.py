"""GLP N4 — Benti Chaupai SGPC Rehras excerpt, DIGITAL CANDIDATE ONLY.
Bounds 'Hamri karo' to 'Dust Dokh te leho bachai', 25 recitation pauris.
A different, longer morning version remains an independent research question.
No edition certification, user runtime, translation, media or release.
"""
import argparse,datetime as dt,hashlib,html,json,re,unicodedata,urllib.request
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'docs/research/n4-chaupai-excerpt'
PRIMARY='https://www.discoversikhism.com/learn_gurbani/learn_chaupai_sahib.html'
COMPARATOR='https://gurdwaras.com/nitnem/chaupai-sahib'
P1=r'<p[^>]*class=["\']learngurmukhi["\'][^>]*>(.*?)</p>'
P2=r'<p[^>]*lang=["\']pa["\'][^>]*>(.*?)</p>'
def hash256(text):
 return hashlib.sha256(text if isinstance(text,bytes) else text.encode('utf8')).hexdigest()
def norm(text):
 return re.sub(r'\s+',' ',unicodedata.normalize('NFC',text).replace('\xa0',' ')).strip()
def remove_end_numbers(text):
 # Comparison helper ONLY, never touch canonical source text or claim equivalence.
 return re.sub(r'(?:॥[੦-੯]+)+॥?$','',norm(text)).strip()
def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (GLP-001 source research only)'})
 with urllib.request.urlopen(req,timeout=25) as r:
  if r.status!=200 or urlsplit(r.geturl()).scheme!='https' or urlsplit(r.geturl()).netloc!=urlsplit(url).netloc:
   raise RuntimeError('Untrusted source URL redirect or status')
  raw=r.read(550001)
 if len(raw)>550000:raise RuntimeError('Unexpected large source data')
 return raw.decode('utf8','strict'),{
  'url':url,'httpStatus':200,'retrievedBytes':len(raw),'pageSha256':hash256(raw),
  'retrievedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat()
 }
def primary(page):
 blocks=re.findall(P1,page,re.I|re.S)
 if len(blocks)!=21:raise RuntimeError('Unexpected Chaupai paragraph structure')
 unpack=[]
 for block in blocks:
  rows=[html.unescape(re.sub(r'<[^>]*>','',x)).strip() for x in re.split(r'<br\s*/?>',block,flags=re.I)]
  unpack.append([t for t in rows if t])
 if list(map(len,unpack[:3]))!=[1,1,1]:raise RuntimeError('Unexpected Chaupai preface')
 if any(len(u)!=4 for u in unpack[3:16]):raise RuntimeError('Unusual Chaupai stanza blocks')
 chosen=[]
 # P3..P14 have two pauris per block; P15 has last in first two
 for paragraph in range(3,16):
  subset=unpack[paragraph] if paragraph<15 else unpack[paragraph][:2]
  for row in subset:
   fragments=[t.strip() for t in re.split(r'(?<=॥)\s*(?=[\u0a05-\u0a39])',row) if t.strip()]
   if len(fragments)!=2:
    raise RuntimeError('Source joined two printed tuks unexpectedly: '+str(paragraph))
   chosen.extend(fragments)
 if len(chosen)!=100 or not chosen[0].startswith('ਹਮਰੀ ਕਰੋ') or not chosen[-1].startswith('ਦੁਸਟ ਦੋਖ ਤੇ ਲੇਹੁ ਬਚਾਈ'):
  raise RuntimeError('Wrong SGPC excerpt boundaries or full 100-tuk count')
 for i in range(25):
  if not chosen[i*4+3].endswith('॥'+''.join('੦੧੨੩੪੫੬੭੮੯'[int(x)] for x in str(i+1))+'॥'):
   raise RuntimeError('Source 25 recitation-pauri numbers no longer sequential')
 return unpack[:3],chosen,len(unpack)
def secondary(page):
 texts=[html.unescape(re.sub(r'<[^>]*>','',v)).strip() for v in re.findall(P2,page,re.I|re.S)]
 if len(texts)<150:raise RuntimeError('Comparator may be truncated')
 starts=[i for i,t in enumerate(texts) if t.startswith('ਹਮਰੀ ਕਰੋ')]
 ends=[i for i,t in enumerate(texts) if t.startswith('ਦੁਸਟ ਦੋਖ ਤੇ ਲੇਹੁ ਬਚਾਈ')]
 if len(starts)!=1 or len(ends)!=1 or starts[0]>=ends[0]:
  raise RuntimeError('Comparator Chaupai boundaries not unique')
 start,end=starts[0],ends[0]
 chosen=texts[start:end+1]
 if (start,end,len(chosen))!=(47,146,100):
  raise RuntimeError('Comparator boundary/corpus shifted; needs human inspection')
 if not chosen[3].endswith('॥੩੭੭॥') or not chosen[-1].endswith('॥੪੦੧॥'):
  raise RuntimeError('Dasam original full-compilation numbering changed')
 return chosen,{'startIndex':start,'endIndex':end,'correspondsToDasamChhandNumbers':'377–401'}
def main():
 p=argparse.ArgumentParser();p.add_argument('--capture',action='store_true')
 a=p.parse_args()
 if not a.capture:p.error('Require explicit --capture; CI never fetches third-party sources')
 out1=DEST/'chaupai-sgpc-excerpt-candidate.json'
 out2=DEST/'chaupai-variant-boundary-ledger.json'
 if out1.exists() or out2.exists():p.error('Refuse to overwrite original source research receipts')
 page1,ref1=fetch(PRIMARY);page2,ref2=fetch(COMPARATOR)
 preface,source,paragraphs=primary(page1)
 comparator,boundaries=secondary(page2)
 comparisons=[]
 for idx,(x,y) in enumerate(zip(source,comparator)):
  exact=norm(x)==norm(y);numerals=remove_end_numbers(x)==remove_end_numbers(y)
  comparisons.append({
   'ordinal':idx+1,'recitationPauri':idx//4+1,'tukWithinPauri':idx%4+1,
   'primaryOriginalSha256':hash256(x),'comparatorOriginalSha256':hash256(y),
   'exactNfcRowMatch':exact,'sameAfterOnlyTerminalNumberDeletion':numerals,
   'needsQualifiedTextReview':not numerals,
   **({'primaryOriginal':x,'comparatorOriginal':y} if not numerals else {})
  })
 exact_count=sum(x['exactNfcRowMatch'] for x in comparisons)
 stripped_count=sum(x['sameAfterOnlyTerminalNumberDeletion'] for x in comparisons)
 if (exact_count,stripped_count)!=(39,51):
  raise RuntimeError(f'Source drift exact={exact_count}, number-only={stripped_count}; STOP, do not normalize')
 units=[]
 for i in range(25):
  seq=i+1
  rows=[]
  for j,x in enumerate(source[4*i:4*i+4]):
   rows.append({
    'id':f'chaupai-rehras{seq:02d}.line{j+1:02d}',
    'text':x,'sha256':hash256(x),
    'location':{'system':'dasam_section','work':'Charitropakhyan / SGPC Benti Chaupai Rehras excerpt','recitationPauri':seq,'tuk':j+1},
    'sourceLayer':'original_digital_candidate',
    'primaryPrintedPairedTukStructure':True
   })
  units.append({'unitId':f'chaupai-rehras{seq:02d}','kind':'stanza',
   'title':f'Rehras Chaupai Pauri {seq}', 'titleGurmukhi':'',
   'printedRaag':None,'raagEvidence':None,'originalHeadingIsFirstLine':False,'lines':rows})
 model={
  'schemaVersion':1,'compositionId':'rehras-benti-chaupai-excerpt',
  'title':'Benti Chaupai · SGPC Rehras Excerpt (unreviewed digital candidate)',
  'titleGurmukhi':'ਕਬਯੋ ਬਾਚ ਬੇਨਤੀ ਚੌਪਈ',
  'sourceWork':'Dasam Bani / Charitropakhyan, SGPC Rehras bounded excerpt',
  'prefaceOriginalCandidate':[{'ordinal':i+1,'text':item[0],'sha256':hash256(item[0])} for i,item in enumerate(preface)],
  'edition':{
   'editionId':'dasam-chaupai-sgpc-excerpt-digital-candidate-20261025',
   'sourceFamily':'dasam','locationScheme':'dasam_section',
   'sourceRelease':'public digital Gurmukhi snapshot 2026-10-25',
   'sourceFileHash':hash256(bytes.fromhex(ref1['pageSha256'])+bytes.fromhex(ref2['pageSha256'])),
   'sourceStatus':'machine_frozen','rightsStatus':'original_gurmukhi_web_reuse_not_approved',
   'humanCollationApproved':False,'editionAuthority':None,'editionCitation':None
  },
  'ui':{
   'readable':False,'meaningReviewStatus':'not_ingested','studyReviewStatus':'not_ingested',
   'raagStatus':'not_applicable','preserveLegacyLearningKeys':False
  },
  'units':units
 }
 ledger={
  'capturedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat(),
  'status':'DIGITAL_25_PAURI_SGPC_BOUNDARY_CANDIDATE_49_VARIANTS_UNRESOLVED',
  'sourceDomain':'dasam','scope':'Evening Rehras excerpt ONLY, NOT independently approved morning full Chaupai',
  'primary':ref1,'comparator':ref2,
  'sourceHtmlParagraphs':paragraphs,
  'sourcePrefaceBlocks':len(preface),
  'primaryPairedDigitalRowsUsed':50,
  'derivedGurmukhiTukSegments':100,'recitationPauris':25,
  'comparator':{**ref2,**boundaries},
  'exactNfcMatches':exact_count,
  'matchesAfterOnlyTerminalVerseNumbersRemoved':stripped_count,
  'substantiveOrthographicVariants':100-stripped_count,
  'comparisons':comparisons,
  'method':'Split 50 paired printed digital rows at existing original danda boundaries into 100 original tuk segments, without changing source characters. Comparator has 100 one-tuk HTML rows. Verse counters stripped solely for comparison.',
  'sourceVariants':[
   'SGPC evening Rehras excerpt ends at Dust Dokh Te Leho Bachai; shorter 25-pauri recital has local numbering 1–25',
   'Comparator uses Dasam Granth Charitropakhyan original continuous verse numbers 377–401 for same bounded excerpt',
   'The primary website continues after verse 25 with verse 26 and later material, excluded by explicit boundary, not implicitly erased',
   'This particular excerpt is not automatically the full version of morning Benti Chaupai across Sikh traditions'
  ],
  'rightsApproval':'PENDING','printedEditionCollation':'PENDING','qualifiedSikhPunjabiReview':'PENDING',
  'publicSourceModelAllowed':False,'readerPublished':False,'familyLearningModified':False
 }
 DEST.mkdir(parents=True,exist_ok=True)
 out1.write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n')
 out2.write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':ledger['status'],'sourceTuks':100,'pauris':25,'exactDigitalMatches':exact_count,'numeralOnlyMatches':stripped_count,'variantsPending':100-stripped_count,'published':False}))
if __name__=='__main__':main()
