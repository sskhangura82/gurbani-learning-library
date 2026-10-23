/* Browser-local coordination. Locks carry no content and make no network calls. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLP_SHARED_LEARNING=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function create({storage,locks,key,normalise,seed}){
  const supported=!!locks?.request,writeName=key+':write',editName=key+':editor';
  function read(){const raw=storage.getItem(key);if(raw===null)return normalise(seed);const s=JSON.parse(raw);if(!s||typeof s!=='object'||Array.isArray(s)||(s.version!=null&&s.version!==2))throw Error('Saved learning needs recovery or a newer reader. Export a backup.');return normalise(s);}
  function exclusive(fn){if(!supported)return Promise.reject(Error('Safe saving is unavailable in this browser. Export learning before closing.'));return locks.request(writeName,fn);}
  function save(snapshot,edits={}){return exclusive(()=>{
   const latest=read(),next=normalise(snapshot);next.notes={...latest.notes,...edits.notes};
   const marks=new Set(latest.bookmarks);for(const [id,on] of Object.entries(edits.bookmarks||{}))on?marks.add(id):marks.delete(id);next.bookmarks=[...marks];
   storage.setItem(key,JSON.stringify(next));return next;
  });}
  function lease(){
   if(!supported)return Promise.resolve({available:false,reason:'Safe editing is unavailable in this browser. Reading and export still work.'});
   return new Promise((resolve,reject)=>{locks.request(editName,{ifAvailable:true},lock=>{
    if(!lock){resolve({available:false,reason:'A reflection is open in another tab. Close it there, then try again.'});return;}
    return new Promise(release=>resolve({available:true,release}));
   }).catch(reject);});
  }
  async function importWith(fn){const permit=await lease();if(!permit.available)throw Error(permit.reason);try{return await exclusive(fn);}finally{permit.release();}}
  return {read,save,lease,importWith,supported};
 }
 return Object.freeze({create});
});
