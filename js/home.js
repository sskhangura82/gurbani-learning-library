/* Home has no network access and never writes to the reader's saved-learning key. */
(()=>{'use strict';
const KEY='glp001.home.theme';const button=document.getElementById('home-theme');
let theme=null;
try{const saved=localStorage.getItem(KEY);if(saved==='day'||saved==='amrit')theme=saved;
else{const reader=JSON.parse(localStorage.getItem('glp001.continuous.v2')||'null');if(reader?.theme==='day'||reader?.theme==='amrit')theme=reader.theme;}}
catch(_){}
if(!theme)theme=(new Date().getHours()<6||new Date().getHours()>=19)?'amrit':'day';
function apply(){document.body.dataset.theme=theme;document.documentElement.dataset.theme=theme;
 const c=theme==='amrit';button.textContent=c?'☀ Day':'☾ Amrit Vela';button.setAttribute('aria-label',c?'Switch to Day appearance':'Switch to Amrit Vela appearance');button.setAttribute('aria-pressed',String(c));document.querySelector('meta[name="theme-color"]').content=c?'#111a2a':'#f7f2e7';}
button.addEventListener('click',()=>{theme=theme==='amrit'?'day':'amrit';apply();try{localStorage.setItem(KEY,theme);}catch(_){}});
apply();
if('serviceWorker' in navigator&&(location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});}
try{const saved=localStorage.getItem('glp001.continuous.v2');if(saved&&JSON.parse(saved)?.hasGuided)document.getElementById('japji-action').firstChild.textContent='Continue Japji Sahib ';}catch(_){}
})();
