// Real Chromium regression for the production source gates and browser-enforced SRI.
// Isolated localhost contexts only; all stored values are synthetic. No personal profile.
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),prefix='/gurbani-learning-library/';
const report={schema:'glp.source-integrity-browser.v1',startedAtUtc:new Date().toISOString(),engine:'Chromium',checks:[],runtimeErrors:[],limitations:['Ephemeral desktop Chromium on localhost; no physical iPhone or Safari verification.','A synthetic global-assignment interceptor mutates the source object after the browser accepts the original data script under SRI, before reader verification; served HTML and pinned reader bytes are unchanged.','Digest-delay coverage waits on the real WebCrypto result; it does not substitute a passing digest.']};
const kinds={
 japji:{html:'full-japji.html',data:'js/japji-full-data.js',reader:'js/japji-full.js',global:'GLP_FULL_JAPJI',field:'units',text:'text',root:'#continuous-reader',rows:'.scripture-line',count:385},
 sukhmani:{html:'sukhmani.html',data:'js/sukhmani-data.js',reader:'js/sukhmani-reader.js',global:'GLP_SUKHMANI',field:'ashtpadis',text:'gurmukhi',root:'#sukhmani-text',rows:'.sk-line',count:2027}
};
const storageKeys=['glp001.continuous.v2','glp001.sukhmani.v1'],sentinel='SYNTHETIC SOURCE INTEGRITY RECORD — preserve exact bytes';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2'};
const server=http.createServer(async(req,res)=>{
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}if(!pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const filename=path.resolve(root,pathname.slice(prefix.length)||'index.html');if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const data=await fs.readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
let browser;
async function run(kind,name,fn){
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>report.runtimeErrors.push({kind,scenario:name,error:e.message}));
 try{await fn(page,context,kinds[kind]);report.checks.push({kind,name,status:'passed'});}catch(e){report.checks.push({kind,name,status:'failed',error:e.stack||String(e)});}finally{await context.close();}
}
async function go(page,k){const response=await page.goto(origin+prefix+k.html);assert.equal(response.status(),200);}
async function ready(page,k){await page.locator(k.root+'[data-source-integrity="verified"]').waitFor();await page.waitForFunction(({root,rows,count})=>document.querySelectorAll(root+' '+rows).length===count,k);}
async function seed(context){await context.addInitScript(({keys,sentinel})=>{for(const key of keys)localStorage.setItem(key,sentinel);},{keys:storageKeys,sentinel});}
async function blocked(page,k){
 await page.locator(k.root+'[data-source-integrity="failed"]').waitFor();assert.equal(await page.locator(k.root+' '+k.rows).count(),0);assert.match(await page.locator(k.root).innerText(),/has not been displayed/);
 assert.ok(await page.locator('button').evaluateAll(nodes=>nodes.every(n=>n.id==='source-failure-export'?!n.disabled:n.disabled)));assert.ok(await page.locator('.end-note').evaluate(n=>n.hidden));
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#source-failure-export').click()]);
 const backup=JSON.parse(await fs.readFile(await download.path(),'utf8'));
 if(k.global==='GLP_FULL_JAPJI')assert.equal(backup.records[storageKeys[0]],sentinel);
 else assert.equal(backup.raw,sentinel);
 assert.deepEqual(await page.evaluate(keys=>keys.map(k=>localStorage.getItem(k)),storageKeys),storageKeys.map(()=>sentinel));
 assert.equal(await page.evaluate(()=>window.GLP_SOURCE_INTEGRITY_RECEIPT),undefined);
}
async function mutateSourceAssignment(page,k,mutation){
 await page.addInitScript(({global,field,text,mutation})=>{
  let stored;
  Object.defineProperty(window,global,{configurable:true,enumerable:true,get:()=>stored,set(value){
   const unit=value[field][4],line=unit.lines[1];
   if(mutation.type==='text'){line[text]=mutation.text;line.sha256=mutation.sha256;}
   else if(mutation.type==='missing-unit')value[field].splice(4,1);
   else if(mutation.type==='ang')line.ang++;
   else if(mutation.type==='reorder')[unit.lines[0],unit.lines[1]]=[unit.lines[1],unit.lines[0]];
   else throw Error('Unknown synthetic source mutation');
   stored=value;window.__GLP_SOURCE_MUTATION_APPLIED__=mutation.type;
  }});
 },{global:k.global,field:k.field,text:k.text,mutation});
}
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});report.browserVersion=browser.version();
 for(const kind of Object.keys(kinds)){
  await run(kind,'Unchanged published source passes SRI, every line hash and complete-object verification',async(page,context,k)=>{await go(page,k);await ready(page,k);const x=await page.evaluate(k=>{const d=window[k.global],line=d[k.field][4].lines[1],old=line[k.text],changed=Reflect.set(line,k.text,'unwanted later change');return {count:window.GLP_SOURCE_INTEGRITY_RECEIPT.lineHashesChecked,frozen:Object.isFrozen(d)&&Object.isFrozen(line),changed,unchanged:line[k.text]===old};},k);assert.equal(x.count,k.count);assert.equal(x.frozen,true);assert.equal(x.changed,false);assert.equal(x.unchanged,true);});
  await run(kind,'Pending real WebCrypto leaves scripture unrendered and controls disabled',async(page,context,k)=>{
   await context.addInitScript(()=>{const digest=crypto.subtle.digest.bind(crypto.subtle),waiting=[];window.__holdSourceIntegrity=true;window.__releaseSourceIntegrity=()=>{window.__holdSourceIntegrity=false;for(const resume of waiting.splice(0))resume();};crypto.subtle.digest=async(...args)=>{const result=await digest(...args);if(window.__holdSourceIntegrity)await new Promise(resolve=>waiting.push(resolve));return result;};});
   await go(page,k);await page.locator(k.root+'[data-source-integrity="checking"]').waitFor();assert.equal(await page.locator(k.root+' '+k.rows).count(),0);assert.ok(await page.locator('button').evaluateAll(nodes=>nodes.every(n=>n.disabled)));await page.evaluate(()=>window.__releaseSourceIntegrity());await ready(page,k);
  });
  await run(kind,'Browser SRI rejects a changed source JavaScript byte stream',async(page,context,k)=>{await seed(context);await page.route('**/'+k.data,async route=>{const raw=await fs.readFile(path.join(root,k.data),'utf8');await route.fulfill({status:200,contentType:'text/javascript; charset=utf-8',body:raw+'\n/* Deliberate SRI mismatch fixture. */\n'});});await go(page,k);await blocked(page,k);assert.equal(await page.evaluate(name=>typeof window[name],k.global),'undefined');});
  await run(kind,'Missing verification module fails closed',async(page,context,k)=>{await seed(context);await page.route('**/js/source-integrity.js',route=>route.abort('failed'));await go(page,k);await blocked(page,k);});
  await run(kind,'Valid synthetic learning exported from refused reader can be restored by the verified reader',async(page,context,k)=>{
   const japji=kind==='japji',key=storageKeys[japji?0:1],id=japji?'pauri02.line01':'sukhmani.a04.p02.l03',note='SYNTHETIC exact recovery · ਪੰਜਾਬੀ';
   const retainedKey='glp001.continuous.retained.v1',kept={notes:[{id:'synthetic.future.line',text:'SYNTHETIC retained',reason:'unknown_line'}],bookmarks:['synthetic.future.line']};
   const fixture=japji?{version:2,read:{id,offset:0},guide:{index:0,token:0},bookmarks:[id],notes:{[id]:note},keptAside:kept}:{version:2,read:id,guide:id,bookmarks:[id],notes:{[id]:note}};
   const raw=JSON.stringify(fixture),archive=JSON.stringify({version:1,keptAside:kept});
   await page.goto(origin+prefix+'index.html');
   await page.evaluate(({key,raw,japji,retainedKey,archive})=>{localStorage.setItem(key,raw);if(japji)localStorage.setItem(retainedKey,archive);},{key,raw,japji,retainedKey,archive});
   await page.route('**/js/source-integrity.js',route=>route.abort('failed'));await go(page,k);
   await page.locator(k.root+'[data-source-integrity="failed"]').waitFor();
   assert.equal(await page.locator(k.root+' '+k.rows).count(),0);
   const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#source-failure-export').click()]);
   const file=await fs.readFile(await dl.path(),'utf8'),exported=JSON.parse(file);
   assert.equal(japji?exported.records[key]:exported.raw,raw);
   if(japji)assert.equal(exported.records[retainedKey],archive);
   assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),raw);
   // A fresh context would also start empty. Clear ONLY this synthetic
   // localhost fixture, then reopen with the real verifier and import.
   await page.unroute('**/js/source-integrity.js');
   await page.evaluate(({key,retainedKey})=>{localStorage.removeItem(key);localStorage.removeItem(retainedKey);},{key,retainedKey});
   await go(page,k);await ready(page,k);
   if(japji){
    await page.waitForFunction(()=>!!window.GLP_CONTINUOUS_DEBUG);
    await page.locator('#explore').click();await page.locator('#dialog-body button[data-action="learning"]').click();
    await page.locator('#import-file').setInputFiles({name:'recovery.json',mimeType:'application/json',buffer:Buffer.from(file)});
    await page.locator('[data-action="apply-import"]').click();
   }else{
    await page.locator('#sk-tools').click();await page.locator('#sk-import').setInputFiles({name:'recovery.json',mimeType:'application/json',buffer:Buffer.from(file)});
   }
   await page.waitForFunction(({key,id,note})=>{const r=JSON.parse(localStorage.getItem(key)||'{}');return r.notes?.[id]===note&&r.bookmarks?.includes(id);},{key,id,note});
   if(japji){const restored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),retainedKey);assert.deepEqual(restored.keptAside,kept);}
  });
  const changed='ਬਦਲਿਆ ਹੋਇਆ ਪਾਠ ॥',changedHash=createHash('sha256').update(changed).digest('hex');
  const cases=[
   ['Changed text with matching stored hash is caught after legitimate SRI',{type:'text',text:changed,sha256:changedHash}],
   ['Missing source unit is caught before render',{type:'missing-unit'}],
   ['Changed Ang metadata is caught before render',{type:'ang'}],
   ['Reordered lines are caught before render',{type:'reorder'}]
  ];
  for(const [name,mutation] of cases)await run(kind,name,async(page,context,k)=>{await seed(context);await mutateSourceAssignment(page,k,mutation);await go(page,k);assert.equal(await page.evaluate(()=>window.__GLP_SOURCE_MUTATION_APPLIED__),mutation.type);await blocked(page,k);});
 }
 if(report.runtimeErrors.length)report.checks.push({name:'No uncaught runtime errors',status:'failed',errors:report.runtimeErrors});
}catch(e){report.setupError=e.stack||String(e);}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));report.completedAtUtc=new Date().toISOString();report.status=report.setupError||report.checks.some(x=>x.status!=='passed')?'FAIL':'PASS';await fs.writeFile(path.join(root,'evidence/source-integrity-browser-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,passed:report.checks.filter(x=>x.status==='passed').length,failed:report.checks.filter(x=>x.status!=='passed').length,setupError:report.setupError||null},null,2));if(report.status!=='PASS')process.exitCode=1;}
