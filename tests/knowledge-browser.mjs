import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {installKnowledgeFixture,assertKnowledgeFixtureRuntime} from "./helpers/module-fixture.mjs";
import {loadKnowledge,sha256} from "../knowledge/registry.mjs";
const root=fileURLToPath(new URL("../",import.meta.url)),editorial=await fs.readFile(path.join(root,"knowledge/pilot.json")),source=await fs.readFile(path.join(root,"knowledge/scripture.json")),pack=await loadKnowledge(source,editorial,await sha256(editorial));
const mime={".mjs":"text/javascript; charset=utf-8",".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,"http://localhost"),p=path.resolve(root,"."+decodeURIComponent(u.pathname));if(!p.startsWith(path.resolve(root)+path.sep))throw Error("outside");const b=await fs.readFile(p);res.writeHead(200,{"content-type":mime[path.extname(p)]||"application/octet-stream","cache-control":"no-store"});res.end(b);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));const origin="http://127.0.0.1:"+server.address().port,url=origin+"/knowledge/index.html",out=path.join(root,"evidence","library-script-integrity","browser",new Date().toISOString().replace(/[:.]/g,"-")+"-knowledge-pilot");await fs.mkdir(out,{recursive:true});
const report={status:"PASS",checks:[],errors:[],limits:["Chromium viewports; no physical devices, actual Safari or assistive-technology acceptance.","No public integration, production offline support or full SGGS index."]};let b;
async function check(name,fn){await fn();report.checks.push(name);}
try{const executablePath=process.env.CHROMIUM_PATH||(process.platform==="darwin"?"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome":undefined);b=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});report.environment={platform:process.platform,node:process.version,browser:b.version(),executablePath:executablePath||chromium.executablePath()};
for(const [width,height]of [[390,844],[820,1180],[1440,900]]){
 const ctx=await b.newContext({viewport:{width,height}}),p=await ctx.newPage();p.on("pageerror",e=>report.errors.push(e.message));const requests=[];p.on("request",r=>requests.push(r.url()));
 await check(width+" source pack opens, no page overflow",async()=>{await p.goto(url);await p.getByText("Source files checked",{exact:false}).waitFor();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));assert.match(await p.locator("#content h2").innerText(),/Humility/);});
 await check(width+" Humility deep study and source-linked complete passage",async()=>{await p.getByRole("button",{name:"Deep study",exact:true}).click();assert.match(await p.locator("#content").innerText(),/hunter bows/);await p.locator("#content").getByRole("button",{name:/ਸਿੰਮਲ ਰੁਖੁ ਸਰਾਇਰਾ/}).click();const n=pack.nodes.find(n=>n.id==="sggs.asa-di-vaar.pauri014.salok01");assert.deepEqual(await p.locator(".pankti").evaluateAll(xs=>xs.map(x=>x.textContent)),n.occurrenceIds.map(id=>pack.occurrences.find(o=>o.id===id).text));});
 await check(width+" contextual word lookup returns to same original passage",async()=>{const word=p.locator("#content").getByRole("button",{name:"ਨੀਵੀ",exact:true});await word.click();await p.locator("#word-dialog").waitFor();assert.match(await p.locator("#word-body").innerText(),/Lowness/);await p.getByRole("button",{name:"Return to passage"}).click();assert.ok(await p.locator("#word-dialog").isHidden());assert.equal(await p.evaluate(()=>document.activeElement.textContent),"ਨੀਵੀ");});
 await check(width+" local search, author filter, and unknown result",async()=>{await p.locator("#query").fill("humility");await p.locator("#author").selectOption("author.bhagat-kabir");await p.getByRole("button",{name:"Search library"}).click();assert.match(await p.locator("#results").innerText(),/ਕਬੀਰ ਸਭ ਤੇ ਹਮ ਬੁਰੇ/);assert.doesNotMatch(await p.locator("#results").innerText(),/Humility beyond appearances/);await p.locator("#author").selectOption("");await p.locator("#query").fill("quantum computer");await p.getByRole("button",{name:"Search library"}).click();assert.match(await p.locator("#status").innerText(),/No indexed result/);assert.ok(requests.every(u=>u.startsWith(origin)));});
 await p.screenshot({path:path.join(out,"width-"+width+".png"),fullPage:true});await ctx.close();
}
const ctx=await b.newContext(),p=await ctx.newPage();await p.route("**/knowledge/pilot.json",async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace("Humility","Changed teaching")});});
await check("Changed teaching fixture refuses all knowledge rendering",async()=>{await p.goto(url);await p.getByText(/Knowledge pack could not be verified/).waitFor();assert.equal(await p.locator(".pankti").count(),0);assert.ok(await p.locator("#search-button").isDisabled());});await ctx.close();
// A teaching-only revision may be re-pinned without touching the scripture
// lock. These semantic fixtures explicitly rebuild and re-pin the module bundle.
// Runtime assertions distinguish content rejection from an SRI load refusal.
for(const damaged of [false,true]){
 const cx=await b.newContext(),pg=await cx.newPage(),e=JSON.parse(editorial);
 e.nodes.find(n=>n.type==="lesson").simple.en+=" SYNTHETIC editorial revision.";
 const raw=Buffer.from(JSON.stringify(e));
 await installKnowledgeFixture(pg,{directory:root,teachingBytes:raw});
 if(damaged)await pg.route("**/knowledge/scripture.json",async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace("ਮਿਠਤੁ ਨੀਵੀ","ਮਿਠਤੁ ਨੀਵ")});});
 await check(damaged?"Renewing editorial pin cannot admit changed scripture":"Editorial-only revision works with unchanged independent scripture pin",async()=>{
  await pg.goto(url);
  if(damaged){await pg.getByText(/Knowledge pack could not be verified/).waitFor();assert.equal(await pg.locator(".pankti").count(),0);assert.ok(await pg.locator("#search-button").isDisabled());}
  else{await pg.getByText(/Source files checked/).waitFor();assert.match(await pg.locator("#content").innerText(),/SYNTHETIC editorial revision/);}
  assertKnowledgeFixtureRuntime(pg,{teaching:!damaged});
 });await cx.close();
}
// A renewed editorial digest alone must not admit an attribution leak.
for(const field of ["title","pa"]){
 const cx=await b.newContext({viewport:{width:390,height:844}}),pg=await cx.newPage(),e=JSON.parse(editorial);
 e.passageDescriptions[0][field]="ਸਲੋਕੁ ਮਃ ੧ ॥";
 const raw=Buffer.from(JSON.stringify(e));
 await installKnowledgeFixture(pg,{directory:root,teachingBytes:raw});
 await check("Re-sealed scripture heading in "+field+" refuses the actual page",async()=>{
  await pg.goto(url);await pg.getByText(/Knowledge pack could not be verified/).waitFor();
  assert.equal(await pg.locator(".pankti").count(),0);assert.equal(await pg.locator("#content").innerText(),"");
  assert.ok(await pg.locator("#search-button").isDisabled());
  assertKnowledgeFixtureRuntime(pg);
 });await cx.close();
}
assert.deepEqual(report.errors,[]);
}catch(e){report.status="FAIL";report.failure=e.stack||String(e);process.exitCode=1;}finally{if(b)await b.close();await new Promise(r=>server.close(r));await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure||null}));}
