// Bounded SK-01 investigation. Frozen Git objects served without editing application files.
// Each scenario runs once per named source variant, with fresh synthetic storage.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
const base='/tmp/glp001-iphoneqa-20261126',repo=path.join(base,'reader-reliability');
const require=createRequire(path.join(repo,'tests/sukhmani-browser.mjs'));
const {chromium}=require('playwright');
const out=path.join(base,'sukhmani-resume-investigation','runs',new Date().toISOString().replace(/[:.]/g,'-'));
const variants=[
 {name:'observed-main',ref:'a3476ac4b9be90dde350fb35dd13ce0b672c120d'},
 {name:'pr56-frozen',ref:'389e79baff4016a2ff61d1851908de0bd66beb8f'},
 {name:'pr47-existing-repair',ref:'d8202caa1b7761c493f70eb9c13514f9b87f2801'}
];
const KEY='glp001.sukhmani.v1',target='sukhmani.a01.p01.l02';
const report={startedAtUtc:new Date().toISOString(),scope:'Read-only investigation of frozen application objects; fresh synthetic desktop Chrome contexts',variants,cases:[],runtimeErrors:[],externalRequests:[],limitations:['Not physical-device acceptance.','Bounded observation, not a measured flake rate.','Tracing adds observation overhead; no claim to reproduce CI scheduling exactly.']};
const cache=new Map(),mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.mjs':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
let browser,server,origin;
function source(ref,file){const key=ref+':'+file;if(!cache.has(key))cache.set(key,execFileSync('git',['-C',repo,'show',key],{maxBuffer:32*1024*1024}));return cache.get(key);}
function seeded(id){return {version:2,read:id,guide:id,hasGuided:false,mode:'read',theme:'day',size:30,pace:70,pronunciation:false,bookmarks:[id],notes:{[id]:'SYNTHETIC SK-01 observation'}};}
async function fresh(variant,{seed=null,height=844}={}){
 const context=await browser.newContext({viewport:{width:390,height},deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(({KEY,seed,target})=>{
  if(seed&&localStorage.getItem(KEY)===null)localStorage.setItem(KEY,JSON.stringify(seed));
  const nativeSet=Storage.prototype.setItem,nativeScroll=Element.prototype.scrollIntoView;
  window.__skTrace=[];window.__skTarget=target;
  window.__skSnap=label=>{
   let s=null;try{s=JSON.parse(localStorage.getItem(KEY));}catch{}
   const id=window.__skTarget,element=document.getElementById(id),notice=document.getElementById('resume-notice');
   const near=[];if(element){let e=element;for(let n=0;n<2&&e?.previousElementSibling?.classList.contains('sk-line');n++)e=e.previousElementSibling;
    for(let n=0;n<5&&e;n++,e=e.nextElementSibling){if(!e.classList.contains('sk-line'))continue;const r=e.getBoundingClientRect();near.push({id:e.id,top:r.top,bottom:r.bottom,height:r.height});}}
   return {label,t:performance.now(),scrollY,viewport:innerHeight,current:document.querySelector('.sk-line[data-current="true"]')?.id,storedRead:s?.read,storedGuide:s?.guide,mode:s?.mode,source:document.getElementById('sukhmani-text')?.dataset.sourceIntegrity,
    notice:notice?{hidden:notice.hidden,height:notice.getBoundingClientRect().height,top:notice.getBoundingClientRect().top}:null,
    rootScrollPadding:getComputedStyle(document.documentElement).scrollPaddingTop,targetScrollMargin:element?getComputedStyle(element).scrollMarginTop:null,near};
  };
  const log=(label,detail)=>{if(window.__skTrace.length<350)window.__skTrace.push({...window.__skSnap(label),...(detail?{detail}:{})});};
  window.__skLog=log;
  Storage.prototype.setItem=function(k,v){const result=nativeSet.call(this,k,v);if(this===localStorage&&k===KEY){let d;try{d=JSON.parse(v);}catch{}log('storage-write',{read:d?.read,guide:d?.guide,stack:new Error().stack.split('\n').slice(1,5)});}return result;};
  Element.prototype.scrollIntoView=function(options){log('scrollIntoView-before',{id:this.id,options});const result=nativeScroll.call(this,options);log('scrollIntoView-after',{id:this.id,options});return result;};
  addEventListener('scroll',()=>log('scroll-event'),{passive:true,capture:true});
  addEventListener('pagehide',()=>log('pagehide'));
  document.addEventListener('click',e=>{if(e.target.closest('#resume-reading')){log('resume-click-capture');let n=0;const frame=()=>{log('resume-frame-'+(++n));if(n<4)requestAnimationFrame(frame);};requestAnimationFrame(frame);setTimeout(()=>log('resume-after-250ms'),250);}},true);
  new MutationObserver(records=>{
   for(const rec of records){if(rec.target.id==='resume-notice')log('resume-notice-mutation');else if(rec.attributeName==='data-current')log('current-mutation',{id:rec.target.id,value:rec.target.getAttribute('data-current')});}
  }).observe(document,{subtree:true,attributes:true,attributeFilter:['hidden','data-current']});
 },{KEY,seed,target});
 context.on('request',request=>{const u=new URL(request.url());if(/^https?:$/.test(u.protocol)&&u.origin!==origin)report.externalRequests.push(u.origin+u.pathname);});
 await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>report.runtimeErrors.push({variant:variant.name,message:e.message}));
 await page.goto(origin+'/'+variant.name+'/sukhmani.html',{waitUntil:'load'});
 await ready(page);return {context,page};
}
async function ready(page){await page.waitForFunction(()=>document.querySelectorAll('#sukhmani-text .sk-line').length===2027);await page.evaluate(()=>document.fonts.ready);}
async function snapshot(page,label){return page.evaluate(label=>window.__skSnap(label),label);}
async function trace(page){return page.evaluate(()=>window.__skTrace);}
async function closeDialog(page){if(await page.locator('#sk-dialog').evaluate(d=>d.open)){await page.locator('#sk-dialog-close').click();await page.waitForFunction(()=>!document.getElementById('sk-dialog').open);}}
async function stored(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),KEY);}
async function recordCase(variant,kind,fn){
 const c={variant:variant.name,ref:variant.ref,kind,observations:[],traces:[]};report.cases.push(c);
 try{await fn(c);c.completed=true;}catch(e){c.completed=false;c.error=e.stack||String(e);}
 await fs.writeFile(path.join(out,'report-in-progress.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({variant:c.variant,kind:c.kind,completed:c.completed,observations:c.observations,error:c.error}));
}
try{
 await fs.mkdir(out,{recursive:true});
 server=http.createServer((req,res)=>{
  try{
   const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
   if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
   const parts=pathname.split('/').filter(Boolean),variant=variants.find(v=>v.name===parts[0]);if(!variant)throw Error('unknown variant');
   const file=parts.slice(1).join('/')||'index.html';if(file.includes('..')||file.startsWith('.'))throw Error('invalid path');
   const data=source(variant.ref,file);
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(data);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',args:['--disable-background-networking']});report.browser=browser.version();
 for(const variant of variants){
  await recordCase(variant,'seeded-explicit-resume',async c=>{
   const {context,page}=await fresh(variant,{seed:seeded(target)});
   try{
    c.observations.push(await snapshot(page,'before-resume'));
    await page.locator('#resume-reading').click();
    c.observations.push(await snapshot(page,'immediately-after-resume-click'));
    await page.waitForTimeout(450); // Observe beyond the declared 200 ms scroll debounce.
    c.observations.push(await snapshot(page,'settled-after-debounce'));
    c.traces.push(...await trace(page));await page.screenshot({path:path.join(out,variant.name+'-resume.png')});
   }finally{await context.close();}
  });
  await recordCase(variant,'ordinary-reload-after-manual-reading',async c=>{
   const {context,page}=await fresh(variant,{height:664});
   try{
    await page.locator('#ashtpadi-nav a').filter({hasText:/^6$/}).click();await page.waitForTimeout(350);
    for(let n=0;n<3;n++){await page.mouse.wheel(0,700);await page.waitForTimeout(160);}
    await page.waitForTimeout(350);
    const before=await stored(page);await page.evaluate(id=>window.__skTarget=id,before.read);
    c.observations.push(await snapshot(page,'before-reload'));c.traces.push(...await trace(page));
    await page.reload({waitUntil:'load'});await ready(page);await page.evaluate(id=>window.__skTarget=id,before.read);
    c.observations.push(await snapshot(page,'after-reload-ready'));
    await page.waitForTimeout(450);
    c.observations.push(await snapshot(page,'after-reload-debounce'));c.traces.push(...await trace(page));
   }finally{await context.close();}
  });
 }
 for(const variant of variants.slice(0,2)){
  await recordCase(variant,'original-CI-bookmark-reflection-resume-sequence',async c=>{
   const {context,page}=await fresh(variant);
   try{
    await page.locator('.sk-line[data-line-id="'+target+'"] p.tuk').click();await page.locator('#sk-save-reflection').waitFor();
    await page.locator('#sk-reflection').fill('SYNTHETIC reflection for automated verification only.');
    await page.locator('#sk-save-reflection').click();
    await page.waitForFunction(({KEY,target})=>JSON.parse(localStorage.getItem(KEY)||'{}').notes?.[target]==='SYNTHETIC reflection for automated verification only.',{KEY,target});
    for(const marked of [true,false,true]){
     await page.locator('#sk-bookmark').click();
     await page.waitForFunction(({KEY,target,marked})=>JSON.parse(localStorage.getItem(KEY)||'{}').bookmarks?.includes(target)===marked&&document.getElementById('sk-bookmark').textContent===(marked?'Remove bookmark':'Bookmark this line'),{KEY,target,marked});
    }
    await closeDialog(page);c.observations.push(await snapshot(page,'CI-before-reload'));c.traces.push(...await trace(page));
    await page.reload();await page.locator('#resume-reading').waitFor();c.observations.push(await snapshot(page,'CI-before-resume'));
    await page.locator('#resume-reading').click();c.observations.push(await snapshot(page,'CI-immediate-assertion-point'));
    await page.waitForTimeout(450);c.observations.push(await snapshot(page,'CI-settled'));c.traces.push(...await trace(page));
   }finally{await context.close();}
  });
 }
}catch(e){report.failure=e.stack||String(e);}
finally{
 if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));
 report.finishedAtUtc=new Date().toISOString();
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({report:path.join(out,'report.json'),cases:report.cases.length,completed:report.cases.filter(c=>c.completed).length,failure:report.failure,runtimeErrors:report.runtimeErrors},null,2));
}
