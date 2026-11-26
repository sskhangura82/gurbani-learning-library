#!/usr/bin/env node
// This validator admits an inventory to the research queue only. It never publishes
// scripture or grants human review. Updating these frozen facts needs source review.
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const SOURCE_COMMIT = '34d2a7cab032c8ea24d21ff20f64653bd03766f4';
const SOURCE_REPOSITORY = 'opengranth/open-granth';
const RUNTIME_SHA256 = 'cf5b6e72f1cfaad9180d41f4214081cb3dc795644309696d8aba91f3ede64d7b';
const SELECTED_SHA256 = '24097fef481ae89a43ce1de30db725ba401320783c712360e4a8300ef0f4e66b';
const DIGEST_FORMAT = 'UTF-8 of occurrence text values joined by LF in source order, without final LF; includes heading; no normalization';
const SOURCE_FILES = Object.freeze({
  'metadata/authors.json': ['ad723a5d2cdd29e8d74ec336111e95ab387f5b2e', '30087956844b72d15f7ffd50f27d68e6f19eaa13fd69d5464c7de348c4d88503', 49201],
  'corpus/ang-0323.md': ['8913904f9d203b0f7c82036af9f143fd5c06a8a1', '444f2ff55b16b4f71392cafb1f99ee49fcc76743bd0f981eab8dc24592b7cd69', 10442],
  'corpus/ang-0324.md': ['1d5fb8624c9ddfdfef5a0801081a6cd469dcd540', 'f2e1be82dae745532602c109e2cc581a865e0ab4fe31887ab18310e2f4091bfe', 10808],
  'corpus/ang-1377.md': ['2517993def728500a63090f00e80e4746592fbfb', '47c2e2d5d609bc726f5813bdae03caea25accf843bd32b259fbb1f1a96598262', 10042],
});
const SOURCE_ROWS = Object.freeze({
  '323:28': [12, 1, '752c3656cb317212639d76595cad72bdeb949353a58abdedb7fa7cbd52a8b0d1'],
  '323:29': [12, 2, '9e397b19c98b4d9d9b705ba4bda4eac958efc44634ace0670369811bf04de633'],
  '323:30': [13, 1, 'ead4b50c7b65fe426c1dd00394ed819674cbec95cc0fc779d78e8439f066d2ce'],
  '323:31': [13, 2, '04c23c17c6efd5fb2db4e36c0fff630fdb85a7deb9f284dedf5ee5f94f0542a0'],
  '323:32': [13, 3, '92a0f6e7477a54123307c27bd48ec62e41be624998539f112997aeb77ac9c7f6'],
  '323:33': [14, 1, '926ff5cb92f7b8471472c019418fd15b3cb6055ebde8b210cc035a5241db846e'],
  '323:34': [14, 2, '240b04d6db63d8fa2b29f10bf775735296420b0f0eb28b0d9339a702aeca7485'],
  '323:35': [15, 1, 'd656f234e2c99f3c52ab96fa212e3e74a15a8308bfc0689c257608453b6bd4ed'],
  '323:36': [15, 2, '51bb0dc783c53394ce8e03d6d7b5721620057b9809182defe276e15112b208e6'],
  '323:37': [15, 3, '770c5e17401eb428bf0f9ae0a625c2d2c2c3eee3f10c536f14336435bcf5073c'],
  '323:38': [16, 1, '523c26af226e405f17284cfa43efd2bf4ddfe97045eca9050b807ef5ed7a641e'],
  '323:39': [16, 2, '0e21e3de7df6936db1ebee28694167fc61d6d20e5a7e83e8bc5f7afddfd92d1a'],
  '323:40': [16, 3, '8ed4dc8d09d79fe4b011439ef739f1ee145413fde55c0165228830bf3e92885d'],
  '323:41': [17, 1, 'd2fbf55e923f147cd694b485881560a888f314f83445b2aaff8d99e14fe0c227'],
  '323:49': [19, 3, '0ccb471e6567818854b4e4fc613a42daca69c9d6c34dd8d75cea96134ed36bdf'],
  '324:1': [1, 1, '23ca05b987c54ceac5e7994c2ca050503e0e2c419812a7de7eb4c130f5bf6dfd'],
  '324:2': [1, 2, '0a50a9ab847bea319e87faa0ff2dee2ad72b8fb980b593bbc07f6c75a021794c'],
  '1377:1': [1, 1, '1e4a9e3a774c6e37e1e9f8cec49a71896a4f4380c29494fd2c8f21b2b4bb8d94'],
  '1377:2': [1, 2, 'f9312b97a0b94ce0412cc998d0289563b75d966001558a156d94f616d5ab01b0'],
  '1377:3': [2, 1, '9146f1900d6f91fdb03212d8c8012ab22368d7256981f6594ff4beb0550ef271'],
});
const CANDIDATE_ANGS = [91,92,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,475,476,477,478,479,480,481,482,483,484,524,555,654,655,656,691,692,727,792,793,855,856,857,870,871,872,873,947,948,965,968,969,970,971,972,1102,1103,1104,1105,1106,1123,1124,1157,1158,1159,1160,1162,1163,1193,1194,1195,1196,1251,1252,1253,1349,1350,1364,1365,1366,1367,1368,1369,1370,1371,1372,1373,1374,1375,1376,1377];
const HUMAN_REVIEW_FIELDS = ['gurbaniScholar', 'punjabiReader', 'sourceLocationAdjudication', 'rightsReview'];
const WITNESS_ROW_COUNTS = { 'corpus/ang-0323.md': 49, 'corpus/ang-0324.md': 57, 'corpus/ang-1377.md': 37 };
const pageUrl = ang => `https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=${ang}`;
const sourceUrl = path => `https://github.com/${SOURCE_REPOSITORY}/blob/${SOURCE_COMMIT}/${path}`;
const rawUrl = path => `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${SOURCE_COMMIT}/${path}`;
const sourcePath = ang => `corpus/ang-${String(ang).padStart(4, '0')}.md`;
const hash = value => createHash('sha256').update(value).digest('hex');

export class IntakeValidationError extends Error {
  constructor(code, message) { super(message); this.name = 'IntakeValidationError'; this.code = code; }
}
function check(ok, code, message) { if (!ok) throw new IntakeValidationError(code, message); }
function equal(actual, expected, label, code = 'INTAKE_FACT_CHANGED') {
  check(isDeepStrictEqual(actual, expected), code, `${label} differs from the frozen research intake.`);
}
function keys(object, expected, label) {
  check(object && typeof object === 'object' && !Array.isArray(object), 'INTAKE_SCHEMA', `${label} must be an object.`);
  equal(Object.keys(object).sort(), [...expected].sort(), `${label} fields`, 'INTAKE_SCHEMA');
}
function nonempty(value, label) { check(typeof value === 'string' && value.trim().length > 0, 'INTAKE_SCHEMA', `${label} must contain text.`); }
function list(value, count, label) { check(Array.isArray(value) && value.length === count, 'INTAKE_COUNT', `${label} must contain ${count} entries.`); }

function verifyRuntime(bytes, lockText) {
  check(Buffer.isBuffer(bytes) || bytes instanceof Uint8Array, 'RUNTIME_INPUT_REQUIRED', 'Existing runtime scripture bytes are required.');
  equal(hash(bytes), RUNTIME_SHA256, 'Existing runtime scripture hash', 'RUNTIME_SOURCE_CHANGED');
  check(typeof lockText === 'string', 'RUNTIME_INPUT_REQUIRED', 'Existing runtime source-lock text is required.');
  const declarations = [...lockText.matchAll(/export\s+const\s+SCRIPTURE_SHA256\s*=\s*(["'])([0-9a-f]{64})\1\s*;/g)];
  check(declarations.length === 1, 'RUNTIME_PIN_CHANGED', 'Exactly one runtime scripture pin must be present.');
  equal(declarations[0][2], RUNTIME_SHA256, 'Existing runtime source-lock pin', 'RUNTIME_PIN_CHANGED');
  let runtime;
  try { runtime = JSON.parse(Buffer.from(bytes).toString('utf8')); }
  catch { throw new IntakeValidationError('RUNTIME_JSON', 'Existing runtime scripture is not valid JSON.'); }
  equal(runtime.schema, 'glp.scripture.pilot.v1', 'Existing scripture schema', 'RUNTIME_SOURCE_CHANGED');
  list(runtime.occurrences, 19, 'Existing runtime scripture occurrences');
  list(runtime.passages, 3, 'Existing runtime scripture passages');
}

function verifySourceFileDescriptor(file, path) {
  keys(file, ['path','gitBlob','sha256','bytes','url','rawUrl'], `Source ${path}`);
  const [blob, sha256, bytes] = SOURCE_FILES[path];
  equal(file, {path, gitBlob:blob, sha256, bytes, url:sourceUrl(path), rawUrl:rawUrl(path)}, `Source descriptor ${path}`, 'SOURCE_WITNESS_CHANGED');
}

function verifyOccurrence(row, ang, ordinal, role) {
  const rowKeys = ['sourceAng','sourcePath','sourceGitBlob','sourceOrdinal','sourcePrintedLine','sourceWithinLine','text','textSha256'];
  if (role !== undefined) rowKeys.push('role');
  keys(row, rowKeys, `Source occurrence ${ang}:${ordinal}`);
  const expected = SOURCE_ROWS[`${ang}:${ordinal}`];
  check(Boolean(expected), 'SOURCE_ROW_UNKNOWN', 'Source occurrence is outside this bounded intake.');
  equal([row.sourceAng,row.sourceOrdinal,row.sourcePath,row.sourceGitBlob,row.sourcePrintedLine,row.sourceWithinLine],
    [ang,ordinal,sourcePath(ang),SOURCE_FILES[sourcePath(ang)][0],expected[0],expected[1]],
    `Original source locator ${ang}:${ordinal}`, 'SOURCE_LOCATOR_CHANGED');
  nonempty(row.text, 'Source occurrence text');
  equal(row.textSha256, expected[2], `Frozen source fingerprint ${ang}:${ordinal}`, 'SOURCE_TEXT_CHANGED');
  equal(hash(Buffer.from(row.text, 'utf8')), expected[2], `Source text ${ang}:${ordinal}`, 'SOURCE_TEXT_CHANGED');
  if (role !== undefined) equal(row.role, role, `Occurrence role ${ang}:${ordinal}`, 'SOURCE_ROLE_CHANGED');
}

function verifyObserved(row, ang, expectedHash) {
  keys(row, ['witnessAng','text','textSha256','pageContext'], 'Secondary witness context');
  equal(row.witnessAng, ang, 'Secondary witness location', 'SECONDARY_WITNESS_CHANGED');
  equal(row.textSha256, expectedHash, 'Secondary witness fingerprint', 'SECONDARY_WITNESS_CHANGED');
  nonempty(row.text, 'Secondary witness text');
  equal(hash(Buffer.from(row.text, 'utf8')), expectedHash, 'Secondary witness text', 'SECONDARY_WITNESS_CHANGED');
  nonempty(row.pageContext, 'Secondary witness page context');
}

function verifyCandidate(c) {
  keys(c, ['candidateId','proposedCanonicalId','canonicalIdStatus','kindProposal','status','runtimeEligible','publicReady','authorClaim','locationClaim','sourceRanges','expectedCounts','occurrences','selectedTextDigest','boundaryEvidence','structureProposal','secondaryWitness','reviews','translationAssets','audioAssets'], 'Candidate');
  equal(c.candidateId, 'kabir-gauri-guareri-chaupade14-001', 'Candidate ID');
  equal(c.proposedCanonicalId, 'sggs.gauri.guareri.kabir.chaupade14.shabad001', 'Proposed identity');
  equal(c.canonicalIdStatus, 'PROPOSED_NOT_ASSIGNED', 'Canonical identity status', 'AUTHORITY_PROMOTION');
  equal(c.kindProposal, 'shabad', 'Proposed kind');
  equal(c.status, 'SOURCE_CANDIDATE_PENDING_REVIEW', 'Candidate review status', 'AUTHORITY_PROMOTION');
  equal([c.runtimeEligible,c.publicReady], [false,false], 'Candidate publication gates', 'RUNTIME_PROMOTION');
  equal(c.authorClaim, {
    label:'Bhagat Kabir Ji', status:'HEADING_OBSERVED_ATTRIBUTION_PENDING_REVIEW',
    evidenceOccurrence:{sourceAng:323,sourceOrdinal:30,textSha256:SOURCE_ROWS['323:30'][2]},
    pageFrontmatterAuthor:'Guru Arjan', pageFrontmatterIsCanonicalAttribution:false,
  }, 'Candidate attribution and heading evidence', 'ATTRIBUTION_CHANGED');
  equal(c.locationClaim, {sourceAngs:[323],canonicalAngs:null,status:'DIGITAL_LOCATOR_OBSERVED_PENDING_REVIEW'}, 'Unadjudicated location claim', 'AUTHORITY_PROMOTION');
  equal(c.sourceRanges, [{sourcePath:sourcePath(323),sourceGitBlob:SOURCE_FILES[sourcePath(323)][0],sourceFileSha256:SOURCE_FILES[sourcePath(323)][1],sourceAng:323,firstOrdinal:30,lastOrdinal:40,expectedOccurrenceCount:11}], 'Candidate source range', 'SOURCE_RANGE_CHANGED');
  equal(c.expectedCounts, {allOccurrences:11,headings:1,verseOccurrences:10}, 'Candidate counts', 'INTAKE_COUNT');
  list(c.occurrences, 11, 'Candidate occurrences');
  c.occurrences.forEach((row, i) => verifyOccurrence(row, 323, 30 + i, i === 0 ? 'heading' : 'verse'));
  equal(c.selectedTextDigest, {algorithm:'sha256',serialization:DIGEST_FORMAT,value:SELECTED_SHA256}, 'Selected-text digest definition', 'SOURCE_TEXT_CHANGED');
  equal(hash(Buffer.from(c.occurrences.map(row => row.text).join('\n'), 'utf8')), SELECTED_SHA256, 'Ordered selected text', 'SOURCE_TEXT_CHANGED');
  const b = c.boundaryEvidence;
  keys(b, ['precedingSourceOccurrence','firstSourceOccurrence','lastSourceOccurrence','nextSourceOccurrence','expectedTerminalMarker','broaderSectionContext','sharedContextDuplicationPolicy'], 'Boundary evidence');
  verifyOccurrence(b.precedingSourceOccurrence,323,29);
  verifyOccurrence(b.firstSourceOccurrence,323,30,'heading');
  verifyOccurrence(b.lastSourceOccurrence,323,40,'verse');
  verifyOccurrence(b.nextSourceOccurrence,323,41);
  equal(b.expectedTerminalMarker, '॥੪॥੧॥', 'Closing marker', 'SOURCE_BOUNDARY_CHANGED');
  check(c.occurrences.at(-1).text.endsWith(b.expectedTerminalMarker), 'SOURCE_BOUNDARY_CHANGED', 'Candidate closing marker is missing.');
  list(b.broaderSectionContext,2,'Broader section context');
  verifyOccurrence(b.broaderSectionContext[0],323,28);
  verifyOccurrence(b.broaderSectionContext[1],323,29);
  equal(b.sharedContextDuplicationPolicy,'PENDING_REVIEW','Shared heading policy','AUTHORITY_PROMOTION');
  equal(c.structureProposal,{status:'DERIVED_FROM_VISIBLE_MARKERS_PENDING_REVIEW',rahauSourceOrdinals:[31,32],numberedStanzaSourceOrdinals:[[33,34],[35,36],[37,38],[39,40]],sequenceNumberWithinHeadingGroup:1,headingGroupVisibleCount:14},'Structure proposal','SOURCE_BOUNDARY_CHANGED');
  const w=c.secondaryWitness;
  keys(w,['provider','urls','retrievalDate','observationMethod','allOccurrenceMachineCollation','boundaryContext'],'Candidate second witness');
  equal(w.provider,'SriGranth','Second witness provider');
  equal(w.urls,[pageUrl(323)],'Second witness URLs');
  equal(w.retrievalDate,'2026-11-26','Second witness observation date');
  equal(w.observationMethod,'Web text inspected; text and boundary context observed. Not a print collation and not an independent scholar review.','Second witness observation limit','AUTHORITY_PROMOTION');
  equal(w.allOccurrenceMachineCollation,'NOT_PERFORMED','Second witness collation status','AUTHORITY_PROMOTION');
  list(w.boundaryContext,4,'Second witness boundaries');
  [30,31,40,41].forEach((n,i)=>verifyObserved(w.boundaryContext[i],323,SOURCE_ROWS[`323:${n}`][2]));
  keys(c.reviews,HUMAN_REVIEW_FIELDS,'Human reviews');
  for(const field of HUMAN_REVIEW_FIELDS) equal(c.reviews[field],null,`Pending ${field} review`,'AUTHORITY_PROMOTION');
  equal(c.translationAssets,[],'Unimported translation assets','ASSET_IMPORT');
  equal(c.audioAssets,[],'Unimported audio assets','ASSET_IMPORT');
}

function verifyQuarantine(issues) {
  list(issues,2,'Quarantined discrepancies');
  const cases=[
    {id:'og-location-1377-row002',type:'SOURCE_LOCATION_AND_SEQUENCE_CONFLICT',ang:1377,ordinal:2,context:[['previous',1377,1],['next',1377,3]],witnessAng:1378,observed:[[1378,SOURCE_ROWS['1377:2'][2]],[1378,'89fccadbea295400e80ba21e4ede491e3ad5ffd63c9a1fab041a99b4ab0758f6']]},
    {id:'og-location-0324-row001',type:'CROSS_ANG_LOCATION_CONFLICT',ang:324,ordinal:1,context:[['previousAcrossFiles',323,49],['next',324,2]],witnessAng:323,observed:[[323,SOURCE_ROWS['323:49'][2]],[323,SOURCE_ROWS['324:1'][2]],[324,SOURCE_ROWS['324:2'][2]]]},
  ];
  issues.forEach((issue,i)=>{
    const expected=cases[i];
    keys(issue,['id','status','type','runtimeEligible','automaticAuthorInclusion','sourceOccurrence','sourceContext','primaryWitnessUrl','secondaryWitness','canonicalAng','canonicalAuthorId','resolution','requiredAction'],'Quarantined issue');
    equal(issue.id,expected.id,'Required discrepancy identity','QUARANTINE_CHANGED');
    equal(issue.type,expected.type,'Discrepancy type','QUARANTINE_CHANGED');
    equal(issue.status,'OPEN_QUARANTINED','Discrepancy status','QUARANTINE_PROMOTION');
    equal([issue.runtimeEligible,issue.automaticAuthorInclusion],[false,false],'Quarantine inclusion gates','QUARANTINE_PROMOTION');
    equal([issue.canonicalAng,issue.canonicalAuthorId,issue.resolution],[null,null,null],'Unresolved adjudication','QUARANTINE_PROMOTION');
    nonempty(issue.requiredAction,'Required source review action');
    verifyOccurrence(issue.sourceOccurrence,expected.ang,expected.ordinal);
    keys(issue.sourceContext,expected.context.map(x=>x[0]),'Discrepancy source context');
    expected.context.forEach(([key,ang,ordinal])=>verifyOccurrence(issue.sourceContext[key],ang,ordinal));
    equal(issue.primaryWitnessUrl,sourceUrl(sourcePath(expected.ang)),'Discrepancy original witness');
    const w=issue.secondaryWitness;
    keys(w,['provider',i===0?'url':'urls','witnessAng','observationMethod','context'],'Discrepancy secondary witness');
    equal(w.provider,'SriGranth','Discrepancy second witness provider');
    equal(i===0?w.url:w.urls,i===0?pageUrl(1378):[pageUrl(323),pageUrl(324)],'Discrepancy second witness URLs');
    equal(w.witnessAng,expected.witnessAng,'Conflicting witness location','SECONDARY_WITNESS_CHANGED');
    equal(w.observationMethod,'Web text observed, not source-saroop adjudication','Discrepancy witness limits','AUTHORITY_PROMOTION');
    list(w.context,expected.observed.length,'Discrepancy second-witness context');
    expected.observed.forEach(([ang,digest],j)=>verifyObserved(w.context[j],ang,digest));
  });
}

function verifyWitnessBytes(witnessFiles) {
  check(witnessFiles instanceof Map,'WITNESS_INPUT','Witness input must be a Map of original paths to bytes.');
  equal([...witnessFiles.keys()].sort(),Object.keys(SOURCE_FILES).sort(),'Witness file set','WITNESS_INPUT');
  for(const [path,[expectedBlob,expectedSha,expectedBytes]] of Object.entries(SOURCE_FILES)) {
    const raw=witnessFiles.get(path);
    check(Buffer.isBuffer(raw)||raw instanceof Uint8Array,'WITNESS_INPUT',`Witness ${path} must be raw bytes.`);
    equal(raw.byteLength,expectedBytes,`Witness ${path} byte length`,'WITNESS_BYTES_CHANGED');
    equal(hash(raw),expectedSha,`Witness ${path} SHA-256`,'WITNESS_BYTES_CHANGED');
    const blob=createHash('sha1').update(`blob ${raw.byteLength}\0`).update(raw).digest('hex');
    equal(blob,expectedBlob,`Witness ${path} Git blob`,'WITNESS_BYTES_CHANGED');
    if(path==='metadata/authors.json') {
      const metadata=JSON.parse(Buffer.from(raw).toString('utf8'));
      const author=metadata.authors.filter(a=>a.name==='Bhagat Kabeer Ji');
      list(author,1,'Exact upstream author record');
      equal([author[0].ang_count,author[0].verse_count,author[0].angs],[96,3057,CANDIDATE_ANGS],'Upstream author inventory','WITNESS_METADATA_CHANGED');
      continue;
    }
    const parsed=[...Buffer.from(raw).toString('utf8').matchAll(/<!-- LINE:(\d+) -->\s*\*\*(.*?)\*\*/gu)];
    equal(parsed.length,WITNESS_ROW_COUNTS[path],`Witness ${path} occurrence count`,'WITNESS_PARSE');
    const within=new Map();
    const ang=Number(path.match(/ang-(\d+)/)[1]);
    parsed.forEach((match,i)=>{
      const line=Number(match[1]);const v=(within.get(line)||0)+1;within.set(line,v);
      const expected=SOURCE_ROWS[`${ang}:${i+1}`];
      if(expected) equal([line,v,hash(Buffer.from(match[2],'utf8'))],expected,`Parsed witness ${ang}:${i+1}`,'WITNESS_PARSE');
    });
  }
}

export function validateKabirIntake(manifest,{runtimeScriptureBytes,runtimeSourceLockText,witnessFiles=null}={}) {
  verifyRuntime(runtimeScriptureBytes,runtimeSourceLockText);
  keys(manifest,['schema','id','status','runtimeEligible','publicReady','scope','preparedDate','source','inventory','candidatePassages','quarantinedDiscrepancies','rights','validationGateInputs','limitations'],'Intake manifest');
  equal(manifest.schema,'glp.content-intake.v1','Intake schema','INTAKE_SCHEMA');
  equal(manifest.id,'glp-kabir-intake-001','Intake identity');
  equal(manifest.status,'PLANNING_INVENTORY','Intake status','AUTHORITY_PROMOTION');
  equal([manifest.runtimeEligible,manifest.publicReady],[false,false],'Intake publication gates','RUNTIME_PROMOTION');
  nonempty(manifest.scope,'Intake scope');
  equal(manifest.preparedDate,'2026-11-26','Intake evidence date');
  const s=manifest.source;
  keys(s,['repository','commit','editionStatus','metadataWitness','textWitnesses','reportedUpstream'],'Source snapshot');
  equal([s.repository,s.commit],[SOURCE_REPOSITORY,SOURCE_COMMIT],'Immutable source snapshot','SOURCE_WITNESS_CHANGED');
  equal(s.editionStatus,'PINNED_DIGITAL_WITNESS_NOT_AUTHENTICATED_SAROOP','Source authority status','AUTHORITY_PROMOTION');
  verifySourceFileDescriptor(s.metadataWitness,'metadata/authors.json');
  list(s.textWitnesses,3,'Text witness files');
  [323,324,1377].forEach((ang,i)=>verifySourceFileDescriptor(s.textWitnesses[i],sourcePath(ang)));
  equal(s.reportedUpstream,{package:'@shabados/database',version:'5.0.0-next.0',sourceId:'SGGS',primaryAsset:'SSA2',provenanceUrl:sourceUrl('docs/provenance.md')},'Reported upstream provenance','SOURCE_WITNESS_CHANGED');
  const inv=manifest.inventory;
  keys(inv,['label','upstreamAuthorName','candidateAngs','candidateAngCount','upstreamTextEntryCount','upstreamCountField','countMeaning','completeCompositionCount','reviewedCompositionCount','canonicalAuthorAssignmentStatus','wholePageAuthorAssignmentPermitted','signatureWordAuthorAssignmentPermitted'],'Author inventory');
  equal(inv.label,'Bhagat Kabir Ji candidate inventory','Inventory label');
  equal(inv.upstreamAuthorName,'Bhagat Kabeer Ji','Upstream author lookup');
  equal(inv.candidateAngs,CANDIDATE_ANGS,'Upstream candidate Ang list','INVENTORY_CHANGED');
  equal([inv.candidateAngCount,inv.upstreamTextEntryCount,inv.upstreamCountField],[96,3057,'verse_count'],'Inventory count units','INVENTORY_CHANGED');
  equal(inv.countMeaning,'Upstream text-entry count; not a count of complete Shabads, padas, or Saloks.','Inventory count meaning','INVENTORY_CHANGED');
  equal([inv.completeCompositionCount,inv.reviewedCompositionCount],[null,0],'Unverified composition counts','AUTHORITY_PROMOTION');
  equal(inv.canonicalAuthorAssignmentStatus,'PENDING_PASSAGE_REVIEW','Author review status','AUTHORITY_PROMOTION');
  equal([inv.wholePageAuthorAssignmentPermitted,inv.signatureWordAuthorAssignmentPermitted],[false,false],'Forbidden author inference','ATTRIBUTION_CHANGED');
  list(manifest.candidatePassages,1,'Bounded candidate passages');
  verifyCandidate(manifest.candidatePassages[0]);
  verifyQuarantine(manifest.quarantinedDiscrepancies);
  const rights=manifest.rights;
  keys(rights,['status','codeLicenseIsContentLicense','translationsIncluded','audioIncluded','noticeUrl','licenseUrl','note'],'Rights record');
  equal(rights.status,'REVIEW_REQUIRED','Rights review status','AUTHORITY_PROMOTION');
  equal([rights.codeLicenseIsContentLicense,rights.translationsIncluded,rights.audioIncluded],[false,false,false],'Rights and media gates','ASSET_IMPORT');
  equal([rights.noticeUrl,rights.licenseUrl],[sourceUrl('NOTICE'),sourceUrl('LICENSE')],'Source rights references');
  nonempty(rights.note,'Rights limitations');
  equal(manifest.validationGateInputs,{immutableSourceCommitRequired:true,sourceFileGitBlobAndSha256Required:true,perOccurrenceTextSha256Required:true,exactRangesAndCountsRequired:true,orderedSelectedTextDigestRequired:true,sourceTextNormalizationPermitted:false,pageAuthorInheritancePermitted:false,unresolvedLocationConflictBlocksRuntime:true,requiredHumanReviewsBeforeRuntime:HUMAN_REVIEW_FIELDS,initialRuntimeEligible:false,initialPublicReady:false,existingRuntimeScriptureOccurrenceCount:19,existingRuntimeScripturePackMustRemainUnchanged:true},'Intake validation gates','GATE_WEAKENED');
  list(manifest.limitations,5,'Research limitations');
  manifest.limitations.forEach((text,i)=>nonempty(text,`Research limitation ${i+1}`));
  if(witnessFiles!==null) verifyWitnessBytes(witnessFiles);
  return Object.freeze({schema:'glp.intake-validation.v1',result:'PASS',validationScope:'PLANNING_INVENTORY_ONLY',runtimeEligible:false,publicReady:false,existingRuntimeScriptureSha256:RUNTIME_SHA256,existingRuntimeOccurrences:19,candidatePassages:1,candidateOccurrences:11,candidateAngs:96,quarantinedDiscrepancies:2,witnessFilesVerified:witnessFiles===null?0:4,qualifiedHumanReview:'NOT_PERFORMED'});
}

export async function loadIntakeInputs({repoRoot=resolve(dirname(fileURLToPath(import.meta.url)),'..'),manifestPath,witnessDir}={}) {
  const [manifestText,runtimeScriptureBytes,runtimeSourceLockText]=await Promise.all([
    readFile(manifestPath||resolve(repoRoot,'content-intake/kabir/manifest.json'),'utf8'),
    readFile(resolve(repoRoot,'knowledge/scripture.json')),
    readFile(resolve(repoRoot,'knowledge/source-lock.mjs'),'utf8'),
  ]);
  let witnessFiles=null;
  if(witnessDir) witnessFiles=new Map(await Promise.all(Object.keys(SOURCE_FILES).map(async path=>[path,await readFile(resolve(witnessDir,basename(path)))])));
  return {manifest:JSON.parse(manifestText),options:{runtimeScriptureBytes,runtimeSourceLockText,witnessFiles}};
}

async function main(args) {
  const opts={};
  for(let i=0;i<args.length;i++) {
    check(['--root','--manifest','--witness-dir','--report'].includes(args[i])&&args[i+1]&&!args[i+1].startsWith('--'),'CLI_ARGUMENT','Usage: node tools/validate-kabir-intake.mjs [--root repo] [--manifest file] [--witness-dir directory] [--report file]');
    check(!Object.hasOwn(opts,args[i]),'CLI_ARGUMENT',`Duplicate argument ${args[i]}.`);
    opts[args[i]]=args[++i];
  }
  const {manifest,options}=await loadIntakeInputs({repoRoot:opts['--root'],manifestPath:opts['--manifest'],witnessDir:opts['--witness-dir']});
  const report=validateKabirIntake(manifest,options);
  if(opts['--report']) await writeFile(opts['--report'],JSON.stringify(report,null,2)+'\n');
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error=>{process.stderr.write(`${error.code||error.name}: ${error.message}\n`);process.exitCode=1;});
}
