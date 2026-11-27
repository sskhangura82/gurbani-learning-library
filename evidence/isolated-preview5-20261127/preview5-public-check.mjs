import {chromium} from './source/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const root='/tmp/glp001-iphoneqa-20261126/isolated-preview-next',output='/tmp/glp001-preview5-public-check-20261127';await fs.mkdir(output,{recursive:true});
const verification=JSON.parse(await fs.readFile(path.join(root,'qa-verification.json'),'utf8'));const checks=[];
let pins=0;for(const entry of [...verification.htmlAdaptations,{path:'preview.html'}]){
 const html=await fs.readFile(path.join(root,entry.path),'utf8');
 for(const script of html.matchAll(/<script\b([^>]*)>/g)){
  const src=script[1].match(/\bsrc="([^"]+)"/);if(!src)continue;
  const sri=script[1].match(/\bintegrity="(sha(?:256|384|512))-([^"]+)"/);assert.ok(sri,entry.path+' '+src[1]);
  const bytes=await fs.readFile(path.resolve(root,path.dirname(entry.path),src[1]));assert.equal(createHash(sri[1]).update(bytes).digest('base64'),sri[2]);pins++;
 }
}
checks.push({name:'All runtime script integrity pins preserved, including preview update handler',passed:true,pins});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install({time:new Date('2026-11-27T12:00:00Z')});
const base='https://glp001-iphone-qa.github.io/glp001-iphone-test/';
async function visit(p){await page.goto(base+p);await page.locator('.glp-qa-banner').waitFor();assert.ok(await page.locator('.glp-qa-banner').innerText().then(t=>t.includes('Preview 5')));}
try{
 await visit('preview.html');await page.screenshot({path:path.join(output,'phone-width-preview.png'),fullPage:true});
 await visit('index.html');await page.waitForSelector('html[data-library-state="ready"]');assert.equal(await page.locator('.library-nav a[data-view]').count(),4);
 for(const view of ['read','explore','saved','today']){await page.locator('.library-nav a[data-view="'+view+'"]').click();assert.equal(await page.locator('.library-nav a[data-view="'+view+'"]').getAttribute('aria-current'),'page');}
 checks.push({name:'All four library entrances open on the reviewed preview',passed:true});
 await visit('hukamnama/index.html?date=2026-11-27');await page.locator('#reading').waitFor({state:'visible'});
 const files=await fs.readdir(path.join(root,'hukamnama/sources')),source=JSON.parse(await fs.readFile(path.join(root,'hukamnama/sources',files[0]),'utf8'));
 assert.deepEqual(await page.locator('.original-text').allTextContents(),source.occurrences.map(x=>x.text));
 await page.screenshot({path:path.join(output,'phone-width-daily.png'),fullPage:true});
 for(const panel of ['simple','detailed']){await page.locator('.destinations [data-panel="'+panel+'"]').click();assert.ok(await page.locator('#'+panel+'-pending').isVisible());assert.equal(await page.locator('#'+panel+'-content').innerText(),'');}
 await page.locator('.destinations [data-panel="learning"]').click();await page.locator('#question').fill('SYNTHETIC PREVIEW5 QUESTION');await page.locator('#reflection').fill('SYNTHETIC PREVIEW5 REFLECTION');await page.locator('#save-note').click();await page.waitForFunction(()=>document.getElementById('note-status').textContent.includes('saved on this device'));
 const record=await page.evaluate(()=>localStorage.getItem('glp001.hukamnama.learning.v1'));assert.ok(record.includes('SYNTHETIC PREVIEW5 REFLECTION'));
 await page.reload();await page.locator('#question').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>localStorage.getItem('glp001.hukamnama.learning.v1')),record);
 checks.push({name:'Exact complete Daily original, honest explanation slots and synthetic saved note survive reload',passed:true});
 await visit('knowledge/index.html');await page.locator('#search-button:not([disabled])').waitFor();
 for(const query of ['NASA','category']){await page.locator('#query').fill(query);await page.getByRole('button',{name:'Search library',exact:true}).click();assert.equal(await page.locator('#results button').count(),0);}
 await page.locator('#mode').selectOption('phrase');await page.locator('#query').fill('ਹਉਮੈ');await page.getByRole('button',{name:'Search library',exact:true}).click();await page.locator('#results button').first().waitFor();await page.locator('#results button').first().click();await page.locator('.pankti').first().waitFor();
 await page.screenshot({path:path.join(output,'phone-width-knowledge.png'),fullPage:true});checks.push({name:'Reviewed Knowledge search opens a source passage and excludes prior false matches',passed:true});
 for(const location of ['salok-mahalla9/index.html?bani=salok-mahalla9','salok-kabir/index.html?bani=salok-kabir']){await visit(location);await page.waitForFunction(()=>window.NITNEM_INTERNAL_QA?.getState().sourceVerified===true);assert.ok(await page.locator('#source-unit .scripture-line').count()>0);}
 checks.push({name:'Both complete Salok readers render source-verified packages',passed:true});
 await visit('full-japji.html');await page.locator('#continuous-reader[data-source-integrity="verified"] .scripture-line[data-occurrence]').first().waitFor();
 await visit('sukhmani.html');await page.locator('[data-line-id]').first().waitFor();checks.push({name:'Japji and Sukhmani render on the staged copy',passed:true});
 await visit('preview.html');await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{},{timeout:30000});
 const active=await page.evaluate(async()=>{const r=await navigator.serviceWorker.ready;return !!r.active;});assert.equal(active,true);
 await visit('hukamnama/index.html?date=2026-11-27');await page.locator('#reading').waitFor({state:'visible'});await ctx.setOffline(true);await page.reload();await page.locator('#reading').waitFor({state:'visible'});assert.deepEqual(await page.locator('.original-text').allTextContents(),source.occurrences.map(x=>x.text));await ctx.setOffline(false);
 checks.push({name:'Fresh desktop context reopens the cached exact dated original offline',passed:true});
 assert.deepEqual(errors,[]);verification.browserStagingChecks='PASS_ON_BOUNDED_DESKTOP_CHECKS';verification.browser='Desktop Chrome '+browser.version();verification.physicalPhoneChecks='NOT_PERFORMED';
 await fs.writeFile(path.join(output,'summary.json'),JSON.stringify({sourceCommit:verification.sourceCommit,checks,errors,browser:browser.version(),physicalDeviceTest:false,actualLearnerDataRead:false},null,2)+'\n');console.log(JSON.stringify({status:'PASS',checks,output}));
}catch(e){await fs.writeFile(path.join(output,'failure.json'),JSON.stringify({message:e.message,checks,errors,physicalDeviceTest:false},null,2)+'\n');throw e;}finally{await ctx.close();await browser.close();}
