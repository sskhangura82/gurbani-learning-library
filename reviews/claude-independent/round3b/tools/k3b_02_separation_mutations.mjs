// Round 3b / R3-03: is Gurbani really protected apart from teaching now?
// Part 1: the SAME 35 edits used in round 3 (k3_cases.mjs), applied to the merged pack and put through the page's own
//   data check (core.buildIndex), so the number can be set beside round 3's 14 of 35.
// Part 2: the two-file design itself. Every edit is made the way a careless but honest editor would: the file's own
//   digest is recomputed to match, so only a real independent check can catch it.
//   2a scripture edits, with the scripture pin regenerated  2b teaching edits that try to define or restate scripture
//   2c a line changed together with its own fingerprints (does the lesson's stored binding still catch it?)
// Usage: node k3b_02_separation_mutations.mjs <path to PR48 checkout> <path to round3/tools> <out.json>
import fs from 'node:fs'; import path from 'node:path'; import {pathToFileURL} from 'node:url'; import {webcrypto} from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const [root, round3tools, out] = process.argv.slice(2);
const K = p => path.join(root, 'knowledge', p);
const core = await import(pathToFileURL(K('core.mjs')).href);
const registry = await import(pathToFileURL(K('registry.mjs')).href);
const {cases} = await import(pathToFileURL(path.join(round3tools, 'k3_cases.mjs')).href);
const SC = JSON.parse(fs.readFileSync(K('scripture.json'), 'utf8')), ED = JSON.parse(fs.readFileSync(K('pilot.json'), 'utf8'));
const enc = new TextEncoder();
const sha = async v => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', typeof v === 'string' ? enc.encode(v) : v)), x => x.toString(16).padStart(2, '0')).join('');
const merged = () => { const e = structuredClone(ED), s = structuredClone(SC); const m = {...e}; m.occurrences = s.occurrences;
  m.nodes = [...e.nodes, ...s.sourceNodes, ...s.passages.map(p => ({...p, type: 'passage'}))]; return m; };
const R = {part1_same35EditsThroughThePagesDataCheck: {cases: []}, part2_theTwoFileDesign: {cases: []}};
// ---- part 1
let base = true; try { core.buildIndex(merged()); } catch (e) { base = false; R.part1_same35EditsThroughThePagesDataCheck.baselineError = e.message; }
R.part1_same35EditsThroughThePagesDataCheck.baselinePasses = base;
for (const [group, name, fn] of cases) {
  const g = merged(); let noticed = null;
  try { fn(g); } catch (e) { R.part1_same35EditsThroughThePagesDataCheck.cases.push({group, name, noticed: null, applyError: e.message}); continue; }
  try { core.buildIndex(g); } catch (e) { noticed = e.message; }
  R.part1_same35EditsThroughThePagesDataCheck.cases.push({group, name, noticed: !!noticed, message: noticed});
}
const p1 = R.part1_same35EditsThroughThePagesDataCheck.cases.filter(c => c.noticed !== null);
R.part1_same35EditsThroughThePagesDataCheck.total = {applied: p1.length, noticed: p1.filter(c => c.noticed).length, couldNotApply: R.part1_same35EditsThroughThePagesDataCheck.cases.length - p1.length};
R.part1_same35EditsThroughThePagesDataCheck.byGroup = {};
for (const c of p1) { const s = R.part1_same35EditsThroughThePagesDataCheck.byGroup[c.group] ??= {cases: 0, noticed: 0}; s.cases++; if (c.noticed) s.noticed++; }
// ---- part 2: run the real loader, the way the page does
async function load(scObj, edObj, {regenerateScripturePin = true, regenerateTeachingPin = true} = {}) {
  const sBytes = enc.encode(JSON.stringify(scObj)), tBytes = enc.encode(JSON.stringify(edObj));
  const realPin = (await import(pathToFileURL(K('source-lock.mjs')).href)).SCRIPTURE_SHA256;
  // the page compares against the pinned digest; an editor who regenerates it is simulated by passing the new one
  const pin = regenerateScripturePin ? await sha(sBytes) : realPin;
  const mod = {...registry};
  // call verifyScripture/loadKnowledge with the pin we want by patching the module's source lock through a shim
  const shimDir = fs.mkdtempSync('/tmp/k3b-'); for (const f of ['registry.mjs', 'core.mjs']) fs.copyFileSync(K(f), path.join(shimDir, f));
  fs.writeFileSync(path.join(shimDir, 'source-lock.mjs'), 'export const SCRIPTURE_SHA256="' + pin + '";');
  const reg = await import(pathToFileURL(path.join(shimDir, 'registry.mjs')).href + '?v=' + Math.random());
  const teachingPin = regenerateTeachingPin ? await sha(tBytes) : 'x'.repeat(64);
  return reg.loadKnowledge(sBytes, tBytes, teachingPin);
}
async function attempt(group, name, mutate) {
  const s = structuredClone(SC), e = structuredClone(ED); let opts = {};
  try { opts = (await mutate(s, e, {sha})) || {}; } catch (err) { R.part2_theTwoFileDesign.cases.push({group, name, noticed: null, applyError: err.message}); return; }
  let refused = null, pack = null;
  try { pack = await load(s, e, opts); } catch (err) { refused = err.message; }
  let alsoDataCheck = null;
  if (!refused) { try { core.buildIndex(pack); } catch (err) { alsoDataCheck = err.message; } }
  R.part2_theTwoFileDesign.cases.push({group, name, noticed: !!(refused || alsoDataCheck), refusedBy: refused ? 'the source/teaching check' : alsoDataCheck ? 'the page data check' : null, message: refused || alsoDataCheck});
}
const firstVerse = s => s.occurrences.find(o => o.kind === 'verse');
// 2a — scripture edited, its own pin regenerated
await attempt('scripture', 'one letter changed in a line of Gurbani (nasal sign dropped), file pin regenerated', s => { const o = firstVerse(s); o.text = o.text.replace('ਸਿੰਮਲ', 'ਸਿਮਲ'); });
await attempt('scripture', 'one letter changed AND that line fingerprint recomputed', async (s, e, {sha}) => { const o = firstVerse(s); o.text = o.text.replace('ਸਿੰਮਲ', 'ਸਿਮਲ'); o.textSha256 = await sha(o.text); });
await attempt('scripture', 'two lines of a Salok swapped', s => { const a = s.occurrences[1], b = s.occurrences[2]; [a.text, b.text] = [b.text, a.text]; [a.textSha256, b.textSha256] = [b.textSha256, a.textSha256]; });
await attempt('scripture', 'a line removed and the count adjusted', s => { const p = s.passages[0]; const id = p.occurrenceIds.pop(); p.expectedOccurrenceCount--; s.occurrences = s.occurrences.filter(o => o.id !== id); delete s.legacyOccurrenceIds[Object.keys(s.legacyOccurrenceIds).find(k => s.legacyOccurrenceIds[k] === id)]; });
await attempt('scripture', 'the author of a Salok changed (Guru Nanak to Guru Angad)', s => { s.passages[0].authorId = s.passages[1].authorId; });
await attempt('scripture', 'the Pauri number changed but the identity left alone', s => { s.passages[0].pauriNumber = 13; });
await attempt('scripture', 'identity and Pauri number changed together (a believable renaming)', s => { const p = s.passages[0], old = p.id; p.pauriNumber = 13; p.id = 'sggs.asa-di-vaar.pauri013.salok01'; for (const o of s.occurrences) if (o.passageId === old) o.passageId = p.id; });
await attempt('scripture', 'the Ang changed', s => { s.passages[0].angStart = 471; s.passages[0].angEnd = 471; });
await attempt('scripture', 'the edition swapped for an unpinned one', s => { s.edition.id = 'edition.sggs.other'; });
await attempt('scripture', 'the edition marked as human-collated (a false claim of review)', s => { s.edition.humanCollated = true; });
await attempt('scripture', 'a source witness blob changed', s => { s.sourceWitnesses['470'].gitBlob = '0'.repeat(40); });
await attempt('scripture', 'the crosswalk emptied', s => { s.legacyOccurrenceIds = {}; });
await attempt('scripture', 'two old names pointed at one new line', s => { const k = Object.keys(s.legacyOccurrenceIds); s.legacyOccurrenceIds[k[1]] = s.legacyOccurrenceIds[k[0]]; });
await attempt('scripture', 'a fourth Salok added', s => { const p = structuredClone(s.passages[0]); p.id += '.copy'; s.passages.push(p); });
await attempt('scripture', 'everything recomputed: line text, line fingerprint, passage fingerprint, file pin', async (s, e, {sha}) => {
  const p = s.passages[0], o = s.occurrences.find(x => x.passageId === p.id && x.kind === 'verse');
  o.text = o.text.replace('ਸਿੰਮਲ', 'ਸਿਮਲ'); o.textSha256 = await sha(o.text);
  const rows = p.occurrenceIds.map(id => s.occurrences.find(x => x.id === id));
  p.passageSha256 = await sha(JSON.stringify([p.id, p.authorId, p.compositionId, p.raagId, p.pauriNumber, p.salokPosition, p.angStart, p.angEnd, rows.map(r => [r.id, r.textSha256])]));
});
// 2b — teaching trying to define or restate scripture
await attempt('teaching', 'the teaching pack carries its own copy of the lines', (s, e) => { e.occurrences = structuredClone(s.occurrences); });
await attempt('teaching', 'the teaching pack declares a passage node', (s, e) => { e.nodes.push({id: 'sggs.made.up.salok01', type: 'passage', title: 'ਮਨਘੜਤ ਸਲੋਕ'}); });
await attempt('teaching', 'the teaching pack declares an author', (s, e) => { e.nodes.push({id: 'author.invented', type: 'author', title: 'Invented'}); });
await attempt('teaching', 'an editorial title put where the original name belongs', (s, e) => { e.passageDescriptions[0].title = 'ਸਲੋਕੁ ਮਃ ੧ ॥'; });
await attempt('teaching', 'an extra field smuggled into a passage description', (s, e) => { e.passageDescriptions[0].text = 'ਮਨਘੜਤ ਪੰਕਤੀ ॥'; });
await attempt('teaching', 'a passage description for a passage that does not exist', (s, e) => { e.passageDescriptions.push({passageId: 'sggs.nope', title: 'x', pa: 'x', aliases: []}); });
await attempt('teaching', 'a passage left with no description', (s, e) => { e.passageDescriptions.pop(); });
await attempt('teaching', 'a lesson claims a passage it is not bound to', (s, e) => { const l = e.nodes.find(n => n.type === 'lesson'); l.sourcePassageIds = [s.passages[2].id]; });
await attempt('teaching', 'a lesson binding left stale after the passage changed', async (s, e, {sha}) => { const l = e.nodes.find(n => n.type === 'lesson'); l.sourceBindings[0].sha256 = 'a'.repeat(64); });
await attempt('teaching', 'a dictionary sense points at a line it does not cite', (s, e) => { const w = e.nodes.find(n => n.type === 'word'); w.senses[0].occurrenceIds = [s.occurrences[0].id]; });
await attempt('teaching', 'the teaching status changed to something that sounds approved', (s, e) => { e.status = 'REVIEWED'; });
await attempt('teaching', 'an ordinary teaching edit (a lesson sentence reworded) — must be allowed', (s, e) => { const l = e.nodes.find(n => n.type === 'lesson'); if (l.sections?.[0]?.en) l.sections[0].en += ' One more sentence.'; else if (l.simple?.en) l.simple.en += ' One more sentence.'; else { const k = Object.keys(l).find(k => l[k]?.en); l[k].en += ' One more sentence.'; } });
await attempt('teaching', 'a new concept added — must be allowed', (s, e) => { e.nodes.push({id: 'concept.new', type: 'concept', title: 'New', pa: 'ਨਵਾਂ', aliases: ['new'], review: 'AI_ASSISTED_DRAFT'}); });
// 2c — the independent pin itself
await attempt('pin', 'scripture edited and the file pin NOT regenerated (what the page actually ships with)', (s) => { const o = firstVerse(s); o.text = o.text.replace('ਸਿੰਮਲ', 'ਸਿਮਲ'); return {regenerateScripturePin: false}; });
await attempt('pin', 'teaching edited and the teaching pin NOT regenerated', (s, e) => { e.status = 'NONPUBLISHING_DRAFT '; return {regenerateTeachingPin: false}; });
const p2 = R.part2_theTwoFileDesign.cases.filter(c => c.noticed !== null);
R.part2_theTwoFileDesign.total = {applied: p2.length, noticed: p2.filter(c => c.noticed).length};
R.part2_theTwoFileDesign.byGroup = {};
for (const c of p2) { const s = R.part2_theTwoFileDesign.byGroup[c.group] ??= {cases: 0, noticed: 0}; s.cases++; if (c.noticed) s.noticed++; }
fs.writeFileSync(out, JSON.stringify(R, null, 1));
console.log('part 1 (same 35 edits, page data check):', JSON.stringify(R.part1_same35EditsThroughThePagesDataCheck.total), JSON.stringify(R.part1_same35EditsThroughThePagesDataCheck.byGroup));
console.log('part 2 (the two-file design):', JSON.stringify(R.part2_theTwoFileDesign.total), JSON.stringify(R.part2_theTwoFileDesign.byGroup));
for (const c of R.part2_theTwoFileDesign.cases) console.log(' ', (c.noticed ? 'caught ' : c.noticed === null ? 'ERROR  ' : 'MISSED '), (c.group + ' · ' + c.name).slice(0, 86).padEnd(86), (c.message || c.applyError || '').slice(0, 60));
