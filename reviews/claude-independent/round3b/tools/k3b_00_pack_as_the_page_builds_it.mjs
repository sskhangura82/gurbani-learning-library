// Round 3b: produce the knowledge pack exactly as the page builds it — scripture.json and pilot.json through the
// candidate's own loadKnowledge, with its own pins — so the round 3 scripts can be rerun on the real thing.
// Usage: node k3b_00_pack_as_the_page_builds_it.mjs <path to PR48 checkout> <out pilot.json>
import fs from 'node:fs'; import path from 'node:path'; import {pathToFileURL} from 'node:url'; import {webcrypto} from 'node:crypto';
if (!globalThis.crypto) globalThis.crypto = webcrypto;
const [root, out] = process.argv.slice(2), K = p => path.join(root, 'knowledge', p);
const {loadKnowledge} = await import(pathToFileURL(K('registry.mjs')).href);
const {PACK_SHA256} = await import(pathToFileURL(K('app.mjs')).href).catch(() => ({}));
const sBytes = fs.readFileSync(K('scripture.json')), tBytes = fs.readFileSync(K('pilot.json'));
const enc = new TextEncoder();
const sha = async b => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', b)), x => x.toString(16).padStart(2, '0')).join('');
const pack = await loadKnowledge(sBytes, tBytes, await sha(tBytes));
fs.writeFileSync(out, JSON.stringify(pack, null, 1));
console.log(JSON.stringify({schema: pack.schema, nodes: pack.nodes.length, occurrences: pack.occurrences.length, edges: pack.edges.length,
  teachingPinInApp: PACK_SHA256 ?? null, teachingFileDigest: await sha(tBytes), scriptureFileDigest: await sha(sBytes),
  byType: pack.nodes.reduce((a, n) => (a[n.type] = (a[n.type] || 0) + 1, a), {})}));
