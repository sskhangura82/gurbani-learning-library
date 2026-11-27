import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=fileURLToPath(new URL("../",import.meta.url)),out=path.join(root,"evidence","knowledge-search");
const source=JSON.parse(await fs.readFile(path.join(root,"knowledge/scripture.json"),"utf8"));
const mime={".mjs":"text/javascript; charset=utf-8",".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer(async(req,res)=>{try{
 const file=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
 if(!file.startsWith(root))throw Error("outside");
 const bytes=await fs.readFile(file);res.writeHead(200,{"content-type":mime[path.extname(file)] || "text/plain","cache-control":"no-store"});res.end(bytes);
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const origin="http://127.0.0.1:"+server.address().port,url=origin+"/knowledge/index.html",report={status:"PASS",checks:[],errors:[],limits:["Desktop Chromium only, not iPhone Safari or VoiceOver.","Pilot only; no production deployment."]};
let browser;
async function check(name,fn){await fn();report.checks.push(name);}
const A="sggs.asa-di-vaar.pauri007.salok02",N="sggs.asa-di-vaar.pauri014.salok01";
try{
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 for(const width of [390,1440]){
  const ctx=await browser.newContext({viewport:{width,height:900}}),page=await ctx.newPage(),requests=[];
  page.on("pageerror",e=>report.errors.push(e.message));page.on("request",r=>requests.push(r.url()));
  await page.goto(url);await page.getByText(/Source files checked/).waitFor();
  const submit=async q=>{await page.locator("#query").fill(q);await page.getByRole("button",{name:"Search library",exact:true}).click();};
  await check(width+" unrelated searches are empty, meaningful result opens exact line",async()=>{
   for(const q of ["NASA","category"]){await submit(q);assert.equal(await page.locator("#results button").count(),0);}
   await submit("ਹਕੳਕਸੲਜ");await page.locator("#results button").click();
   await page.locator('[data-occurrence="'+A+'.line03"].selected-line').waitFor();
   assert.ok(page.url().includes(encodeURIComponent(A+".line03")));
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.occurrence),A+".line03");
   assert.deepEqual(await page.locator(".pankti").allTextContents(),source.passages.find(p=>p.id===A).occurrenceIds.map(id=>source.occurrences.find(o=>o.id===id).text));
   assert.equal(await page.locator(".line-label").getAttribute("lang"),"en");
   await page.waitForFunction(()=>{const r=document.querySelector(".selected-line").getBoundingClientRect();return r.top>=-2&&r.top<innerHeight;});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  });
  await check(width+" line link reload and browser Back/Forward retain identities",async()=>{
   await page.reload();await page.locator(".selected-line").waitFor();assert.equal(await page.locator(".selected-line").getAttribute("data-occurrence"),A+".line03");
   await page.goBack();await page.getByRole("heading",{name:"Humility",exact:true}).waitFor();
   await page.goForward();await page.locator(".selected-line").waitFor();assert.equal(await page.locator(".selected-line").getAttribute("data-occurrence"),A+".line03");
  });
  await check(width+" Back/Forward and reload retain depth and actual reading position",async()=>{
   await page.locator('#content button[data-result-id="concept.haumai"]').click();
   await page.getByRole("button",{name:"Deep study",exact:true}).click();assert.ok(page.url().includes("depth=deep"));
   await page.evaluate(()=>scrollTo(0,Math.min(1400,document.documentElement.scrollHeight-innerHeight)));
   await page.waitForFunction(()=>Math.abs(history.state.scroll-scrollY)<2 && scrollY>300);
   const y=await page.evaluate(()=>scrollY);
   await page.goBack();await page.waitForURL(u=>!u.hash.includes("depth=deep"));
   await page.goForward();await page.waitForURL(u=>u.hash.includes("depth=deep"));
   await page.waitForFunction(expected=>Math.abs(scrollY-expected)<3,y);
   await page.reload();await page.getByText(/Source files checked/).waitFor();
   await page.waitForFunction(expected=>Math.abs(scrollY-expected)<3,y);
   assert.equal(await page.locator('[data-depth="deep"]').getAttribute("aria-pressed"),"true");
  });
  await check(width+" immediate reload flushes reading position before the debounce",async()=>{
   await page.evaluate(()=>scrollTo(0,Math.min(1000,document.documentElement.scrollHeight-innerHeight)));
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const y=await page.evaluate(()=>scrollY);assert.ok(y>300);
   await page.reload();await page.getByText(/Source files checked/).waitFor();
   await page.waitForFunction(expected=>Math.abs(scrollY-expected)<3,y);
   assert.equal(await page.locator('[data-depth="deep"]').getAttribute("aria-pressed"),"true");
  });
  await check(width+" manual hash entry has a distinct reading-position identity",async()=>{
   await page.goto(url+"?entry=collision");await page.getByText(/Source files checked/).waitFor();
   await page.evaluate(()=>scrollTo(0,700));await page.waitForFunction(()=>history.state.scroll===700);
   const key=await page.evaluate(()=>history.state.entryKey);
   await page.evaluate(id=>{location.hash=new URLSearchParams({item:id,line:id+".line05"}).toString();},A);
   await page.locator(".selected-line").waitFor();
   assert.notEqual(await page.evaluate(()=>history.state.entryKey),key);
   await page.goBack();await page.getByRole("heading",{name:"Humility",exact:true}).waitFor();
   await page.waitForFunction(()=>Math.abs(scrollY-700)<3);
  });
  await check(width+" new same-document line link scrolls and focuses its target",async()=>{
   await page.evaluate(id=>{location.hash=new URLSearchParams({item:id,line:id+".line05"}).toString();},A);
   await page.locator('[data-occurrence="'+A+'.line05"].selected-line').waitFor();
   await page.waitForFunction(()=>{const r=document.querySelector(".selected-line").getBoundingClientRect();return r.top>=-2&&r.top<innerHeight;});
   assert.equal(await page.evaluate(()=>document.activeElement.dataset.occurrence),A+".line05");
  });
  await check(width+" old occurrence identity resolves and invalid links remain explicit",async()=>{
   await page.goto(url+"#sggs.opengranth-34d2a7c.ang470.row33");await page.locator(".selected-line").waitFor();
   assert.equal(await page.locator(".selected-line").getAttribute("data-occurrence"),N+".line04");
   for(const hash of ["item=missing","item="+A+"&line=missing","item="+A+"&line="+N+".line04","item="+A+"&depth=unknown"]){
    await page.goto(url+"#"+hash);await page.getByRole("heading",{name:"This learning link is unavailable"}).waitFor();assert.equal(await page.locator(".pankti").count(),0);
   }
  });
  await check(width+" Anywhere is explicit; Kabir author path reports limited coverage",async()=>{
   await page.locator("#mode").selectOption("first-letter");await submit("ਦਭੲਮ");assert.equal(await page.locator("#results button").count(),0);
   await page.locator("#mode").selectOption("first-letter-anywhere");await submit("ਦਭੲਮ");assert.equal(await page.locator("#results button").count(),1);
   await page.locator('#browse button[data-result-id="author.bhagat-kabir"]').click();
   assert.match(await page.locator("#content").innerText(),/1 selected passage/);
   await page.locator('#content button[data-result-id="sggs.kabir.salok007"]').click();assert.equal(await page.locator(".pankti").count(),2);
  });
  await check(width+" retrieval stays local, input text stays out of URLs and storage",async()=>{
   assert.ok(requests.every(r=>r.startsWith(origin)));
   assert.deepEqual(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})),{local:0,session:0});
   assert.ok(!page.url().includes(encodeURIComponent("ਦਭੲਮ")));
  });
  await fs.mkdir(out,{recursive:true});await page.screenshot({path:path.join(out,"search-"+width+".png"),fullPage:true});await ctx.close();
 }
 assert.deepEqual(report.errors,[]);
}catch(e){report.status="FAIL";report.failure=e.stack || String(e);process.exitCode=1;}
finally{if(browser)await browser.close();await new Promise(r=>server.close(r));await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,"browser.json"),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure || null}));}
