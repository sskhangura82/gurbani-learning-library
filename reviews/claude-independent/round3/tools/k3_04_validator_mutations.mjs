// Round 3 — what the pilot's own data check (buildIndex in core.mjs) notices when the file is edited and the
// file fingerprint is assumed to have been updated with it (an honest editing mistake, or a careless future edit).
// The page's only other guard is the whole-file fingerprint kept in app.mjs.
// Usage: node k3_04_validator_mutations.mjs <path to PR45 checkout> <out.json>
import fs from 'node:fs'; import path from 'node:path'; import {pathToFileURL} from 'node:url';
const [root, out] = process.argv.slice(2);
const core = await import(pathToFileURL(path.join(root, 'knowledge/core.mjs')).href);
const G = JSON.parse(fs.readFileSync(path.join(root, 'knowledge/pilot.json'), 'utf8'));
import {cases} from './k3_cases.mjs';
const res = {baselinePasses: true, cases: []};
try { core.buildIndex(structuredClone(G)); } catch (e) { res.baselinePasses = false; }
for (const [group, name, fn] of cases) { const g = structuredClone(G); fn(g); let caught = null; try { core.buildIndex(g); } catch (e) { caught = e.message; } res.cases.push({group, name, noticed: !!caught, message: caught}); }
res.summary = {}; for (const c of res.cases) { const s = res.summary[c.group] ??= {cases: 0, noticed: 0}; s.cases++; if (c.noticed) s.noticed++; }
res.total = {cases: res.cases.length, noticed: res.cases.filter(c => c.noticed).length};
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log('baseline passes:', res.baselinePasses, '| noticed', res.total.noticed, 'of', res.total.cases, JSON.stringify(res.summary));
for (const c of res.cases) console.log(c.noticed ? '  noticed ' : '  MISSED  ', c.group.padEnd(11), c.name, c.noticed ? '→ ' + c.message : '');
