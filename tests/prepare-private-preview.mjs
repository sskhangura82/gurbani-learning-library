/* Prepare a bounded, immutable, QA-only static snapshot from a reviewed candidate.
 * No app source mutation, export of learning, credentials, or public hosting.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const source=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const destination=process.argv[2];
if(!destination||!path.isAbsolute(destination)||path.resolve(destination)!==destination||!destination.includes('/GurbaniLearningLibrary/previews/'))
 throw Error('Pass a new absolute destination inside GurbaniLearningLibrary/previews/');
if(fs.existsSync(destination))throw Error('Destination exists: do not overwrite a prior QA snapshot');
const head=execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const expectedHead=process.argv[3];
if(!/^[0-9a-f]{40}$/.test(expectedHead||''))throw Error('Pass exact pinned review commit SHA as second argument');
if(head!==expectedHead)throw Error('Unexpected draft branch head '+head+'; inspect and update pinned review source');
const worker=fs.readFileSync(path.join(source,'sw.js'),'utf8');
const raw=worker.match(/^const EXPECTED=(\{[^\n]+\});/m)?.[1];
const version=worker.match(/^const VERSION="([^"]+)";/m)?.[1];
if(!raw||!version||!version.includes('serenity-review'))throw Error('Invalid reader candidate worker or version');
const expected=JSON.parse(raw);
if(!expected['./css/reader-serenity.css'])throw Error('Serenity stylesheet is not hash-pinned');
const assets=new Set();
for(const [key,hash] of Object.entries(expected)){
 if(!/^\.\/(?:[a-zA-Z0-9._/-]*)$/.test(key))throw Error('Unsafe expected route '+key);
 const filename=key==='./'?'index.html':key.slice(2);
 if(!filename||filename.startsWith('/')||filename.split('/').some(p=>p==='.'||p==='..'||p===''||p.startsWith('.')))throw Error('Unsafe filename '+filename);
 const full=path.join(source,filename);
 const stat=fs.lstatSync(full);
 if(!stat.isFile()||stat.isSymbolicLink())throw Error('Non-file/symlink source '+filename);
 const actual=crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
 if(actual!==hash)throw Error('Worker hash mismatch for '+filename);
 assets.add(filename);
}
const parent=path.dirname(destination);
fs.mkdirSync(parent,{recursive:true,mode:0o700});
fs.mkdirSync(destination,{mode:0o700});
for(const filename of assets){
 const rel=path.dirname(filename),output=path.join(destination,filename);
 if(rel!=='.')fs.mkdirSync(path.dirname(output),{recursive:true,mode:0o700});
 fs.copyFileSync(path.join(source,filename),output,fs.constants.COPYFILE_EXCL);
 fs.chmodSync(output,0o444);
}
fs.copyFileSync(path.join(source,'sw.js'),path.join(destination,'sw.js'),fs.constants.COPYFILE_EXCL);
fs.chmodSync(path.join(destination,'sw.js'),0o444);
for(const name of fs.readdirSync(destination,{recursive:true})){
 const p=path.join(destination,name);
 if(fs.statSync(p).isDirectory())fs.chmodSync(p,0o555);
}
fs.chmodSync(destination,0o555);
const receipt={sourceCommit:head,workerVersion:version,workerPinnedRoutes:Object.keys(expected).length,uniqueFiles:assets.size+1,originScope:'tailnet-only QA preview; no publishing/merging',createdAt:new Date().toISOString(),sourceIntegrity:'all SHA-256 worker hashes independently verified'};
fs.writeFileSync(destination+'.receipt.json',JSON.stringify(receipt,null,2)+'\n',{mode:0o600,flag:'wx'});
console.log(JSON.stringify({status:'PASS',destination,receipt}));
