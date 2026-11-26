import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { IntakeValidationError, loadIntakeInputs, validateKabirIntake } from '../tools/validate-kabir-intake.mjs';

const repoRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const witnessArg=process.argv.indexOf('--witness-dir');
const witnessDir=witnessArg>=0?process.argv[witnessArg+1]:process.env.GLP_KABIR_WITNESS_DIR;
if(witnessArg>=0&&!witnessDir) throw new Error('--witness-dir requires a directory.');
const {manifest,options}=await loadIntakeInputs({repoRoot,witnessDir});
const noWitness={...options,witnessFiles:null};
const sha=text=>createHash('sha256').update(text).digest('hex');
function reject(name,mutate,code) {
  test(name,()=>{
    const candidate=structuredClone(manifest);
    mutate(candidate);
    assert.throws(()=>validateKabirIntake(candidate,noWitness),error=>error instanceof IntakeValidationError&&error.code===code);
  });
}

test('research intake passes while leaving all runtime and human approval gates closed',()=>{
  const before=JSON.stringify(manifest);
  const report=validateKabirIntake(manifest,noWitness);
  assert.deepEqual({result:report.result,runtimeEligible:report.runtimeEligible,publicReady:report.publicReady,existingRuntimeOccurrences:report.existingRuntimeOccurrences,candidateOccurrences:report.candidateOccurrences,quarantinedDiscrepancies:report.quarantinedDiscrepancies,witnessFilesVerified:report.witnessFilesVerified,qualifiedHumanReview:report.qualifiedHumanReview},{result:'PASS',runtimeEligible:false,publicReady:false,existingRuntimeOccurrences:19,candidateOccurrences:11,quarantinedDiscrepancies:2,witnessFilesVerified:0,qualifiedHumanReview:'NOT_PERFORMED'});
  assert.equal(JSON.stringify(manifest),before,'Validation must not modify content or grant approval.');
});

reject('reject root runtime promotion',m=>{m.runtimeEligible=true;},'RUNTIME_PROMOTION');
reject('reject root publication promotion',m=>{m.publicReady=true;},'RUNTIME_PROMOTION');
reject('reject candidate runtime promotion',m=>{m.candidatePassages[0].runtimeEligible=true;},'RUNTIME_PROMOTION');
reject('reject candidate publication promotion',m=>{m.candidatePassages[0].publicReady=true;},'RUNTIME_PROMOTION');
reject('reject fabricated qualified scholar review',m=>{m.candidatePassages[0].reviews.gurbaniScholar={reviewer:'Synthetic Reviewer',status:'APPROVED'};},'AUTHORITY_PROMOTION');
reject('reject elevating a digital witness to authenticated scripture',m=>{m.source.editionStatus='AUTHENTICATED_SAROOP';},'AUTHORITY_PROMOTION');
reject('reject claiming an adjudicated canonical Ang',m=>{m.candidatePassages[0].locationClaim.canonicalAngs=[323];},'AUTHORITY_PROMOTION');
reject('reject assigning a proposed ID as canonical',m=>{m.candidatePassages[0].canonicalIdStatus='CANONICAL';},'AUTHORITY_PROMOTION');
reject('reject a source commit change',m=>{m.source.commit='0'.repeat(40);},'SOURCE_WITNESS_CHANGED');
reject('reject repinning a raw source file in the manifest',m=>{m.source.textWitnesses[0].sha256='0'.repeat(64);},'SOURCE_WITNESS_CHANGED');
reject('reject a verse alteration',m=>{m.candidatePassages[0].occurrences[5].text+=' ਬਦਲ';},'SOURCE_TEXT_CHANGED');
reject('reject a verse alteration even after renewing its local hashes',m=>{
  const c=m.candidatePassages[0];c.occurrences[5].text+=' ਬਦਲ';
  c.occurrences[5].textSha256=sha(c.occurrences[5].text);
  c.selectedTextDigest.value=sha(c.occurrences.map(r=>r.text).join('\n'));
},'SOURCE_TEXT_CHANGED');
reject('reject reordered verse occurrences',m=>{
  const a=m.candidatePassages[0].occurrences;[a[4],a[5]]=[a[5],a[4]];
},'SOURCE_LOCATOR_CHANGED');
reject('reject reordered verses with rewritten ordinals and locators',m=>{
  const a=m.candidatePassages[0].occurrences;
  [a[4].text,a[5].text]=[a[5].text,a[4].text];
  [a[4].textSha256,a[5].textSha256]=[a[5].textSha256,a[4].textSha256];
},'SOURCE_TEXT_CHANGED');
reject('reject a range that clips the attribution heading',m=>{m.candidatePassages[0].sourceRanges[0].firstOrdinal=31;},'SOURCE_RANGE_CHANGED');
reject('reject an occurrence count that disguises a missing verse',m=>{m.candidatePassages[0].expectedCounts.verseOccurrences=9;},'INTAKE_COUNT');
reject('reject removal of the attribution evidence',m=>{delete m.candidatePassages[0].authorClaim.evidenceOccurrence;},'ATTRIBUTION_CHANGED');
reject('reject whole-page author inheritance in inventory',m=>{m.inventory.wholePageAuthorAssignmentPermitted=true;},'ATTRIBUTION_CHANGED');
reject('reject whole-page frontmatter as canonical author',m=>{m.candidatePassages[0].authorClaim.pageFrontmatterIsCanonicalAttribution=true;},'ATTRIBUTION_CHANGED');
reject('reject replacing observed page author with a convenient attribution',m=>{m.candidatePassages[0].authorClaim.pageFrontmatterAuthor='Bhagat Kabir Ji';},'ATTRIBUTION_CHANGED');
reject('reject author inference from a signature word',m=>{m.inventory.signatureWordAuthorAssignmentPermitted=true;},'ATTRIBUTION_CHANGED');
reject('reject an injected canonical author field',m=>{m.candidatePassages[0].canonicalAuthorId='bhagat-kabir';},'INTAKE_SCHEMA');
reject('reject turning text-entry counts into a composition count',m=>{m.inventory.completeCompositionCount=3057;},'AUTHORITY_PROMOTION');
reject('reject omission of a shared boundary Ang from the inventory',m=>{m.inventory.candidateAngs=m.inventory.candidateAngs.filter(a=>a!==323);},'INVENTORY_CHANGED');
reject('reject dropping a quarantined discrepancy',m=>{m.quarantinedDiscrepancies.pop();},'INTAKE_COUNT');
reject('reject marking a discrepancy resolved without a new review record',m=>{m.quarantinedDiscrepancies[0].status='RESOLVED';},'QUARANTINE_PROMOTION');
reject('reject automatic author promotion of a disputed occurrence',m=>{m.quarantinedDiscrepancies[0].automaticAuthorInclusion=true;},'QUARANTINE_PROMOTION');
reject('reject assigning a canonical author to a quarantined occurrence',m=>{m.quarantinedDiscrepancies[0].canonicalAuthorId='sheikh-farid';},'QUARANTINE_PROMOTION');
reject('reject silently fixing the disputed source Ang1377 to1378',m=>{m.quarantinedDiscrepancies[0].sourceOccurrence.sourceAng=1378;},'SOURCE_LOCATOR_CHANGED');
reject('reject silently fixing the disputed source Ang324 to323',m=>{m.quarantinedDiscrepancies[1].sourceOccurrence.sourceAng=323;},'SOURCE_LOCATOR_CHANGED');
reject('reject replacing a conflicting second-witness locator with the primary one',m=>{m.quarantinedDiscrepancies[0].secondaryWitness.witnessAng=1377;},'SECONDARY_WITNESS_CHANGED');
reject('reject dropping adjacent boundary evidence',m=>{delete m.quarantinedDiscrepancies[1].sourceContext.previousAcrossFiles;},'INTAKE_SCHEMA');
reject('reject imported translation assets',m=>{m.candidatePassages[0].translationAssets.push({id:'unreviewed-english'});},'ASSET_IMPORT');
reject('reject imported audio assets',m=>{m.candidatePassages[0].audioAssets.push({id:'unlicensed-audio'});},'ASSET_IMPORT');
reject('reject an automatic normalization policy',m=>{m.validationGateInputs.sourceTextNormalizationPermitted=true;},'GATE_WEAKENED');
reject('reject weakening the existing-source preservation gate',m=>{m.validationGateInputs.existingRuntimeScripturePackMustRemainUnchanged=false;},'GATE_WEAKENED');
reject('reject claiming full machine collation that was not performed',m=>{m.candidatePassages[0].secondaryWitness.allOccurrenceMachineCollation='PASS';},'AUTHORITY_PROMOTION');

test('reject missing runtime bytes instead of checking only the manifest',()=>{
  assert.throws(()=>validateKabirIntake(manifest),e=>e.code==='RUNTIME_INPUT_REQUIRED');
});
test('reject any change to the current runtime scripture even after updating its pin',()=>{
  const bytes=Buffer.concat([options.runtimeScriptureBytes,Buffer.from('\n')]);
  const lock=`export const SCRIPTURE_SHA256="${sha(bytes)}";\n`;
  assert.throws(()=>validateKabirIntake(manifest,{runtimeScriptureBytes:bytes,runtimeSourceLockText:lock}),e=>e.code==='RUNTIME_SOURCE_CHANGED');
});
test('reject a runtime source-lock change while scripture bytes remain intact',()=>{
  assert.throws(()=>validateKabirIntake(manifest,{...noWitness,runtimeSourceLockText:`export const SCRIPTURE_SHA256="${'0'.repeat(64)}";\n`}),e=>e.code==='RUNTIME_PIN_CHANGED');
});
test('reject an incomplete witness directory rather than treating it as full verification',()=>{
  assert.throws(()=>validateKabirIntake(manifest,{...noWitness,witnessFiles:new Map()}),e=>e.code==='WITNESS_INPUT');
});
test('reject non-original witness bytes',()=>{
  const witnessFiles=new Map(['metadata/authors.json','corpus/ang-0323.md','corpus/ang-0324.md','corpus/ang-1377.md'].map(path=>[path,Buffer.from('not the source')]));
  assert.throws(()=>validateKabirIntake(manifest,{...noWitness,witnessFiles}),e=>e.code==='WITNESS_BYTES_CHANGED');
});

test('verify all four original source files and their parsed selected rows',{skip:!options.witnessFiles},()=>{
  const report=validateKabirIntake(manifest,options);
  assert.equal(report.witnessFilesVerified,4);
  assert.equal(report.runtimeEligible,false);
  assert.equal(report.qualifiedHumanReview,'NOT_PERFORMED');
});
test('detect one-byte mutation of an original witness file',{skip:!options.witnessFiles},()=>{
  const witnessFiles=new Map(options.witnessFiles);
  const bytes=Buffer.from(witnessFiles.get('corpus/ang-0323.md'));
  bytes[bytes.length-2]^=1;
  witnessFiles.set('corpus/ang-0323.md',bytes);
  assert.throws(()=>validateKabirIntake(manifest,{...options,witnessFiles}),e=>e.code==='WITNESS_BYTES_CHANGED');
});
