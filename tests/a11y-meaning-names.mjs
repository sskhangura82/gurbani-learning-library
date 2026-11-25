// Accessibility contract: a meaning button's spoken name must be its own text.
// A fixed aria-label on the button replaces the English and Punjabi meaning for screen-reader
// users (WCAG 2.2: 2.5.3 Label in Name, 4.1.2 Name, Role, Value). Static check; no browser needed.
// Added with independent-review finding CI-A-01 (reviews/claude-independent, PR #38).
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const checks=[];

// Six Nitnem readers: the lineNote() builder must not put an aria-label on the meaning button.
const ui=read('nitnem/learning/learning-ui.js');
const start=ui.indexOf('function lineNote('),end=ui.indexOf('function lineDetails(');
assert.ok(start>0&&end>start,'lineNote() not found in nitnem/learning/learning-ui.js');
const body=ui.slice(start,end);
assert.ok(body.includes("'simple-meaning'"),'lineNote() no longer builds the simple-meaning button; update this test');
assert.ok(!/setAttribute\(\s*['"]aria-label['"]/.test(body),'Nitnem meaning button must not carry a fixed aria-label');
assert.ok(/en\.lang='en'/.test(body)&&/pa\.lang='pa'/.test(body),'English and Punjabi meaning spans must keep their language tags');
checks.push('Nitnem meaning buttons are named by their own English and Punjabi text');

// Not yet fixed (their files are under separate preservation contracts): reported, not failed.
const pending=[];
if(/class="simple-meaning"[^>]*aria-label=/.test(read('js/japji-full.js')))pending.push('js/japji-full.js');
if(/'simple-meaning'\);[^;]*;text\.setAttribute\('aria-label'/.test(read('js/sukhmani-reader.js')))pending.push('js/sukhmani-reader.js');

console.log(JSON.stringify({total:checks.length,status:'PASS',checks,stillOverridingMeaningText:pending}));
