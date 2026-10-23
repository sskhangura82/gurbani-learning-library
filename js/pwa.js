/* Static offline shell only. Never caches or uploads learning records. */
(() => {
 'use strict';let updateRequested=false,registration=null,offline='Offline caching is not available in this browser.';
 const message=()=>{if(registration?.active&&!registration?.waiting&&offline.startsWith('An update is ready'))offline='Offline shell is installed. Export learning to keep a durable backup.';const el=document.getElementById('offline-status');if(el)el.textContent=offline;const b=document.getElementById('apply-update');if(b)b.hidden=!registration?.waiting;};
 if('serviceWorker' in navigator&&location.protocol==='https:'){
  navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(r=>{registration=r;offline=r.active?'Offline shell is installed. Export learning to keep a durable backup.':'Offline shell is installing; keep the page open until ready.';message();r.addEventListener('updatefound',()=>{const w=r.installing;w?.addEventListener('statechange',()=>{if(w.state==='installed'){offline=r.active?'An update is ready. Export learning before loading it.':'Offline shell is installed. Device storage is still not a backup.';message();}if(w.state==='activated'){offline='Offline shell is installed. Device storage is still not a backup.';message();}});});}).catch(()=>{offline='Offline cache could not install. Online reading still works.';message();});
 }
 document.addEventListener('click',async e=>{
  if(e.target.closest('[data-action="install"]'))message();
  if(e.target.closest('#check-update')){if(!registration){message();return;}try{await registration.update();offline=registration.waiting?'An update is ready. Export learning before loading it.':'Update check complete. No waiting update is currently available.';}catch{offline='Could not check for updates. Your reading and learning are unchanged.';}message();}
  if(e.target.closest('#apply-update')&&registration?.waiting){updateRequested=true;registration.waiting.postMessage({type:'ACTIVATE_GLP_UPDATE'});}
 });
 let reloading=false;navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(reloading||!updateRequested)return;reloading=true;location.reload();});
})();
