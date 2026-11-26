import {loadKnowledge} from "./registry.mjs";
import {buildIndex,search,connected,passageLines,wordAt,contentKind} from "./core.mjs";
export const PACK_SHA256="c3136d8f170b1ed5623123cd133bf4c3b7d998644801c31a6b21d8a2311dcdaf";
const $=id=>document.getElementById(id);
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const section=$("content"),status=$("status"),results=$("results"),wordDialog=$("word-dialog");
let index,historyStack=[],current=null,depth="simple",returnFocus=null;
const link=(text,url)=>{const a=el("a",text);const u=new URL(url);if(u.protocol!=="https:"||u.username||u.password)throw Error("Unsafe source URL");a.href=u.href;a.target="_blank";a.rel="noopener noreferrer";return a;};
const control=(text,fn)=>{const b=el("button",text);b.type="button";b.addEventListener("click",fn);return b;};
const note=text=>el("p",text,"note");
const kindLabel=n=>contentKind(n)==="scripture"?"Original Gurbani · digital source":contentKind(n)==="source-index"?"Source index":n.type==="study"?"Comparative study · editorial draft":n.type==="word"?"Dictionary entry · editorial draft":n.type==="lesson"?"Lesson · editorial draft":n.type==="course"?"Learning pathway · editorial draft":"Library topic · editorial draft";
const editorialNote=text=>{const p=note(text);p.classList.add("editorial-note");p.dataset.contentKind="editorial";return p;};
const addText=(parent,x)=>{if(!x)return;const copy=el("div",undefined,"editorial-copy");copy.dataset.contentKind="editorial";copy.setAttribute("aria-label","Editorial explanation draft");copy.append(el("p","Editorial explanation · awaiting qualified review","editorial-label"),el("p",x.en));const pa=el("p",x.pa,"editorial-pa");pa.lang="pa";copy.append(pa);parent.append(copy);};
function open(id,remember=true){
 const n=index.nodes.get(id);if(!n)return;
 if(remember&&current&&current!==id)historyStack.push({id:current,scroll:scrollY,depth});current=id;depth="simple";render();
 section.focus({preventScroll:true});section.scrollIntoView({block:"start",behavior:"auto"});
}
function navigateBack(){const x=historyStack.pop();if(!x)return;current=x.id;depth=x.depth;render();section.focus({preventScroll:true});scrollTo(0,x.scroll);}
function row(n,detail){
 const kind=contentKind(n),b=control("",()=>open(n.id));b.className="result result-"+kind;b.dataset.contentKind=kind;
 const title=el("span",n.title||n.id,"result-title "+(kind==="scripture"?"scripture-title":kind==="editorial"?"editorial-title":"source-index-title"));
 if(kind==="scripture")title.lang="pa";
 b.append(el("span",kindLabel(n),"result-kind"),title);
 if(n.pa){const pa=el("span",n.pa,kind==="editorial"?"editorial-pa":"source-index-pa");pa.lang="pa";b.append(pa);}
 const div=el("div");div.append(b);
 if(n.type==="passage"){div.append(note("Ang "+n.angStart+" · "+index.nodes.get(n.authorId).title));if(n.editorialTitle)div.append(editorialNote("Library topic (editorial): "+n.editorialTitle));}
 if(detail)div.append(note(detail));return div;
}
function showWord(occ,form,button){
 const list=wordAt(index,occ,form);if(!list.length)return;
 $("word-title").textContent=form;$("word-body").replaceChildren();
 for(const {word,sense} of list){addText($("word-body"),sense);$("word-body").append(note("Context-specific vocabulary draft. Grammar and pronunciation review pending."),control("Open dictionary entry",()=>{wordDialog.close();open(word.id);}));}
 returnFocus=button;wordDialog.showModal();
}
wordDialog.addEventListener("close",()=>returnFocus?.focus({preventScroll:true}));
$("close-word").addEventListener("click",()=>wordDialog.close());
function render(){
 const n=index.nodes.get(current);section.replaceChildren();if(!n)return;
 const back=control("← Previous learning page",navigateBack);back.disabled=!historyStack.length;section.append(back);
 const kind=contentKind(n);
 section.append(el("p",kindLabel(n)+" · DEVELOPMENT DRAFT","kicker"));
 const heading=el("h2",n.title||n.id,kind==="scripture"?"scripture-title":kind==="editorial"?"editorial-title":"source-index-title");heading.dataset.contentKind=kind;if(n.type==="passage")heading.lang="pa";section.append(heading);
 if(n.type==="passage"&&n.editorialTitle){section.append(editorialNote("Library topic (editorial): "+n.editorialTitle));if(n.editorialPa){const d=editorialNote("ਲਾਇਬ੍ਰੇਰੀ ਦਾ ਵਿਸ਼ਾ (ਸੰਪਾਦਕੀ): "+n.editorialPa);d.classList.add("editorial-pa");d.lang="pa";section.append(d);}}
 if(n.pa){const p=el("p",n.pa,kind==="editorial"?"editorial-pa":"source-index-pa");p.dataset.contentKind=kind;p.lang="pa";section.append(p);}
 if(n.type==="concept"){
  const l=n.lessonId&&index.nodes.get(n.lessonId);
  if(l){const modes=el("div",undefined,"modes");for(const d of ["simple","detailed","deep"]){const b=control({simple:"Simple",detailed:"Detailed",deep:"Deep study"}[d],()=>{depth=d;render();document.querySelector('[data-depth="'+d+'"]')?.focus({preventScroll:true});});b.dataset.depth=d;b.setAttribute("aria-pressed",String(d===depth));modes.append(b);}section.append(modes);addText(section,l[depth]);section.append(note("AI-assisted educational draft, not a translation or scholar-approved lesson."));}
  else section.append(note("Indexed concept only; teaching has not been written."));
 }else if(n.type==="passage"){
  section.append(note(index.nodes.get(n.authorId).title+" · "+index.nodes.get(n.compositionId).title+" · Ang "+n.angStart+" · "+(n.raagId?index.nodes.get(n.raagId).title:"No Raag assigned to this unit")));
  const body=el("div",undefined,"scripture");body.dataset.contentKind="scripture";body.setAttribute("aria-label","Original Gurbani from the pinned digital source");body.lang="pa";
  for(const o of passageLines(index,n.id)){const line=el("p",undefined,"pankti");line.dataset.occurrence=o.id;
   for(const token of o.text.split(/(\s+)/u)){if(!token)continue;const senses=wordAt(index,o.id,token);if(senses.length){const b=control(token,()=>showWord(o.id,token,b));b.className="word";b.lang="pa";line.append(b);}else line.append(document.createTextNode(token));}
   body.append(line);}
  section.append(body,note("Tap underlined words with authored contextual senses. All other words stay in the original line. This is the full selected Salok, not the full Ang."),note(n.comparison),link("Pinned source",n.sourceUrl),document.createTextNode(" · "),link("Second digital witness",n.secondaryUrl));
  section.append(note("No recording is rights-cleared for this pilot. Complete reader deep-link integration is pending; return to this learning page using Previous."));
 }else if(n.type==="word"){
  for(const s of n.senses){section.append(note("Source word · contextual explanation below is an editorial draft"),el("h3",s.form,"source-token"));addText(section,s);section.append(row(index.nodes.get(s.passageId),"Exact word occurrence in this passage"));}
 }else if(n.type==="study"){
  section.append(note("Comparative study — not a literal Gurbani interpretation"),link(n.citation,n.reference));
 }else if(n.type==="course"){
  section.append(note("Draft pathway composed from existing lesson revisions, not duplicated scripture."));
  for(const id of n.orderedLessonIds){const l=index.nodes.get(id);section.append(row(index.nodes.get(l.subjectId),"Lesson revision "+l.revision));}
 }else if(n.type==="lesson"){section.append(note("Versioned education record"));addText(section,n.simple);section.append(row(index.nodes.get(n.subjectId),"Open all three teaching levels"));}
 const edges=connected(index,n.id).filter(({node})=>node.type!=="lesson"&&!(n.type==="word"&&node.type==="passage"));
 if(edges.length){section.append(el("h3","Related knowledge"));
  for(const {edge,node} of edges){const box=el("div",undefined,"connection");box.append(row(node,edge.type.replaceAll("_"," ")));
   if(edge.reason)box.append(editorialNote("Editorial connection: "+edge.reason));if(edge.similarity){const comparison=el("div",undefined,"editorial-copy");comparison.dataset.contentKind="editorial";comparison.setAttribute("aria-label","Editorial comparison, not a Gurbani explanation");comparison.append(el("p","Comparative study · editorial draft","editorial-label"),el("p","Similarity: "+edge.similarity),el("p","Difference: "+edge.difference),note("Editorial comparison awaiting independent and qualified review."));box.append(comparison);}
   section.append(box);}
 }
}
function find(){
 const q=$("query").value,mode=$("mode").value,author=$("author").value;
 results.replaceChildren();const matches=search(index,q,{mode,author});
 status.textContent=matches.length?matches.length+" indexed result"+(matches.length===1?"":"s")+" in this pilot":"No authored result in this pilot. A full scripture search is not installed.";
 for(const hit of matches)results.append(row(index.nodes.get(hit.id),(hit.matchOrigin==="editorial"?"Matched through editorial indexing":"Matched through source indexing")+" · "+hit.reason));
}
async function start(){try{
 const [original,teaching]=await Promise.all([fetch("./scripture.json",{credentials:"same-origin",cache:"no-store"}),fetch("./pilot.json",{credentials:"same-origin",cache:"no-store"})]);if(!original.ok||!teaching.ok||!crypto?.subtle)throw Error("Knowledge data unavailable");
 index=buildIndex(await loadKnowledge(await original.arrayBuffer(),await teaching.arrayBuffer(),PACK_SHA256));for(const n of index.graph.nodes.filter(x=>x.type==="author")){const opt=el("option",n.title);opt.value=n.id;$("author").append(opt);}
 $("search-form").addEventListener("submit",e=>{e.preventDefault();find();});$("browse").replaceChildren(...["concept.humility","concept.haumai","word.haumai","course.human-mind"].map(id=>row(index.nodes.get(id))));
 $("search-button").disabled=false;status.textContent="Development pack verified · three complete Saloks · two topic lessons. Not the full 1,430-Ang library.";current="concept.humility";render();
 }catch(e){status.textContent="Knowledge pack could not be verified. Nothing is displayed.";results.replaceChildren();section.replaceChildren();}}
start();
