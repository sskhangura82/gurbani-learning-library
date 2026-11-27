import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {sha256} from "../knowledge/registry.mjs";

const root=fileURLToPath(new URL("../",import.meta.url));
const source=JSON.parse(await fs.readFile(path.join(root,"knowledge/scripture.json"),"utf8"));
const teaching=JSON.parse(await fs.readFile(path.join(root,"knowledge/pilot.json"),"utf8"));
const first=source.passages[0],verse=source.occurrences.find(o=>o.kind==="verse").text;
const mime={".mjs":"text/javascript; charset=utf-8",".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8"};
const server=http.createServer(async(req,res)=>{try{
 const u=new URL(req.url,"http://localhost"),p=path.resolve(root,"."+decodeURIComponent(u.pathname));
 if(!p.startsWith(root))throw Error("outside");
 const data=await fs.readFile(p);res.writeHead(200,{"content-type":mime[path.extname(p)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
}catch{res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(0,"127.0.0.1",r));
const origin="http://127.0.0.1:"+server.address().port,url=origin+"/knowledge/index.html";
const out=path.join(root,"evidence/knowledge-editorial-boundary");await fs.mkdir(out,{recursive:true});
const report={status:"PASS",checks:[],errors:[],limits:[
 "Fresh synthetic desktop-browser contexts, with emulated viewport dimensions.",
 "No physical iPhone, Safari, VoiceOver, participant testing, qualified content review, staging or deployment."
]};
let browser;
async function context(width=390,mutate){
 const ctx=await browser.newContext({viewport:{width,height:844}}),page=await ctx.newPage();
 page.on("pageerror",e=>report.errors.push(e.message));
 page.on("request",r=>{if(!r.url().startsWith(origin))report.errors.push("Unexpected external request");});
 if(mutate){
  const e=structuredClone(teaching);mutate(e);const bytes=Buffer.from(JSON.stringify(e)),pin=await sha256(bytes);
  await page.route("**/knowledge/pilot.json",r=>r.fulfill({status:200,contentType:"application/json",body:bytes}));
  await page.route("**/knowledge/app.mjs",async r=>{const original=await r.fetch();await r.fulfill({response:original,body:(await original.text()).replace(/PACK_SHA256="[a-f0-9]{64}"/,'PACK_SHA256="'+pin+'"')});});
 }
 return {ctx,page};
}
async function query(page,text){await page.locator("#query").fill(text);await page.getByRole("button",{name:"Search library",exact:true}).click();}
try{
 const executablePath=process.env.CHROMIUM_PATH||(process.platform==="darwin"?"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome":undefined);
 browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 report.environment={platform:process.platform,node:process.version,browser:browser.version()};
 for(const width of [390,820,1440]){
  const {ctx,page}=await context(width);
  await page.goto(url);await page.getByText(/Source files checked/).waitFor();
  assert.equal(await page.locator("#content h2").getAttribute("data-content-kind"),"editorial");
  assert.equal(await page.locator("#content h2").getAttribute("class"),"editorial-title");
  assert.match(await page.locator("#content .kicker").innerText(),/Library topic · editorial draft/);
  assert.ok(await page.locator("#content .editorial-copy[data-content-kind=editorial]").count()>0);
  assert.equal(await page.locator("#content .scripture").count(),0);
  assert.equal(await page.locator("p.pa").count(),0);
  await query(page,"humility");
  assert.ok(await page.locator("#results .result-editorial").count()>0);
  assert.ok(await page.locator("#results .result-scripture").count()>0);
  for(const label of await page.locator("#results .result-editorial .result-kind").allTextContents())assert.match(label,/editorial draft/);
  for(const label of await page.locator("#results .result-scripture .result-kind").allTextContents())assert.equal(label,"Original Gurbani · digital source");
  await page.locator("#results .result-scripture").filter({hasText:verse}).click();
  assert.equal(await page.locator("#content h2").getAttribute("class"),"scripture-title");
  assert.equal(await page.locator("#content .scripture").getAttribute("data-content-kind"),"scripture");
  assert.deepEqual(await page.locator("#content .pankti").allTextContents(),first.occurrenceIds.map(id=>source.occurrences.find(o=>o.id===id).text));
  assert.equal(await page.locator(".scripture .editorial-pa,.scripture .editorial-copy,.scripture [data-content-kind=editorial]").count(),0);
  assert.match(await page.locator("#content .editorial-note").first().innerText(),/Library topic \(editorial\)/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
  await page.screenshot({path:path.join(out,"provenance-"+width+".png"),fullPage:true});
  report.checks.push(width+"px: editorial and scripture rows, headings and Punjabi bodies remain distinct; canonical lines unchanged");
  await ctx.close();
 }
 const attacks=[
  ["prefixed description title",e=>e.passageDescriptions[0].title="ਵਿਸ਼ਾ ਸਲੋਕੁ ਮਃ ੧ ॥"],
  ["concept Punjabi heading",e=>e.nodes.find(n=>n.type==="concept").pa="ਵਿਸ਼ਾ ਮਹਲਾ ੧ ॥"],
  ["word Punjabi source verse",e=>e.nodes.find(n=>n.type==="word").pa=verse],
  ["verse posed as dictionary form",e=>e.nodes.find(n=>n.type==="word").senses[0].form=verse],
  ["node alias heading",e=>e.nodes.find(n=>n.type==="study").aliases=["ਵਿਸ਼ਾ ਮਹਲਾ ੧ ॥"]],
  ["passage description alias",e=>e.passageDescriptions[0].aliases=[verse]],
  ["lesson copy source verse",e=>e.nodes.find(n=>n.type==="lesson").simple.pa="ਵਿਚਾਰ: "+verse],
  ["comparison heading",e=>e.edges.find(x=>x.similarity).difference="ਵਿਸ਼ਾ ਸਲੋਕੁ ॥"],
  ["unvalidated joined alias attempt",e=>e.nodes[0].editorialAliases=[verse]]
 ];
 for(const [name,mutate] of attacks){
  const {ctx,page}=await context(390,mutate);await page.goto(url);
  await page.getByText(/Knowledge pack could not be verified/).waitFor();
  assert.equal(await page.locator("#content").innerText(),"");
  assert.equal(await page.locator("#browse").innerText(),"");
  assert.equal(await page.locator("#results").innerText(),"");
  assert.ok(await page.locator("#search-button").isDisabled());
  report.checks.push("Re-pinned "+name+" refused in the actual page");
  await ctx.close();
 }
 {
  const literal="<strong>Synthetic family reflection</strong> &amp;";
  const {ctx,page}=await context(390,e=>{
   const n=e.nodes.find(n=>n.id==="concept.humility");n.title="Guru Arjan";n.pa="ਨਾਨਕ";
   e.passageDescriptions[0].title=literal;e.passageDescriptions[0].aliases=["Synthetic family reflection"];
  });
  await page.goto(url);await page.getByText(/Source files checked/).waitFor();
  assert.equal(await page.locator("#content h2").innerText(),"Guru Arjan");
  assert.equal(await page.locator("#content h2").getAttribute("data-content-kind"),"editorial");
  assert.match(await page.locator("#content .kicker").innerText(),/editorial draft/);
  assert.equal(await page.locator("#content > .editorial-pa").innerText(),"ਨਾਨਕ");
  await query(page,"Guru Arjan");
  assert.match(await page.locator("#results .result-editorial").first().innerText(),/Library topic · editorial draft/);
  await query(page,"Synthetic family reflection");
  assert.match(await page.locator("#results").innerText(),/Matched through editorial indexing/);
  assert.equal(await page.locator("#results .result-scripture .result-title").innerText(),verse);
  await page.locator("#results .result-scripture").click();
  assert.equal(await page.locator("#content .editorial-note").first().textContent(),"Library topic (editorial): "+literal);
  assert.equal(await page.locator("#content strong").count(),0);
  assert.deepEqual(await page.locator("#content .pankti").allTextContents(),first.occurrenceIds.map(id=>source.occurrences.find(o=>o.id===id).text));
  report.checks.push("Permitted names stay editorial; valid passage alias identifies editorial matching; markup remains literal text");
  await page.screenshot({path:path.join(out,"literal-editorial-label-390.png"),fullPage:true});
  await ctx.close();
 }
 {
  const marked="ਵਿਸ਼ਾ ਮ\u0300ਃ ੧ ॥";
  const {ctx,page}=await context(390,e=>{e.nodes.find(n=>n.id==="concept.humility").pa=marked;});
  await page.goto(url);await page.getByText(/Source files checked/).waitFor();
  assert.equal(await page.locator("#content > .editorial-pa").innerText(),marked);
  assert.equal(await page.locator("#content > .editorial-pa").getAttribute("data-content-kind"),"editorial");
  assert.match(await page.locator("#content .kicker").innerText(),/Library topic · editorial draft/);
  await query(page,"humility");
  const editorial=page.locator("#results .result-editorial").filter({hasText:marked});
  assert.equal(await editorial.count(),1);
  assert.match(await editorial.innerText(),/editorial draft/);
  assert.equal(await page.locator("#results .result-scripture").filter({hasText:marked}).count(),0);
  await page.locator("#results .result-scripture").filter({hasText:verse}).click();
  assert.deepEqual(await page.locator("#content .pankti").allTextContents(),first.occurrenceIds.map(id=>source.occurrences.find(o=>o.id===id).text));
  assert.equal(await page.locator(".scripture .editorial-pa,.scripture .editorial-copy,.scripture [data-content-kind=editorial]").count(),0);
  assert.equal((await page.locator(".scripture").innerText()).includes(marked),false);
  report.checks.push("A syntactically unrecognized imitation remains labelled editorial in page and search and never enters original scripture");
  await page.screenshot({path:path.join(out,"unrecognized-editorial-390.png"),fullPage:true});
  await ctx.close();
 }
 {
  const heading=source.occurrences.find(o=>o.kind==="heading");
  const {ctx,page}=await context(390,e=>{
   const word=e.nodes.find(n=>n.type==="word");word.title="ਸਲੋਕੁ";word.pa="ਸਲੋਕੁ";word.aliases=["ਸਲੋਕੁ"];
   Object.assign(word.senses[0],{form:"ਸਲੋਕੁ",passageId:heading.passageId,occurrenceIds:[heading.id],sourceBindings:[{id:heading.id,sha256:heading.textSha256}]});
  });
  await page.goto(url);await page.getByText(/Source files checked/).waitFor();
  await query(page,"ਸਲੋਕੁ");
  const wordResult=page.locator("#results .result-editorial").filter({hasText:"Dictionary entry · editorial draft"});
  assert.equal(await wordResult.count(),1);await wordResult.click();
  assert.equal(await page.locator("#content h2").innerText(),"ਸਲੋਕੁ");
  assert.equal(await page.locator("#content h2").getAttribute("data-content-kind"),"editorial");
  assert.equal(await page.locator("#content .source-token").innerText(),"ਸਲੋਕੁ");
  assert.equal(await page.locator("#content .scripture").count(),0);
  assert.match(await page.locator("#content").innerText(),/Source word · contextual explanation below is an editorial draft/);
  report.checks.push("An attested dictionary word remains usable with source-token identity and separately labelled editorial explanation");
  await ctx.close();
 }
 assert.deepEqual(report.errors,[]);
}catch(e){report.status="FAIL";report.failure=e.stack||String(e);process.exitCode=1;}
finally{
 if(browser)await browser.close();await new Promise(r=>server.close(r));
 await fs.writeFile(path.join(out,"browser.json"),JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify({status:report.status,checks:report.checks.length,failure:report.failure||null}));
}
