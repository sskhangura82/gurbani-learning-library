// Deterministic record validation, not historical truth or provider authentication.
// Producer identities and artifact references are supplied by the caller after
// provenance verification. A provider string alone is never proof of a review.
import {createHash} from 'node:crypto';

export const EDITORIAL_SCHEMA = 'glp.history.semantic-review.v1';
export const EDITORIAL_POLICY = 'OWNER_CHATGPT_CLAUDE_SOURCE_REVIEW_20261127';
const ROLES = Object.freeze({
  CHATGPT_AUTHOR: {provider: 'OpenAI', product: 'ChatGPT'},
  CLAUDE_CHECKER: {provider: 'Anthropic', product: 'Claude'}
});
const HASH = /^[a-f0-9]{64}$/;
const ID = /^[a-z][a-z0-9.-]{1,119}$/;
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const need = (ok, reason) => { if (!ok) throw new Error(reason); };
const fields = (x, names, reason) => need(object(x) && Object.keys(x).length === names.length && names.every(k => Object.hasOwn(x, k)), reason);
const text = (x, reason) => need(typeof x === 'string' && x.trim().length > 0 && x.length <= 12000 && !/[\u0000-\u001f]/u.test(x), reason);
const list = (x, reason, max = 500) => need(Array.isArray(x) && x.length <= max, reason);
const id = x => need(typeof x === 'string' && ID.test(x), 'INVALID_EDITORIAL_ID');
const hash = x => need(typeof x === 'string' && HASH.test(x), 'INVALID_EDITORIAL_HASH');
function date(x) {
  need(typeof x === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x) && Number.isFinite(Date.parse(x)) && new Date(x).toISOString() === x, 'INVALID_EDITORIAL_DATE');
}
export function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (object(value)) return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
export const evidenceDigest = value => createHash('sha256').update(stable(value), 'utf8').digest('hex');
function unique(values, key, reason) {
  const map = new Map();
  for (const value of values) { need(!map.has(value[key]), reason); map.set(value[key], value); }
  return map;
}
function frozen(value) {
  if (object(value) || Array.isArray(value)) { Object.values(value).forEach(frozen); Object.freeze(value); }
  return value;
}
export function editorialPacket(packet, sourceSnapshots = []) {
  list(sourceSnapshots, 'INVALID_SOURCE_SNAPSHOTS');
  const sources = new Map(packet.sources.map(source => [source.id, source]));
  for (const snapshot of sourceSnapshots) {
    fields(snapshot, ['id', 'sourceId', 'metadataSha256', 'snapshotSha256', 'snapshotReference', 'retrievalReference', 'inspectedAt', 'inspectionStatus'], 'INVALID_SOURCE_SNAPSHOT');
    id(snapshot.id); id(snapshot.sourceId); hash(snapshot.metadataSha256); hash(snapshot.snapshotSha256);
    need(sources.has(snapshot.sourceId), 'UNKNOWN_SNAPSHOT_SOURCE');
    text(snapshot.snapshotReference, 'MISSING_SNAPSHOT_REFERENCE'); text(snapshot.retrievalReference, 'MISSING_RETRIEVAL_REFERENCE'); date(snapshot.inspectedAt);
    need(['INSPECTED', 'UNAVAILABLE'].includes(snapshot.inspectionStatus), 'INVALID_INSPECTION_STATUS');
  }
  unique(sourceSnapshots, 'id', 'DUPLICATE_SNAPSHOT_ID');
  unique(sourceSnapshots, 'sourceId', 'DUPLICATE_SOURCE_SNAPSHOT');
  return frozen(JSON.parse(JSON.stringify({schema: 'glp.history.editorial-packet.v1', policy: EDITORIAL_POLICY,
    packet, sourceSnapshots: [...sourceSnapshots].sort((a, b) => a.sourceId.localeCompare(b.sourceId))})));
}
export const editorialDigest = (packet, snapshots) => evidenceDigest(editorialPacket(packet, snapshots));

function rosterIndex(reviewers) {
  list(reviewers, 'INVALID_EDITORIAL_REVIEWERS', 2);
  for (const reviewer of reviewers) {
    fields(reviewer, ['id', 'provider', 'product', 'role', 'identityReference'], 'INVALID_EDITORIAL_REVIEWER');
    id(reviewer.id); text(reviewer.identityReference, 'MISSING_PRODUCER_IDENTITY');
    need(Object.hasOwn(ROLES, reviewer.role), 'INVALID_EDITORIAL_ROLE');
    const expected = ROLES[reviewer.role];
    need(reviewer.provider === expected.provider && reviewer.product === expected.product, 'PROVIDER_ROLE_MISMATCH');
  }
  const map = unique(reviewers, 'id', 'SAME_REVIEWER_IDENTITY');
  unique(reviewers, 'role', 'DUPLICATE_EDITORIAL_ROLE');
  unique(reviewers, 'provider', 'SAME_REVIEWER_PROVIDER');
  unique(reviewers, 'identityReference', 'SAME_PRODUCER_REFERENCE');
  return map;
}
function reviewShape(record) {
  fields(record, ['schema', 'id', 'draftId', 'reviewerId', 'provider', 'product', 'role', 'kind', 'packetSha256', 'reviewedAt', 'recordReference', 'producerReference', 'claimAssessments', 'paragraphAssessments'], 'INVALID_SEMANTIC_REVIEW');
  need(record.schema === EDITORIAL_SCHEMA, 'INVALID_SEMANTIC_REVIEW_SCHEMA');
  ['id', 'draftId', 'reviewerId'].forEach(k => id(record[k])); hash(record.packetSha256); date(record.reviewedAt);
  need(Object.hasOwn(ROLES, record.role), 'INVALID_EDITORIAL_ROLE');
  need(record.kind === 'SEMANTIC_SOURCE_INSPECTION', 'CODE_REVIEW_IS_NOT_SOURCE_REVIEW');
  text(record.recordReference, 'MISSING_REVIEW_RECORD_REFERENCE'); text(record.producerReference, 'MISSING_PRODUCER_REFERENCE');
  list(record.claimAssessments, 'INVALID_CLAIM_ASSESSMENTS'); list(record.paragraphAssessments, 'INVALID_PARAGRAPH_ASSESSMENTS');
  unique(record.claimAssessments, 'claimId', 'DUPLICATE_CLAIM_ASSESSMENT');
  unique(record.paragraphAssessments, 'blockId', 'DUPLICATE_PARAGRAPH_ASSESSMENT');
  for (const check of record.claimAssessments) {
    fields(check, ['claimId', 'claimSha256', 'verdict', 'sourceChecks', 'note'], 'INVALID_CLAIM_ASSESSMENT');
    id(check.claimId); hash(check.claimSha256); text(check.note, 'MISSING_CLAIM_ASSESSMENT_NOTE');
    need(['SUPPORTED', 'QUALIFIED', 'DISPUTED', 'UNSUPPORTED', 'INCOMPLETE'].includes(check.verdict), 'INVALID_CLAIM_ASSESSMENT_VERDICT');
    list(check.sourceChecks, 'INVALID_SOURCE_CHECKS', 100); unique(check.sourceChecks, 'citationSha256', 'DUPLICATE_CITATION_CHECK');
    for (const source of check.sourceChecks) {
      fields(source, ['sourceId', 'citationSha256', 'snapshotId', 'snapshotSha256', 'support', 'note'], 'INVALID_SOURCE_CHECK');
      id(source.sourceId); id(source.snapshotId); hash(source.citationSha256); hash(source.snapshotSha256); text(source.note, 'MISSING_SOURCE_SUPPORT_NOTE');
      need(['SUPPORTS', 'CONTEXT', 'DISPUTES', 'UNSUPPORTED', 'INCOMPLETE'].includes(source.support), 'INVALID_SOURCE_SUPPORT');
    }
  }
  for (const check of record.paragraphAssessments) {
    fields(check, ['blockId', 'blockSha256', 'claimIds', 'verdict', 'note'], 'INVALID_PARAGRAPH_ASSESSMENT');
    id(check.blockId); hash(check.blockSha256); text(check.note, 'MISSING_PARAGRAPH_ASSESSMENT_NOTE'); list(check.claimIds, 'INVALID_PARAGRAPH_CLAIMS'); check.claimIds.forEach(id);
    need(new Set(check.claimIds).size === check.claimIds.length, 'DUPLICATE_PARAGRAPH_CLAIM');
    need(['SUPPORTED', 'QUALIFIED', 'EDITORIAL_ONLY', 'UNSUPPORTED', 'INCOMPLETE'].includes(check.verdict), 'INVALID_PARAGRAPH_VERDICT');
  }
}

export function assessEditorialRecords(packet, {reviewers = [], records = [], sourceSnapshots = [], recordReferences = []} = {}) {
  const bound = editorialPacket(packet, sourceSnapshots), packetSha256 = evidenceDigest(bound), reasons = new Set();
  const roster = rosterIndex(reviewers);
  list(records, 'INVALID_SEMANTIC_REVIEWS', 2); records.forEach(reviewShape); unique(records, 'id', 'DUPLICATE_SEMANTIC_REVIEW'); unique(records, 'role', 'DUPLICATE_REVIEW_ROLE');
  list(recordReferences, 'INVALID_REVIEW_ARTIFACT_REFERENCES', 2);
  for (const ref of recordReferences) {
    fields(ref, ['id', 'sha256', 'reference', 'producerReference', 'reviewerId', 'provider'], 'INVALID_REVIEW_ARTIFACT_REFERENCE');
    id(ref.id); id(ref.reviewerId); hash(ref.sha256); ['reference', 'producerReference', 'provider'].forEach(k => text(ref[k], 'MISSING_ARTIFACT_PROVENANCE'));
  }
  const artifacts = unique(recordReferences, 'id', 'DUPLICATE_ARTIFACT_REFERENCE');
  const snapshots = new Map(sourceSnapshots.map(s => [s.sourceId, s]));
  for (const source of packet.sources) {
    const snapshot = snapshots.get(source.id);
    if (!snapshot) reasons.add('MISSING_SOURCE_SNAPSHOT');
    else if (snapshot.metadataSha256 !== evidenceDigest(source)) reasons.add('STALE_SOURCE_METADATA');
    else if (snapshot.inspectionStatus !== 'INSPECTED') reasons.add('SOURCE_INSPECTION_INCOMPLETE');
  }
  const accepted = [], recordsSummary = [];
  for (const record of records) {
    const errors = new Set(), reviewer = roster.get(record.reviewerId), artifact = artifacts.get(record.id);
    if (!reviewer || ['provider', 'product', 'role'].some(k => reviewer[k] !== record[k]) || reviewer.identityReference !== record.producerReference) errors.add('UNTRUSTED_REVIEW_PRODUCER');
    if (!artifact || artifact.sha256 !== evidenceDigest(record) || artifact.reference !== record.recordReference || artifact.producerReference !== record.producerReference || artifact.reviewerId !== record.reviewerId || artifact.provider !== record.provider) errors.add('REVIEW_ARTIFACT_NOT_VERIFIED');
    if (record.draftId !== packet.draft.id || record.packetSha256 !== packetSha256) errors.add('STALE_EDITORIAL_PACKET');
    if (sourceSnapshots.some(s => Date.parse(record.reviewedAt) < Date.parse(s.inspectedAt))) errors.add('REVIEW_PREDATES_SOURCE_INSPECTION');
    const claims = new Map(record.claimAssessments.map(c => [c.claimId, c]));
    if (claims.size !== packet.claims.length) errors.add('CLAIM_COVERAGE_INCOMPLETE');
    for (const claim of packet.claims) {
      const assessment = claims.get(claim.id);
      if (!assessment) { errors.add('CLAIM_COVERAGE_INCOMPLETE'); continue; }
      if (assessment.claimSha256 !== evidenceDigest(claim)) errors.add('STALE_CLAIM_REVIEW');
      if (!['SUPPORTED', 'QUALIFIED'].includes(assessment.verdict)) errors.add('CLAIM_REVIEW_UNRESOLVED');
      const citations = new Map(assessment.sourceChecks.map(check => [check.citationSha256, check]));
      if (citations.size !== claim.citations.length || !claim.citations.some(c => c.relationship === 'SUPPORTS')) errors.add('SOURCE_SUPPORT_INCOMPLETE');
      for (const citation of claim.citations) {
        const check = citations.get(evidenceDigest(citation)), snapshot = snapshots.get(citation.sourceId);
        if (!check || check.sourceId !== citation.sourceId || check.support !== citation.relationship) errors.add('SOURCE_SUPPORT_INCOMPLETE');
        if (!check || !snapshot || check.snapshotId !== snapshot.id || check.snapshotSha256 !== snapshot.snapshotSha256) errors.add('STALE_SOURCE_REVIEW');
      }
    }
    const paragraphs = packet.draft.sections.flatMap(section => section.blocks), checks = new Map(record.paragraphAssessments.map(check => [check.blockId, check]));
    if (checks.size !== paragraphs.length) errors.add('PARAGRAPH_COVERAGE_INCOMPLETE');
    for (const block of paragraphs) {
      const check = checks.get(block.id);
      if (!check) { errors.add('PARAGRAPH_COVERAGE_INCOMPLETE'); continue; }
      if (check.blockSha256 !== evidenceDigest(block) || stable(check.claimIds) !== stable(block.claimIds)) errors.add('STALE_PARAGRAPH_REVIEW');
      const acceptedVerdicts = block.kind === 'EDITORIAL_QUESTION' ? ['EDITORIAL_ONLY'] : ['SUPPORTED', 'QUALIFIED'];
      if (!acceptedVerdicts.includes(check.verdict)) errors.add('PARAGRAPH_REVIEW_UNRESOLVED');
    }
    recordsSummary.push({id: record.id, provider: record.provider, product: record.product, role: record.role,
      recordReference: record.recordReference, validForCurrentPacket: errors.size === 0, reasons: [...errors].sort()});
    if (!errors.size) accepted.push(record.role);
    errors.forEach(reason => reasons.add(reason));
  }
  for (const role of Object.keys(ROLES)) if (!accepted.includes(role)) reasons.add('MISSING_' + role + '_SOURCE_REVIEW');
  return frozen({policy: EDITORIAL_POLICY, status: reasons.size ? 'WITHHELD' : 'AI_SOURCE_REVIEWED_DRAFT',
    editorialReview: reasons.size ? 'PENDING_OR_INCOMPLETE' : 'TWO_DISTINCT_PROVIDER_RECORDS_VERIFIED',
    humanReview: 'NOT_PERFORMED', releaseAuthorization: 'NOT_GRANTED_BY_THIS_TOOL', packetSha256,
    reasons: [...reasons].sort(), reviews: recordsSummary,
    verificationScope: 'Record structure, exact content bindings and caller-supplied producer/artifact provenance only; not historical truth, provider authentication or proof of source inspection.'});
}
