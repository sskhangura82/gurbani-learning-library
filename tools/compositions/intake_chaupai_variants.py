"""GLP N3 — site-named extended 29-pauri Chaupai source variant.
DO NOT equate website's longer source layout with a universal morning
or SGPC mandatory boundary. Both existing 25 and proposed 29 boundaries
are preserved as separate immutable versioned digital originals.
"""
import argparse,datetime as dt,hashlib,html,json,re,unicodedata,urllib.request
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'docs/research/n3-chaupai-variants'
PRIMARY='https://www.discoversikhism.com/learn_gurbani/learn_chaupai_sahib.html'
COMP='https://gurdwaras.com/nitnem/chaupai-sahib'
BLOCKS=r'<p[^>]*class=["\']learngurmukhi["\'][^>]*>(.*?)</p>'
OTHER=r'<p[^>]*lang=["\']pa["\'][^>]*>(.*?)</p>'
DIGITS='੦੧੨੩੪੫੬੭੮੯'
def sha(v):return hashlib.sha256(v if isinstance(v,bytes) else v.encode('utf8')).hexdigest()
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFC',s)).strip()
def strip_nums(s):return re.sub(r'(?:॥[੦-੯]+)+॥?$','',norm(s)).strip()
def obtain(url,pattern,expected):
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (GLP original comparison; not publishing)'}),timeout=25) as r:
  if r.status!=200 or urlsplit(r.geturl()).scheme!='https' or urlsplit(r.geturl()).netloc!=urlsplit(url).netloc:raise RuntimeError('Unsafe source redirect/status')
  b=r.read(1300000)
 strings=re.findall(pattern,b.decode('utf8','strict'),re.I|re.S)
 if len(strings)!=expected:raise RuntimeError(f'Source layout changed: expected {expected}, got {len(strings)}')
 return strings,{'url':url,'httpStatus':200,'webPageSha256':sha(b),'pageBytes':len(b),'sourceParagraphs':len(strings)}
def split_row(raw):
 clean=html.unescape(re.sub('<[^>]+>','',raw)).strip()
 rows=[x.strip() for x in re.split(r'(?<=॥)\s*(?=[\u0a05-\u0a39])',clean) if x.strip()]
 if len(rows)!=2:raise RuntimeError('Chaupai original 2-tuk line boundary unexpected: '+repr(clean[:90]))
 return rows
def num(x):return ''.join(DIGITS[int(c)] for c in str(x))
def main():
 p=argparse.ArgumentParser();p.add_argument('--capture',action='store_true')
 a=p.parse_args()
 if not a.capture:p.error('Explicit original public-site capture only')
 out=DEST/'chaupai-site-expanded-29-pauri-candidate.json'
 evidence=DEST/'chaupai-long-short-boundary-ledger.json'
 if out.exists() or evidence.exists():p.error('Refuse overwrite of immutable source candidate')
 page,receipt=obtain(PRIMARY,BLOCKS,21)
 cmp,other=obtain(COMP,OTHER,174)
 previous=json.loads((ROOT/'docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json').read_text())
 if len(previous['units'])!=25 or sum(len(u['lines']) for u in previous['units'])!=100:raise RuntimeError('Missing verified SGPC bounded 25-pauri original')
 def br(idx):
  return [x for x in re.split(r'<br\s*/?>',page[idx],flags=re.I) if html.unescape(re.sub('<[^>]*>','',x)).strip()]
 # Explicit P26/27/28/29 source chunk origins, no OCR or guesses.
 mapping={26:(15,[2,3]),27:(16,[0,1]),28:(17,[1,2]),29:(18,[1,2])}
 heads={28:(17,0),29:(18,0)}
 extra_units=[];warnings=[]
 for pauri in [26,27,28,29]:
  block,indices=mapping[pauri]
  chunks=br(block)
  if len(chunks)<=max(indices):raise RuntimeError('Missing expanded original source row')
  lines=[]
  for j,index in enumerate(indices):
   for original in split_row(chunks[index]):
    lines.append(original)
  if len(lines)!=4:raise RuntimeError('Expected four source tuks per expanded pauri')
  if not lines[-1].endswith('॥'+num(pauri)+'॥'):raise RuntimeError('Wrong expanded pauri ending number')
  unitId='chaupai-long'+str(pauri).zfill(2)
  sourceLines=[{
    'id':unitId+'.line'+str(i+1).zfill(2),'text':text,
    'sha256':sha(text),'location':{
     'system':'dasam_section','work':'Discover Sikhism extended Chaupai web original (NOT canonical)',
     'recitationPauri':pauri,'tuk':i+1,'originalDigitalParagraph':block
    },'sourceLayer':'original_digital_variant_candidate'
   } for i,text in enumerate(lines)]
  h=[]
  if pauri in heads:
   bi,ii=heads[pauri]
   heading=html.unescape(re.sub('<[^>]+>','',br(bi)[ii])).strip()
   h=[{'text':heading,'sha256':sha(heading),'digitalParagraph':bi,'approved':False}]
  extra_units.append({
    'unitId':unitId,'kind':'stanza','title':'Extended Chaupai Source Pauri '+str(pauri),
    'titleGurmukhi':'','printedRaag':None,'raagEvidence':None,
    'meterHeadingDigitalCandidate':h,'lines':sourceLines
  })
 # Comparator source segment must be exactly additional four sets and two metre headings.
 other_clean=[html.unescape(re.sub('<[^>]+>','',x)).strip() for x in cmp]
 grp=[list(range(147,151)),list(range(151,155)),list(range(156,160)),list(range(161,165))]
 if not all(other_clean[i].startswith(prefix) for i,prefix in [(147,'ਕ੍ਰਿਪਾ ਕਰੀ'),(151,'ਸ੍ਰੀ ਅਸਿਧੁਜ'),(156,'ਸੁਨੈ ਗੁੰਗ'),(161,'ਸੰਬਤ ਸਤ੍ਰਹ')]):raise RuntimeError('Comparator longer-pauree start markers changed')
 differences=[]
 for unit,indices in zip(extra_units,grp):
  for line,i in zip(unit['lines'],indices):
   alternate=other_clean[i]
   equal=norm(line['text'])==norm(alternate)
   equalCounter=strip_nums(line['text'])==strip_nums(alternate)
   differences.append({
    'sourceOccurrenceId':line['id'],'pauri':line['location']['recitationPauri'],
    'primaryOriginalSha256':line['sha256'],'comparatorWebParagraph':i,
    'comparatorOriginalSha256':sha(alternate),
    'exactNfc':equal,'matchesAfterOnlyTerminalCountersIgnored':equalCounter,
    'needsHumanEditionComparison':not equalCounter,
    **({'primaryDigitalText':line['text'],'comparatorDigitalText':alternate} if not equalCounter else {})
   })
 # Eight source original rows after P29: Savaiya (4) and Dohira (2), with two
 # printed headings, plus devotional signoff not among scripture originals.
 def extract_postscript(idx,kind,number):
  chunks=br(idx)
  assert len(chunks)==number+1 if idx==19 else len(chunks)==number+2
  head=html.unescape(re.sub('<[^>]+>','',chunks[0])).strip()
  lines=[html.unescape(re.sub('<[^>]+>','',q)).strip() for q in chunks[1:number+1]]
  if not head or any(not line for line in lines):raise RuntimeError('Missing separate source postscript original')
  return {'kind':kind,'sourceHeading':head,'sourceHeadingSha256':sha(head),
          'originalLines':[{'text':x,'sha256':sha(x)} for x in lines],
          'editionScope':'separate_webpage_sequence_NOT_automatically_part_of_morning_Chaupai'}
 after=[extract_postscript(19,'evening_savaiya_candidate',4),extract_postscript(20,'dohira_candidate',2)]
 footer=html.unescape(re.sub('<[^>]+>','',br(20)[3])).strip()
 if not footer.startswith('ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ'):raise RuntimeError('Website signoff footer missing')
 units=[]
 for u in previous['units']:
  copy=json.loads(json.dumps(u))
  units.append(copy)
 units.extend(extra_units)
 if len(units)!=29 or sum(len(u['lines']) for u in units)!=116:raise RuntimeError('Expanded Chaupai source incomplete')
 # 25 core source units are copied byte-for-byte; 29 is a separate digital
 # edition ID, NOT an implicit SGPC or morning-practice standard.
 model={
  'schemaVersion':1,'compositionId':'chaupai-website-expanded-29-variant',
  'title':'Benti Chaupai · site-specific expanded 29-pauri digital version (unapproved)',
  'titleGurmukhi':'ਬੇਨਤੀ ਚੌਪਈ',
  'sourceWork':'Dasam Bani digital Chaupai 29-pauri site variant, authority and practice scope PENDING',
  'prefaceOriginalCandidate':previous['prefaceOriginalCandidate'],
  'edition':{
   'editionId':'dasam-chaupai-expanded-29-website-candidate-20261025',
   'sourceFamily':'dasam','locationScheme':'dasam_section',
   'sourceRelease':'Discover Sikhism web version extended beyond SGPC 25-pauri Rehras excerpt',
   'sourceFileHash':sha(bytes.fromhex(receipt['webPageSha256'])+bytes.fromhex(other['webPageSha256'])),
   'sourceStatus':'machine_frozen','rightsStatus':'source_web_reuse_NOT_cleared',
   'humanCollationApproved':False,'editionAuthority':None,'editionCitation':None
  },
  'ui':{'readable':False,'meaningReviewStatus':'not_ingested','studyReviewStatus':'not_ingested',
        'preserveLegacyLearningKeys':False,'raagStatus':'not_applicable'},
  'units':units
 }
 ev={
  'capturedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat(),
  'status':'TWO_NAMED_DIGITAL_CHAUPAI_BOUNDS_25_AND_29_WITH_UNRESOLVED_RIGHTS_AND_TEXT',
  'primary':receipt,'comparator':other,
  'SGPCRehrasBound':{'pauris':25,'lastOriginal':'ਦੁਸਟ ਦੋਖ ਤੇ ਲੇਹੁ ਬਚਾਈ','sourceModel':'docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json'},
  'expandedWebsiteBound':{'pauris':29,'sourceOriginalLines':116,'sourceModelName':'chaupai-website-expanded-29-variant',
     'remainingPauris':[26,27,28,29],'newSeparateMeterHeadings':[h for u in extra_units for h in u['meterHeadingDigitalCandidate']]},
  'additionalPaureeOriginals':16,'additionComparedWithSecondSite':differences,
  'newAdditionalTukExactMatches':sum(d['exactNfc'] for d in differences),
  'newAdditionalTukCounterComparisonMatches':sum(d['matchesAfterOnlyTerminalCountersIgnored'] for d in differences),
  'postScriptCandidateSections':after,
  'unapprovedDevotionalWebsiteFooterSha256':sha(footer),
  'warning':'25 SGPC Rehras excerpt and 29 site-expanded Chaupai have different scope. Do NOT assert which is universal complete morning version; separately choose edition and Sikh tradition.',
  'humanSourceEditionReview':'PENDING',
  'expandedVariantPracticeApproved':False,'rightsApproved':False,'published':False,
  'otherDasamRehrasSavaiyaAndDohiraMustRemainDistinct':True
 }
 DEST.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n')
 evidence.write_text(json.dumps(ev,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':ev['status'],'shortSGPCPauris':25,'webExtendedPauris':29,
                   'expandedOriginalTuks':116,'newTukExactMatches':ev['newAdditionalTukExactMatches'],
                   'newTukCounterMatches':ev['newAdditionalTukCounterComparisonMatches'],
                   'publishApproved':False}))
if __name__=='__main__':main()
