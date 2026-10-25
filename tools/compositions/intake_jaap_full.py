"""GLP N3 Jaap complete original digital SOURCE CANDIDATE (NOT public).
Extract all 199 numbered chhands and exact original website-paragraph lines.
Preserve original metre headings separately; keep digital spelling differences
visible against a second website, without guessing/normalizing any source.
Needs --capture; never network in CI; never overwrite source record.
"""
import argparse,datetime as dt,hashlib,html,json,re,unicodedata,urllib.request
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'docs/research/n3-dasam-jaap'
PRIMARY='https://gurdwaras.com/nitnem/jaap-sahib'
COMPARE='https://www.discoversikhism.com/learn_gurbani/learn_jaap_sahib.html'
DIGITS=dict(zip('੦੧੨੩੪੫੬੭੮੯','0123456789'))
NUM_RE=re.compile(r'॥([੦-੯]+)॥')
END_RE=re.compile(r'॥([੦-੯]+)॥$')
P1=r'<p[^>]*lang=["\']pa["\'][^>]*>(.*?)</p>'
P2=r'<p[^>]*class=["\']learngurmukhi["\'][^>]*>(.*?)</p>'
UA='Mozilla/5.0 (GLP-001 Gurmukhi-only research; no user data)'
def hash256(s):return hashlib.sha256(s if isinstance(s,bytes) else s.encode('utf8')).hexdigest()
def norm(s):return re.sub(r'\s+','',unicodedata.normalize('NFC',s))
def get(url,limit=1300000):
 request=urllib.request.Request(url,headers={'User-Agent':UA})
 with urllib.request.urlopen(request,timeout=28) as r:
  if r.status!=200 or urlsplit(r.geturl()).scheme!='https' or urlsplit(r.geturl()).netloc!=urlsplit(url).netloc:raise RuntimeError('Invalid source redirect/status')
  raw=r.read(limit+1)
 if len(raw)>limit:raise RuntimeError('Source too large')
 return raw.decode('utf8','strict'),{
  'url':url,'httpStatus':200,'pageBytes':len(raw),'pageSha256':hash256(raw),
  'capturedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat()
 }
def number(s):
 result=''.join(DIGITS[t] for t in s)
 return int(result)
def extract_primary(page):
 rows=[html.unescape(re.sub(r'<[^>]+>','',v)).strip() for v in re.findall(P1,page,re.I|re.S)]
 if len(rows)!=809:raise RuntimeError('Gurmukhi paragraph count changed; inspect manually')
 for x in rows:
  if not x or not any('\u0a00'<=c<='\u0a7f' for c in x):raise RuntimeError('Blank/nonoriginal primary segment')
 if rows[0]!='ਜਾਪੁ ਸਾਹਿਬ' or not rows[6].startswith('ਚੱਕ੍ਰ ਚਿਹਨ') or not rows[-1].endswith('॥੧੯੯॥'):
  raise RuntimeError('Jaap source boundaries changed')
 preface=[{'originalText':text,'originalSha256':hash256(text),'digitalParagraphIndex':i,'status':'preface_candidate_not_recitation_approved'} for i,text in enumerate(rows[:6])]
 units=[];current=[];headings=[];all_headings=[];all_lines=[]
 for idx,text in enumerate(rows[6:],start=6):
  endings=NUM_RE.findall(text)
  metrical=('ਛੰਦ' in text and len(text)<120 and not endings)
  if metrical:
   heading={'text':text,'sha256':hash256(text),'digitalParagraphIndex':idx,'humanVerified':False}
   headings.append(heading)
   all_headings.append(heading)
   continue
  if len(endings)>1:raise RuntimeError('Two numbered Jaap chhands in a single primary original paragraph at '+str(idx))
  number_end=number(endings[0]) if endings else None
  if number_end is not None and not END_RE.search(text):
   raise RuntimeError('Jaap source numbered line is not a complete terminal paragraph')
  current.append({'id':'jaap'+str(len(units)+1).zfill(3)+'.line'+str(len(current)+1).zfill(2),
                  'text':text,'sha256':hash256(text),
                  'location':{'system':'dasam_section','work':'Jaap Sahib','chhand':len(units)+1,
                              'webParagraphIndex':idx,'sourceLine':len(current)+1},
                  'sourceLayer':'original_digital_candidate'})
  all_lines.append(idx)
  if number_end is not None:
   if number_end!=len(units)+1:raise RuntimeError('Jaap sequential chhand ending changed at '+str(number_end))
   n=len(units)+1
   units.append({
    'unitId':'jaap'+str(n).zfill(3),'kind':'stanza','title':'Jaap Sahib · Chhand '+str(n),
    'titleGurmukhi':'','printedRaag':None,'raagEvidence':None,
    'metricalHeadingsDigitalCandidates':headings,
    'lines':current
   })
   current=[];headings=[]
 if current or headings:raise RuntimeError('Trailing source not attached to an original chhand')
 if len(units)!=199 or len(all_headings)!=21 or len(all_lines)!=782:
  raise RuntimeError('Jaap original count changed: '+str((len(units),len(all_headings),len(all_lines))))
 if len(set(all_lines+[h['digitalParagraphIndex'] for h in all_headings]))!=803:
  raise RuntimeError('Original primary rows lost or duplicated')
 return preface,units,all_headings
def extract_comparator(page):
 blocks=re.findall(P2,page,re.I|re.S)
 if len(blocks)!=59:raise RuntimeError('Comparator layout changed')
 # Remove tags but preserve whitespace where the other site has <br>.
 paragraphs=[]
 for block in blocks:
  t=html.unescape(re.sub(r'<br\s*/?>',' ',block,flags=re.I))
  t=re.sub(r'<[^>]*>',' ',t)
  paragraphs.append(t.strip())
 if not paragraphs[3].startswith('ਚੱਕ੍ਰ ਚਿਹਨ'):
  raise RuntimeError('Wrong comparator Jaap first verse')
 combined=' '.join(paragraphs[3:])
 parts=[];begin=0
 for m in NUM_RE.finditer(combined):
  parts.append(combined[begin:m.end()].strip())
  begin=m.end()
 if len(parts)!=199 or [number(n) for n in NUM_RE.findall(combined)]!=list(range(1,200)):
  raise RuntimeError('Comparator does not have 199 original chhand numbers')
 # A site's devotional footer AFTER 199 is not part of the source.
 site_footer=combined[begin:].strip()
 return parts,site_footer,len(paragraphs)
def main():
 p=argparse.ArgumentParser()
 p.add_argument('--capture',action='store_true')
 a=p.parse_args()
 if not a.capture:p.error('Explicit --capture required; CI is read-only and offline')
 model_path=DEST/'jaap-199-original-candidate.json'
 ledger_path=DEST/'jaap-text-discrepancy-ledger.json'
 if model_path.exists() or ledger_path.exists():p.error('Refuse overwrite of previously captured source candidate')
 atext,p_receipt=get(PRIMARY)
 btext,c_receipt=get(COMPARE)
 preface,units,headings=extract_primary(atext)
 comparer,footer,other_paragraph_count=extract_comparator(btext)
 comparisons=[]
 for i,(u,cmptext) in enumerate(zip(units,comparer)):
  # Use exact digital heading only as a comparator-only optional prefix removal;
  # no normalization or editing is applied to a stored Gurmukhi original.
  cleaned=cmptext
  headings_removed=[]
  for h in u['metricalHeadingsDigitalCandidates']:
   text=h['text']
   if cleaned.startswith(text):
    cleaned=cleaned[len(text):].strip()
    headings_removed.append(h['sha256'])
  original=' '.join(line['text'] for line in u['lines'])
  agree=norm(original)==norm(cleaned)
  comparisons.append({
   'chhand':i+1,'originalLines':len(u['lines']),
   'primaryChhandSourceSha256':hash256(original),
   'secondSiteChhandSourceSha256':hash256(cmptext),
   'secondSiteTextWithoutExactHeadingPrefixSha256':hash256(cleaned),
   'identicalUnicodeIgnoringWhitespace':agree,
   'exactHeadingPrefixesDroppedForComparisonOnly':headings_removed,
   'requiresTextEditionAdjudication':not agree,
   **({'originalDigitalComparatorVersion':cmptext} if not agree else {})
  })
 exact=sum(x['identicalUnicodeIgnoringWhitespace'] for x in comparisons)
 if exact!=132:raise RuntimeError('Digital text match count changed ('+str(exact)+'); human inspection required')
 model={
  'schemaVersion':1,'compositionId':'jaap-sahib','title':'Jaap Sahib',
  'titleGurmukhi':'ਜਾਪੁ ਸਾਹਿਬ','sourceWork':'Dasam Bani · Jaap Sahib',
  'prefaceOriginalDigitalCandidates':preface,
  'edition':{
   'editionId':'jaap-199-digital-original-candidate-20261025',
   'sourceFamily':'dasam','locationScheme':'dasam_section',
   'sourceRelease':'Gurdwaras digital original snapshot Oct 25 2026',
   'sourceFileHash':hash256(bytes.fromhex(p_receipt['pageSha256'])+bytes.fromhex(c_receipt['pageSha256'])),
   'sourceStatus':'machine_frozen','rightsStatus':'digital_original_reuse_rights_NOT_cleared',
   'humanCollationApproved':False,'editionCitation':None,'editionAuthority':None,
   'comparatorDigitalSource':COMPARE
  },
  'ui':{
   'readable':False,'meaningReviewStatus':'not_ingested','studyReviewStatus':'not_ingested',
   'raagStatus':'not_applicable','preserveLegacyLearningKeys':False
  },
  'units':units
 }
 receipt={
  'capturedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat(),
  'status':'199_CHHAND_DIGITAL_ORIGINAL_CANDIDATE_67_COMPARISON_HOLDS',
  'sourceFamily':'dasam','compositionId':'jaap-sahib',
  'primary':p_receipt,'comparator':c_receipt,
  'primaryTotalGurmukhiParagraphs':809,'primaryPrefaceDigitalParagraphs':6,
  'primaryMeterHeadingDigitalParagraphs':21,'primaryOriginalVerseParagraphs':782,
  'comparatorOriginalGurmukhiParagraphs':other_paragraph_count,
  'fullNumberedChhands':199,'comparisonExactUnicodeIgnoringWhitespace':exact,
  'comparatorDisagreements':199-exact,
  'sourceSitesTextLineageIndependent':'UNVERIFIED',
  'footersExcludedFromJaapOriginal':bool(footer),
  'siteFooterAfterChhand199Sha256':hash256(footer) if footer else None,
  'comparisonMethod':'199 numbered original chhand groups; optional removal of exact same printed meter headings in SECOND SITE COMPARISON ONLY; Unicode NFC plus whitespace removal; original text unchanged',
  'perChhandComparison':comparisons,
  'originalCandidateIncludesNoModernTranslation':True,
  'printedMetreHeadingsIndependentlyReviewed':False,
  'qualifiedSikhPunjabiReview':'PENDING',
  'physicalReferenceEditionCollation':'PENDING',
  'rightsAndReuseApproval':'PENDING',
  'publishedReaderReady':False,
  'limitations':[
   '67 textual or heading-layout chhand comparison results remain unresolved; web sites are not independent authoritative manuscripts.',
   'Full original digital source is 782 HTML verse lines across 199 numbered chhands, plus 21 additional meter heading candidate rows and six preface rows.',
   'No HTML layout, spelling, metre heading or meter-specific pronunciation was silently repaired. Source is not approved for family paath.',
   'Modern translations, audio, browser notes, licenses and user personal data were not imported.'
  ]
 }
 DEST.mkdir(parents=True,exist_ok=True)
 model_path.write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n')
 ledger_path.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':receipt['status'],'chhands':199,'originalVerseRows':782,
                   'meterHeaders':21,'secondSourceChhandExactMatches':exact,'disagreements':199-exact,
                   'sourceEditionApproved':False,'publicReader':False}))
if __name__=='__main__':main()
