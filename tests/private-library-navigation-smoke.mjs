// Combined-page smoke test. Never opens an actual encrypted pack or user profile.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.GLP_PLAYWRIGHT_MODULE||'playwright');
const directory=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const root=process.env.GLP_TARGET_DIRECTORY?await fs.realpath(process.env.GLP_TARGET_DIRECTORY):directory;
const out=process.env.GLP_SMOKE_OUTPUT?path.resolve(process.env.GLP_SMOKE_OUTPUT):path.join(directory,'evidence/continuation-navigation-smoke');
await fs.mkdir(out,{recursive:true});
const prefix='/glp-combined-test/',requests=[],errors=[],checks=[],sourceHashes={};
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);requests.push(pathname);
    if(!pathname.startsWith(prefix))throw Error('Outside synthetic mount');
    let relative=pathname.slice(prefix.length);if(!relative||relative.endsWith('/'))relative+='index.html';
    // Mandatory fixture boundary: never read the actual ciphertext, even by accident.
    if(relative==='private-library/collection.enc.json'){res.writeHead(404);res.end();return;}
    const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep))throw Error('Outside fixture');
    const bytes=await fs.readFile(file);sourceHashes[relative]=createHash('sha256').update(bytes).digest('hex');
    res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream','cache-control':'no-store'});res.end(bytes);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,...(process.env.GLP_CHROMIUM_EXECUTABLE?{executablePath:process.env.GLP_CHROMIUM_EXECUTABLE}:{}),args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:320,height:740},serviceWorkers:'block',reducedMotion:'reduce'});
const page=await context.newPage();page.setDefaultTimeout(15000);
page.on('pageerror',error=>errors.push(error.message));const external=[];
page.on('request',request=>{if(new URL(request.url()).origin!==origin)external.push(request.url());});
const go=async(route,ready)=>{const response=await page.goto(origin+prefix+route);assert.equal(response?.status(),200);if(ready)await page.waitForSelector(ready);};
const overflow=async()=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),'No horizontal overflow at 320 pixels');
const check=async(name,fn)=>{try{await fn();checks.push({name,status:'PASS'});}catch(error){checks.push({name,status:'FAIL',error:String(error.message)});throw error;}};
let failure;
try{
  await check('Public offline manifest excludes the private reader and ciphertext',async()=>{const worker=await fs.readFile(path.join(root,'sw.js'),'utf8');const manifest=JSON.parse(worker.match(/const EXPECTED=(\{[^\n]+\});/)[1]);assert.ok(Object.keys(manifest).every(key=>!key.includes('private-library/')));});
  await check('Read exposes the Dasam entrance and open/private navigation',async()=>{await go('index.html?view=read','html[data-library-state="ready"]');assert.equal(await page.locator('[data-collection="dasam"]').getAttribute('href'),'collections/dasam/index.html');for(const href of ['psychology/index.html','private-library/index.html'])assert.ok(await page.locator(`a[href="${href}"]`).count());await overflow();await page.screenshot({path:path.join(out,'read-320.png'),fullPage:true});});
  await check('Dasam exposes the full named edition and preserves its three existing readers',async()=>{await page.locator('[data-collection="dasam"]').click();assert.match(await page.locator('h1').innerText(),/Dasam/);assert.equal(await page.locator('[data-reader-id]').count(),3);for(const id of ['jaap','savaiye','chaupai'])assert.equal(await page.locator(`[data-reader-id="${id}"] a.action`).getAttribute('href'),'../../nitnem/index.html?bani='+id);assert.equal(await page.locator('#dasam-full-reader').getAttribute('href'),'read.html');assert.match(await page.locator('main').innerText(),/67,758 original-text records/);assert.equal(await page.locator('input[type="password"]').count(),0);await overflow();await page.screenshot({path:path.join(out,'dasam-320.png'),fullPage:true});});
  for(const id of ['jaap','savaiye','chaupai'])await check('Dasam link opens verified '+id+' source',async()=>{await go('collections/dasam/index.html');await page.locator(`[data-reader-id="${id}"] a.action`).click();await page.waitForFunction(id=>window.NITNEM_INTERNAL_QA?.getState().bani===id&&window.NITNEM_INTERNAL_QA.getState().sourceVerified,id);assert.equal(new URL(page.url()).searchParams.get('bani'),id);assert.ok(await page.locator('#source-unit .scripture-line').count());});
  await check('Explore exposes Psychology and password-protected reading',async()=>{await go('index.html?view=explore','html[data-library-state="ready"]');assert.equal(await page.locator('[data-explore-id="psychology"]').getAttribute('href'),'psychology/index.html');assert.equal(await page.locator('[data-explore-id="private-reading"]').getAttribute('href'),'private-library/index.html');await overflow();await page.screenshot({path:path.join(out,'explore-320.png'),fullPage:true});});
  await check('Psychology opens directly without a password',async()=>{await page.locator('[data-explore-id="psychology"]').click();assert.equal(await page.locator('h1').innerText(),'Psychology');assert.equal(await page.locator('input[type="password"]').count(),0);assert.ok(await page.locator('a[href="../knowledge/index.html#item=study.intellectual-humility"]').count());await overflow();await page.screenshot({path:path.join(out,'psychology-320.png'),fullPage:true});});
  await check('Private entrance is locked and does not request its actual collection',async()=>{await go('private-library/index.html','html[data-private-state="locked"]');assert.equal(await page.locator('#passphrase').inputValue(),'');assert.equal(await page.locator('#passages').textContent(),'');assert.equal(await page.locator('#reading').isVisible(),false);assert.ok(!requests.some(url=>url.endsWith('/private-library/collection.enc.json')));await overflow();await page.screenshot({path:path.join(out,'private-locked-320.png'),fullPage:true});});
  await check('No uncaught script failures or external requests during navigation',async()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);});
}catch(error){failure=error;}
finally{
  const report={status:failure?'FAIL':'PASS',checks,errors,external,sourceHashes,limits:['Fresh desktop Chromium context at320CSS pixels; not physical iPhone/Safari/VoiceOver.','Actual ciphertext route forcibly returns404 without reading its file. No passphrase is used.','Service workers are blocked for this navigation-only fixture; offline exclusion is checked in the manifest.','All reader-state changes are synthetic within this fresh temporary browser context.']};
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
}
if(failure){console.error('Combined navigation smoke failed: '+failure.message);process.exitCode=1;}else console.log('Combined navigation smoke: '+checks.length+' checks passed.');
