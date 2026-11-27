// Entirely invented test fixtures, not Sikh history, named people or scholarship.
// No fixture is imported by the application or checked-in empty research registry.
import {chapterDigest} from '../../../tools/history/registry.mjs';

export function syntheticRegistry() {
  return {
    schema: 'glp.history.registry.v1', status: 'RESEARCH_ONLY',
    entities: [
      {id: 'person.synthetic', kind: 'PERSON', label: 'Synthetic person'},
      {id: 'place.synthetic', kind: 'PLACE', label: 'Synthetic place'},
      {id: 'event.synthetic', kind: 'EVENT', label: 'Synthetic event'}
    ],
    sources: [{
      id: 'source.synthetic-one', kind: 'DOCUMENT', title: 'Synthetic document',
      creator: 'Synthetic author', edition: 'Synthetic edition one',
      sourceDate: {label: 'Synthetic date unknown', certainty: 'UNKNOWN'},
      originalLanguage: 'Synthetic language', translation: null,
      provenance: {repository: 'Synthetic archive', catalogueReference: 'TEST-ONLY-1', witnessUrl: 'https://example.invalid/test-only/1'},
      lineageId: 'lineage.synthetic-one', reuse: 'METADATA_ONLY_NO_TEXT_OR_IMAGES'
    }],
    claims: [{
      id: 'claim.synthetic-one', statement: 'Synthetic person was at synthetic place.',
      classification: 'PRIMARY_EVIDENCE',
      entityIds: ['person.synthetic', 'place.synthetic'],
      citations: [{sourceId: 'source.synthetic-one', locator: {kind: 'FOLIO', reference: 'Synthetic folio 1 recto, lines 1–3'}, relationship: 'SUPPORTS'}],
      uncertainty: 'Synthetic uncertainty statement; not a historical conclusion.',
      limitations: 'Synthetic limitation statement; no real source was inspected.',
      conflicts: []
    }],
    relations: [{
      id: 'relation.synthetic-one', kind: 'PERSON_AT_PLACE',
      fromEntityId: 'person.synthetic', toEntityId: 'place.synthetic', claimIds: ['claim.synthetic-one']
    }],
    chapters: [{
      id: 'chapter.synthetic-one', title: 'Synthetic chapter, test only',
      writer: {name: 'Synthetic writer', permissionReference: 'Synthetic permission reference; no real agreement'},
      relationIds: ['relation.synthetic-one'],
      blocks: [{id: 'block.synthetic-one', kind: 'HISTORICAL_NARRATIVE',
        text: 'Synthetic person was at synthetic place.', claimIds: ['claim.synthetic-one']}]
    }]
  };
}
export function syntheticReview(registry, {roles = ['HISTORY_REVIEWER']} = {}) {
  return {
    reviewers: [{id: 'reviewer.synthetic', name: 'Synthetic reviewer', roles,
      qualificationReference: 'Synthetic trust roster entry, no real credential'}],
    receipts: roles.map(role => ({
      reviewerId: 'reviewer.synthetic', role, chapterId: 'chapter.synthetic-one',
      chapterSha256: chapterDigest(registry, 'chapter.synthetic-one'), verdict: 'PASS',
      reviewedAt: '2026-11-27T00:00:00.000Z', reference: 'Synthetic external review reference, not actual review'
    }))
  };
}
