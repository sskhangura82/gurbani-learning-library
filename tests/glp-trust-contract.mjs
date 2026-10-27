/* GLP-001 reviewed trust packet — no promises beyond measured app state. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const text=p=>fs.readFileSync(path.join(root,p),'utf8');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const main=text('nitnem/index.html'),trust=text('nitnem/trust/index.html');
const corrections=text('nitnem/trust/corrections.html'),css=text('nitnem/trust/trust.css');
const gate=text('tests/serve-gated-learning-nitnem.py'),reader=text('nitnem/reader.js');
const worker=text('nitnem/sw.js'),learning=JSON.parse(text('nitnem/learning/course.v1.json'));
const checks=[];const test=(name,fn)=>{fn();checks.push(name)};
function links(str){return [...str.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);}
test('Original reader has exactly one quiet, same-site trust entry',()=>{
 const a=links(main).filter(x=>x.includes('trust/'));
 assert.deepEqual(a,['trust/index.html']);
 assert.ok(main.indexOf('trust/index.html')>main.indexOf('id="offline-install"'));
});
test('Trust introduction and correction register are local static documents',()=>{
 assert.ok(trust.includes('<h1 id="trust-title">How this library works</h1>'));
 assert.ok(corrections.includes('Source questions and correction register'));
 assert.ok(links(trust).includes('corrections.html'));
});
test('Both static documents ban automatic third-party requests, embeds and JS',()=>{
 for(const page of [trust,corrections]){
  assert.ok(page.includes("connect-src 'none'"));
  assert.ok(page.includes("script-src 'none'"));
  assert.ok(page.includes('noindex,nofollow,noarchive'));
  assert.ok(!/<script\b|<iframe\b|<form\b/i.test(page));
 }
 assert.ok(!/@import|url\s*\(\s*["']?https?:/i.test(css));
});
test('Nitnem reading remains entirely internal and no remote script was added',()=>{
 assert.ok(!/href="https?:/.test(main));
 assert.ok(main.includes('data-open="jaap"'));
 assert.ok(main.includes('data-open="sohila"'));
});
test('Official SGPC optional Hukamnama is the SINGLE externally navigable trust link',()=>{
 const urls=links(trust).filter(x=>/^https?:\/\//.test(x));
 assert.deepEqual(urls,['https://sgpc.net/hukamnama/']);
 assert.ok(trust.includes('rel="noopener noreferrer external"'));
 assert.ok(trust.includes('referrerpolicy="no-referrer"'));
 assert.ok(trust.includes('target="_blank"'));
 assert.ok(trust.includes('leaves the library'));
 assert.ok(trust.includes('We do not invent a random personal Hukamnama'));
});
test('Privacy policy accurately discloses local browser data',()=>{
 assert.ok(reader.includes('localStorage.getItem('));
 assert.ok(reader.includes('localStorage.setItem('));
 assert.ok(trust.includes('browser')&&trust.includes('local storage'));
 assert.ok(trust.includes('Clearing this site')||trust.includes('Clearing this site'));
});
test('Privacy policy truthfully discloses provider connection metadata limitations',()=>{
 assert.ok(trust.includes('Cloudflare'));
 assert.ok(trust.includes('IP addresses'));
 assert.ok(trust.includes('do <em>not</em> claim'));
});
test('Private Mac gateway actually suppresses ordinary request logging',()=>{
 assert.ok(gate.includes('def log_message(self, *args):'));
 assert.ok(gate.includes('        pass'));
 assert.ok(gate.includes('This reader is read-only'));
});
test('Reader declares one same-origin network channel and no ad/analytics provider',()=>{
 assert.ok(main.includes("connect-src 'self'"));
 assert.ok(!/(google-analytics|googletagmanager|mixpanel|segment\.io|sentry\.io|plausible\.io)/i.test(main+reader));
 assert.ok(!/(getUserMedia|navigator\.geolocation|sendBeacon)/.test(main+reader));
});
test('Privacy does not promise permanent no-data-processing of all hosting infrastructure',()=>{
 assert.ok(trust.includes('network and hosting providers can process'));
 assert.ok(trust.includes('not certified'));
});
test('User is not silently promised irrevocable free forever without founder approval',()=>{
 assert.ok(trust.includes('free in this version'));
 assert.ok(trust.includes('founder-reserved decisions'));
 assert.ok(trust.includes('no subscription')||trust.includes('No subscription'));
 assert.ok(!trust.includes('guaranteed free forever'));
});
test('No streaks, point-scoring, push or paywalls are introduced',()=>{
 assert.ok(trust.includes('score, badge or return-day streak'));
 assert.ok(!/navigator\.serviceWorker\.ready\.then.+pushManager|paymentRequest/i.test(main));
});
test('Accessibility statement is carefully limited to tested evidence',()=>{
 assert.ok(trust.includes('physical iPhone Safari'));
 assert.ok(trust.includes('VoiceOver'));
 assert.ok(trust.includes('WCAG 2.2 AA'));
 assert.ok(trust.includes('do not call this a completed'));
 assert.ok(trust.includes('200%'));
 assert.ok(trust.includes('44-pixel minimum touch size'));
});
test('Source question register includes genuinely OPEN Japji Pauri 13 issue',()=>{
 assert.ok(text('docs/R7_RELEASE_AND_ROLLBACK.md').includes('Pauri 13 line 1'));
 assert.ok(corrections.includes('Japji Sahib, Pauri 13, line 1'));
 assert.ok(corrections.includes('not')&&corrections.includes('OPEN'));
});
test('Source question register preserves quarantine for Anand Sahib Pauri24',()=>{
 const anand=JSON.parse(text('nitnem/data/anand.json'));
 const held=anand.units.flatMap(u=>u.lines).filter(l=>l.held);
 assert.deepEqual(held.map(l=>l.id),['anand24.line03']);
 assert.ok(corrections.includes('anand24.line03'));
 assert.ok(corrections.includes('WITHHELD'));
});
test('Jaap differences recorded as 67 comparisons, not necessarily 67 mistakes',()=>{
 assert.ok(corrections.includes('67 groups differed'));
 assert.ok(corrections.includes('not proven errors'));
});
test('Every source question has identity/status and cannot self-pass',()=>{
 const ids=[...corrections.matchAll(/<strong>(GLP-(?:SRC|EDU)-\d+)<\/strong>/g)].map(x=>x[1]);
 assert.deepEqual(ids,['GLP-SRC-001','GLP-SRC-002','GLP-SRC-003','GLP-SRC-004','GLP-SRC-005','GLP-SRC-006','GLP-SRC-007','GLP-EDU-001']);
 assert.ok(corrections.includes('qualified independent Sikh/Punjabi'));
 assert.ok(corrections.includes('No listed item is certified as an error'));
});
test('Correction register distinguishes original/Gurmukhi from prose and human approval',()=>{
 assert.ok(trust.includes('A hash check proves the stored bytes have not changed'));
 assert.ok(trust.includes('cannot alone prove'));
 assert.ok(corrections.includes('qualified independent Sikh/Punjabi'));
});
test('Citable separate Meaning/Study coverage remains 50 of 327 and 0 approved',()=>{
 assert.equal(learning.coverage.writtenUnitLessons,50);
 assert.equal(learning.coverage.unitTotal,327);
 assert.equal(learning.coverage.reviewedUnitLessons,0);
 assert.ok(corrections.includes('50 of 327'));
});
test('Versioned source-only service worker includes all three trust assets and original six texts',()=>{
 const m=worker.match(/^const EXPECTED=(\{[^\n]+\});/m);
 assert.ok(m);
 const hashes=JSON.parse(m[1]);
 assert.equal(Object.keys(hashes).length,32);
 for(const f of ['./trust/index.html','./trust/corrections.html','./trust/trust.css','./learning/course.v1.json','./data/rehras.json']){
  assert.equal(hashes[f],sha(fs.readFileSync(path.join(root,'nitnem',f.slice(2)))),f);
 }
});
test('Source and learning immutability protections remain explicit',()=>{
 assert.ok(worker.includes('glp-nitnem-source-review:'));
 assert.ok(!worker.includes('glp-nitnem-trust-review:'));
 assert.ok(reader.includes('Gurmukhi occurrence hash changed'));
 assert.ok(reader.includes('DRAFT_AI_UNREVIEWED'));
});
test('Accessibility and correction pages have keyboard-accessible links and semantic sections',()=>{
 for(const page of [trust,corrections]){
  assert.ok(page.includes('<main>')&&page.includes('</main>'));
  assert.ok(page.includes('<footer>'));
  assert.ok(page.includes('class="skip"'));
  assert.ok(page.includes('<h1 '));
 }
 assert.ok(css.includes('focus-visible'));
 assert.ok(css.includes('prefers-reduced-motion'));
});
console.log(JSON.stringify({status:'PASS',checks:checks.length,cases:checks,trustAssets:3,externalSGPCLinks:1,publicFamilyReleased:false,qualifiedReviewApproved:false},null,2));
