#!/usr/bin/env node
// Raw pages contain protected reading aids; temporary research outside Git only.
import {mkdir,realpath,writeFile} from 'node:fs/promises';
import {resolve,dirname,basename} from 'node:path';
import {requireOutsideGitWorktree,loadInventory,gitBlob,SOURCE_COMMIT,INVENTORY_SHA256} from './sggs-original-research.mjs';
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--output')throw Error('Use --output /new/temporary/directory outside Git.');
const output=resolve(args[1]),parent=await realpath(dirname(output));
requireOutsideGitWorktree(parent);
const inventory=await loadInventory(),actual=resolve(parent,basename(output));
await mkdir(actual,{mode:0o700});
let cursor=0,done=0,failure=null;
async function fetchPage(descriptor){
 const url='https://raw.githubusercontent.com/opengranth/open-granth/'+SOURCE_COMMIT+'/'+descriptor.path;
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(20000)});
 if(!response.ok||!response.body)throw Error('Source request failed: '+descriptor.path+' '+response.status);
 const chunks=[];let size=0;const reader=response.body.getReader();
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>descriptor.bytes){await reader.cancel();throw Error('Source exceeds pinned size.');}chunks.push(Buffer.from(value));}
 const bytes=Buffer.concat(chunks);
 if(bytes.length!==descriptor.bytes||gitBlob(bytes)!==descriptor.gitBlob)throw Error('Pinned source fingerprint mismatch: '+descriptor.path);
 await writeFile(resolve(actual,basename(descriptor.path)),bytes,{flag:'wx',mode:0o600});
}
await Promise.all(Array.from({length:8},async()=>{while(!failure){const descriptor=inventory.files[cursor++];if(!descriptor)return;try{await fetchPage(descriptor);done++;if(done%100===0)console.log('Pinned source files captured: '+done+'/1430');}catch(error){failure=error;}}}));
if(failure)throw failure;
await writeFile(resolve(actual,'capture.json'),JSON.stringify({schema:'glp.corpus-capture.v1',sourceCommit:SOURCE_COMMIT,inventorySha256:INVENTORY_SHA256,files:1430,rawBytes:inventory.totalBytes,complete:true},null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({result:'CAPTURE_COMPLETE',sourceFiles:done,rawBytes:inventory.totalBytes,output:actual,rightsScope:'TEMPORARY_RESEARCH_ONLY_NOT_FOR_REDISTRIBUTION'}));
