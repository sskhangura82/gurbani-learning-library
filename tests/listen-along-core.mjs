// Listen-along core: timing logic tests. Uses the app's own scripture files, read-only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const root=new URL('../',import.meta.url);
const C=require('../js/listen-along-core.js');
const scope={window:{}};vm.createContext(scope);
vm.runInContext(fs.readFileSync(new URL('js/japji-full-data.js',root),'utf8'),scope);
vm.runInContext(fs.readFileSync(new URL('js/sukhmani-data.js',root),'utf8'),scope);
const nit=n=>JSON.parse(fs.readFileSync(new URL('nitnem/data/'+n+'.json',root),'utf8'));
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('ok -',name);};
const sha=t=>crypto.createHash('sha256').update(t,'utf8').digest('hex');

const japji=C.normalizeJapji(scope.window.GLP_FULL_JAPJI);
const model=C.buildItems(japji);

test('Japji keeps all 385 original lines, in order, unchanged',()=>{
 assert.equal(model.items.length,385);
 const src=scope.window.GLP_FULL_JAPJI.units.flatMap(u=>u.lines);
 src.forEach((l,i)=>{assert.equal(model.items[i].text,l.text);assert.equal(model.items[i].key,'japji:'+l.id);});
});
test('Every bani the app ships normalizes with matching fingerprints',()=>{
 const comps=[japji,C.normalizeSukhmani(scope.window.GLP_SUKHMANI),...['jaap','savaiye','chaupai','anand','rehras','sohila'].map(n=>C.normalizeNitnem(nit(n)))];
 const counts={};
 for(const c of comps){const m=C.buildItems(c);counts[c.id]=m.items.length;for(const it of m.items)assert.equal(sha(it.text),it.sha256,it.key);}
 assert.deepEqual(counts,{japji:385,sukhmani:2027,jaap:808,savaiye:43,chaupai:121,anand:210,rehras:159,sohila:56});
});
test('Jaap Sahib keeps the source display order for a mid-chhand heading',()=>{
 const m=C.buildItems(C.normalizeNitnem(nit('jaap')));
 const i=m.items.findIndex(x=>x.key==='jaap:jaap062.line01');
 assert.equal(m.items[i+1].kind,'heading');assert.equal(m.items[i+2].key,'jaap:jaap062.line02');
});
test('Morning Nitnem composite has no duplicate line keys',()=>{
 const parts=[japji,...['jaap','savaiye','chaupai','anand'].map(n=>C.normalizeNitnem(nit(n)))];
 const m=C.buildItems(C.compose('morning','Morning Nitnem','ਨਿਤਨੇਮ',parts));
 assert.equal(m.items.length,385+808+43+121+210);
});
test('Weights: letters count, vowel signs and verse numbers do not',()=>{
 assert.equal(C.syllables('ਸਚੁ'),2);assert.equal(C.syllables('॥੧॥'),0);assert.equal(C.syllables('ੴ'),3);
});
test('No marks: nothing is lit and the app says so',()=>{
 const tl=C.createTimeline(model);assert.equal(tl.at(30).state,'none');
});
test('One mark plus video length spreads the bani across the rest of the video',()=>{
 const tl=C.createTimeline(model);tl.add(10,0);
 assert.equal(tl.at(5).state,'waiting');
 const mid=tl.at(10+600,{duration:10+1200/0.97});
 assert.equal(mid.state,'estimated');assert.equal(mid.from,'video length');
 const share=model.items[mid.index].start/model.total;assert.ok(share>0.45&&share<0.55,'about halfway: '+share);
});
test('Between two marks the light moves in proportion to the words',()=>{
 const tl=C.createTimeline(model);tl.add(0,0);tl.add(100,40);
 const p=tl.at(50);assert.equal(p.state,'marked');
 const w=model.items[p.index].start;assert.ok(w<=model.items[40].start/2+1&&model.items[p.index+1].start>model.items[40].start/2-1);
 assert.equal(tl.at(100).index,40);
});
test('After marks run out, the measured pace carries on',()=>{
 const tl=C.createTimeline(model);tl.add(0,0);tl.add(60,20);
 const r=tl.rate().rate;assert.equal(tl.rate().from,'marks');
 const p=tl.at(90);assert.equal(p.state,'estimated');
 const expectW=model.items[20].start+r*30;assert.ok(Math.abs(model.items[p.index].start-expectW)<model.items[p.index].w+1);
});
test('A correction tap in paath removes marks that contradict it',()=>{
 const tl=C.createTimeline(model);tl.add(0,0);tl.add(50,10);tl.add(100,30);
 tl.add(60,25); // listener says line 25 at 60s; the line-30-at-100s mark still agrees
 assert.deepEqual(tl.marks.map(m=>m.i),[0,10,25,30]);
 tl.add(70,35); // contradicts line 30 at 100s
 assert.deepEqual(tl.marks.map(m=>m.i),[0,10,25,35]);
 assert.ok(tl.undo());assert.deepEqual(tl.marks.map(m=>m.i),[0,10,25,30]);
});
test('Kirtan holds each tapped line and allows repeats',()=>{
 const tl=C.createTimeline(model,{style:'kirtan'});tl.add(0,5);tl.add(20,6);tl.add(40,5);
 assert.equal(tl.at(10).index,5);assert.equal(tl.at(30).index,6);assert.equal(tl.at(55).index,5);assert.equal(tl.at(55).state,'held');
 assert.equal(tl.marks.length,3);
});
test('Tap latency shifts the mark slightly earlier; close taps replace each other',()=>{
 const tl=C.createTimeline(model);tl.add(10,0,{latency:C.TAP_LATENCY});assert.equal(tl.marks[0].t,9.8);
 tl.add(9.9,1);assert.equal(tl.marks.length,1);assert.equal(tl.marks[0].i,1);
});
test('Jumping to a line finds its time from marks',()=>{
 const tl=C.createTimeline(model);tl.add(0,0);tl.add(100,40);
 assert.equal(tl.timeOf(40),100);const t=tl.timeOf(20);assert.ok(t>0&&t<100);
 assert.equal(C.createTimeline(model).timeOf(3),null);
});
test('End of bani is reported',()=>{
 const tl=C.createTimeline(model);tl.add(0,0);assert.equal(tl.at(99999).state,'ended');
});
test('Timing file round-trips and names lines by key, never by text',()=>{
 const tl=C.createTimeline(model);tl.add(3.21,0);tl.add(40,12);
 const f=C.timingFile({videoId:'abcdefghijk',bani:'japji',model,timeline:tl,fingerprint:'x'});
 const s=JSON.stringify(f);assert.ok(!s.includes(model.items[0].text));assert.ok(s.length<1000);
 const back=C.readTimingFile(JSON.parse(s),model);assert.deepEqual(back.marks,[{t:3.21,i:0},{t:40,i:12}]);assert.equal(back.missing,0);
 assert.throws(()=>C.readTimingFile({schema:'other'},model));
});
test('A full tap-along timing for Japji stays small',()=>{
 const tl=C.createTimeline(model);model.items.forEach((_,i)=>tl.add(5+i*3.1,i));
 const bytes=Buffer.byteLength(JSON.stringify(C.timingFile({videoId:'abcdefghijk',bani:'japji',model,timeline:tl})));
 assert.ok(bytes<20000,'bytes '+bytes);const link=C.encodeMarks(tl.marks);assert.ok(link.length<3500,'link '+link.length);
 assert.deepEqual(C.decodeMarks(link,385).map(m=>m.i),tl.marks.map(m=>m.i));
});
test('YouTube links of every common shape are understood',()=>{
 const id='dQw4w9WgXcQ';
 for(const u of [id,'https://www.youtube.com/watch?v='+id,'youtube.com/watch?v='+id+'&list=x','https://youtu.be/'+id+'?si=abc','https://m.youtube.com/watch?v='+id,'https://www.youtube.com/live/'+id,'https://www.youtube.com/shorts/'+id,'https://music.youtube.com/watch?v='+id,'https://www.youtube-nocookie.com/embed/'+id])assert.equal(C.parseYouTube(u)?.id,id,u);
 assert.equal(C.parseYouTube('https://youtu.be/'+id+'?t=1m5s').start,65);
 for(const bad of ['','hello','https://vimeo.com/123','https://youtube.com/watch?v=short'])assert.equal(C.parseYouTube(bad),null,bad);
});
console.log(passed+' listen-along core tests passed');
