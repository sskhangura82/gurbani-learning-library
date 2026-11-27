import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {SCHEMA, validateRegistry, parseRegistry, reviewPacket, chapterDigest, prepareChapter} from '../tools/history/registry.mjs';
import {syntheticRegistry, syntheticReview} from './fixtures/history/synthetic.mjs';

const CHAPTER = 'chapter.synthetic-one';
const copy = value => JSON.parse(JSON.stringify(value));
const prepare = (registry, options = {}) => prepareChapter(registry, CHAPTER, options);
function withheld(registry, reason, options = {}) {
  const output = prepare(registry, options);
  assert.equal(output.status, 'WITHHELD'); assert.equal(output.chapter, null);
  assert.equal(output.releaseAuthorization, 'NOT_GRANTED_BY_THIS_TOOL');
  assert(output.reasons.includes(reason), JSON.stringify(output.reasons));
  return output;
}
function secondSource(registry, lineage = 'lineage.synthetic-two') {
  const source = copy(registry.sources[0]);
  source.id = 'source.synthetic-two'; source.title = 'Second synthetic document'; source.lineageId = lineage;
  registry.sources.push(source);
  registry.claims[0].citations.push({sourceId: source.id, locator: {kind: 'SECTION', reference: 'Synthetic section 2'}, relationship: 'SUPPORTS'});
}
function conflictingAccount(registry) {
  secondSource(registry);
  const second = copy(registry.claims[0]);
  second.id = 'claim.synthetic-two'; second.statement = 'Synthetic person was elsewhere.';
  second.classification = 'DISPUTED_ACCOUNT';
  second.citations = [second.citations[1]];
  second.conflicts = [{claimId: 'claim.synthetic-one', description: 'Synthetic competing location account.'}];
  registry.claims[0].classification = 'DISPUTED_ACCOUNT';
  registry.claims[0].conflicts = [{claimId: second.id, description: 'Synthetic competing location account.'}];
  registry.claims.push(second);
}

test('real registry is empty research metadata with no approval or historical content', () => {
  const registry = parseRegistry(readFileSync(new URL('../content-intake/history/registry.json', import.meta.url), 'utf8'));
  assert.equal(registry.schema, SCHEMA);
  for (const field of ['entities', 'sources', 'claims', 'relations', 'chapters']) assert.deepEqual(registry[field], []);
  assert.throws(() => prepareChapter(registry, CHAPTER), /UNKNOWN_CHAPTER/);
});

test('nonempty synthetic chapter is withheld without external human review', () => {
  const result = withheld(syntheticRegistry(), 'MISSING_HISTORY_REVIEWER');
  assert.equal(result.structuralReady, true);
  assert.equal(result.humanReview, 'NOT_SUFFICIENT');
});

test('external content-bound synthetic review enables a draft object, never publication', () => {
  const registry = syntheticRegistry(), result = prepare(registry, syntheticReview(registry));
  assert.equal(result.status, 'REVIEWED_DRAFT_READY');
  assert.equal(result.structuralReady, true);
  assert.equal(result.releaseAuthorization, 'NOT_GRANTED_BY_THIS_TOOL');
  assert.equal(result.reviews[0].reviewerName, 'Synthetic reviewer');
  assert.equal(result.chapter.claims[0].limitations, registry.claims[0].limitations);
  assert.equal(result.chapter.classificationLabels.TRADITIONAL_SAKHI, 'Traditional Sakhi');
  assert(Object.isFrozen(result.chapter.claims[0]));
});

test('content pack cannot supply its own trusted roster or approval boolean', () => {
  for (const field of ['reviewers', 'receipts', 'approved', 'scholarApproved']) {
    const registry = syntheticRegistry(); registry[field] = true;
    assert.throws(() => validateRegistry(registry), /INVALID_REGISTRY/);
  }
});

test('unknown fields cannot carry copied excerpts, translations or images', () => {
  for (const field of ['excerpt', 'translationText', 'image', 'html', 'audioUrl']) {
    const registry = syntheticRegistry(); registry.sources[0][field] = 'Synthetic unauthorized material';
    assert.throws(() => validateRegistry(registry), /INVALID_SOURCE_FIELDS/);
  }
  const registry = syntheticRegistry(); registry.sources[0].reuse = 'PUBLIC_DOMAIN';
  assert.throws(() => validateRegistry(registry), /SOURCE_REUSE_NOT_ALLOWED/);
});

test('strict parser refuses duplicate keys and does not silently discard a source claim', () => {
  assert.throws(() => parseRegistry('{"schema":"hidden","schema":"' + SCHEMA + '"}'), /Duplicate JSON object key/);
  const registry = syntheticRegistry();
  const text = JSON.stringify(registry).replace('"statement":', '"statement":"Synthetic hidden alteration","statement":');
  assert.throws(() => parseRegistry(text), /Duplicate JSON object key/);
});

test('duplicate identities and cross-type identity reuse are refused', () => {
  const registry = syntheticRegistry(); registry.sources.push(copy(registry.sources[0]));
  assert.throws(() => validateRegistry(registry), /DUPLICATE_ID/);
  const other = syntheticRegistry(); other.sources[0].id = other.entities[0].id;
  assert.throws(() => validateRegistry(other), /CROSS_TYPE_DUPLICATE_ID/);
});

test('narrative paragraph cannot silently omit its historical claims', () => {
  const registry = syntheticRegistry(); registry.chapters[0].blocks[0].claimIds = [];
  assert.throws(() => validateRegistry(registry), /UNSOURCED_NARRATIVE/);
});

test('unknown source, entity, relation and claim IDs are refused', () => {
  for (const [mutate, expected] of [
    [r => {r.claims[0].citations[0].sourceId = 'source.missing';}, /UNRESOLVED_SOURCE/],
    [r => {r.claims[0].entityIds.push('person.missing');}, /UNRESOLVED_CLAIM_ENTITY/],
    [r => {r.chapters[0].relationIds.push('relation.missing');}, /UNRESOLVED_CHAPTER_RELATION/],
    [r => {r.chapters[0].blocks[0].claimIds.push('claim.missing');}, /UNRESOLVED_NARRATIVE_CLAIM/]
  ]) { const registry = syntheticRegistry(); mutate(registry); assert.throws(() => validateRegistry(registry), expected); }
});

test('unrelated or reversed relation endpoints cannot manufacture a historical link', () => {
  const registry = syntheticRegistry(); registry.relations[0].fromEntityId = 'event.synthetic';
  assert.throws(() => validateRegistry(registry), /INVALID_RELATION_ENDPOINTS/);
  const other = syntheticRegistry(); other.claims[0].entityIds = ['person.synthetic'];
  assert.throws(() => validateRegistry(other), /UNBOUND_RELATION_CLAIM/);
  const prototype = syntheticRegistry(); prototype.relations[0].kind = '__proto__';
  assert.throws(() => validateRegistry(prototype), /INVALID_RELATION_ENDPOINTS/);
});

test('URL, title or blank string alone is not an exact citation locator', () => {
  for (const reference of ['', '  ', 'https://example.invalid/work', 'Synthetic document']) {
    const registry = syntheticRegistry(); registry.claims[0].citations[0].locator.reference = reference;
    assert.throws(() => validateRegistry(registry), /MISSING_PRECISE_LOCATOR/);
  }
});

test('source date uncertainty, translation metadata and provenance are required', () => {
  for (const [mutate, expected] of [
    [r => {r.sources[0].sourceDate.certainty = 'AUTHENTIC';}, /INVALID_SOURCE_DATE_CERTAINTY/],
    [r => {r.sources[0].provenance.catalogueReference = '';}, /INVALID_CATALOGUE_REFERENCE/],
    [r => {r.sources[0].translation = {translator: 'Synthetic', edition: ''};}, /INVALID_TRANSLATION_EDITION/],
    [r => {r.sources[0].provenance.witnessUrl = 'javascript:alert(1)';}, /INVALID_WITNESS_URL/]
  ]) { const registry = syntheticRegistry(); mutate(registry); assert.throws(() => validateRegistry(registry), expected); }
});

test('context and disagreement citations do not substitute for supporting evidence', () => {
  for (const relationship of ['CONTEXT', 'DISPUTES']) {
    const registry = syntheticRegistry(); registry.claims[0].citations[0].relationship = relationship;
    withheld(registry, 'CLAIM_WITHOUT_SUPPORT', syntheticReview(registry));
  }
});

test('unverified attribution stays withheld even with a synthetic pass receipt', () => {
  const registry = syntheticRegistry(); registry.claims[0].classification = 'UNVERIFIED_ATTRIBUTION';
  withheld(registry, 'UNVERIFIED_CLAIM', syntheticReview(registry));
});

test('two source records from the same transmission lineage are not corroboration', () => {
  const registry = syntheticRegistry(); secondSource(registry, 'lineage.synthetic-one');
  registry.claims[0].classification = 'CORROBORATED_HISTORY';
  withheld(registry, 'INDEPENDENT_LINEAGES_NOT_RECORDED', syntheticReview(registry));
  registry.sources[1].lineageId = null;
  withheld(registry, 'INDEPENDENT_LINEAGES_NOT_RECORDED', syntheticReview(registry));
  registry.sources[1].lineageId = 'lineage.synthetic-two';
  assert.equal(prepare(registry, syntheticReview(registry)).status, 'REVIEWED_DRAFT_READY');
});

test('traditional account keeps its label and limitations after review', () => {
  const registry = syntheticRegistry(); registry.claims[0].classification = 'TRADITIONAL_SAKHI';
  const result = prepare(registry, syntheticReview(registry));
  assert.equal(result.chapter.claims[0].classification, 'TRADITIONAL_SAKHI');
  assert.equal(result.chapter.claims[0].uncertainty, registry.claims[0].uncertainty);
});

test('disputed claim must retain an actual competing account or citation', () => {
  const registry = syntheticRegistry(); registry.claims[0].classification = 'DISPUTED_ACCOUNT';
  withheld(registry, 'MISSING_COMPETING_ACCOUNT', syntheticReview(registry));
});

test('conflicting account absent from prose is still retained and reviewed', () => {
  const registry = syntheticRegistry(); conflictingAccount(registry);
  const packet = reviewPacket(registry, CHAPTER);
  assert.equal(packet.claims.length, 2); assert.equal(packet.sources.length, 2);
  const reviewed = syntheticReview(registry), oldDigest = chapterDigest(registry, CHAPTER);
  registry.claims[1].statement += ' Synthetic correction.';
  assert.notEqual(chapterDigest(registry, CHAPTER), oldDigest);
  withheld(registry, 'STALE_REVIEW_BINDING', reviewed);
});

test('unresolved, one-sided and self-referential conflict links are refused', () => {
  const registry = syntheticRegistry(); conflictingAccount(registry);
  registry.claims[1].conflicts = [];
  assert.throws(() => validateRegistry(registry), /ASYMMETRIC_CONFLICT/);
  const self = syntheticRegistry(); self.claims[0].conflicts = [{claimId: 'claim.synthetic-one', description: 'Synthetic self-link'}];
  assert.throws(() => validateRegistry(self), /UNRESOLVED_CONFLICT/);
});

test('source metadata, claim, entity, narrative and permission edits invalidate review', () => {
  for (const mutate of [
    r => {r.sources[0].edition += ' changed';},
    r => {r.sources[0].sourceDate.label += ' changed';},
    r => {r.sources[0].provenance.catalogueReference += ' changed';},
    r => {r.claims[0].statement += ' changed';},
    r => {r.claims[0].citations[0].locator.reference += ' changed';},
    r => {r.claims[0].limitations += ' changed';},
    r => {r.entities[0].label += ' changed';},
    r => {r.chapters[0].blocks[0].text += ' changed';},
    r => {r.chapters[0].writer.permissionReference += ' changed';}
  ]) {
    const registry = syntheticRegistry(), review = syntheticReview(registry);
    mutate(registry); withheld(registry, 'STALE_REVIEW_BINDING', review);
  }
});

test('irrelevant record additions and JSON key order do not revoke an unchanged chapter', () => {
  const registry = syntheticRegistry(), review = syntheticReview(registry);
  registry.entities.push({id: 'person.unrelated', kind: 'PERSON', label: 'Unrelated synthetic person'});
  const reversed = JSON.parse(JSON.stringify(registry), (_, value) =>
    value && !Array.isArray(value) && typeof value === 'object' ? Object.fromEntries(Object.entries(value).reverse()) : value);
  assert.equal(prepare(reversed, review).status, 'REVIEWED_DRAFT_READY');
});

test('untrusted reviewer cannot turn a structurally valid packet into approved content', () => {
  const registry = syntheticRegistry(), review = syntheticReview(registry);
  review.reviewers = [];
  withheld(registry, 'UNTRUSTED_REVIEWER', review);
});

test('qualified history role does not substitute for review of a scripture relationship', () => {
  const registry = syntheticRegistry(); registry.sources[0].kind = 'SCRIPTURE';
  withheld(registry, 'MISSING_GURBANI_REVIEWER', syntheticReview(registry));
  const result = prepare(registry, syntheticReview(registry, {roles: ['HISTORY_REVIEWER', 'GURBANI_REVIEWER']}));
  assert.equal(result.reviews.length, 2);
  assert.equal(result.releaseAuthorization, 'NOT_GRANTED_BY_THIS_TOOL');
});

test('incomplete or revision-needed external evidence cannot be outvoted by a pass', () => {
  const registry = syntheticRegistry(), review = syntheticReview(registry);
  const second = copy(review.reviewers[0]); second.id = 'reviewer.other'; review.reviewers.push(second);
  const receipt = copy(review.receipts[0]); receipt.reviewerId = second.id; receipt.verdict = 'NEEDS_REVISION'; review.receipts.push(receipt);
  withheld(registry, 'EXTERNAL_REVIEW_UNRESOLVED', review);
  receipt.verdict = 'INCOMPLETE'; withheld(registry, 'EXTERNAL_REVIEW_UNRESOLVED', review);
});

test('receipt hash arrays, invalid dates, duplicate receipts and anonymous reviewers refuse', () => {
  for (const [mutate, expected] of [
    [r => {r.receipts[0].chapterSha256 = [r.receipts[0].chapterSha256];}, /INVALID_REVIEW_BINDING/],
    [r => {r.receipts[0].reviewedAt = '2026-02-30T00:00:00.000Z';}, /INVALID_REVIEW_DATE/],
    [r => {r.receipts.push(copy(r.receipts[0]));}, /DUPLICATE_REVIEW_RECEIPT/],
    [r => {r.reviewers[0].name = '';}, /MISSING_REVIEWER_NAME/],
    [r => {r.reviewers[0].qualificationReference = '';}, /MISSING_QUALIFICATION_REFERENCE/],
    [r => {r.reviewers[0].roles = true;}, /INVALID_REVIEWER_ROLES/]
  ]) { const registry = syntheticRegistry(), review = syntheticReview(registry); mutate(review); assert.throws(() => prepare(registry, review), expected); }
});

test('empty chapter and missing human narrative permission remain visible blockers', () => {
  const registry = syntheticRegistry(); registry.chapters[0].blocks = [];
  withheld(registry, 'EMPTY_CHAPTER', syntheticReview(registry));
  const other = syntheticRegistry(); other.chapters[0].writer.permissionReference = '';
  assert.throws(() => validateRegistry(other), /MISSING_NARRATIVE_PERMISSION/);
});

test('checked-in command has no side effects and reports zero real content', () => {
  const stdout = execFileSync(process.execPath, ['tools/history/check.mjs'], {cwd: new URL('..', import.meta.url), encoding: 'utf8'});
  const summary = JSON.parse(stdout);
  assert.equal(summary.claims, 0); assert.equal(summary.chapters, 0); assert.equal(summary.publicationAuthorized, false);
});
