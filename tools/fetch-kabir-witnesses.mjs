#!/usr/bin/env node
// Fetch only the four fixed digital witnesses declared by the validated intake.
// These temporary files contain third-party translations; never add them to the repo.
import {mkdir,writeFile} from "node:fs/promises";
import {resolve,basename} from "node:path";
import {loadIntakeInputs,validateKabirIntake} from "./validate-kabir-intake.mjs";
const args=process.argv.slice(2);
if(args.length!==2 || args[0]!=="--output")throw Error("Usage: node tools/fetch-kabir-witnesses.mjs --output /temporary/directory");
const {manifest,options}=await loadIntakeInputs();
validateKabirIntake(manifest,options);
const descriptors=[manifest.source.metadataWitness,...manifest.source.textWitnesses];
const witnessFiles=new Map(await Promise.all(descriptors.map(async item=>{
 const response=await fetch(item.rawUrl,{redirect:"error",signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("Witness request failed: "+response.status+" "+item.path);
 const reader=response.body.getReader(),chunks=[];let length=0;
 for(;;){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;
  if(length>item.bytes){await reader.cancel();throw Error("Unexpected witness size: "+item.path);}chunks.push(Buffer.from(value));}
 return [item.path,Buffer.concat(chunks)];
})));
const report=validateKabirIntake(manifest,{...options,witnessFiles});
const output=resolve(args[1]);await mkdir(output,{recursive:true});
for(const [path,bytes]of witnessFiles)await writeFile(resolve(output,basename(path)),bytes);
console.log(JSON.stringify({result:report.result,witnessFilesVerified:report.witnessFilesVerified,output,scope:"Temporary pinned digital witnesses, not religious approval."}));
