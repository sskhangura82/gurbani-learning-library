/* Original AI-authored educational drafts, not approved translations. */
import fs from 'node:fs';
const drafts=JSON.parse(fs.readFileSync(new URL('./jaap-chhands76-90-drafts.json',import.meta.url),'utf8'));
export const jaap76to90Lines=drafts.lines;
export const jaap76to90Deep=drafts.studies;
