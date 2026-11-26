import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
const root=fileURLToPath(new URL("../",import.meta.url)),pack=JSON.parse(await fs.readFile(path.join(root,"knowledge/pilot.json"),"utf8"));
const mime={".mjs":"text/javascript; charset=utf-8",".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,"http://localhost"),p=path.resolve(root,"."+decodeURIComponent(u.pathname));if(!p.startsWith(path.resolve(root)+path.sep))throw Error("outside");const b=await fs.readFile(p);res.writeHead(200,{"content-type":mime[path.extname(p)]||"application/octet-stream","cache-control":"no-store"});res.end(b);}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));const origin="http://127.0.0.1:"+server.address().port,url=origin+"/knowledge/index.html",out=path.join(root,"evidence","knowledge-pilot");await fs.mkdir(out,{recursive:true});
const report={status:"PASS",checks:[],errors:[],limits:["Chromium viewports; no physical devices, actual Safari or assistive-technology acceptance.","No public integration, production offline support or full SGGS index."]};let b;
async function check(name,fn){await fn();report.checks.push(name);}
try{b=await chromium.launch();
for(const [width,height]of [[390,844],[820,1180],[1440,900]]){
 const ctx=await b.newContext({viewport:{width,height}}),p=await ctx.newPage();p.on("pageerror",e=>report.errors.push(e.message));const requests=[];p.on("request",r=>requests.push(r.url()));
 await check(width+" source pack opens, no page overflow",async()=>{await p.goto(url);await p.getByText("Development pack verified",{exact:false}).waitFor();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));assert.match(await p.locator("#content h2").innerText(),/Humility/);});
 await check(width+" Humility deep study and source-linked complete passage",async()=>{await p.getByRole("button",{name:"Deep study",exact:true}).click();assert.match(await p.locator("#content").innerText(),/hunter bows/);await p.locator("#content").getByRole("button",{name:/Humility beyond appearances/}).click();const n=pack.nodes.find(n=>n.id==="sggs.asa.470.m1.salok01");assert.deepEqual(await p.locator(".pankti").evaluateAll(xs=>xs.map(x=>x.textContent)),n.occurrenceIds.map(id=>pack.occurrences.find(o=>o.id===id).text));});
 await check(width+" contextual word lookup returns to same original passage",async()=>{const word=p.locator("#content").getByRole("button",{name:"ਨੀਵੀ",exact:true});await word.click();await p.locator("#word-dialog").waitFor();assert.match(await p.locator("#word-body").innerText(),/Lowness/);await p.getByRole("button",{name:"Return to passage"}).click();assert.ok(await p.locator("#word-dialog").isHidden());assert.equal(await p.evaluate(()=>document.activeElement.textContent),"ਨੀਵੀ");});
 await check(width+" local search, author filter, and unknown result",async()=>{await p.locator("#query").fill("humility");await p.locator("#author").selectOption("author.bhagat-kabir");await p.getByRole("button",{name:"Find teaching"}).click();assert.match(await p.locator("#results").innerText(),/Turning criticism inward/);assert.doesNotMatch(await p.locator("#results").innerText(),/Humility beyond appearances/);await p.locator("#author").selectOption("");await p.locator("#query").fill("quantum computer");await p.getByRole("button",{name:"Find teaching"}).click();assert.match(await p.locator("#status").innerText(),/No authored result/);assert.ok(requests.every(u=>u.startsWith(origin)));});
 await p.screenshot({path:path.join(out,"width-"+width+".png"),fullPage:true});await ctx.close();
}
const ctx=await b.newContext(),p=await ctx.newPage();await p.route("**/knowledge/pilot.json",async r=>{const a=await r.fetch();await r.fulfill({response:a,body:(await a.text()).replace("ਮਿਠਤੁ","ਮਿਠਾਸ")});});
await check("Changed fixture refuses all knowledge rendering",async()=>{await p.goto(url);await p.getByText(/Knowledge pack could not be verified/).waitFor();assert.equal(await p.locator(".pankti").count(),0);assert.ok(await p.locator("#search-button").isDisabled());});await ctx.close();
assert.deepEqual(report.errors,[]);
}catch(e){report.status="FAIL";report.failure=e.stack||String(e);process.exitCode=1;}finally{if(b)await b.close();await new Promise(r=>server.close(r));await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure||null}));}
