/* The entire library uses its existing root service worker. Updates are explicit. */
(()=>{
 'use strict';let registration=null,requested=false,starting=null;
 let text='Offline reading is not available in this browser.';
 function show(){
  for(const id of ['offline-message','offline-status']){const node=document.getElementById(id);if(node)node.textContent=text;}
  const button=document.getElementById('apply-update');if(button)button.hidden=!registration?.waiting;
 }
 function ready(){
  text=registration?.waiting?'An app update is ready. Load it when you are ready.':registration?.active?'The library is saved for offline reading on this device. Keep a separate learning backup.':'Saving the library for offline reading. Keep this page open until ready.';show();
 }
 async function start(){
  if(starting)return starting;
  if(!('serviceWorker' in navigator)||!isSecureContext){show();return;}
  starting=(async()=>{
   try{
    registration=await navigator.serviceWorker.register(new URL('../sw.js',location.href),{scope:new URL('../',location.href).pathname,updateViaCache:'none'});
    const watch=worker=>worker?.addEventListener('statechange',()=>{
     if(worker.state==='redundant'){text='Offline installation did not finish. Online reading is available; try again when connected.';show();}
     else if(['installed','activated'].includes(worker.state))ready();
    });
    watch(registration.installing);registration.addEventListener('updatefound',()=>watch(registration.installing));ready();
   }catch(_){text='Offline reading could not be prepared. You can continue online and try again later.';show();}
   finally{starting=null;}
  })();return starting;
 }
 document.getElementById('offline-install').addEventListener('click',async()=>{await start();if(registration)try{await registration.update();ready();}catch(_){text='Could not check for an update. Your saved reading is unchanged.';show();}});
 document.getElementById('check-update').addEventListener('click',async()=>{
  if(!registration)await start();
  if(registration)try{await registration.update();ready();}catch(_){text='Could not check for an update. Your saved reading is unchanged.';show();}
 });
 document.getElementById('apply-update').addEventListener('click',async()=>{
  if(!registration?.waiting)return;
  if(window.GLP_BEFORE_UPDATE&&!await window.GLP_BEFORE_UPDATE()){text='Copy any unsaved reflection and export your learning before loading the update.';show();return;}
  requested=true;registration.waiting.postMessage({type:'ACTIVATE_GLP_UPDATE'});
 });
 navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(requested)location.reload();else ready();});
 start();
})();
