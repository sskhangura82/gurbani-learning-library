// Research tooling only. No application route, network, storage or publication.
import {createHash} from 'node:crypto';
import {parseStrictJSON} from '../../hukamnama/json.mjs';

export const SCHEMA = 'glp.history.registry.v1';
export const CLASSES = Object.freeze({
  PRIMARY_EVIDENCE: 'Primary evidence',
  EARLY_ACCOUNT: 'Early historical account',
  CORROBORATED_HISTORY: 'Corroborated history',
  TRADITIONAL_SAKHI: 'Traditional Sakhi',
  DISPUTED_ACCOUNT: 'Disputed account',
  UNVERIFIED_ATTRIBUTION: 'Unverified attribution'
});
const SOURCE_KINDS = ['SCRIPTURE', 'DOCUMENT', 'INSCRIPTION', 'EARLY_ACCOUNT', 'TRADITION', 'SCHOLARSHIP'];
const ROLES = ['HISTORY_REVIEWER', 'GURBANI_REVIEWER'];
const ID = /^[a-z][a-z0-9.-]{1,119}$/;
const HASH = /^[a-f0-9]{64}$/;
const need = (ok, code) => { if (!ok) throw new Error(code); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function keys(value, fields, code) {
  need(object(value) && Object.keys(value).length === fields.length &&
    fields.every(field => Object.hasOwn(value, field)), code);
}
function text(value, code, max = 12000) {
  need(typeof value === 'string' && value.trim().length > 0 && value.length <= max &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value), code);
}
function id(value) { need(typeof value === 'string' && ID.test(value), 'INVALID_ID'); }
function list(value, code, max = 5000) { need(Array.isArray(value) && value.length <= max, code); }
function identifiers(value) {
  list(value, 'INVALID_ID_LIST');
  value.forEach(id);
  need(new Set(value).size === value.length, 'DUPLICATE_REFERENCE');
}
function entries(values) {
  list(values, 'INVALID_RECORD_LIST');
  const map = new Map();
  for (const value of values) {
    id(value?.id);
    need(!map.has(value.id), 'DUPLICATE_ID');
    map.set(value.id, value);
  }
  return map;
}
function https(value, code) {
  text(value, code, 2000);
  let url;
  try { url = new URL(value); } catch { throw new Error(code); }
  need(url.protocol === 'https:' && !url.username && !url.password, code);
}
function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (object(value)) return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
function plainCopy(value) { return JSON.parse(JSON.stringify(value)); }
function freeze(value) {
  if (object(value) || Array.isArray(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function iso(value) {
  need(typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value, 'INVALID_REVIEW_DATE');
}

export function validateRegistry(registry) {
  keys(registry, ['schema', 'status', 'entities', 'sources', 'claims', 'relations', 'chapters'], 'INVALID_REGISTRY');
  need(registry.schema === SCHEMA && registry.status === 'RESEARCH_ONLY', 'INVALID_REGISTRY_STATUS');
  const entities = entries(registry.entities), sources = entries(registry.sources),
    claims = entries(registry.claims), relations = entries(registry.relations), chapters = entries(registry.chapters);
  const all = [...entities.keys(), ...sources.keys(), ...claims.keys(), ...relations.keys(), ...chapters.keys()];
  need(new Set(all).size === all.length, 'CROSS_TYPE_DUPLICATE_ID');
  for (const entity of entities.values()) {
    keys(entity, ['id', 'kind', 'label'], 'INVALID_ENTITY_FIELDS');
    need(['PERSON', 'PLACE', 'EVENT'].includes(entity.kind), 'INVALID_ENTITY_KIND');
    text(entity.label, 'INVALID_ENTITY_LABEL', 300);
  }
  for (const source of sources.values()) {
    keys(source, ['id', 'kind', 'title', 'creator', 'edition', 'sourceDate', 'originalLanguage',
      'translation', 'provenance', 'lineageId', 'reuse'], 'INVALID_SOURCE_FIELDS');
    need(SOURCE_KINDS.includes(source.kind), 'INVALID_SOURCE_KIND');
    for (const field of ['title', 'creator', 'edition', 'originalLanguage']) text(source[field], 'INVALID_SOURCE_' + field, 1000);
    keys(source.sourceDate, ['label', 'certainty'], 'INVALID_SOURCE_DATE');
    text(source.sourceDate.label, 'INVALID_SOURCE_DATE_LABEL', 300);
    need(['EXACT', 'APPROXIMATE', 'DISPUTED', 'UNKNOWN'].includes(source.sourceDate.certainty), 'INVALID_SOURCE_DATE_CERTAINTY');
    if (source.translation !== null) {
      keys(source.translation, ['translator', 'edition'], 'INVALID_TRANSLATION_METADATA');
      text(source.translation.translator, 'INVALID_TRANSLATOR', 500);
      text(source.translation.edition, 'INVALID_TRANSLATION_EDITION', 1000);
    }
    keys(source.provenance, ['repository', 'catalogueReference', 'witnessUrl'], 'INVALID_PROVENANCE');
    text(source.provenance.repository, 'INVALID_REPOSITORY', 500);
    text(source.provenance.catalogueReference, 'INVALID_CATALOGUE_REFERENCE', 1000);
    if (source.provenance.witnessUrl !== null) https(source.provenance.witnessUrl, 'INVALID_WITNESS_URL');
    if (source.lineageId !== null) id(source.lineageId);
    need(source.reuse === 'METADATA_ONLY_NO_TEXT_OR_IMAGES', 'SOURCE_REUSE_NOT_ALLOWED');
  }
  for (const claim of claims.values()) {
    keys(claim, ['id', 'statement', 'classification', 'entityIds', 'citations', 'uncertainty',
      'limitations', 'conflicts'], 'INVALID_CLAIM_FIELDS');
    text(claim.statement, 'INVALID_CLAIM_STATEMENT');
    need(Object.hasOwn(CLASSES, claim.classification), 'INVALID_CLAIM_CLASS');
    identifiers(claim.entityIds);
    for (const entityId of claim.entityIds) need(entities.has(entityId), 'UNRESOLVED_CLAIM_ENTITY');
    list(claim.citations, 'INVALID_CITATIONS', 100);
    const citationKeys = new Set();
    for (const citation of claim.citations) {
      keys(citation, ['sourceId', 'locator', 'relationship'], 'INVALID_CITATION_FIELDS');
      need(sources.has(citation.sourceId), 'UNRESOLVED_SOURCE');
      need(['SUPPORTS', 'DISPUTES', 'CONTEXT'].includes(citation.relationship), 'INVALID_CITATION_RELATIONSHIP');
      keys(citation.locator, ['kind', 'reference'], 'INVALID_LOCATOR');
      need(['FOLIO', 'PAGE_RANGE', 'SECTION', 'DOCUMENT', 'INSCRIPTION'].includes(citation.locator.kind), 'INVALID_LOCATOR_KIND');
      text(citation.locator.reference, 'MISSING_PRECISE_LOCATOR', 1000);
      // A work-level URL or source title alone does not supply an exact locator.
      need(!/^https?:\/\//i.test(citation.locator.reference) &&
        citation.locator.reference !== sources.get(citation.sourceId).title, 'MISSING_PRECISE_LOCATOR');
      const key = stable(citation);
      need(!citationKeys.has(key), 'DUPLICATE_CITATION');
      citationKeys.add(key);
    }
    text(claim.uncertainty, 'MISSING_UNCERTAINTY');
    text(claim.limitations, 'MISSING_LIMITATIONS');
    list(claim.conflicts, 'INVALID_CONFLICTS', 100);
    const seen = new Set();
    for (const conflict of claim.conflicts) {
      keys(conflict, ['claimId', 'description'], 'INVALID_CONFLICT_FIELDS');
      need(conflict.claimId !== claim.id && claims.has(conflict.claimId), 'UNRESOLVED_CONFLICT');
      need(!seen.has(conflict.claimId), 'DUPLICATE_CONFLICT');
      seen.add(conflict.claimId);
      text(conflict.description, 'MISSING_CONFLICT_DESCRIPTION');
    }
  }
  for (const claim of claims.values()) for (const conflict of claim.conflicts) {
    need(claims.get(conflict.claimId).conflicts.some(other => other.claimId === claim.id), 'ASYMMETRIC_CONFLICT');
  }
  const relationTypes = {
    PERSON_AT_PLACE: ['PERSON', 'PLACE'],
    PERSON_IN_EVENT: ['PERSON', 'EVENT'],
    EVENT_AT_PLACE: ['EVENT', 'PLACE'],
    RELATED_PERSON: ['PERSON', 'PERSON']
  };
  for (const relation of relations.values()) {
    keys(relation, ['id', 'kind', 'fromEntityId', 'toEntityId', 'claimIds'], 'INVALID_RELATION_FIELDS');
    id(relation.fromEntityId); id(relation.toEntityId);
    const shape = Object.hasOwn(relationTypes, relation.kind) ? relationTypes[relation.kind] : null;
    need(shape && entities.get(relation.fromEntityId)?.kind === shape[0] &&
      entities.get(relation.toEntityId)?.kind === shape[1] && relation.fromEntityId !== relation.toEntityId, 'INVALID_RELATION_ENDPOINTS');
    identifiers(relation.claimIds);
    need(relation.claimIds.length > 0, 'UNSOURCED_RELATION');
    for (const claimId of relation.claimIds) {
      const claim = claims.get(claimId);
      need(claim && claim.entityIds.includes(relation.fromEntityId) &&
        claim.entityIds.includes(relation.toEntityId), 'UNBOUND_RELATION_CLAIM');
    }
  }
  for (const chapter of chapters.values()) {
    keys(chapter, ['id', 'title', 'writer', 'relationIds', 'blocks'], 'INVALID_CHAPTER_FIELDS');
    text(chapter.title, 'INVALID_CHAPTER_TITLE', 300);
    keys(chapter.writer, ['name', 'permissionReference'], 'INVALID_WRITER');
    text(chapter.writer.name, 'MISSING_WRITER_NAME', 300);
    text(chapter.writer.permissionReference, 'MISSING_NARRATIVE_PERMISSION', 1000);
    identifiers(chapter.relationIds);
    for (const relationId of chapter.relationIds) need(relations.has(relationId), 'UNRESOLVED_CHAPTER_RELATION');
    list(chapter.blocks, 'INVALID_CHAPTER_BLOCKS', 200);
    const blockIds = new Set();
    for (const block of chapter.blocks) {
      keys(block, ['id', 'kind', 'text', 'claimIds'], 'INVALID_NARRATIVE_FIELDS');
      id(block.id);
      need(!blockIds.has(block.id), 'DUPLICATE_BLOCK_ID');
      blockIds.add(block.id);
      need(block.kind === 'HISTORICAL_NARRATIVE', 'INVALID_NARRATIVE_KIND');
      text(block.text, 'INVALID_NARRATIVE_TEXT');
      identifiers(block.claimIds);
      need(block.claimIds.length > 0, 'UNSOURCED_NARRATIVE');
      for (const claimId of block.claimIds) need(claims.has(claimId), 'UNRESOLVED_NARRATIVE_CLAIM');
    }
  }
  return {entities, sources, claims, relations, chapters};
}

export function parseRegistry(text) {
  const registry = parseStrictJSON(text);
  validateRegistry(registry);
  return freeze(registry);
}

export function reviewPacket(registry, chapterId) {
  const index = validateRegistry(registry), chapter = index.chapters.get(chapterId);
  need(chapter, 'UNKNOWN_CHAPTER');
  const relationRecords = chapter.relationIds.map(id => index.relations.get(id));
  const claimIds = new Set([...chapter.blocks.flatMap(block => block.claimIds), ...relationRecords.flatMap(relation => relation.claimIds)]);
  // Include every conflicting account transitively, including when not in prose.
  const pending = [...claimIds];
  while (pending.length) {
    for (const conflict of index.claims.get(pending.pop()).conflicts) {
      if (!claimIds.has(conflict.claimId)) { claimIds.add(conflict.claimId); pending.push(conflict.claimId); }
    }
  }
  const claimRecords = [...claimIds].sort().map(id => index.claims.get(id));
  const sourceIds = [...new Set(claimRecords.flatMap(claim => claim.citations.map(citation => citation.sourceId)))].sort();
  const entityIds = [...new Set(claimRecords.flatMap(claim => claim.entityIds))].sort();
  const packet = plainCopy({
    schema: 'glp.history.chapter-review.v1', registrySchema: SCHEMA, chapter,
    entities: entityIds.map(id => index.entities.get(id)), sources: sourceIds.map(id => index.sources.get(id)),
    claims: claimRecords, relations: relationRecords
  });
  return freeze(packet);
}

export function chapterDigest(registry, chapterId) {
  return createHash('sha256').update(stable(reviewPacket(registry, chapterId)), 'utf8').digest('hex');
}

function externalReviews(reviewers, receipts) {
  list(reviewers, 'INVALID_REVIEWER_ROSTER', 100);
  const roster = new Map();
  for (const reviewer of reviewers) {
    keys(reviewer, ['id', 'name', 'roles', 'qualificationReference'], 'INVALID_EXTERNAL_REVIEWER');
    id(reviewer.id);
    need(!roster.has(reviewer.id), 'DUPLICATE_REVIEWER');
    text(reviewer.name, 'MISSING_REVIEWER_NAME', 300);
    list(reviewer.roles, 'INVALID_REVIEWER_ROLES', 2);
    need(new Set(reviewer.roles).size === reviewer.roles.length, 'DUPLICATE_REVIEWER_ROLE');
    need(reviewer.roles.length > 0 && reviewer.roles.every(role => ROLES.includes(role)), 'INVALID_REVIEWER_ROLE');
    text(reviewer.qualificationReference, 'MISSING_QUALIFICATION_REFERENCE', 1000);
    roster.set(reviewer.id, reviewer);
  }
  list(receipts, 'INVALID_REVIEW_RECEIPTS', 100);
  const seen = new Set();
  for (const receipt of receipts) {
    keys(receipt, ['reviewerId', 'role', 'chapterId', 'chapterSha256', 'verdict', 'reviewedAt', 'reference'], 'INVALID_REVIEW_RECEIPT');
    id(receipt.reviewerId); id(receipt.chapterId);
    need(ROLES.includes(receipt.role), 'INVALID_REVIEW_ROLE');
    need(typeof receipt.chapterSha256 === 'string' && HASH.test(receipt.chapterSha256), 'INVALID_REVIEW_BINDING');
    need(['PASS', 'NEEDS_REVISION', 'INCOMPLETE'].includes(receipt.verdict), 'INVALID_REVIEW_VERDICT');
    iso(receipt.reviewedAt);
    text(receipt.reference, 'MISSING_REVIEW_REFERENCE', 1000);
    const key = receipt.reviewerId + ':' + receipt.role + ':' + receipt.chapterId;
    need(!seen.has(key), 'DUPLICATE_REVIEW_RECEIPT');
    seen.add(key);
  }
  return roster;
}

// Legacy optional human-attestation path. This is not a prerequisite for the
// owner-authorized ChatGPT + Claude workflow in draft.mjs / editorial.mjs.
export function prepareChapter(registry, chapterId, {reviewers = [], receipts = []} = {}) {
  const packet = reviewPacket(registry, chapterId), digest = chapterDigest(registry, chapterId);
  const roster = externalReviews(reviewers, receipts), reasons = new Set();
  if (!packet.chapter.blocks.length) reasons.add('EMPTY_CHAPTER');
  const sourceMap = new Map(packet.sources.map(source => [source.id, source]));
  for (const claim of packet.claims) {
    const supports = claim.citations.filter(citation => citation.relationship === 'SUPPORTS');
    if (!supports.length) reasons.add('CLAIM_WITHOUT_SUPPORT');
    if (claim.classification === 'UNVERIFIED_ATTRIBUTION') reasons.add('UNVERIFIED_CLAIM');
    if (claim.classification === 'CORROBORATED_HISTORY') {
      const lineages = new Set(supports.map(citation => sourceMap.get(citation.sourceId).lineageId).filter(Boolean));
      if (lineages.size < 2) reasons.add('INDEPENDENT_LINEAGES_NOT_RECORDED');
    }
    if (claim.classification === 'DISPUTED_ACCOUNT' &&
      !claim.conflicts.length && !claim.citations.some(citation => citation.relationship === 'DISPUTES')) reasons.add('MISSING_COMPETING_ACCOUNT');
  }
  const structuralReady = reasons.size === 0;
  const requiredRoles = ['HISTORY_REVIEWER'];
  if (packet.sources.some(source => source.kind === 'SCRIPTURE')) requiredRoles.push('GURBANI_REVIEWER');
  const admitted = [];
  for (const receipt of receipts.filter(receipt => receipt.chapterId === chapterId)) {
    const reviewer = roster.get(receipt.reviewerId);
    if (!reviewer || !reviewer.roles.includes(receipt.role)) { reasons.add('UNTRUSTED_REVIEWER'); continue; }
    if (receipt.chapterSha256 !== digest) { reasons.add('STALE_REVIEW_BINDING'); continue; }
    if (receipt.verdict !== 'PASS') { reasons.add('EXTERNAL_REVIEW_UNRESOLVED'); continue; }
    admitted.push({...receipt, reviewerName: reviewer.name, qualificationReference: reviewer.qualificationReference});
  }
  for (const role of requiredRoles) if (!admitted.some(receipt => receipt.role === role)) reasons.add('MISSING_' + role);
  const ready = reasons.size === 0;
  return freeze({
    status: ready ? 'REVIEWED_DRAFT_READY' : 'WITHHELD',
    structuralReady,
    humanReview: ready ? 'TRUSTED_EXTERNAL_ATTESTATION_RECORDED' : 'NOT_SUFFICIENT',
    releaseAuthorization: 'NOT_GRANTED_BY_THIS_TOOL',
    chapterSha256: digest,
    reasons: [...reasons].sort(),
    reviews: admitted,
    chapter: ready ? {...plainCopy(packet), classificationLabels: CLASSES} : null
  });
}
