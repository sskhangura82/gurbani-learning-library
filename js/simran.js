/* Simran Room: optional silence timer, no media, religious instruction, metrics, or persistence. */
(()=>{'use strict';
let minutes=5,remaining=300,running=false,endAt=0,interval=null;
const $=id=>document.getElementById(id);
function show(){const value=Math.max(0,Math.ceil(remaining));$('timer').textContent=String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');}
function stopTick(){if(interval!==null)clearInterval(interval);interval=null;}
function done(){running=false;remaining=0;stopTick();show();$('sit-start').textContent='Begin again';$('sit-stop').hidden=true;$('sit-state').textContent='Your quiet sitting has ended. Nothing was recorded.';}
function tick(){if(!running)return;remaining=Math.max(0,(endAt-Date.now())/1000);show();if(remaining<=0)done();}
function idle(){running=false;stopTick();remaining=minutes*60;show();$('sit-start').textContent='Begin quiet sitting';$('sit-stop').hidden=true;$('sit-state').textContent='Ready. Silence is the default.';}
document.querySelectorAll('[data-minutes]').forEach(b=>b.addEventListener('click',()=>{
minutes=Number(b.dataset.minutes);if(![3,5,10,15].includes(minutes))return;
document.querySelectorAll('[data-minutes]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
idle();
}));
$('sit-start').addEventListener('click',()=>{
if(running){remaining=Math.max(0,(endAt-Date.now())/1000);running=false;stopTick();$('sit-start').textContent='Resume';$('sit-state').textContent='Paused. Your quiet time can continue whenever you choose.';return;}
if(remaining<=0)remaining=minutes*60;
running=true;endAt=Date.now()+remaining*1000;stopTick();interval=setInterval(tick,250);
$('sit-start').textContent='Pause';$('sit-stop').hidden=false;$('sit-state').textContent='Quiet time underway. No sound is playing.';tick();
});
$('sit-stop').addEventListener('click',idle);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){remaining=Math.max(0,(endAt-Date.now())/1000);running=false;stopTick();$('sit-start').textContent='Resume';$('sit-state').textContent='Paused when the page was hidden.';}});
window.addEventListener('pagehide',stopTick);
show();
})();
