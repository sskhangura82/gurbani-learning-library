import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {parseYouTubeURL, emptyTiming, validateTiming, putCue, lineAt, mediaTimeMs, timingKey, serializeTiming,
  formatTime, MAX_TIMING_BYTES, MAX_CUES, MAX_TIME_MS} from '../collections/source-reader/read-along-core.mjs';
import {createReadAlongSource} from '../collections/source-reader/read-along-source.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const video = 'M7lc1UVf-VE';
const bytes = name => fs.readFile(path.join(root, name));
const manifestBytes = await bytes('collections/source-data/sggs/manifest.json');
const chunkBytes = await bytes('collections/source-data/sggs/chunks/c0001.json');
const manifest = JSON.parse(manifestBytes), chunk = JSON.parse(chunkBytes);
const expectedUnits = chunk.units.filter(unit => unit.sectionId === '1DSA');
const expectedLines = expectedUnits.flatMap(unit => unit.lines);
const requests = [];
const source = createReadAlongSource({baseURL: new URL('https://source.invalid/collections/source-reader/read-along.bundle.mjs'),
  fetcher: async (url, options) => {
    const target = new URL(url); assert.equal(target.origin, 'https://source.invalid');
    assert.equal(options.credentials, 'omit'); assert.equal(options.cache, 'no-store');
    requests.push(target.pathname);
    return new Response(await bytes(target.pathname.slice(1)));
  }});
const reading = await source.japji();

test('Only recognized single-recording YouTube links become safe video IDs and start times', () => {
  for (const url of [video, 'https://youtu.be/' + video, 'https://www.youtube.com/watch?v=' + video,
    'https://m.youtube.com/watch?v=' + video + '&list=ignored&si=tracking',
    'https://www.youtube.com/shorts/' + video, 'https://www.youtube.com/live/' + video,
    'https://www.youtube-nocookie.com/embed/' + video, 'youtube.com/watch?v=' + video])
    assert.deepEqual(parseYouTubeURL(url), {videoId: video, startSeconds: 0});
  assert.equal(parseYouTubeURL('https://youtu.be/' + video + '?t=1h2m3s').startSeconds, 3723);
  assert.equal(parseYouTubeURL('https://www.youtube.com/watch?v=' + video + '#t=20.125').startSeconds, 20.125);
  for (const url of ['javascript:alert(1)', 'https://youtube.com.evil.invalid/watch?v=' + video,
    'https://youtu.be.evil.invalid/' + video, 'https://www.youtube.com@evil.invalid/watch?v=' + video,
    'https://user@www.youtube.com/watch?v=' + video, 'https://www.youtube.com:444/watch?v=' + video,
    'https://www.youtube.com/playlist?list=x', 'https://www.youtube.com/watch?v=' + video + '&v=abcdefghijk',
    'https://youtu.be/' + video + '/extra', 'https://youtu.be/' + video + '?t=-1',
    'https://youtu.be/' + video + '?t=10&start=20', 'https://youtu.be/' + video + '?t=99999999999999',
    'https://youtu.be/' + video + '\n', '<iframe src="https://youtube.com/embed/' + video + '"></iframe>'])
    assert.throws(() => parseYouTubeURL(url), undefined, url);
});

test('Full Japji is the independently pinned complete SGGS section, without importing legacy reader state', () => {
  assert.equal(createHash('sha256').update(manifestBytes).digest('hex'), '04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def');
  assert.equal(reading.lines.length, 385); assert.equal(reading.binding.units.length, 39);
  assert.equal(reading.binding.selectionId, 'section:1DSA');
  assert.deepEqual(reading.lines.map(line => [line.id, line.text, line.page]), expectedLines.map(line => [line.id, line.text, line.page]));
  assert.deepEqual(reading.binding.units, manifest.units.filter(unit => unit.sectionId === '1DSA').map(unit => ({id:unit.id,sha256:unit.sha256})));
  assert.ok(Object.isFrozen(reading) && Object.isFrozen(reading.lines[0]) && Object.isFrozen(reading.binding.units));
  assert.deepEqual(requests, ['/collections/source-data/sggs/manifest.json', '/collections/source-data/sggs/chunks/c0001.json']);
});

test('Timing uses bounded media intervals, handles repeated lines and explicit gaps, and never estimates the tail', () => {
  let map = emptyTiming(video, reading);
  const a = reading.lines[0].id, b = reading.lines[1].id;
  map = putCue(map, reading, 10000, a);
  assert.equal(lineAt(map, 10), null, 'An unfinished first mark is not a timing range');
  map = putCue(map, reading, 16000, b);
  map = putCue(map, reading, 22000, null);
  map = putCue(map, reading, 35000, a);
  map = putCue(map, reading, 40000, null);
  for (const [time, expected] of [[0,null],[9.999,null],[10,a],[15.999,a],[16,b],[21.999,b],[22,null],[30,null],[35,a],[39.999,a],[40,null],[999,null]])
    assert.equal(lineAt(map, time), expected, String(time));
  // Backward/forward seeks and changed playback rate use the same media clock.
  assert.deepEqual([39,12,19,23,36].map(time => lineAt(map,time)), [a,a,b,null,a]);
  assert.equal(lineAt(map, NaN), null); assert.equal(lineAt(map, -1), null);
  const replaced = putCue(map, reading, 16000, a);
  assert.equal(replaced.cues.length, map.cues.length); assert.equal(lineAt(replaced, 18), a);
  assert.equal(lineAt(map, 18), b, 'Prior revisions remain immutable for Undo');
});

test('Media-clock conversion retains exact integer-millisecond marks and rejects invalid or out-of-range clocks', () => {
  assert.ok((1005 / 1000) * 1000 < 1005, 'Exercise the actual binary floating-point regression');
  for (const [seconds, milliseconds] of [[0,0], [1.005,1005], [40.001,40001],
    [1.004,1004], [1.0044,1004], [40,40000], [MAX_TIME_MS / 1000,MAX_TIME_MS]])
    assert.equal(mediaTimeMs(seconds), milliseconds, 'Clock ' + seconds);
  for (const invalid of [undefined, null, '1.005', {}, NaN, Infinity, -Infinity, -0.001,
    MAX_TIME_MS / 1000 + 0.0001, Number.MAX_VALUE])
    assert.equal(mediaTimeMs(invalid), null, 'Invalid clock ' + String(invalid));
});

test('Fractional-second cue boundaries round-trip without moving to an earlier line or filling a true gap', () => {
  const a = reading.lines[0].id, b = reading.lines[1].id;
  const map = validateTiming({...emptyTiming(video, reading), cues: [
    {at: 0, lineId: a}, {at: 1005, lineId: b}, {at: 2000, lineId: null},
    {at: 40001, lineId: a}, {at: 41000, lineId: null}
  ]}, reading, video);
  for (const [time, expected] of [[0,a], [1.004,a], [1.005,b], [1.006,b], [1.999,b],
    [2,null], [39.999,null], [40,null], [40.001,a], [40.002,a], [40.999,a], [41,null]])
    assert.equal(lineAt(map, time), expected, 'Actual media seconds ' + time);
  for (let attempt = 0; attempt < 5; attempt++) {
    assert.equal(lineAt(map, 1005 / 1000), b, 'Repeated paused replay stays at the second line');
    assert.equal(lineAt(map, 40001 / 1000), a, 'Repeated paused replay stays at the repeated occurrence');
  }
  assert.equal(lineAt(map, 40), null, 'A real clock one millisecond before the mark remains in the gap');
  assert.equal(lineAt(map, MAX_TIME_MS / 1000 + 1), null, 'Out-of-range clocks never select a line');
});

test('Wrong videos, editions, digests, group ordering, invented review status and foreign lines refuse', () => {
  const a = reading.lines[0].id;
  const good = putCue(putCue(emptyTiming(video, reading), reading, 100, a), reading, 200, null);
  for (const mutate of [
    x => {x.videoId='abcdefghijk';}, x=>{x.source.collectionId='dasam';},
    x => {x.source.editionId='legacy-japji';}, x=>{x.source.manifestSha256='0'.repeat(64);},
    x => {x.source.units[0].sha256='0'.repeat(64);}, x=>{x.source.units.reverse();},
    x => {x.source.selectionId='unit:DMP';}, x=>{x.source.units.pop();},
    x => {x.cues[0].lineId='FOREIGN';}, x=>{x.timingStatus='CLAUDE_APPROVED';},
    x => {x.extra=true;}, x=>{x.cues[0].extra=true;}, x=>{x.source.units[0].extra=true;},
    x => {x.cues[1].at=x.cues[0].at;}, x=>{x.cues[0].at=-1;},
    x => {x.cues[0].at=0.5;}, x=>{x.cues[1].at=MAX_TIME_MS+1;},
    x => {x.cues.reverse();}
  ]) {const altered=structuredClone(good);mutate(altered);assert.throws(()=>validateTiming(altered,reading,video));}
  assert.throws(()=>validateTiming('{bad}',reading,video));
  assert.throws(()=>validateTiming(' '.repeat(MAX_TIMING_BYTES+1),reading,video));
  assert.throws(()=>putCue(good,reading,NaN,a));
  const tooMany={...good,cues:Array.from({length:MAX_CUES+1},(_,index)=>({at:index,lineId:a}))};
  assert.throws(()=>validateTiming(tooMany,reading,video));
  assert.deepEqual(validateTiming(serializeTiming(good),reading,video),good);
});

test('Timing storage belongs to the exact video and source; complete Japji annotations stay small', () => {
  const key=timingKey(video,reading);
  assert.ok(key.startsWith('glp001.youtube-timing.v1:'));
  assert.notEqual(key,timingKey('abcdefghijk',reading));
  const profile={...emptyTiming(video,reading),cues:[...reading.lines.map((line,index)=>({at:index*5000,lineId:line.id})),{at:reading.lines.length*5000,lineId:null}]};
  const text=serializeTiming(validateTiming(profile,reading,video));
  const size=Buffer.byteLength(text);assert.ok(size<20000,'Complete 385-row sample uses under 20KB');
  assert.equal(formatTime(3723),'1:02:03');assert.equal(formatTime(65.9),'1:05');
  console.log(JSON.stringify({syntheticFullJapjiTimingBytes:size,cues:profile.cues.length,mediaStored:false}));
});

test('Page/group selection preserves complete cross-page units and refuses unowned locations', async () => {
  const options=await source.browsePage('dasam',738);
  assert.deepEqual(options.map(item=>item.id),['2NB','4TJ']);
  for (const option of options) {
    const group=await source.group('dasam',738,option.id);
    assert.equal(group.lines.length,option.lineCount);assert.equal(group.binding.selectionId,'unit:'+option.id);
    assert.ok(group.lines.some(line=>line.page!==738),'Neighbor-page source rows remain in the complete group');
  }
  assert.equal(options.reduce((sum,option)=>sum+option.lineCount,0),845);
  await assert.rejects(source.group('sggs',1,'BB8'));
  await assert.rejects(source.browsePage('sggs',0));
  await assert.rejects(source.browsePage('foreign',1));
});

test('Corrupt or truncated source bytes refuse before any reading can be aligned', async () => {
  for (const mode of ['manifest','chunk','truncated']) {
    const broken=createReadAlongSource({baseURL:new URL('https://source.invalid/collections/source-reader/read-along.bundle.mjs'),fetcher:async url=>{
      const name=new URL(url).pathname.slice(1);let content=await bytes(name);
      if ((mode==='manifest'&&name.endsWith('manifest.json'))||(mode==='chunk'&&name.includes('/chunks/'))) {
        content=Buffer.from(content);content[20]^=1;
      } else if(mode==='truncated')content=content.subarray(0,content.length-1);
      return new Response(content);
    }});
    await assert.rejects(broken.japji());
  }
});
