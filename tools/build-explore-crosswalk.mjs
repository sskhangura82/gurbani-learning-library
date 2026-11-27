// Reproduce metadata only from the verified full witness and immutable owning packages.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadValidatedPacket} from './sggs-original-research.mjs';
import {sourceUnits,buildCrosswalkRecord,fingerprint} from '../library/passages.mjs';
import {PASSAGE_SOURCES,CORPUS_COMMIT,PROJECTION_CONTRACT,CROSSWALK_SHA256} from '../library/passage-contracts.mjs';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
export async function reproduceCrosswalk(index){
 const packet=await loadValidatedPacket(index),units=[];
 for(const source of PASSAGE_SOURCES)units.push(...await sourceUnits(source.id,await fs.readFile(path.join(ROOT,source.path))));
 const records=[];for(const unit of units)records.push(await buildCrosswalkRecord(unit,packet.occurrences));
 return {schema:'glp.complete-passage-crosswalk.v1',status:'DEVELOPMENT_REVIEW',sourceCommit:CORPUS_COMMIT,projectionContractSha256:PROJECTION_CONTRACT,independentCollation:false,qualifiedApproval:false,sourceUnits:units.length,units:records};
}
async function main(){
 const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--index')throw Error('Use --index PATH; this command checks and never rewrites source or pins.');
 const result=await reproduceCrosswalk(args[1]),bytes=Buffer.from(JSON.stringify(result,null,2)+'\n'),stored=await fs.readFile(path.join(ROOT,'library/complete-passages.json'));
 if(!stored.equals(bytes)||await fingerprint(bytes)!==CROSSWALK_SHA256)throw Error('Crosswalk differs from the exact frozen complete-sequence projection.');
 console.log(JSON.stringify({status:'MATCH',sourceUnits:result.units.length,uniquelyBound:result.units.filter(u=>u.status==='UNIQUE_COMPLETE_SEQUENCE').length,independentCollation:false,qualifiedApproval:false}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{console.error(error.message);process.exitCode=1;});
