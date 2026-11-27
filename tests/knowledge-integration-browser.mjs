import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";
import {chromium} from "playwright";
import {sha256} from "../knowledge/registry.mjs";

const root=path.resolve(fileURLToPath(new URL("../",import.meta.url))),base="f720099b6181919d597e249f9ad42b9f00cabe68";
const stamp=new Date().toISOString().replace(/[:.]/g,"-"),out=path.join(root,"evidence","knowledge-integration",stamp+"-browser");
await fs.mkdir(out,{recursive:true});
const sourceBytes=await fs.readFile(path.join(root,"knowledge/scripture.json")),teachingBytes=await fs.readFile(path.join(root,"knowledge/pilot.json"));
const source=JSON.parse(sourceBytes),teaching=JSON.parse(teachingBytes);
const N="sggs.asa-di-vaar.pauri014.salok01",A="sggs.asa-di-vaar.pauri007.salok02",K="sggs.kabir.salok007";
const canonical=id=>{const p=source.passages.find(x=>x.id===id);assert.ok(p,"Existing source fixture "+id);return p.occurrenceIds.map(x=>source.occurrences.find(o=>o.id===x).text);};
const firstVerse=source.occurrences.find(o=>o.id===N+".line01").text;
const report={status:"PASS",started:new Date().toISOString(),base,criteria:"2026-11-27T010603Z-criteria.md",checks:[],failures:[],pageErrors:[],limits:["Builder interaction verification in fresh synthetic desktop Chrome contexts at 390px.","Not Claude independent review, physical iPhone/Safari/VoiceOver, qualified review or release approval."]};
const mime={".mjs":"text/javascript; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".html":"text/html; charset=utf-8"};
const server=http.createServer(async(req,res)=>{try{
 const p=path.resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
 if(!p.startsWith(root+path.sep))throw Error("outside");
 const bytes=await fs.readFile(p);res.writeHead(200,{"content-type":mime[path.extname(p)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const origin="http://127.0.0.1:"+server.address().port,url=origin+"/knowledge/index.html";
let browser;
async function open({mutateTeaching,corruptSource}={}){
 const ctx=await browser.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage(),requests=[];
 page.setDefaultTimeout(8000);
 page.on("pageerror",e=>report.pageErrors.push(e.message));
 page.on("request",r=>requests.push(r.url()));
 if(mutateTeaching){
  const e=structuredClone(teaching);mutateTeaching(e);const bytes=Buffer.from(JSON.stringify(e)),pin=await sha256(bytes);
  await page.route("**/knowledge/pilot.json",r=>r.fulfill({status:200,contentType:"application/json",body:bytes}));
  await page.route("**/knowledge/app.mjs",async r=>{
   const response=await r.fetch(),body=await response.text();
   assert.equal((body.match(/PACK_SHA256="[a-f0-9]{64}"/g)||[]).length,1,"One teaching pin to reseal");
   await r.fulfill({response,body:body.replace(/PACK_SHA256="[a-f0-9]{64}"/,'PACK_SHA256="'+pin+'"')});
  });
 }
 if(corruptSource){
  const s=structuredClone(source);s.occurrences.find(o=>o.kind==="verse").text+=" ਮ";
  await page.route("**/knowledge/scripture.json",r=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(s)}));
 }
 return {ctx,page,requests};
}
async function loaded(page,address=url){await page.goto(address);await page.locator("#search-button:not([disabled])").waitFor();}
async function query(page,value,mode="auto"){await page.locator("#mode").selectOption(mode);await page.locator("#query").fill(value);await page.getByRole("button",{name:"Search library",exact:true}).click();}
async function scripture(page,id){
 assert.deepEqual(await page.locator("#content .pankti").allTextContents(),canonical(id));
 assert.equal(await page.locator("#content .scripture").getAttribute("data-content-kind"),"scripture");
 assert.equal(await page.locator(".scripture .editorial-copy,.scripture .editorial-pa,.scripture .editorial-note,.scripture [data-content-kind=editorial]").count(),0);
}
async function check(name,options,fn){
 const {ctx,page,requests}=await open(options);
 try{await fn(page,requests);assert.ok(requests.every(u=>u.startsWith(origin)),"All page requests remain local");report.checks.push({name,status:"PASS"});}
 catch(e){report.status="FAIL";const failure={name,status:"FAIL",error:e.stack||String(e)};report.checks.push(failure);report.failures.push(failure);await page.screenshot({path:path.join(out,"failure-"+report.checks.length+".png"),fullPage:true}).catch(()=>{});}
 finally{await ctx.close();}
}
try{
 const preflight=await fetch(url);assert.equal(preflight.status,200,"Local harness must serve the control page");
 const executablePath=process.env.CHROMIUM_PATH||(process.platform==="darwin"?"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome":undefined);
 browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 report.environment={node:process.version,platform:process.platform,browser:browser.version()};
 report.files={};
 for(const p of ["knowledge/app.mjs","knowledge/core.mjs","knowledge/search.mjs","knowledge/kinds.mjs","knowledge/scripture.json","knowledge/pilot.json","knowledge/registry.mjs","knowledge/source-lock.mjs"])report.files[p]=await sha256(await fs.readFile(path.join(root,p)));
 await check("Search/navigation integration retains exact lines, separate kinds, Back/Forward, reload and deep-link refusal",{},async page=>{
  await loaded(page);
  for(const q of ["NASA","category"]){await query(page,q);assert.equal(await page.locator("#results button").count(),0,q);}
  await query(page,"ਫਫਫਬਕਨਆਪ","first-letter");
  const result=page.locator('#results [data-result-id="'+N+'"]');
  assert.match(await result.getAttribute("class"),/result-scripture/);
  assert.match(await result.innerText(),/Original Gurbani · digital source/);assert.match(await result.locator("..").innerText(),/source indexing/);
  await result.click();await page.locator('[data-occurrence="'+N+'.line03"].selected-line').waitFor();
  await scripture(page,N);
  await page.screenshot({path:path.join(out,"canonical-source-and-editorial-separation.png"),fullPage:true});
  await page.goBack();await page.getByRole("heading",{name:"Humility",exact:true}).waitFor();
  assert.equal(await page.locator("#content h2").getAttribute("data-content-kind"),"editorial");
  await page.goForward();await page.locator('[data-occurrence="'+N+'.line03"].selected-line').waitFor();
  await page.reload();await page.locator('[data-occurrence="'+N+'.line03"].selected-line').waitFor();await scripture(page,N);
  await loaded(page,url+"#"+new URLSearchParams({item:"concept.haumai",depth:"deep"}));
  assert.equal(await page.locator('[data-depth="deep"]').getAttribute("aria-pressed"),"true");
  assert.equal(await page.locator("#content h2").getAttribute("data-content-kind"),"editorial");
  await page.reload();await page.getByText(/Source files checked/).waitFor();assert.equal(await page.locator('[data-depth="deep"]').getAttribute("aria-pressed"),"true");
  await query(page,"ਦਭੲਮ","first-letter");assert.equal(await page.locator("#results button").count(),0);
  await query(page,"ਦਭੲਮ","first-letter-anywhere");await page.locator('#results [data-result-id="'+A+'"]').click();
  await page.locator('[data-occurrence="'+A+'.line05"].selected-line').waitFor();await scripture(page,A);
  await loaded(page,url+"#"+new URLSearchParams({item:A,line:N+".line03"}));
  await page.getByRole("heading",{name:"This learning link is unavailable",exact:true}).waitFor();assert.equal(await page.locator(".pankti").count(),0);
  assert.deepEqual(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})),{local:0,session:0});
 });
 await check("Editorial author aliases stay labelled while real source hits select exact occurrences",{},async page=>{
  await loaded(page);await query(page,"ਨਾਨਕ");
  const author=page.locator('#results [data-result-id="author.guru-nanak"]'),passage=page.locator('#results [data-result-id="'+N+'"]');
  assert.match(await author.getAttribute("class"),/result-source-index/);
  for(const row of [author,passage])assert.match(await row.locator("..").innerText(),/Matched through editorial indexing · Editorial author lookup/);
  await passage.click();await scripture(page,N);assert.equal(await page.locator(".selected-line").count(),0);
  await query(page,"ਨਾਨਕੁ","phrase");await page.locator('#results [data-result-id="'+A+'"]').click();
  await page.locator('[data-occurrence="'+A+'.line07"].selected-line').waitFor();await scripture(page,A);
  await query(page,"ਕਬੀਰ");
  const literal=page.locator('#results [data-result-id="'+K+'"]');
  assert.match(await literal.locator("..").innerText(),/Matched through source indexing/);
  assert.match(await page.locator('#results [data-result-id="author.bhagat-kabir"]').getAttribute("class"),/result-source-index/);
  await literal.click();await page.locator('[data-occurrence="'+K+'.line01"].selected-line').waitFor();await scripture(page,K);
  await page.screenshot({path:path.join(out,"literal-versus-author-lookup.png"),fullPage:true});
 });
 await check("Corrupt source fails before any teaching request and leaves no scripture or editorial content",{corruptSource:true},async(page,requests)=>{
  await page.goto(url);await page.getByText(/Knowledge pack could not be verified/).waitFor();
  assert.ok(requests.some(u=>new URL(u).pathname==="/knowledge/scripture.json"),"Source fetch attempted");
  assert.equal(requests.filter(u=>new URL(u).pathname==="/knowledge/pilot.json").length,0,"Teaching must not be fetched after source verification fails");
  assert.equal(await page.locator("#content").innerText(),"");assert.equal(await page.locator("#browse").innerText(),"");assert.equal(await page.locator("#results").innerText(),"");
  assert.equal(await page.locator(".pankti").count(),0);assert.ok(await page.locator("#search-button").isDisabled());
  await page.screenshot({path:path.join(out,"source-refusal-before-teaching.png"),fullPage:true});
 });
 for(const [name,mutateTeaching] of [
  ["prefixed heading",e=>{e.nodes.find(n=>n.id==="concept.humility").pa="ਵਿਸ਼ਾ ਸਲੋਕੁ ਮਃ ੧ ॥";}],
  ["source line in word label",e=>{e.nodes.find(n=>n.type==="word").pa=firstVerse;}],
  ["source line in passage alias",e=>{e.passageDescriptions[0].aliases=[firstVerse];}]
 ])await check("Re-pinned attribution mutant refuses the combined UI: "+name,{mutateTeaching},async(page,requests)=>{
  await page.goto(url);await page.getByText(/Knowledge pack could not be verified/).waitFor();
  assert.ok(requests.some(u=>new URL(u).pathname==="/knowledge/pilot.json"),"Re-pinned teaching reached the loader");
  assert.equal(await page.locator("#content").innerText(),"");assert.equal(await page.locator("#results").innerText(),"");assert.ok(await page.locator("#search-button").isDisabled());
 });
 await check("Accepted lexical gap remains editorial through result clicks, Back, reload and deep links",{mutateTeaching:e=>{e.nodes.find(n=>n.id==="concept.humility").pa="ਵਿਸ਼ਾ ਮ\u0300ਃ ੧ ॥";}},async page=>{
  const marked="ਵਿਸ਼ਾ ਮ\u0300ਃ ੧ ॥";
  const editorial=async()=>{
   assert.equal(await page.locator("#content > .editorial-pa").innerText(),marked);
   assert.equal(await page.locator("#content > .editorial-pa").getAttribute("data-content-kind"),"editorial");
   assert.equal(await page.locator("#content h2").getAttribute("data-content-kind"),"editorial");
   assert.match(await page.locator("#content .kicker").innerText(),/Library topic · editorial draft/);
   assert.equal(await page.locator("#content .scripture").count(),0);
  };
  await loaded(page);await editorial();await query(page,"humility");
  const row=page.locator('#results [data-result-id="concept.humility"]');
  assert.match(await row.getAttribute("class"),/result-editorial/);assert.match(await row.innerText(),/editorial draft/);assert.ok((await row.innerText()).includes(marked));
  await row.click();await editorial();await query(page,"ਫਫਫਬਕਨਆਪ","first-letter");
  await page.locator('#results [data-result-id="'+N+'"]').click();await scripture(page,N);assert.ok(!(await page.locator(".scripture").innerText()).includes(marked));
  await page.goBack();await page.getByRole("heading",{name:"Humility",exact:true}).waitFor();await editorial();
  await page.reload();await page.getByText(/Source files checked/).waitFor();await editorial();
  await loaded(page,url+"#"+new URLSearchParams({item:"concept.humility",depth:"deep"}));await editorial();
  assert.equal(await page.locator('[data-depth="deep"]').getAttribute("aria-pressed"),"true");
  await page.screenshot({path:path.join(out,"lexical-gap-labelled-editorial.png"),fullPage:true});
 });
 await check("A permitted editorial passage alias opens unmodified source with explicit editorial match reason",{mutateTeaching:e=>{e.passageDescriptions.find(d=>d.passageId===N).aliases=["Integration family reflection"];}},async page=>{
  await loaded(page);await query(page,"Integration family reflection");
  const row=page.locator('#results [data-result-id="'+N+'"]');
  assert.match(await row.getAttribute("class"),/result-scripture/);
  assert.match(await row.locator("..").innerText(),/Matched through editorial indexing · Editorial title or alias/);
  assert.equal(await row.locator(".result-title").innerText(),firstVerse);
  await row.click();await scripture(page,N);assert.equal(await page.locator(".selected-line").count(),0);
 });
 for(const p of ["knowledge/scripture.json","knowledge/pilot.json","knowledge/registry.mjs","knowledge/source-lock.mjs"]){
  const current=await fs.readFile(path.join(root,p)),prior=execFileSync("git",["show",base+":"+p],{cwd:root,maxBuffer:8*1024*1024});
  assert.deepEqual(current,prior,p+" unchanged from PR57");
 }
 assert.deepEqual(report.pageErrors,[]);
}catch(e){report.status="FAIL";report.failures.push({name:"Harness/setup or final invariants",error:e.stack||String(e)});}
finally{
 if(browser)await browser.close();await new Promise(r=>server.close(r));
 report.finished=new Date().toISOString();await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify({status:report.status,checks:report.checks.length,evidence:path.relative(root,out),failures:report.failures}));
 if(report.status!=="PASS")process.exitCode=1;
}
