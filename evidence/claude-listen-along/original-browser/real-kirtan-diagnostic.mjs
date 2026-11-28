import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {chromium} from '/tmp/glp-final-browser-y5b4ko9n/node_modules/playwright/index.mjs';
const root='/var/folders/hk/7t90scbj1wbd5q1wh0ztvxz80000gn/T/glp-claude-listen-review-akoq0vqy/repo';
const out='/var/folders/hk/7t90scbj1wbd5q1wh0ztvxz80000gn/T/glp-claude-listen-review-akoq0vqy/evidence';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{const p=path.resolve(root,'.'+new URL(req.url,'http://x').pathname);if(!p.startsWith(root+path.sep))throw Error();const b=await fs.readFile(p);res.writeHead(200,{'content-type':types[path.extname(p)]||'application/octet-stream'});res.end(b);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
try {
for(const [bani,id,label] of [['sukhmani','kDI-2FPyu3w','Kirtan-alternate']]){
  const c=await browser.newContext({viewport:{width:1280,height:900}});
  const p=await c.newPage(); const errors=[],failed=[],hosts=new Set();
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,500));});
  p.on('request',r=>hosts.add(new URL(r.url()).hostname));p.on('requestfailed',r=>failed.push({host:new URL(r.url()).hostname,error:r.failure()?.errorText}));
  const record={label,bani,videoId:id,providerStubbed:false,origin};
  try{
    await p.goto(origin+'/listen-along.html');await p.selectOption('#bani',bani);await p.fill('#link','https://www.youtube.com/watch?v='+id);
    record.externalBeforeOpen=[...hosts].filter(h=>h!=='127.0.0.1');
    await p.click('#chooser button[type=submit]');
    await p.waitForSelector('#controls:not([hidden]), #chooser-error:not([hidden])',{timeout:25000}).catch(()=>{record.loadTimeout=true;});
    record.notice=await p.locator('#chooser-error').textContent();
    record.ready=await p.locator('#controls').isVisible();
    record.frames=p.frames().map(f=>{try{const u=new URL(f.url());return {host:u.hostname,path:u.pathname};}catch{return {url:f.url()};}});
    if(record.ready){
      await p.click('#play');await p.waitForTimeout(6000);
      record.playButton=await p.locator('#play').getAttribute('aria-label');
      if(record.playButton==='Pause'){
        await p.click('#mark-first');await p.waitForTimeout(1200);
        record.markedStatus=await p.locator('#status').textContent();
        await p.selectOption('#speed','0.75');await p.waitForTimeout(1500);
        record.speedControl=await p.locator('#speed').inputValue();
        record.markedIndex=await p.locator('.tuk[aria-current=true]').getAttribute('data-i').catch(()=>null);
        record.markMeaning='Synthetic interaction marker solely to exercise live clock/UI; not asserted to match the recited words.';
      }
      record.status=await p.locator('#status').textContent();
      record.nativeVideo=[];
      for(const f of p.frames().filter(f=>f!==p.mainFrame())){
        try {record.nativeVideo.push(await f.evaluate(()=>{const v=document.querySelector('video');return {frameText:document.body?.innerText.slice(0,600),video:v?{paused:v.paused,currentTime:v.currentTime,duration:Number.isFinite(v.duration)?v.duration:null,readyState:v.readyState,playbackRate:v.playbackRate,error:v.error?.code||null}:null};}));}catch{}
      }
      if(record.playButton==='Pause')await p.click('#play');
    }
    await p.screenshot({path:path.join(out,'real-youtube-'+label.toLowerCase()+'.png')});
  }catch(e){record.exception=String(e);}
  record.requestHosts=[...hosts];record.failed=failed.slice(0,12);record.errors=errors.slice(0,12);results.push(record);
  console.log(JSON.stringify(record));await c.close();
}
} finally {await browser.close();await new Promise(r=>server.close(r));}
await fs.writeFile(path.join(out,'original-real-youtube-kirtan-alternate.json'),JSON.stringify({time:new Date().toISOString(),testedCommit:'b2d34796a4a5f22d3d526b0fd04d495fa0744d30',scope:'Diagnostic of untouched supplied prototype; no interception or disabled provider checks; not a release approval. No claim of recitation alignment.',browser:'Desktop Chrome fresh contexts',results},null,2)+'\n');