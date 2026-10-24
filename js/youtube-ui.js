/* GLP-001 YouTube beta: visible official player. No media extraction, no timing claims. */
(() => {
 'use strict';
 const api=window.GLP_YOUTUBE_BRIDGE;
 const panel=document.getElementById('youtube-panel');
 if(!api||!panel)return;
 const $=id=>document.getElementById(id);
 let player=null,interval=null,videoId=null,sequence=0;
 let apiPromise=null,dialogHidden=false;
 const showStatus=text=>{$('youtube-status').textContent=text;};
 function chooserHtml(){
  return '<div class="yt-chooser">'+
   '<p>Choose a video to hear while you read. Play it using the visible YouTube controls.</p>'+
   '<label for="youtube-query" class="yt-label">Find a recitation</label>'+
   '<div class="yt-search-row"><input id="youtube-query" type="search" value="Japji Sahib full paath" autocomplete="off" aria-label="Search YouTube for a Gurbani recording"><button type="button" id="youtube-search">Search YouTube ↗</button></div>'+
   '<p class="plain-note">Search on YouTube, then paste the video link below. In-app search is planned.</p>'+
   '<label for="youtube-url" class="yt-label">Paste a YouTube video link</label>'+
   '<input id="youtube-url" type="url" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="https://www.youtube.com/watch?v=…" aria-describedby="youtube-chooser-note">'+
   '<p id="youtube-chooser-note" class="plain-note">Only after Load: YouTube is contacted; its full player and ads remain visible.</p>'+
   '<button type="button" class="primary" data-action="youtube-load">Load visible YouTube player</button>'+
   '<p id="youtube-error" role="alert" class="yt-error" hidden></p>'+
   '<p class="plain-note"><strong>Not synchronized yet.</strong> Word highlighting follows your separate manual reading guide until this recording has a checked timing map.</p>'+
   '</div>';
 }
 function loadApi(){
  if(window.YT&&typeof window.YT.Player==='function')return Promise.resolve(window.YT);
  if(apiPromise)return apiPromise;
  apiPromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   const timeout=setTimeout(()=>{apiPromise=null;reject(new Error('The YouTube player could not load. Open the video on YouTube instead.'));},12000);
   const previous=window.onYouTubeIframeAPIReady;
   window.onYouTubeIframeAPIReady=()=>{
    try{if(typeof previous==='function')previous();}catch(_){}
    clearTimeout(timeout);resolve(window.YT);
   };
   script.onerror=()=>{clearTimeout(timeout);apiPromise=null;reject(new Error('YouTube player unavailable on this connection.'));};
   script.src='https://www.youtube.com/iframe_api';script.async=true;
   document.head.appendChild(script);
  });
  return apiPromise;
 }
 function stopClock(){if(interval!==null){clearInterval(interval);interval=null;}}
 function tick(){
  try{if(player&&typeof player.getCurrentTime==='function')$('youtube-video-clock').textContent=api.formatTime(player.getCurrentTime());}
  catch(_){}
 }
 function pause(){
  try{if(player&&typeof player.pauseVideo==='function')player.pauseVideo();}catch(_){}
  stopClock();
 }
 function close(){
  sequence++;
  pause();
  try{if(player&&typeof player.destroy==='function')player.destroy();}catch(_){}
  player=null;videoId=null;
  $('youtube-player-host').replaceChildren();
  panel.hidden=true;document.body.classList.remove('youtube-open');
  $('youtube-video-clock').textContent='00:00';dialogHidden=false;
 }
 async function open(selectedId){
  if(!/^[A-Za-z0-9_-]{11}$/.test(selectedId))throw Error('Invalid video');
  close();
  const thisSequence=++sequence;
  videoId=selectedId;
  $('youtube-external').href='https://www.youtube.com/watch?v='+encodeURIComponent(videoId);
  panel.hidden=false;document.body.classList.add('youtube-open');
  showStatus('Loading the visible player. No alignment map exists for this video. The reading glow remains manual.');
  const host=$('youtube-player-host');host.replaceChildren();
  const div=document.createElement('div');div.id='youtube-iframe-target';host.appendChild(div);
  try{
   const yt=await loadApi();
   if(thisSequence!==sequence||panel.hidden)return;
   player=new yt.Player('youtube-iframe-target',{
    width:'100%',height:'212',videoId,
    playerVars:{playsinline:1,autoplay:0,controls:1,origin:location.origin},
    events:{
     onReady:()=>{if(thisSequence===sequence){showStatus('Video ready. Press Play in the YouTube player. This recording has no checked timing map; adjust the silent guide separately.');tick();}},
     onStateChange:event=>{
      if(thisSequence!==sequence)return;
      if(event.data===yt.PlayerState.PLAYING){stopClock();interval=setInterval(tick,350);showStatus('YouTube video playing. Original Gurmukhi is still here; highlighting is NOT yet synchronized to this recording.');}
      else{stopClock();tick();if(event.data===yt.PlayerState.PAUSED)showStatus('Video paused. Your reading place has not changed.');}
     },
     onError:()=>{if(thisSequence===sequence)showStatus('This recording could not be embedded. Use the Open on YouTube link instead.');}
    }
   });
  }catch(err){if(thisSequence===sequence)showStatus(err.message+' Use the Open on YouTube link instead.');}
 }
 function hideForDialog(){
  if(panel.hidden)return;
  pause();
  panel.hidden=true;dialogHidden=true;
 }
 function resumeAfterDialog(){if(dialogHidden&&videoId){panel.hidden=false;dialogHidden=false;showStatus('YouTube paused while you studied. Press Play on the visible video player to resume.');}}
 document.addEventListener('click',event=>{
  if(event.target.id!=='youtube-search')return;
  const search=document.getElementById('youtube-query')?.value?.trim()||'Japji Sahib';
  window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(search), '_blank', 'noopener,noreferrer');
});
$('youtube-close').addEventListener('click',close);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&videoId)pause();});
 window.addEventListener('pagehide',close);
 window.GLP_YOUTUBE=Object.freeze({chooserHtml,open,close,pause,hideForDialog,resumeAfterDialog,isOpen:()=>Boolean(videoId)});
})();
