/* GLP-001 temporary Full Nitnem launchpad. Original texts are LINKED,
   never copied or implied edition-certified. Completion is optional local-only.
   No tracking, server calls, stored reading notes, or app permissions. */
(() => {
 'use strict';
 const IDs=['japji','jaap','savaiye','chaupai','anand','rehras','sohila'];
 const key='glp001.nitnem-today.progress.v1';
 const onDeviceDate=()=>{
   const now=new Date();
   return [now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
 };
 let memory={date:onDeviceDate(),complete:[]};
 const load=()=>{
   try{
     const raw=localStorage.getItem(key);
     if(!raw)return;
     const parsed=JSON.parse(raw);
     if(parsed&&parsed.date===memory.date&&Array.isArray(parsed.complete))memory.complete=parsed.complete.filter(x=>IDs.includes(x));
   }catch(_){ /* Browser privacy setting: use live-only progress. */ }
 };
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(memory));}catch(_){}};
 const render=()=>{
   const marked=new Set(memory.complete);
   document.querySelectorAll('[data-complete]').forEach(button=>{
     const selected=marked.has(button.dataset.complete);
     button.setAttribute('aria-pressed',String(selected));
     button.firstChild.textContent=selected?'✓ ':'○ ';
     button.querySelector('span').textContent=selected?'Done':'Mark';
     button.setAttribute('aria-label',(selected?'Unmark ':'Mark ')+button.closest('.bani').querySelector('.latin').firstChild.textContent.trim()+(selected?' completed':' complete')+' for today');
   });
   const n=marked.size;
   document.getElementById('progress-label').textContent=n+' of '+IDs.length+' complete';
   document.querySelector('.bar-track').setAttribute('aria-valuenow',String(n));
   document.getElementById('bar-fill').style.width=(n/IDs.length*100)+'%';
 };
 document.querySelectorAll('[data-complete]').forEach(button=>button.addEventListener('click',()=>{
   if(memory.date!==onDeviceDate()){memory={date:onDeviceDate(),complete:[]};}
   const id=button.dataset.complete;
   if(!IDs.includes(id))return;
   memory.complete=memory.complete.includes(id)?memory.complete.filter(x=>x!==id):[...memory.complete,id];
   persist();render();
 }));
 load();render();
})();