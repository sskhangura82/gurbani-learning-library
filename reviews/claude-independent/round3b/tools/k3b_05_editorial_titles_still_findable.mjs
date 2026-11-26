// Round 3b / R3-04: the passage's name on screen is now its first line of Gurbani, and the editorial title has moved
// to a separate labelled line. Two questions: can a reader who knows the editorial name still find the passage, and
// are the nine curated-name search cases that disappeared accounted for?
// Usage: node k3b_05_editorial_titles_still_findable.mjs <pack built by the loader> <pilot.json of PR45> <PR48 root> <out.json>
import fs from 'node:fs'; import path from 'node:path'; import {pathToFileURL} from 'node:url';
const [packPath, oldPilot, root, out] = process.argv.slice(2);
const core = await import(pathToFileURL(path.join(root, 'knowledge/core.mjs')).href);
const pack = JSON.parse(fs.readFileSync(packPath, 'utf8')), old = JSON.parse(fs.readFileSync(oldPilot, 'utf8'));
const index = core.buildIndex(structuredClone(pack));
const ids = r => (r || []).map(x => x.node?.id ?? x.id ?? x);
const oldNames = old.nodes.filter(n => n.type === 'passage').flatMap(n => [n.title, n.pa, ...(n.aliases || [])].filter(Boolean));
const R = {editorialNamesTried: [], nineMissingCases: {}, passageNodesNow: []};
for (const n of pack.nodes.filter(n => n.type === 'passage')) R.passageNodesNow.push({id: n.id, titleOnScreen: n.title, editorialTitle: n.editorialTitle, editorialPa: n.editorialPa, aliases: n.aliases});
for (const q of [...new Set(oldNames)]) {
  const got = ids(core.search(index, q, {}));
  R.editorialNamesTried.push({query: q, found: got, findsItsPassage: got.some(id => String(id).startsWith('sggs.'))});
}
const now = pack.nodes.flatMap(n => [n.title, n.pa, ...(n.aliases || [])].filter(Boolean));
R.nineMissingCases = {curatedNamesInPR45: [...new Set(old.nodes.flatMap(n => [n.title, n.pa, ...(n.aliases || [])].filter(Boolean)))].length,
  curatedNamesNow: [...new Set(now)].length, namesGone: [...new Set(oldNames)].filter(x => !now.includes(x)), namesAdded: [...new Set(now)].filter(x => !old.nodes.flatMap(n => [n.title, n.pa, ...(n.aliases || [])]).includes(x))};
fs.writeFileSync(out, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R.passageNodesNow, null, 1).slice(0, 900));
console.log('editorial / old names tried:'); for (const t of R.editorialNamesTried) console.log('  ', (t.findsItsPassage ? 'finds it   ' : 'FINDS NOTHING'), JSON.stringify(t.query), '->', JSON.stringify(t.found).slice(0, 90));
console.log('names gone:', JSON.stringify(R.nineMissingCases.namesGone)); console.log('names added:', JSON.stringify(R.nineMissingCases.namesAdded).slice(0, 300));
