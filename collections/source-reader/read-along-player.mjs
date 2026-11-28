// Optional external provider. Nothing contacts YouTube until createYouTubePlayer is called.
import {YOUTUBE_DATA_API_KEY} from './read-along-config.mjs';

const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const STATES = Object.freeze({'-1': 'unstarted', 0: 'ended', 1: 'playing', 2: 'paused', 3: 'buffering', 5: 'cued'});
const CHECK_TIMEOUT_MS = 10000;
const PLAYER_TIMEOUT_MS = 15000;
const POLL_MS = 250;
const mounts = new WeakMap();
let apiPromise = null;
let nextPlayerId = 0;

function problem(code, message) {
  return Object.assign(new Error(message), {code});
}

function cancelled() {
  return problem('YOUTUBE_CANCELLED', 'This player request has been closed or replaced.');
}

function validateRequest(videoId, apiKey) {
  if (typeof videoId !== 'string' || !VIDEO_ID.test(videoId)) {
    throw problem('YOUTUBE_VIDEO_ID', 'Choose a link to one YouTube recording.');
  }
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    throw problem('YOUTUBE_NOT_CONFIGURED', 'YouTube playback is not configured for this build. You can open the recording on YouTube.');
  }
  if (apiKey.length > 256 || /\s/.test(apiKey)) {
    throw problem('YOUTUBE_CONFIGURATION', 'The YouTube provider configuration is invalid.');
  }
}

function abortable(promise, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => reject(cancelled());
    if (signal.aborted) { reject(cancelled()); return; }
    signal.addEventListener('abort', abort, {once: true});
    Promise.resolve(promise).then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

async function readVideo(videoId, {apiKey, fetcher}, outerSignal) {
  validateRequest(videoId, apiKey);
  if (typeof fetcher !== 'function') throw problem('YOUTUBE_CHECK_FAILED', 'The video status check is unavailable in this browser.');
  const abortController = new AbortController();
  let timedOut = false;
  const abort = () => abortController.abort();
  if (outerSignal?.aborted) throw cancelled();
  outerSignal?.addEventListener('abort', abort, {once: true});
  const timeout = setTimeout(() => { timedOut = true; abortController.abort(); }, CHECK_TIMEOUT_MS);
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'id,status,snippet');
  url.searchParams.set('id', videoId);
  url.searchParams.set('fields', 'items(id,status(embeddable,privacyStatus,madeForKids),snippet(liveBroadcastContent))');
  url.searchParams.set('key', apiKey);
  try {
    const response = await abortable(fetcher(url.href, {
      method: 'GET', credentials: 'omit', cache: 'no-store', redirect: 'error',
      referrerPolicy: 'strict-origin-when-cross-origin', signal: abortController.signal
    }), abortController.signal);
    if (!response?.ok) throw problem('YOUTUBE_CHECK_FAILED', 'YouTube could not verify this recording. Check the provider configuration or open it on YouTube.');
    const data = await abortable(response.json(), abortController.signal);
    if (!Array.isArray(data?.items) || data.items.length !== 1 || data.items[0]?.id !== videoId) {
      throw problem('YOUTUBE_VIDEO_UNAVAILABLE', 'This recording could not be found or is unavailable for this player.');
    }
    const {status, snippet} = data.items[0];
    if (typeof status?.madeForKids !== 'boolean' || typeof status?.embeddable !== 'boolean'
      || !['public', 'unlisted', 'private'].includes(status?.privacyStatus)) {
      throw problem('YOUTUBE_STATUS_UNKNOWN', 'YouTube did not return the required recording status. Playback has not been enabled.');
    }
    if (!status.embeddable) throw problem('YOUTUBE_EMBED_DISABLED', 'The recording owner does not allow embedded playback. Open it on YouTube.');
    if (!['public', 'unlisted'].includes(status.privacyStatus)) {
      throw problem('YOUTUBE_VIDEO_UNAVAILABLE', 'This recording is not available for public embedded playback.');
    }
    if (snippet?.liveBroadcastContent !== 'none') {
      throw problem('YOUTUBE_LIVE_UNSUPPORTED', 'Read along currently supports fixed recordings. A live or unverified timeline cannot be aligned here.');
    }
    // No title, thumbnail, statistics, caption, user identifier or provider cache.
    return Object.freeze({videoId, madeForKids: status.madeForKids, embeddable: true,
      privacyStatus: status.privacyStatus, liveBroadcastContent: 'none'});
  } catch (error) {
    if (timedOut) throw problem('YOUTUBE_CHECK_TIMEOUT', 'The YouTube status check timed out. Try connecting again.');
    if (outerSignal?.aborted) throw cancelled();
    if (typeof error?.code === 'string' && error.code.startsWith('YOUTUBE_')) throw error;
    throw problem('YOUTUBE_CHECK_FAILED', 'The YouTube status check failed. No player has been loaded.');
  } finally {
    clearTimeout(timeout);
    outerSignal?.removeEventListener('abort', abort);
  }
}

export async function checkVideo(videoId, {apiKey = YOUTUBE_DATA_API_KEY, fetcher = fetch} = {}) {
  return readVideo(videoId, {apiKey, fetcher});
}

function loadYouTubeApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    let settled = false;
    const previousReady = window.onYouTubeIframeAPIReady;
    const youtubeAPIScript = document.createElement('script');
    youtubeAPIScript.src = 'https://www.youtube.com/iframe_api';
    youtubeAPIScript.async = true;
    youtubeAPIScript.referrerPolicy = 'strict-origin-when-cross-origin';
    const finish = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      youtubeAPIScript.removeEventListener('error', failed);
      youtubeAPIScript.removeEventListener('load', loaded);
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previousReady;
      if (error) { youtubeAPIScript.remove(); reject(error); }
      else resolve(window.YT);
    };
    const failed = () => finish(problem('YOUTUBE_API_LOAD_FAILED', 'The YouTube player could not load. Open the recording on YouTube or try again.'));
    const loaded = () => { if (typeof window.YT?.Player === 'function') finish(); };
    const ready = () => {
      if (typeof previousReady === 'function') {
        try { previousReady(); } catch { /* An unrelated listener cannot prevent this request settling. */ }
      }
      if (typeof window.YT?.Player === 'function') finish();
      else failed();
    };
    const timeout = setTimeout(() => finish(problem('YOUTUBE_API_TIMEOUT', 'The YouTube player did not become available. Try connecting again.')), PLAYER_TIMEOUT_MS);
    window.onYouTubeIframeAPIReady = ready;
    youtubeAPIScript.addEventListener('error', failed, {once: true});
    youtubeAPIScript.addEventListener('load', loaded);
    try { document.head.append(youtubeAPIScript); } catch { failed(); }
  }).catch(error => { apiPromise = null; throw error; });
  return apiPromise;
}

function videoFromPlayerUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)
      || url.pathname !== '/watch') return null;
    const id = url.searchParams.get('v');
    return VIDEO_ID.test(id ?? '') ? id : null;
  } catch { return null; }
}

export async function createYouTubePlayer({mount, videoId, onUpdate, onError, apiKey = YOUTUBE_DATA_API_KEY}) {
  let controller = null;
  let reported = null;
  const notifyError = error => {
    if (reported === error.code || error.code === 'YOUTUBE_CANCELLED') return;
    reported = error.code;
    if (typeof onError === 'function') {
      try { onError(Object.freeze({code: error.code, message: error.message})); } catch { /* Error state is retained even if the consumer throws. */ }
    }
  };
  try {
    validateRequest(videoId, apiKey);
    if (!mount?.isConnected || mount.ownerDocument !== document || typeof mount.replaceChildren !== 'function'
      || !['http:', 'https:'].includes(window.location.protocol) || window.location.origin === 'null') {
      throw problem('YOUTUBE_CONTEXT', 'The player needs a connected page served from a valid web origin.');
    }
    mounts.get(mount)?.destroy();
    const holder = document.createElement('div');
    holder.className = 'read-along-player-host';
    const abortController = new AbortController();
    let player = null, destroyed = false, ready = false, constructing = false, reading = false;
    let polling = null, readyTimeout = null, failure = null, pauseOnReady = false;
    let observer = null, visibilityObserver = null;
    let pendingEvents = [];
    let current = Object.freeze({ready: false, videoId, timeSeconds: 0, durationSeconds: 0, state: 'unstarted', rate: 1});
    const isCurrent = () => !destroyed && mounts.get(mount) === controller && mount.isConnected && holder.isConnected && mount.contains(holder);
    const stopPolling = () => { clearTimeout(polling); polling = null; };
    const emit = () => {
      if (!isCurrent() || typeof onUpdate !== 'function') return;
      try { onUpdate(current); }
      catch { fail(problem('YOUTUBE_UPDATE_FAILED', 'The reading display could not receive the player update. Reconnect to continue.')); }
    };
    const fail = (error, {pausePlayer = true, actualId = videoId} = {}) => {
      if (!isCurrent() || failure) return;
      failure = error;
      ready = false;
      clearTimeout(readyTimeout);
      stopPolling();
      current = Object.freeze({ready: false, videoId: actualId, timeSeconds: 0, durationSeconds: 0, state: 'error', rate: 1});
      if (pausePlayer && player) { try { player.pauseVideo(); } catch { /* The explicit failure remains visible. */ } }
      emit();
      if (isCurrent()) notifyError(error);
    };
    const refresh = (notify = true) => {
      if (!isCurrent() || !ready || failure || reading) return current;
      reading = true;
      try {
        const state = STATES[player.getPlayerState()];
        const timeSeconds = player.getCurrentTime(), durationSeconds = player.getDuration(), rate = player.getPlaybackRate();
        const playerUrl = player.getVideoUrl();
        const actualId = videoFromPlayerUrl(playerUrl);
        if (actualId && actualId !== videoId) {
          // Preserve native YouTube navigation; stop associating its new video with the old text.
          fail(problem('YOUTUBE_RECORDING_CHANGED', 'The YouTube player changed recordings. Select that recording explicitly to align its text.'), {pausePlayer: false, actualId});
          return current;
        }
        if (!state || ![timeSeconds, durationSeconds, rate].every(Number.isFinite)
          || timeSeconds < 0 || durationSeconds < 0 || rate <= 0
          || (!actualId && (state === 'playing' || timeSeconds > 0))) {
          throw problem('YOUTUBE_CLOCK_UNAVAILABLE', 'The recording clock could not be verified. Following has stopped.');
        }
        current = Object.freeze({ready: true, videoId, timeSeconds, durationSeconds, state, rate});
      } catch (error) {
        fail(typeof error?.code === 'string' && error.code.startsWith('YOUTUBE_') ? error : problem('YOUTUBE_CLOCK_UNAVAILABLE', 'The recording clock could not be read. Following has stopped.'));
      } finally { reading = false; }
      if (notify && !failure) emit();
      return current;
    };
    const schedule = () => {
      stopPolling();
      if (!isCurrent() || !ready || failure || document.hidden) return;
      // Poll paused/cued players too: the documented API has no seek-completed event.
      polling = setTimeout(() => {
        polling = null;
        if (!isCurrent()) { controller.destroy(); return; }
        refresh();
        schedule();
      }, POLL_MS);
    };
    const pause = () => {
      if (!isCurrent()) return false;
      pauseOnReady = true;
      stopPolling();
      if (player && (ready || failure)) {
        try { player.pauseVideo(); refresh(); }
        catch {
          fail(problem('YOUTUBE_PAUSE_FAILED', 'The player could not pause and has been closed. Reconnect to continue.'));
          controller.destroy();
          return false;
        }
      }
      schedule();
      return true;
    };
    const visibilityChanged = () => {
      if (!isCurrent()) { controller.destroy(); return; }
      if (document.hidden) pause();
      else { refresh(); schedule(); }
    };
    const releasePlayer = () => {
      if (!player) return;
      try { player.pauseVideo(); } catch { /* Destroy is still attempted. */ }
      try { player.destroy(); } catch { /* The owned iframe is removed below regardless. */ }
      player = null;
    };
    controller = Object.freeze({
      snapshot: () => refresh(false),
      seek(seconds) {
        if (!isCurrent() || !ready || failure) return false;
        if (!Number.isFinite(seconds) || seconds < 0 || (current.durationSeconds > 0 && seconds > current.durationSeconds)) {
          fail(problem('YOUTUBE_SEEK_INVALID', 'This timing marker is outside the recording.'));
          return false;
        }
        try { player.seekTo(seconds, true); refresh(); schedule(); return !failure; }
        catch { fail(problem('YOUTUBE_SEEK_FAILED', 'The player could not seek to that timing marker.')); return false; }
      },
      pause,
      destroy() {
        if (destroyed) return;
        destroyed = true;
        ready = false;
        abortController.abort();
        stopPolling();
        clearTimeout(readyTimeout);
        observer?.disconnect();
        visibilityObserver?.disconnect();
        document.removeEventListener('visibilitychange', visibilityChanged);
        window.removeEventListener('pagehide', pageHidden);
        releasePlayer();
        holder.remove();
        pendingEvents = [];
        if (mounts.get(mount) === controller) mounts.delete(mount);
        current = Object.freeze({...current, ready: false, timeSeconds: 0, durationSeconds: 0, state: failure ? 'error' : 'unstarted', rate: 1});
      }
    });
    const pageHidden = () => controller.destroy();
    mounts.set(mount, controller);
    mount.replaceChildren(holder);
    if (typeof MutationObserver === 'function') {
      observer = new MutationObserver(() => { if (!isCurrent()) controller.destroy(); });
      observer.observe(document.documentElement, {childList: true, subtree: true});
    }
    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('pagehide', pageHidden);
    await readVideo(videoId, {apiKey, fetcher: fetch}, abortController.signal);
    if (!isCurrent()) throw cancelled();
    const YT = await abortable(loadYouTubeApi(), abortController.signal);
    if (!isCurrent()) throw cancelled();

    const frame = document.createElement('iframe');
    frame.id = `read-along-youtube-${++nextPlayerId}`;
    frame.className = 'read-along-player-frame';
    frame.title = 'YouTube Gurbani recording';
    frame.width = '100%';
    frame.height = '270';
    frame.allow = 'autoplay; encrypted-media; fullscreen';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    const embed = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
    for (const [key, value] of Object.entries({enablejsapi: '1', origin: window.location.origin,
      autoplay: '0', controls: '1', playsinline: '1'})) embed.searchParams.set(key, value);
    frame.src = embed.href;
    holder.append(frame);

    const handleEvent = (type, event) => {
      if (constructing) { pendingEvents.push([type, event]); return; }
      if (!isCurrent() || failure || event?.target !== player) return;
      if (type === 'error') {
        const code = Number.isInteger(event.data) ? String(event.data) : 'UNKNOWN';
        const messages = {
          2: 'The YouTube recording identifier is invalid.',
          5: 'This browser could not play the recording.',
          100: 'This recording was removed or made private.',
          101: 'The recording owner does not allow embedded playback.',
          150: 'The recording owner does not allow embedded playback.',
          153: 'YouTube could not identify this embedding page. Open the recording on YouTube.'
        };
        fail(problem(`YOUTUBE_PLAYER_${code}`, messages[code] || 'YouTube reported a playback error. Open the recording on YouTube.'));
        return;
      }
      if (type === 'blocked') {
        // A later native Play action can recover without rebuilding the recording.
        refresh();
        if (isCurrent()) notifyError(problem('YOUTUBE_PLAYBACK_BLOCKED', 'The browser blocked playback. Use the YouTube player’s Play control.'));
        return;
      }
      if (type === 'ready') {
        // YouTube attaches playback and clock methods when the iframe is ready,
        // not when its SDK constructor returns. Validate before reading any of them.
        if (['getPlayerState', 'getCurrentTime', 'getDuration', 'getPlaybackRate', 'getVideoUrl', 'seekTo', 'pauseVideo', 'destroy']
          .some(method => typeof player[method] !== 'function')) {
          fail(problem('YOUTUBE_PLAYER_INVALID', 'The YouTube player did not expose the required controls.'), {pausePlayer: false});
          controller.destroy();
          return;
        }
        ready = true;
        clearTimeout(readyTimeout);
        if (document.hidden || pauseOnReady) pause();
      }
      refresh();
      schedule();
    };
    readyTimeout = setTimeout(() => fail(problem('YOUTUBE_PLAYER_TIMEOUT', 'The YouTube player did not become ready. Try connecting again.')), PLAYER_TIMEOUT_MS);
    if (!isCurrent()) throw cancelled();
    constructing = true;
    try {
      player = new YT.Player(frame, {events: {
        onReady: event => handleEvent('ready', event),
        onStateChange: event => handleEvent('state', event),
        onPlaybackRateChange: event => handleEvent('rate', event),
        onError: event => handleEvent('error', event),
        onAutoplayBlocked: event => handleEvent('blocked', event)
      }});
    } finally { constructing = false; }
    // Cleanup must remain possible while the iframe is still loading.
    if (!player || typeof player.destroy !== 'function') {
      throw problem('YOUTUBE_PLAYER_INVALID', 'The YouTube player did not expose the required controls.');
    }
    for (const [type, event] of pendingEvents) handleEvent(type, event);
    pendingEvents = [];
    if (failure) throw failure;
    if (!isCurrent()) throw cancelled();
    if (typeof IntersectionObserver === 'function') {
      visibilityObserver = new IntersectionObserver(entries => {
        if (!isCurrent()) { controller.destroy(); return; }
        if (entries.some(entry => entry.target === frame && !entry.isIntersecting)) pause();
      });
      visibilityObserver.observe(frame);
    }
    return controller;
  } catch (error) {
    const failure = typeof error?.code === 'string' && error.code.startsWith('YOUTUBE_') ? error
      : problem('YOUTUBE_PLAYER_FAILED', 'The YouTube player could not be created. Open the recording on YouTube.');
    notifyError(failure);
    controller?.destroy();
    throw failure;
  }
}
