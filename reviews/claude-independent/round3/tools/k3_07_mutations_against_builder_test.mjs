// Round 3, comparison step (written AFTER my findings were pushed and the builder's tests were opened).
// The same 35 edits as k3_04, each written to a temporary copy of the pilot with the file fingerprint in app.mjs
// renewed to match — as an editor would after a legitimate change — and then given to the builder's own
// contract test (tests/knowledge-contract.mjs). Shows what the builder's test adds to the pilot's data check.
// Usage: node k3_07_mutations_against_builder_test.mjs <path to PR45 checkout> <out.json>
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import {createHash} from 'node:crypto'; import {spawnSync} from 'node:child_process';
import {cases} from './k3_cases.mjs';
const [root, out] = process.argv.slice(2);
const G = JSON.parse(fs.readFileSync(path.join(root, 'knowledge/pilot.json'), 'utf8'));
const app = fs.readFileSync(path.join(root, 'knowledge/app.mjs'), 'utf8');
const res = {cases: []};
const runWith = g => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'k3_07_')); fs.mkdirSync(path.join(dir, 'knowledge')); fs.mkdirSync(path.join(dir, 'tests'));
  const bytes = Buffer.from(JSON.stringify(g, null, 1) + '\n', 'utf8'); const h = createHash('sha256').update(bytes).digest('hex');
  fs.writeFileSync(path.join(dir, 'knowledge/pilot.json'), bytes); fs.writeFileSync(path.join(dir, 'knowledge/app.mjs'), app.replace(/PACK_SHA256="[a-f0-9]{64}"/, 'PACK_SHA256="' + h + '"'));
  fs.copyFileSync(path.join(root, 'knowledge/core.mjs'), path.join(dir, 'knowledge/core.mjs')); fs.copyFileSync(path.join(root, 'tests/knowledge-contract.mjs'), path.join(dir, 'tests/knowledge-contract.mjs'));
  const r = spawnSync('node', ['tests/knowledge-contract.mjs'], {cwd: dir, encoding: 'utf8'}); fs.rmSync(dir, {recursive: true, force: true});
  const m = (r.stderr || '').match(/(AssertionError[^\n]*|Error: [^\n]*)/); return {passed: r.status === 0, why: r.status === 0 ? null : (m ? m[1].slice(0, 140) : 'failed')}; };
res.unchangedContentResavedPasses = runWith(structuredClone(G)).passed;
for (const [group, name, fn] of cases) { const g = structuredClone(G); fn(g); const r = runWith(g); res.cases.push({group, name, noticedByBuildersTest: !r.passed, why: r.why}); }
res.summary = {}; for (const c of res.cases) { const s = res.summary[c.group] ??= {cases: 0, noticed: 0}; s.cases++; if (c.noticedByBuildersTest) s.noticed++; }
res.total = {cases: res.cases.length, noticed: res.cases.filter(c => c.noticedByBuildersTest).length};
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log('unchanged content, re-saved, passes the builder\'s test:', res.unchangedContentResavedPasses, '| noticed', res.total.noticed, 'of', res.total.cases, JSON.stringify(res.summary));
for (const c of res.cases) console.log(c.noticedByBuildersTest ? '  noticed ' : '  MISSED  ', c.group.padEnd(11), c.name, c.why ? '→ ' + c.why : '');
