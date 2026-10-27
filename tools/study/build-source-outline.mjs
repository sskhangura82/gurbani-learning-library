/* Precise, source-numbered Sukhmani Ashtpadi/Pauri outline for review.
 * Does NOT rewrite even one original Gurmukhi character or claim scholarly
 * human collated text. First Ashtpadi has separate two-line Rahau.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const file='study/sources/sukhmani-shabados-487-candidate.json';
const sourceBytes=fs.readFileSync(path.join(root,file));
const source=JSON.parse(sourceBytes.toString());
const sha=x=>createHash('sha256').update(x).digest('hex');
function check(v,why){if(!v)throw Error('SUKHMANI OUTLINE REVIEW HOLD: '+why);}
const digits='੧੨੩੪੫੬੭੮';
const groups=[];
let pauriTotal=0,refrainTotal=0;
for(const original of source.ashtpadis){
 const pauris=[],refrain=[],body=original.ashtpadi;
 let acc=[];
 for(const l of body){
  // Source rows on hold are INCLUDED in counted navigation but blocked for recitation; never silently skip them.
  if(l.typeId===3){refrain.push(l);continue;}
  acc.push(l);
  const match=l.text.match(/॥([੧੨੩੪੫੬੭੮])॥/u);
  if(match){
   const ordinal=pauris.length+1;
   check(match[1]===digits[ordinal-1],'nonconsecutive numbered pauri '+original.id+' expected '+ordinal);
   check(acc.length===10,'Sukhmani source pauri is not 10 source rows: '+original.id+':'+ordinal+':'+acc.length);
   pauris.push({
    id:original.id+'-pauri'+String(ordinal).padStart(2,'0'),
    ordinal,
    angStart:acc[0].ang,angEnd:acc.at(-1).ang,
    endingOriginalSourceId:l.id,
    sourceLineIds:acc.map(x=>x.id),
    lineHashes:acc.map(x=>x.textSha256),
    unapprovedOriginalPresent:acc.some(x=>x.sourceTextHeld),
    heldOriginalLineIds:acc.filter(x=>x.sourceTextHeld).map(x=>x.id),
    meaningApproval:'NONE',
    variant:'Shabad OS archived 4.8.7 source transcript, not independently collated'
   });
   acc=[];
  }
 }
 check(pauris.length===8&&acc.length===0,'Sukhmani original count incomplete '+original.id);
 if(original.ordinal===1){
  check(refrain.length===2,'first Ashtpadi must have two distinct Rahau lines');
 }else check(refrain.length===0,'unexpected Rahau in later Ashtpadi '+original.id);
 pauriTotal+=pauris.length;refrainTotal+=refrain.length;
 groups.push({
  id:original.id,ordinal:original.ordinal,
  salokLineIds:original.salok.map(x=>x.id),
  salokLineHashes:original.salok.map(x=>x.textSha256),
  ashtpadiHeadingId:original.ashtpadiHeading.id,
  pauris,
  refrain:refrain.map(x=>({sourceId:x.id,textSha256:x.textSha256,ang:x.ang})),
  refrainPlacement:refrain.length?'After Pauri 1, before Pauri 2 as in original source':'none',
  humanTextApproved:false,readerPublished:false
 });
}
check(pauriTotal===192&&refrainTotal===2,'24 Ashtpadis x8 Pauris + 2 Rahau mismatched');
const output={
 schema:'GLP-001-SUKHMANI-OUTLINE-V1',
 collectionId:'sukhmani',
 sourceFile:file,sourceFileSha256:sha(sourceBytes),
 structure:'24 Saloks, 24 Ashtpadis, 192 distinct numbered Pauris (10 source lines each), 2 separate Rahau lines',
 pauriCount:192,originalPauriSourceRows:1920,distinctRahauRows:2,
 sourceReview:'PHYSICAL_SGGS_COLLATION_PENDING',
 editorialReview:'NOT_APPROVED',
 publicFamilyRelease:false,
 ashtpadis:groups
};
const destination=path.join(root,'study/sources/sukhmani-ashtpadi-pauri-outline.v1.json');
const bytes=JSON.stringify(output,null,2)+'\n';
if(process.argv.includes('--verify')){
 check(fs.existsSync(destination)&&fs.readFileSync(destination,'utf8')===bytes,'outline drift versus original source');
}else{
 check(!fs.existsSync(destination),'do not overwrite source outline');
 fs.writeFileSync(destination,bytes);
}
console.log(JSON.stringify({status:'PASS_SOURCE_SEGMENTATION_ONLY',saloks:24,ashtpadis:groups.length,
 pauris:pauriTotal,numberedRows:1920,refrainRows:refrainTotal,
 outlineSha256:sha(bytes),publication:false,verify:process.argv.includes('--verify')}));
