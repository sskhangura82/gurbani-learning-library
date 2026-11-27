// AI-assisted research drafts only. This module cannot admit a chapter, approve
// history, attest human authorship, or authorize publication.
import {createHash} from 'node:crypto';
import {parseStrictJSON} from '../../hukamnama/json.mjs';
import {validateRegistry, CLASSES} from './registry.mjs';

export const DRAFT_SCHEMA = 'glp.history.ai-draft.v1';
const ID = /^[a-z][a-z0-9.-]{1,119}$/;
const need = (ok, code) => { if (!ok) throw new Error(code); };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function keys(value, fields, code) {
  need(object(value) && Object.keys(value).length === fields.length &&
    fields.every(field => Object.hasOwn(value, field)), code);
}
function text(value, code, max = 12000) {
  need(typeof value === 'string' && value.trim() && value.length <= max &&
    !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value), code);
}
function ids(value) {
  need(Array.isArray(value) && value.length <= 200 &&
    value.every(id => typeof id === 'string' && ID.test(id)) &&
    new Set(value).size === value.length, 'INVALID_DRAFT_REFERENCES');
}
function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (object(value)) return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
function freeze(value) {
  if (object(value) || Array.isArray(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

export function validateDraft(registry, draft) {
  const index = validateRegistry(registry);
  keys(draft, ['schema', 'id', 'title', 'status', 'authorship', 'rights', 'relationIds', 'sections'], 'INVALID_DRAFT_FIELDS');
  need(draft.schema === DRAFT_SCHEMA && typeof draft.id === 'string' && ID.test(draft.id), 'INVALID_DRAFT_ID');
  need(draft.status === 'AI_ASSISTED_UNREVIEWED_DRAFT', 'DRAFT_CANNOT_BE_APPROVED');
  need(!index.chapters.has(draft.id), 'DRAFT_IN_HUMAN_CHAPTER_SLOT');
  text(draft.title, 'INVALID_DRAFT_TITLE', 300);
  keys(draft.authorship, ['kind', 'tool', 'humanWriter'], 'INVALID_DRAFT_AUTHORSHIP');
  need(draft.authorship.kind === 'AI_ASSISTED_DRAFT' && draft.authorship.humanWriter === null, 'DRAFT_CANNOT_ATTEST_HUMAN_AUTHOR');
  text(draft.authorship.tool, 'MISSING_DRAFT_TOOL', 100);
  need(draft.rights === 'ORIGINAL_PROJECT_DRAFT_NO_SOURCE_REPRODUCTION', 'INVALID_DRAFT_RIGHTS');
  ids(draft.relationIds);
  for (const id of draft.relationIds) need(index.relations.has(id), 'UNRESOLVED_DRAFT_RELATION');
  const depths = ['STORY', 'SOURCE_STUDY', 'FURTHER_STUDY'];
  need(Array.isArray(draft.sections) && draft.sections.length === depths.length, 'INVALID_DRAFT_SECTIONS');
  const blocks = new Set();
  draft.sections.forEach((section, position) => {
    keys(section, ['depth', 'title', 'blocks'], 'INVALID_DRAFT_SECTION_FIELDS');
    need(section.depth === depths[position], 'INVALID_DRAFT_DEPTH');
    text(section.title, 'INVALID_DRAFT_SECTION_TITLE', 300);
    need(Array.isArray(section.blocks) && section.blocks.length > 0 && section.blocks.length <= 100, 'EMPTY_DRAFT_SECTION');
    for (const block of section.blocks) {
      keys(block, ['id', 'kind', 'text', 'claimIds'], 'INVALID_DRAFT_BLOCK_FIELDS');
      need(typeof block.id === 'string' && ID.test(block.id) && !blocks.has(block.id), 'INVALID_DRAFT_BLOCK_ID');
      blocks.add(block.id); text(block.text, 'INVALID_DRAFT_TEXT'); ids(block.claimIds);
      if (section.depth === 'FURTHER_STUDY') {
        need(block.kind === 'EDITORIAL_QUESTION' && !block.claimIds.length, 'QUESTION_MUST_STAY_EDITORIAL');
      } else {
        need(block.kind === 'HISTORICAL_NARRATIVE', 'INVALID_DRAFT_NARRATIVE_KIND');
        need(block.claimIds.length > 0, 'UNSOURCED_DRAFT_BLOCK');
        for (const id of block.claimIds) {
          const claim = index.claims.get(id);
          need(claim, 'UNRESOLVED_DRAFT_CLAIM');
          need(claim.citations.some(citation => citation.relationship === 'SUPPORTS'), 'DRAFT_CLAIM_WITHOUT_SUPPORT');
        }
      }
    }
  });
  return index;
}
export function parseDraft(registry, input) {
  const draft = parseStrictJSON(input);
  validateDraft(registry, draft);
  return freeze(draft);
}
export function draftReviewPacket(registry, draft) {
  const index = validateDraft(registry, draft);
  const relations = draft.relationIds.map(id => index.relations.get(id));
  const ids = new Set([...draft.sections.flatMap(section => section.blocks.flatMap(block => block.claimIds)),
    ...relations.flatMap(relation => relation.claimIds)]);
  const pending = [...ids];
  while (pending.length) for (const conflict of index.claims.get(pending.pop()).conflicts) {
    if (!ids.has(conflict.claimId)) { ids.add(conflict.claimId); pending.push(conflict.claimId); }
  }
  const claims = [...ids].sort().map(id => index.claims.get(id));
  const sourceIds = [...new Set(claims.flatMap(claim => claim.citations.map(citation => citation.sourceId)))].sort();
  const entityIds = [...new Set(claims.flatMap(claim => claim.entityIds))].sort();
  return freeze(JSON.parse(JSON.stringify({
    schema: 'glp.history.ai-draft-review.v1', draft, claims, relations,
    sources: sourceIds.map(id => index.sources.get(id)),
    entities: entityIds.map(id => index.entities.get(id))
  })));
}
export function draftDigest(registry, draft) {
  return createHash('sha256').update(stable(draftReviewPacket(registry, draft)), 'utf8').digest('hex');
}
export function prepareResearchDraft(registry, draft) {
  const packet = draftReviewPacket(registry, draft);
  return freeze({
    status: 'WITHHELD',
    humanReview: 'NOT_PERFORMED',
    releaseAuthorization: 'NOT_GRANTED_BY_THIS_TOOL',
    draftSha256: draftDigest(registry, draft),
    reasons: ['AI_DRAFT_NOT_HUMAN_AUTHORED_CHAPTER', 'QUALIFIED_HISTORICAL_AND_PUNJABI_REVIEW_PENDING'],
    unverifiedClaimIds: packet.claims.filter(claim => claim.classification === 'UNVERIFIED_ATTRIBUTION').map(claim => claim.id),
    chapter: null,
    packet
  });
}

// Markdown is a review artifact, not an application page. The binding covers
// prose, metadata, supporting claims, source positions and conflicting claims.
export function renderDraftMarkdown(registry, draft) {
  const {packet, draftSha256} = prepareResearchDraft(registry, draft);
  const claimMap = new Map(packet.claims.map((claim, i) => [claim.id, {claim, label: 'C' + (i + 1)}]));
  const sourceMap = new Map(packet.sources.map((source, i) => [source.id, {source, label: 'S' + (i + 1)}]));
  const lines = ['# ' + draft.title, '',
    '**AI-assisted historical draft — awaiting qualified historical and Punjabi review.**',
    'Original English research manuscript prepared with ' + draft.authorship.tool + '. No human author or reviewer has approved it. This document is withheld from the application.', '',
    '## Read the draft', ''];
  for (const section of draft.sections) {
    lines.push('### ' + section.title, '');
    for (const block of section.blocks) {
      if (block.kind === 'EDITORIAL_QUESTION') lines.push('**Discussion question:** ' + block.text, '');
      else lines.push(block.text + ' ' + block.claimIds.map(id => {
        const item = claimMap.get(id); return '[' + item.label + '](#' + id + ')';
      }).join(' '), '');
    }
  }
  lines.push('## Claim register', '',
    'These labels describe research status, not approval. Secondary-source assertions are conservatively marked unverified because the current registry has no separate secondary-account classification. Their attribution is recorded; their underlying historical evidence still needs qualified review.', '');
  for (const {claim, label} of claimMap.values()) {
    lines.push('<a id="' + claim.id + '"></a>', '', '### ' + label + ' · ' + claim.id, '',
      claim.statement, '', '**Classification:** ' + CLASSES[claim.classification], '',
      '**Uncertainty:** ' + claim.uncertainty, '', '**Limits:** ' + claim.limitations, '', '**References:**', '');
    for (const citation of claim.citations) {
      const source = sourceMap.get(citation.sourceId);
      lines.push('- [' + source.label + '](#' + source.source.id + ') — ' + citation.locator.reference + ' (' + citation.relationship.toLowerCase() + ').');
    }
    lines.push('');
    for (const conflict of claim.conflicts) lines.push('**Competing claim:** [' + conflict.claimId + '](#' + conflict.claimId + ') — ' + conflict.description, '');
  }
  lines.push('## Source register', '');
  for (const {source, label} of sourceMap.values()) {
    lines.push('<a id="' + source.id + '"></a>', '', '### ' + label + ' · ' + source.title, '',
      '**Creator:** ' + source.creator, '', '**Edition:** ' + source.edition, '',
      '**Date:** ' + source.sourceDate.label + ' (' + source.sourceDate.certainty.toLowerCase() + ').',
      '', '**Locator:** ' + source.provenance.catalogueReference, '',
      '**Repository:** ' + source.provenance.repository, '',
      '**Source:** ' + (source.provenance.witnessUrl ? '[' + source.provenance.witnessUrl + '](' + source.provenance.witnessUrl + ')' : 'No public URL recorded.'), '',
      '**Reuse:** metadata only; no source text, modern translation, scan or image is reproduced here.', '');
  }
  lines.push('## Review binding', '', 'Draft and linked evidence SHA-256: ' + draftSha256, '',
    'A digest can bind a review to the exact manuscript and records. It cannot establish truth, independence, rights or scholarly qualification. Historical interpretation, source collation and publication remain human decisions.', '');
  return lines.join('\n');
}
