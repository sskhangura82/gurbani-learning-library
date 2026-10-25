"""GLP N2: read-only full Anand digital structure and Unicode discrepancy audit.
No original Anand content is promoted to an app or source model here.
"""
from __future__ import annotations
import argparse,datetime as dt,hashlib,html,json,re,unicodedata,urllib.request
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'docs/research/n2-anand/anand-source-audit.json'
PRIMARY="https://srigurugranth.net/{:04d}.html"
COMP="https://opengranth.org/ang/{}/"
P1=r"<P class=Gurb><SPAN lang=PA>(.*?)</SPAN></p>"
P2=r'<p class="gurmukhi">(.*?)</p>'
COUNTS=(38,36,36,35,33,32)
NUMBERS=dict(zip("੦੧੨੩੪੫੬੭੮੯","0123456789"))
def sha(b):return hashlib.sha256(b if isinstance(b,bytes) else b.encode('utf8')).hexdigest()
def normalize(s):return re.sub(r'\s+',' ',unicodedata.normalize('NFC',s).replace('\xa0',' ')).strip()
def collect(fmt,pattern):
 out=[]; receipts=[]
 for i,ang in enumerate(range(917,923)):
  url=fmt.format(ang)
  req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (GLP-001 source-review) '})
  with urllib.request.urlopen(req,timeout=22) as response:
   if response.status!=200 or urlsplit(response.geturl()).netloc!=urlsplit(url).netloc:raise RuntimeError('Source inaccessible '+url)
   raw=response.read(300001)
  if len(raw)>300000:raise RuntimeError('Source unexpectedly large')
  found=re.findall(pattern,raw.decode('utf8','strict'),re.I|re.S)
  if len(found)!=COUNTS[i]:raise RuntimeError('Count drift Ang '+str(ang)+' '+str(len(found)))
  for j,item in enumerate(found):
   value=html.unescape(re.sub(r'<[^>]*>','',item)).replace('\xa0',' ').strip()
   if not value:raise RuntimeError('Blank original')
   out.append({'ang':ang,'digitalRow':j,'text':value})
  receipts.append({'url':url,'ang':ang,'bytes':len(raw),'pageSha256':sha(raw),'rows':len(found)})
 return out,receipts
def main():
 p=argparse.ArgumentParser()
 p.add_argument('--capture',action='store_true')
 args=p.parse_args()
 if not args.capture:p.error('Explicit --capture required; never run on CI')
 if DEST.exists():p.error('Refuse to rewrite an existing Anand evidence snapshot')
 first,files1=collect(PRIMARY,P1);other,files2=collect(COMP,P2)
 if len(first)!=210 or len(other)!=210:raise RuntimeError('Full Anand source span changed')
 if first[0]['text']!='ਰਾਮਕਲੀ ਮਹਲਾ ੩ ਅਨੰਦੁ' or first[1]['text']!='ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥':
  raise RuntimeError('Opening original source markers changed')
 if first[-1]['text']!='ਬਿਨਵੰਤਿ ਨਾਨਕੁ ਗੁਰ ਚਰਣ ਲਾਗੇ ਵਾਜੇ ਅਨਹਦ ਤੂਰੇ ॥੪੦॥੧॥':
  raise RuntimeError('40th Pauri closing boundary changed')
 endings=[]; allend=[]
 for ordinal,row in enumerate(first):
  for m in re.finditer(r'॥([੧੨੩੪੫੬੭੮੯੦]+)॥',row['text']):
   number=int(''.join(NUMBERS[c] for c in m.group(1)))
   if 1<=number<=40:allend.append({'pauri':number,'globalRow':ordinal,'ang':row['ang'],'sourceSha256':sha(row['text'])})
 expected=[n for n in range(1,41)]
 if [v['pauri'] for v in allend]!=expected or len(allend)!=40:
  raise RuntimeError('Pauri sequence drift, do not ingest Anand')
 mismatches=[]
 for index,(a,b) in enumerate(zip(first,other)):
  aa=normalize(a['text']); bb=normalize(b['text'])
  if a['ang']!=b['ang']:raise RuntimeError('Ang mapping drift at '+str(index))
  if aa!=bb:
   mismatches.append({
    'globalRow':index,'ang':a['ang'],'primaryDigitalRow':a['digitalRow'],
    'originalPrimary':a['text'],'originalComparator':b['text'],
    'primaryOriginalSha256':sha(a['text']),'comparatorOriginalSha256':sha(b['text']),
    'primaryNonstandardUnicode':[{'codepoint':f'U+{ord(c):04X}','name':unicodedata.name(c,'UNASSIGNED')} for c in a['text'] if 0xe000<=ord(c)<=0xf8ff or c=='\ufe00']
   })
 if len(mismatches)!=2 or [x['globalRow'] for x in mismatches]!=[0,123]:
  raise RuntimeError('New/removed digital discrepancy; human adjudication needed')
 if not any(ord(ch)==0xF03D for ch in mismatches[1]['originalPrimary']):
  raise RuntimeError('Known uncertain PUA codepoint no longer present; inspect changes')
 evidence={
  'capturedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat(),
  'status':'AUDIT_BLOCKED_ON_EDITION_AND_UNICODE_REVIEW',
  'sourceFamily':'sggs','compositionId':'anand-sahib',
  'fullSourceScope':'Full Anand Sahib, 40 pauris on Ang 917–922; no 6-pauri-shortcut substitution',
  'sourceAngs':list(range(917,923)),'firstPageRows':list(COUNTS),'totalCandidateDigitalRows':210,
  'pauriNumberEndings':allend,'pauriCount':40,
  'primary':files1,'comparator':files2,
  'identicalNfcRows':sum(normalize(a['text'])==normalize(b['text']) for a,b in zip(first,other)),
  'unicodeOrHeadingMismatches':mismatches,
  'knownRisks':[
   'Header on Ang 917 has a terminal danda variation in the second digital text',
   'Ang 920 row 14? A character near ਕਚੀ has a private-use code point U+F03D in primary while secondary uses normal Unicode combining notation; never auto-replace',
   'Web-only digital comparison is not independent physical/SGPC edition collation',
   'Original draft is deliberately NOT ingested as a release composition until reviewed',
   'Modern translations, audio, timings and private learning were not imported'
  ],
  'candidateSourceModelProduced':False,
  'automaticUnicodeCorrectionAllowed':False,
  'humanEditionCollation':'PENDING',
  'rightsReview':'PENDING',
  'publicationAuthorized':False
 }
 DEST.parent.mkdir(parents=True,exist_ok=True)
 DEST.write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':evidence['status'],'pauris':40,'rows':210,'identicalDigitalRows':evidence['identicalNfcRows'],'mismatchRows':[x['globalRow'] for x in mismatches]}))
if __name__=='__main__':main()
