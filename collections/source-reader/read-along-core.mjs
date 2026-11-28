// App-owned timing annotations. These are not YouTube captions or reviewed recitation timings.
export const MAX_TIMING_BYTES = 262144;
export const MAX_CUES = 5000;
export const MAX_TIME_MS = 7 * 24 * 60 * 60 * 1000;
const SCHEMA = 'glp.youtube-read-along.v1';
const VIDEO = /^[A-Za-z0-9_-]{11}$/;
const SHA = /^[a-f0-9]{64}$/;
const ID = /^[A-Za-z0-9_-]{1,80}$/;
const fail = code => { throw new Error(code); };
const need = (value, code) => { if (!value) fail(code); };
const ownKeys = (value, expected) => value && typeof value === 'object' && !Array.isArray(value)
  && Object.getPrototypeOf(value) === Object.prototype
  && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());
function freeze(value) {
  if (value && typeof value === 'object') { for (const child of Object.values(value)) freeze(child); Object.freeze(value); }
  return value;
}

function secondsFromLink(value) {
  if (value === null || value === '') return 0;
  let seconds;
  if (/^\d+(?:\.\d{1,3})?$/.test(value)) seconds = Number(value);
  else {
    const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d{1,3})?)s)?$/.exec(value);
    need(match && match[0], 'YOUTUBE_LINK_TIME');
    seconds = Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
  }
  need(Number.isFinite(seconds) && seconds >= 0 && seconds * 1000 <= MAX_TIME_MS, 'YOUTUBE_LINK_TIME');
  return seconds;
}

export function parseYouTubeURL(input) {
  need(typeof input === 'string' && input.length <= 2048 && !/[\u0000-\u001f\u007f]/.test(input), 'YOUTUBE_LINK');
  let value = input.trim();
  if (VIDEO.test(value)) return Object.freeze({videoId: value, startSeconds: 0});
  if (/^(?:www\.|m\.|music\.)?youtube\.com\//i.test(value) || /^youtu\.be\//i.test(value)) value = 'https://' + value;
  let url;
  try { url = new URL(value); } catch { fail('YOUTUBE_LINK'); }
  need(url.protocol === 'https:' && !url.username && !url.password && !url.port, 'YOUTUBE_LINK');
  const host = url.hostname.toLowerCase(); let videoId;
  if (host === 'youtu.be') {
    const match = /^\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname);
    videoId = match?.[1];
  } else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
    if (url.pathname === '/watch') {
      need(url.searchParams.getAll('v').length === 1, 'YOUTUBE_LINK');
      videoId = url.searchParams.get('v');
    } else videoId = /^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1];
  } else if (host === 'www.youtube-nocookie.com' || host === 'youtube-nocookie.com') {
    videoId = /^\/embed\/([A-Za-z0-9_-]{11})\/?$/.exec(url.pathname)?.[1];
  }
  need(typeof videoId === 'string' && VIDEO.test(videoId), 'YOUTUBE_LINK');
  const times = [...url.searchParams.getAll('t'), ...url.searchParams.getAll('start')];
  if (url.hash.startsWith('#t=')) times.push(url.hash.slice(3));
  need(times.length <= 1, 'YOUTUBE_LINK_TIME');
  return Object.freeze({videoId, startSeconds: secondsFromLink(times[0] ?? null)});
}

function checkedReading(reading) {
  const binding = reading?.binding;
  need(ownKeys(binding, ['collectionId', 'editionId', 'manifestSha256', 'selectionId', 'units']), 'TIMING_SOURCE');
  need(['sggs', 'dasam'].includes(binding.collectionId) && typeof binding.editionId === 'string'
    && binding.editionId.length <= 120 && SHA.test(binding.manifestSha256)
    && /^(?:section|unit):[A-Za-z0-9_-]{1,80}$/.test(binding.selectionId), 'TIMING_SOURCE');
  need(Array.isArray(binding.units) && binding.units.length > 0 && binding.units.length <= 100, 'TIMING_SOURCE');
  const units = new Set();
  for (const unit of binding.units) {
    need(ownKeys(unit, ['id', 'sha256']) && typeof unit.id === 'string' && ID.test(unit.id)
      && typeof unit.sha256 === 'string' && SHA.test(unit.sha256) && !units.has(unit.id), 'TIMING_SOURCE');
    units.add(unit.id);
  }
  need(Array.isArray(reading.lines) && reading.lines.length > 0 && reading.lines.length <= 2048, 'TIMING_SOURCE');
  const lines = new Set();
  for (const line of reading.lines) {
    need(line && typeof line.id === 'string' && ID.test(line.id) && units.has(line.unitId) && !lines.has(line.id), 'TIMING_SOURCE');
    lines.add(line.id);
  }
  return {binding, lines};
}

function sameBinding(actual, expected) {
  if (!ownKeys(actual, ['collectionId', 'editionId', 'manifestSha256', 'selectionId', 'units'])) return false;
  if (['collectionId', 'editionId', 'manifestSha256', 'selectionId'].some(key => actual[key] !== expected[key])) return false;
  return Array.isArray(actual.units) && actual.units.length === expected.units.length
    && actual.units.every((unit, index) => ownKeys(unit, ['id', 'sha256'])
      && unit.id === expected.units[index].id && unit.sha256 === expected.units[index].sha256);
}

export function emptyTiming(videoId, reading) {
  need(VIDEO.test(videoId), 'TIMING_VIDEO');
  const {binding} = checkedReading(reading);
  return freeze({schema: SCHEMA, timingStatus: 'USER_MARKED', videoId,
    source: structuredClone(binding), cues: []});
}

export function validateTiming(input, reading, videoId) {
  const {binding, lines} = checkedReading(reading);
  need(VIDEO.test(videoId), 'TIMING_VIDEO');
  let value = input;
  if (typeof input === 'string') {
    need(new TextEncoder().encode(input).length <= MAX_TIMING_BYTES, 'TIMING_TOO_LARGE');
    try { value = JSON.parse(input); } catch { fail('TIMING_JSON'); }
  }
  need(ownKeys(value, ['schema', 'timingStatus', 'videoId', 'source', 'cues'])
    && value.schema === SCHEMA && value.timingStatus === 'USER_MARKED', 'TIMING_SCHEMA');
  need(value.videoId === videoId, 'TIMING_VIDEO');
  need(sameBinding(value.source, binding), 'TIMING_SOURCE_MISMATCH');
  need(Array.isArray(value.cues) && value.cues.length <= MAX_CUES, 'TIMING_CUES');
  let previous = -1;
  for (const cue of value.cues) {
    need(ownKeys(cue, ['at', 'lineId']) && Number.isSafeInteger(cue.at) && cue.at >= 0
      && cue.at <= MAX_TIME_MS && cue.at > previous, 'TIMING_ORDER');
    need(cue.lineId === null || (typeof cue.lineId === 'string' && lines.has(cue.lineId)), 'TIMING_LINE');
    previous = cue.at;
  }
  const result = {schema: SCHEMA, timingStatus: 'USER_MARKED', videoId,
    source: structuredClone(binding), cues: value.cues.map(cue => ({at: cue.at, lineId: cue.lineId}))};
  need(new TextEncoder().encode(JSON.stringify(result)).length <= MAX_TIMING_BYTES, 'TIMING_TOO_LARGE');
  return freeze(result);
}

export function putCue(map, reading, atMs, lineId) {
  const checked = validateTiming(map, reading, map?.videoId);
  need(Number.isSafeInteger(atMs) && atMs >= 0 && atMs <= MAX_TIME_MS, 'TIMING_TIME');
  const cues = checked.cues.filter(cue => cue.at !== atMs).map(cue => ({...cue}));
  cues.push({at: atMs, lineId}); cues.sort((a, b) => a.at - b.at);
  return validateTiming({...checked, cues}, reading, checked.videoId);
}

// Only a bounded interval has an asserted active line. An unfinished last mark
// never invents timing for the remainder of a recording.
export function lineAt(map, mediaSeconds) {
  if (!Number.isFinite(mediaSeconds) || mediaSeconds < 0 || !Array.isArray(map?.cues) || map.cues.length < 2) return null;
  const time = mediaSeconds * 1000, cues = map.cues;
  let left = 0, right = cues.length;
  while (left < right) { const middle = (left + right) >>> 1; if (cues[middle].at <= time) left = middle + 1; else right = middle; }
  const index = left - 1;
  return index >= 0 && index < cues.length - 1 && time < cues[index + 1].at ? cues[index].lineId : null;
}

export function timingKey(videoId, reading) {
  need(VIDEO.test(videoId), 'TIMING_VIDEO');
  const {binding} = checkedReading(reading);
  return `glp001.youtube-timing.v1:${videoId}:${binding.collectionId}:${binding.manifestSha256}:${binding.selectionId}`;
}

export function serializeTiming(map) {
  const value = JSON.stringify(map);
  need(typeof value === 'string' && new TextEncoder().encode(value).length <= MAX_TIMING_BYTES, 'TIMING_TOO_LARGE');
  return value;
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds), hours = Math.floor(total / 3600), minutes = Math.floor(total % 3600 / 60);
  return (hours ? hours + ':' + String(minutes).padStart(2, '0') : String(minutes)) + ':' + String(total % 60).padStart(2, '0');
}
