import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const prefix="/gurbani-learning-library/";
const types={".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,"http://localhost");if(!u.pathname.startsWith(prefix))throw Error("outside scope");const rel=decodeURIComponent(u.pathname.slice(prefix.length));const file=path.resolve(root,rel.endsWith("/")?rel+"index.html":rel);if(!file.startsWith(root+path.sep))throw Error("outside scope");res.writeHead(200,{"content-type":types[path.extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(await fs.readFile(file));}catch(e){if(!res.headersSent)res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));const origin="http://127.0.0.1:"+server.address().port, url=origin+prefix+"hukamnama/index.html";
const out=path.join(root,"evidence","hukamnama-browser");await fs.mkdir(out,{recursive:true});
const report={status:"PASS",scenarios:[],errors:[],limits:["Chromium viewport emulation only; no actual iPhone/iPad or VoiceOver","No daily provider adapter, audio playback or production offline integration"]};
const check=async(name,fn)=>{await fn();report.scenarios.push({name,status:"PASS"});};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const d of [{width:320,height:700,label:"narrow-phone"},{width:390,height:844,label:"phone"},{width:820,height:1180,label:"tablet"},{width:1440,height:900,label:"desktop"}]){
  const ctx=await browser.newContext({viewport:{width:d.width,height:d.height}});
  const page=await ctx.newPage();await page.clock.install({time:new Date("2026-11-26T03:00:00Z")});
  page.on("pageerror",e=>report.errors.push(e.message));const requests=[];page.on("request",r=>requests.push(r.url()));
  await check(d.label+" opens exact complete dated example without overflow",async()=>{await page.goto(url);await page.locator("#reading").waitFor();assert.equal(await page.locator(".pankti").count(),19);assert.match(await page.locator("#status").innerText(),/not a released/);assert.match(await page.locator(".pankti").last().innerText(),/॥੮॥੪॥/);assert.equal(await page.locator('[data-kind="rahao"]').count(),2);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));await page.screenshot({path:path.join(out,d.label+".png"),fullPage:true});});
  await check(d.label+" alternate date reuses identical source and restores correct date",async()=>{const old=await page.locator("#scripture").innerText();await page.getByRole("button",{name:"14 Oct 2025",exact:true}).click();assert.match(await page.locator("#meta").innerText(),/2025-10-14/);assert.equal(await page.locator("#scripture").innerText(),old);});
  await check(d.label+" held variant clears all scripture, no substitute",async()=>{await page.getByRole("button",{name:/25 Nov 2017/}).click();assert.ok(await page.locator("#reading").isHidden());assert.equal(await page.locator(".pankti").count(),0);assert.match(await page.locator("#status").innerText(),/encoding difference/);});
  await check(d.label+" current Amritsar date pending, no stale reading or outbound requests",async()=>{await page.getByRole("button",{name:"Today in Amritsar"}).click();assert.equal(await page.locator("#date").inputValue(),"2026-11-26");assert.match(await page.locator("#status").innerText(),/not available/);assert.equal(await page.locator(".pankti").count(),0);assert.ok(requests.every(r=>r.startsWith(origin)));});
  await ctx.close();
 }
 const ctx=await browser.newContext();const p=await ctx.newPage();
 await p.route("**/hukamnama/fixture.json",async route=>{const r=await route.fetch(),body=await r.text();await route.fulfill({response:r,body:body.replace("Guru Nanak Dev Ji","Altered author")});});
 await check("Corrupted fixture refuses to display any source",async()=>{await p.goto(url);await p.getByText(/pinned source fixture could not be verified/).waitFor();assert.equal(await p.locator(".pankti").count(),0);assert.ok(await p.locator("#reading").isHidden());assert.ok(await p.locator("#open").isDisabled());});await ctx.close();
 assert.deepEqual(report.errors,[]);
}catch(e){report.status="FAIL";report.failure=e.stack||String(e);process.exitCode=1;}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.scenarios.length,failure:report.failure||null}));}
