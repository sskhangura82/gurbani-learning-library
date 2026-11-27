import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {chromium} from "playwright";
import {buildAppBundle} from "../tools/build-app-bundles.mjs";
import {pinAppHTML} from "../tools/refresh-app-sri.mjs";

const root = path.resolve(fileURLToPath(new URL("../", import.meta.url)));
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const out = path.join(root, "evidence/library-script-integrity/browser", stamp + "-module-transport");
await fs.mkdir(out, {recursive:true});
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const bundledModules = new Set(["library/app.bundle.mjs","articles/app.bundle.mjs","knowledge/app.bundle.mjs","hukamnama/reader.bundle.mjs"]);
const isUnbundledModule = relative =>
  /^(library|articles|knowledge|hukamnama)\//.test(relative) && /\.(mjs|js)$/.test(relative) && !bundledModules.has(relative);
const mime = {".html":"text/html; charset=utf-8", ".mjs":"text/javascript; charset=utf-8",
  ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8", ".webmanifest":"application/manifest+json",
  ".png":"image/png", ".svg":"image/svg+xml", ".woff2":"font/woff2"};
const denied = [];
const server = http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/favicon.ico") {res.writeHead(204);res.end();return;}
    if (!pathname.startsWith("/preview/")) throw Error("Outside the synthetic preview mount");
    let relative = pathname.slice("/preview/".length);
    if (!relative || relative.endsWith("/")) relative += "index.html";
    if (isUnbundledModule(relative)) {
      denied.push(relative);
      res.writeHead(403, {"content-type":"text/plain", "cache-control":"no-store"});
      res.end("Original ES module URLs are deliberately unavailable in this fixture.");return;
    }
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep)) throw Error("Outside fixture root");
    const bytes = await fs.readFile(filename);
    res.writeHead(200, {"content-type":mime[path.extname(filename)] || "application/octet-stream",
      "cache-control":"no-store"});
    res.end(bytes);
  } catch {
    res.writeHead(404, {"cache-control":"no-store"});res.end();
  }
});
await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
const origin = "http://127.0.0.1:" + server.address().port;
const report = {
  status:"PASS", started:new Date().toISOString(), sourceCommit:execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim(),
  mount:"/preview/", checks:[], failures:[], limits:[
    "Builder verification in fresh synthetic desktop Chrome contexts at a 390 by 844 CSS-pixel viewport.",
    "Original module URLs deliberately denied; service workers blocked to isolate network/SRI behavior.",
    "No physical iPhone, Safari, VoiceOver, user records, offline-worker acceptance, qualified content review or release approval.",
    "Transport mutation changes a real dependency source in memory, rebuilds the complete bundle and retains unchanged HTML SRI; its explicit re-pinned control proves the altered code can execute."
  ]
};
const dailyDate=(await fs.readdir(path.join(root,"hukamnama/events"))).filter(n=>/^\d{4}-\d\d-\d\d\.json$/.test(n)).sort().at(-1).slice(0,-5);
const dailyEnvelope=JSON.parse(await fs.readFile(path.join(root,"hukamnama/events",dailyDate+".json"),"utf8"));
const dailyEvent=JSON.parse(Buffer.from(dailyEnvelope.payload,"base64").toString());
const dailySource=JSON.parse(await fs.readFile(path.join(root,"hukamnama",dailyEvent.source.path),"utf8"));
const dailyClock=new Date(Math.max(Date.parse(dailyEvent.checkedAtUtc)+1000,Date.parse(dailyDate+"T12:00:00Z")));
const specs = [
  {name:"hukamnama", appId:"hukamnama", page:"hukamnama/index.html", html:"hukamnama/index.html", dependency:"hukamnama/core.mjs", output:"hukamnama/reader.bundle.mjs", ready:"#reading:not([hidden])", clock:dailyClock, verify:async page=>{
    assert.deepEqual(await page.locator(".original-text").allTextContents(),dailySource.occurrences.map(line=>line.text));
    assert.equal(await page.locator("#official-link").getAttribute("href"),"https://hs.sgpc.net/");
    assert.match(await page.locator("#status").innerText(),/Development preview/);
  }},
  {name:"library", appId:"library", page:"index.html?view=read", html:"index.html", dependency:"library/catalog.mjs", ready:'html[data-library-state="ready"]', verify:async page=>{
    assert.equal(await page.locator("#reader-list .directory-card").count(),10);
    await page.locator("#library-search").fill("salok");
    assert.equal(await page.locator("#reader-list .directory-card").count(),2);
    const links=await page.locator("#reader-list a").evaluateAll(nodes=>nodes.map(node=>node.href));
    assert.ok(links.every(href=>new URL(href).pathname.startsWith("/preview/")), "Reader links retain the deployment prefix");
  }},
  {name:"articles-index", appId:"articles", page:"articles/index.html", html:"articles/index.html", ready:'html[data-source-state="ready"]', verify:async page=>{
    assert.equal(await page.locator("#topic-list .topic-card").count(),2);
    const links=await page.locator("#topic-list .topic-card").evaluateAll(nodes=>nodes.map(node=>node.href));
    assert.ok(links.every(href=>new URL(href).pathname.startsWith("/preview/articles/")));
  }},
  {name:"articles-sheet", appId:"articles", page:"articles/article.html?id=haumai-source-sheet", html:"articles/article.html", dependency:"articles/core.mjs", ready:'html[data-source-state="ready"]', verify:async page=>{
    assert.equal(await page.locator("#passages .source-line").count(),2);
    assert.ok(await page.locator("#print-article").isEnabled());
    assert.equal(await page.locator('.explanation-slot[data-review-status="AWAITING_QUALIFIED_REVIEW"]').count(),1);
    const href=await page.locator(".reader-link").getAttribute("href");
    assert.ok(new URL(href,page.url()).pathname.startsWith("/preview/"));
  }},
  {name:"knowledge", appId:"knowledge", page:"knowledge/index.html", html:"knowledge/index.html", dependency:"knowledge/kinds.mjs", ready:"#search-button:not([disabled])", verify:async page=>{
    assert.match(await page.locator("#status").innerText(),/Source files checked/);
    assert.equal(await page.locator("#content h2").getAttribute("data-content-kind"),"editorial");
    await page.locator("#query").fill("NASA");
    await page.locator("#search-button").click();
    assert.equal(await page.locator("#results button").count(),0);
  }}
];
let browser;
async function run(spec, mode="normal", mutation=null) {
  const check = {name:spec.name + " · " + mode, status:"PASS", requests:[], deniedSourceRequests:[], consoleErrors:[], pageErrors:[]};
  const ctx = await browser.newContext({viewport:{width:390,height:844},serviceWorkers:"block"});
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  if(spec.clock)await page.clock.install({time:spec.clock});
  page.on("request",request=>{
    const url=new URL(request.url());check.requests.push(url.pathname);
    if (isUnbundledModule(url.pathname.slice("/preview/".length))) check.deniedSourceRequests.push(url.pathname);
  });
  page.on("console",message=>{if(message.type()==="error")check.consoleErrors.push(message.text());});
  page.on("pageerror",error=>check.pageErrors.push(error.message));
  try {
    if (mutation) {
      await page.route(url=>url.pathname==="/preview/"+mutation.outputPath,route=>route.fulfill({
        status:200, contentType:"text/javascript; charset=utf-8", body:mutation.code
      }));
      if(mode==="dependency-change-repinned-control") {
        const html = await pinAppHTML(await fs.readFile(path.join(root,spec.html),"utf8"),{appId:spec.appId,code:mutation.code});
        await page.route(url=>url.pathname==="/preview/"+spec.html,route=>route.fulfill({
          status:200,contentType:"text/html; charset=utf-8",body:html
        }));
      }
      check.mutation={dependency:spec.dependency,baselineSha256:mutation.baselineSha256,servedSha256:sha256(mutation.code)};
    }
    await page.goto(origin+"/preview/"+spec.page,{waitUntil:"load"});
    if (mode==="dependency-change-unchanged-pin") {
      assert.equal(await page.evaluate(()=>globalThis.__GLP_DEPENDENCY_PROBE__ ?? null),null,"Changed dependency code must not execute");
      assert.equal(await page.locator(spec.ready).count(),0,"Application cannot claim readiness after its script is blocked");
      assert.ok(check.consoleErrors.some(text=>/integrity|valid digest/i.test(text)),"Browser reports an SRI refusal");
      if(spec.appId==="library")assert.equal(await page.locator("#reader-list .directory-card").count(),0);
      else if(spec.appId==="articles") {
        assert.equal(await page.locator("#passages .source-line").count(),0);
        assert.ok(await page.locator("#print-article").isDisabled());
        assert.equal(check.requests.filter(url=>url.endsWith("/articles/catalog.json")).length,0);
      } else if(spec.appId==="hukamnama") {
        assert.equal(await page.locator(".original-text").count(),0);
        assert.ok(await page.locator("#official-link").isVisible());
        assert.equal(check.requests.filter(url=>url.includes("/hukamnama/events/")).length,0);
      } else {
        assert.equal(await page.locator("#content").innerText(),"");
        assert.ok(await page.locator("#search-button").isDisabled());
        assert.equal(check.requests.filter(url=>url.endsWith("/knowledge/scripture.json")).length,0);
      }
    } else {
      await page.locator(spec.ready).waitFor();
      await spec.verify(page);
      if (mode==="dependency-change-repinned-control") {
        assert.deepEqual(await page.evaluate(()=>globalThis.__GLP_DEPENDENCY_PROBE__),
          {appId:spec.appId,source:spec.dependency},"The same altered dependency executes when explicitly re-pinned");
      } else assert.equal(await page.evaluate(()=>globalThis.__GLP_DEPENDENCY_PROBE__ ?? null),null);
      assert.equal(check.consoleErrors.filter(text=>/integrity|valid digest/i.test(text)).length,0);
      const geometry=await page.evaluate(()=>({
        viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
        heading:Array.from(document.querySelectorAll("h1,h2")).find(node=>node.getBoundingClientRect().width>0)?.getBoundingClientRect().toJSON() || null
      }));
      assert.ok(geometry.documentWidth<=geometry.viewport+2,"No horizontal overflow at 390px");
      check.geometry=geometry;
    }
    assert.deepEqual(check.deniedSourceRequests,[],"Application never requests its unavailable original modules");
    assert.ok(check.requests.includes("/preview/"+(spec.output||spec.appId+"/app.bundle.mjs")),"The bundle URL is requested below the deployment prefix");
    assert.deepEqual(check.pageErrors,[]);
    if(mode==="normal") {
      check.screenshot=spec.name+"-390.png";
      await page.screenshot({path:path.join(out,check.screenshot),fullPage:true});
    }
  } catch(error) {
    check.status="FAIL";check.error=error.stack||String(error);report.status="FAIL";
    report.failures.push({name:check.name,error:check.error});
    await page.screenshot({path:path.join(out,spec.name+"-"+mode+"-failure.png"),fullPage:true}).catch(()=>{});
  } finally {
    report.checks.push(check);await ctx.close();
  }
}
try {
  const executablePath=process.env.CHROMIUM_PATH||(process.platform==="darwin"?"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome":undefined);
  browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
  report.environment={node:process.version,platform:process.platform,browser:browser.version(),executablePath:executablePath||chromium.executablePath()};
  for(const spec of specs)await run(spec);
  for(const spec of specs.filter(spec=>spec.dependency)) {
    const original=await fs.readFile(path.join(root,spec.dependency),"utf8");
    const probe="globalThis.__GLP_DEPENDENCY_PROBE__="+JSON.stringify({appId:spec.appId,source:spec.dependency})+";\n";
    const mutation=await buildAppBundle(spec.appId,{directory:root,overrides:{[spec.dependency]:probe+original}});
    const baseline=await fs.readFile(path.join(root,mutation.outputPath));
    assert.notEqual(sha256(mutation.code),sha256(baseline),"Changing a dependency changes executed bundle bytes");
    assert.ok(mutation.code.includes("__GLP_DEPENDENCY_PROBE__"),"The dependency side effect survives bundling");
    mutation.baselineSha256=sha256(baseline);
    await run(spec,"dependency-change-unchanged-pin",mutation);
    await run(spec,"dependency-change-repinned-control",mutation);
  }
  assert.deepEqual(denied,[],"No original source module reached the denying server");
} catch(error) {
  report.status="FAIL";report.failures.push({name:"Harness/setup",error:error.stack||String(error)});
} finally {
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
  report.finished=new Date().toISOString();report.deniedAtServer=denied;
  await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2)+"\n");
  console.log(JSON.stringify({status:report.status,checks:report.checks.length,evidence:path.relative(root,out),failures:report.failures}));
  if(report.status!=="PASS")process.exitCode=1;
}
