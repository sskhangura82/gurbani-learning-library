// Focused builder diagnostic: actual YouTube SDK, iframe and media, with a
// TEST ONLY metadata response and public configuration substituted in memory.
// No owned runtime logic or real provider script is rewritten by this harness.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root = await fs.realpath(process.env.GLP_TARGET_DIRECTORY || process.cwd());
const out = path.resolve(process.env.GLP_YOUTUBE_OUTPUT || path.join(os.tmpdir(), 'glp-pr78-real-youtube', new Date().toISOString().replace(/[:.]/g, '-')));
const video = process.env.GLP_TEST_VIDEO || '8soV6l6is4Q';
assert.match(video, /^[A-Za-z0-9_-]{11}$/);
assert.ok(out !== root && !out.startsWith(root + path.sep), 'Diagnostic output must be outside the checked repository');
await fs.mkdir(out, {recursive: true});
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const sri = bytes => 'sha384-' + createHash('sha384').update(bytes).digest('base64');
const prefix = '/pr78-real-youtube/';
const testKey = 'GLP_TEST_ONLY_NOT_A_KEY';
const pagePath = 'listen/index.html', bundlePath = 'collections/source-reader/read-along.bundle.mjs';
const inputPaths = [pagePath, bundlePath, 'listen/read-along.css', 'collections/source-reader/read-along-config.mjs',
  'collections/source-reader/read-along-player.mjs', 'collections/source-reader/read-along.mjs'];
const publicPaths = new Set([pagePath, bundlePath, 'listen/read-along.css', 'icons/icon-180.png', 'icons/icon-192.png',
  'icons/icon-512.png', 'js/japji-full-data.js', 'js/sukhmani-data.js',
  ...['jaap','savaiye','chaupai','anand','rehras','sohila'].map(id => 'nitnem/data/' + id + '.json')]);
const isPublic = relative => publicPaths.has(relative)
  || /^collections\/source-data\/(?:sggs|dasam)\/(?:manifest\.json|chunks\/c[0-9]{4}\.json)$/.test(relative);
const contentType = relative => ({'.html':'text/html; charset=utf-8', '.mjs':'text/javascript; charset=utf-8',
  '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.png':'image/png'}[path.extname(relative)] || 'application/octet-stream');
const report = {status:'FAIL', started:new Date().toISOString(), sourceCommit:null, video,
  inputHashes:{}, servedHashes:{}, metadataLookupsStubbed:0, events:[], browser:null, limits:[
    'Builder diagnostic, not an independent review or release approval.',
    'Actual official YouTube IFrame SDK, youtube-nocookie embed and streamed recording. Those responses are not stubbed.',
    'Only the YouTube Data API status lookup and an empty public key slot are replaced with TEST ONLY values in the isolated browser.',
    'The HTML integrity attribute is recomputed for that configuration-only in-memory bundle. Repository files are not changed.',
    'The metadata fixture does not establish this recording’s actual eligibility, Made-for-Kids status or owner permissions.',
    'Fresh headless desktop Chrome; audio muted by browser flag and an IFrame mute command. Playback is API-triggered with a headless autoplay override.',
    'No real tap-to-play, physical iPhone/Safari/VoiceOver, or systematic advertisement behavior is tested.',
    'Four deliberately spaced marks test the real media clock. They are not recitation-aligned timings and must not ship as a usable timing map.',
    'Marker-jump geometry is observed immediately after the synchronous click handler and after settling; exact geometry inside seekTo is covered separately by the synthetic regression.',
    'Service workers are blocked. No existing browser profile, saved learning, owner key or private data is used.'
  ]};
const note = (name, value) => { report.events.push({at:new Date().toISOString(),name,value}); console.log(JSON.stringify({name,value})); };
let server, browser, context, page;
let inputBytes = new Map();
const hosts = new Set(), completedProviderKinds = new Set();
const kindFor = url => {
  if (url.hostname === 'www.youtube.com' && url.pathname === '/iframe_api') return 'official-iframe-sdk';
  if (url.hostname === 'www.youtube-nocookie.com' && url.pathname.startsWith('/embed/')) return 'nocookie-embed';
  if (url.hostname.endsWith('.googlevideo.com')) return 'streamed-media';
  if (/youtube|ytimg/.test(url.hostname)) return 'provider-support';
  return null;
};
const sample = async () => page.evaluate(() => {
  const rows = [...document.querySelectorAll('#read-along-text [data-line-id]')];
  const active = rows.findIndex(row => row.dataset.active === 'true');
  const clock = document.getElementById('media-time')?.textContent || '';
  const seconds = value => value.trim().split(':').reduce((total, part) => total * 60 + Number(part), 0);
  const [position, duration] = clock.split('/');
  const frame = document.querySelector('#youtube-player iframe'), rect = frame?.getBoundingClientRect();
  return {state:document.getElementById('player-state')?.textContent,
    status:document.getElementById('video-status')?.textContent, time:clock,
    timeSeconds:/^\d+:\d\d/.test(position || '') ? seconds(position) : null,
    durationSeconds:duration && /^\s*\d+:\d\d/.test(duration) ? seconds(duration) : null,
    activeRow:active < 0 ? null : active + 1, rate:document.getElementById('playback-rate')?.textContent,
    frame:rect ? {top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right,width:rect.width,height:rect.height,
      fullyVisible:rect.top >= -1 && rect.left >= -1 && rect.bottom <= innerHeight + 1 && rect.right <= innerWidth + 1} : null,
    viewport:{width:innerWidth,height:innerHeight}};
});
const command = async functionName => {
  assert.ok(['mute','playVideo','pauseVideo'].includes(functionName));
  await page.evaluate(name => {
    const frame = document.querySelector('#youtube-player iframe');
    if (!frame?.contentWindow) throw Error('No live YouTube frame');
    frame.contentWindow.postMessage(JSON.stringify({event:'command',func:name,args:[]}), 'https://www.youtube-nocookie.com');
  }, functionName);
  note('test-harness-native-command', functionName);
};
const waitClock = async minimum => page.waitForFunction(value => {
  const text = document.getElementById('media-time')?.textContent || '';
  const match = text.match(/^(\d+):(\d\d)/);
  return match && Number(match[1]) * 60 + Number(match[2]) >= value;
}, minimum, {timeout:90000});

try {
  report.sourceCommit = execFileSync('git', ['rev-parse','HEAD'], {cwd:root,encoding:'utf8'}).trim();
  if (process.env.GLP_EXPECTED_COMMIT) assert.equal(report.sourceCommit, process.env.GLP_EXPECTED_COMMIT, 'Exact expected candidate commit');
  for (const relative of inputPaths) {
    const bytes = await fs.readFile(path.join(root,relative)); inputBytes.set(relative, bytes);
    report.inputHashes[relative] = sha256(bytes);
    const committed = execFileSync('git', ['show',report.sourceCommit + ':' + relative], {cwd:root,maxBuffer:16*1024*1024});
    assert.equal(sha256(bytes),sha256(committed),'Candidate input matches recorded commit: ' + relative);
  }
  const originalBundle = inputBytes.get(bundlePath).toString('utf8');
  const emptySlot = 'var YOUTUBE_DATA_API_KEY = "";';
  assert.equal(originalBundle.split(emptySlot).length - 1, 1, 'Exactly one empty key slot; no key is created or reused');
  const diagnosticBundle = originalBundle.replace(emptySlot, 'var YOUTUBE_DATA_API_KEY = "' + testKey + '";');
  const originalHTML = inputBytes.get(pagePath).toString('utf8');
  const pinPattern = /(read-along\.bundle\.mjs" integrity=")[^"]+(" crossorigin="anonymous")/;
  assert.ok(pinPattern.test(originalHTML), 'Owned HTML has the expected integrity pin');
  const diagnosticHTML = originalHTML.replace(pinPattern, '$1' + sri(diagnosticBundle) + '$2');
  report.inMemoryConfigBundleSha256 = sha256(diagnosticBundle);
  report.inMemoryRepinnedHTMLSha256 = sha256(diagnosticHTML);
  report.harnessSha256 = sha256(await fs.readFile(fileURLToPath(import.meta.url)));
  server = http.createServer(async (request,response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);
      if (!pathname.startsWith(prefix)) {response.writeHead(404);response.end();return;}
      const relative = pathname.slice(prefix.length);
      if (!isPublic(relative)) {response.writeHead(404);response.end();return;}
      const filename = await fs.realpath(path.join(root,relative));
      assert.ok(filename.startsWith(root + path.sep) && !path.relative(root,filename).split(path.sep).includes('private-library'));
      const bytes = await fs.readFile(filename); report.servedHashes[relative] = sha256(bytes);
      response.writeHead(200,{'Content-Type':contentType(relative),'Cache-Control':'no-store'});response.end(bytes);
    } catch {response.writeHead(404);response.end();}
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const {chromium} = await import(process.env.GLP_PLAYWRIGHT_MODULE || 'playwright');
  const launch = {headless:true,args:['--mute-audio','--autoplay-policy=no-user-gesture-required']};
  if (process.env.GLP_CHROMIUM_EXECUTABLE) launch.executablePath = process.env.GLP_CHROMIUM_EXECUTABLE;
  else launch.channel = process.env.GLP_CHROMIUM_CHANNEL || 'chrome';
  browser = await chromium.launch(launch);
  report.browser = {version:browser.version(),headless:true,audioMuted:true,autoplayOverride:true,
    executable:process.env.GLP_CHROMIUM_EXECUTABLE || null,channel:launch.channel || null};
  context = await browser.newContext({viewport:{width:Number(process.env.GLP_YOUTUBE_VIEWPORT_WIDTH || 1280),
    height:Number(process.env.GLP_YOUTUBE_VIEWPORT_HEIGHT || 900)},serviceWorkers:'block'});
  page = await context.newPage();page.setDefaultTimeout(20000);
  report.pageErrors = [];report.failedProviderRequests = [];
  page.on('pageerror',error => report.pageErrors.push({message:error.message.replaceAll(testKey,'[TEST CONFIG]').slice(0,400),
    application:String(error.stack || '').includes(origin + prefix),
    stack:String(error.stack || '').replaceAll(testKey,'[TEST CONFIG]').replace(/https?:\/\/[^\s)]+/g,value => {
      try {const url=new URL(value);return url.origin+url.pathname;} catch{return '[URL]';}
    }).slice(0,1200)}));
  page.on('request',request => { const url = new URL(request.url());if(kindFor(url))hosts.add(url.hostname); });
  page.on('response',response => { const kind = kindFor(new URL(response.url()));if(kind && response.ok())completedProviderKinds.add(kind); });
  page.on('requestfailed',request => {const url=new URL(request.url()),kind=kindFor(url);if(kind)report.failedProviderRequests.push({kind,host:url.hostname,error:request.failure()?.errorText});});
  await page.route(origin + prefix + pagePath, route => route.fulfill({status:200,contentType:contentType(pagePath),body:diagnosticHTML}));
  await page.route(origin + prefix + bundlePath, route => route.fulfill({status:200,contentType:contentType(bundlePath),body:diagnosticBundle}));
  await page.route('https://www.googleapis.com/youtube/v3/videos**', route => {
    const url = new URL(route.request().url());
    assert.equal(url.searchParams.get('id'),video);assert.equal(url.searchParams.get('key'),testKey);
    report.metadataLookupsStubbed++;
    return route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},
      body:JSON.stringify({items:[{id:video,status:{embeddable:true,privacyStatus:'public',madeForKids:false},
        snippet:{liveBroadcastContent:'none'}}]})});
  });
  await page.goto(origin + prefix + pagePath,{waitUntil:'load'});
  await page.waitForSelector('#source-status[data-state="ready"]',{timeout:60000});
  assert.equal(await page.locator('#read-along-text [data-line-id]').count(),385);
  note('source',await page.locator('#source-status').textContent());
  await page.locator('#video-url').fill('https://www.youtube.com/watch?v=' + video);
  await page.locator('#video-load').click();
  await page.waitForFunction(() => ['ready','unavailable','refused'].includes(document.getElementById('video-status')?.dataset.state),null,{timeout:60000});
  assert.equal(await page.locator('#video-status').getAttribute('data-state'),'ready',await page.locator('#video-status').textContent());
  note('B1-native-ready',await sample());
  assert.equal(report.metadataLookupsStubbed,1);
  const sourceBeforeMarking = await page.locator('#read-along-text [data-line-id]').evaluateAll(rows => rows.slice(0,4).map(row => ({id:row.dataset.lineId,text:row.querySelector('.read-along-original')?.textContent})));
  report.markedSourceRows = sourceBeforeMarking;
  await command('mute');
  await page.locator('#timing-editor > summary').click();
  await page.locator('#teach-toggle').click();
  await page.locator('.video-card').scrollIntoViewIfNeeded();
  await command('playVideo');
  await page.waitForFunction(() => document.getElementById('player-state')?.textContent === 'Playing',null,{timeout:60000});
  await waitClock(3);
  const playing = await sample();assert.ok(playing.durationSeconds > 0,'Actual recording duration becomes available');
  note('native-playing',playing);
  const markers = [];
  for (let index=0;index<4;index++) {
    await page.locator('#teach-next').click();
    const at = Number(await page.locator('#timing-cues button').last().getAttribute('data-cue-at'));
    assert.ok(Number.isFinite(at) && (!markers.length || at > markers.at(-1).at));
    markers.push({at,row:index+1});note('mark-' + (index+1),{at,sample:await sample()});
    await waitClock(Math.ceil(at/1000) + 4);
  }
  await page.locator('#mark-pause').click();
  const end = Number(await page.locator('#timing-cues button').last().getAttribute('data-cue-at'));
  assert.ok(end > markers.at(-1).at);markers.push({at:end,row:null});report.markers = markers;
  await command('pauseVideo');
  await page.waitForFunction(() => document.getElementById('player-state')?.textContent === 'Paused');
  await page.locator('#teach-toggle').click();
  await page.evaluate(() => {
    window.__GLP_REAL_SMOKE_CLICKS = [];
    document.addEventListener('click',event => {
      const button = event.target.closest?.('#timing-cues button');if(!button)return;
      const frame=document.querySelector('#youtube-player iframe'),rect=frame?.getBoundingClientRect();
      window.__GLP_REAL_SMOKE_CLICKS.push({at:Number(button.dataset.cueAt),stage:'after synchronous application click handler',
        frame:rect ? {top:rect.top,bottom:rect.bottom,left:rect.left,right:rect.right,
          fullyVisible:rect.top>=-1&&rect.left>=-1&&rect.bottom<=innerHeight+1&&rect.right<=innerWidth+1}:null});
    });
  });
  await page.locator('.cue-details > summary').click();
  note('before-marker-jump',await sample());
  await page.locator('#timing-cues button').first().click();
  const immediate = await sample();note('L6-after-marker-click',immediate);
  const clickGeometry = await page.evaluate(() => window.__GLP_REAL_SMOKE_CLICKS);
  report.markerJumpClickGeometry = clickGeometry;
  assert.equal(clickGeometry.length,1);assert.equal(clickGeometry[0].frame?.fullyVisible,true,'Click handler reveals actual frame');
  assert.equal(immediate.frame?.fullyVisible,true,'Actual player visible after native marker click');
  await page.waitForTimeout(1200);
  const settled = await sample();note('L6-settled',settled);
  assert.equal(settled.frame?.fullyVisible,true,'Player stays visible after observer callbacks');
  assert.equal(settled.state,'Paused','Jump preserves paused state without automatic resume');
  assert.ok(Math.abs(settled.timeSeconds-markers[0].at/1000)<2,'Native seek lands near requested marker; keyframe precision is not inferred');
  await page.screenshot({path:path.join(out,'marker-jump-visible-paused.png')});
  await command('playVideo');
  await page.waitForFunction(() => document.getElementById('player-state')?.textContent === 'Playing',null,{timeout:60000});
  const samples = [], deadline=Date.now()+90000;
  let captured=false;
  while(Date.now()<deadline) {
    const current = await sample();samples.push({observedAt:new Date().toISOString(),...current});
    if(current.activeRow===3&&!captured){await page.screenshot({path:path.join(out,'real-clock-following.png')});captured=true;}
    if(current.timeSeconds >= Math.ceil(end/1000)+1)break;
    await page.waitForTimeout(200);
  }
  report.followSamples=samples;
  const firstMarked=samples.findIndex(value=>value.activeRow===1);assert.ok(firstMarked>=0,'First marked row observed');
  const followed=samples.slice(firstMarked).map(value=>value.activeRow).filter((value,index,array)=>!index||value!==array[index-1]);
  note('real-media-row-transitions',followed);report.followedRowTransitions=followed;
  assert.deepEqual(followed,[1,2,3,4,null],'Recorded marks follow real media in order and stop at text pause');
  await command('pauseVideo');
  for(const kind of ['official-iframe-sdk','nocookie-embed','streamed-media'])assert.ok(completedProviderKinds.has(kind),'Actual provider response observed: '+kind);
  assert.deepEqual(report.pageErrors,[],'No uncaught page errors during the live diagnostic');
  report.status='PASS';
} catch(error) {
  report.error=error.stack || String(error);note('failure',String(error.message||error));
  if(page){report.failureState=await sample().catch(()=>null);await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});}
} finally {
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  report.providerHosts=[...hosts].sort();report.completedProviderKinds=[...completedProviderKinds].sort();
  report.inputsUnchanged={};
  for(const [relative,bytes]of inputBytes){const same=sha256(await fs.readFile(path.join(root,relative)))===sha256(bytes);report.inputsUnchanged[relative]=same;if(!same)report.status='FAIL';}
  report.finished=new Date().toISOString();
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,sourceCommit:report.sourceCommit,providerHosts:report.providerHosts,
    metadataLookupsStubbed:report.metadataLookupsStubbed,followedRowTransitions:report.followedRowTransitions,evidence:out}));
}
if(report.status!=='PASS')process.exitCode=1;
