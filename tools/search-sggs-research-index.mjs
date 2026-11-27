#!/usr/bin/env node
// Explicit original-text retrieval, not semantic interpretation or a scripture reader.
import {loadValidatedPacket,searchPacket} from './sggs-original-research.mjs';
const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i+=2){if(!['--index','--query','--mode','--limit'].includes(args[i])||!args[i+1]||Object.hasOwn(options,args[i]))throw Error('Use --index /research/index.json --query Gurmukhi [--mode phrase|first-letter|first-letter-anywhere] [--limit 1..100].');options[args[i]]=args[i+1];}
if(!options['--index']||!options['--query'])throw Error('Both index and original-text query are required.');
if(options['--limit']&&!/^(?:[1-9]\d?|100)$/.test(options['--limit']))throw Error('Limit must be an integer from 1 through 100.');
const packet=await loadValidatedPacket(options['--index']);
console.log(JSON.stringify(searchPacket(packet,options['--query'],{mode:options['--mode']||'phrase',limit:options['--limit']?Number(options['--limit']):20}),null,2));
