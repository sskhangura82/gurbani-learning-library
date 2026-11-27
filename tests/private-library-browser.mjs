import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {sealCollection} from '../private-library/app.mjs';
const {chromium}=await import(process.env.GLP_PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'evidence/private-library/browser');
await fs.mkdir(out,{recursive:true});
const password='SYNTHETIC-ONLY-testing-passphrase-8261';
const other='SYNTHETIC-ONLY-another-passphrase-4679';
const sentinel='SYNTHETIC PRIVATE SENTINEL';
const source={schema:'glp.private-collection.v1',title:'Synthetic private collection',editionId:'synthetic-v1',works:[{id:'synthetic-text',tradition:'bible',title:'Synthetic title',language:'English',edition:'Synthetic test fixture · no scripture',source:{url:'https://example.invalid/synthetic',rights:'public-domain',attribution:'Entirely synthetic test data.',checkedOn:'2026-11-27',permissionRef:''},paragraphs:[sentinel,'<img src="https://example.invalid/leak" onerror="window.privateLeak=true">',...Array.from({length:54},(_,i)=>`Synthetic paragraph ${i+3}`)]}]};
const encrypted=JSON.stringify(await sealCollection(source,password));
const requests=[];let mode='normal';
const server=http.createServer(async(req,res)=>{
  requests.push(req.url);
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/preview/private-library/collection.enc.json'){
    if(mode==='missing'){res.writeHead(404);res.end();return;}
    let body=encrypted;
    if(mode==='tampered'){const value=JSON.parse(body);const bytes=Buffer.from(value.ciphertext,'base64');bytes[30]^=1;value.ciphertext=bytes.toString('base64');body=JSON.stringify(value);}
    res.writeHead(200,{'content-type':'application/json','cache-control':'no-store'});res.end(body);return;
  }
  if(url.pathname==='/preview/away.html'){res.writeHead(200,{'content-type':'text/html'});res.end('<!doctype html><title>Away</title><p>Outside the private reader</p>');return;}
  try{
    if(!url.pathname.startsWith('/preview/private-library/'))throw Error();
    let file=path.resolve(root,url.pathname.slice('/preview/'.length));if(file.endsWith('/private-library'))file+='/index.html';
    if(!file.startsWith(path.join(root,'private-library')+path.sep))throw Error();
    const data=await fs.readFile(file);const ext=path.extname(file);
    res.writeHead(200,{'content-type':{'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'}[ext]||'application/octet-stream','cache-control':'no-store'});
    res.end(data);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.GLP_CHROMIUM_EXECUTABLE?{executablePath:process.env.GLP_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
await context.addInitScript(()=>{
  window.privateWrites=[];
  const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){window.privateWrites.push([k,String(v)]);return set.call(this,k,v);};
  const open=indexedDB.open.bind(indexedDB);indexedDB.open=(...args)=>{window.privateWrites.push(['indexedDB',String(args[0])]);return open(...args);};
});
const page=await context.newPage();page.setDefaultTimeout(10000);const network=[],errors=[];
page.on('request',request=>network.push(request.url()));page.on('pageerror',error=>errors.push(error.message));
const checks=[];const test=async(name,fn)=>{await fn();checks.push({name,status:'PASS'});};
const visit=async()=>{await page.goto(origin+'/preview/private-library/index.html');await page.waitForSelector('html[data-private-state="locked"]');};
const unlock=async(pass=password,state='unlocked')=>{await page.locator('#passphrase').fill(pass);await page.locator('#unlock').click();await page.waitForSelector(`html[data-private-state="${state}"]`);};
const absent=async()=>{assert.ok(!(await page.locator('body').innerText()).includes(sentinel));assert.equal(await page.locator('#passages').textContent(),'');assert.equal(await page.locator('#passphrase').inputValue(),'');};
try{
  await test('Locked page contains no private titles or plaintext',async()=>{await visit();await absent();assert.ok(!(await page.locator('body').innerText()).includes(source.title));await page.screenshot({path:path.join(out,'locked-390.png'),fullPage:true});});
  await test('Missing collection reports setup pending',async()=>{mode='missing';await unlock(password,'setup-pending');await absent();assert.match(await page.locator('#status').innerText(),/not configured/);mode='normal';});
  await test('Wrong passphrase reveals no content',async()=>{await visit();await unlock(other,'refused');await absent();});
  await test('Altered ciphertext reveals no content',async()=>{mode='tampered';await visit();await unlock(password,'refused');await absent();mode='normal';});
  await test('Correct key renders inert text, clears password and paginates',async()=>{await visit();await unlock();assert.equal(await page.locator('#passphrase').inputValue(),'');assert.equal(await page.locator('#passages p').count(),50);assert.equal(await page.locator('#passages img').count(),0);assert.equal(await page.evaluate(()=>window.privateLeak),undefined);assert.match(await page.locator('#passages').innerText(),/onerror/);await page.locator('#next').click();assert.equal(await page.locator('#passages p').count(),6);await page.locator('#previous').click();await page.screenshot({path:path.join(out,'unlocked-synthetic-390.png'),fullPage:true});});
  await test('No private storage, outbound request or URL parameters',async()=>{assert.deepEqual(await page.evaluate(()=>({writes:window.privateWrites,local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{writes:[],local:[],session:[]});assert.ok(network.every(url=>url.startsWith(origin+'/')));assert.ok(network.every(url=>!url.includes(sentinel)&&!url.includes(password)));assert.equal(new URL(page.url()).search,'');assert.equal(new URL(page.url()).hash,'');});
  await test('Manual lock removes all plaintext and source metadata',async()=>{await page.locator('#lock').click();await absent();assert.equal(await page.locator('#source').textContent(),'');assert.equal(await page.locator('#work-select option').count(),0);});
  await test('Hiding the page clears the private view',async()=>{await unlock();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await absent();await page.evaluate(()=>{delete document.hidden;});});
  await test('Printing locks the view and CSS excludes private content',async()=>{await unlock();await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await absent();await page.emulateMedia({media:'print'});assert.equal(await page.locator('main').isVisible(),false);assert.equal(await page.locator('.print-note').isVisible(),true);await page.emulateMedia({media:'screen'});});
  await test('Reload and Back restore a locked view',async()=>{await unlock();await page.reload();await page.waitForSelector('html[data-private-state="locked"]');await absent();await unlock();await page.goto(origin+'/preview/away.html');await page.goBack();await page.waitForSelector('html[data-private-state="locked"]');await absent();});
  await test('Lock during an in-flight decrypt cannot reopen content',async()=>{
    await page.evaluate(()=>{const decrypt=crypto.subtle.decrypt.bind(crypto.subtle);window.decryptStarted=false;crypto.subtle.decrypt=async(...args)=>{window.decryptStarted=true;const result=await decrypt(...args);await new Promise(r=>setTimeout(r,300));return result;};});
    await page.locator('#passphrase').fill(password);await page.locator('#unlock').click();await page.waitForFunction(()=>window.decryptStarted);await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await page.waitForTimeout(500);await absent();assert.equal(await page.locator('html').getAttribute('data-private-state'),'locked');
  });
  await test('Five-minute inactivity locks',async()=>{await visit();await page.clock.install();await unlock();await page.clock.fastForward(301000);await page.waitForSelector('html[data-private-state="locked"]');await absent();await page.clock.resume();});
  await test('320-pixel layout has no horizontal overflow',async()=>{await page.setViewportSize({width:320,height:740});await visit();await unlock();const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(dimensions.scroll<=dimensions.client);await page.locator('#lock').click();await page.screenshot({path:path.join(out,'locked-320.png'),fullPage:true});});
  await test('Changed script under unchanged SRI does not execute',async()=>{await page.route('**/private-library/app.mjs',async route=>{const source=await fs.readFile(path.join(root,'private-library/app.mjs'),'utf8');await route.fulfill({status:200,contentType:'text/javascript',body:source+'\nwindow.privateIntegrityTamper=true;\n'});});await page.goto(origin+'/preview/private-library/index.html');assert.equal(await page.locator('html').getAttribute('data-private-state'),'loading');assert.equal(await page.evaluate(()=>window.privateIntegrityTamper),undefined);await absent();});
  assert.deepEqual(errors,[]);
  const report={status:'PASS',checks,network:network.map(url=>new URL(url).pathname),errors,limits:['Synthetic desktop Chromium at mobile CSS dimensions, not physical iPhone/Safari acceptance.','Test server substitutes a generated synthetic ciphertext; no real collection or password read.','No claim of physical erasure or resistance to a compromised hosting origin.']};
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');console.log(`Private library browser: ${checks.length} checks passed.`);
}finally{await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));}
