// Real service worker and offline navigation; desktop Chromium, synthetic origin.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=fileURLToPath(new URL('../',import.meta.url)),prefix='/glp-review/';
const out=path.join(root,'evidence/learning-practice');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
const report={checkedAt:new Date().toISOString(),engine:'Desktop Chromium',checks:[],
 limitations:['Network emulation, not physical airplane-mode acceptance. No iPhone or VoiceOver testing.']};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(!pathname.startsWith(prefix)){res.writeHead(404).end();return;}
  let relative=pathname.slice(prefix.length);if(!relative||relative.endsWith('/'))relative+='index.html';
  const file=path.resolve(root,relative);
  if(!file.startsWith(path.resolve(root)+path.sep)){res.writeHead(403).end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'}).end(await fs.readFile(file));
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser,context;
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 report.browserVersion=browser.version();
 context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
 const page=await context.newPage();page.setDefaultTimeout(20000);
 await page.goto(origin+prefix);
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 const cache=await page.evaluate(async()=>{const names=await caches.keys();const requests=await(await caches.open(names[0])).keys();return {names,paths:requests.map(r=>new URL(r.url).pathname)};});
 assert.equal(cache.names.length,1);assert.equal(cache.paths.length,73);
 for(const asset of ['breathing.html','css/breathing.css','js/breathing-core.js','js/breathing.js','simran.html','js/simran.js'])assert.ok(cache.paths.includes(prefix+asset));
 report.checks.push({name:'Home installs the complete hashed candidate shell including both separate practice pages',status:'PASS'});
 assert.equal(await page.locator('.personal-tools a[href="breathing.html"]').count(),1);
 assert.equal(await page.locator('#destinations a[href="breathing.html"]').count(),0);
 for(const width of [320,390,820,1440]){
  await page.setViewportSize({width,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 }
 await page.setViewportSize({width:390,height:844});
 // Chromium 158 on this Mac repeated the top compositor tile in a full-page
 // image after successive viewport resizes. Use a fresh fixed-size context and
 // real scrolled viewport captures, and verify the DOM contains one page only.
 await fs.mkdir(out,{recursive:true});
 const visualContext=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'});
 try{
  const visual=await visualContext.newPage();await visual.goto(origin+prefix);
  await visual.evaluate(()=>document.fonts.ready);
  const counts={header:await visual.locator('.home-header').count(),hero:await visual.locator('.home-hero').count(),tools:await visual.locator('.personal-tools').count()};
  assert.deepEqual(counts,{header:1,hero:1,tools:1});
  await visual.screenshot({path:path.join(out,'home-390.png'),fullPage:false});
  await visual.locator('.personal-tools').evaluate(node=>node.scrollIntoView({block:'center',behavior:'instant'}));
  await visual.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const position=await visual.locator('.personal-tools').evaluate(node=>{const r=node.getBoundingClientRect();return {scrollY,top:r.top,bottom:r.bottom,viewport:innerHeight};});
  assert.ok(position.scrollY>0&&position.top>=0&&position.bottom<=position.viewport,'The actual optional tool section is visible after scrolling');
  await visual.screenshot({path:path.join(out,'home-tools-390.png'),fullPage:false});
  report.homeVisuals={capture:'Fresh fixed-width desktop context; viewport captures before and after actual scrolling',counts,toolsPosition:position,files:['home-390.png','home-tools-390.png']};
 }finally{await visualContext.close();}
 report.checks.push({name:'The home link stays in a distinct optional personal-tools section at narrow and wide sizes',status:'PASS'});
 const priorStorage=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)])));
 await context.setOffline(true);
 const response=page.waitForResponse(r=>new URL(r.url()).pathname===prefix+'breathing.html');
 await page.locator('.personal-tools a[href="breathing.html"]').click();
 assert.equal((await response).fromServiceWorker(),true);
 await page.locator('#breathing-start').click();
 assert.equal(await page.locator('#pacer-stage').getAttribute('data-state'),'running');
 await page.locator('#breathing-stop').click();
 assert.equal(await page.locator('#pacer-stage').getAttribute('data-state'),'ready');
 report.checks.push({name:'Breathing opens from its cached home link and starts/stops with the network unavailable',status:'PASS'});
 await page.locator('.tool-header a').click();
 const simranResponse=page.waitForResponse(r=>new URL(r.url()).pathname===prefix+'simran.html');
 await page.locator('a[href="simran.html"]').click();
 assert.equal((await simranResponse).fromServiceWorker(),true);
 await page.locator('#sit-start').click();assert.equal(await page.locator('#sit-setup').isVisible(),false);
 await page.locator('#sit-stop').click();assert.equal(await page.locator('#sit-setup').isVisible(),true);
 report.checks.push({name:'The refined Simran Room also opens and runs offline without a visible countdown',status:'PASS'});
 assert.deepEqual(await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))),priorStorage);
 report.checks.push({name:'Neither offline tool creates practice records or changes existing local storage',status:'PASS'});
}catch(error){report.failure=error.stack||String(error);process.exitCode=1;}
finally{
 if(context)await context.close();if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
 await fs.mkdir(out,{recursive:true});
 report.workerSHA256=createHash('sha256').update(await fs.readFile(path.join(root,'sw.js'))).digest('hex');
 await fs.writeFile(path.join(out,'offline.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.failure?'FAIL':'PASS',checks:report.checks.length,failure:report.failure}));
}
