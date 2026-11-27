import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {createHash} from "node:crypto";
import {buildAppBundle} from "../../tools/build-app-bundles.mjs";
import {pinAppHTML} from "../../tools/refresh-app-sri.mjs";

const fixtures = new WeakMap();
const digest = bytes => createHash("sha256").update(bytes).digest("hex");

// A semantic fixture deliberately updates BOTH the teaching pin inside the
// reviewed source graph and the HTML's transport pin for that rebuilt graph.
// Application source on disk and the independent scripture pin stay untouched.
// A blocked script is never accepted as a semantic-guard refusal.
export async function installKnowledgeFixture(page, {directory, teachingBytes}) {
  const sourcePath = "knowledge/app.mjs";
  const original = await fs.readFile(path.join(directory, sourcePath), "utf8");
  const pinPattern = /PACK_SHA256="[a-f0-9]{64}"/g;
  assert.equal((original.match(pinPattern) || []).length, 1, "Exactly one teaching pin exists in the source fixture");
  const source = original.replace(pinPattern, 'PACK_SHA256="' + digest(teachingBytes) + '"');
  const bundle = await buildAppBundle("knowledge", {directory, overrides:{[sourcePath]:source}});
  const html = await pinAppHTML(
    await fs.readFile(path.join(directory, "knowledge/index.html"), "utf8"),
    {appId:"knowledge", code:bundle.code}
  );
  const requested = [];
  const consoleErrors = [];
  page.on("request", request => requested.push(new URL(request.url()).pathname));
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.route("**/knowledge/pilot.json", route => route.fulfill({
    status:200, contentType:"application/json; charset=utf-8", body:teachingBytes
  }));
  await page.route("**/knowledge/app.bundle.mjs", route => route.fulfill({
    status:200, contentType:"text/javascript; charset=utf-8", body:bundle.code
  }));
  await page.route("**/knowledge/index.html*", route => route.fulfill({
    status:200, contentType:"text/html; charset=utf-8", body:html
  }));
  fixtures.set(page, {requested, consoleErrors, bundleSha256:digest(bundle.code), teachingSha256:digest(teachingBytes)});
}

export function assertKnowledgeFixtureRuntime(page, {teaching=true}={}) {
  const fixture = fixtures.get(page);
  assert.ok(fixture, "The explicit semantic bundle fixture was installed");
  const saw = name => fixture.requested.some(url => url.endsWith("/knowledge/" + name));
  assert.ok(saw("app.bundle.mjs"), "The rebuilt module bundle was requested");
  assert.ok(saw("scripture.json"), "The rebuilt bundle executed and entered source verification");
  if (teaching) assert.ok(saw("pilot.json"), "The re-pinned teaching reached the semantic content guard");
  assert.equal(fixture.requested.filter(url => /\/knowledge\/[^/]+\.mjs$/.test(url) && !url.endsWith("/app.bundle.mjs")).length, 0,
    "The fixture never executes unbundled source modules");
  assert.equal(fixture.consoleErrors.filter(text => /integrity|digest.*block|subresource/i.test(text)).length, 0,
    "A transport integrity refusal must not masquerade as a content-guard rejection");
  return {bundleSha256:fixture.bundleSha256, teachingSha256:fixture.teachingSha256, runtimeReached:true};
}
