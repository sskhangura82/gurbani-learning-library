/* Navigation metadata only. Scripture and private learning stay in their owning readers. */
import {READERS,COLLECTIONS,EXPLORE,TOOLS,PLANNED} from './catalog.mjs';
import {parseView,searchEntries,getReader} from './core.mjs';
import {setupPassageSearch} from './passage-ui.mjs';
let passageSearch;

const $=id=>document.getElementById(id);
const labels={today:'Today',read:'Read',explore:'Explore',saved:'Saved'};
const node=(tag,text,className)=>{
 const e=document.createElement(tag);if(text!==undefined&&text!==null)e.textContent=text;if(className)e.className=className;return e;
};
function appendText(parent,tag,text,className,lang){
 if(!text)return;const e=node(tag,text,className);if(lang)e.lang=lang;parent.append(e);return e;
}
function checkedHref(href){
 if(typeof href!=='string'||!href||href.startsWith('/')||href.includes('\\'))throw Error('A library destination is unavailable.');
 const url=new URL(href,new URL('../',import.meta.url));
 const base=new URL('../',import.meta.url);
 if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))throw Error('A library destination is outside this reading library.');
 return href;
}
function readingCard(reader){
 const a=node('a',null,'directory-card');a.href=checkedHref(reader.href);a.dataset.readerId=reader.id;
 appendText(a,'span',reader.group==='nitnem'?'DAILY NITNEM':'ADDITIONAL READING','card-group');
 appendText(a,'h2',reader.title);
 appendText(a,'span',reader.titlePa,'title-pa','pa');
 appendText(a,'p',reader.summary,'card-summary');
 appendText(a,'span',reader.reviewLabel,'card-review');
 appendText(a,'span','Open the reader →','card-action');
 return a;
}
function savedCard(reader){
 const a=node('a',null,'saved-card');a.href=checkedHref(reader.savedHref);a.dataset.savedReader=reader.id;
 appendText(a,'h2',reader.title);
 appendText(a,'span',reader.titlePa,'title-pa','pa');
 appendText(a,'span','Open saved learning →','card-action');
 a.setAttribute('aria-label','Open saved learning for '+reader.title);
 return a;
}
function exploreCard(entry){
 const a=node('a',null,'directory-card explore-card');a.href=checkedHref(entry.href);a.dataset.exploreId=entry.id;
 const label=entry.id==='gurdwaras'?'PLACES DIRECTORY':entry.id==='source-sheets'?'SOURCE READING SHEETS':'LIBRARY TOPIC · SOURCE WORD MATCH';
 appendText(a,'span',label,'card-group');
 appendText(a,'h2',entry.title);
 appendText(a,'p',entry.summary,'card-summary');
 appendText(a,'span',entry.reviewLabel,'card-review');
 appendText(a,'span','Open →','card-action');
 return a;
}
function toolCard(entry){
 const a=node('a',null,'tool-card');a.href=checkedHref(entry.href);a.dataset.toolId=entry.id;
 appendText(a,'span',entry.id==='simran'?'SIMRAN · SILENT SPACE':'SEPARATE PHYSIOLOGY TOOL','entry-kind');
 appendText(a,'h3',entry.title);
 appendText(a,'p',entry.summary);
 return a;
}
function plannedItem(entry){
 const box=node('article',null,'planned-item');box.dataset.plannedId=entry.id;
 appendText(box,'h3',entry.title);
 appendText(box,'p',entry.summary||entry.reason||'In development; not available in this preview.');
 appendText(box,'span','NOT AVAILABLE YET','availability-label');
 return box;
}
function oneParam(params,key,max=120){
 const values=params.getAll(key);return values.length===1?values[0].slice(0,max):'';
}
function updateDirectoryUrl(){
 const url=new URL(location.href);url.searchParams.set('view','read');
 const q=$('library-search').value.trim(),filter=$('read-filter').value;
 if(q)url.searchParams.set('q',q);else url.searchParams.delete('q');
 if(filter!=='all')url.searchParams.set('collection',filter);else url.searchParams.delete('collection');
 history.replaceState(history.state,'',url);
}
function renderRead({writeUrl=false}={}){
 const query=$('library-search').value,filter=$('read-filter').value;
 const candidates=filter==='all'?READERS:READERS.filter(r=>r.group===filter);
 const matches=searchEntries(query,candidates);
 $('reader-list').replaceChildren(...matches.map(readingCard));
 $('read-empty').hidden=matches.length>0;
 $('clear-library-search').hidden=query.length===0;
 $('read-count').textContent=matches.length+' '+(matches.length===1?'reading':'readings')+(filter==='nitnem'?' in Daily Nitnem':filter==='additional'?' outside the Nitnem group':' available');
 if(writeUrl)updateDirectoryUrl();
}
function openView(){
 const view=parseView(location.search);
 document.documentElement.dataset.libraryView=view;
 document.title=labels[view]+' · Gurbani Learning Library';
 for(const a of document.querySelectorAll('.library-nav a[data-view]')){
  if(a.dataset.view===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 }
 for(const panel of document.querySelectorAll('[data-view-panel]'))panel.hidden=panel.dataset.viewPanel!==view;
 const params=new URLSearchParams(location.search),filter=oneParam(params,'collection',24);
 $('library-search').value=oneParam(params,'q');
 $('read-filter').value=['all','nitnem','additional'].includes(filter)?filter:'all';
 renderRead();
 if(view==='explore')passageSearch?.activate();
}
try{
 if(READERS.length!==10||new Set(READERS.map(r=>r.id)).size!==READERS.length)throw Error('The reading directory is incomplete.');
 const nitnem=COLLECTIONS.find(c=>c.id==='nitnem');
 if(!nitnem||nitnem.readerIds.length!==7||new Set(nitnem.readerIds).size!==7||nitnem.readerIds.some(id=>!getReader(id)))throw Error('The Nitnem directory is incomplete.');
 for(const a of document.querySelectorAll('[data-open-reader]')){
  const reader=getReader(a.dataset.openReader);if(!reader)throw Error('A reading shortcut is unavailable.');
  a.href=checkedHref(reader.href);
 }
 $('saved-list').replaceChildren(...READERS.map(savedCard));
 $('explore-list').replaceChildren(...EXPLORE.map(exploreCard));
 $('today-tools').replaceChildren(...TOOLS.map(toolCard));
 $('planned-list').replaceChildren(...PLANNED.map(plannedItem));
 passageSearch=setupPassageSearch();
 openView();
 $('library-search-form').addEventListener('submit',e=>{e.preventDefault();renderRead({writeUrl:true});});
 $('library-search').addEventListener('input',()=>renderRead({writeUrl:true}));
 $('read-filter').addEventListener('change',()=>renderRead({writeUrl:true}));
 $('clear-library-search').addEventListener('click',()=>{$('library-search').value='';renderRead({writeUrl:true});$('library-search').focus();});
 $('reset-library-search').addEventListener('click',()=>{$('library-search').value='';$('read-filter').value='all';renderRead({writeUrl:true});$('library-search').focus();});
 window.addEventListener('popstate',openView);
 $('library-loading').hidden=true;
 document.documentElement.dataset.libraryState='ready';
}catch(error){
 for(const panel of document.querySelectorAll('[data-view-panel]'))panel.hidden=true;
 $('library-loading').hidden=true;
 $('library-error').hidden=false;
 $('library-error').replaceChildren(node('p','The library directory could not open. Your readers and saved learning have not been changed.'));
 const link=node('a','Open Japji Sahib directly');link.href='full-japji.html';$('library-error').append(link);
 document.documentElement.dataset.libraryState='unavailable';
}
