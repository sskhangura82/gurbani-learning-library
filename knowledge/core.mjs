// Source-linked, nonpublishing knowledge pilot. Pure local retrieval, not a live interpreter.
const types=new Set(["collection","edition","author","raag","composition","passage","concept","word","study","lesson","course"]);
const editorial=new Set(["discusses","related_concept","psychological_parallel","philosophical_comparison","has_lesson"]);
const relationships={
 written_by:["passage","author"],contains:["composition","passage"],in_raag:["passage","raag"],
 discusses:["passage","concept"],related_concept:["concept","concept"],attested_in:["word","passage"],
 psychological_parallel:["concept","study"],philosophical_comparison:["concept","study"],has_lesson:["concept","lesson"]
};
const require=(ok,message)=>{if(!ok)throw Error(message);};
const nonempty=s=>typeof s==="string"&&!!s.trim();
function unique(items,what){
 const map=new Map();for(const x of items){require(nonempty(x.id)&&!map.has(x.id),"Duplicate/missing "+what+" ID");map.set(x.id,x);}return map;
}
export function buildIndex(g){
 require(g?.schema==="glp.knowledge.v1"&&g.status==="NONPUBLISHING_DRAFT","Not a development knowledge pack");
 require(Array.isArray(g.nodes)&&Array.isArray(g.occurrences)&&Array.isArray(g.edges),"Incomplete knowledge pack");
 const nodes=unique(g.nodes,"node"),occ=unique(g.occurrences,"occurrence");unique(g.edges,"edge");
 const typed=(id,type)=>nodes.get(id)?.type===type;
 const ref=(id,type)=>require(typed(id,type),"Broken "+type+" reference: "+id);
 const passages=g.nodes.filter(n=>n.type==="passage"),used=new Set();
 for(const n of g.nodes){
  require(types.has(n.type),"Unknown node type");
  if(n.type==="edition"){ref(n.collectionId,"collection");require(n.humanCollated===false,"No qualified collation asserted in this pilot");}
  if(n.type==="composition")ref(n.collectionId,"collection");
  if(n.type==="concept"&&n.lessonId){ref(n.lessonId,"lesson");require(nodes.get(n.lessonId).subjectId===n.id,"Wrong lesson subject");}
  if(n.type==="lesson"){
   ref(n.subjectId,"concept");require(Number.isInteger(n.revision)&&n.revision>0&&n.review==="AI_ASSISTED_DRAFT","Invalid lesson review/revision");
   require(Array.isArray(n.sourcePassageIds)&&n.sourcePassageIds.length>0,"Lesson lacks source passages");
   for(const id of n.sourcePassageIds)ref(id,"passage");
   for(const k of ["simple","detailed","deep"])require(nonempty(n[k]?.en)&&nonempty(n[k]?.pa),"Missing bilingual teaching layer");
  }
  if(n.type==="course"){require(Array.isArray(n.orderedLessonIds)&&n.orderedLessonIds.length>0,"Course has no lessons");for(const id of n.orderedLessonIds)ref(id,"lesson");}
  if(n.type==="word"){
   require(n.senses?.length>0,"Word without sense");
   for(const s of n.senses){ref(s.passageId,"passage");require(s.review==="AI_ASSISTED_DRAFT"&&nonempty(s.en)&&nonempty(s.pa)&&nonempty(s.form)&&s.occurrenceIds?.length>0,"Unbound vocabulary sense");
    for(const id of s.occurrenceIds){const o=occ.get(id);require(o?.passageId===s.passageId&&o.text.split(/\s+/u).includes(s.form),"Word sense does not match exact occurrence");}
   }
  }
 }
 for(const p of passages){
  ref(p.collectionId,"collection");ref(p.editionId,"edition");ref(p.authorId,"author");ref(p.compositionId,"composition");if(p.raagId!==null)ref(p.raagId,"raag");
  require(nodes.get(p.editionId).collectionId===p.collectionId&&nodes.get(p.compositionId).collectionId===p.collectionId,"Cross-collection mismatch");
  require(p.review==="DIGITAL_SOURCE_DRAFT"&&p.occurrenceIds?.length>0&&p.occurrenceIds.includes(p.focusId),"Unbound passage");
  let prior=null;for(const id of p.occurrenceIds){const o=occ.get(id);require(o&&o.passageId===p.id&&o.editionId===p.editionId&&o.ang>=p.angStart&&o.ang<=p.angEnd&&nonempty(o.text)&&/^[a-f0-9]{40}$/.test(o.sourceBlob),"Invalid source occurrence");
   require(!used.has(id),"Duplicate source occurrence in passage membership");used.add(id);
   if(prior)require(o.ang>prior.ang||o.ang===prior.ang&&o.ordinal>prior.ordinal,"Source order mismatch");prior=o;
  }
 }
 require(used.size===occ.size,"Orphan source occurrence");
 for(const e of g.edges){
  const a=nodes.get(e.from),b=nodes.get(e.to),sig=relationships[e.type];
  require(a&&b&&sig&&a.type===sig[0]&&b.type===sig[1],"Invalid relationship endpoints");
  if(editorial.has(e.type)){require(e.review==="EDITORIAL_DRAFT"&&nonempty(e.reason)&&Array.isArray(e.refs)&&e.refs.length>0,"Unreviewed or unsupported editorial edge");for(const id of e.refs)ref(id,"passage");}
  else require(e.review==="SOURCE_DRAFT","Source edge status mismatch");
  if(e.type==="psychological_parallel"||e.type==="philosophical_comparison")require(nonempty(e.similarity)&&nonempty(e.difference)&&nonempty(b.reference),"Comparison requires similarity, difference and reference");
  if(e.type==="written_by")require(a.authorId===b.id,"Author edge disagrees with source metadata");
  if(e.type==="contains")require(b.compositionId===a.id,"Composition edge disagrees with source metadata");
  if(e.type==="in_raag")require(a.raagId===b.id,"Raag edge disagrees with source metadata");
 }
 require(g.coverage.qualifiedApproved===0&&g.coverage.originalOccurrences===occ.size&&g.coverage.passageCount===passages.length,"Coverage mismatch");
 return {graph:g,nodes,occ,passages};
}
export function connected(index,id){
 id=resolveIdentity(index,id);if(!id)return [];
 return index.graph.edges.filter(e=>e.from===id||e.to===id).map(e=>({edge:e,node:index.nodes.get(e.from===id?e.to:e.from)}));
}
export function resolveIdentity(index,id){
 if(typeof id!=="string")return null;
 const aliases=index.graph.legacyPassageIds||{},occAliases=index.graph.legacyOccurrenceIds||{};
 const resolved=Object.hasOwn(aliases,id)?aliases[id]:Object.hasOwn(occAliases,id)?occAliases[id]:id;
 return index.nodes.has(resolved)||index.occ.has(resolved)?resolved:null;
}
export function passageLines(index,id){
 const p=index.nodes.get(resolveIdentity(index,id));return p?.type==="passage"?p.occurrenceIds.map(x=>index.occ.get(x)):[];
}
export function wordAt(index,occurrenceId,form){
 return index.graph.nodes.filter(n=>n.type==="word").flatMap(n=>n.senses.filter(s=>s.form===form&&s.occurrenceIds.includes(resolveIdentity(index,occurrenceId))).map(s=>({word:n,sense:s})));
}
export {search} from "./search.mjs";
