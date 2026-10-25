/* GLP-001 review gate: source references and current worker manifest must match. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=n=>fs.readFileSync(path.join(root,n));
function fail(s){console.error('FAIL '+s);process.exitCode=1;}
const script=read('tests/build-sw.mjs').toString();
const namesMatch=script.match(/const names=(\[.*?\]);/);
if(!namesMatch)throw Error('Build asset list not found');
const names=JSON.parse(namesMatch[1].replaceAll("'",'"'));
const assets=names.map(n=>n||'index.html');
const worker=read('sw.js').toString();
const version=worker.match(/^const VERSION="([^"]+)";/m)?.[1];
const expected=worker.match(/^const EXPECTED=(\{[^\n]+\});/m)?.[1];
if(!version||!expected)throw Error('Worker version or manifest missing');
const hashes=JSON.parse(expected);
let checks=0;
for(const [index,name] of assets.entries()){
 const key='./'+names[index];
 // Explicitly allow ./ and ./index.html to share the same page bytes.
 if(name==='index.html'&&names.includes('')&&!hashes['./index.html']){
   fail('Index cache route missing');
 }
 if(!fs.existsSync(path.join(root,name))){fail('Missing asset '+name);continue;}
 const hash=crypto.createHash('sha256').update(read(name)).digest('hex');
 const found=hashes[key]||hashes['./'+name];
 if(hash!==found)fail('Stale or missing worker hash for '+name);
 else checks++;
}
const html=read('full-japji.html').toString();
const refs=[...html.matchAll(/(?:src|href)="([^"]+)"/g)]
 .map(m=>m[1]).filter(s=>/^(css\/|js\/|icons\/|manifest\.webmanifest)/.test(s));
for(const ref of refs){
 if(!hashes['./'+ref])fail('Referenced runtime asset is not precached: '+ref);
 else checks++;
}
if(!hashes['./css/reader-serenity.css'])fail('Serenity CSS absent from offline release cache');
else checks++;
const stray=Object.keys(hashes).filter(k=>k!=='./'&&!names.includes(k.slice(2)));
if(stray.length)fail('Stale worker manifest routes: '+stray.join(', '));
console.log(JSON.stringify({version,checked:checks,htmlReferences:refs.length,workerAssets:Object.keys(hashes).length,status:process.exitCode?'FAIL':'PASS'}));
