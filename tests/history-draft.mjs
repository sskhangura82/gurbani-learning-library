import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {syntheticRegistry} from './fixtures/history/synthetic.mjs';
import {parseRegistry, prepareChapter} from '../tools/history/registry.mjs';
import {DRAFT_SCHEMA, parseDraft, validateDraft, draftDigest, draftReviewPacket, prepareResearchDraft, renderDraftMarkdown} from '../tools/history/draft.mjs';

const copy = value => JSON.parse(JSON.stringify(value));
function fixture() {
  const registry = syntheticRegistry();
  const chapter = registry.chapters[0];
  const block = () => ({id: 'block.synthetic-story', kind: 'HISTORICAL_NARRATIVE', text: 'A synthetic source describes an invented person at an invented place.', claimIds: [registry.claims[0].id]});
  const draft = {
    schema: DRAFT_SCHEMA, id: 'draft.synthetic-research', title: 'Synthetic research draft',
    status: 'AI_ASSISTED_UNREVIEWED_DRAFT',
    authorship: {kind: 'AI_ASSISTED_DRAFT', tool: 'Synthetic tool', humanWriter: null},
    rights: 'ORIGINAL_PROJECT_DRAFT_NO_SOURCE_REPRODUCTION',
    relationIds: [...chapter.relationIds],
    sections: [
      {depth: 'STORY', title: 'Invented story', blocks: [block()]},
      {depth: 'SOURCE_STUDY', title: 'Invented evidence', blocks: [{...block(), id: 'block.synthetic-study'}]},
      {depth: 'FURTHER_STUDY', title: 'Editorial question', blocks: [{id: 'block.synthetic-question', kind: 'EDITORIAL_QUESTION', text: 'What would a source need to show?', claimIds: []}]}
    ]
  };
  registry.chapters = [];
  return {registry, draft};
}

test('a resolving AI draft awaits actual source-review records', () => {
  const {registry, draft} = fixture();
  const result = prepareResearchDraft(registry, draft);
  assert.equal(result.status, 'WITHHELD');
  assert.equal(result.humanReview, 'NOT_PERFORMED');
  assert.equal(result.releaseAuthorization, 'NOT_GRANTED_BY_THIS_TOOL');
  assert.equal(result.chapter, null);
  assert.throws(() => prepareChapter(registry, draft.id), /UNKNOWN_CHAPTER/);
});

test('changing prose, claims, source provenance or relations changes the review binding', () => {
  const {registry, draft} = fixture(), baseline = draftDigest(registry, draft);
  const prose = copy(draft); prose.sections[0].blocks[0].text += ' Invented extra detail.';
  assert.notEqual(draftDigest(registry, prose), baseline);
  const claim = copy(registry); claim.claims[0].statement += ' Different synthetic assertion.';
  assert.notEqual(draftDigest(claim, draft), baseline);
  const source = copy(registry); source.sources[0].edition += ' Changed edition.';
  assert.notEqual(draftDigest(source, draft), baseline);
  const relation = copy(draft); relation.relationIds = [];
  assert.notEqual(draftDigest(registry, relation), baseline);
});

test('support cannot disappear behind an intact claim identifier', () => {
  const {registry, draft} = fixture();
  registry.claims[0].citations = [];
  assert.throws(() => validateDraft(registry, draft), /DRAFT_CLAIM_WITHOUT_SUPPORT/);
});

test('unresolved, empty, unknown-kind and duplicate blocks are rejected', () => {
  for (const [mutate, expected] of [
    [d => { d.sections[0].blocks[0].claimIds = ['claim.missing']; }, /UNRESOLVED_DRAFT_CLAIM/],
    [d => { d.sections[0].blocks[0].claimIds = []; }, /UNSOURCED_DRAFT_BLOCK/],
    [d => { d.sections[0].blocks[0].kind = 'AUTHORITATIVE_TEACHING'; }, /INVALID_DRAFT_NARRATIVE_KIND/],
    [d => { d.sections[1].blocks[0].id = d.sections[0].blocks[0].id; }, /INVALID_DRAFT_BLOCK_ID/]
  ]) {
    const {registry, draft} = fixture(); mutate(draft);
    assert.throws(() => validateDraft(registry, draft), expected);
  }
});

test('human authorship, approval status and permission fields cannot be toggled into the draft', () => {
  for (const [mutate, expected] of [
    [d => { d.authorship.humanWriter = 'Invented reviewer'; }, /DRAFT_CANNOT_ATTEST_HUMAN_AUTHOR/],
    [d => { d.authorship.kind = 'HUMAN_WRITTEN'; }, /DRAFT_CANNOT_ATTEST_HUMAN_AUTHOR/],
    [d => { d.status = 'REVIEWED_DRAFT_READY'; }, /DRAFT_CANNOT_BE_APPROVED/],
    [d => { d.permissionReference = 'invented permission'; }, /INVALID_DRAFT_FIELDS/],
    [d => { d.reviews = [{verdict: 'PASS'}]; }, /INVALID_DRAFT_FIELDS/]
  ]) {
    const {registry, draft} = fixture(); mutate(draft);
    assert.throws(() => validateDraft(registry, draft), expected);
  }
});

test('the AI wrapper cannot be admitted as a human chapter', () => {
  const {registry, draft} = fixture();
  registry.chapters.push(copy(draft));
  assert.throws(() => prepareChapter(registry, draft.id), /INVALID_CHAPTER_FIELDS/);
});

test('a source record cannot carry copied prose or grant reuse rights', () => {
  const {registry, draft} = fixture();
  registry.sources[0].copiedText = 'Invented example of a prohibited source body.';
  assert.throws(() => validateDraft(registry, draft), /INVALID_SOURCE_FIELDS/);
  delete registry.sources[0].copiedText;
  registry.sources[0].reuse = 'FULL_TEXT_ALLOWED';
  assert.throws(() => validateDraft(registry, draft), /SOURCE_REUSE_NOT_ALLOWED/);
});

test('questions remain distinct from sourced historical blocks', () => {
  const {registry, draft} = fixture();
  draft.sections[2].blocks[0].claimIds = [registry.claims[0].id];
  assert.throws(() => validateDraft(registry, draft), /QUESTION_MUST_STAY_EDITORIAL/);
});

test('conflicting source positions travel into the bound packet', () => {
  const {registry, draft} = fixture();
  const other = copy(registry.claims[0]);
  other.id = 'claim.synthetic-competing'; other.statement = 'An explicitly invented competing account.';
  other.conflicts = [{claimId: registry.claims[0].id, description: 'Synthetic disagreement.'}];
  registry.claims[0].conflicts = [{claimId: other.id, description: 'Synthetic disagreement.'}];
  registry.claims.push(other);
  const before = draftDigest(registry, draft), packet = draftReviewPacket(registry, draft);
  assert(packet.claims.some(claim => claim.id === other.id));
  registry.claims[1].statement += ' Changed synthetic account.';
  assert.notEqual(draftDigest(registry, draft), before);
});

test('duplicate JSON keys are rejected and parsed prose is frozen', () => {
  const {registry, draft} = fixture();
  assert.throws(() => parseDraft(registry, JSON.stringify(draft).replace('"title":', '"title":"hidden","title":')));
  const parsed = parseDraft(registry, JSON.stringify(draft));
  assert(Object.isFrozen(parsed.sections[0].blocks[0]));
});

test('real manuscript review copy is current, sourced, honest and not admitted', () => {
  const registry = parseRegistry(readFileSync(new URL('../content-intake/history/registry.json', import.meta.url), 'utf8'));
  const draft = parseDraft(registry, readFileSync(new URL('../content-intake/history/kartarpur-draft.json', import.meta.url), 'utf8'));
  const result = prepareResearchDraft(registry, draft);
  assert.equal(result.status, 'WITHHELD');
  assert.equal(result.packet.sources.length, 5);
  assert.equal(result.packet.claims.length, 10);
  assert(result.unverifiedClaimIds.length > 0);
  assert.deepEqual(registry.chapters, []);
  assert.throws(() => prepareChapter(registry, draft.id), /UNKNOWN_CHAPTER/);
  const rendered = renderDraftMarkdown(registry, draft);
  assert.match(rendered, /AI-assisted historical draft/);
  assert.match(rendered, /awaiting ChatGPT and Claude source checks/);
  assert.match(rendered, /Bhai Gurdas/);
  assert.match(rendered, /Printed|printed/);
  assert.equal(readFileSync(new URL('../docs/history/KARTARPUR_DRAFT_20261127.md', import.meta.url), 'utf8'), rendered);
});
