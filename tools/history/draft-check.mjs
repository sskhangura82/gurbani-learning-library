import {readFileSync, writeFileSync} from 'node:fs';
import {parseRegistry} from './registry.mjs';
import {parseDraft, prepareResearchDraft, renderDraftMarkdown} from './draft.mjs';

// Fixed repository paths. No network, credentials, app imports or publication.
const registry = parseRegistry(readFileSync(new URL('../../content-intake/history/registry.json', import.meta.url), 'utf8'));
const draft = parseDraft(registry, readFileSync(new URL('../../content-intake/history/kartarpur-draft.json', import.meta.url), 'utf8'));
const output = new URL('../../docs/history/KARTARPUR_DRAFT_20261127.md', import.meta.url);
const rendered = renderDraftMarkdown(registry, draft);
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === '--write') writeFileSync(output, rendered);
else if (args.length) throw new Error('UNSUPPORTED_ARGUMENT');
else if (readFileSync(output, 'utf8') !== rendered) throw new Error('STALE_DRAFT_REVIEW_COPY');
const result = prepareResearchDraft(registry, draft);
console.log(JSON.stringify({
  status: result.status, humanReview: result.humanReview,
  releaseAuthorization: result.releaseAuthorization, draftSha256: result.draftSha256,
  manuscriptBlocks: draft.sections.flatMap(section => section.blocks).length,
  claims: result.packet.claims.length, sources: result.packet.sources.length,
  unverifiedClaims: result.unverifiedClaimIds.length, admittedChapters: registry.chapters.length
}, null, 2));
