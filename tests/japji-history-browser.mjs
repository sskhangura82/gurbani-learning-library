// History restoration regression; every record is synthetic and every origin is temporary.
// ENGINE=safari uses Apple's actual desktop Safari through an owned safaridriver session.
// ENGINE=chromium uses a fresh Playwright context. Neither is a physical iPhone test.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import net from 'node:net';
import {spawn,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),engine=process.env.ENGINE||'chromium';
const key='glp001.continuous.v2',prefix='/gurbani-learning-library/';
const variant=process.env.BASELINE_REF?'baseline':'candidate';
const script=process.env.BASELINE_REF?execFileSync('git',['show',process.env.BASELINE_REF+':js/japji-full.js'],{cwd:root}):await fs.readFile(path.join(root,'js/japji-full.js'));
const report={schema:'glp.japji-history.v1',startedAtUtc:new Date().toISOString(),engine,variant,scriptSha256:createHash('sha256').update(script).digest('hex'),checks:[],limitations:['Synthetic notes and bookmarks only, on a newly allocated localhost origin.','Desktop Safari or Chromium geometry is not physical iPhone, Home Screen, VoiceOver, or airplane-mode acceptance.','Builder evidence; independent reviewer verification remains required.']};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{try{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(name==='/synthetic-fixture.html'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<!doctype html><title>Synthetic history fixture</title><p>Temporary test origin</p>');return;}
 if(name===prefix+'sw.js'){res.writeHead(404);res.end();return;}
 if(!name.startsWith(prefix)){res.writeHead(404);res.end();return;}
 const filename=path.resolve(root,name.slice(prefix.length)||'index.html');if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 const bytes=name===prefix+'js/japji-full.js'?script:await fs.readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
 }catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,reader=origin+prefix+'full-japji.html',library=origin+prefix+'index.html';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let browser,driver,session,api,driverLog='';
async function waitFor(fn,message,timeout=20000){const end=Date.now()+timeout;let last;while(Date.now()<end){try{const x=await fn();if(x)return x;}catch(e){last=e;}await delay(80);}throw Error(message+(last?': '+last.message:''));}
async function freePort(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
async function startSafari(){
 const port=await freePort(),base='http://127.0.0.1:'+port;
 driver=spawn('/usr/bin/safaridriver',['-p',String(port)],{stdio:['ignore','pipe','pipe']});driver.stdout.on('data',x=>driverLog+=x);driver.stderr.on('data',x=>driverLog+=x);
 async function request(method,url,body){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(15000)});const data=await r.json();if(!r.ok||data.value?.error)throw Error(JSON.stringify(data.value||data));return data.value;}
 await waitFor(()=>request('GET','/status'),'Owned Safari driver did not start');
 const created=await request('POST','/session',{capabilities:{alwaysMatch:{browserName:'safari'}}});session=created.sessionId;report.browserVersion=created.capabilities?.browserVersion;report.platform=created.capabilities?.platformName;
 await request('POST','/session/'+session+'/timeouts',{implicit:0,pageLoad:15000,script:15000});
 const command=(name,body={})=>request('POST','/session/'+session+'/'+name,body);
 api={go:url=>command('url',{url}),reload:()=>command('refresh'),back:()=>command('back'),forward:()=>command('forward'),eval:(fn,arg)=>command('execute/sync',{script:'return ('+fn.toString()+')(arguments[0]);',args:[arg??null]}),close:()=>request('DELETE','/session/'+session)};
}
async function startChromium(){const {chromium}=await import('playwright');browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browserVersion=browser.version();const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'});const p=await context.newPage();api={go:url=>p.goto(url),reload:()=>p.reload(),back:()=>p.goBack(),forward:()=>p.goForward(),eval:(fn,arg)=>p.evaluate(fn,arg),close:()=>browser.close()};}
async function ready(){await waitFor(()=>api.eval(()=>window.GLP_CONTINUOUS_DEBUG?.lineCount===385),'Reader did not become ready');await delay(650);}
async function snapshot(){return api.eval(key=>{
 const rows=[...document.querySelectorAll('.scripture-line')],notice=document.querySelector('#retained-learning'),top=14+(notice?.hidden?0:(notice?.getBoundingClientRect().height||0));
 const visible=rows.find(n=>n.getBoundingClientRect().bottom>top)||rows.at(-1),state=window.GLP_CONTINUOUS_DEBUG.getState(),target=rows.find(n=>n.dataset.occurrence===state.read.id);
 return {scrollY,visible:{id:visible.dataset.occurrence,offset:visible.getBoundingClientRect().top-top},read:state.read,targetOffset:target.getBoundingClientRect().top-top,playing:window.GLP_CONTINUOUS_DEBUG.isPlaying(),notes:state.notes,bookmarks:state.bookmarks,stored:JSON.parse(localStorage.getItem(key)),pageshow:window.__historyEvents||[],timeOrigin:performance.timeOrigin,mode:state.mode};
 },key);}
function samePlace(s,id,offset){try{assert.equal(s.read.id,id);assert.equal(s.visible.id,id);assert.ok(Math.abs(s.targetOffset-offset)<=1.1,JSON.stringify({expectedOffset:offset,actualOffset:s.targetOffset,y:s.scrollY}));assert.equal(s.stored.read.id,id);assert.ok(Math.abs(s.stored.read.offset-offset)<=1.1);assert.equal(s.playing,false);assert.equal(s.notes['pauri02.line01'],'SYNTHETIC reflection retained through navigation');assert.ok(s.bookmarks.includes('pauri02.line02'));}catch(e){e.observed={scrollY:s.scrollY,visible:s.visible,read:s.read,targetOffset:s.targetOffset,storedRead:s.stored.read,pageshow:s.pageshow};throw e;}}
async function run(name,fn){try{const detail=await fn();report.checks.push({name,status:'PASS',detail});console.log('PASS '+name);}catch(e){report.checks.push({name,status:'FAIL',error:e.stack||String(e),...(e.observed?{observed:e.observed}:{})});console.log('FAIL '+name+': '+e.message);}}
try{
 if(engine==='safari')await startSafari();else if(engine==='chromium')await startChromium();else throw Error('ENGINE must be safari or chromium');
 for(const {label,mode,persistentControls} of [{label:'Read with persistent heading',mode:'read',persistentControls:true},{label:'Read with default receding heading',mode:'read',persistentControls:false},{label:'Meaning',mode:'understand',persistentControls:true}]){
  const id='pauri20.line01',offset=-9;
  await api.go(origin+'/synthetic-fixture.html');await api.eval(({key,mode,id,offset,persistentControls})=>{localStorage.clear();localStorage.setItem(key,JSON.stringify({version:2,persistentControls,hasGuided:false,read:{id,offset},guide:{index:0,token:0},mode,theme:'day',size:30,pace:70,notes:{'pauri02.line01':'SYNTHETIC reflection retained through navigation'},bookmarks:['pauri02.line02']}));},{key,mode,id,offset,persistentControls});
  await api.go(reader);await ready();
  await run(label+': initial saved occurrence and offset',async()=>{const s=await snapshot();samePlace(s,id,offset);return s;});
  await run(label+': three reloads do not drift',async()=>{const samples=[];for(let i=0;i<3;i++){await api.reload();await ready();const s=await snapshot();samples.push({y:s.scrollY,read:s.read,targetOffset:s.targetOffset});samePlace(s,id,offset);}return samples;});
  await run(label+': library Back preserves actual geometry and notes',async()=>{
   const before=await snapshot();await api.eval(()=>{window.__historyEvents=[];addEventListener('pageshow',e=>window.__historyEvents.push({persisted:e.persisted,y:scrollY}));});
   await api.go(library);await api.back();await ready();const s=await snapshot();samePlace(s,id,offset);return {beforeY:before.scrollY,afterY:s.scrollY,pageshow:s.pageshow,timeOriginBefore:before.timeOrigin,timeOriginAfter:s.timeOrigin};
  });
  await run(label+': Forward then Back preserves the occurrence',async()=>{await api.forward();await api.back();await ready();const s=await snapshot();samePlace(s,id,offset);return {y:s.scrollY,read:s.read,targetOffset:s.targetOffset,pageshow:s.pageshow};});
  await run(label+': reload after Back does not save a transient top position',async()=>{await api.reload();await ready();const s=await snapshot();samePlace(s,id,offset);return {y:s.scrollY,read:s.read,targetOffset:s.targetOffset};});
  await run(label+': a running guide returns paused at its departure place',async()=>{
   await api.eval(()=>document.querySelector('#play').click());await delay(650);const before=await snapshot();assert.equal(before.playing,true);
   await api.go(library);await api.back();await ready();const s=await snapshot();samePlace(s,before.visible.id,before.visible.offset);return {departure:before.visible,returned:s.visible,playing:s.playing};
  });
 }
}catch(e){report.setupError=e.stack||String(e);}finally{
 if(api)try{await api.close();}catch(e){report.cleanupError=e.message;}
 if(driver){driver.kill('SIGTERM');await delay(100);}await new Promise(r=>server.close(r));
 report.completedAtUtc=new Date().toISOString();report.status=report.setupError||report.checks.some(c=>c.status==='FAIL')?'FAIL':'PASS';
 const dir=path.join(root,'evidence/japji-history');await fs.mkdir(dir,{recursive:true});const filename=path.join(dir,engine+'-'+variant+'.json');await fs.writeFile(filename,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,engine,variant,checks:report.checks.map(x=>({name:x.name,status:x.status})),setupError:report.setupError||null,report:filename,driverLog},null,2));if(report.status!=='PASS')process.exitCode=1;
}
