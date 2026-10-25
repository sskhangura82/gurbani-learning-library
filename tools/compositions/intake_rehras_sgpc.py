"""GLP-001 N4: SOURCE-ONLY SGPC-BOUNDED REHRAS COMPOSITE CANDIDATE.
Uses prior exact and HASHED Chaupai/Anand source slices, new SGGS nine-hymn
web capture and Savaiya/Dohira/Mundawani/Slok original digital capture.
Never asserts authoritative edition/rights, never touches released Gutka.

Explicit --capture; refuses overwrite. Digital site layout and extra verses
are retained in evidence, never silently merged into the SGPC order.
"""
import argparse,datetime as dt,hashlib,html,json,re,unicodedata,urllib.request
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[2]
DEST=ROOT/'docs/research/n4-rehras-composite'
SOURCE='https://www.discoversikhism.com/learn_gurbani/learn_rehras_sahib.html'
SECOND='https://gurdwaras.com/nitnem/rehras-sahib'
SGPC='https://sgpc.net/wp-content/uploads/2025/06/Sikh-Rehat-Maryada-English-n.pdf'
HTML_P=r'<p[^>]*class=["\']learngurmukhi["\'][^>]*>(.*?)</p>'
HTML_COMPARE=r'<p[^>]*lang=["\']pa["\'][^>]*>(.*?)</p>'
HYMNS=((3,9),(9,11),(11,13),(13,15),(15,17),(17,22),(22,24),(24,25),(25,26))
COMPONENT_KEYS=('sggs-nine','chaupai-25','savaiya-pae-gahe','dohira-sagal-duar','anand-selected','mundawani-slok')
COMPONENT_SOURCES=('sggs','dasam','dasam','dasam','sggs','sggs')
EXPECTED_UNITS=(9,25,1,1,6,2)
def sha(v):return hashlib.sha256(v if isinstance(v,bytes) else v.encode('utf8')).hexdigest()
def norm(s):return re.sub(r'\s+','',unicodedata.normalize('NFC',s))
def get(url,pattern,limit):
 req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 (GLP-001 source research only)'})
 with urllib.request.urlopen(req,timeout=28) as r:
  if r.status!=200 or urlsplit(r.geturl()).scheme!='https' or urlsplit(r.geturl()).netloc!=urlsplit(url).netloc:raise ValueError('Unexpected source redirect/status')
  raw=r.read(limit+1)
 if len(raw)>limit:raise ValueError('Unexpected source size')
 page=raw.decode('utf8','strict')
 rows=[html.unescape(re.sub('<[^>]+>','',s)).strip() for s in re.findall(pattern,page,re.I|re.S)]
 return rows,{'url':url,'httpStatus':200,'bytes':len(raw),'webPageSha256':sha(raw),'extractedOriginalParagraphs':len(rows)}
def original_row(id_,text,source,reference,sourceId=None,hold=False):
 if not text or '\x00' in text:raise RuntimeError('Empty original source row')
 if not any('\u0a00'<=ch<='\u0a7f' for ch in text):raise RuntimeError('Non-Gurmukhi original source row')
 return {'id':id_,'text':text,'sha256':sha(text),'sourceFamily':source,
         'location':reference,'sourceLayer':'original_web_candidate',
         'underlyingSourceOccurrenceId':sourceId,'unresolvedSourceReview':bool(hold)}
def unit(id_,title,kind,source,lines,originalUnit=None):
 if not lines:raise RuntimeError('Empty Rehras component unit')
 return {'unitId':id_,'title':title,'kind':kind,'sourceFamily':source,
         'underlyingSourceUnit':originalUnit,'lines':lines}
def section(key,source,units,provenance,variantNote):
 return {'componentId':key,'sourceFamily':source,'units':units,'originalProvenance':provenance,
         'humanTextApproved':False,'rightsApproved':False,'variationReviewPending':True,
         'variantScopeNote':variantNote}
def main():
 p=argparse.ArgumentParser();p.add_argument('--capture',action='store_true')
 a=p.parse_args()
 if not a.capture:p.error('Use explicit --capture; CI must be offline and read-only')
 out=DEST/'rehras-sgpc-digital-composite-candidate.json'
 ev=DEST/'rehras-sgpc-source-differences.json'
 if out.exists() or ev.exists():p.error('Never overwrite source candidate or evidence')
 web,receipt=get(SOURCE,HTML_P,550000)
 comp,other=get(SECOND,HTML_COMPARE,1300000)
 if len(web)!=52 or len(comp)!=531:raise RuntimeError('Source HTML structure changed; human boundary review required')
 known={
   3:'ਸੋ ਦਰੁ ਰਾਗੁ ਆਸਾ ਮਹਲਾ ੧',
   25:'ਆਸਾ ਮਹਲਾ ੫',
   26:'ੴ ਸ੍ਰੀ ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹ',
   38:'ਖੜਗ ਕੇਤ ਮੈਂ ਸਰਨਿ ਤਿਹਾਰੀ',
   39:'ਸ੍ਵੈਯਾ ॥',
   40:'ਦੋਹਰਾ ॥',
   41:'ਰਾਮਕਲੀ ਮਹਲਾ ੩ ਅਨੰਦੁ',
   46:'ਅਨਦੁ ਸੁਣਹੁ ਵਡਭਾਗੀਹੋ',
   47:'ਮੁੰਦਾਵਣੀ ਮਹਲਾ ੫',
   48:'ਸਲੋਕ ਮਹਲਾ ੫'
 }
 for idx,prefix in known.items():
  if not web[idx].startswith(prefix):raise RuntimeError(f'SGPC Rehras bounded original block {idx} does not start with expected marker')
 if not web[25].endswith('ਸਰਣਿ ਪਰੇ ਕੀ ਰਾਖਹੁ ਸਰਮਾ ॥੨॥੪॥'):raise RuntimeError('Nine SGGS hymns have wrong closing boundary')
 if not web[38].endswith('ਦੁਸਟ ਦੋਖ ਤੇ ਲੇਹੁ ਬਚਾਈ ॥੨੫॥'):raise RuntimeError('SGPC Chaupai excerpt closing boundary changed')
 if 'ਪਾਂਇ ਗਹੇ ਜਬ ਤੇ ਤੁਮਰੇ' not in web[39] or 'ਸਗਲ ਦੁਆਰ ਕਉ ਛਾਡਿ ਕੈ' not in web[40]:raise RuntimeError('Evening Dasam Savaiya/Dohira boundaries changed')
 if not web[46].endswith('॥੪੦॥੧॥'):raise RuntimeError('Selected final Anand pauri missing')
 if not web[48].endswith('॥੧॥'):raise RuntimeError('Mundawani/Mahla5 slok source boundary changed')
 # Explicit SGPC first nine hymns: nine source groups among 23 digital
 # paragraphs. HTML paragraph layout is NOT verse boundary or Ang authority.
 sggs=[]
 for i,(begin,end) in enumerate(HYMNS,start=1):
  rows=[]
  for index in range(begin,end):
   text=web[index]
   ref={'system':'sggs_rehras_section','hymn':i,'digitalHtmlParagraph':index,
        'angEdition':'PENDING_INDEPENDENT_SOURCE_COLLATION'}
   rows.append(original_row(f'rehras.sggs{i:02}.line{index-begin+1:02}',text,'sggs',ref))
  sggs.append(unit(f'rehras.sggs{i:02}',f'SGGS Rehras Hymn {i}','hymn','sggs',rows))
 if len(sggs)!=9 or sum(len(u['lines']) for u in sggs)!=23:raise RuntimeError('Nine SGGS original HTML source groups incomplete')
 # Reuse exact source-frozen 25-pauree excerpt (no new HTML normalizations).
 prior=json.loads((ROOT/'docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json').read_text())
 if prior['compositionId']!='rehras-benti-chaupai-excerpt' or len(prior['units'])!=25:raise RuntimeError('Chaupai source candidate changed')
 chaupai=[]
 for i,u in enumerate(prior['units'],start=1):
  verse=[]
  for line in u['lines']:
   if sha(line['text'])!=line['sha256']:raise RuntimeError('Chaupai prior original hash changed')
   verse.append(original_row('rehras.'+line['id'],line['text'],'dasam',line['location'],line['id']))
  chaupai.append(unit('rehras.chaupai'+str(i).zfill(2),'Rehras Chaupai Pauri '+str(i),'pauri','dasam',verse,u['unitId']))
 if sum(len(u['lines']) for u in chaupai)!=100:raise RuntimeError('Chaupai SGPC 25 pauris missing')
 # Site block 26–38 recites same source text with embedded preface. Comparison
 # may omit headings; positive source-substring proof only, not edition signoff.
 normalized_chaupai=norm(''.join(row['text'] for u in chaupai for row in u['lines']))
 normalized_rehras=norm(''.join(web[26:39]))
 if normalized_chaupai not in normalized_rehras:raise RuntimeError('Pinned Chaupai original no longer appears in Rehras source')
 # One evening Savaiya and its separate Dohira, NOT morning ten Savaiye.
 savaiya=[unit('rehras.savaiya01','Evening Savaiya · Pae Gahe','savaiya','dasam',[
  original_row('rehras.savaiya01.line01',web[39],'dasam',
   {'system':'dasam_section','work':'Rehras evening Pae Gahe Savaiya','digitalHtmlParagraph':39})])]
 dohira=[unit('rehras.dohira01','Evening Dohira · Sagal Duar','dohira','dasam',[
  original_row('rehras.dohira01.line01',web[40],'dasam',
   {'system':'dasam_section','work':'Rehras evening Sagal Duar Dohira','digitalHtmlParagraph':40})])]
 # Selected Anand 1–5 and 40. Pauri24 with unrenderable source is
 # deliberately NOT part of the SGPC Rehras selection.
 anand_model=json.loads((ROOT/'docs/research/n2-anand/anand-40-original-candidate.json').read_text())
 if len(anand_model['units'])!=40:raise RuntimeError('Anand source candidate incomplete')
 selected=[*anand_model['units'][:5],anand_model['units'][-1]]
 if [int(x['unitId'][-2:]) for x in selected]!=[1,2,3,4,5,40]:raise RuntimeError('Incorrect Anand Rehras subset')
 anand_units=[]
 anand_digital_comparisons=[]
 for i,u in enumerate(selected):
  grp=[]
  for line in u['lines']:
   if sha(line['text'])!=line['sha256'] or line['humanTextEditionReviewNeeded']:raise RuntimeError('Rehras selected Anand verse is disputed')
   grp.append(original_row('rehras.'+line['id'],line['text'],'sggs',line['location'],line['id']))
  original_joined=norm(''.join(l['text'] for l in u['lines']))
  web_joined=norm(web[41+i])
  anand_digital_comparisons.append({
   'sourcePauri':int(u['unitId'][-2:]),'primaryRehrasWebHtmlParagraph':41+i,
   'modelSourceLineCount':len(u['lines']),
   'modelExactSubstringInsideRehrasPage':original_joined in web_joined,
   'fullBlockEquality':original_joined==web_joined,
   'requiresFurtherEditorialReview':original_joined!=web_joined
  })
  if original_joined not in web_joined:raise RuntimeError('Selected Anand original text differs in Rehras page for pauri '+u['unitId'])
  anand_units.append(unit('rehras.'+u['unitId'],'Anand Sahib · Pauri '+str(int(u['unitId'][-2:])),
                         'pauri','sggs',grp,u['unitId']))
 if len(anand_units)!=6 or sum(len(u['lines']) for u in anand_units)<24:raise RuntimeError('Anand selected pauri source incomplete')
 # Mundawani + Mahla5 Slok as exactly bounded last source components.
 final=[]
 for index,sourceId,title in [(47,'mundawani','Mundawani Mahla 5'),(48,'slok','Slok Mahla 5 · Tera Keeta')]:
  final.append(unit('rehras.'+sourceId,title,'shabad','sggs',[
   original_row('rehras.'+sourceId+'.line01',web[index],'sggs',
    {'system':'sggs_rehras_section','section':sourceId,'digitalHtmlParagraph':index,
     'angEdition':'PENDING_INDEPENDENT_SOURCE_COLLATION'})]))
 sections=[
  section(COMPONENT_KEYS[0],'sggs',sggs,{'primaryUrl':SOURCE,'htmlParagraphRange':[3,25]},'Nine SGGS hymns, from So Dar to Saran Pare, require source edition/Ang collation'),
  section(COMPONENT_KEYS[1],'dasam',chaupai,{'otherSourceModel':'docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json','primaryRehrasParagraphRange':[26,38]},'Twenty-five pauri SGPC Rehras Benti Chaupai excerpt; longer morning forms separate'),
  section(COMPONENT_KEYS[2],'dasam',savaiya,{'primaryUrl':SOURCE,'htmlParagraph':39},'Evening Pae Gahe Savaiya is NOT the ten morning Tav-Prasad Savaiye'),
  section(COMPONENT_KEYS[3],'dasam',dohira,{'primaryUrl':SOURCE,'htmlParagraph':40},'Dohira Sagal Duar, not an SGGS source'),
  section(COMPONENT_KEYS[4],'sggs',anand_units,{'sourceModel':'docs/research/n2-anand/anand-40-original-candidate.json','primaryRehrasHtmlParagraphs':[41,42,43,44,45,46]},'Anand 1–5 and 40 only, not a replacement for full morning Anand'),
  section(COMPONENT_KEYS[5],'sggs',final,{'primaryUrl':SOURCE,'htmlParagraphs':[47,48]},'Mundawani and Mahla 5 Slok only; website adds other postscript material outside this strict SGPC sequence')
 ]
 all_units=[u for s in sections for u in s['units']]
 all_lines=[l for u in all_units for l in u['lines']]
 if len(all_units)!=44 or len({l['id'] for l in all_lines})!=len(all_lines):raise RuntimeError('Rehras composite units duplicate or incomplete')
 if [len(s['units']) for s in sections]!=list(EXPECTED_UNITS):raise RuntimeError('SGPC Rehras components have incorrect number of source units')
 if any(l['unresolvedSourceReview'] or sha(l['text'])!=l['sha256'] for l in all_lines):raise RuntimeError('Source text corrupted in composition')
 if any('ang' in l['location'] for l in all_lines if l['sourceFamily']=='dasam'):raise RuntimeError('Invented SGGS Ang for Dasam component')
 # Capture extra source texts as SHA/position receipts, not silently merge
 # into a strictly bounded composition or name them invalid practice.
 extra=[{'digitalHtmlParagraph':i,'originalSha256':sha(web[i]),'originalByteLength':len(web[i].encode('utf8'))}
        for i in [0,1,2,49,50,51]]
 model={
  'schemaVersion':1,'compositionId':'sodar-rehras-sgpc-digital-candidate',
  'title':'Sodar Rehras Sahib','titleGurmukhi':'ਸੋ ਦਰੁ ਰਹਿਰਾਸਿ',
  'sourceFamily':'composite','referenceFramework':SGPC,
  'sourceEditionState':'machine_frozen_digital_candidate_with_mixed_source_families',
  'sourceApproved':False,'humanTextCollationApproved':False,
  'rightsApproved':False,'readerEnabled':False,'releaseAuthorized':False,
  'originalSources':{
   'rehrasPrimary':SOURCE,'rehrasComparator':SECOND,
   'chaupaiSource':'docs/research/n4-chaupai-excerpt/chaupai-sgpc-excerpt-candidate.json',
   'anandSource':'docs/research/n2-anand/anand-40-original-candidate.json'
  },
  'sections':sections,'variantPolicy':'SGPC six-group narrow source candidate; do not merge regional/daily extra verses without variant-id',
  'sourceNotes':['SGGS original text in sections lacks exact independently approved Ang location until edition review',
                 'Full Rehras has verified order but is NOT yet an authoritative source or approved recitation',
                 'No Chaupai first/last/source edition claims beyond the bounded evening excerpt',
                 'No native iPhone/translation/audio/recordings/browser learning included']
 }
 evidence={
  'capturedAtUtc':dt.datetime.now(dt.timezone.utc).isoformat(),
  'status':'SGPC_SIX_SECTION_REHRAS_DIGITAL_SOURCE_CANDIDATE_NOT_EDITION_APPROVED',
  'originalReference':SGPC,'digitalPrimary':receipt,'digitalComparator':other,
  'componentOrder':list(COMPONENT_KEYS),'componentSourceFamily':list(COMPONENT_SOURCES),
  'sourceUnitCounts':[len(s['units']) for s in sections],
  'originalSourceLineRecords':len(all_lines),
  'sggsNineHymnsWebParagraphGroups':[list(r) for r in HYMNS],
  'chaupaiSourcePositiveExactSubstring':True,
  'rehrasSelectedAnandPauriTextComparisons':anand_digital_comparisons,
  'digitalPageIncludedBlocks':'SGPC selection 3–48 inclusive; Chaupai/Anand from previously frozen original sources',
  'excludedExtraVariantWebParagraphs':extra,
  'excludedExtraVariantStatement':'Extra page material outside SGPC selected sequence is neither erased from evidence nor declared an invalid Sikh practice.',
  'sourceEditionCollation':'PENDING',
  'qualifiedSikhPunjabiReview':'PENDING',
  'rights':'PENDING',
  'comparatorOriginalWordingIndependentlyCollated':False,
  'totalCompositeBaniSourceApproved':False,
  'familyReaderEnabled':False,
  'published':False
 }
 DEST.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps(model,ensure_ascii=False,indent=2)+'\n')
 ev.write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':evidence['status'],'SGPCComponents':len(sections),
                  'units':len(all_units),'sourceRecords':len(all_lines),
                  'componentUnitCounts':evidence['sourceUnitCounts'],
                  'anandPositiveSourceComparisons':[x['modelExactSubstringInsideRehrasPage'] for x in anand_digital_comparisons],
                  'familyPublished':False}))
if __name__=='__main__':main()
