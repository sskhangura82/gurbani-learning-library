/* GLP-001 Mind preview: verified manifest coverage, original bytes and all local resources. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read=name=>fs.readFileSync(path.join(root,name));
let count=0,issues=[];
const match=read('tests/build-sw.mjs').toString().match(/const names=(\[.*?\]);/);
if(!match)throw Error('Missing build asset declaration');
const names=JSON.parse(match[1].replaceAll("'",'"'));
const worker=read('sw.js').toString();
const raw=worker.match(/^const EXPECTED=(\{[^\n]+\});/m)?.[1];
const version=worker.match(/^const VERSION="([^"]+)";/m)?.[1];
if(!raw||!version)throw Error('Missing generated service worker manifest');
const expected=JSON.parse(raw);
for(const asset of names){
 const f=asset||'index.html',key='./'+asset;
 if(!fs.existsSync(path.join(root,f))){issues.push('File missing '+f);continue;}
 const actual=crypto.createHash('sha256').update(read(f)).digest('hex');
 if(expected[key]!==actual)issues.push('Worker hash stale or missing '+key);
 else count++;
}
for(const filename of ['index.html','psychology.html','full-japji.html','nitnem.html']){
 const body=read(filename).toString();
 for(const m of body.matchAll(/(?:src|href)="([^"]+)"/g)){
  const asset=m[1];
  if(!/^(css\/|js\/|icons\/|manifest\.webmanifest)/.test(asset))continue;
  if(!expected['./'+asset])issues.push('Local resource omitted from cache: '+filename+' → '+asset);
  else count++;
 }
}
if(!expected['./css/mind-serenity-preview.css'])issues.push('Mind serenity stylesheet is not precached');
else count++;
if(Object.keys(expected).length!==41)issues.push('Expected 41 release routes; found '+Object.keys(expected).length);
for(const key of Object.keys(expected))if(key!=='./'&&!names.includes(key.slice(2)))issues.push('Obsolete worker route '+key);
if(issues.length){for(const x of issues)console.error('FAIL '+x);process.exitCode=1;}
console.log(JSON.stringify({version,verified:count,releaseRoutes:Object.keys(expected).length,status:issues.length?'FAIL':'PASS',issues}));
