#!/usr/bin/env node
// Temporary source witnesses include modern translations; do not commit them.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--output')throw Error('Usage: node tools/fetch-salok-kabir-witnesses.mjs --output /temporary/directory');
const bytes=await fs.readFile(new URL('../salok-kabir/data/salok-kabir.json',import.meta.url));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
if(sha(bytes)!=='34698bcbbaa8c54416de495011ee38493f549a5c0b92720e684f8c399dcf64f2')throw Error('The fixed source intake changed');
const pack=JSON.parse(bytes),commit='34d2a7cab032c8ea24d21ff20f64653bd03766f4';
const files=await Promise.all(pack.sourceAudit.witnesses.map(async w=>{
 if(!(w.ang>=1364&&w.ang<=1377)||w.path!==`corpus/ang-${w.ang}.md`)throw Error('Unexpected source path');
 const url=`https://raw.githubusercontent.com/opengranth/open-granth/${commit}/${w.path}`;
 const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Witness HTTP '+response.status);
 const reader=response.body.getReader(),chunks=[];let total=0;
 for(;;){const {value,done}=await reader.read();if(done)break;total+=value.byteLength;
  if(total>w.bytes){await reader.cancel();throw Error('Witness exceeds expected byte count');}chunks.push(Buffer.from(value));}
 const data=Buffer.concat(chunks);
 if(data.length!==w.bytes||sha(data)!==w.sha256)throw Error('Witness fingerprint differs: '+w.path);
 return [path.basename(w.path),data];
}));
const output=path.resolve(args[1]);await fs.mkdir(output,{recursive:true});
for(const [name,data]of files)await fs.writeFile(path.join(output,name),data);
console.log(JSON.stringify({status:'PASS',pinnedWitnesses:files.length,output}));
