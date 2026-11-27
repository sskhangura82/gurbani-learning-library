#!/usr/bin/env node
// A fresh research artifact only. Never alters inventory, source text or runtime assets.
import {mkdir,realpath,writeFile} from 'node:fs/promises';
import {resolve,dirname,basename} from 'node:path';
import {requireOutsideGitWorktree,projectWitnessDirectory,loadProjectionContract,validatePacket,sha256,SOURCE_COMMIT,INVENTORY_SHA256,PROJECTION_CONTRACT_SHA256} from './sggs-original-research.mjs';
const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i+=2){if(!['--witness-dir','--output'].includes(args[i])||!args[i+1]||Object.hasOwn(options,args[i]))throw Error('Use --witness-dir /capture --output /new/research/directory.');options[args[i]]=args[i+1];}
if(!options['--witness-dir']||!options['--output'])throw Error('Both witness and output directories are required.');
const output=resolve(options['--output']),parent=await realpath(dirname(output));
requireOutsideGitWorktree(parent);
const {packet,contract:observed}=await projectWitnessDirectory(options['--witness-dir']),contract=await loadProjectionContract();
if(JSON.stringify(observed)!==JSON.stringify(contract))throw Error('The reconstructed projection differs from the separately pinned contract.');
const validation=validatePacket(packet,contract),bytes=JSON.stringify(packet)+'\n';
const actual=resolve(parent,basename(output));await mkdir(actual,{mode:0o700});
await writeFile(resolve(actual,'index.json'),bytes,{flag:'wx',mode:0o600});
const receipt={schema:'glp.original-corpus-build-receipt.v1',sourceCommit:SOURCE_COMMIT,inventorySha256:INVENTORY_SHA256,projectionContractSha256:PROJECTION_CONTRACT_SHA256,packetSha256:sha256(bytes),packetBytes:Buffer.byteLength(bytes),...validation,rawWitnessesIncluded:false,modernTranslationsIncluded:false,generatedTransliterationIncluded:false,sourceTextNormalized:false,canonicalAuthorAssignments:0,canonicalAngAssignments:0};
await writeFile(resolve(actual,'receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify(receipt,null,2));
