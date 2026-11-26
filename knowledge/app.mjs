import {loadKnowledge} from "./registry.mjs";
import {buildIndex,search,connected,passageLines,wordAt,resolveIdentity} from "./core.mjs";
export const PACK_SHA256="c3136d8f170b1ed5623123cd133bf4c3b7d998644801c31a6b21d8a2311dcdaf";
const $=id=>document.getElementById(id);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const section=$("content"),status=$("status"),results=$("results"),wordDialog=$("word-dialog");
let index,current=null,depth="simple",returnFocus=null;
const link=(text,url)=>{const a=el("a",text);const u=new URL(url);if(u.protocol!=="https:"||u.username||u.password)throw Error("Unsafe source URL");a.href=u.href;a.target="_blank";a.rel="noopener noreferrer";return a;};
const control=(text,fn)=>{const b=el("button",text);b.type="button";b.addEventListener("click",fn);return b;};
const note=text=>el("p",text,"note");
const addText=(parent,x)=>{if(!x)return;parent.append(el("p",x.en));const pa=el("p",x.pa,"pa");pa.lang="pa";parent.append(pa);};
const routeParams=()=>new URLSearchParams(location.hash.slice(1));
let selectedLine=null,navToken=history.state?.glpKnowledgeToken || crypto.randomUUID(),renderedHash=null,scrollTimer;
const scrollPositions=new Map();
function readRoute(){
 if(!location.hash)return {id:"concept.humility",depth:"simple",line:null};
 const p=routeParams();let raw=p.get("item");if(!raw){try{raw=decodeURIComponent(location.hash.slice(1));}catch{return null;}}
 const id=resolveIdentity(index,raw),occ=index.occ.get(id),node=index.nodes.get(occ?.passageId || id);if(!node)return null;
 const requested=p.get("line"),line=requested?resolveIdentity(index,requested):occ?.id || null;
 if(p.has("line") && !line || line && index.occ.get(line)?.passageId!==node.id)return null;
 const d=p.get("depth") || "simple";if(!["simple","detailed","deep"].includes(d))return null;
 return {id:node.id,depth:d,line};
}
function routeHash(route){
 const p=new URLSearchParams({item:route.id});if(route.line)p.set("line",route.line);if(route.depth!=="simple")p.set("depth",route.depth);return "#"+p;
}
function recordScroll(){
 if(history.state?.glpKnowledgeToken===navToken){scrollPositions.set(history.state.entryKey,scrollY);history.replaceState({...history.state,scroll:scrollY},"");}
}
function displayRoute(route,{restoreScroll=null,focus=false}={}){
 current=route?.id || null;depth=route?.depth || "simple";selectedLine=route?.line || null;renderedHash=location.hash;render();
 const target=selectedLine?section.querySelector('[data-occurrence="'+selectedLine+'"]'):section;
 if(focus){target.tabIndex=-1;target.focus({preventScroll:true});}
 requestAnimationFrame(()=>{
  if(restoreScroll!==null)scrollTo(0,restoreScroll);
  else if(focus)(selectedLine?section.querySelector('[data-occurrence="'+selectedLine+'"]'):section)?.scrollIntoView({block:"start",behavior:"auto"});
 });
}
function visit(route){
 clearTimeout(scrollTimer);recordScroll();const step=history.state?.glpKnowledgeToken===navToken?history.state.step:0;
 history.pushState({glpKnowledgeToken:navToken,entryKey:crypto.randomUUID(),step:step+1,scroll:0},"",routeHash(route));scrollPositions.set(history.state.entryKey,0);displayRoute(route,{focus:true});
}
function open(raw){
 const id=resolveIdentity(index,raw),occ=index.occ.get(id),n=index.nodes.get(occ?.passageId || id);if(!n)return;
 visit({id:n.id,depth:"simple",line:occ?.id || null});
}
function navigateBack(){if(history.state?.glpKnowledgeToken===navToken && history.state.step>0){recordScroll();history.back();}}
function followHistory(){
 clearTimeout(scrollTimer);const route=readRoute(),own=history.state?.glpKnowledgeToken===navToken;
 const position=own?(scrollPositions.get(history.state.entryKey) ?? history.state.scroll ?? 0):null;
 if(!own)history.replaceState({glpKnowledgeToken:navToken,entryKey:crypto.randomUUID(),step:0,scroll:0},"");
 displayRoute(route,{restoreScroll:position,focus:true});
}
window.addEventListener("popstate",()=>{if(index)followHistory();});
window.addEventListener("hashchange",()=>{if(index && renderedHash!==location.hash)followHistory();});
window.addEventListener("scroll",()=>{
 if(!index || history.state?.glpKnowledgeToken!==navToken)return;
 scrollPositions.set(history.state.entryKey,scrollY);clearTimeout(scrollTimer);
 scrollTimer=setTimeout(recordScroll,500);
},{passive:true});
window.addEventListener("pagehide",()=>{clearTimeout(scrollTimer);recordScroll();});
window.addEventListener("beforeunload",recordScroll);
function row(n,detail,hit){
 const target=hit?.occurrenceIds?.[0] || n.id;
 const b=control((n.title||n.id)+(n.pa?" · "+n.pa:""),()=>open(target));b.className="result";b.dataset.resultId=n.id;
 if(n.type==="passage")b.lang="pa";const div=el("div");div.append(b);
 if(n.type==="passage"){
  div.append(note("Ang "+n.angStart+" · "+index.nodes.get(n.authorId).title));
  if(n.editorialTitle)div.append(note("Library topic: "+n.editorialTitle));
 }
 if(detail)div.append(note(detail));
 if(hit?.occurrenceIds?.length){const quote=el("p",index.occ.get(hit.occurrenceIds[0]).text,"result-quote");quote.lang="pa";div.append(quote);}
 return div;
}
function showWord(occ,form,button){
 const list=wordAt(index,occ,form);if(!list.length)return;
 $("word-title").textContent=form;$("word-body").replaceChildren();
 for(const {word,sense} of list){addText($("word-body"),sense);$("word-body").append(note("Context-specific vocabulary draft. Grammar and pronunciation review pending."),control("Open dictionary entry",()=>{wordDialog.close();open(word.id);}));}
 returnFocus=button;wordDialog.showModal();
}
wordDialog.addEventListener("close",()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
$("close-word").addEventListener("click",()=>wordDialog.close());
function render(){
 const n=index.nodes.get(current);section.replaceChildren();if(!n){section.append(el("h2","This learning link is unavailable"),note("This link does not identify an item or line in the current pilot."),control("Start exploring",()=>open("concept.humility")));return;}
 const back=control("← Previous learning page",navigateBack);back.disabled=history.state?.glpKnowledgeToken!==navToken || history.state.step<=0;section.append(back);
 section.append(el("p",n.type==="passage"?"GURBANI PASSAGE":n.type.toUpperCase()+" · DEVELOPMENT DRAFT","kicker"));
 const heading=el("h2",n.title||n.id);if(n.type==="passage")heading.lang="pa";section.append(heading);
 if(n.type==="passage"&&n.editorialTitle){section.append(note("Library topic (editorial): "+n.editorialTitle));if(n.editorialPa){const d=note("ਲਾਇਬ੍ਰੇਰੀ ਦਾ ਵਿਸ਼ਾ: "+n.editorialPa);d.lang="pa";section.append(d);}}
 if(n.pa){const p=el("p",n.pa,"pa");p.lang="pa";section.append(p);}
 if(n.type==="concept"){
  const l=n.lessonId&&index.nodes.get(n.lessonId);
  if(l){const modes=el("div",undefined,"modes");for(const d of ["simple","detailed","deep"]){const b=control({simple:"Simple",detailed:"Detailed",deep:"Deep study"}[d],()=>{visit({id:current,depth:d,line:selectedLine});document.querySelector('[data-depth="'+d+'"]')?.focus({preventScroll:true});});b.dataset.depth=d;b.setAttribute("aria-pressed",String(d===depth));modes.append(b);}section.append(modes);addText(section,l[depth]);section.append(note("AI-assisted educational draft, not a translation or scholar-approved lesson."));}
  else section.append(note("Indexed concept only; teaching has not been written."));
 }else if(n.type==="passage"){
  section.append(note(index.nodes.get(n.authorId).title+" · "+index.nodes.get(n.compositionId).title+" · Ang "+n.angStart+" · "+(n.raagId?index.nodes.get(n.raagId).title:"No Raag assigned to this unit")));
  const body=el("div",undefined,"scripture");body.lang="pa";
  for(const o of passageLines(index,n.id)){const line=el("p",undefined,"pankti");line.dataset.occurrence=o.id;if(o.kind==="heading")line.classList.add("source-heading");if(o.id===selectedLine){line.classList.add("selected-line");const label=el("p","Selected line","line-label");label.lang="en";body.append(label);}
   for(const token of o.text.split(/(\s+)/u)){if(!token)continue;const senses=wordAt(index,o.id,token);if(senses.length){const b=control(token,()=>showWord(o.id,token,b));b.className="word";b.lang="pa";line.append(b);}else line.append(document.createTextNode(token));}
   body.append(line);}
  section.append(body,note("Tap underlined words with authored contextual senses. All other words stay in the original line. This is the full selected Salok, not the full Ang."),note(n.comparison),link("Pinned source",n.sourceUrl),document.createTextNode(" · "),link("Second digital witness",n.secondaryUrl));
  section.append(note("No recording is rights-cleared for this pilot. Complete reader deep-link integration is pending; return to this learning page using Previous."));
 }else if(n.type==="author"){
  const count=index.passages.filter(p=>p.authorId===n.id).length;section.append(note(count+" selected passage"+(count===1?"":"s")+" in this pilot. This is not the complete Bani of this author."));
 }else if(n.type==="word"){
  for(const s of n.senses){section.append(el("h3",s.form));addText(section,s);section.append(row(index.nodes.get(s.passageId),"Exact word occurrence in this passage"));}
 }else if(n.type==="study"){
  section.append(note("Comparative study — not a literal Gurbani interpretation"),link(n.citation,n.reference));
 }else if(n.type==="course"){
  section.append(note("Draft pathway composed from existing lesson revisions, not duplicated scripture."));
  for(const id of n.orderedLessonIds){const l=index.nodes.get(id);section.append(row(index.nodes.get(l.subjectId),"Lesson revision "+l.revision));}
 }else if(n.type==="lesson"){section.append(note("Versioned education record"));addText(section,n.simple);section.append(row(index.nodes.get(n.subjectId),"Open all three teaching levels"));}
 const edges=connected(index,n.id).filter(({node})=>node.type!=="lesson"&&!(n.type==="word"&&node.type==="passage"));
 if(edges.length){section.append(el("h3","Related knowledge"));
  for(const {edge,node} of edges){const box=el("div",undefined,"connection");box.append(row(node,edge.type.replaceAll("_"," ")));
   if(edge.reason)box.append(note(edge.reason));if(edge.similarity)box.append(el("p","Similarity: "+edge.similarity),el("p","Difference: "+edge.difference),note("Editorial comparison awaiting independent and qualified review."));
   section.append(box);}
 }
}
function find(){
 const q=$("query").value,mode=$("mode").value,author=$("author").value;
 results.replaceChildren();const matches=search(index,q,{mode,author});
 status.textContent=matches.length?matches.length+" indexed result"+(matches.length===1?"":"s")+" in this pilot":"No indexed result in this pilot. Try an exact topic or author, complete Gurmukhi words, first letters, or an Ang. The full scripture is not indexed here yet.";
 for(const hit of matches)results.append(row(index.nodes.get(hit.id),hit.type+" · "+hit.reason,hit));
}
async function start(){try{
 const [original,teaching]=await Promise.all([fetch("./scripture.json",{credentials:"same-origin",cache:"no-store"}),fetch("./pilot.json",{credentials:"same-origin",cache:"no-store"})]);if(!original.ok||!teaching.ok||!crypto?.subtle)throw Error("Knowledge data unavailable");
 index=buildIndex(await loadKnowledge(await original.arrayBuffer(),await teaching.arrayBuffer(),PACK_SHA256));for(const n of index.graph.nodes.filter(x=>x.type==="author")){const opt=el("option",n.title);opt.value=n.id;$("author").append(opt);}
 $("search-form").addEventListener("submit",e=>{e.preventDefault();find();});$("browse").replaceChildren(...["concept.humility","concept.haumai","author.bhagat-kabir","word.haumai","course.human-mind"].map(id=>row(index.nodes.get(id))));
 $("search-button").disabled=false;status.textContent="Source files checked · three selected Saloks · two topic lessons. Qualified review pending; not the full 1,430-Ang library.";
 const route=readRoute();const previous=history.state;history.scrollRestoration="manual";history.replaceState({glpKnowledgeToken:navToken,entryKey:previous?.entryKey || crypto.randomUUID(),step:previous?.glpKnowledgeToken===navToken?previous.step:0,scroll:previous?.scroll || 0},"",route?routeHash(route):location.href);displayRoute(route,{restoreScroll:previous?.glpKnowledgeToken===navToken && Number.isFinite(previous.scroll)?previous.scroll:null,focus:!!route?.line});
 }catch(e){status.textContent="Knowledge pack could not be verified. Nothing is displayed.";results.replaceChildren();section.replaceChildren();}}
start();
