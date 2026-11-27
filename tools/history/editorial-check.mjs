import {readFileSync} from 'node:fs';
import {parseStrictJSON} from '../../hukamnama/json.mjs';
import {parseRegistry} from './registry.mjs';
import {parseDraft, prepareResearchDraft} from './draft.mjs';

// Fixed read-only inputs. No provider call, credentials, network or publication.
const read = name => readFileSync(new URL('../../' + name, import.meta.url), 'utf8');
const registry = parseRegistry(read('content-intake/history/registry.json'));
const draft = parseDraft(registry, read('content-intake/history/kartarpur-draft.json'));
const manifest = parseStrictJSON(read('content-intake/history/reviews/kartarpur-review-evidence-20261127.json'));
const sourceSnapshots = parseStrictJSON(read('content-intake/history/reviews/kartarpur-source-snapshots-20261127.json'));
const authorRecord = parseStrictJSON(read('content-intake/history/reviews/kartarpur-chatgpt-20261127.json'));
const result = prepareResearchDraft(registry, draft, {...manifest, sourceSnapshots, records: [authorRecord]});
console.log(JSON.stringify({status: result.status, policy: result.policy, editorialReview: result.editorialReview,
  humanReview: result.humanReview, releaseAuthorization: result.releaseAuthorization,
  packetSha256: result.packetSha256, reasons: result.reasons, reviews: result.reviews,
  inspection: {qualifiedClaims: authorRecord.claimAssessments.filter(c => c.verdict === 'QUALIFIED').length,
    incompleteClaims: authorRecord.claimAssessments.filter(c => c.verdict === 'INCOMPLETE').length,
    actualClaudeSourceReviews: 0}, verificationScope: result.verificationScope}, null, 2));
