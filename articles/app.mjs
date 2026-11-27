// Source sheets have no saved state and accept no exposition. Rendering starts
// only after the whole catalog and all canonical source packages resolve.
const $=id=>document.getElementById(id);
const page=document.body.dataset.page;
let ready=false;
const element=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
function sourceWord(text){const node=element('span','source-word',text);node.lang='pa';return node;}
function fail(){
 ready=false;
 for(const id of ['article-content','index-content']){const node=$(id);if(node){node.hidden=true;if(id==='article-content')node.replaceChildren();}}
 if($('topic-list'))$('topic-list').replaceChildren();
 if($('print-article'))$('print-article').disabled=true;
 $('article-loading').hidden=true;
 $('article-error').hidden=false;
 document.documentElement.dataset.sourceState='unavailable';
}
async function bytes(relative){
 const url=new URL(relative,import.meta.url);
 if(url.origin!==location.origin)throw new Error('Unsupported source origin');
 const response=await fetch(url,{credentials:'omit',redirect:'error',cache:'no-store'});
 if(!response.ok)throw new Error('Source file unavailable');
 return response.arrayBuffer();
}
function normalizeWords(value){
 // Search normalization applies to navigation labels only, never scripture.
 return value.normalize('NFKC').replace(/\p{Cf}/gu,'').toLocaleLowerCase('en').split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
}
function renderIndex(catalog){
 const fragment=document.createDocumentFragment();
 for(const topic of catalog.topics){
  for(const articleId of topic.articleIds){
   const article=catalog.articles.find(item=>item.id===articleId);
   const card=element('a','topic-card');card.dataset.articleId=article.id;card.dataset.topicId=topic.id;card.href='article.html?id='+encodeURIComponent(article.id);
   card.append(element('span','card-kicker','LIBRARY TOPIC · SOURCE WORD MATCH'));
   const title=element('h3','',topic.label);title.append(document.createTextNode(' '),sourceWord(article.selection.token));card.append(title);
   const ref=article.references[0];
   card.append(element('p','',ref.label));
   card.append(element('p','', 'Complete Salok · Explanation awaiting qualified review'));
   card.append(element('span','card-action','Open source sheet →'));
   fragment.append(card);
  }
 }
 $('topic-list').replaceChildren(fragment);
 const input=$('article-search');input.value=new URL(location.href).searchParams.get('q')||'';
 const filter=()=>{
  const words=normalizeWords(input.value);let count=0;
  for(const topic of catalog.topics){
   const topicArticles=catalog.articles.filter(item=>item.topicId===topic.id);
   const allowed=new Set([topic.label,...topic.searchTerms,...topicArticles.map(item=>item.selection.token)].flatMap(normalizeWords));
   const visible=!input.value.trim()||(words.length>0&&words.every(word=>allowed.has(word)));
   for(const card of $('topic-list').children){if(card.dataset.topicId===topic.id){card.hidden=!visible;if(visible)count++;}}
  }
  $('no-results').hidden=count!==0;
  $('search-status').textContent=count===1?'1 source reading sheet':count+' source reading sheets';
  const url=new URL(location.href);if(input.value.trim())url.searchParams.set('q',input.value.trim());else url.searchParams.delete('q');
  history.replaceState(null,'',url);
 };
 input.addEventListener('input',filter);
 $('topic-search-form').addEventListener('submit',event=>{event.preventDefault();filter();});
 filter();$('index-content').hidden=false;
}
function appendRegister(list,title,text){list.append(element('dt','',title),element('dd','',text));}
function renderArticle(catalog){
 const articleId=new URL(location.href).searchParams.get('id');
 const article=catalog.articles.find(item=>item.id===articleId);
 if(!article)throw new Error('Unknown source sheet');
 const topic=catalog.topics.find(item=>item.id===article.topicId);
 const fragment=document.createDocumentFragment();
 for(const ref of article.references){
  const pair=element('div','pair');pair.dataset.referenceId=ref.id;
  const verse=element('div','verse');
  for(const line of ref.lines){const row=element('p','gur source-line',line.text);row.lang='pa';row.dataset.lineId=line.id;verse.append(row);}
  pair.append(verse);
  pair.append(element('p','cite',ref.label));
  pair.append(element('p','cite attribution',ref.attributionLabel));
  pair.append(element('p','basis',ref.sectionLabel+'. Source reference checked against the selected digital edition; qualified review is pending.'));
  const link=element('a','reader-link','Open this Salok in the reader →');link.href=ref.readerPath;pair.append(link);
  const slot=element('div','slot explanation-slot');slot.dataset.reviewStatus='AWAITING_QUALIFIED_REVIEW';
  slot.append(element('span','who','Explanation · Awaiting qualified review'),element('p','','No explanation has been written. This space remains empty until qualified content is available.'));
  pair.append(slot);fragment.append(pair);
 }
 const register=document.createDocumentFragment();
 for(const ref of article.references){
  appendRegister(register,'Gurmukhi source',ref.sourceRegister.label+'. '+ref.sourceRegister.verificationScope);
  appendRegister(register,'Source lineage',ref.sourceRegister.upstreamLineage);
  appendRegister(register,'Source edition',ref.sourceRegister.editionId+'. Reference registered '+ref.sourceRegister.registeredOn+'.');
  appendRegister(register,'Stable reference',ref.id);
  register.append(element('dt','','Pinned upstream source'));
  const upstream=element('dd','source-edition');
  const sourceLink=element('a','',ref.sourceRegister.repository+' @ '+ref.sourceRegister.commit);
  sourceLink.href='https://github.com/'+ref.sourceRegister.repository+'/tree/'+ref.sourceRegister.commit;
  sourceLink.rel='noopener noreferrer';upstream.append(sourceLink);register.append(upstream);
 }
 appendRegister(register,'What the reference check establishes','The displayed passage resolves to the selected source edition. This does not establish the meaning of an explanation, the completeness of a topic selection, or qualified approval.');
 appendRegister(register,'Passage location','The composition and Salok number identify the passage here. No Ang number is presented as an independently established locator. Printed-page collation remains outstanding.');
 appendRegister(register,'Topic selection','A literal source-word match. The selection is an editorial example awaiting qualified review, not a complete thematic collection.');
 appendRegister(register,'Explanation and review','No explanation, translation or comparison has been added to this sheet. No qualified reviewer is recorded.');
 appendRegister(register,'Material and permissions','Only the original scripture from the existing source package is displayed. No modern article, commentary or translation has been reproduced. Permission for outside articles remains pending.');
 appendRegister(register,'Printing','Each current passage, citation, source note and empty explanation space is grouped for printing. Page layout is designed for A4 and US Letter; your print settings can affect pagination. Copying Gurmukhi from a saved PDF can change characters in some viewers. Use the reader for the original text.');
 $('article-title').textContent=topic.label;$('article-title').append(document.createTextNode(' '),sourceWord(article.selection.token));
 $('article-subtitle').textContent='Source reading sheet · '+article.references[0].label;
 const selection=element('span','','The exact source word ');selection.append(sourceWord(article.selection.token),document.createTextNode(' occurs in the Salok below. The full Salok is included. The topic selection awaits qualified review.'));
 $('selection-basis').replaceChildren(selection);
 $('passages').replaceChildren(fragment);$('source-register-list').replaceChildren(register);
 $('article-content').dataset.articleId=article.id;$('article-content').hidden=false;
 document.title=topic.label+' · Source reading sheet · Gurbani Learning Library';
 $('print-article').disabled=false;
}
$('retry-load')?.addEventListener('click',()=>location.reload());
$('print-article')?.addEventListener('click',()=>{if(ready)window.print();});
try{
 const expected=page==='index'?'editorial-source-index':page==='article'?'source-reading-sheet':null;
 if(!expected||document.documentElement.dataset.contentLayer!==expected)throw new Error('Unsupported content layer');
 const [{loadArticleCatalog},{SOURCE_CONTRACTS}]=await Promise.all([import('./core.mjs'),import('./source-contracts.mjs')]);
 const catalog=await loadArticleCatalog(await bytes('catalog.json'),sourceId=>{
  if(!Object.hasOwn(SOURCE_CONTRACTS,sourceId))throw new Error('Unsupported source');
  return bytes(SOURCE_CONTRACTS[sourceId].path);
 });
 if(page==='index')renderIndex(catalog);else renderArticle(catalog);
 ready=true;$('article-loading').hidden=true;document.documentElement.dataset.sourceState='ready';
}catch{fail();}
