/* Pauri13 web-text corroboration certificate, offline/reproducible.
 * This does not prove an independent SGPC edition or authorize a source edit.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url),read=x=>fs.readFileSync(new URL(x,root),'utf8');
const certificate=JSON.parse(read('evidence/pauri13-web-corroboration.json'));
const scope={window:{}};vm.runInNewContext(read('js/japji-full-data.js'),scope);
const unit=scope.window.GLP_FULL_JAPJI.units.find(u=>u.id==='pauri13');
assert.equal(unit.angs[0],3);
assert.equal(unit.lines.length,6);
assert.equal(certificate.status,'WEB_CORROBORATED_NOT_EDITION_APPROVED');
assert.equal(certificate.frozen_anchor.line_count,6);
assert.equal(certificate.first_line_original,unit.lines[0].text);
assert.equal(certificate.first_line_original_sha256,unit.lines[0].sha256);
for(const [i,line] of unit.lines.entries()){
 const row=certificate.frozen_anchor.lines[i];
 assert.equal(row.id,line.id);
 assert.equal(row.source_line,line.sourceLine);
 assert.equal(row.frozen_sha256,line.sha256);
 assert.equal(crypto.createHash('sha256').update(line.text).digest('hex'),line.sha256);
 assert.ok(row.web_matches>=2,'Insufficient web copies for '+line.id);
}
assert.equal(certificate.frozen_anchor.lines[0].web_matches,3);
assert.equal(certificate.pages.length,3);
const hosts=new Set();
for(const row of certificate.pages){
 const u=new URL(row.url);
 assert.equal(u.protocol,'https:');
 assert.ok(['www.srigranth.org','srigurugranth.net','www.gurbanitabs.com'].includes(u.hostname));
 hosts.add(u.hostname);
 assert.equal(row.http_status,200);
 assert.match(row.page_sha256,/^[0-9a-f]{64}$/);
 assert.ok(Array.isArray(row.exact_nfc_html_matches));
 for(const id of row.exact_nfc_html_matches)assert.ok(unit.lines.some(l=>l.id===id));
 for(const id of row.unmatched_not_disagreements)assert.ok(unit.lines.some(l=>l.id===id));
}
assert.equal(hosts.size,3);
const counts=Object.fromEntries(unit.lines.map(l=>[l.id,certificate.pages.filter(p=>p.exact_nfc_html_matches.includes(l.id)).length]));
for(const line of unit.lines)assert.equal(counts[line.id],certificate.frozen_anchor.lines.find(row=>row.id===line.id).web_matches);
assert.equal(certificate.frozen_corpus_modified,false);
assert.equal(certificate.public_release_authorized,false);
assert.equal(certificate.qualified_sikh_punjabi_review,'PENDING');
assert.equal(certificate.independent_source_edition_collation,'PENDING');
assert.ok(certificate.limitation.includes('share the same digital source'));
console.log(JSON.stringify({status:'PASS',count:unit.lines.length,matchedWebCounts:counts,review:'PENDING',limit:'Read-only source/web evidence, not independent printed edition or approval'}));
