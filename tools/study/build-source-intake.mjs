/* GLP-001 source-only intake; NO family/public publication or human approval.
 * Pinned Shabad OS SQLite 4.8.7 original ASCII witness and Gurmukhi utils 3.2.2.
 * Original ASCII preserved exactly; Unicode derived, independently round-tripped.
 */
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const argv=process.argv.slice(2);
const option=n=>{const p=argv.indexOf(n);return p<0?null:argv[p+1];};
const db=option('--db'),converterPath=option('--converter'),verify=argv.includes('--verify');
function guard(x,why){if(!x)throw Error('GLP SGGS SOURCE-INTAKE HOLD: '+why);}
guard(db&&converterPath&&fs.statSync(db).isFile(),'private pinned SQLite file and converter path required');
const sha=v=>createHash('sha256').update(v).digest('hex');
const pin='d8e071347bd5485cc6aa2533c1f51347a16ed1724b4d8abaa4939520257074c2';
guard(sha(fs.readFileSync(db))===pin,'external Shabad OS 4.8.7 database checksum mismatch');
const require=createRequire(import.meta.url);
const convert=require(converterPath);
guard(typeof convert.toUnicode==='function'&&typeof convert.toAscii==='function','conversion tool incompatible');
function query(sql){return JSON.parse(execFileSync('/usr/bin/sqlite3',['-json',db,sql],{encoding:'utf8',maxBuffer:15_000_000}));}
function fetch(id){
 const rows=query('select l.id as source_id,l.order_id as source_order,l.source_page as ang,l.source_line as ang_line,l.type_id as type_id,l.gurmukhi as ascii from bani_lines b inner join lines l on b.line_id=l.id where b.bani_id='+id+' order by l.order_id');
 const ids=new Set(),result=[];
 for(const r of rows){
  guard(!ids.has(r.source_id),'duplicate source line '+r.source_id);
  ids.add(r.source_id);
  const text=convert.toUnicode(r.ascii);
  const roundtripOkay=convert.toAscii(text)===r.ascii;
  const onlyKnownHold=r.source_id==='7ST5'&&r.ascii==='tUtI gwFnhwr guopwl ]'&&r.ang===282;
  guard(roundtripOkay||onlyKnownHold,'new nonreversible source transcription '+r.source_id);
  if(!roundtripOkay)console.error('SOURCE HELD: '+r.source_id+' at Ang '+r.ang+' original legacy bytes preserved, derived Unicode NOT reader-approved');
  guard(/[\u0a00-\u0a7f]/u.test(text),'no Unicode Gurmukhi generated '+r.source_id);
  guard(!/[\ufffd\u0000-\u0008\u000e-\u001f]/u.test(text),'invalid Unicode glyph '+r.source_id);
  result.push({
   id:r.source_id,orderId:r.source_order,ang:r.ang,sourceAngLine:r.ang_line,
   typeId:r.type_id,sourceAscii:r.ascii,text,sourceTextHeld:!roundtripOkay,sourceHoldReason:roundtripOkay?null:'NONREVERSIBLE_LEGACY_GURMUKHI_ASCII_TO_UNICODE_7ST5',
   sourceAsciiSha256:sha(r.ascii),textSha256:sha(text)
  });
 }
 guard(result.every((r,i)=>i===0||r.orderId===result[i-1].orderId+1),'noncontiguous source line IDs');
 return result;
}
const provenance={
 upstream:'https://github.com/shabados/database/releases/tag/4.8.7',
 databaseVersion:'Shabad OS archived SQLite 4.8.7 (2022)',
 databaseSha256:pin,
 converter:'gurmukhi-utils 3.2.2 (pinned)',
 conversion:'All but the one precisely logged source hold 7ST5 roundtrip losslessly; original ASCII always preserved',
 conversionHoldIds:['7ST5'],conversionHoldAngs:[282],
 licenseNotice:'SGGS original public domain; Shabad OS digitization notice preserves scriptural text and attribution',
 textStatus:'DIGITAL_WITNESS_SOURCE_NOT_INDEPENDENTLY_COLLATED',
 humanSourceApproved:false,rightsReviewedForApp:false,teachingApproved:false,
 familyPublicationAuthorized:false,externalScriptureReaderRequired:false
};
const rows=fetch(12);
guard(rows.length===2027&&rows[0].ang===262&&rows.at(-1).ang===296,'Sukhmani line count or Ang span changed');
guard(rows.filter(r=>r.sourceTextHeld).map(r=>r.id).join(',')==='7ST5','source hold 7ST5 must not silently disappear');
const groups=[],intro=[];let current=null,part=null;
for(const r of rows){
 if(r.text==='ਸਲੋਕੁ ॥'){
  current={id:'sukhmani-ashtpadi'+String(groups.length+1).padStart(2,'0'),ordinal:groups.length+1,salokHeading:r,salok:[],ashtpadiHeading:null,ashtpadi:[],pauriSegmentationReviewed:false};
  groups.push(current);part='salok';continue;
 }
 if(r.text==='ਅਸਟਪਦੀ ॥'){
  guard(current&&part==='salok'&&!current.ashtpadiHeading,'unexpected Sukhmani ashtpadi marker');
  current.ashtpadiHeading=r;part='ashtpadi';continue;
 }
 if(!current)intro.push(r);
 else current[part].push(r);
}
guard(groups.length===24,'Sukhmani should have exactly 24 Slok+Ashtpadi groups');
for(const g of groups){
 guard(g.salok.length>=2&&g.ashtpadi.length>=80,'underfilled original Sukhmani group '+g.id);
 g.angStart=Math.min(...g.salok.concat(g.ashtpadi).map(x=>x.ang));
 g.angEnd=Math.max(...g.salok.concat(g.ashtpadi).map(x=>x.ang));
}
const sukhmani={
 schema:'GLP-001-SGGS-PRE-REVIEW-WITNESS-V1',
 collectionId:'sukhmani',titleGurmukhi:'ਸੁਖਮਨੀ ਸਾਹਿਬ',
 titleEnglish:'Sukhmani Sahib',writer:'Guru Arjan Sahib, Mahala 5',
 pageSpan:[262,296],ashtpadiCount:24,salokCount:24,sourceRowCount:2027,
 intro,ashtpadis:groups,provenance,
 admission:'SOURCE_RESEARCH_ONLY_NOT_VERIFIED_FOR_FAMILY_PAATH',
 teachingState:'NOT_WRITTEN',publicationAllowed:false
};
const salokRows=fetch(15);
guard(salokRows.length===117&&salokRows[0].ang===1426&&salokRows.at(-1).ang===1429,'Salok Mahala9 original source span changed');
guard(salokRows.every(r=>!r.sourceTextHeld),'Salok Mahala9 cannot inherit Sukhmani Unicode review hold');
const headings=salokRows.filter(x=>x.typeId!==4),verses=salokRows.filter(x=>x.typeId===4);
guard(headings.length===3&&verses.length===114,'Salok M9 should have 3 headings and 57 couplets');
guard(headings.some(x=>x.text==='ਦੋਹਰਾ ॥'),'original final dohra heading absent');
const digits='੦੧੨੩੪੫੬੭੮੯';
const units=[];
for(let i=0;i<verses.length;i+=2){
 const ordinal=i/2+1,one=verses[i],two=verses[i+1];
 const num=String(ordinal).split('').map(x=>digits[Number(x)]).join('');
 guard(two.text.includes('॥'+num+'॥'),'original numbered Salok ending mismatch '+ordinal);
 units.push({id:'salok-mahala9-'+String(ordinal).padStart(2,'0'),ordinal,
  heading:'Guru Tegh Bahadur Sahib, Salok Mahala9',sourceRows:[one,two],
  angStart:one.ang,angEnd:two.ang,sourceStatus:'DIGITAL_WITNESS_UNCOLLATED',meaningApproved:false});
}
guard(units.length===57,'57 source Saloks expected');
const salok9={
 schema:'GLP-001-SGGS-PRE-REVIEW-WITNESS-V1',
 collectionId:'salok-mahala9',titleGurmukhi:'ਸਲੋਕ ਮਹਲਾ ੯',
 titleEnglish:'Salok Mahalla 9',writer:'Guru Tegh Bahadur Sahib, Mahala 9',
 pageSpan:[1426,1429],salokCount:57,sourceRowCount:117,
 sourceHeadings:headings,saloks:units,provenance,
 historicCompositionClaimsPendingReview:true,
 admission:'SOURCE_RESEARCH_ONLY_NOT_VERIFIED_FOR_FAMILY_PAATH',
 teachingState:'NOT_WRITTEN',publicationAllowed:false
};
const outputs=[
 ['study/sources/sukhmani-shabados-487-candidate.json',sukhmani],
 ['study/sources/salok-mahala9-shabados-487-candidate.json',salok9]
];
for(const [name,obj] of outputs){
 const destination=path.join(root,name),value=JSON.stringify(obj,null,2)+'\n';
 if(verify){
  guard(fs.existsSync(destination)&&fs.readFileSync(destination,'utf8')===value,'source candidate bytes changed '+name);
 }else{
  guard(!fs.existsSync(destination),'refuse to overwrite source candidate '+name);
  fs.writeFileSync(destination,value,'utf8');
 }
 console.log(JSON.stringify({name,byteLength:Buffer.byteLength(value),sha256:sha(value),verified:verify,readerPublished:false}));
}
