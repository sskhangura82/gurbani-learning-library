import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {sealCollection,LINK_ONLY_NOTICE,LINK_ONLY_PERMISSION} from '../private-library/app.mjs';
const {chromium}=await import(process.env.GLP_PLAYWRIGHT_MODULE||'playwright');
const root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'evidence/private-library/browser/pin-20261127');
await fs.mkdir(out,{recursive:true});
const password='004261'; // Public synthetic fixture PIN, never an owner credential.
const other='004262';
const sentinel='SYNTHETIC PRIVATE SENTINEL';
const source={schema:'glp.private-collection.v1',title:'Synthetic private collection',editionId:'synthetic-v1',works:[{id:'synthetic-text',tradition:'bible',title:'Synthetic title',language:'English',edition:'Synthetic test fixture · no scripture',source:{url:'https://example.invalid/synthetic',rights:'public-domain',attribution:'Entirely synthetic test data.',checkedOn:'2026-11-27',permissionRef:''},paragraphs:[sentinel,'<img src="https://example.invalid/leak" onerror="window.privateLeak=true">',...Array.from({length:54},(_,i)=>`Synthetic paragraph ${i+3}`)]}]};
source.works.push({id:'synthetic-link',tradition:'tibetan-buddhist',title:'Synthetic Tibetan reference',language:'English',edition:'External reference only',source:{url:'https://example.invalid/reading-room',rights:'link-only',attribution:'Synthetic publisher reference.',checkedOn:'2026-11-27',permissionRef:LINK_ONLY_PERMISSION},paragraphs:[LINK_ONLY_NOTICE]});
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
// Install before the first navigation, so every reader interval uses one clock.
await page.clock.install();
page.on('request',request=>network.push(request.url()));page.on('pageerror',error=>errors.push(error.message));
const checks=[];const test=async(name,fn)=>{try{await fn();checks.push({name,status:'PASS'});}catch(error){checks.push({name,status:'FAIL',error:error.message});throw error;}};
const visit=async()=>{await page.goto(origin+'/preview/private-library/index.html');await page.waitForSelector('html[data-private-state="locked"]');};
const unlock=async(pass=password,state='unlocked')=>{await page.locator('#passphrase').fill(pass);await page.locator('#unlock').click();await page.waitForSelector(`html[data-private-state="${state}"]`);};
const absent=async()=>{assert.ok(!(await page.locator('body').innerText()).includes(sentinel));assert.equal(await page.locator('#passages').textContent(),'');assert.equal(await page.locator('#passphrase').inputValue(),'');};
let failure,wrongMessage;
try{
  await test('Locked page contains no private titles or plaintext',async()=>{await visit();await absent();assert.ok(!(await page.locator('body').innerText()).includes(source.title));await page.screenshot({path:path.join(out,'locked-390.png'),fullPage:true});});
  await test('PIN form is masked with six-digit constraints and a numeric mobile keyboard',async()=>{const input=page.locator('#passphrase');for(const [attribute,value] of Object.entries({type:'password',inputmode:'numeric',pattern:'[0-9]{6}',minlength:'6',maxlength:'6',enterkeyhint:'go',autocomplete:'off'}))assert.equal(await input.getAttribute(attribute),value);assert.equal(await page.locator('label[for="passphrase"]').innerText(),'Six-digit PIN');assert.equal(await page.getByRole('button',{name:/passphrase/i}).count(),0);assert.match(await page.locator('.privacy-note').allTextContents().then(parts=>parts.join(' ')),/casual privacy/);});
  await test('Malformed and short PINs cannot submit or fetch the encrypted file',async()=>{const before=requests.filter(url=>url.includes('/collection.enc.json')).length;for(const value of ['12345','1234567','12a456','１２３４５６',' 04261','SYNTHETIC-ONLY-legacy-passphrase-8261']){await page.locator('#passphrase').evaluate((input,value)=>{input.value=value;},value);assert.equal(await page.locator('#passphrase').evaluate(input=>input.checkValidity()),false);await page.locator('#unlock').click();assert.equal(await page.locator('html').getAttribute('data-private-state'),'locked');assert.equal(requests.filter(url=>url.includes('/collection.enc.json')).length,before);}await page.locator('#passphrase').fill('');});
  await test('Bypassing browser constraints still refuses and clears malformed PIN input',async()=>{const before=requests.filter(url=>url.includes('/collection.enc.json')).length;await page.locator('#passphrase').evaluate(input=>{input.value='12a456';});await page.locator('#unlock-form').evaluate(form=>form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));await absent();assert.match(await page.locator('#status').innerText(),/six-digit PIN/);assert.equal(requests.filter(url=>url.includes('/collection.enc.json')).length,before);});
  await test('Missing collection reports setup pending',async()=>{mode='missing';await unlock(password,'setup-pending');await absent();assert.match(await page.locator('#status').innerText(),/not configured/);mode='normal';});
  await test('Wrong six-digit PIN reveals no content',async()=>{await visit();await unlock(other,'refused');await absent();wrongMessage=await page.locator('#status').innerText();});
  await test('Altered ciphertext reveals no content and uses the same refusal',async()=>{mode='tampered';await visit();await unlock(password,'refused');await absent();assert.equal(await page.locator('#status').innerText(),wrongMessage);mode='normal';});
  await test('Leading-zero PIN renders inert text, clears the PIN and paginates',async()=>{await visit();await page.locator('#passphrase').fill(password);assert.equal(await page.locator('#passphrase').inputValue(),'004261');await page.locator('#unlock').click();await page.waitForSelector('html[data-private-state="unlocked"]');assert.equal(await page.locator('#passphrase').inputValue(),'');assert.equal(await page.locator('#passages p').count(),50);assert.equal(await page.locator('#passages img').count(),0);assert.equal(await page.evaluate(()=>window.privateLeak),undefined);assert.match(await page.locator('#passages').innerText(),/onerror/);await page.locator('#next').click();assert.equal(await page.locator('#passages p').count(),6);await page.locator('#previous').click();await page.screenshot({path:path.join(out,'unlocked-synthetic-390.png'),fullPage:true});});
  await test('No private storage, outbound request or URL parameters',async()=>{assert.deepEqual(await page.evaluate(()=>({writes:window.privateWrites,local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{writes:[],local:[],session:[]});assert.ok(network.every(url=>url.startsWith(origin+'/')));assert.ok(network.every(url=>!url.includes(sentinel)&&!url.includes(password)));assert.equal(new URL(page.url()).search,'');assert.equal(new URL(page.url()).hash,'');});
  await test('Local text filter shows link-only source and clears unmatched content',async()=>{await page.locator('#work-filter').fill('tibetan');assert.equal(await page.locator('#work-select option').count(),1);assert.equal(await page.locator('#passages p').innerText(),LINK_ONLY_NOTICE);assert.equal(await page.locator('#passages a').getAttribute('href'),'https://example.invalid/reading-room');assert.equal(await page.locator('#page-status').innerText(),'External reference');await page.locator('#work-filter').fill('no-match-synthetic');assert.equal(await page.locator('#work-select option').count(),0);assert.equal(await page.locator('#passages').textContent(),'');await page.locator('#work-filter').fill('');await page.locator('#work-select').selectOption('0');});
  await test('Manual lock removes all plaintext, filters and source metadata',async()=>{await page.locator('#lock').click();await absent();assert.equal(await page.locator('#source').textContent(),'');assert.equal(await page.locator('#work-select option').count(),0);assert.equal(await page.locator('#work-filter').inputValue(),'');assert.equal(await page.locator('#work-count').textContent(),'');});
  await test('Hiding the page clears the private view',async()=>{await unlock();await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await absent();await page.evaluate(()=>{delete document.hidden;});});
  await test('Printing locks the view and CSS excludes private content',async()=>{await unlock();await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await absent();await page.emulateMedia({media:'print'});assert.equal(await page.locator('main').isVisible(),false);assert.equal(await page.locator('.print-note').isVisible(),true);await page.emulateMedia({media:'screen'});});
  await test('Reload and Back restore a locked view',async()=>{await unlock();await page.reload();await page.waitForSelector('html[data-private-state="locked"]');await absent();await unlock();await page.goto(origin+'/preview/away.html');await page.goBack();await page.waitForSelector('html[data-private-state="locked"]');await absent();});
  await test('Lock during an in-flight decrypt cannot reopen content',async()=>{
    await page.evaluate(()=>{const decrypt=crypto.subtle.decrypt.bind(crypto.subtle);window.decryptStarted=false;crypto.subtle.decrypt=async(...args)=>{window.decryptStarted=true;const result=await decrypt(...args);await new Promise(r=>setTimeout(r,300));return result;};});
    await page.locator('#passphrase').fill(password);await page.locator('#unlock').click();await page.waitForFunction(()=>window.decryptStarted);await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await page.waitForTimeout(500);await absent();assert.equal(await page.locator('html').getAttribute('data-private-state'),'locked');
  });
  await test('Inactivity stays unlocked at four minutes and locks after five',async()=>{await visit();await unlock();await page.clock.fastForward(240000);assert.equal(await page.locator('html').getAttribute('data-private-state'),'unlocked');await page.clock.fastForward(61000);await page.waitForSelector('html[data-private-state="locked"]');await absent();await page.clock.resume();});
  await test('320-pixel layout has no horizontal overflow',async()=>{await page.setViewportSize({width:320,height:740});await visit();await unlock();const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));assert.ok(dimensions.scroll<=dimensions.client);await page.locator('#lock').click();await page.screenshot({path:path.join(out,'locked-320.png'),fullPage:true});});
  await test('Changed script under unchanged SRI does not execute',async()=>{await page.route('**/private-library/app.mjs',async route=>{const source=await fs.readFile(path.join(root,'private-library/app.mjs'),'utf8');await route.fulfill({status:200,contentType:'text/javascript',body:source+'\nwindow.privateIntegrityTamper=true;\n'});});await page.goto(origin+'/preview/private-library/index.html');assert.equal(await page.locator('html').getAttribute('data-private-state'),'loading');assert.equal(await page.evaluate(()=>window.privateIntegrityTamper),undefined);await absent();});
  assert.deepEqual(errors,[]);
}catch(error){failure=error;}
finally{
  const sourceHashes={};for(const name of ['private-library/app.mjs','private-library/index.html','private-library/private-library.css','tests/private-library-browser.mjs'])sourceHashes[name]=createHash('sha256').update(await fs.readFile(path.join(root,name))).digest('hex');
  const report={status:failure?'FAIL':'PASS',checks,network:network.map(url=>new URL(url).pathname),errors,failure:failure?.message||null,sourceHashes,environment:{node:process.version,platform:process.platform,browser:browser.version()},limits:['Synthetic desktop Chromium at mobile CSS dimensions, not physical iPhone/Safari acceptance.','Test server substitutes a generated synthetic ciphertext; no real collection or owner PIN read.','The six-digit PIN gives casual privacy and does not resist exhaustive offline guessing.','No claim of physical erasure or resistance to a compromised hosting origin.']};
  await fs.writeFile(path.join(out,'results.json'),JSON.stringify(report,null,2)+'\n');
  await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));
}
if(failure)throw failure;
console.log(`Private library browser: ${checks.length} checks passed.`);
