// Independent source custody and editorial joins. No storage, network or live AI.
import {SCRIPTURE_SHA256} from "./source-lock.mjs";
const need=(ok,message)=>{if(!ok)throw Error(message);};
const utf8=new TextEncoder(),decode=new TextDecoder("utf-8",{fatal:true});
export async function sha256(value){
 const bytes=typeof value==="string"?utf8.encode(value):value;
 const result=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(result),x=>x.toString(16).padStart(2,"0")).join("");
}
const digestShape=s=>typeof s==="string"&&/^[a-f0-9]{64}$/.test(s);
function unique(items){
 need(Array.isArray(items),"Registry array missing");const map=new Map();
 for(const x of items){need(typeof x?.id==="string"&&!map.has(x.id),"Duplicate registry identity");map.set(x.id,x);}
 return map;
}
function passagePayload(p,lines){return JSON.stringify([p.id,p.authorId,p.compositionId,p.raagId,p.pauriNumber,p.salokPosition,p.angStart,p.angEnd,lines.map(o=>[o.id,o.textSha256])]);}
function exactBindings(bindings,ids,map,field){
 need(Array.isArray(bindings)&&bindings.length===ids.length,"Source bindings missing");
 for(let i=0;i<ids.length;i++){const id=ids[i],b=bindings[i];need(b?.id===id&&b.sha256===map.get(id)?.[field]&&digestShape(b.sha256),"Source binding stale or wrong: "+id);}
}
export async function verifyScripture(bytes){
 need(await sha256(bytes)===SCRIPTURE_SHA256,"Independent scripture digest mismatch");
 const s=JSON.parse(decode.decode(bytes));
 need(s.schema==="glp.scripture.pilot.v1"&&s.status==="DIGITAL_SOURCE_DRAFT"&&s.edition?.humanCollated===false,"Invalid scripture status");
 const passages=unique(s.passages),lines=unique(s.occurrences),taxonomy=unique(s.sourceNodes),used=new Set();
 need(s.sourceNodes.every(n=>["collection","author","raag","composition"].includes(n.type)),"Invalid source taxonomy");
 const typed=(id,type)=>taxonomy.get(id)?.type===type;
 need(typed(s.edition.collectionId,"collection"),"Invalid edition collection");
 need(passages.size===3&&lines.size===19,"Pilot source coverage changed");
 for(const p of passages.values()){
  const ids=p.occurrenceIds;
  need(typed(p.collectionId,"collection")&&typed(p.authorId,"author")&&typed(p.compositionId,"composition")&&(p.raagId===null||typed(p.raagId,"raag")),"Invalid locked source attribution");
  need(p.type==="passage"&&p.review==="DIGITAL_SOURCE_DRAFT"&&Array.isArray(ids)&&ids.length===p.expectedOccurrenceCount&&ids.includes(p.focusId)&&ids.includes(p.incipitId),"Incomplete passage");
  const expectedId=p.pauriNumber===null?"sggs.kabir.salok"+String(p.salokPosition).padStart(3,"0"):"sggs.asa-di-vaar.pauri"+String(p.pauriNumber).padStart(3,"0")+".salok"+String(p.salokPosition).padStart(2,"0");
  need(p.id===expectedId&&p.number===p.salokPosition,"Structural passage identity mismatch");
  let verse=0,prior=null;const rows=[];
  for(const id of ids){
   const o=lines.get(id);need(o&&!used.has(id)&&o.passageId===p.id&&o.editionId===s.edition.id,"Invalid occurrence membership");
   need(o.ang>=p.angStart&&o.ang<=p.angEnd&&o.sourceBlob===s.sourceWitnesses[String(o.ang)]?.gitBlob&&o.sourcePath===s.sourceWitnesses[String(o.ang)]?.path,"Invalid edition locator");
   if(prior)need(o.ang>prior.ang||o.ang===prior.ang&&o.ordinal>prior.ordinal,"Source order mismatch");prior=o;
   const heading=o.kind==="heading";if(!heading)verse++;
   need(heading?rows.length===0&&o.verseNumber===null&&id===p.id+".heading01":o.kind==="verse"&&o.verseNumber===verse&&id===p.id+".line"+String(verse).padStart(2,"0"),"Invalid logical line identity");
   need(typeof o.text==="string"&&o.text.length>0&&await sha256(o.text)===o.textSha256,"Line fingerprint mismatch");
   used.add(id);rows.push(o);
  }
  need(rows.find(o=>o.kind==="verse")?.id===p.incipitId&&await sha256(passagePayload(p,rows))===p.passageSha256,"Passage fingerprint mismatch");
 }
 need(used.size===lines.size,"Unbound source row");
 need(Object.keys(s.legacyOccurrenceIds).length===19&&new Set(Object.values(s.legacyOccurrenceIds)).size===19,"Incomplete migration crosswalk");
 for(const id of Object.values(s.legacyOccurrenceIds))need(lines.has(id),"Unknown legacy line target");
 for(const id of Object.values(s.legacyPassageIds))need(passages.has(id),"Unknown legacy passage target");
 return s;
}
// Comparison only: never normalize or rewrite the canonical Gurbani bytes.
function editorialComparable(value){
 return value.normalize("NFKC").replace(/[\p{Cf}\p{Default_Ignorable_Code_Point}]/gu,"")
  .replace(/[੦-੯]/gu,c=>String(c.codePointAt(0)-0x0a66));
}
function titleSignature(value){
 return editorialComparable(value).replace(/[\p{P}\p{Z}\s]/gu,"");
}
function validateEditorialText(value,sourceSignatures,field,{wordForm=false}={}){
 need(typeof value==="string"&&value.trim().length>0,"INVALID_EDITORIAL_TITLE: expected nonempty text in "+field);
 const text=editorialComparable(value),key=titleSignature(value);
 need(key.length>0,"INVALID_EDITORIAL_TITLE: expected visible text in "+field);
 // Reserve recognizable structural syntax wherever it occurs, including after
 // a topic prefix. The single-letter abbreviation requires a token boundary:
 // ordinary words ending in ਮ followed by a number are not headings.
 const heading=/(?:ੴ|(?:ਸਲੋਕ(?:ੁ|ਾ)?[\p{P}\p{Z}\s]*)?(?:ਮਹਲਾ|ਮਃ)[\p{P}\p{Z}\s]*[0-9]+|(?<![\p{L}\p{M}\p{N}])ਮ[\p{P}\p{Z}\s]*[0-9]+|(?:ਪਉੜੀ|ਰਹਾਉ)[\p{P}\p{Z}\s]*[0-9]+|(?:ਸਲੋਕ(?:ੁ|ਾ)?|ਪਉੜੀ|ਰਹਾਉ)[\p{Z}\s]*[।॥])/u;
 const bare=/^(?:ਸਲੋਕ(?:ੁ|ਾ)?|ਪਉੜੀ|ਰਹਾਉ)$/u;
 const numberedUnit=/[।॥][\p{P}\p{Z}\s]*[0-9]+[\p{P}\p{Z}\s]*[।॥]/u;
 // Full source lines may not be smuggled into editorial copy with a prefix.
 // Individual attested dictionary words remain allowed. This is a syntactic
 // boundary, not a claim to classify theological meaning or every paraphrase.
 const copiedLine=[...sourceSignatures].some(line=>key.includes(line));
 need(!copiedLine&&!heading.test(text)&&!numberedUnit.test(text)&&(!bare.test(key)||wordForm),
  "EDITORIAL_TITLE_ATTRIBUTION: original text or scripture heading in "+field);
}
function validateAliases(aliases,sourceSignatures,field,forms=new Set()){
 if(aliases===undefined)return;
 need(Array.isArray(aliases),"INVALID_EDITORIAL_TITLE: aliases must be an array in "+field);
 for(const value of aliases)validateEditorialText(value,sourceSignatures,field,{wordForm:forms.has(value)});
}
function validateNodeText(n,sourceSignatures,lines){
 need(!["editorialTitle","editorialPa","editorialAliases"].some(key=>Object.hasOwn(n,key)),"Editorial node attempts to define joined passage metadata");
 const forms=new Set();
 if(n.type==="word"){
  need(Array.isArray(n.senses),"Invalid vocabulary senses");
  for(const sense of n.senses){
   // The displayed form is a bound source token, not another editorial text
   // slot or an arbitrary source quote. Keep exact bytes; do not normalize it.
   need(typeof sense.form==="string"&&Array.isArray(sense.occurrenceIds)&&sense.occurrenceIds.length>0&&
    sense.occurrenceIds.every(id=>lines.get(id)?.text.split(/\s+/u).includes(sense.form)),
    "Unbound dictionary form");
   forms.add(sense.form);
   for(const language of ["en","pa"])validateEditorialText(sense[language],sourceSignatures,n.id+".senses."+language);
  }
 }
 validateEditorialText(n.title,sourceSignatures,n.id+".title",{wordForm:forms.has(n.title)});
 if(n.pa!==undefined)validateEditorialText(n.pa,sourceSignatures,n.id+".pa",{wordForm:forms.has(n.pa)});
 validateAliases(n.aliases,sourceSignatures,n.id+".aliases",forms);
 if(n.type==="lesson")for(const depth of ["simple","detailed","deep"]){
  for(const language of ["en","pa"])validateEditorialText(n[depth]?.[language],sourceSignatures,n.id+"."+depth+"."+language);
 }
 for(const field of ["citation","discipline"])if(n[field]!==undefined)validateEditorialText(n[field],sourceSignatures,n.id+"."+field);
}
// Public study admission is held in executable policy, independently of the
// editable pack digest. These labels do not classify the meaning of arbitrary
// prose; new prose still needs the project's source-based editorial review.
export const PUBLIC_STUDY_ADMISSIONS=Object.freeze({
 "study.intellectual-humility":Object.freeze({
  contentClass:"PSYCHOLOGY",discipline:"psychology",
  contentSha256:"2a2a32961a51e233f34898b76f82b98358646735064500830bf73c668c115eaa"
 })
});
const publicStudyFields=Object.freeze(["id","type","title","pa","aliases","discipline","reference","citation","review"]);
function exactKeys(value,keys){
 return value&&typeof value==="object"&&!Array.isArray(value)&&
  JSON.stringify(Object.keys(value).sort())===JSON.stringify([...keys].sort());
}
async function verifyPublicEditorialAccess(e){
 const p=e.accessPolicy;
 need(exactKeys(p,["schema","audience","psychology","comparativeReligion"])&&
  p.schema==="glp.knowledge.public-access.v1"&&p.audience==="PUBLIC"&&
  p.psychology==="PUBLIC"&&p.comparativeReligion==="PRIVATE_ONLY",
  "PUBLIC_ACCESS_POLICY: this loader accepts the explicit public projection only");
 let studies=0;
 for(const n of e.nodes){
  const expected=n.type==="study"?"PSYCHOLOGY":"GURBANI_LEARNING";
  need(exactKeys(n.access,["audience","contentClass"])&&n.access.audience==="PUBLIC"&&
   n.access.contentClass===expected,"PUBLIC_ACCESS_LABEL: missing or restricted record classification: "+n.id);
  if(n.type!=="study")continue;
  studies++;
  const admitted=Object.hasOwn(PUBLIC_STUDY_ADMISSIONS,n.id)?PUBLIC_STUDY_ADMISSIONS[n.id]:null;
  need(admitted&&n.discipline===admitted.discipline&&n.access.contentClass===admitted.contentClass,
   "PUBLIC_STUDY_NOT_ADMITTED: comparative religion and undeclared studies require restricted delivery");
  need(exactKeys(n,[...publicStudyFields,"access"])&&
   await sha256(JSON.stringify(publicStudyFields.map(field=>n[field])))===admitted.contentSha256,
   "PUBLIC_STUDY_METADATA: study content differs from its separately admitted public record");
 }
 need(studies===1&&e.coverage.psychologyStudies===studies&&e.coverage.comparativeReligionStudies===0,
  "PUBLIC_STUDY_COVERAGE: public psychology coverage is incomplete or overstated");
 need(e.edges.every(edge=>edge.type!=="philosophical_comparison"),
  "PUBLIC_COMPARISON_RESTRICTED: religious/philosophical comparative edges are not public admissions");
 for(const edge of e.edges.filter(edge=>edge.type==="psychological_parallel")){
  need(Object.hasOwn(PUBLIC_STUDY_ADMISSIONS,edge.to),"PUBLIC_COMPARISON_RESTRICTED: comparison target is not publicly admitted psychology");
 }
}
export async function loadKnowledge(sourceBytes,teachingBytes,teachingPin){
 const s=await verifyScripture(sourceBytes);
 need(await sha256(teachingBytes)===teachingPin,"Editorial digest mismatch");
 const e=JSON.parse(decode.decode(teachingBytes));
 need(e.schema==="glp.knowledge.editorial.v3"&&e.status==="NONPUBLISHING_DRAFT"&&!Object.hasOwn(e,"occurrences"),"Invalid editorial pack");
 const passages=unique(s.passages),lines=unique(s.occurrences);
 need(e.nodes.every(n=>["concept","word","study","lesson","course"].includes(n.type)),"Editorial pack attempts to define scripture or its attribution");
 const sourceSignatures=new Set(s.occurrences.map(o=>titleSignature(o.text)));
 const descriptions=new Map();for(const d of e.passageDescriptions){
  need(passages.has(d.passageId)&&!descriptions.has(d.passageId)&&Object.keys(d).every(k=>["passageId","title","pa","aliases"].includes(k)),"Invalid editorial passage description");
  validateEditorialText(d.title,sourceSignatures,d.passageId+".title");
  validateEditorialText(d.pa,sourceSignatures,d.passageId+".pa");
  validateAliases(d.aliases,sourceSignatures,d.passageId+".aliases");
  descriptions.set(d.passageId,d);
 }
 need(descriptions.size===passages.size,"Missing passage description");
 for(const n of e.nodes){
  validateNodeText(n,sourceSignatures,lines);
  if(n.type==="lesson")exactBindings(n.sourceBindings,n.sourcePassageIds,passages,"passageSha256");
  if(n.type==="word")for(const sense of n.senses)exactBindings(sense.sourceBindings,sense.occurrenceIds,lines,"textSha256");
 }
 for(const edge of e.edges){
  for(const field of ["reason","similarity","difference"])if(edge[field]!==undefined)validateEditorialText(edge[field],sourceSignatures,edge.id+"."+field);
  if(edge.refs)exactBindings(edge.sourceBindings,edge.refs,passages,"passageSha256");
 }
 await verifyPublicEditorialAccess(e);
 const sourceNodes=s.passages.map(p=>{const d=descriptions.get(p.id);return {...p,title:lines.get(p.incipitId).text,editorialTitle:d.title,editorialPa:d.pa,editorialAliases:d.aliases||[]};});
 const {passageDescriptions,...rest}=e;
 return {...rest,schema:"glp.knowledge.v1",nodes:[...e.nodes,...s.sourceNodes,s.edition,...sourceNodes],occurrences:s.occurrences,legacyPassageIds:s.legacyPassageIds,legacyOccurrenceIds:s.legacyOccurrenceIds};
}
