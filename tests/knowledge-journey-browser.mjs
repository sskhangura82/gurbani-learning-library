import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {LEARNING_KEY,JOURNEY_BINDING} from "../knowledge/learning.mjs";
const root=fileURLToPath(new URL("../",import.meta.url)),out=path.join(root,"evidence/knowledge-journey",new Date().toISOString().replace(/[:.]/g,"-"));
await fs.mkdir(out,{recursive:true});
const source=JSON.parse(await fs.readFile(path.join(root,"knowledge/scripture.json"))),passage=source.passages.find(p=>p.id===JOURNEY_BINDING.passageId),lines=passage.occurrenceIds.map(id=>source.occurrences.find(o=>o.id===id).text);
const mime={".mjs":"text/javascript; charset=utf-8",".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer(async(req,res)=>{try{const p=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));if(!p.startsWith(path.resolve(root)+path.sep))throw Error();const bytes=await fs.readFile(p);res.writeHead(200,{"content-type":mime[path.extname(p)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));const origin="http://127.0.0.1:"+server.address().port,url=origin+"/knowledge/index.html";
const report={status:"PASS",checks:[],errors:[],limits:["Synthetic notes in fresh desktop Chromium contexts only; no physical phone, Safari, VoiceOver or qualified content approval.","Qualified explanation and Gurmat practice remain empty; existing draft omission remains visible."]};
let browser;const requests=[];
async function check(name,fn){await fn();report.checks.push(name);}
async function fresh(options={}){
 const context=await browser.newContext({viewport:{width:390,height:844},timezoneId:"America/Los_Angeles",acceptDownloads:true,...options}),page=await context.newPage();
 page.on("pageerror",e=>report.errors.push(e.message));page.on("request",r=>requests.push({url:r.url(),data:r.postData()}));page.on("dialog",d=>d.type()==="beforeunload"?d.accept():d.dismiss());return {context,page};
}
async function ready(page,hash="#item=journey.haumai.v1&note=new"){await page.goto(url+hash);await page.getByText("Source files checked",{exact:false}).waitFor();}
async function record(page){return page.evaluate(key=>JSON.parse(localStorage.getItem(key)),LEARNING_KEY);}
async function first(page,returnDate="2020-01-01"){
 await page.locator("#journey-question").fill("SYNTHETIC question only");
 await page.locator("#journey-initialReflection").fill("SYNTHETIC initial private words");
 await page.locator("#journey-return-date").fill(returnDate);
 await page.getByRole("button",{name:"Save first reflection",exact:true}).click();
 await page.getByRole("button",{name:"Save later reflection",exact:true}).waitFor();
}
async function saveLater(page,text){
 await page.locator("#journey-laterReflection").fill(text);
 await page.getByRole("button",{name:"Save later reflection",exact:true}).click();
 await page.getByText(/Private reflection saved on this device|Both versions have been kept/).waitFor();
}
try{
 const executablePath=process.env.CHROMIUM_PATH||(process.platform==="darwin"?"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome":undefined);
 browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});report.environment={platform:process.platform,node:process.version,browser:browser.version(),executablePath:executablePath||chromium.executablePath()};
 const {context,page}=await fresh();
 await check("complete unchanged original with empty qualified slots and labelled optional drafts",async()=>{
  await ready(page);assert.deepEqual(await page.locator(".journey-original .pankti").allTextContents(),lines);
  assert.equal(await page.locator("[data-review-slot]").count(),2);
  assert.deepEqual(await page.locator("[data-review-slot]").evaluateAll(ns=>ns.map(n=>n.dataset.reviewStatus)),["AWAITING_QUALIFIED_REVIEW","AWAITING_QUALIFIED_REVIEW"]);
  assert.match(await page.locator(".journey-review").innerText(),/Awaiting qualified review/);
  await page.locator(".journey-review summary").click();assert.match(await page.locator(".journey-review").innerText(),/unresolved omission/);await page.locator(".journey-review summary").click();
  assert.equal(await page.locator("[data-content-kind=comparison]").count(),1);assert.equal(await page.locator("[data-review-slot] [data-content-kind=comparison]").count(),0);
 });
 await check("first reflection saved; earlier words protected; chosen past return visible on reload",async()=>{
  await first(page);assert.ok(await page.locator("#journey-initialReflection").evaluate(e=>e.readOnly));assert.ok(await page.locator("#journey-question").evaluate(e=>e.readOnly));assert.match(await page.locator(".journey-editor").innerText(),/return date has arrived/);
  await page.reload();await page.getByText("Source files checked",{exact:false}).waitFor();assert.equal(await page.locator("#journey-initialReflection").inputValue(),"SYNTHETIC initial private words");assert.equal((await record(page)).records.length,1);
 });
 await check("unsaved later reflection survives Saved and Back navigation without becoming an activity log",async()=>{
  await page.locator("#journey-laterReflection").fill("SYNTHETIC unsaved later");
  await page.locator("#journey-saved").click();assert.equal(await page.locator(".saved-reflection").count(),1);
  await page.goBack();await page.locator("#journey-laterReflection").waitFor();assert.equal(await page.locator("#journey-laterReflection").inputValue(),"SYNTHETIC unsaved later");
  assert.equal((await record(page)).records[0].laterReflection,"");await saveLater(page,"SYNTHETIC saved later");assert.equal((await record(page)).records[0].initialReflection,"SYNTHETIC initial private words");
 });
 await check("chosen week intention and clear option are explicit; no automatic notification or session record",async()=>{
  await page.getByRole("button",{name:"Return in a week",exact:true}).click();const date=await page.locator("#journey-return-date").inputValue();assert.match(date,/^\d{4}-\d\d-\d\d$/);
  await page.getByRole("button",{name:"No return date",exact:true}).click();await page.getByRole("button",{name:"Save later reflection",exact:true}).click();await page.getByText("Private reflection saved on this device.",{exact:true}).waitFor();
  const store=await record(page);assert.equal(store.records[0].returnOn,null);assert.deepEqual(Object.keys(store).sort(),["format","records","revision","version"]);
 });
 await check("stale two-tab edit preserves both later versions",async()=>{
  const second=await context.newPage();second.on("pageerror",e=>report.errors.push(e.message));second.on("dialog",d=>d.accept());await ready(second,new URL(page.url()).hash);
  await page.locator("#journey-laterReflection").fill("SYNTHETIC tab A");await second.locator("#journey-laterReflection").fill("SYNTHETIC tab B");
  await page.getByRole("button",{name:"Save later reflection",exact:true}).click();await page.getByText("Private reflection saved on this device.",{exact:true}).waitFor();
  await second.getByRole("button",{name:"Save later reflection",exact:true}).click();await second.getByText("Another edit was saved first. Both versions have been kept as separate notes.",{exact:true}).waitFor();
  const store=await record(second);assert.equal(store.records.length,2);assert.deepEqual(store.records.map(r=>r.laterReflection),["SYNTHETIC tab A","SYNTHETIC tab B"]);await second.close();
 });
 await check("real export/import controls restore notes and repeated imports do not duplicate them",async()=>{
  await page.locator("#journey-saved").click();const event=page.waitForEvent("download");await page.getByRole("button",{name:"Export Knowledge learning",exact:true}).click();const downloaded=await event;assert.equal(downloaded.suggestedFilename(),"Knowledge-learning.json");const bytes=await fs.readFile(await downloaded.path());
  const other=await fresh();await ready(other.page,"#item=knowledge.saved");await other.page.locator("#journey-import").setInputFiles({name:"Knowledge-learning.json",mimeType:"application/json",buffer:bytes});await other.page.getByText("Knowledge learning backup restored. Existing notes were kept.",{exact:true}).waitFor();assert.equal(await other.page.locator(".saved-reflection").count(),2);
  const before=await other.page.evaluate(k=>localStorage.getItem(k),LEARNING_KEY);await other.page.locator("#journey-import").setInputFiles({name:"Knowledge-learning.json",mimeType:"application/json",buffer:bytes});await other.page.getByText("This backup is already present. Your saved notes have not changed.",{exact:true}).waitFor();assert.equal(await other.page.evaluate(k=>localStorage.getItem(k),LEARNING_KEY),before);
  report.exportFixtureBytes=bytes.length;await other.context.close();
 });
 await check("Saved and editor private content excluded from print, while original stays visible",async()=>{
  await page.emulateMedia({media:"print"});assert.ok(await page.locator(".saved-reflection").first().isHidden());await page.emulateMedia({media:"screen"});
  await page.locator(".saved-reflection").first().getByRole("button",{name:"Open this reflection",exact:true}).click();await page.emulateMedia({media:"print"});assert.ok(await page.locator(".journey-editor").isHidden());assert.ok(await page.locator(".journey-original").isVisible());await page.emulateMedia({media:"screen"});
 });
 await check("layout fits phone, tablet and desktop viewport widths",async()=>{
  for(const width of [320,390,820,1440]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));if(width===390)await page.screenshot({path:path.join(out,"haumai-phone-width.png"),fullPage:true});}
 });
 await check("quota refusal preserves the original store and editable unsaved later words",async()=>{
  await page.evaluate(key=>{const set=Storage.prototype.setItem;window.restoreStorage=()=>Storage.prototype.setItem=set;Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException("quota","QuotaExceededError");return set.call(this,k,v);};},LEARNING_KEY);
  const before=await page.evaluate(k=>localStorage.getItem(k),LEARNING_KEY);await page.locator("#journey-laterReflection").fill("SYNTHETIC quota unsaved");await page.getByRole("button",{name:"Save later reflection",exact:true}).click();
  await page.getByText(/browser could not save this learning record/).waitFor();assert.equal(await page.evaluate(k=>localStorage.getItem(k),LEARNING_KEY),before);assert.equal(await page.locator("#journey-laterReflection").inputValue(),"SYNTHETIC quota unsaved");assert.ok(await page.locator("#journey-laterReflection").isEnabled());await page.evaluate(()=>window.restoreStorage());await saveLater(page,"SYNTHETIC recovered later");
 });
 await check("unavailable historical binding stays readable/exportable and cannot be opened on current source",async()=>{
  const store=await record(page),old={...store.records[0],id:"synthetic-historical",binding:{...JOURNEY_BINDING,editionId:"edition.sggs.older",passageSha256:"b".repeat(64)}};
  const payload=Buffer.from(JSON.stringify({...store,records:[old]}));await page.locator("#journey-import").setInputFiles({name:"Knowledge-learning.json",mimeType:"application/json",buffer:payload});await page.getByText("Knowledge learning backup restored. Existing notes were kept.",{exact:true}).waitFor();
  const card=page.locator('[data-note-id="synthetic-historical"]');assert.match(await card.innerText(),/source or lesson revision.*unavailable/);assert.equal(await card.getByRole("button",{name:"Open this reflection"}).count(),0);
 });
 await check("source rejection still permits recovery of private Saved records",async()=>{
  await page.route("**/knowledge/scripture.json",async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace("ਹਉਮੈ ਦੀਰਘ","ਸੋਧਿਆ ਦੀਰਘ")});});
  await page.reload();await page.getByText("Knowledge pack could not be verified. Source and teaching are unavailable.",{exact:true}).waitFor();assert.equal(await page.locator(".pankti").count(),0);assert.equal(await page.locator(".saved-reflection").count(),3);
  await page.locator("#journey-open").click();assert.match(await page.locator("#content").innerText(),/exact source or lesson revision is unavailable/);await page.locator("#journey-saved").click();assert.equal(await page.locator(".saved-reflection").count(),3);
 });
 await context.close();
 await check("missing Web Locks refuses save and keeps unsaved text",async()=>{
  const other=await fresh();await other.context.addInitScript(()=>Object.defineProperty(navigator,"locks",{value:{},configurable:true}));await ready(other.page);await other.page.locator("#journey-question").fill("SYNTHETIC unsupported browser");await other.page.getByRole("button",{name:"Save first reflection",exact:true}).click();await other.page.getByText(/cannot safely coordinate private note edits/).waitFor();assert.equal(await other.page.locator("#journey-question").inputValue(),"SYNTHETIC unsupported browser");assert.equal(await other.page.evaluate(k=>localStorage.getItem(k),LEARNING_KEY),null);await other.context.close();
 });
 await check("corrupted private record is preserved and not reset on opening or import",async()=>{
  const other=await fresh();await other.context.addInitScript(key=>localStorage.setItem(key,'{"format":"SYNTHETIC damaged"'),LEARNING_KEY);await ready(other.page);await other.page.getByText(/saved Knowledge learning record needs recovery/).waitFor();assert.equal(await other.page.locator("#journey-question").count(),0);assert.equal(await other.page.evaluate(k=>localStorage.getItem(k),LEARNING_KEY),'{"format":"SYNTHETIC damaged"');await other.context.close();
 });
 await check("private text never sent over the network or put in a URL",async()=>{
  assert.ok(requests.every(r=>r.url.startsWith(origin)));assert.ok(requests.every(r=>!r.url.includes("SYNTHETIC")&&!r.data));assert.deepEqual(report.errors,[]);
 });
}catch(error){report.status="FAIL";report.failure=error.stack||String(error);process.exitCode=1;}
finally{if(browser)await browser.close();await new Promise(r=>server.close(r));await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2)+"\n");console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure||null,out}));}
