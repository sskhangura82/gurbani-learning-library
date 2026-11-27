import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import assert from "node:assert/strict";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prefix = "/gurbani-learning-library/";
const key = "glp001.hukamnama.learning.v1";
const latestDate = (await fs.readdir(path.join(root,"hukamnama/events"))).filter(name => /^\d{4}-\d\d-\d\d\.json$/.test(name)).sort().at(-1)?.slice(0,-5);
assert.ok(latestDate, "A signed exact-date development event must be staged before browser tests.");
const eventBytes = await fs.readFile(path.join(root,"hukamnama/events",latestDate + ".json"));
const envelope = JSON.parse(eventBytes);
const event = JSON.parse(Buffer.from(envelope.payload,"base64"));
const sourceBytes = await fs.readFile(path.join(root,"hukamnama",event.source.path));
const source = JSON.parse(sourceBytes);
const nextDate = new Date(Date.parse(latestDate + "T12:00:00Z") + 86400000).toISOString().slice(0,10);
const absentDate = "2001-01-01";
const clock = new Date(Math.max(Date.parse(event.checkedAtUtc) + 1000,Date.parse(latestDate + "T12:00:00Z")));
assert.equal(new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(clock), latestDate);
const types = {".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webmanifest":"application/manifest+json",".woff2":"font/woff2"};
const server = http.createServer(async (req,res) => {
 try {
  const url = new URL(req.url,"http://localhost");
  if (!url.pathname.startsWith(prefix)) throw Error("outside scope");
  const relative = decodeURIComponent(url.pathname.slice(prefix.length));
  const file = path.resolve(root,!relative || relative.endsWith("/") ? relative + "index.html" : relative);
  if (!file.startsWith(root + path.sep)) throw Error("outside scope");
  const body = await fs.readFile(file);
  res.writeHead(200,{"content-type":types[path.extname(file)] || "application/octet-stream","cache-control":"no-store"}); res.end(body);
 } catch { if (!res.headersSent) res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
const origin = "http://127.0.0.1:" + server.address().port;
const url = origin + prefix + "hukamnama/";
const run = new Date().toISOString().replace(/[:.]/g,"-");
const out = path.join(root,"evidence","daily-hukamnama","ui",run);
await fs.mkdir(out,{recursive:true});
const report = {status:"PASS",candidateDate:latestDate,scenarios:[],pageErrors:[],limits:["Fresh synthetic Chromium contexts only; no physical iPhone, iPad, Safari, VoiceOver or human acceptance claim.","One exact official dated development event; unavailable dates are never fabricated.","Current Simple/Detailed/Learning source-linked explanations remain pending; no interpretation generated."]};
let browser;
const contexts = [];
const check = async (name, test) => { if (process.env.GLP_UI_CASE && !name.includes(process.env.GLP_UI_CASE)) return; try { await test(); report.scenarios.push({name,status:"PASS"}); } catch (error) { report.scenarios.push({name,status:"FAIL",failure:String(error)}); throw error; } };
async function context(options = {}) {
 const ctx = await browser.newContext({serviceWorkers:"block",...options}); contexts.push(ctx); return ctx;
}
// Playwright's page.clock belongs to the whole browser context. Reinstalling
// it for a second page rewinds every open tab and can correctly trigger INVALID_CLOCK.
const contextClocks = new WeakMap();
async function pageFor(ctx, time = clock) {
 const initialTime = +new Date(time);
 assert.ok(Number.isFinite(initialTime), "A synthetic context clock needs a valid initial time.");
 let installed = contextClocks.get(ctx);
 if (installed) {
  assert.equal(initialTime,installed.initialTime,"All pages in one context must request the same initial clock time.");
 } else {
  installed = {initialTime,ready:ctx.clock.install({time:new Date(initialTime)})};
  contextClocks.set(ctx,installed);
 }
 await installed.ready;
 const page = await ctx.newPage(); page.setDefaultTimeout(12000);
 page.on("pageerror",error => report.pageErrors.push(error.message)); return page;
}
async function loaded(page, suffix = "") {
 await page.goto(url + suffix); await page.waitForFunction(() => document.getElementById("reading").hidden === false);
 assert.equal(await page.locator(".original-text").count(),source.occurrences.length);
 assert.deepEqual(await page.locator(".original-text").allTextContents(),source.occurrences.map(line => line.text));
}
async function panel(page, name) {
 await page.locator('.destinations [data-panel="' + name + '"]').click();
 await page.locator("#" + name + "-panel").waitFor({state:"visible"});
}
async function openDateControls(page) {
 if (!await page.locator("#date-controls").evaluate(node => node.open)) await page.locator("#date-controls > summary").click();
}
async function chooseDate(page, value) {
 await openDateControls(page); await page.locator("#date").fill(value); await page.locator("#open").click();
}
async function chooseToday(page) {
 await openDateControls(page); await page.locator("#today").click();
}
async function storage(page) { return page.evaluate(key => localStorage.getItem(key),key); }
async function save(page, question, reflection) {
 await panel(page,"learning"); await page.locator("#question").fill(question); await page.locator("#reflection").fill(reflection);
 await page.locator("#save-note").click(); await page.waitForFunction(() => /saved on this device|Both versions/.test(document.getElementById("note-status").textContent));
}
try {
 browser = await chromium.launch({headless:true,...(process.env.GLP_CHROME_PATH ? {executablePath:process.env.GLP_CHROME_PATH} : {})});
 for (const layout of [{width:320,height:700,label:"narrow-phone"},{width:390,height:844,label:"phone"},{width:820,height:1180,label:"tablet"},{width:1440,height:900,label:"desktop"}]) {
  const ctx = await context({viewport:{width:layout.width,height:layout.height}}), page = await pageFor(ctx);
  const requests = []; page.on("request",request => requests.push({url:request.url(),body:request.postData()}));
  await check(layout.label + ": complete dated original and usable four destinations",async () => {
   await loaded(page); assert.equal(await page.locator("#date").inputValue(),latestDate);
   assert.match(await page.locator("#reading-title").innerText(),/Today's original/);
   assert.match(await page.locator("#status").innerText(),/Development preview/);
   assert.equal(await page.locator('[data-kind="rahao"]').count(),source.occurrences.filter(line=>line.kind==="rahao").length);
   assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
   if (layout.label === "phone") {
    const firstOriginal = await page.locator(".original-text").first().boundingBox();
    const firstVerse = await page.locator('[data-kind="verse"] .original-text').first().boundingBox();
    const officialLink = await page.locator("#official-link").boundingBox();
    report.firstRead = {width:layout.width,height:layout.height,headingTop:firstOriginal.y,headingBottom:firstOriginal.y+firstOriginal.height,firstVerseTop:firstVerse.y,officialLinkTop:officialLink.y};
    assert.equal(await page.evaluate(() => scrollY),0);
    assert.ok(firstOriginal.y + firstOriginal.height <= layout.height,"The first original line must be readable in the initial phone viewport.");
    assert.ok(firstVerse.y < layout.height,"The first verse must begin in the initial phone viewport.");
    assert.ok(officialLink.y + officialLink.height <= layout.height,"The ordinary official source link must remain visible.");
    assert.equal(await page.locator("#date-controls").evaluate(node => node.open),false);
   }
   await page.screenshot({path:path.join(out,layout.label + "-original.png"),fullPage:true});
   if (layout.label === "narrow-phone") {
    await page.locator("#font-size").focus(); await page.locator("#font-size").press("End");
    assert.equal(await page.locator("#scripture").evaluate(node => getComputedStyle(node).fontSize),"52px");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
    await page.locator("#font-size").press("Home");
   }
   for (const name of ["simple","detailed","learning"]) {
    await panel(page,name); assert.ok(await page.locator("#" + name + "-pending").isVisible());
    assert.equal(await page.locator("#" + name + "-content").innerText(),"");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
    if (layout.label === "phone") await page.locator("#" + name + "-panel").screenshot({path:path.join(out,"phone-" + name + ".png")});
   }
   assert.ok(await page.locator("#question").isEnabled());
   assert.ok(requests.every(request => request.url.startsWith(origin) && request.body === null));
  });
  await check(layout.label + ": missing date clears original and every lesson",async () => {
   await chooseDate(page,absentDate);
   await page.waitForFunction(() => document.getElementById("status").textContent.includes("not available here"));
   assert.equal(await page.locator(".original-text").count(),0);
   assert.ok(await page.locator("#question").isDisabled());
   assert.equal(await page.locator("#official-link").getAttribute("href"),"https://hs.sgpc.net/");
   for (const name of ["simple","detailed","learning"]) assert.equal(await page.locator("#" + name + "-content").innerText(),"");
  });
  await ctx.close();
 }

 await check("Official portal link survives disabled JavaScript and a blocked reader bundle",async () => {
  const nojs = await context({javaScriptEnabled:false}), page = await nojs.newPage(); await page.goto(url);
  assert.ok(await page.locator("#official-link").isVisible()); assert.equal(await page.locator("#official-link").getAttribute("href"),"https://hs.sgpc.net/");
  await nojs.close();
  const blocked = await context(), blockedPage = await pageFor(blocked);
  await blockedPage.route("**/hukamnama/reader.bundle.mjs",route => route.abort()); await blockedPage.goto(url);
  assert.ok(await blockedPage.locator("#official-link").isVisible()); assert.ok(await blockedPage.locator("#open").isDisabled()); await blocked.close();
 });

 for (const query of ["?date=", "?date=not-a-date", "?date=2026-02-30", "?date=" + latestDate + "&date=" + latestDate]) {
  await check("Invalid or duplicate URL date refuses without today substitution: " + query,async () => {
   const ctx = await context(), page = await pageFor(ctx); const requested = [];
   page.on("request", request => { if (request.url().includes("/hukamnama/events/")) requested.push(request.url()); });
   await page.goto(url + query); await page.waitForFunction(() => document.getElementById("status").textContent.includes("valid calendar date"));
   assert.equal(await page.locator(".original-text").count(),0); assert.deepEqual(requested,[]);
   assert.ok(await page.locator("#official-link").isVisible()); await ctx.close();
  });
 }

 await check("Date URL, saved destination and reload remain consistent when switching dates and Today",async () => {
  const ctx = await context(), page = await pageFor(ctx);
  await loaded(page,"?learning=saved&date=" + latestDate + "#learning");
  await chooseDate(page,absentDate);
  await page.waitForFunction(() => document.getElementById("status").textContent.includes("not available here"));
  let address = new URL(page.url());
  assert.equal(address.searchParams.get("date"),absentDate); assert.equal(address.searchParams.getAll("date").length,1);
  assert.equal(address.searchParams.get("learning"),"saved"); assert.equal(address.hash,"#learning");
  await page.reload(); await page.waitForFunction(() => document.getElementById("status").textContent.includes("not available here"));
  assert.equal(await page.locator("#date").inputValue(),absentDate); assert.equal(await page.locator(".original-text").count(),0);
  await chooseToday(page); await page.waitForFunction(() => document.getElementById("reading").hidden === false);
  address = new URL(page.url()); assert.equal(address.searchParams.has("date"),false); assert.equal(address.searchParams.get("learning"),"saved"); assert.equal(address.hash,"#learning");
  await page.reload(); await page.waitForFunction(() => document.getElementById("reading").hidden === false);
  assert.equal(await page.locator("#date").inputValue(),latestDate); assert.equal(await page.locator(".original-text").count(),source.occurrences.length); await ctx.close();
 });

 await check("Late current-date response cannot replace a later unavailable-date choice",async () => {
  const ctx = await context(), page = await pageFor(ctx); let release;
  const gate = new Promise(resolve => release = resolve);
  await page.route("**/hukamnama/events/" + latestDate + ".json",async route => { await gate; try { await route.fulfill({status:200,contentType:"application/json",body:eventBytes}); } catch {} });
  await page.goto(url); await openDateControls(page); await page.locator("#open").waitFor({state:"visible"}); await page.waitForFunction(() => !document.getElementById("open").disabled);
  await chooseDate(page,absentDate);
  await page.waitForFunction(() => document.getElementById("status").textContent.includes("not available here"));
  release(); await page.waitForTimeout(150);
  assert.equal(await page.locator(".original-text").count(),0); assert.equal(await page.locator("#date").inputValue(),absentDate); await ctx.close();
 });

 for (const mutation of ["signature","source-truncation","wrong-date"]) {
  await check(mutation + ": refused original never falls back to another reading",async () => {
   const ctx = await context(), page = await pageFor(ctx);
   if (mutation === "source-truncation") {
    await page.route("**/hukamnama/sources/*.json",route => route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({...source,occurrences:source.occurrences.slice(0,-1)})}));
   } else {
    const altered = structuredClone(envelope);
    if (mutation === "signature") { const signature = Buffer.from(altered.signature,"base64"); signature[0] ^= 1; altered.signature = signature.toString("base64"); }
    else { const payload = structuredClone(event); payload.date = absentDate; altered.payload = Buffer.from(JSON.stringify(payload)).toString("base64"); }
    await page.route("**/hukamnama/events/*.json",route => route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(altered)}));
   }
   await page.goto(url); await page.waitForFunction(() => document.getElementById("status").textContent.includes("could not be verified"));
   assert.equal(await page.locator(".original-text").count(),0); assert.ok(await page.locator("#official-link").isVisible()); await ctx.close();
  });
 }

 await check("Amritsar midnight clears yesterday and leaves the new unavailable date pending",async () => {
  const ctx = await context(), page = await pageFor(ctx,new Date(latestDate + "T18:29:55Z"));
  await loaded(page); await page.clock.runFor(6000);
  assert.equal(await page.locator("#date").inputValue(),nextDate);
  assert.equal(await page.locator(".original-text").count(),0);
  await page.waitForFunction(() => document.getElementById("status").textContent.includes("not available in this preview"));
  assert.equal(await page.locator("#date").inputValue(),nextDate); assert.equal(await page.locator(".original-text").count(),0); await ctx.close();
 });

 const noteContext = await context({acceptDownloads:true}), notePage = await pageFor(noteContext);
 const noteRequests = []; noteContext.on("request",request => noteRequests.push({url:request.url(),method:request.method(),body:request.postData()}));
 const question = "SYNTHETIC QUESTION — ਪ੍ਰਸ਼ਨ?\n\n  Keep spacing 👪";
 const reflection = "SYNTHETIC REFLECTION\nਮੇਰੀ ਸੋਚ — no actual user data.";
 let backupText, savedBytes;
 await check("Private question and reflection save under the exact event and line; export preserves Unicode",async () => {
  await loaded(notePage); await panel(notePage,"learning");
  const selected = source.occurrences.find(line => line.kind === "verse") || source.occurrences[0];
  await notePage.locator("#line-choice").selectOption(selected.id); await save(notePage,question,reflection);
  savedBytes = await storage(notePage); const record = JSON.parse(savedBytes).records[0];
  assert.equal(record.question,question); assert.equal(record.reflection,reflection);
  assert.equal(record.binding.eventId,event.id); assert.equal(record.binding.sourceSha256,event.source.sha256);
  assert.equal(record.binding.lineId,selected.id); assert.equal(record.binding.lineSha256,selected.sha256);
  const downloading = notePage.waitForEvent("download"); await notePage.locator("#export-learning").click(); const download = await downloading;
  assert.equal(download.suggestedFilename(),"Hukamnama-learning.json");
  backupText = await fs.readFile(await download.path(),"utf8"); assert.deepEqual(JSON.parse(backupText),JSON.parse(savedBytes));
 });
 await check("Unsaved text survives a cancelled date change; print excludes private notes",async () => {
  await notePage.locator("#reflection").fill(reflection + "\nUNSAVED");
  notePage.once("dialog",dialog => dialog.dismiss()); await chooseDate(notePage,absentDate);
  assert.equal(await notePage.locator("#date").inputValue(),latestDate); assert.equal(await notePage.locator("#reflection").inputValue(),reflection + "\nUNSAVED");
  await notePage.emulateMedia({media:"print"});
  assert.equal(await notePage.locator("#learning-panel").evaluate(node => getComputedStyle(node).display),"none");
  assert.notEqual(await notePage.locator("#original-panel").evaluate(node => getComputedStyle(node).display),"none");
  await notePage.emulateMedia({media:"screen"});
  await notePage.locator("#reflection").fill(reflection);
 });
 await check("Saved destination reloads the local note and malformed import preserves all bytes",async () => {
  await notePage.goto(url + "?learning=saved"); await notePage.locator("#saved-list .saved-card").waitFor();
  assert.ok(await notePage.locator("#learning-panel").isVisible());
  const prior = await storage(notePage);
  await notePage.locator("#import-file").setInputFiles({name:"invalid.json",mimeType:"application/json",buffer:Buffer.from('{"format":"other","records":[]}')});
  await notePage.waitForFunction(() => document.getElementById("backup-status").textContent.includes("nothing was imported"));
  assert.equal(await storage(notePage),prior);
 });
 await check("Explicit Daily import restores notes on a fresh synthetic browser",async () => {
  const ctx = await context(), page = await pageFor(ctx); await loaded(page,"?learning=saved");
  await page.locator("#import-file").setInputFiles({name:"Hukamnama-learning.json",mimeType:"application/json",buffer:Buffer.from(backupText)});
  await page.waitForFunction(() => document.getElementById("backup-status").textContent.includes("restored"));
  assert.equal(JSON.parse(await storage(page)).records[0].question,question); await ctx.close();
 });
 // Daily backup acceptance frozen before this scenario: preserve A and conflicting B;
 // reimporting identical B must leave bytes/revision unchanged; distinct C must survive;
 // exporting all three and restoring in a fresh synthetic context must preserve every version.
 await check("Repeated conflicting Daily backup restores stay unchanged and distinct versions round-trip",async () => {
  const ctx = await context({acceptDownloads:true}), page = await pageFor(ctx);
  const requests = []; ctx.on("request",request => requests.push({url:request.url(),method:request.method(),body:request.postData()}));
  await loaded(page); await save(page,"SYNTHETIC RESTORE QUESTION","SYNTHETIC VERSION A\nਮੇਰੀ ਸੋਚ 👪");
  const original = JSON.parse(await storage(page)), originalRecord = structuredClone(original.records[0]);
  const conflicting = structuredClone(original);
  conflicting.records[0].reflection = "SYNTHETIC VERSION B\n  ਪ੍ਰ  e\u0301 👪  ";
  const secondText = JSON.stringify(conflicting);
  const importFile = async text => page.locator("#import-file").setInputFiles({name:"Hukamnama-learning.json",mimeType:"application/json",buffer:Buffer.from(text)});
  await importFile(secondText);
  await page.waitForFunction(() => document.getElementById("backup-status").textContent.includes("Conflicting versions"));
  const once = await storage(page), firstMerge = JSON.parse(once);
  assert.equal(firstMerge.records.length,2);
  assert.deepEqual(firstMerge.records.find(record => record.id === originalRecord.id),originalRecord);
  const preservedB = firstMerge.records.find(record => record.id !== originalRecord.id);
  assert.equal(preservedB.conflictOf,originalRecord.id);
  assert.equal(preservedB.reflection,conflicting.records[0].reflection);
  assert.deepEqual(preservedB.binding,originalRecord.binding);
  assert.equal(await page.locator("#saved-list .saved-card").count(),2);
  await importFile(secondText);
  await page.waitForFunction(() => document.getElementById("backup-status").textContent.includes("already present"));
  assert.equal(await storage(page),once,"Repeated backup must not change bytes or revision.");
  assert.equal(await page.locator("#saved-list .saved-card").count(),2);
  const third = structuredClone(conflicting); third.records[0].reflection = "SYNTHETIC VERSION C\nA genuinely different private note.";
  await importFile(JSON.stringify(third));
  await page.waitForFunction(() => document.getElementById("backup-status").textContent.includes("Conflicting versions"));
  const three = JSON.parse(await storage(page));
  assert.equal(three.records.length,3); assert.equal(three.revision,firstMerge.revision + 1);
  assert.deepEqual(three.records.slice(0,2),firstMerge.records);
  assert.equal(three.records[2].conflictOf,originalRecord.id);
  assert.equal(three.records[2].reflection,third.records[0].reflection);
  assert.equal(await page.locator("#saved-list .saved-card").count(),3);
  const downloading = page.waitForEvent("download"); await page.locator("#export-learning").click(); const download = await downloading;
  assert.equal(download.suggestedFilename(),"Hukamnama-learning.json");
  const allVersions = await fs.readFile(await download.path(),"utf8");
  assert.deepEqual(JSON.parse(allVersions),three);
  const fresh = await context(), restored = await pageFor(fresh); await loaded(restored,"?learning=saved");
  await restored.locator("#import-file").setInputFiles({name:"Hukamnama-learning.json",mimeType:"application/json",buffer:Buffer.from(allVersions)});
  await restored.waitForFunction(() => document.getElementById("backup-status").textContent.includes("restored"));
  const restoredBytes = await storage(restored);
  assert.deepEqual(JSON.parse(restoredBytes).records,three.records);
  assert.equal(await restored.locator("#saved-list .saved-card").count(),3);
  await restored.locator("#import-file").setInputFiles({name:"Hukamnama-learning.json",mimeType:"application/json",buffer:Buffer.from(allVersions)});
  await restored.waitForFunction(() => document.getElementById("backup-status").textContent.includes("already present"));
  assert.equal(await storage(restored),restoredBytes);
  assert.ok(requests.every(request => request.url.startsWith(origin) && request.method === "GET" && request.body === null && !request.url.includes("SYNTHETIC")));
  await fresh.close(); await ctx.close();
 });
 await check("Two tabs preserve conflicting note edits as separate versions",async () => {
  await notePage.locator("#saved-list button").first().click(); await notePage.locator("#question").waitFor({state:"visible"});
  // Deliberately advance the shared clock: reopening the context clock at its
  // original epoch must fail this canary even when a fast machine masks the save bug.
  await notePage.clock.runFor(5000);
  const beforeSecondClock = await notePage.evaluate(() => Date.now());
  const existingCreatedAt = JSON.parse(await storage(notePage)).records[0].createdAt;
  const second = await pageFor(noteContext);
  const afterSecondClock = await notePage.evaluate(() => Date.now());
  report.twoTabClock = {beforeSecondClock,afterSecondClock,existingCreatedAt};
  assert.ok(afterSecondClock >= beforeSecondClock,"Opening a second tab must never rewind the first tab's clock.");
  assert.ok(afterSecondClock >= Date.parse(existingCreatedAt),"The existing note must remain in the first tab's clock past.");
  const pagesBeforeRejectedClock = noteContext.pages().length;
  await assert.rejects(() => pageFor(noteContext,new Date(+clock + 1)),/same initial clock time/);
  assert.equal(noteContext.pages().length,pagesBeforeRejectedClock,"A conflicting clock request must fail before opening a page.");
  report.twoTabClock.conflictingInitialTimeRefused = true;
  await loaded(second,"?learning=saved"); await second.locator("#saved-list button").first().click();
  await second.waitForFunction(() => !document.getElementById("reflection").disabled);
  await save(notePage,question,"SYNTHETIC FIRST TAB EDIT");
  await save(second,question,"SYNTHETIC SECOND TAB EDIT");
  const records = JSON.parse(await storage(second)).records;
  assert.ok(records.some(record => record.reflection === "SYNTHETIC FIRST TAB EDIT"));
  assert.ok(records.some(record => record.reflection === "SYNTHETIC SECOND TAB EDIT"));
  assert.match(await second.locator("#note-status").innerText(),/Both versions/); await second.close();
 });
 await check("Writing, saving, exporting and importing transmit no private text or third-party requests",async () => {
  assert.ok(noteRequests.every(request => request.url.startsWith(origin) && request.method === "GET" && request.body === null && !request.url.includes("SYNTHETIC")));
 });
 await noteContext.close();

 await check("Quota refusal preserves the old record and exposes the whole unsaved recovery text",async () => {
  const ctx = await context({acceptDownloads:true}); await ctx.addInitScript(key => {
   const original = Storage.prototype.setItem;
   Storage.prototype.setItem = function(name,value) { if (name === key && globalThis.__denyDailyWrites) throw new DOMException("Synthetic quota","QuotaExceededError"); return original.call(this,name,value); };
  },key);
  const page = await pageFor(ctx); await loaded(page); await save(page,"SYNTHETIC ORIGINAL","SYNTHETIC SAFE");
  const before = await storage(page); await page.evaluate(() => globalThis.__denyDailyWrites = true);
  await page.locator("#reflection").fill("SYNTHETIC UNSAVED ਪ੍ਰ 👪"); await page.locator("#save-note").click();
  await page.waitForFunction(() => document.getElementById("note-status").textContent.includes("could not save"));
  assert.equal(await storage(page),before); assert.equal(await page.locator("#reflection").inputValue(),"SYNTHETIC UNSAVED ਪ੍ਰ 👪");
  const downloading = page.waitForEvent("download"); await page.locator("#export-draft").click(); const file = await downloading;
  const recovery = JSON.parse(await fs.readFile(await file.path(),"utf8")); assert.equal(recovery.reflection,"SYNTHETIC UNSAVED ਪ੍ਰ 👪");
  assert.equal(recovery.format,"glp-hukamnama-unsaved-text"); await ctx.close();
 });

 await check("Oversized pasted text is refused intact, never truncated",async () => {
  const ctx = await context(), page = await pageFor(ctx); await loaded(page); await panel(page,"learning");
  const large = "x".repeat(40001); await page.locator("#reflection").fill(large); await page.locator("#save-note").click();
  await page.waitForFunction(() => document.getElementById("note-status").textContent.includes("too long"));
  assert.equal((await page.locator("#reflection").inputValue()).length,40001); assert.equal(await storage(page),null); await ctx.close();
 });

 await check("A saved historical note stays editable when its exact original is unavailable",async () => {
  const historical = JSON.parse(backupText); historical.records[0].binding.date = absentDate; historical.records[0].binding.eventId = "harmandir-morning." + absentDate;
  const ctx = await context(), page = await pageFor(ctx); await loaded(page,"?learning=saved");
  await page.locator("#import-file").setInputFiles({name:"Hukamnama-learning.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(historical))});
  await page.locator("#saved-list button").first().waitFor(); await page.locator("#saved-list button").first().click();
  await page.waitForFunction(() => document.getElementById("status").textContent.includes("not available here"));
  assert.equal(await page.locator(".original-text").count(),0); assert.ok(await page.locator("#reflection").isEnabled());
  assert.match(await page.locator("#editor-source").innerText(),/has not been attached to another reading/);
  await save(page,question,"SYNTHETIC HISTORICAL NOTE EDIT");
  assert.equal(JSON.parse(await storage(page)).records[0].binding.date,absentDate); await ctx.close();
 });

 await check("A late unavailable source cannot reset text typed into an existing saved note",async () => {
  const historical = JSON.parse(backupText); historical.records[0].binding.date = absentDate; historical.records[0].binding.eventId = "harmandir-morning." + absentDate;
  const ctx = await context(), page = await pageFor(ctx); await loaded(page,"?learning=saved");
  await page.locator("#import-file").setInputFiles({name:"Hukamnama-learning.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(historical))});
  let release; const gate = new Promise(resolve => release = resolve);
  await page.route("**/hukamnama/events/" + absentDate + ".json",async route => { await gate; await route.fulfill({status:404,body:""}); });
  await page.locator("#saved-list button").first().click();
  await page.locator("#reflection").fill("SYNTHETIC EDIT WHILE SOURCE PENDING");
  release(); await page.waitForFunction(() => document.getElementById("status").textContent.includes("not available here"));
  assert.equal(await page.locator("#reflection").inputValue(),"SYNTHETIC EDIT WHILE SOURCE PENDING");
  assert.ok(await page.locator("#export-draft").isEnabled()); await ctx.close();
 });

 await check("Dirty notes remain on their date at midnight and the old original is labelled historical",async () => {
  const ctx = await context(), page = await pageFor(ctx,new Date(latestDate + "T18:29:55Z"));
  await loaded(page); await panel(page,"learning"); await page.locator("#question").fill("SYNTHETIC MIDNIGHT QUESTION");
  await page.clock.runFor(6000); assert.ok(await page.locator("#rollover").isVisible());
  assert.equal(await page.locator("#date").inputValue(),latestDate); assert.equal(await page.locator("#question").inputValue(),"SYNTHETIC MIDNIGHT QUESTION");
  assert.match(await page.locator("#reading-title").innerText(),/Historical original/);
  assert.equal(new URL(page.url()).searchParams.get("date"),latestDate); await ctx.close();
 });

 await check("Direct Daily URL installs the shell and reopens its same verified date offline",async () => {
  const ctx = await context({serviceWorkers:"allow",viewport:{width:390,height:844}}), page = await pageFor(ctx);
  const diagnostics = {console:[],failedRequests:[]};
  ctx.on("console",message => { if (message.type() === "error") diagnostics.console.push(message.text()); });
  ctx.on("requestfailed",request => diagnostics.failedRequests.push({url:request.url(),failure:request.failure()}));
  await loaded(page);
  try { await page.waitForFunction(() => navigator.serviceWorker.controller !== null,undefined,{timeout:30000}); }
  catch (error) {
   diagnostics.state = await page.evaluate(async () => ({status:document.getElementById("offline-status").textContent,registrations:(await navigator.serviceWorker.getRegistrations()).map(item => ({scope:item.scope,active:item.active?.state,installing:item.installing?.state,waiting:item.waiting?.state})),cacheNames:await caches.keys()}));
   report.offlineDiagnostics = diagnostics; throw error;
  }
  await page.waitForFunction(async () => {
   const cache = await caches.open("glp001.hukamnama.records.v1"); return (await cache.keys()).length > 0;
  });
  await page.screenshot({path:path.join(out,"phone-offline-ready.png"),fullPage:true});
  const before = await page.locator(".original-text").allTextContents(); await ctx.setOffline(true);
  await page.reload(); await page.locator("#reading").waitFor({state:"visible"});
  assert.deepEqual(await page.locator(".original-text").allTextContents(),before);
  assert.match(await page.locator("#status").innerText(),/verified source cache/);
  await chooseDate(page,absentDate);
  await page.waitForFunction(() => document.getElementById("status").textContent.includes("not available here"));
  assert.equal(await page.locator(".original-text").count(),0); await ctx.close();
 });
 assert.deepEqual(report.pageErrors,[]);
} catch (error) {
 report.status = "FAIL"; report.failure = error.stack || String(error); process.exitCode = 1;
} finally {
 for (const ctx of contexts) { try { await ctx.close(); } catch {} }
 if (browser) await browser.close();
 await new Promise(resolve => server.close(resolve));
 await fs.writeFile(path.join(out,"report.json"),JSON.stringify(report,null,2) + "\n");
 console.log(JSON.stringify({status:report.status,checks:report.scenarios.length,report:path.relative(root,path.join(out,"report.json")),failure:report.failure || null}));
}