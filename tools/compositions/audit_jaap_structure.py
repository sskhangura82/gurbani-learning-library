"""N3 Jaap Sahib: two-source 199 chhand/verse ordinal structure audit ONLY.
No Jaap original corpus/model, no PDF/OCR, no translation and no publication.
Explicit --capture; immutable receipts; no source auto-normalization.
"""
import argparse,datetime as dt,hashlib,html,json,re,unicodedata,urllib.request
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'docs/research/n3-dasam-jaap/jaap-199-structure-audit.json'
SOURCES=[
 ('Discover Sikhism','https://www.discoversikhism.com/learn_gurbani/learn_jaap_sahib.html',r'<p[^>]*class=["\']learngurmukhi["\'][^>]*>(.*?)</p>',59),
 ('Gurdwaras.com','https://gurdwaras.com/nitnem/jaap-sahib',r'<p[^>]*lang=["\']pa["\'][^>]*>(.*?)</p>',809)
]
DIGITS=dict(zip('੦੧੨੩੪੫੬੭੮੯','0123456789'))
def hash256(x):return hashlib.sha256(x if isinstance(x,bytes) else x.encode('utf8')).hexdigest()
def capture_source(label,url,pattern,expected):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (GLP-001 research audit; no translation import)'})
 with urllib.request.urlopen(req,timeout=30) as response:
  if response.status!=200 or urlsplit(response.geturl()).netloc!=urlsplit(url).netloc or urlsplit(response.geturl()).scheme!='https':
   raise RuntimeError('Unexpected URL redirect/status for '+label)
  raw=response.read(1800000)
 if not 10000<len(raw)<1800000:raise RuntimeError('Unexpected HTML source length')
 page=raw.decode('utf8','strict')
 paragraphs=[html.unescape(re.sub(r'<[^>]*>','',x)).strip() for x in re.findall(pattern,page,re.I|re.S)]
 if len(paragraphs)!=expected:
  raise RuntimeError(label+' Gurmukhi paragraph count drift '+str(len(paragraphs)))
 ordinals=[]
 for i,text in enumerate(paragraphs):
  for match in re.findall(r'(?<=॥)[੦-੯]+(?=॥)',text):
   number=int(''.join(DIGITS[char] for char in match))
   if number<1 or number>199:raise RuntimeError('Out-of-range stanza counter')
   ordinals.append({'ordinal':number,'digitalParagraph':i,'paragraphSha256':hash256(text)})
 if len(ordinals)!=199 or [x['ordinal'] for x in ordinals]!=list(range(1,200)):
  raise RuntimeError('Jaap chhand counter sequence changed, refuse source promotion')
 if not any('ਚੱਕ੍ਰ ਚਿਹਨ' in item or 'ਚਕ੍ਰ ਚਿਹਨ' in item for item in paragraphs[:12]):
  raise RuntimeError('Jaap opening location not verified')
 if not paragraphs[-1].find('॥੧੯੯॥')>=0:
  raise RuntimeError('Jaap last stanza boundary missing')
 return {
  'source':label,'url':url,'httpStatus':200,'webPageSha256':hash256(raw),'retrievedBytes':len(raw),
  'gurmukhiHtmlParagraphs':len(paragraphs),'numberedChhands':199,
  'firstNumberedParagraphIndex':ordinals[0]['digitalParagraph'],
  'lastNumberedParagraphIndex':ordinals[-1]['digitalParagraph'],
  'prefaceGurmukhiParagraphCountBeforeFirstChhand':ordinals[0]['digitalParagraph'],
  'chhandNumbers':ordinals,
  'primaryOriginalOpeningMarkerSha256':hash256(paragraphs[ordinals[0]['digitalParagraph']]),
  'lastSourceParagraphSha256':hash256(paragraphs[-1]),
  'paragraphsMayContainMultipleChhands':len(paragraphs)<199
 }
def main():
 p=argparse.ArgumentParser();p.add_argument('--capture',action='store_true')
 a=p.parse_args()
 if not a.capture:p.error('Jaap structural web retrieval must be explicit; CI is offline')
 if DEST.exists():p.error('Refusing to overwrite existing structure audit receipt')
 results=[capture_source(*source) for source in SOURCES]
 same=[x['ordinal']==y['ordinal'] for x,y in zip(results[0]['chhandNumbers'],results[1]['chhandNumbers'])]
 if not all(same):raise RuntimeError('Two digital chhand number sequences disagree')
 report={
  'capturedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat(),
  'status':'TWO_DIGITAL_199_CHHAND_STRUCTURE_MATCH_NO_EDITION_CERTIFICATION',
  'composition':'jaap-sahib','sourceFamily':'dasam',
  'intendedFullScope':'Jaap Sahib, first Dasam Granth composition, 199 numbered chhands; source edition/printed meter headings/rights not yet independently verified',
  'primary':results[0],'comparator':results[1],
  'commonOrderedChhandNumbers':list(range(1,200)),
  'matchingChhandOrdinalStructure':True,
  'originalGurmukhiSourceModelBuilt':False,
  'allOriginalTextLineHashesVerified':False,
  'sanskritPersianChhandHeadingsIndependentlyCollated':False,
  'comparisonTextEquality':'NOT_ATTEMPTED_BECAUSE_HTML_SEGMENTATION_DIFFERS',
  'sourceLineageIndependence':'UNVERIFIED',
  'sourceEditionHumanApproval':'PENDING',
  'reuseRights':'PENDING',
  'releaseAuthorized':False,
  'riskNotes':[
   'Discover Sikhism groups many chhands into 59 Gurmukhi paragraphs; Gurdwaras.com displays 809 distinct Gurmukhi paragraphs',
   'Matching 199 ending numbers do NOT imply all wording/characters match',
   'No source model, transliteration, meanings, audio, private learning or public Jaap reader was created',
   'Printed meters, full recitation boundaries and independent Dasam original edition still need qualified Sikh/Punjabi approval'
  ]
 }
 DEST.parent.mkdir(parents=True,exist_ok=True)
 DEST.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':report['status'],'chhands':199,'webParagraphCounts':[x['gurmukhiHtmlParagraphs'] for x in results],'originalModelBuilt':False,'published':False}))
if __name__=='__main__':main()
