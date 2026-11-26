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
export async function loadKnowledge(sourceBytes,teachingBytes,teachingPin){
 const s=await verifyScripture(sourceBytes);
 need(await sha256(teachingBytes)===teachingPin,"Editorial digest mismatch");
 const e=JSON.parse(decode.decode(teachingBytes));
 need(e.schema==="glp.knowledge.editorial.v2"&&e.status==="NONPUBLISHING_DRAFT"&&!Object.hasOwn(e,"occurrences"),"Invalid editorial pack");
 const passages=unique(s.passages),lines=unique(s.occurrences);
 need(e.nodes.every(n=>["concept","word","study","lesson","course"].includes(n.type)),"Editorial pack attempts to define scripture or its attribution");
 const descriptions=new Map();for(const d of e.passageDescriptions){need(passages.has(d.passageId)&&!descriptions.has(d.passageId)&&Object.keys(d).every(k=>["passageId","title","pa","aliases"].includes(k)),"Invalid editorial passage description");descriptions.set(d.passageId,d);}
 need(descriptions.size===passages.size,"Missing passage description");
 for(const n of e.nodes){
  if(n.type==="lesson")exactBindings(n.sourceBindings,n.sourcePassageIds,passages,"passageSha256");
  if(n.type==="word")for(const sense of n.senses)exactBindings(sense.sourceBindings,sense.occurrenceIds,lines,"textSha256");
 }
 for(const edge of e.edges)if(edge.refs)exactBindings(edge.sourceBindings,edge.refs,passages,"passageSha256");
 const sourceNodes=s.passages.map(p=>{const d=descriptions.get(p.id);return {...p,title:lines.get(p.incipitId).text,editorialTitle:d.title,editorialPa:d.pa,aliases:d.aliases};});
 const {passageDescriptions,...rest}=e;
 return {...rest,schema:"glp.knowledge.v1",nodes:[...e.nodes,...s.sourceNodes,s.edition,...sourceNodes],occurrences:s.occurrences,legacyPassageIds:s.legacyPassageIds,legacyOccurrenceIds:s.legacyOccurrenceIds};
}
