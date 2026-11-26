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
const norm=s=>String(s??"").normalize("NFC").toLowerCase().trim().replace(/\s+/gu," ");
const digits=s=>s.replace(/[੦-੯]/gu,c=>String("੦੧੨੩੪੫੬੭੮੯".indexOf(c)));
const names=n=>[n.title,n.pa,...(n.aliases||[])].filter(nonempty);
export function connected(index,id){
 return index.graph.edges.filter(e=>e.from===id||e.to===id).map(e=>({edge:e,node:index.nodes.get(e.from===id?e.to:e.from)}));
}
export function passageLines(index,id){
 const p=index.nodes.get(id);return p?.type==="passage"?p.occurrenceIds.map(x=>index.occ.get(x)):[];
}
export function wordAt(index,occurrenceId,form){
 return index.graph.nodes.filter(n=>n.type==="word").flatMap(n=>n.senses.filter(s=>s.form===form&&s.occurrenceIds.includes(occurrenceId)).map(s=>({word:n,sense:s})));
}
export function search(index,query,{mode="auto",author="",type="",collection=""}={}){
 const q=norm(query);if(!q||q.length>240)return [];
 const dq=digits(q),ang=dq.match(/^(?:ang\s*|ਅੰਗ\s*)?(\d{1,4})$/u);
 const matches=new Map();
 const add=(n,score,reason)=>{if(!n)return;const prev=matches.get(n.id);if(!prev||score>prev.score)matches.set(n.id,{id:n.id,type:n.type,title:n.title,score,reason});};
 const words=q.split(" ").filter(w=>w.length>=3&&!["the","what","does","why","how","about","please","teach","sikh","gurbani"].includes(w));
 for(const n of index.graph.nodes){
  if(mode==="first-letter"||mode==="phrase"||ang)continue;
  for(const label of names(n)){const t=norm(label);if(t===q)add(n,100,"Exact title or curated alias");else if(t.length>=3&&q.includes(t))add(n,80,"Curated alias in query");else if(words.some(w=>t===w))add(n,70,"Exact indexed term");}
 }
 for(const p of index.passages){
  if(ang){const x=Number(ang[1]);if(x>=p.angStart&&x<=p.angEnd)add(p,100,"Ang match");continue;}
  const lines=passageLines(index,p.id);
  if(mode==="first-letter"){
   for(const o of lines){const initials=o.text.split(/\s+/u).filter(x=>/^[\u0a00-\u0a7f]/u.test(x)).map(x=>[...x][0]).join("");if(initials.startsWith(q.replace(/\s/g,"")))add(p,100,"First letters of a source row");}
  }else if(mode==="phrase"||/[\u0a00-\u0a7f]/u.test(q)){if(lines.some(o=>norm(o.text).includes(q)))add(p,95,"Exact original text substring (search normalization only)");}
 }
 if(mode==="auto"&&!ang){
  for(const m of [...matches.values()]){
   const n=index.nodes.get(m.id);
   for(const {edge,node} of connected(index,m.id)){
    if(node.type==="passage"&&["discusses","written_by","contains","attested_in","in_raag"].includes(edge.type))add(node,Math.max(35,m.score-20),edge.type+" · "+n.title);
   }
  }
 }
 return [...matches.values()].filter(r=>{
  const n=index.nodes.get(r.id);
  if(type&&n.type!==type)return false;
  if(author&&(n.type!=="passage"||n.authorId!==author))return false;
  if(collection&&(n.type!=="passage"||n.collectionId!==collection))return false;
  return true;
 }).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
