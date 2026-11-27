/* Simran Room: a silent optional boundary, no instruction, media or stored session data. */
(()=>{'use strict';
let minutes=5,remaining=300,running=false,endAt=0,interval=null;
const $=id=>document.getElementById(id);
function showSetup(visible){$('sit-setup').hidden=!visible;}
function stopTick(){if(interval!==null)clearInterval(interval);interval=null;}
function done(){
 running=false;remaining=0;stopTick();showSetup(true);
 $('sit-start').textContent='Begin again';$('sit-stop').hidden=true;
 $('sit-state').textContent='Your quiet sitting has ended. Nothing was recorded.';
}
function tick(){
 if(!running)return;
 remaining=Math.max(0,(endAt-Date.now())/1000);
 if(remaining<=0)done();
}
function idle(){
 running=false;stopTick();remaining=minutes*60;showSetup(true);
 $('chosen-duration').textContent='A quiet boundary of '+minutes+' minutes.';
 $('sit-start').textContent='Begin quiet sitting';$('sit-stop').hidden=true;
 $('sit-state').textContent='Ready. Silence is the default.';
}
function pause(message){
 if(!running)return;
 remaining=Math.max(0,(endAt-Date.now())/1000);running=false;stopTick();
 if(remaining<=0){done();return;}
 $('sit-start').textContent='Resume';$('sit-state').textContent=message;
}
document.querySelectorAll('[data-minutes]').forEach(b=>b.addEventListener('click',()=>{
 const choice=Number(b.dataset.minutes);if(![3,5,10,15].includes(choice))return;
 minutes=choice;
 document.querySelectorAll('[data-minutes]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 idle();
}));
$('sit-start').addEventListener('click',()=>{
 if(running){pause('Paused. Continue whenever you choose.');return;}
 if(remaining<=0)remaining=minutes*60;
 running=true;endAt=Date.now()+remaining*1000;showSetup(false);stopTick();
 interval=setInterval(tick,250);
 $('sit-start').textContent='Pause';$('sit-stop').hidden=false;
 $('sit-state').textContent='Quiet sitting underway. No sound is playing.';
});
$('sit-stop').addEventListener('click',idle);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)pause('Paused while the page was hidden. Continue whenever you choose.');
});
// A history navigation can freeze a document without a final visibility event.
// Keep the controls consistent with the stopped interval when it is restored.
window.addEventListener('pagehide',()=>pause('Paused while you were away. Continue whenever you choose.'));
idle();
})();
