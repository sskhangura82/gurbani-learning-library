import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import {inspectModule} from '../tools/script-integrity/javascript.mjs';
import {APP_GRAPHS,YOUTUBE_SCRIPT_CAPABILITY} from '../tools/script-integrity/policy.mjs';
import {buildAppBundle} from '../tools/script-integrity/build.mjs';
const read = name => fs.readFile(new URL('../'+name,import.meta.url),'utf8');

test('Only the new pinned player module and generated companion admit one exact official SDK loader', async()=>{
  const file='collections/source-reader/read-along-player.mjs',code=await read(file);
  assert.equal(YOUTUBE_SCRIPT_CAPABILITY.url,'https://www.youtube.com/iframe_api');
  assert.doesNotThrow(()=>inspectModule(code,{file}));
  const built=await buildAppBundle('read-along');
  assert.equal(built.graph.externalProviderScript.url,YOUTUBE_SCRIPT_CAPABILITY.url);
  assert.doesNotThrow(()=>inspectModule(built.code,{file:built.outputPath,closed:true}));
  assert.deepEqual(inspectModule(built.code,{file:built.outputPath,closed:true}),[]);
  for(const name of ['library','knowledge','articles','hukamnama','source-reader']){
    const existing=await read(APP_GRAPHS[name].output);
    assert.throws(()=>inspectModule(existing+'\ndocument.createElement("script");',{file:APP_GRAPHS[name].output,closed:true}),/runtime script creation/);
    assert.ok(!existing.includes('https://www.youtube.com/iframe_api'));
  }
});

test('Altered, indirect, missing, reassigned and multiple provider loaders refuse',async()=>{
  const file='collections/source-reader/read-along-player.mjs',code=await read(file);
  const changes=[
    value=>value.replace("youtubeAPIScript.src = 'https://www.youtube.com/iframe_api';","youtubeAPIScript.src = 'https://example.invalid/evil.js';"),
    value=>value.replace("youtubeAPIScript.src = 'https://www.youtube.com/iframe_api';","youtubeAPIScript.src = window.untrustedScript;"),
    value=>value.replace("youtubeAPIScript.src = 'https://www.youtube.com/iframe_api';",''),
    value=>value.replace("youtubeAPIScript.src = 'https://www.youtube.com/iframe_api';","youtubeAPIScript.src = 'https://www.youtube.com/iframe_api'; youtubeAPIScript.src = window.untrustedScript;"),
    value=>value+'\ndocument.createElement("script");',
    value=>value.replace("document.createElement('script')","window.document.createElement('script')"),
    value=>value.replace("youtubeAPIScript.async = true;","youtubeAPIScript.setAttribute('src', window.untrustedScript);"),
    value=>value.replace("youtubeAPIScript.async = true;","const aliasedScript = youtubeAPIScript; aliasedScript.src = 'https://example.invalid/evil.js'; youtubeAPIScript.async = true;"),
    value=>value.replace("youtubeAPIScript.async = true;","Object.assign(youtubeAPIScript, {src: 'https://example.invalid/evil.js'}); youtubeAPIScript.async = true;"),
    value=>value.replace("youtubeAPIScript.async = true;","youtubeAPIScript = window.otherElement;")
  ];
  for(const change of changes){const changed=change(code);assert.notEqual(changed,code);assert.throws(()=>inspectModule(changed,{file}));}
  assert.throws(()=>inspectModule(code,{file:'collections/source-reader/unapproved-player.mjs'}),/runtime script creation/);
});

test('Companion provider policy is isolated; no autoplay, arbitrary frame source or weakened old HTML',async()=>{
  const html=await read('listen/index.html');
  assert.match(html,/name="referrer" content="strict-origin-when-cross-origin"/);
  assert.match(html,/https:\/\/www\.youtube\.com\/iframe_api/);
  assert.match(html,/frame-src https:\/\/www\.youtube-nocookie\.com/);
  assert.ok(!/<iframe\b/i.test(html));
  assert.ok(!/<script\b[^>]*src="https:/i.test(html));
  assert.ok(!html.includes("'unsafe-inline'")&&!html.includes("'unsafe-eval'"));
  for(const page of ['index.html','collections/sggs/index.html','collections/dasam/read.html']){
    const old=await read(page);assert.match(old,/frame-src 'none'/);assert.ok(!old.includes('iframe_api'));
  }
  // The preserved Knowledge pilot already uses default-src self as its frame
  // fallback; it never had the later readers' explicit frame-src none policy.
  const knowledge=await read('knowledge/index.html');
  assert.match(knowledge,/default-src 'self'; script-src 'self'/);
  assert.ok(!knowledge.includes('iframe_api')&&!knowledge.includes('youtube-nocookie.com'));
});
