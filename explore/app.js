/* GLP Explore pilot: offline-capable static lesson when cached at release; no runtime AI or query transfer. */
(()=>{
"use strict";
const $=id=>document.getElementById(id);
const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const p=(text,cls)=>make("p",cls,text);
let lesson=null,units=[],selected=0,initialised=false;
const report=(message)=>{$("search-feedback").replaceChildren(p(message));};
const safeUrl=(url)=>{try{const u=new URL(url,document.baseURI);if(u.protocol==="https:"&&!u.username&&!u.password)return u.href;}catch(_){ }return null;};
const external=(title,url)=>{const valid=safeUrl(url);if(!valid)return p(title);const a=make("a","",title);a.href=valid;a.target="_blank";a.rel="noopener noreferrer";return a;};
const reveal=(id,fromUser=false)=>{
 if(!lesson)return;
 const index=units.findIndex(u=>u.id===id);
 if(index<0)return;
 selected=index;const u=units[index];
 $("lesson-location").textContent=(u.pauri===null?"OPENING SALOK":"PAURI "+u.pauri)+" · ANG "+u.ang;
 $("lesson-heading").textContent=u.title;
 $("source-cue").textContent=u.cue;
 $("beginner-text").textContent=u.newcomer;
 $("beginner-pa").textContent=u.punjabi;
 $("deep-text").textContent=u.deep;
 $("boundary-text").textContent=u.caution;
 $("reflection-text").textContent=u.prompt;
 $("word-list").replaceChildren();
 for(const w of u.vocabulary){
  const dt=make("dt"),word=make("span","",w.g);word.lang="pa";dt.append(word,document.createTextNode(" · "+w.roman));
  const dd=make("dd","",w.en),translation=make("span","pa",w.pa);translation.lang="pa";dd.append(translation);$("word-list").append(dt,dd);
 }
 $("comparison-list").replaceChildren();
 const comparisons=lesson.comparisons.filter(c=>u.compare.includes(c.id));
 if(!comparisons.length)$("comparison-list").append(p("No direct comparison is proposed for this pauri. That is intentional: not every passage needs an outside framework.","subtle"));
 for(const c of comparisons){
  const card=make("details","connection-card"),summary=make("summary","",c.name),kind=p(c.kind,"kind"),body=make("dl");
  for(const [label,value] of [["Shared question",c.similarity],["Important difference",c.difference],["Ask yourself",c.question]]){body.append(make("dt","",label),make("dd","",value));}
  const source=p("Read the compared text or research:","subtle");source.append(document.createTextNode(" "),external(c.source.title,c.source.url));
  card.append(summary,kind,body,source);$("comparison-list").append(card);
 }
 for(const btn of $("lesson-nav").querySelectorAll("button"))btn.setAttribute("aria-current",String(btn.dataset.unit===id));
 $("previous").disabled=selected===0;$("next").disabled=selected===units.length-1;
 $("previous").textContent=selected===0?"← Previous":"← "+units[selected-1].label;
 $("next").textContent=selected===units.length-1?"End of Ashtpadi":"Next: "+units[selected+1].label+" →";
 if(initialised&&window.history&&window.history.replaceState)history.replaceState(null,"","#"+encodeURIComponent(id));
 if(fromUser){$("lesson").focus({preventScroll:true});$("lesson").scrollIntoView({behavior:"auto",block:"start"});}
};
const prepare=()=>{
 $("study-intro").textContent=lesson.introduction.en;
 for(const u of units){
  const b=make("button","",u.label);b.type="button";b.dataset.unit=u.id;
  b.setAttribute("aria-current","false");b.addEventListener("click",()=>reveal(u.id,true));
  $("lesson-nav").append(b);
 }
 for(const n of lesson.contextualNotes){
  const card=make("section"),heading=make("h4","",n.title),status=p(n.status.replaceAll("_"," ").toLowerCase(),"subtle"),description=p(n.text);
  card.append(heading,status,description,external("Read the historical or textual source",n.source.url));$("context-notes").append(card);
 }
 for(const source of lesson.bibliography){
  const li=make("li");li.append(external(source.title,source.url));
  li.append(make("small","",source.role));$("bibliography").append(li);
 }
 const chooser=$("ashtpadi-select");
 for(let n=1;n<=24;n++){const opt=make("option","",String(n));opt.value=String(n);if(n===17)opt.selected=true;chooser.append(opt);}
 $("ashtpadi-open").addEventListener("click",()=>{
  const n=Number(chooser.value);
  if(n===17){reveal("salok",true);report("Ashtpadi 17 teaching is open. The full original is also available in the linked Sukhmani reader.");}
  else {const target=new URL("../sukhmani.html#ashtpadi-"+n,document.baseURI);report("Ashtpadi "+n+" is available in the complete Sukhmani reading app. Its expanded comparative lesson is not authored yet.");const a=make("a","", "Open Ashtpadi "+n+" in the original reader");a.href=target.href;$("search-feedback").append(a);}
 });
 $("previous").addEventListener("click",()=>{if(selected>0)reveal(units[selected-1].id,true);});
 $("next").addEventListener("click",()=>{if(selected<units.length-1)reveal(units[selected+1].id,true);});
 $("surprise").addEventListener("click",()=>{
  const different=Math.floor(Math.random()*(units.length-1)),next=different>=selected?different+1:different;
  reveal(units[next].id,true);report("A selected teaching from Sukhmani Ashtpadi 17: "+units[next].label+". This is a curated lesson, not randomly generated scripture.");
 });
 const query=$("find-query");
 $("find-form").addEventListener("submit",event=>{event.preventDefault();search(query.value);});
 for(const btn of document.querySelectorAll("[data-query]"))btn.addEventListener("click",()=>{query.value=btn.dataset.query;search(query.value);});
 const requested=decodeURIComponent(location.hash.replace(/^#/,""));
 initialised=true;reveal(units.some(u=>u.id===requested)?requested:"salok");
};
const normal=x=>String(x||"").normalize("NFKC").toLowerCase().trim();
const match=(text,key)=>normal(text).includes(normal(key));
function search(raw){
 if(!lesson)return;
 const q=normal(raw).replace(/[?!.,:;]/g," ").replace(/\s+/g," ").trim();
 if(!q){report("Enter a passage, concept or question, or choose one of the examples.");return;}
 const a=q.match(/(?:ashtpadi|ashtapadi|ashtpadee|ਅਸਟਪਦੀ)\s*#?\s*(\d{1,2})/u);
 if(a&&Number(a[1])>=1&&Number(a[1])<=24&&Number(a[1])!==17){
  const n=Number(a[1]);const msg="Ashtpadi "+n+" is in the complete original Sukhmani reader. This pilot has not authored an expanded lesson for it yet.";
  report(msg);const link=make("a","", "Open Ashtpadi "+n+" in the original reader");link.href="../sukhmani.html#ashtpadi-"+n;$("search-feedback").append(link);return;
 }
 const pauri=q.match(/(?:pauri|pouri|ਪਉੜੀ)\s*(\d)/u);
 if(pauri){const id="pauri-"+pauri[1];if(units.some(x=>x.id===id)){reveal(id,true);report("Showing "+id.replace("-"," ")+" of Sukhmani Ashtpadi 17. Full original text remains one tap away.");return;}}
 if(q.includes("buddh")||q.includes("ਬੁੱਧ")){reveal("pauri-3",true);report("A source-labeled comparison with Dhammapada 183 is available under Connections. This is not a claim that the two traditions teach the same doctrine.");return;}
 if(q.includes("psycholog")||q.includes("anxiety")||q.includes("uncertainty")||q.includes("ਚਿੰਤਾ")){reveal("pauri-5",true);report("A related, not identical, comparison with psychological flexibility appears under Connections.");return;}
 if(q.includes("hukam")||q.includes("ਹੁਕਮ")){reveal("pauri-7",true);report("Showing the Hukam-related passage in Ashtpadi 17. It is one source-linked example, not a full account of Hukam across the scripture.");return;}
 const scored=units.map((u,i)=>{
  const vocab=u.vocabulary.map(v=>v.g+" "+v.roman+" "+v.en).join(" ");
  const tags=u.tags.join(" "),fields=u.title+" "+u.label+" "+vocab;
  let score=0;
  const stop=new Set(["the","what","which","does","how","who","where","why","are","can","for","and","you","about","with","tell","show","this","that","your","from"]);
  for(const word of q.split(" ").filter(x=>x.length>=3&&!stop.has(x))){if(match(tags,word))score+=4;if(match(fields,word))score+=2;}
  if(match(u.title,q)||match(tags,q))score+=8;
  return {index:i,score};
 }).sort((x,y)=>y.score-x.score);
 if(scored[0].score>0){reveal(units[scored[0].index].id,true);report("Found a related written passage in Ashtpadi 17. Verify its full meaning in context; this pilot does not generate a custom answer.");return;}
 if(q.includes("sukhmani")||q.includes("ਸੁਖਮਨੀ")||q.includes("17")||q.includes("ਸਤਾਰ੍ਹ")){reveal("salok",true);report("Opening Sukhmani Ashtpadi 17 at its Salok. Choose any of its eight Pauris.");return;}
 report("We have not authored a checked lesson for that question in this pilot. Your question stays on this device; this page will not invent an answer. Read the original and return to another written topic.");
}
async function start(){
 try{
  const response=await fetch("./lesson-17.json",{credentials:"same-origin"});
  if(!response.ok)throw Error("Lesson file unavailable");
  const x=await response.json();
  if(x.schema!=="glp.source-linked-lesson.v1"||x.composition?.ashtpadi!==17||!Array.isArray(x.units)||x.units.length!==9||!Array.isArray(x.comparisons))throw Error("Lesson contract invalid");
  const ids=["salok",...Array.from({length:8},(_,i)=>"pauri-"+(i+1))];
  if(ids.some((id,i)=>x.units[i]?.id!==id||!x.units[i]?.newcomer||!x.units[i]?.punjabi||!x.units[i]?.deep||!x.units[i]?.caution||!Array.isArray(x.units[i]?.vocabulary)))throw Error("Lesson sequence incomplete");
  lesson=x;units=x.units;prepare();
 }catch(error){
  report("The teaching file did not load. The original Sukhmani reader is still available.");
  $("ashtpadi-select").replaceChildren();
  const link=make("a","", "Open original Sukhmani Sahib");link.href="../sukhmani.html";$("search-feedback").append(link);
  $("study").hidden=true;$("ashtpadi-open").disabled=true;$("surprise").disabled=true;
 }
}
start();
})();