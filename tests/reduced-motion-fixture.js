/* Test-only media-query injection. This does not claim a real OS preference toggle. */
const nativeMatchMedia=window.matchMedia.bind(window),nativeScrollTo=window.scrollTo.bind(window),motionScroll=[];
window.matchMedia=q=>q==='(prefers-reduced-motion: reduce)'?{matches:true,media:q,onchange:null,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}:nativeMatchMedia(q);
window.scrollTo=(...args)=>{motionScroll.push(args[0]?.behavior||'default');return nativeScrollTo(...args);};
window.addEventListener('load',()=>{const play=document.getElementById('play');play.focus();play.click();setTimeout(()=>{const active=document.querySelector('.g-word[data-active=true]'),tuk=document.querySelector('.tuk'),cs=getComputedStyle(active),checks=[
{name:'Reduced-motion media-query branch enabled (test injection)',status:matchMedia('(prefers-reduced-motion: reduce)').matches?'PASS':'FAIL'},
{name:'Exact production reduced-motion declarations suppress text shadows',status:cs.textShadow==='none'&&getComputedStyle(tuk).textShadow==='none'?'PASS':'FAIL'},
{name:'Word and line transitions are suppressed',status:cs.transitionDuration==='0s'?'PASS':'FAIL'},
{name:'Guide scrolling uses instant behavior, never smooth',status:motionScroll.includes('instant')&&!motionScroll.includes('smooth')?'PASS':'FAIL',observed:motionScroll},
{name:'Current word has underline without glow',status:cs.textDecorationLine.includes('underline')?'PASS':'FAIL'},
{name:'Guide location updates do not steal keyboard focus',status:document.activeElement===play?'PASS':'FAIL'}
];play.click();const out=document.createElement('pre');out.id='reduced-results';out.textContent=JSON.stringify({status:checks.every(x=>x.status==='PASS')?'PASS':'FAIL',environment:'Desktop Chrome; forced matchMedia branch and exact extracted CSS declarations; not OS-toggle or physical iPhone proof',checks,total:checks.length,locationWhisper:'Not implemented; dock label updates without moving focus'},null,2);document.body.appendChild(out);},2400);});
