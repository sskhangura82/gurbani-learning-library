import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {syntheticRegistry} from './fixtures/history/synthetic.mjs';
import {draftReviewPacket, prepareResearchDraft} from '../tools/history/draft.mjs';
import {EDITORIAL_SCHEMA, editorialDigest, evidenceDigest} from '../tools/history/editorial.mjs';

const copy = value => JSON.parse(JSON.stringify(value));
function fixture() {
  const registry = syntheticRegistry(); registry.chapters = [];
  const draft = {schema: 'glp.history.ai-draft.v1', id: 'draft.synthetic-policy', title: 'Synthetic policy test', status: 'AI_ASSISTED_UNREVIEWED_DRAFT',
    authorship: {kind: 'AI_ASSISTED_DRAFT', tool: 'ChatGPT', humanWriter: null}, rights: 'ORIGINAL_PROJECT_DRAFT_NO_SOURCE_REPRODUCTION',
    relationIds: ['relation.synthetic-one'], sections: [
      {depth: 'STORY', title: 'Synthetic story', blocks: [{id: 'block.synthetic-story', kind: 'HISTORICAL_NARRATIVE', text: 'Synthetic person was at synthetic place.', claimIds: ['claim.synthetic-one']}]},
      {depth: 'SOURCE_STUDY', title: 'Synthetic evidence', blocks: [{id: 'block.synthetic-study', kind: 'HISTORICAL_NARRATIVE', text: 'An invented test source records this claim.', claimIds: ['claim.synthetic-one']}]},
      {depth: 'FURTHER_STUDY', title: 'Synthetic question', blocks: [{id: 'block.synthetic-question', kind: 'EDITORIAL_QUESTION', text: 'What would support the claim?', claimIds: []}]}
    ]};
  const packet = draftReviewPacket(registry, draft);
  const sourceSnapshots = packet.sources.map(source => ({id: 'snapshot.synthetic-one', sourceId: source.id, metadataSha256: evidenceDigest(source),
    snapshotSha256: evidenceDigest('Synthetic inspected test bytes, not a real source.'), snapshotReference: 'Synthetic test snapshot, no real inspection.',
    retrievalReference: 'Synthetic retrieval, not a real tool call.', inspectedAt: '2026-11-27T00:00:00.000Z', inspectionStatus: 'INSPECTED'}));
  const reviewers = [
    {id: 'reviewer.synthetic-chatgpt', provider: 'OpenAI', product: 'ChatGPT', role: 'CHATGPT_AUTHOR', identityReference: 'Synthetic ChatGPT producer, fixture only.'},
    {id: 'reviewer.synthetic-claude', provider: 'Anthropic', product: 'Claude', role: 'CLAUDE_CHECKER', identityReference: 'Synthetic Claude producer, fixture only.'}
  ];
  const records = reviewers.map((reviewer, i) => ({schema: EDITORIAL_SCHEMA, id: 'review.synthetic-' + i, draftId: draft.id,
    reviewerId: reviewer.id, provider: reviewer.provider, product: reviewer.product, role: reviewer.role, kind: 'SEMANTIC_SOURCE_INSPECTION',
    packetSha256: editorialDigest(packet, sourceSnapshots), reviewedAt: '2026-11-27T00:01:00.000Z', recordReference: 'Synthetic artifact ' + i,
    producerReference: reviewer.identityReference,
    claimAssessments: packet.claims.map(claim => ({claimId: claim.id, claimSha256: evidenceDigest(claim), verdict: 'SUPPORTED', note: 'Synthetic support assessment, not historical evidence.',
      sourceChecks: claim.citations.map(citation => ({sourceId: citation.sourceId, citationSha256: evidenceDigest(citation), snapshotId: sourceSnapshots[0].id,
        snapshotSha256: sourceSnapshots[0].snapshotSha256, support: citation.relationship, note: 'Synthetic citation assessment.'}))})),
    paragraphAssessments: packet.draft.sections.flatMap(section => section.blocks).map(block => ({blockId: block.id, blockSha256: evidenceDigest(block),
      claimIds: [...block.claimIds], verdict: block.kind === 'EDITORIAL_QUESTION' ? 'EDITORIAL_ONLY' : 'SUPPORTED', note: 'Synthetic paragraph assessment.'}))
  }));
  const evidence = {reviewers, records, sourceSnapshots, recordReferences: []};
  bindArtifacts(evidence);
  return {registry, draft, evidence};
}
function bindArtifacts(evidence) {
  evidence.recordReferences = evidence.records.map(record => ({id: record.id, sha256: evidenceDigest(record), reference: record.recordReference,
    producerReference: record.producerReference, reviewerId: record.reviewerId, provider: record.provider}));
}
const evaluate = f => prepareResearchDraft(f.registry, f.draft, f.evidence);
const withheld = (f, reason) => { const r = evaluate(f); assert.equal(r.status, 'WITHHELD'); assert.equal(r.chapter, null); assert(r.reasons.includes(reason), JSON.stringify(r.reasons)); };

test('owner policy permits an AI-assisted draft with two distinct complete source-review records', () => {
  const r = evaluate(fixture());
  assert.equal(r.status, 'AI_SOURCE_REVIEWED_DRAFT');
  assert.equal(r.humanReview, 'NOT_PERFORMED');
  assert.equal(r.releaseAuthorization, 'NOT_GRANTED_BY_THIS_TOOL');
  assert.match(r.chapter.publicationLabel, /ChatGPT and Claude/);
  assert.match(r.verificationScope, /not historical truth/);
});

test('missing actual Claude review is pending, not replaced by an author or engineering check', () => {
  const f = fixture(); f.evidence.records.pop(); bindArtifacts(f.evidence);
  withheld(f, 'MISSING_CLAUDE_CHECKER_SOURCE_REVIEW');
  const c = fixture(); c.evidence.records[1].kind = 'CODE_REVIEW'; bindArtifacts(c.evidence);
  assert.throws(() => evaluate(c), /CODE_REVIEW_IS_NOT_SOURCE_REVIEW/);
});

test('same reviewer, same producer reference, wrong provider and anonymous identity are rejected', () => {
  for (const [mutate, error] of [
    [e => { e.reviewers[1].id = e.reviewers[0].id; }, /SAME_REVIEWER_IDENTITY/],
    [e => { e.reviewers[1].identityReference = e.reviewers[0].identityReference; }, /SAME_PRODUCER_REFERENCE/],
    [e => { e.reviewers[1].provider = 'OpenAI'; }, /PROVIDER_ROLE_MISMATCH/],
    [e => { e.reviewers[1].identityReference = ''; }, /MISSING_PRODUCER_IDENTITY/]
  ]) { const f = fixture(); mutate(f.evidence); assert.throws(() => evaluate(f), error); }
});

test('invented prose reusing a reviewed claim identifier cannot reuse the prior review', () => {
  const f = fixture(); f.draft.sections[0].blocks[0].text += ' The person then performed an invented encounter.';
  withheld(f, 'STALE_PARAGRAPH_REVIEW'); withheld(f, 'STALE_EDITORIAL_PACKET');
});

test('claim text, precise citation, entity and source metadata changes invalidate review', () => {
  for (const mutate of [
    r => { r.claims[0].statement += ' An invented date.'; },
    r => { r.claims[0].citations[0].locator.reference += ' Changed folio.'; },
    r => { r.entities[0].label += ' Changed identity.'; },
    r => { r.sources[0].edition += ' Changed source edition.'; }
  ]) { const f = fixture(); mutate(f.registry); withheld(f, 'STALE_EDITORIAL_PACKET'); }
});

test('same source URL with changed observed bytes invalidates prior reviews', () => {
  const f = fixture(); f.evidence.sourceSnapshots[0].snapshotSha256 = evidenceDigest('A different synthetic source snapshot.');
  withheld(f, 'STALE_EDITORIAL_PACKET'); withheld(f, 'STALE_SOURCE_REVIEW');
});

test('missing and unsupported claim assessments fail even with a freshly hashed artifact', () => {
  const f = fixture(); f.evidence.records[1].claimAssessments = []; bindArtifacts(f.evidence);
  withheld(f, 'CLAIM_COVERAGE_INCOMPLETE');
  const u = fixture(); u.evidence.records[1].claimAssessments[0].verdict = 'UNSUPPORTED'; bindArtifacts(u.evidence);
  withheld(u, 'CLAIM_REVIEW_UNRESOLVED');
});

test('paragraph review cannot be omitted or approving an old block while the packet hash changes', () => {
  const f = fixture(); f.evidence.records[1].paragraphAssessments.pop(); bindArtifacts(f.evidence);
  withheld(f, 'PARAGRAPH_COVERAGE_INCOMPLETE');
  const g = fixture(); g.draft.sections[0].blocks[0].text += ' Fabricated conversation.';
  g.evidence.records.forEach(r => { r.packetSha256 = editorialDigest(draftReviewPacket(g.registry, g.draft), g.evidence.sourceSnapshots); }); bindArtifacts(g.evidence);
  withheld(g, 'STALE_PARAGRAPH_REVIEW');
});

test('source support cannot be declared without exact citation inspection and snapshot evidence', () => {
  const f = fixture(); f.evidence.records[1].claimAssessments[0].sourceChecks[0].support = 'INCOMPLETE'; bindArtifacts(f.evidence);
  withheld(f, 'SOURCE_SUPPORT_INCOMPLETE');
  const g = fixture(); g.evidence.sourceSnapshots[0].inspectionStatus = 'UNAVAILABLE'; withheld(g, 'SOURCE_INSPECTION_INCOMPLETE');
  const h = fixture(); h.evidence.sourceSnapshots = []; withheld(h, 'MISSING_SOURCE_SNAPSHOT');
});

test('untrusted producer and altered review artifact cannot be admitted', () => {
  const f = fixture(); f.evidence.records[1].producerReference = 'Another synthetic producer.'; bindArtifacts(f.evidence);
  withheld(f, 'UNTRUSTED_REVIEW_PRODUCER');
  const g = fixture(); g.evidence.records[1].claimAssessments[0].note += ' Edited after producer record.';
  withheld(g, 'REVIEW_ARTIFACT_NOT_VERIFIED');
  const h = fixture(); h.evidence.recordReferences = []; withheld(h, 'REVIEW_ARTIFACT_NOT_VERIFIED');
});

test('review cannot predate its source observation', () => {
  const f = fixture(); f.evidence.records[1].reviewedAt = '2026-11-26T00:00:00.000Z'; bindArtifacts(f.evidence);
  withheld(f, 'REVIEW_PREDATES_SOURCE_INSPECTION');
});

test('no obsolete human authorship gate is imposed on the real Kartarpur packet', () => {
  const registry = JSON.parse(readFileSync(new URL('../content-intake/history/registry.json', import.meta.url)));
  const draft = JSON.parse(readFileSync(new URL('../content-intake/history/kartarpur-draft.json', import.meta.url)));
  const r = prepareResearchDraft(registry, draft);
  assert.equal(r.status, 'WITHHELD');
  assert(r.reasons.includes('MISSING_CLAUDE_CHECKER_SOURCE_REVIEW'));
  assert(!r.reasons.some(reason => /HUMAN|QUALIFIED/.test(reason)));
  assert.equal(r.packet.claims.length, 10);
});

test('checked-in author source record covers ten qualified claims and awaits only actual Claude inspection', async () => {
  const {execFileSync} = await import('node:child_process');
  const result = JSON.parse(execFileSync(process.execPath, [new URL('../tools/history/editorial-check.mjs', import.meta.url).pathname], {encoding: 'utf8'}));
  assert.equal(result.status, 'WITHHELD');
  assert.deepEqual(result.inspection, {qualifiedClaims: 10, incompleteClaims: 0, actualClaudeSourceReviews: 0});
  assert.deepEqual(result.reasons, ['MISSING_CLAUDE_CHECKER_SOURCE_REVIEW']);
  assert(!result.reasons.includes('REVIEW_ARTIFACT_NOT_VERIFIED'));
  assert.equal(result.humanReview, 'NOT_PERFORMED');
  assert.equal(result.claudeAttempt.status, 'AUTHENTICATION_REQUIRED');
  assert.equal(result.claudeAttempt.semanticReviewPerformed, false);
  assert.equal(result.claudeAttempt.currentPacket, true);
});

test('an actual Claude authentication failure cannot substitute for a semantic source review', () => {
  const attempt = JSON.parse(readFileSync(new URL('../evidence/history-two-reviewers/claude-authentication-attempt-20261127.json', import.meta.url)));
  assert.equal(attempt.provider, 'Anthropic');
  assert.equal(attempt.exitCode, 1);
  assert.equal(attempt.semanticReviewPerformed, false);
  assert.equal(attempt.reviewRecordCreated, false);
  assert.equal(attempt.inputTokens + attempt.outputTokens, 0);
  assert.match(attempt.providerMessage, /OAuth session expired/);
  const f = fixture(); f.evidence.records[1] = attempt;
  assert.throws(() => evaluate(f), /INVALID_SEMANTIC_REVIEW/);
});
