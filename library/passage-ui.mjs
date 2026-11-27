import {loadCompletePassages,searchCompletePassages} from './passages.mjs';
const $=id=>document.getElementById(id);
const element=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
const MODES=['phrase','first-letter','first-letter-anywhere'];
// The existing worker returns the same pinned bytes from its versioned cache URL.
// Permit only that one transport marker; complete byte digests remain mandatory.
export function sourceResponseUrlMatches(requested,actual){
 if(!actual)return true;
 try{
  const expected=new URL(requested),received=new URL(actual);
  if(expected.search||expected.hash||received.origin!==expected.origin||received.pathname!==expected.pathname||received.username||received.password||received.hash)return false;
  if(!received.search)return true;
  const entries=[...received.searchParams];
  return entries.length===1&&entries[0][0]==='glp_release'&&/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,95}$/.test(entries[0][1]);
 }catch{return false;}
}
async function localBytes(relative,limit){
 const base=new URL('../',import.meta.url),url=new URL(relative,base);
 if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||url.search||url.hash)throw Error('SOURCE_PATH');
 const response=await fetch(url.href,{credentials:'omit',redirect:'error',cache:'no-store'});
 if(!response.ok||response.redirected||!sourceResponseUrlMatches(url.href,response.url))throw Error('SOURCE_UNAVAILABLE');
 const size=Number(response.headers.get('content-length'));if(Number.isFinite(size)&&size>limit)throw Error('SOURCE_SIZE');
 const reader=response.body?.getReader();if(!reader)throw Error('SOURCE_STREAM');
 const chunks=[];let total=0;
 try{for(;;){const part=await reader.read();if(part.done)break;total+=part.value.byteLength;if(total>limit){await reader.cancel();throw Error('SOURCE_SIZE');}chunks.push(part.value);}}finally{reader.releaseLock();}
 const raw=new Uint8Array(total);let offset=0;for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.byteLength;}return raw;
}
function fragment(){
 const p=new URLSearchParams(location.hash.slice(1));
 if(p.getAll('gurbani').length!==1||p.getAll('mode').length!==1||[...p.keys()].some(k=>!['gurbani','mode'].includes(k)))return {query:'',mode:'phrase'};
 const query=p.get('gurbani'),mode=p.get('mode');return [...query].length<=240&&MODES.includes(mode)?{query,mode}:{query:'',mode:'phrase'};
}
function rememberAddress(query,mode){
 const url=new URL(location.href);url.hash=query?new URLSearchParams({gurbani:query,mode}).toString():'';history.replaceState(history.state,'',url);
}
function resultCard(hit){
 const {passage,matchedLineIds}=hit,article=element('article',undefined,'passage-result');article.dataset.passageId=passage.id;
 article.append(element('p','LIBRARY REFERENCE · COMPLETE SOURCE PASSAGE','section-kicker'),element('h3',passage.routes[0].label));
 const original=element('div',undefined,'passage-original');original.lang='pa';original.setAttribute('aria-label','Complete original Gurbani');
 for(const line of passage.lines){const p=element('p',line.text,line.kind==='heading'?'passage-heading':'passage-line');p.dataset.sourceOccurrence=line.id;if(matchedLineIds.includes(line.id)){p.classList.add('passage-match');const tag=element('span','Matched line','match-label');tag.lang='en';p.append(tag);}original.append(p);}
 article.append(original,element('p','Complete digital-source match · awaiting qualified review.','card-review'));
 const links=element('div',undefined,'passage-links');
 for(const route of passage.routes){const a=element('a',route.sourceId==='knowledge'?'Open this passage in Knowledge →':'Open the complete Salok in its reader →');a.href=route.href;a.dataset.sourceUnit=route.unitId;links.append(a);}
 article.append(links);
 if(passage.witness.discrepancyIds.length)article.append(element('p','This source occurrence has a documented locator or heading difference. Review it in the source record.','passage-warning'));
 return article;
}
export function setupPassageSearch(){
 let catalog=null,loading=null,limit=20;
 function show(){
  if(!catalog)return;
  const query=$('passage-query').value.trim(),mode=$('passage-mode').value;
  $('passage-results').replaceChildren();$('passage-more').hidden=true;
  if(!query){$('passage-search-status').textContent='Ready: '+catalog.uniqueCompletePassages+' complete passages are connected to their source readers.';return;}
  const result=searchCompletePassages(catalog,query,{mode});
  if(!result.supported){$('passage-search-status').textContent='Enter original Gurmukhi words or their first letters. English topics are available in the topic cards below.';return;}
  $('passage-results').replaceChildren(...result.matches.slice(0,limit).map(resultCard));
  $('passage-search-status').textContent=result.total?('Showing '+Math.min(limit,result.total)+' of '+result.total+' complete '+(result.total===1?'passage.':'passages.')):'No complete passage matches in these connected collections. The remaining library is still being connected.';
  $('passage-more').hidden=result.total<=limit;
 }
 async function activate(){
  const selected=fragment();$('passage-query').value=selected.query;$('passage-mode').value=selected.mode;limit=20;
  if(catalog){show();return;}
  if(loading)return loading;
  $('passage-search-status').textContent='Checking the complete source packages…';$('passage-submit').disabled=true;
  loading=loadCompletePassages(localBytes).then(value=>{
   catalog=value;$('passage-submit').disabled=false;$('passage-source-status').textContent=value.uniqueCompletePassages+' complete passages · '+value.sourceUnits+' source views'+(value.withheld.length?' · '+value.withheld.length+' units withheld':'');show();
  }).catch(()=>{
   $('passage-search-status').textContent='These source packages could not be checked. Search results have been withheld. Use Read to open a reader.';
   $('passage-results').replaceChildren();$('passage-submit').disabled=true;loading=null;
  });
  return loading;
 }
 $('passage-search-form').addEventListener('submit',event=>{event.preventDefault();limit=20;rememberAddress($('passage-query').value.trim(),$('passage-mode').value);show();});
 $('passage-clear').addEventListener('click',()=>{$('passage-query').value='';limit=20;rememberAddress('','phrase');show();$('passage-query').focus();});
 $('passage-more').addEventListener('click',()=>{limit+=20;show();});
 window.addEventListener('hashchange',()=>{if(document.documentElement.dataset.libraryView==='explore')activate();});
 return {activate};
}
