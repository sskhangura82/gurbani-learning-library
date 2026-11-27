#!/usr/bin/env node
// Raw upstream pages contain modern translations. Temporary research only.
import {mkdir,realpath,writeFile} from 'node:fs/promises';
import {basename,dirname,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {loadFaridInputs,validateFaridIntake} from './validate-farid-intake.mjs';
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--output')throw Error('Use --output /new/temporary/directory outside any Git worktree.');
const output=resolve(args[1]),parent=await realpath(dirname(output));
const probe=spawnSync('git',['-C',parent,'rev-parse','--show-toplevel'],{encoding:'utf8'});
if(probe.status===0)throw Error('Raw modern-translation witnesses must not be written inside a Git worktree.');
const {manifest,corpus,options}=await loadFaridInputs();
validateFaridIntake(manifest,corpus,options);
const descriptors=[manifest.source.metadataWitness,...manifest.source.textWitnesses];
const witnessFiles=new Map(await Promise.all(descriptors.map(async item=>{
 const response=await fetch(item.rawUrl,{redirect:'error',signal:AbortSignal.timeout(15000)});
 if(!response.ok||!response.body)throw Error('Witness request failed for '+item.path+': '+response.status);
 const reader=response.body.getReader(),chunks=[];let size=0;
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;
  if(size>item.bytes){await reader.cancel();throw Error('Witness exceeds fixed size: '+item.path);}chunks.push(Buffer.from(value));}
 return [item.path,Buffer.concat(chunks)];
})));
const report=validateFaridIntake(manifest,corpus,{...options,witnessFiles});
const actual=resolve(parent,basename(output));await mkdir(actual);
for(const [path,bytes]of witnessFiles)await writeFile(resolve(actual,basename(path)),bytes,{flag:'wx'});
console.log(JSON.stringify({result:report.result,scope:'TEMPORARY_PINNED_RESEARCH_WITNESSES_ONLY',witnessFilesVerified:report.witnessFilesVerified,runtimeEligible:false,publicationReady:false,output:actual}));
