"""GLP N2: Complete 40-pauri Anand original digital source CANDIDATE.
Explicit 210-row source, first two are original headings/preface. Preserve all
original bytes including one unrenderable PUA character; mark that verse HOLD,
NEVER automatically convert it into guessed Gurbani or family text.
"""
import argparse,datetime as dt,hashlib,html,json,re,unicodedata,urllib.request
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'docs/research/n2-anand'
SOURCE='https://srigurugranth.net/{:04d}.html'
COMPARE='https://opengranth.org/ang/{}/'
PRIMARY_RE=r'<P class=Gurb><SPAN lang=PA>(.*?)</SPAN></p>'
OTHER_RE=r'<p class="gurmukhi">(.*?)</p>'
ROWS=(38,36,36,35,33,32)
MAP=dict(zip('੦੧੨੩੪੫੬੭੮੯','0123456789'))
COUNTER=re.compile(r'॥([੦-੯]+)॥')
def digest(s):return hashlib.sha256(s if isinstance(s,bytes) else s.encode('utf8')).hexdigest()
def norm(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFC',s)).strip()
def fetch(format_,pattern):
 rows=[];receipts=[]
 for i,ang in enumerate(range(917,923)):
  u=format_.format(ang)
  with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (GLP source review only)'}),timeout=25) as response:
   if response.status!=200 or urlsplit(response.geturl()).scheme!='https' or urlsplit(response.geturl()).netloc!=urlsplit(u).netloc:raise RuntimeError('Unexpected source redirect/status')
   raw=response.read(300001)
  if len(raw)>300000:raise RuntimeError('Oversized digital source')
  strings=[html.unescape(re.sub(r'<[^>]+>','',x)).replace('\xa0',' ').strip() for x in re.findall(pattern,raw.decode('utf8','strict'),re.I|re.S)]
  if len(strings)!=ROWS[i]:raise RuntimeError('Ang '+str(ang)+' text count changed')
  for index,text in enumerate(strings):
   if not text:raise RuntimeError('Empty Gurmukhi source')
   rows.append({'ang':ang,'digitalParagraph':index,'text':text,'sha256':digest(text)})
  receipts.append({'url':u,'httpStatus':200,'pageBytes':len(raw),'pageSha256':digest(raw),'gurmukhiParagraphs':len(strings)})
 return rows,receipts
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--capture',action='store_true')
 a=parser.parse_args()
 if not a.capture:parser.error('Explicit --capture required; CI never queries scripture websites')
 model_path=DEST/'anand-40-original-candidate.json'
 comparison_path=DEST/'anand-complete-text-candidate-ledger.json'
 if model_path.exists() or comparison_path.exists():parser.error('Do not overwrite reviewed source snapshots')
 primary,refs=fetch(SOURCE,PRIMARY_RE)
 secondary,refs2=fetch(COMPARE,OTHER_RE)
 if len(primary)!=210 or len(secondary)!=210:raise RuntimeError('Full Anand source incomplete')
 if primary[0]['text']!='ਰਾਮਕਲੀ ਮਹਲਾ ੩ ਅਨੰਦੁ' or primary[1]['text']!='ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥':raise RuntimeError('Anand opening source markers changed')
 if primary[-1]['text']!='ਬਿਨਵੰਤਿ ਨਾਨਕੁ ਗੁਰ ਚਰਣ ਲਾਗੇ ਵਾਜੇ ਅਨਹਦ ਤੂਰੇ ॥੪੦॥੧॥':raise RuntimeError('Last full Anand source marker changed')
 mistakes=[i for i,(u,v) in enumerate(zip(primary,secondary)) if norm(u['text'])!=norm(v['text'])]
 if mistakes!=[0,123]:raise RuntimeError('Unexpected Anand transcription mismatches; do not promote')
 if not any(ord(c)==0xF03D for c in primary[123]['text']):raise RuntimeError('Quarantined Anand private-use glyph no longer present')
 if primary[123]['ang']!=920:raise RuntimeError('Quarantined glyph Ang changed')
 preface=[{'text':u['text'],'sha256':u['sha256'],'location':{'system':'ang','ang':u['ang']},'digitalParagraph':u['digitalParagraph'],
           'status':'original_header_candidate_not_human_collated','headingVariantAtOtherSite':i==0} for i,u in enumerate(primary[:2])]
 units=[];current=[];originalOrdinals=[]
 for i,row in enumerate(primary[2:],start=2):
  expected=len(units)+1
  numberings=[int(''.join(MAP[t] for t in match)) for match in COUNTER.findall(row['text'])]
  closes=(expected in numberings)
  if numberings and not closes:raise RuntimeError('Unexpected Anand numbering at global row '+str(i))
  current.append({
   'id':'anand'+str(expected).zfill(2)+'.line'+str(len(current)+1).zfill(2),
   'text':row['text'],'sha256':row['sha256'],
   'location':{'system':'ang','ang':row['ang'],'digitalParagraph':row['digitalParagraph'],
               'globalSourceRow':i,'pauri':expected,'pauriLine':len(current)+1},
   'sourceLayer':'original_digital_candidate',
   'humanTextEditionReviewNeeded':i==123
  })
  if closes:
   originalOrdinals.append(expected)
   units.append({
    'unitId':'anand'+str(expected).zfill(2),'kind':'pauri',
    'title':'Anand Sahib · Pauri '+str(expected),'titleGurmukhi':'',
    'printedRaag':None,'raagEvidence':None,
    'reviewBlockedOnSourcePrivateUse':any(l['humanTextEditionReviewNeeded'] for l in current),
    'lines':current
   })
   current=[]
 if current or len(units)!=40 or originalOrdinals!=list(range(1,41)):raise RuntimeError('Anand 40-pauri source boundaries incomplete')
 if sum(len(u['lines']) for u in units)!=208:raise RuntimeError('Anand source row count incorrect')
 held=[x for u in units for x in u['lines'] if x['humanTextEditionReviewNeeded']]
 if len(held)!=1 or held[0]['location']['globalSourceRow']!=123:raise RuntimeError('Source quarantine lost')
 model={
  'schemaVersion':1,'compositionId':'anand-sahib','title':'Anand Sahib',
  'titleGurmukhi':'ਅਨੰਦੁ ਸਾਹਿਬ',
  'sourceWork':'Sri Guru Granth Sahib Ji Ang 917–922, complete 40 pauris',
  'prefaceOriginalDigitalCandidates':preface,
  'edition':{'editionId':'sggs-anand-40-digital-candidate-20261025','sourceFamily':'sggs',
   'locationScheme':'ang','sourceRelease':'public digital original capture 2026-10-25',
   'sourceFileHash':digest(b''.join(bytes.fromhex(r['pageSha256']) for r in refs)),
   'sourceStatus':'machine_frozen','rightsStatus':'original_gurmukhi_reuse_not_yet_cleared',
   'humanCollationApproved':False,'editionAuthority':None,'editionCitation':None,
   'sourcePrivateUseUnicodeHold':True},
  'ui':{'readable':False,'meaningReviewStatus':'not_ingested','studyReviewStatus':'not_ingested',
        'preserveLegacyLearningKeys':False,'raagStatus':'original_header_in_preface_pending_review'},
  'units':units
 }
 receipt={
  'capturedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat(),
  'status':'40_PAURI_SOURCE_CANDIDATE_WITH_ONE_QUARANTINED_GURMUKHI_UNICODE_LINE',
  'primary':refs,'secondDigitalSource':refs2,'unitCount':40,'originalVerseRows':208,'originalHeaders':2,
  'originalsMatchedNFC':208,'digitalRowsCompared':210,
  'ambiguousRows':[
   {'globalRow':index,'originalPrimary':primary[index]['text'],'originalComparator':secondary[index]['text'],
    'primarySha256':primary[index]['sha256'],'comparatorSha256':secondary[index]['sha256'],
    'disposition':'REVIEW_ONLY_NO_AUTOMATIC_TEXT_REPLACEMENT'} for index in mistakes
  ],
  'exactPauriCount':40,'quarantinedOriginalSourceGlobalRow':123,'quarantinedSourcePrivateUseCodepoint':'U+F03D',
  'note':'Quarantined source line is retained byte-for-byte in the research model but any GUI must NOT display it as approved Gurmukhi until adjudicated.',
  'digitalSourcesIndependentlyCollatedEdition':False,'humanSikhPunjabiReview':'PENDING',
  'rightsAndReuse':'PENDING','publishedReaderReady':False,
  'originalLineAutoCorrectionPerformed':False
 }
 DEST.mkdir(parents=True,exist_ok=True)
 model_path.write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n')
 comparison_path.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':receipt['status'],'pauris':40,'originalLines':208,'headers':2,'reviewHoldLine':123,'published':False}))
if __name__=='__main__':main()
