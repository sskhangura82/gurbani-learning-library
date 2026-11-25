// Real Chromium viewport and interaction acceptance of the nonpublishing Explore pilot.
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const prefix="/gurbani-learning-library/";
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".png":"image/png",".webmanifest":"application/manifest+json"};
const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,"http://localhost");if(!u.pathname.startsWith(prefix)){res.writeHead(404);res.end();return;}
  const relative=decodeURIComponent(u.pathname.slice(prefix.length))||"explore/index.html";
  const file=path.resolve(root,relative.endsWith("/")?relative+"index.html":relative);
  if(!(file===root||file.startsWith(root+path.sep))){res.writeHead(403);res.end();return;}
  const body=await fs.readFile(file);
  res.writeHead(200,{"content-type":mime[path.extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(body);
 }catch(_){res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin="http://127.0.0.1:"+server.address().port;
const url=origin+prefix+"explore/index.html";
const evidence={status:"PASS",browser:"Chromium",source:"local branch working tree",scenarios:[],runtimeErrors:[],limitations:["Chromium with phone/tablet/desktop viewports does not replace physical iPhone, iPad Safari or VoiceOver testing.","The new Explorer is not integrated with production offline caching or public navigation."]};
const snapshots=path.join(root,"evidence","explore-browser");
await fs.mkdir(snapshots,{recursive:true});
let browser;
async function check(name,fn){await fn();evidence.scenarios.push({name,status:"PASS"});}
try{
 browser=await chromium.launch({headless:true});
 for(const dims of [{width:390,height:844,label:"phone"},{width:820,height:1180,label:"ipad"},{width:1440,height:900,label:"desktop"}]){
  const context=await browser.newContext({viewport:{width:dims.width,height:dims.height},reducedMotion:"reduce"});
  const page=await context.newPage();
  const requests=[];page.on("request",r=>requests.push(r.url()));
  page.on("pageerror",e=>evidence.runtimeErrors.push({label:dims.label,error:e.message}));
  await check(dims.label+" loads structured lesson and respects viewport",async()=>{
   const response=await page.goto(url);assert.equal(response.status(),200);
   await page.locator("#lesson-nav button").first().waitFor();
   assert.equal(await page.locator("#lesson-nav button").count(),9);
   assert.match(await page.locator("#source-cue").innerText(),/ਆਦਿ ਸਚੁ/);
   assert.ok(await page.locator("#lesson-heading").isVisible());
   const layout=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,inner:window.innerWidth}));
   assert.ok(layout.scroll<=layout.inner+3,"horizontal page overflow "+JSON.stringify({label:dims.label,...layout}));
   assert.ok(requests.every(x=>x.startsWith(origin)),"No third-party requests allowed");
   await page.screenshot({path:path.join(snapshots,"explore-"+dims.label+".png"),fullPage:true,animations:"disabled"});
  });
  await check(dims.label+" selects Pauri 5 with source and interpretive caution",async()=>{
   await page.getByRole("button",{name:"Pauri 5",exact:true}).click();
   assert.match(await page.locator("#lesson-heading").innerText(),/limits of human control/i);
   assert.match(await page.locator("#source-cue").innerText(),/ਕੀਰੀ/);
   assert.match(await page.locator("#boundary-text").innerText(),/medical care|treatment|human agency/i);
   assert.match(await page.locator("#comparison-list").innerText(),/psychological flexibility/i);
  });
  await check(dims.label+" finds Hukam within authored guide, not generated prose",async()=>{
   await page.locator("#find-query").fill("What is Hukam?");
   await page.getByRole("button",{name:"Find teaching"}).click();
   assert.match(await page.locator("#lesson-heading").innerText(),/Recognition of Hukam/i);
   assert.match(await page.locator("#search-feedback").innerText(),/one source-linked example/i);
  });
  await check(dims.label+" does not invent teaching for unindexed ashtpadi",async()=>{
   await page.locator("#find-query").fill("Sukhmani Ashtpadi 12");
   await page.getByRole("button",{name:"Find teaching"}).click();
   const found=page.locator("#search-feedback a");
   assert.equal(await found.count(),1);
   assert.match(await found.getAttribute("href"),/sukhmani\.html#ashtpadi-12/);
  });
  await check(dims.label+" Surprise me selects another authored passage",async()=>{
   const before=await page.locator("#lesson-heading").innerText();
   await page.locator("#surprise").click();
   const after=await page.locator("#lesson-heading").innerText();
   assert.notEqual(before,after);
   assert.match(await page.locator("#search-feedback").innerText(),/curated lesson/i);
  });
  await check(dims.label+" unknown question stays local and is not fabricated",async()=>{
   await page.locator("#find-query").fill("Is the moon a quantum computer?");
   await page.getByRole("button",{name:"Find teaching"}).click();
   assert.match(await page.locator("#search-feedback").innerText(),/not authored a checked lesson/i);
   assert.ok(requests.every(x=>x.startsWith(origin)));
  });
  if(dims.label==="phone")await check("Keyboard can activate passage navigation and focus the lesson",async()=>{
   const btn=page.getByRole("button",{name:"Pauri 2",exact:true});
   await btn.focus();await page.keyboard.press("Enter");
   assert.match(await page.locator("#lesson-heading").innerText(),/Discernment/i);
   assert.equal(await page.evaluate(()=>document.activeElement.id),"lesson");
  });
  await context.close();
 }
 assert.equal(evidence.runtimeErrors.length,0,JSON.stringify(evidence.runtimeErrors));
}catch(e){evidence.status="FAIL";evidence.failure=e.stack||String(e);process.exitCode=1;}
finally{
 if(browser)await browser.close();
 await new Promise(resolve=>server.close(resolve));
 await fs.writeFile(path.join(snapshots,"report.json"),JSON.stringify(evidence,null,2)+"\n");
 console.log(JSON.stringify({status:evidence.status,checks:evidence.scenarios.length,runtimeErrors:evidence.runtimeErrors.length,failure:evidence.failure||null}));
}
