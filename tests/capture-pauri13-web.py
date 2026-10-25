"""Capture only hashed, bounded source-match receipts for Japji Pauri 13.
Public web transcription corroboration is NOT edition-level or religious approval.
No scripture, teaching or runtime file is ever written by this script.
"""
import argparse,datetime,hashlib,html,json,re,subprocess,unicodedata
import urllib.request
from pathlib import Path
from urllib.parse import urlsplit

root=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser()
p.add_argument('--output',type=Path,default=root/'evidence/pauri13-web-corroboration.json')
args=p.parse_args()
if args.output.resolve()!=root/'evidence/pauri13-web-corroboration.json':
 p.error('Evidence destination is pinned. No arbitrary file writes.')
js="""const fs=require('fs'),vm=require('vm'),scope={window:{}};
vm.runInNewContext(fs.readFileSync('js/japji-full-data.js','utf8'),scope);
const u=scope.window.GLP_FULL_JAPJI.units.find(u=>u.id==='pauri13');
if(!u||u.angs[0]!==3||u.lines.length!==6)throw Error('Unexpected frozen corpus');
console.log(JSON.stringify(u.lines));
"""
lines=json.loads(subprocess.check_output(['node','-e',js],cwd=root,text=True))
if len(lines)!=6 or lines[0]['id']!='pauri13.line01':
 raise SystemExit('Frozen source identity changed.')
for l in lines:
 digest=hashlib.sha256(l['text'].encode('utf8')).hexdigest()
 if digest!=l['sha256']:raise SystemExit('Frozen source hash is invalid: '+l['id'])
pages=[
 ('SriGranth','https://www.srigranth.org/servlet/gurbani.gurbani?Action=KeertanPage&I=21743&K=3&L=6&Lang=1'),
 ('SiriGuruGranth','https://srigurugranth.net/0003.html'),
 ('GurbaniTabs','https://www.gurbanitabs.com/angs/3/%E0%A8%85%E0%A9%B0%E0%A8%97-%E0%A9%A9')]
results=[]
for label,url in pages:
 req=urllib.request.Request(url,headers={'User-Agent':'GLP-001 source validation (public page read-only)'})
 with urllib.request.urlopen(req,timeout=25) as response:
  actual=response.geturl()
  if urlsplit(actual).scheme!='https' or urlsplit(actual).netloc!=urlsplit(url).netloc:
   raise SystemExit('Unexpected external redirect: '+label)
  if response.status!=200:raise SystemExit('HTTP source unavailable: '+label)
  raw=response.read(300000)
  if len(raw)==300000:raise SystemExit('Unexpected page length: '+label)
 decoded=unicodedata.normalize('NFC',html.unescape(raw.decode('utf8','replace')))
 # This simple extraction is not a diplomatic edition parser. Only exact-positive
 # line matches are accepted; failures are not interpreted as textual disagreement.
 clean=re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',decoded))
 matched=[l['id'] for l in lines if unicodedata.normalize('NFC',l['text']) in clean]
 results.append({'source':label,'url':url,'http_status':200,'retrieved_bytes':len(raw),
                 'page_sha256':hashlib.sha256(raw).hexdigest(),'exact_nfc_html_matches':matched,
                 'unmatched_not_disagreements':[l['id'] for l in lines if l['id'] not in matched]})
counts={l['id']:sum(l['id'] in s['exact_nfc_html_matches'] for s in results) for l in lines}
status='WEB_CORROBORATED_NOT_EDITION_APPROVED' if counts['pauri13.line01']==3 and min(counts.values())>=2 else 'INCOMPLETE_WEB_CORROBORATION'
output={
 'captured_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'status':status,
 'scope':'Published web text exact-UTF-8/NFC corroboration, not independent printed edition/qualified Sikh review',
 'frozen_anchor':{'ang':3,'unit':'pauri13','line_count':6,
                  'lines':[{'id':l['id'],'source_line':l['sourceLine'],'frozen_sha256':l['sha256'],'web_matches':counts[l['id']]} for l in lines]},
 'first_line_original':lines[0]['text'],
 'first_line_original_sha256':lines[0]['sha256'],
 'pages':results,
 'method':'HTTPS 200 HTML snapshot SHA-256; UTF-8 decode, HTML entities decoded, tag removal, Unicode NFC and whitespace compaction; exact original Gurmukhi substring only',
 'limitation':'Websites may share the same digital source; this is NOT three independently collated printed editions. No SGPC source-edition signoff or linguistic scholarship. Non-match can reflect markup, not a textual discrepancy.',
 'qualified_sikh_punjabi_review':'PENDING',
 'independent_source_edition_collation':'PENDING',
 'frozen_corpus_modified':False,
 'public_release_authorized':False
}
args.output.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':status,'counts':counts,'sources':len(results),'evidence':str(args.output)},ensure_ascii=False))
if status!='WEB_CORROBORATED_NOT_EDITION_APPROVED':raise SystemExit(1)
