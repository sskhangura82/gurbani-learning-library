// Synthetic provider/DOM contracts. These tests make no YouTube request and are not live playback evidence.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';

const VIDEO = 'abcdefghijk';
const OTHER = 'zyxwvutsrqp';
const READY_CONTROLS = ['getPlayerState', 'getCurrentTime', 'getDuration', 'getPlaybackRate', 'getVideoUrl', 'seekTo', 'pauseVideo'];
let importNumber = 0;
const moduleUrl = new URL('../collections/source-reader/read-along-player.mjs', import.meta.url);
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return {promise, resolve, reject}; };
const metadata = (id = VIDEO, changes = {}) => ({items: [{id,
  status: {embeddable: true, privacyStatus: 'public', madeForKids: false, ...changes.status},
  snippet: {liveBroadcastContent: 'none', ...changes.snippet}, ...changes.item}]});
const response = data => ({ok: true, json: async () => data});

class Events {
  listeners = new Map();
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(callback);
  }
  removeEventListener(type, callback) { this.listeners.get(type)?.delete(callback); }
  dispatch(type, event = {}) { for (const callback of [...(this.listeners.get(type) || [])]) callback(event); }
}

function environment(options = {}) {
  const prior = new Map();
  const globals = ['document', 'window', 'fetch', 'MutationObserver', 'IntersectionObserver', 'setTimeout', 'clearTimeout'];
  for (const name of globals) prior.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
  const timers = new Map(), mutations = new Set(), intersections = new Set();
  let timerId = 0;
  const document = new Events();
  const env = {document, nodes: [], requests: [], players: [], scriptMode: options.scriptMode || 'ready',
    readyMode: options.readyMode || 'async', missingReadyControls: options.missingReadyControls || [],
    fetcher: options.fetcher || (async url => response(metadata(new URL(url).searchParams.get('id'))))};
  function mutate() { queueMicrotask(() => { for (const observer of [...mutations]) observer.callback([]); }); }
  class Element extends Events {
    constructor(tag) {
      super(); this.tagName = tag.toUpperCase(); this.ownerDocument = document;
      this.children = []; this.parentNode = null; this.id = '';
      env.nodes.push(this);
    }
    get isConnected() { return this === document.documentElement || Boolean(this.parentNode?.isConnected); }
    contains(node) { for (let current = node; current; current = current.parentNode) if (current === this) return true; return false; }
    append(node) {
      node.remove(); this.children.push(node); node.parentNode = this; mutate();
      if (node.tagName === 'SCRIPT') {
        assert.equal(node.src, 'https://www.youtube.com/iframe_api');
        env.requests.push({type: 'script', url: node.src});
        if (env.scriptMode === 'error') node.dispatch('error');
        else if (env.scriptMode === 'ready') env.deliverSDK();
      }
      if (node.tagName === 'IFRAME') env.requests.push({type: 'iframe', url: node.src});
    }
    replaceChildren(...nodes) { for (const node of [...this.children]) node.remove(); for (const node of nodes) this.append(node); }
    remove() {
      if (!this.parentNode) return;
      this.parentNode.children = this.parentNode.children.filter(child => child !== this);
      this.parentNode = null; mutate();
    }
  }
  document.createElement = tag => new Element(tag);
  document.documentElement = new Element('html');
  document.head = new Element('head'); document.body = new Element('body');
  document.documentElement.append(document.head); document.documentElement.append(document.body);
  document.hidden = false;
  const window = new Events(); window.location = new URL('https://gurbani.example/collections/read-along/index.html');
  env.window = window;
  const stub = function (frame, {events}) {
    this.frame = frame; this.events = events; this.id = new URL(frame.src).pathname.split('/').at(-1);
    this.time = 0; this.duration = 600; this.state = 5; this.rate = 1;
    this.pauseCalls = 0; this.destroyCalls = 0; this.seekCalls = [];
    let controlsAttached = false;
    const controls = {
      getPlayerState: () => this.state,
      getCurrentTime: () => this.time,
      getDuration: () => this.duration,
      getPlaybackRate: () => this.rate,
      getVideoUrl: () => `https://www.youtube.com/watch?v=${this.id}`,
      pauseVideo: () => { this.pauseCalls++; if (this.state !== 0) this.event('onStateChange', 2); },
      seekTo: (seconds, allowSeekAhead) => {
        this.seekCalls.push([seconds, allowSeekAhead]);
        this.time = this.seekLanding ?? seconds;
        this.event('onStateChange', this.state === 2 ? 2 : 1);
      }
    };
    this.event = (name, data) => {
      // The real IFrame SDK exposes playback/clock controls only when ready.
      // Constructor availability must never make the synthetic player stronger.
      if (name === 'onReady' && !controlsAttached) {
        controlsAttached = true;
        for (const [method, callback] of Object.entries(controls)) {
          if (!env.missingReadyControls.includes(method)) this[method] = callback;
        }
      }
      if (name === 'onStateChange') this.state = data;
      if (name === 'onPlaybackRateChange') this.rate = data;
      events[name]?.({target: this, data});
    };
    this.destroy = () => { this.destroyCalls++; frame.remove(); };
    env.players.push(this);
    if (env.readyMode === 'throw') throw new Error('Synthetic constructor failure');
    if (env.readyMode === 'error') this.event('onError', 153);
    if (env.readyMode === 'sync') this.event('onReady');
    if (env.readyMode === 'async') queueMicrotask(() => this.event('onReady'));
  };
  env.deliverSDK = () => { window.YT = {Player: stub}; window.onYouTubeIframeAPIReady?.(); };
  env.mount = () => { const mount = new Element('div'); document.body.append(mount); return mount; };
  env.tick = ms => {
    for (const [id, timer] of [...timers]) if (timer.ms === ms && timers.has(id)) { timers.delete(id); timer.callback(); }
  };
  env.pending = ms => [...timers.values()].filter(timer => timer.ms === ms).length;
  env.hide = () => { document.hidden = true; document.dispatch('visibilitychange'); };
  env.show = () => { document.hidden = false; document.dispatch('visibilitychange'); };
  env.outOfView = frame => { for (const observer of intersections) observer.callback([{target: frame, isIntersecting: false}]); };
  const replacements = {
    document, window,
    fetch: async (url, init) => { env.requests.push({type: 'fetch', url, init}); return env.fetcher(url, init); },
    MutationObserver: class {
      constructor(callback) { this.callback = callback; }
      observe() { mutations.add(this); }
      disconnect() { mutations.delete(this); }
    },
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; }
      observe() { intersections.add(this); }
      disconnect() { intersections.delete(this); }
    },
    setTimeout: (callback, ms) => { const id = ++timerId; timers.set(id, {callback, ms}); return id; },
    clearTimeout: id => timers.delete(id)
  };
  for (const [name, value] of Object.entries(replacements)) Object.defineProperty(globalThis, name, {configurable: true, writable: true, value});
  env.restore = () => {
    document.hidden = true; window.dispatch('pagehide');
    for (const name of globals) {
      const descriptor = prior.get(name);
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
    }
  };
  return env;
}

async function fixture(t, options) {
  const env = environment(options);
  t.after(() => env.restore());
  env.api = await import(`${moduleUrl.href}?synthetic=${++importNumber}`);
  return env;
}

test('Module import and an empty default key make zero provider requests or frames', async t => {
  const env = await fixture(t), errors = [];
  assert.deepEqual(env.requests, []);
  await assert.rejects(env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, onError: error => errors.push(error)}), {code: 'YOUTUBE_NOT_CONFIGURED'});
  await assert.rejects(env.api.checkVideo(VIDEO), {code: 'YOUTUBE_NOT_CONFIGURED'});
  assert.deepEqual(env.requests, []);
  assert.equal(env.nodes.some(node => ['SCRIPT', 'IFRAME'].includes(node.tagName)), false);
  assert.equal(errors[0].code, 'YOUTUBE_NOT_CONFIGURED');
});

test('Preflight asks only for required official status/live fields and keeps response memory-only', async t => {
  const env = await fixture(t);
  const checked = await env.api.checkVideo(VIDEO, {apiKey: 'synthetic-browser-key'});
  assert.deepEqual(checked, {videoId: VIDEO, madeForKids: false, embeddable: true, privacyStatus: 'public', liveBroadcastContent: 'none'});
  assert.ok(Object.isFrozen(checked));
  assert.equal(env.requests.length, 1);
  const {url, init} = env.requests[0], parsed = new URL(url);
  assert.equal(parsed.origin + parsed.pathname, 'https://www.googleapis.com/youtube/v3/videos');
  assert.equal(parsed.searchParams.get('part'), 'id,status,snippet');
  assert.equal(parsed.searchParams.get('fields'), 'items(id,status(embeddable,privacyStatus,madeForKids),snippet(liveBroadcastContent))');
  assert.equal(parsed.searchParams.get('id'), VIDEO);
  assert.equal(init.credentials, 'omit'); assert.equal(init.cache, 'no-store'); assert.equal(init.redirect, 'error');
  assert.equal(init.referrerPolicy, 'strict-origin-when-cross-origin');
  env.fetcher = async () => response(metadata(VIDEO, {status: {madeForKids: true, privacyStatus: 'unlisted'}}));
  assert.equal((await env.api.checkVideo(VIDEO, {apiKey: 'synthetic-browser-key'})).madeForKids, true);
  assert.equal(env.nodes.some(node => node.tagName === 'SCRIPT'), false);
});

test('Preflight rejects ambiguous status, wrong IDs, private/non-embeddable and live recordings before loading a player', async t => {
  const env = await fixture(t);
  const cases = [
    [{items: []}, 'YOUTUBE_VIDEO_UNAVAILABLE'],
    [{items: [...metadata().items, ...metadata().items]}, 'YOUTUBE_VIDEO_UNAVAILABLE'],
    [metadata(OTHER), 'YOUTUBE_VIDEO_UNAVAILABLE'],
    [metadata(VIDEO, {status: {madeForKids: undefined}}), 'YOUTUBE_STATUS_UNKNOWN'],
    [metadata(VIDEO, {status: {madeForKids: 'false'}}), 'YOUTUBE_STATUS_UNKNOWN'],
    [metadata(VIDEO, {status: {embeddable: undefined}}), 'YOUTUBE_STATUS_UNKNOWN'],
    [metadata(VIDEO, {status: {embeddable: false}}), 'YOUTUBE_EMBED_DISABLED'],
    [metadata(VIDEO, {status: {privacyStatus: 'private'}}), 'YOUTUBE_VIDEO_UNAVAILABLE'],
    [metadata(VIDEO, {snippet: {liveBroadcastContent: 'live'}}), 'YOUTUBE_LIVE_UNSUPPORTED'],
    [metadata(VIDEO, {snippet: {liveBroadcastContent: 'upcoming'}}), 'YOUTUBE_LIVE_UNSUPPORTED'],
    [metadata(VIDEO, {snippet: {liveBroadcastContent: undefined}}), 'YOUTUBE_LIVE_UNSUPPORTED']
  ];
  for (const [body, code] of cases) {
    env.fetcher = async () => response(body);
    await assert.rejects(env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key'}), {code});
  }
  assert.ok(env.requests.every(request => request.type === 'fetch'));
  assert.equal(env.players.length, 0);
});

test('Bad identifiers and invalid configuration fail before a fetch; provider error bodies never leak a key', async t => {
  const env = await fixture(t);
  for (const videoId of ['short', `${VIDEO}/embed`, 'https://youtube.com/watch?v=abcdefghijk', '<script>x</script>']) {
    await assert.rejects(env.api.checkVideo(videoId, {apiKey: 'fixture-key'}), {code: 'YOUTUBE_VIDEO_ID'});
  }
  await assert.rejects(env.api.checkVideo(VIDEO, {apiKey: 'bad key'}), {code: 'YOUTUBE_CONFIGURATION'});
  assert.deepEqual(env.requests, []);
  env.fetcher = async () => { throw new Error('Sensitive fixture-key provider URL'); };
  await assert.rejects(env.api.checkVideo(VIDEO, {apiKey: 'fixture-key'}), error => error.code === 'YOUTUBE_CHECK_FAILED' && !error.message.includes('fixture-key'));
  env.fetcher = async () => ({ok: false, status: 403, json: () => { throw new Error('Must not read provider error body'); }});
  await assert.rejects(env.api.checkVideo(VIDEO, {apiKey: 'fixture-key'}), {code: 'YOUTUBE_CHECK_FAILED'});
  assert.equal(env.players.length, 0);
});

test('Metadata timeout settles even when the transport ignores abort', async t => {
  const env = await fixture(t, {fetcher: () => new Promise(() => {})});
  const result = assert.rejects(env.api.checkVideo(VIDEO, {apiKey: 'fixture-key'}), {code: 'YOUTUBE_CHECK_TIMEOUT'});
  env.tick(10000); await result;
  assert.equal(env.requests[0].init.signal.aborted, true);
  assert.equal(env.players.length, 0);
});

test('Successful creation orders preflight, official loader and privacy-enhanced iframe; synchronous ready is safe', async t => {
  const env = await fixture(t, {readyMode: 'sync'}), updates = [];
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onUpdate: value => updates.push(value)});
  assert.deepEqual(env.requests.map(request => request.type), ['fetch', 'script', 'iframe']);
  const frame = env.players[0].frame, url = new URL(frame.src);
  assert.equal(url.origin, 'https://www.youtube-nocookie.com'); assert.equal(url.pathname, `/embed/${VIDEO}`);
  assert.deepEqual(Object.fromEntries(url.searchParams), {enablejsapi: '1', origin: 'https://gurbani.example', autoplay: '0', controls: '1', playsinline: '1'});
  assert.ok(Number(frame.height) >= 200); assert.equal(frame.referrerPolicy, 'strict-origin-when-cross-origin');
  assert.equal(updates[0].ready, true); assert.equal(updates[0].state, 'cued'); assert.ok(Object.isFrozen(updates[0]));
  assert.equal(controller.snapshot().videoId, VIDEO);
  assert.equal(env.pending(250), 1);
  controller.destroy();
  assert.equal(env.pending(250), 0); assert.equal(frame.isConnected, false);
});

test('Delayed ready accepts a cleanup-only constructor and waits for controls without rejecting a zero duration', async t => {
  const env = await fixture(t, {readyMode: 'later'}), updates = [], errors = [];
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key',
    onUpdate: value => updates.push(value), onError: error => errors.push(error)});
  const player = env.players[0];
  assert.equal(typeof player.destroy, 'function');
  for (const method of READY_CONTROLS) assert.equal(typeof player[method], 'undefined', `${method} must wait for ready`);
  assert.equal(controller.snapshot().ready, false); assert.equal(controller.seek(2), false);
  assert.equal(player.frame.isConnected, true); assert.equal(env.pending(250), 0); assert.equal(env.pending(15000), 1);
  player.events.onReady({target: {}});
  assert.equal(controller.snapshot().ready, false); assert.deepEqual(updates, []); assert.deepEqual(errors, []);
  player.duration = 0;
  player.event('onReady');
  assert.equal(controller.snapshot().ready, true); assert.equal(controller.snapshot().durationSeconds, 0);
  assert.equal(player.pauseCalls, 0, 'ready does not start or pause a visible recording');
  assert.equal(env.pending(15000), 0); assert.equal(env.pending(250), 1); assert.deepEqual(errors, []);
  player.duration = 600; player.time = 7.25; player.event('onStateChange', 1);
  assert.equal(updates.at(-1).timeSeconds, 7.25); assert.equal(updates.at(-1).state, 'playing');
  controller.destroy();
});

test('An incomplete asynchronous ready reports once and removes its iframe without consumer cleanup', async t => {
  const env = await fixture(t, {readyMode: 'later'}), mount = env.mount();
  for (const missing of READY_CONTROLS) {
    env.missingReadyControls = [missing];
    const errors = [], updates = [];
    const controller = await env.api.createYouTubePlayer({mount, videoId: VIDEO, apiKey: 'fixture-key',
      onUpdate: value => updates.push(value), onError: error => errors.push(error)});
    const player = env.players.at(-1);
    assert.doesNotThrow(() => player.event('onReady'), `missing ${missing} must not throw from an async event`);
    assert.deepEqual(errors.map(error => error.code), ['YOUTUBE_PLAYER_INVALID'], missing);
    assert.equal(controller.snapshot().state, 'error'); assert.equal(controller.snapshot().ready, false);
    assert.equal(player.frame.isConnected, false); assert.equal(player.destroyCalls, 1);
    assert.equal(env.pending(15000), 0); assert.equal(env.pending(250), 0);
    const count = updates.length;
    player.event('onReady'); player.event('onStateChange', 1); player.event('onError', 153);
    assert.equal(updates.length, count); assert.equal(errors.length, 1); assert.equal(player.destroyCalls, 1);
  }
  env.missingReadyControls = [];
  const retry = await env.api.createYouTubePlayer({mount, videoId: VIDEO, apiKey: 'fixture-key'});
  env.players.at(-1).event('onReady');
  assert.equal(retry.snapshot().ready, true); retry.destroy();
});

test('An incomplete constructor-synchronous ready rejects as invalid and cleans up once', async t => {
  const env = await fixture(t, {readyMode: 'sync', missingReadyControls: ['seekTo']}), errors = [];
  await assert.rejects(env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key',
    onError: error => errors.push(error)}), {code: 'YOUTUBE_PLAYER_INVALID'});
  assert.deepEqual(errors.map(error => error.code), ['YOUTUBE_PLAYER_INVALID']);
  assert.equal(env.players[0].frame.isConnected, false); assert.equal(env.players[0].destroyCalls, 1);
  assert.equal(env.pending(15000), 0); assert.equal(env.pending(250), 0);
});

test('Closing or replacing a player before ready prevents late controls from reviving it', async t => {
  const env = await fixture(t, {readyMode: 'later'}), mount = env.mount(), updates = [], errors = [];
  const closed = await env.api.createYouTubePlayer({mount, videoId: VIDEO, apiKey: 'fixture-key',
    onUpdate: value => updates.push(value), onError: error => errors.push(error)});
  const closedPlayer = env.players[0]; closed.destroy();
  closedPlayer.event('onReady'); closedPlayer.event('onStateChange', 1);
  assert.equal(closed.snapshot().ready, false); assert.equal(closedPlayer.frame.isConnected, false);
  assert.equal(closedPlayer.destroyCalls, 1); assert.equal(env.pending(15000), 0); assert.equal(env.pending(250), 0);
  const old = await env.api.createYouTubePlayer({mount, videoId: VIDEO, apiKey: 'fixture-key',
    onUpdate: value => updates.push(value), onError: error => errors.push(error)});
  const oldPlayer = env.players[1];
  const active = await env.api.createYouTubePlayer({mount, videoId: OTHER, apiKey: 'fixture-key'});
  oldPlayer.event('onReady'); oldPlayer.event('onStateChange', 1); oldPlayer.event('onError', 153); old.destroy();
  assert.equal(oldPlayer.frame.isConnected, false); assert.equal(oldPlayer.destroyCalls, 1);
  assert.equal(env.players[2].frame.isConnected, true); assert.equal(active.snapshot().ready, false);
  assert.deepEqual(updates, []); assert.deepEqual(errors, []); assert.equal(env.pending(250), 0);
  env.players[2].event('onReady');
  assert.equal(active.snapshot().ready, true); assert.equal(active.snapshot().videoId, OTHER);
  assert.equal(env.pending(15000), 0); assert.equal(env.pending(250), 1); active.destroy();
});

test('Following uses actual media time through pause, rate, buffering and native paused seeks', async t => {
  const env = await fixture(t), updates = [];
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onUpdate: value => updates.push(value)});
  const player = env.players[0];
  player.time = 12.5; player.event('onStateChange', 1);
  player.event('onPlaybackRateChange', 2);
  env.tick(250);
  assert.equal(updates.at(-1).timeSeconds, 12.5, 'no wall-clock extrapolation or double rate multiplication');
  assert.equal(updates.at(-1).rate, 2);
  player.time = 14; player.event('onStateChange', 3);
  assert.equal(updates.at(-1).state, 'buffering'); assert.equal(updates.at(-1).timeSeconds, 14);
  controller.pause(); assert.equal(controller.snapshot().state, 'paused');
  player.time = 44; env.tick(250);
  assert.equal(updates.at(-1).timeSeconds, 44, 'paused native seek with no state event is observed');
  player.seekLanding = 48.2;
  assert.equal(controller.seek(50), true);
  assert.deepEqual(player.seekCalls, [[50, true]]);
  assert.equal(controller.snapshot().timeSeconds, 48.2, 'reported keyframe landing wins over requested time');
  assert.equal(controller.snapshot().state, 'paused');
  controller.destroy();
});

test('Hidden pages and out-of-view players pause; showing the page never starts playback', async t => {
  const env = await fixture(t);
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key'});
  const player = env.players[0]; player.event('onStateChange', 1);
  env.hide(); assert.equal(player.state, 2); assert.equal(env.pending(250), 0);
  env.show(); assert.equal(player.state, 2); assert.equal(env.pending(250), 1);
  player.event('onStateChange', 1); env.outOfView(player.frame); assert.equal(player.state, 2);
  env.window.dispatch('pagehide');
  assert.equal(player.destroyCalls, 1); assert.equal(controller.snapshot().ready, false);
});

test('Pending async ready is paused if the page hides before it fires, and errors from an unrelated target are ignored', async t => {
  const env = await fixture(t, {readyMode: 'later'}), errors = [];
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)});
  assert.equal(controller.snapshot().ready, false);
  const player = env.players[0];
  player.events.onError({target: {}, data: 100}); assert.deepEqual(errors, []);
  env.hide(); player.event('onReady');
  assert.equal(player.state, 2); assert.equal(env.pending(250), 0);
  controller.destroy();
});

test('A failed pause closes its iframe even when provider cleanup methods throw', async t => {
  const env = await fixture(t), errors = [];
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)});
  const player = env.players[0]; player.event('onStateChange', 1);
  player.pauseVideo = () => { throw new Error('Synthetic pause failure'); };
  player.destroy = () => { throw new Error('Synthetic destroy failure'); };
  env.hide();
  assert.equal(player.frame.isConnected, false);
  assert.equal(errors.at(-1).code, 'YOUTUBE_PAUSE_FAILED');
  assert.equal(controller.snapshot().state, 'error');
  assert.equal(env.pending(250), 0);
});

test('Disconnect during preflight cancels without a script, frame or stale error callback', async t => {
  const pending = deferred(), env = await fixture(t, {fetcher: () => pending.promise}), errors = [];
  const mount = env.mount();
  const result = assert.rejects(env.api.createYouTubePlayer({mount, videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)}), {code: 'YOUTUBE_CANCELLED'});
  mount.remove(); await flush(); await result;
  pending.resolve(response(metadata())); await flush();
  assert.deepEqual(errors, []); assert.deepEqual(env.requests.map(request => request.type), ['fetch']);
});

test('Disconnect while the SDK is pending cannot create a late hidden player', async t => {
  const env = await fixture(t, {scriptMode: 'hold'}), mount = env.mount(), errors = [];
  const result = assert.rejects(env.api.createYouTubePlayer({mount, videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)}), {code: 'YOUTUBE_CANCELLED'});
  await flush(); assert.equal(env.requests.at(-1).type, 'script');
  mount.remove(); await flush(); await result;
  env.deliverSDK(); await flush();
  assert.equal(env.players.length, 0); assert.deepEqual(errors, []);
});

test('A same-mount replacement cancels the old preflight and old destruction cannot remove the new player', async t => {
  const pending = deferred();
  const env = await fixture(t, {fetcher: url => new URL(url).searchParams.get('id') === VIDEO ? pending.promise : Promise.resolve(response(metadata(OTHER)))});
  const mount = env.mount(), errors = [];
  const result = assert.rejects(env.api.createYouTubePlayer({mount, videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)}), {code: 'YOUTUBE_CANCELLED'});
  const active = await env.api.createYouTubePlayer({mount, videoId: OTHER, apiKey: 'fixture-key'});
  await result; pending.resolve(response(metadata())); await flush();
  assert.equal(env.players.length, 1); assert.equal(active.snapshot().videoId, OTHER);
  assert.equal(env.players[0].frame.isConnected, true); assert.deepEqual(errors, []);
  active.destroy();
});

test('Late events from a destroyed player cannot change updates or clear a new mount', async t => {
  const env = await fixture(t), updates = [], errors = [];
  const oldMount = env.mount();
  const old = await env.api.createYouTubePlayer({mount: oldMount, videoId: VIDEO, apiKey: 'fixture-key', onUpdate: value => updates.push(value), onError: error => errors.push(error)});
  const oldPlayer = env.players[0]; oldMount.remove(); await flush();
  const active = await env.api.createYouTubePlayer({mount: env.mount(), videoId: OTHER, apiKey: 'fixture-key'});
  const count = updates.length;
  oldPlayer.event('onReady'); oldPlayer.event('onStateChange', 1); oldPlayer.event('onError', 153); old.destroy();
  assert.equal(updates.length, count); assert.deepEqual(errors, []);
  assert.equal(active.snapshot().videoId, OTHER); assert.equal(env.players[1].frame.isConnected, true);
  assert.equal(env.requests.filter(request => request.type === 'script').length, 1, 'official loader is shared');
  active.destroy();
});

test('Synchronous consumer replacement during onReady cannot resurrect the old player', async t => {
  const env = await fixture(t, {readyMode: 'sync'}), mount = env.mount(); let next;
  await assert.rejects(env.api.createYouTubePlayer({mount, videoId: VIDEO, apiKey: 'fixture-key', onUpdate() {
    if (!next) next = env.api.createYouTubePlayer({mount, videoId: OTHER, apiKey: 'fixture-key'});
  }}), {code: 'YOUTUBE_CANCELLED'});
  const active = await next;
  assert.equal(env.players[0].destroyCalls, 1); assert.equal(env.players[0].frame.isConnected, false);
  assert.equal(active.snapshot().videoId, OTHER); assert.equal(env.players[1].frame.isConnected, true);
  active.destroy();
});

test('SDK error and timeout report explicit failure and support a later deliberate retry', async t => {
  const env = await fixture(t, {scriptMode: 'error'}), errors = [];
  await assert.rejects(env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)}), {code: 'YOUTUBE_API_LOAD_FAILED'});
  assert.equal(errors.length, 1); assert.equal(env.players.length, 0);
  env.scriptMode = 'hold';
  const timeout = assert.rejects(env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key'}), {code: 'YOUTUBE_API_TIMEOUT'});
  await flush(); env.tick(15000); await timeout;
  env.scriptMode = 'ready';
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key'});
  assert.equal(controller.snapshot().ready, true); controller.destroy();
});

test('Constructor error, synchronous player error and readiness timeout all settle visibly', async t => {
  const env = await fixture(t, {readyMode: 'throw'}), errors = [];
  await assert.rejects(env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)}), {code: 'YOUTUBE_PLAYER_FAILED'});
  assert.equal(env.players[0].frame.isConnected, false);
  env.readyMode = 'error';
  await assert.rejects(env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)}), {code: 'YOUTUBE_PLAYER_153'});
  env.readyMode = 'later';
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)});
  env.tick(15000);
  assert.equal(controller.snapshot().state, 'error'); assert.equal(errors.at(-1).code, 'YOUTUBE_PLAYER_TIMEOUT');
  assert.equal(env.pending(250), 0);
  const count = errors.length;
  env.players.at(-1).event('onReady'); env.players.at(-1).event('onStateChange', 1);
  assert.equal(controller.snapshot().ready, false); assert.equal(controller.snapshot().state, 'error');
  assert.equal(errors.length, count); assert.equal(env.pending(250), 0); controller.destroy();
});

test('Playback errors clear ready/clock, while autoplay blocking allows a later native Play recovery', async t => {
  const env = await fixture(t), errors = [];
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)});
  const player = env.players[0];
  player.event('onAutoplayBlocked'); assert.equal(errors.at(-1).code, 'YOUTUBE_PLAYBACK_BLOCKED');
  player.time = 10; player.event('onStateChange', 1);
  assert.equal(controller.snapshot().state, 'playing'); assert.equal(controller.snapshot().timeSeconds, 10);
  player.event('onError', 100);
  assert.equal(errors.at(-1).code, 'YOUTUBE_PLAYER_100');
  assert.equal(controller.snapshot().ready, false); assert.equal(controller.snapshot().state, 'error');
  assert.equal(controller.snapshot().timeSeconds, 0); assert.equal(env.pending(250), 0);
  controller.destroy();
});

test('Native related-video navigation stops old-text association without hiding native player UI', async t => {
  const env = await fixture(t), errors = [], updates = [];
  const controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error), onUpdate: value => updates.push(value)});
  const player = env.players[0]; player.id = OTHER; player.event('onStateChange', 1);
  assert.equal(errors.at(-1).code, 'YOUTUBE_RECORDING_CHANGED');
  assert.deepEqual({...updates.at(-1)}, {ready: false, videoId: OTHER, timeSeconds: 0, durationSeconds: 0, state: 'error', rate: 1});
  assert.equal(player.pauseCalls, 0); assert.equal(player.frame.isConnected, true);
  assert.equal(env.pending(250), 0);
  env.hide(); assert.equal(player.pauseCalls, 1, 'a recording mismatch cannot become hidden/background playback');
  controller.destroy();
});

test('Non-finite clocks and invalid seek targets cannot produce apparently aligned time', async t => {
  const env = await fixture(t), errors = [];
  let controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)});
  env.players[0].time = NaN; env.tick(250);
  assert.equal(errors.at(-1).code, 'YOUTUBE_CLOCK_UNAVAILABLE'); assert.equal(controller.snapshot().state, 'error');
  controller.destroy();
  controller = await env.api.createYouTubePlayer({mount: env.mount(), videoId: VIDEO, apiKey: 'fixture-key', onError: error => errors.push(error)});
  assert.equal(controller.seek(900), false); assert.equal(errors.at(-1).code, 'YOUTUBE_SEEK_INVALID');
  assert.deepEqual(env.players[1].seekCalls, []); controller.destroy();
});

test('Loader has one explicit external script capability and no persistence/media extraction calls', async () => {
  const source = await fs.readFile(moduleUrl, 'utf8');
  assert.equal((source.match(/document\.createElement\('script'\)/g) || []).length, 1);
  assert.equal((source.match(/youtubeAPIScript\.src = 'https:\/\/www\.youtube\.com\/iframe_api'/g) || []).length, 1);
  assert.doesNotMatch(source, /localStorage|sessionStorage|indexedDB|caches\.|getVideoData|timedtext|captureStream|AudioContext|XMLHttpRequest/);
  const config = await fs.readFile(new URL('../collections/source-reader/read-along-config.mjs', import.meta.url), 'utf8');
  assert.match(config, /export const YOUTUBE_DATA_API_KEY = '';/);
});
