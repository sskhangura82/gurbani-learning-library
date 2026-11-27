import fs from 'node:fs/promises';
import http from 'node:http';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire('/tmp/glp001-iphoneqa-20261126/reader-reliability/tests/sukhmani-browser.mjs')('playwright');
const out='/tmp/glp001-iphoneqa-20261126/pr59-ci/bfcache-engine-investigation';
const results={startedAt:new Date().toISOString(),engine:'Pinned full Chromium channel; no application code',cases:[]};
const server=http.createServer((req,res)=>res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'max-age=60'}).end('<!doctype html><title>'+req.url+'</title><p>Disposable BFCache capability control</p><div style="height:4000px"></div><script>window.events=[];addEventListener("pageshow",e=>events.push({persisted:e.persisted,type:"pageshow"}));addEventListener("pagehide",e=>events.push({persisted:e.persisted,type:"pagehide"}));</script>'));
let browser;
try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({channel:'chromium',headless:true,ignoreDefaultArgs:['--disable-back-forward-cache']});results.browser=browser.version();results.resolvedExecutable=chromium.executablePath();
 for(const method of ['javascript-poll','commit-event']){
  const c={method,notRestored:[]};results.cases.push(c);const context=await browser.newContext();
  try{
   const page=await context.newPage();page.setDefaultTimeout(8000);const cdp=await context.newCDPSession(page);await cdp.send('Page.enable');cdp.on('Page.backForwardCacheNotUsed',e=>c.notRestored.push(e));
   await page.goto(origin+'/a');await page.evaluate(()=>{window.marker='synthetic retained document';scrollTo(0,700);});await page.goto(origin+'/b');
   if(method==='javascript-poll'){await page.evaluate(()=>history.back());await page.waitForFunction(()=>location.pathname==='/a'&&window.events?.at(-1)?.type==='pageshow');}
   else await page.goBack({waitUntil:'commit'});
   c.observed=await page.evaluate(()=>({marker:window.marker,events:window.events,scrollY,url:location.pathname,notRestoredReasons:performance.getEntriesByType('navigation')[0]?.notRestoredReasons?.toJSON?.()}));
   assert.equal(c.observed.marker,'synthetic retained document');assert.equal(c.observed.events.at(-1).persisted,true);assert.equal(c.observed.scrollY,700);c.status='passed';
  }catch(e){c.status='failed';c.error=e.stack||String(e);}finally{await context.close();}
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));results.completedAt=new Date().toISOString();await fs.writeFile(out+'/minimal-controls.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(results,null,2));}
