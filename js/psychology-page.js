(()=>{'use strict';
const api=window.GLP_MIND_ROOM,full=window.GLP_FULL_JAPJI;
if(!api||!full)return;
const byId=new Map(full.units.flatMap(u=>u.lines.map(l=>[l.id,l])));
const errors=api.validateAgainstCorpus(full.units);
const $=id=>document.getElementById(id);
const el=(name,cl,text)=>{const e=document.createElement(name);if(cl)e.className=cl;if(text!==undefined)e.textContent=text;return e;};
if(errors.length){$('lesson-title').textContent='Source verification needed';$('psych-lesson').setAttribute('aria-disabled','true');return;}
const nav=$('topic-nav');
let current=api.topics[0].id;
function display(topic){
 current=topic.id;
 for(const button of nav.querySelectorAll('button')){const chosen=button.dataset.topic===current;button.setAttribute('aria-pressed',String(chosen));}
 $('lesson-title').textContent=topic.title;$('lesson-sub').textContent=topic.caption;
 $('gurbani-exact').textContent=byId.get(topic.sourceId).text;
 $('gurbani-id').textContent='Original Gurmukhi · '+topic.sourceId+' · Ang '+full.units.find(u=>u.lines.some(l=>l.id===topic.sourceId)).angs.join(', ')+' · Frozen source';
 $('lesson-core').textContent=topic.core;$('lesson-pa').textContent=topic.simplePa;
 $('lesson-scholarly').textContent=topic.scholarly;$('lesson-psych').textContent=topic.psych;
 $('lesson-case').textContent=topic.example;$('lesson-not').textContent='This does not mean: '+topic.notMeans;
 $('lesson-question').textContent=topic.prompt;
 const refs=$('lesson-references');refs.replaceChildren();
 topic.sources.forEach((url,i)=>{const a=el('a','reference','Source '+(i+1)+' ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';refs.append(a);});
}
api.topics.forEach(topic=>{
 const button=el('button','topic-button');
 button.type='button';button.dataset.topic=topic.id;button.setAttribute('aria-pressed','false');
 const punjabi=el('span','topic-small',topic.caption);punjabi.lang='pa';button.append(punjabi,el('strong','',topic.title));
 button.addEventListener('click',()=>{display(topic);$('psych-lesson').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
 nav.append(button);
});
display(api.topics[0]);
const history=$('history-list');
api.history.forEach((item,i)=>{const article=el('article','history-entry');
 article.append(el('p','history-label',item.sub),el('h3','history-title',item.title),el('p','history-body',item.text));
 const a=el('a','history-source','Read source ↗');a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';article.append(a);history.append(article);
});
})();
