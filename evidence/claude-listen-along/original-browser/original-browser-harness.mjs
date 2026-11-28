// Listen-along page in real Chromium with a stand-in YouTube player (no network to YouTube).
// The stand-in implements only the documented IFrame API calls the page uses.
// Run: node tests/listen-along-browser.mjs   (CHROMIUM_PATH optional)
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from '/tmp/glp-final-browser-y5b4ko9n/node_modules/playwright/index.mjs';

const root="/var/folders/hk/7t90scbj1wbd5q1wh0ztvxz80000gn/T/glp-claude-listen-review-akoq0vqy/repo";
const shots="/var/folders/hk/7t90scbj1wbd5q1wh0ztvxz80000gn/T/glp-claude-listen-review-akoq0vqy/evidence/screenshots";
await fs.mkdir(shots,{recursive:true});
const ctx={window:{}};vm.runInNewContext(await fs.readFile(path.join(root,'js/japji-full-data.js'),'utf8'),ctx);
const japjiLines=ctx.window.GLP_FULL_JAPJI.units.flatMap(u=>u.lines.map(l=>l.text));
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
 try{const u=new URL(req.url,'http://x');const file=path.join(root,decodeURIComponent(u.pathname));
  if(!file.startsWith(root))throw 0;const body=await fs.readFile(file);res.writeHead(200,{'content-type':TYPES[path.extname(file)]||'application/octet-stream'});res.end(body);}
 catch{res.writeHead(404);res.end('not found');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const MOCK=`(()=>{const m=window.__mock={t:0,playing:false,rate:1,last:performance.now(),calls:[]};
const cur=()=>m.playing?m.t+(performance.now()-m.last)/1000*m.rate:m.t;
window.YT={Player:function(id,opts){m.opts=opts;m.calls.push(['new',opts.videoId,opts.host,JSON.stringify(opts.playerVars)]);const self=this;
 this.getCurrentTime=()=>cur();this.getDuration=()=>1260;this.getAvailablePlaybackRates=()=>[0.25,0.5,0.75,1,1.25,1.5,1.75,2];
 this.playVideo=()=>{m.t=cur();m.last=performance.now();m.playing=true;opts.events.onStateChange({data:1});};
 this.pauseVideo=()=>{m.t=cur();m.playing=false;opts.events.onStateChange({data:2});};
 this.seekTo=s=>{m.t=s;m.last=performance.now();m.calls.push(['seek',s]);};
 this.setPlaybackRate=r=>{m.t=cur();m.last=performance.now();m.rate=r;opts.events.onPlaybackRateChange({data:r});};
 this.cueVideoById=o=>{m.calls.push(['cue',o.videoId]);m.t=0;m.playing=false;};
 m.set=t=>{m.t=t;m.last=performance.now();};m.error=c=>opts.events.onError({data:c});
 const el=document.getElementById(id);const f=document.createElement('div');f.id=id;f.className='mock-player';f.textContent='stand-in player · '+opts.videoId;el.replaceWith(f);
 setTimeout(()=>opts.events.onReady({target:self}),20);}};
setTimeout(()=>window.onYouTubeIframeAPIReady&&window.onYouTubeIframeAPIReady(),0);})();`;
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const results=[];let failures=0;
const check=async(name,fn)=>{try{await fn();results.push(['ok',name]);console.log('ok -',name);}catch(e){failures++;results.push(['FAIL',name,String(e&&e.message||e)]);console.log('FAIL -',name,'\n   ',e&&e.message);}};
async function newPage(viewport={width:390,height:844}){
 const context=await browser.newContext({viewport,permissions:['clipboard-read','clipboard-write']});
 const external=[],errors=[];
 await context.route(/^https?:\/\/(?!127\.0\.0\.1)/,route=>{const u=route.request().url();external.push(u);
  if(u==='https://www.youtube.com/iframe_api')return route.fulfill({status:200,contentType:'text/javascript',body:MOCK});return route.abort();});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 return {context,page,external,errors};
}
const VIDEO='https://youtu.be/AbCdEfGhIjK';
const at=async(page,t)=>{await page.evaluate(t=>window.__mock.set(t),t);await page.waitForTimeout(450);};
const currentIndex=page=>page.evaluate(()=>{const el=document.querySelector('.tuk[aria-current=true]');return el?Number(el.dataset.i):-1;});
const status=page=>page.textContent('#status');

const A=await newPage();
let {page}=A;
await check('Page opens calmly with no errors and contacts nobody before Open',async()=>{
 await page.goto(origin+'/listen-along.html');await page.waitForTimeout(300);
 assert.equal(A.external.length,0,A.external.join(','));assert.equal(A.errors.length,0,A.errors.join(' | '));
 assert.ok(await page.isVisible('#chooser'));assert.ok(await page.isHidden('#controls'));
});
await check('Rejects a link that is not YouTube, in plain words',async()=>{
 await page.fill('#link','https://vimeo.com/123');await page.click('#chooser button[type=submit]');
 assert.match(await page.textContent('#chooser-error'),/does not look like a YouTube link/);
});
await check('Opens a video through the privacy-enhanced player and shows the verified Japji text',async()=>{
 await page.fill('#link',VIDEO);await page.click('#chooser button[type=submit]');
 await page.waitForSelector('#controls:not([hidden])');
 const calls=await page.evaluate(()=>window.__mock.calls);
 assert.equal(calls[0][1],'AbCdEfGhIjK');assert.equal(calls[0][2],'https://www.youtube-nocookie.com');assert.match(calls[0][3],/"playsinline":1/);
 assert.deepEqual(A.external,['https://www.youtube.com/iframe_api']);
 assert.match(await page.textContent('#text-check'),/385 lines · every line matches its stored fingerprint/);
});
await check('Every displayed line is the library text, unchanged and in order',async()=>{
 const shown=await page.$$eval('.tuk',els=>els.map(e=>e.textContent));
 assert.equal(shown.length,385);shown.forEach((t,i)=>assert.equal(t,japjiLines[i].split(/\s+/u).filter(Boolean).join(' '),'line '+i));
});
await check('Before any timing, nothing glows and the next step is offered',async()=>{
 assert.equal(await currentIndex(page),-1);assert.ok(await page.isVisible('#mark-first'));assert.match(await status(page),/First line starts now/);
});
await check('One tap at the first line spreads the bani across the video length',async()=>{
 await page.click('#play');await at(page,12);await page.click('#mark-first');
 await at(page,12+600);
 const i=await currentIndex(page);assert.ok(i>150&&i<240,'index '+i);
 assert.match(await status(page),/Estimating from the video.s length/);
});
await check('Tapping the line being recited moves the light there and learns the pace',async()=>{
 await at(page,300);await page.click('.tuk[data-i="100"]');await page.waitForTimeout(450);
 assert.equal(await currentIndex(page),100);
 await at(page,330);const later=await currentIndex(page);assert.ok(later>100&&later<125,'later '+later);
 assert.match(await status(page),/pace you marked/);
});
await check('Undo in the message takes the correction back',async()=>{
 await page.click('.tuk[data-i="140"]');await page.waitForTimeout(200);
 const before=await page.evaluate(()=>document.querySelectorAll('.tuk.past').length);
 await page.click('#toast-undo');await page.waitForTimeout(450);
 const after=await page.evaluate(()=>document.querySelectorAll('.tuk.past').length);assert.ok(after<before,'past lines '+before+' -> '+after);
});
await check('Teach mode shows the next line and marks it with one big tap',async()=>{
 await page.click('[data-mode=teach]');await at(page,331);
 const idx=await currentIndex(page);const next=await page.textContent('#next-text');
 const nextIdx=await page.evaluate(t=>[...document.querySelectorAll('.tuk')].findIndex(e=>e.textContent===t),next.trim());
 assert.ok(nextIdx>=101,'next index '+nextIdx);
 await page.click('#next-line');await page.waitForTimeout(450);
 assert.match(await status(page),/3 marks/);assert.ok(idx>=0);
 await page.click('#undo');await page.waitForTimeout(300);assert.match(await status(page),/2 marks/);
 await page.click('[data-mode=follow]');
});
await check('Speed changes keep the text matched to the video',async()=>{
 await page.selectOption('#speed','0.75');await at(page,400);const a=await currentIndex(page);
 await page.selectOption('#speed','1');assert.ok(a>100);
 assert.equal(await page.evaluate(()=>window.__mock.rate),1);
});
await check('Paused: tapping a line moves the video to that line',async()=>{
 await page.click('#play');await page.waitForTimeout(200);
 await page.click('.tuk[data-i="60"]');await page.waitForTimeout(300);
 const seek=(await page.evaluate(()=>window.__mock.calls)).filter(c=>c[0]==='seek').pop();
 assert.ok(seek&&seek[1]>12&&seek[1]<300,'seek '+(seek&&seek[1]));assert.equal(await currentIndex(page),60);
});
await check('Hear-this-line-again jumps back to the start of the glowing line',async()=>{
 await page.click('#play');await at(page,330);const i=await currentIndex(page);
 await page.click('#again');await page.waitForTimeout(450);
 const seek=(await page.evaluate(()=>window.__mock.calls)).filter(c=>c[0]==='seek').pop();
 assert.ok(seek[1]<330&&seek[1]>300,'seek '+seek[1]);assert.equal(await currentIndex(page),i);
 await page.click('#play');
});
await page.waitForTimeout(1500);
await page.screenshot({path:path.join(shots,'phone-390-following.png')});
await check('A share link carries the timing to another device',async()=>{
 await page.click('#open-settings');await page.click('#copy-link');await page.waitForTimeout(300);
 const link=await page.evaluate(()=>navigator.clipboard.readText());
 assert.match(link,/listen-along\.html#v=AbCdEfGhIjK&b=japji&s=p&n=385&a=/);
 await page.click('#settings [data-close]');
 const B=await newPage();await B.page.goto(link);await B.page.waitForSelector('#controls:not([hidden])');await B.page.waitForTimeout(400);
 assert.match(await B.page.textContent('#status'),/2 marks/);
 assert.ok(!(await B.page.evaluate(()=>location.hash)).includes('a='),'timing removed from the address after import');
 await B.context.close();
});
await check('The timing is remembered on this device after a reload',async()=>{
 await page.reload();await page.waitForTimeout(300);
 assert.equal(await page.inputValue('#link'),'https://youtu.be/AbCdEfGhIjK');
 await page.waitForSelector('#controls:not([hidden])');await page.waitForTimeout(400);
 assert.match(await status(page),/2 marks/);
});
await check('Kirtan style holds the tapped line instead of moving on',async()=>{
 await page.click('#open-settings');await page.selectOption('#style','kirtan');await page.click('#settings [data-close]');
 await page.click('#play');await at(page,302);assert.equal(await currentIndex(page),100);
 await at(page,500);assert.equal(await currentIndex(page),100);assert.match(await status(page),/Kirtan/);
 await page.click('#open-settings');await page.selectOption('#style','paath');await page.click('#settings [data-close]');
});
await check('Clearing asks first and can be undone',async()=>{
 await page.click('#open-settings');await page.click('#clear');assert.ok(await page.isVisible('#confirm'));
 await page.click('#confirm-clear');await page.waitForTimeout(300);assert.equal(await currentIndex(page),-1);
 await page.click('#toast-undo');await page.waitForTimeout(400);assert.match(await status(page),/2 marks/);
});
await check('A video whose owner blocks embedding gets a clear message and a YouTube link',async()=>{
 await page.evaluate(()=>window.__mock.error(150));
 const msg=await page.textContent('#chooser-error');assert.match(msg,/does not allow it to play inside other apps/);
 assert.equal(await page.getAttribute('#chooser-error a','href'),'https://www.youtube.com/watch?v=AbCdEfGhIjK');
});
await check('Sukhmani Sahib loads on demand and verifies all 2,027 lines',async()=>{
 await page.selectOption('#bani','sukhmani');await page.waitForFunction(()=>document.querySelectorAll('.tuk').length===2027,null,{timeout:20000});
 assert.match(await page.textContent('#text-check'),/2027 lines · every line matches/);
});
await check('Morning Nitnem joins five banis in order',async()=>{
 await page.selectOption('#bani','morning');await page.waitForFunction(()=>document.querySelectorAll('.tuk').length===1567,null,{timeout:20000});
 const starts=await page.$$eval('.bani-start',e=>e.map(x=>x.textContent.split(' · ')[0]));
 assert.deepEqual(starts,['Japji Sahib','Jaap Sahib','Tav-Prasad Savaiye','Benti Chaupai Sahib','Anand Sahib']);
});
await check('No page errors and no other outside hosts during the whole session',async()=>{
 assert.equal(A.errors.length,0,A.errors.join(' | '));assert.ok(A.external.every(u=>u==='https://www.youtube.com/iframe_api'),A.external.join(','));
});
await A.context.close();

const D=await newPage({width:1280,height:800});
await check('Wide screen: video and controls beside the Gurbani, nothing overlapping the player',async()=>{
 await D.page.goto(origin+'/listen-along.html#v=AbCdEfGhIjK&b=japji');await D.page.waitForSelector('#controls:not([hidden])');
 await D.page.click('#play');await D.page.evaluate(()=>window.__mock.set(40));await D.page.click('#mark-first');await D.page.evaluate(()=>window.__mock.set(200));await D.page.waitForTimeout(2200);
 const box=await D.page.locator('.player-box').boundingBox(),text=await D.page.locator('.reading').boundingBox();
 assert.ok(box.width>=400&&box.height>=200,'player '+box.width+'x'+box.height);assert.ok(text.x>=box.x+box.width,'text beside video');
 const overlap=await D.page.evaluate(()=>{const p=document.querySelector('.player-box').getBoundingClientRect();return [...document.querySelectorAll('.toast:not([hidden]),.return:not([hidden])')].some(el=>{const r=el.getBoundingClientRect();return !(r.right<p.left||r.left>p.right||r.bottom<p.top||r.top>p.bottom);});});
 assert.equal(overlap,false);
 await D.page.screenshot({path:path.join(shots,'desktop-1280-following.png')});
});
await check('Day background reads well too',async()=>{
 await D.page.click('#open-settings');await D.page.uncheck('#night');await D.page.click('#settings [data-close]');await D.page.waitForTimeout(600);
 const top=await D.page.evaluate(()=>document.querySelector('.tuk[aria-current=true]').getBoundingClientRect().top);assert.ok(top>0&&top<800,'glowing line still in view after closing settings: '+top);
 await D.page.screenshot({path:path.join(shots,'desktop-1280-day.png')});
 assert.equal(await D.page.evaluate(()=>document.documentElement.dataset.theme),'day');
 assert.equal(D.errors.length,0,D.errors.join(' | '));
});
await D.context.close();

const N=await newPage({width:320,height:640});
await check('Narrow 320px phone: nothing wider than the screen, controls reachable',async()=>{
 await N.page.goto(origin+'/listen-along.html#v=AbCdEfGhIjK&b=japji');await N.page.waitForSelector('#controls:not([hidden])');
 await N.page.click('[data-mode=teach]');await N.page.waitForTimeout(300);
 const w=await N.page.evaluate(()=>document.documentElement.scrollWidth);assert.ok(w<=320,'scroll width '+w);
 const dock=await N.page.locator('.dock').boundingBox();assert.ok(dock.height<420,'dock height '+dock.height);
 await N.page.screenshot({path:path.join(shots,'phone-320-teach.png')});
});
await N.context.close();
await browser.close();server.close();
await fs.writeFile("/var/folders/hk/7t90scbj1wbd5q1wh0ztvxz80000gn/T/glp-claude-listen-review-akoq0vqy/evidence/listen-along-browser.json",JSON.stringify({ranAt:new Date().toISOString(),engine:'chromium',stubbedYouTube:true,
 limitations:['YouTube itself is replaced by a stand-in that implements the documented calls; real YouTube playback was not exercised by this test.','No physical iPhone or Safari test.'],results},null,1)+'\n');
console.log((results.length-failures)+'/'+results.length+' listen-along browser checks passed');
if(failures)process.exit(1);
