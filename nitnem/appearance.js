/* Shared appearance for the private collection and its embedded readers.
 * This preference owns no scripture, reading position, notes or bookmarks.
 * Run in the head so a saved dark choice is applied before the first paint.
 */
(()=>{
'use strict';
const KEY='glp001.nitnem.appearance.v1';
const valid=value=>value==='day'||value==='amrit';
const media=window.matchMedia('(prefers-color-scheme: dark)');
let choice=null,legacyPending=true;
try{
 const saved=localStorage.getItem(KEY);
 if(valid(saved)){choice=saved;legacyPending=false;}
 else if(saved==='system')legacyPending=false;
}catch(_){}
let theme=choice||(media.matches?'amrit':'day');
function render(){
 document.documentElement.dataset.theme=theme;
 document.documentElement.style.colorScheme=theme==='amrit'?'dark':'light';
 if(document.body)document.body.dataset.theme=theme;
 const meta=document.querySelector('meta[name="theme-color"]');
 if(meta)meta.content=theme==='amrit'?(meta.dataset.dark||'#101c25'):(meta.dataset.light||'#faf7ee');
 document.querySelectorAll('[data-appearance]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.appearance===theme)));
 for(const id of ['theme','set-theme']){const select=document.getElementById(id);if(select)select.value=theme;}
}
function notify(){window.dispatchEvent(new CustomEvent('glp:appearance',{detail:{theme}}));}
function set(value,{silent=false}={}){
 if(!valid(value))return false;
 choice=value;theme=value;legacyPending=false;let saved=true;
 try{localStorage.setItem(KEY,value);}catch(_){saved=false;}
 render();notify();
 const status=document.getElementById('appearance-status');
 if(status&&!silent)status.textContent=(theme==='amrit'?'Dark':'Light')+' mode is on.'+(saved?'':' This browser cannot save your choice for next time.');
 return saved;
}
// Carry an existing reader preference forward once, without letting another
// bani or an older learning export replace the new collection-wide choice.
function adoptLegacy(value){
 if(legacyPending){
  legacyPending=false;
  if(valid(value))set(value,{silent:true});
  else{
   // A newly saved reading record may contain today's effective theme. Keep
   // that automatic value from masquerading as a legacy choice next visit.
   try{localStorage.setItem(KEY,'system');}catch(_){}
  }
 }
 return theme;
}
window.GLP_APPEARANCE=Object.freeze({get:()=>theme,set,adoptLegacy});
render();
function connect(){
 render();
 document.querySelectorAll('[data-appearance]').forEach(button=>button.addEventListener('click',()=>set(button.dataset.appearance)));
 const header=document.querySelector('.appearance-header');
 if(header){
  const measure=()=>document.documentElement.style.setProperty('--appearance-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');
  measure();
  if('ResizeObserver' in window)new ResizeObserver(measure).observe(header);
  else window.addEventListener('resize',measure);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',connect,{once:true});else connect();
function followSystem(){if(choice===null){theme=media.matches?'amrit':'day';render();notify();}}
if(media.addEventListener)media.addEventListener('change',followSystem);else media.addListener(followSystem);
window.addEventListener('storage',event=>{
 if(event.key!==KEY&&event.key!==null)return;
 if(event.key===KEY&&event.newValue!==null&&event.newValue!=='system'&&!valid(event.newValue))return;
 legacyPending=false;
 choice=valid(event.newValue)&&event.key!==null?event.newValue:null;
 theme=choice||(media.matches?'amrit':'day');render();notify();
});
})();
