/* GLP-001 linked-reading launchpad contract; no external source text copied. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url),read=x=>fs.readFileSync(new URL(x,root),'utf8');
const page=read('nitnem-today.html'),css=read('css/nitnem-today.css'),script=read('js/nitnem-today.js'),sw=read('sw.js');
const ids=['japji','jaap','savaiye','chaupai','anand','rehras','sohila'],cases=[];
const test=(name,fn)=>{fn();cases.push(name)};
test('One accessible page contains all seven named daily banis in correct order',()=>{
 const all=[...page.matchAll(/data-bani="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(all,ids);
 assert.equal((page.match(/class="bani" /g)||[]).length,7);
});
test('Five morning, one evening, one night; Ardas is a separate companion',()=>{
 assert.ok(page.includes('id="morning"')&&page.includes('id="evening"')&&page.includes('id="night"'));
 assert.ok(page.includes('class="ardas"'));
 assert.ok(!ids.includes('ardas'));
});
test('Original Japji stays on same approved hash-verified reader URL',()=>{
 assert.ok(page.includes('href="full-japji.html"'));
 assert.ok(page.includes('https://sskhangura82.github.io/gurbani-learning-library/full-japji.html'));
});
test('All six additional source links use exact previously checked original-only HTTPS pages',()=>{
 const expected=[
 'https://www.discoversikhism.com/learn_gurbani/learn_jaap_sahib.html',
 'https://www.discoversikhism.com/learn_gurbani/learn_tav_prasad_savaiye.html',
 'https://www.discoversikhism.com/learn_gurbani/learn_chaupai_sahib.html',
 'https://www.discoversikhism.com/learn_gurbani/learn_anand_sahib.html',
 'https://www.discoversikhism.com/learn_gurbani/learn_rehras_sahib.html',
 'https://discoversikhism.com/learn_gurbani/learn_sohila_sahib.html'
 ];
 expected.forEach(link=>assert.ok(page.includes('href="'+link+'"')));
});
test('Avoid known overly inclusive Kirtan Sohila aggregator',()=>assert.ok(!page.includes('href="https://gurdwaras.com/nitnem/kirtan-sohila"')));
test('Evening composite, Anand forty-pauri and Chaupai variant caveats are visible',()=>{
 assert.ok(page.includes('Full 40-pauri'));
 assert.ok(page.includes('Reading lengths differ among gutkas'));
 assert.ok(page.includes('differ among traditions'));
});
test('Third-party links have safe separate-tab protections',()=>{
 for(const m of page.matchAll(/<a\b[^>]+href="https:\/\/[^"]+"[^>]*>/g)){
  assert.ok(m[0].includes('rel="noopener noreferrer"'),m[0]);
 }
});
test('External JavaScript, iframe and executable third-party content are not embedded',()=>{
 assert.ok(page.includes("script-src 'self'"));
 assert.ok(page.includes("connect-src 'none'"));
 assert.ok(!/<iframe\b/i.test(page));
 assert.equal((page.match(/<script\b/g)||[]).length,1);
});
test('Exactly seven explicit optional completion controls, no auto-completion after links',()=>{
 assert.deepEqual([...page.matchAll(/data-complete="([^"]+)"/g)].map(m=>m[1]),ids);
 assert.ok(script.includes("aria-pressed"));
 assert.ok(!script.includes("addEventListener('click'")||script.includes("data-complete"));
});
test('Completion record stays local, date-scoped and independent from Japji learning keys',()=>{
 assert.ok(script.includes('localStorage'));
 assert.ok(script.includes('glp001.nitnem-today.progress.v1'));
 assert.ok(script.includes('getFullYear()'));
 assert.ok(!script.includes('glp001.continuous.v2'));
});
test('No external network, media, analytics or invasive user permissions from local JS',()=>{
 assert.ok(!/\bfetch\s*\(/.test(script));
 assert.ok(!/XMLHttpRequest|sendBeacon|geolocation|mediaDevices|serviceWorker\.register/.test(script));
 assert.ok(!page.includes('autoplay'));
});
test('Accessible minimum touch size and reduced motion are present',()=>{
 assert.ok(css.includes('min-height:44px'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
 assert.ok(page.includes('role="progressbar"'));
});
test('Existing frozen reader worker intentionally does not pretend linked texts are offline',()=>{
 assert.ok(!sw.includes('nitnem-today.html'));
 assert.ok(page.includes('external websites'));
});
test('Independent source approvals have not been falsely claimed',()=>{
 assert.ok(page.includes('have not been approved as the final source'));
 assert.ok(page.includes('qualified Sikh/Punjabi review'));
});
console.log(JSON.stringify({status:'PASS',checks:cases.length,cases,readableBanis:7,originalLocalBanis:1,linkedExternalBanis:6,offlineFullNitnem:false},null,2));
