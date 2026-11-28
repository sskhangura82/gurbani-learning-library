import {createReadAlongSource} from './read-along-source.mjs';
import {parseYouTubeURL, emptyTiming, validateTiming, putCue, lineAt, timingKey,
  serializeTiming, formatTime, MAX_TIMING_BYTES} from './read-along-core.mjs';
import {createYouTubePlayer} from './read-along-player.mjs';

const $ = id => document.getElementById(id);
const textPanel = $('read-along-text'), mount = $('youtube-player');
const source = createReadAlongSource();
let reading = null, timing = null, video = null, controller = null, media = null;
let sourceSequence = 0, playerSequence = 0, contextSequence = 0, browseSequence = 0, importSequence = 0, mapRevision = 0;
let selectedId = null, activeId = null, baseline = null, dirty = false, connecting = false, browsing = false;
let pendingStart = null, undo = [], options = [], optionBinding = null, pendingAction = null, dialogReturn = null;
const rows = new Map(), lineIndices = new Map();

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function text(id, value) { if ($(id).textContent !== value) $(id).textContent = value; }
function status(id, state, message) {
  $(id).dataset.state = state; text(id, message);
}
function hasClock(snapshot = media) {
  return Boolean(controller && video && reading && snapshot?.ready && snapshot.videoId === video.videoId
    && snapshot.state !== 'error' && Number.isFinite(snapshot.timeSeconds) && snapshot.timeSeconds >= 0);
}
function updateFallback() {
  let identity;
  try { identity = parseYouTubeURL($('video-url').value); } catch { identity = video; }
  $('youtube-fallback').hidden = !identity;
  if (identity) $('youtube-fallback').href = 'https://www.youtube.com/watch?v=' + encodeURIComponent(identity.videoId);
  else $('youtube-fallback').removeAttribute('href');
}
function updateControls() {
  const clock = hasClock(), chosenIndex = lineIndices.get(selectedId);
  $('video-load').disabled = !reading;
  $('video-disconnect').disabled = !controller && !connecting;
  $('mark-selected').disabled = !clock || !timing || chosenIndex === undefined;
  $('mark-next').disabled = !clock || !timing || chosenIndex === undefined || chosenIndex >= reading.lines.length - 1;
  $('mark-pause').disabled = !clock || !timing;
  $('timing-undo').disabled = !undo.length;
  $('timing-save').disabled = !timing || (!dirty && !timing.cues.length);
  $('timing-load').disabled = !timing;
  $('timing-export').disabled = !timing;
  $('timing-import').disabled = !timing;
  $('timing-delete').disabled = !timing;
  $('timing-clear').disabled = !timing?.cues.length;
  $('timing-replay').disabled = !clock || !timing?.cues.length;
  for (const button of $('timing-cues').querySelectorAll('button')) button.disabled = !clock;
  const mode = $('source-mode').value;
  $('source-find').disabled = mode === 'japji' || browsing;
  $('source-open').disabled = mode !== 'japji' && (!optionBinding || !options.some(option => option.id === $('source-group').value));
}
function rowState(id) {
  const row = rows.get(id); if (!row) return;
  const selected = id === selectedId, active = id === activeId;
  row.dataset.selected = String(selected); row.dataset.active = String(active);
  row.tabIndex = selected ? 0 : -1;
  row.setAttribute('aria-pressed', String(selected));
  if (active) row.setAttribute('aria-current', 'true'); else row.removeAttribute('aria-current');
  row.querySelector('.read-along-line-state').textContent = [selected ? 'Selected' : '', active ? 'Timed line' : ''].filter(Boolean).join(' · ');
}
function revealRow(id, {follow = false} = {}) {
  const row = rows.get(id); if (!row?.isConnected) return;
  if (follow && (!$('follow-timings').checked || textPanel.contains(document.activeElement))) return;
  const panelBox = textPanel.getBoundingClientRect(), box = row.getBoundingClientRect();
  const top = textPanel.scrollTop + box.top - panelBox.top - 12;
  textPanel.scrollTo({top: Math.max(0, top), behavior: 'auto'});
}
function selectLine(id, {focus = false, reveal = false} = {}) {
  if (!lineIndices.has(id)) return;
  const previous = selectedId; selectedId = id; rowState(previous); rowState(id);
  const index = lineIndices.get(id), line = reading.lines[index];
  text('selected-line', 'Selected: line ' + (index + 1) + ' of ' + reading.lines.length + ' · ' + line.label);
  if (reveal) revealRow(id);
  if (focus) rows.get(id).focus({preventScroll: true});
  updateControls();
}
function setActive(id) {
  if (id && !rows.has(id)) id = null;
  if (id === activeId) return;
  const previous = activeId; activeId = id; rowState(previous); rowState(id);
  if (id) revealRow(id, {follow: true});
}
function alignmentMessage() {
  if (!reading) return 'Original text is not yet available.';
  if (!video || !timing) return 'Connect a recording when you want to mark its timing.';
  if (!timing.cues.length) return 'No timing markers yet. Select a line and mark its start.';
  if (!hasClock()) return 'Timings are open. Connect the recording to follow its clock.';
  if (activeId) return 'Timed line ' + (lineIndices.get(activeId) + 1) + ' · ' + reading.lines[lineIndices.get(activeId)].label;
  const at = media.timeSeconds * 1000;
  let left = 0, right = timing.cues.length;
  while (left < right) { const middle = (left + right) >>> 1; if (timing.cues[middle].at <= at) left = middle + 1; else right = middle; }
  const index = left - 1;
  if (index < 0) return 'No marked text for this part of the recording.';
  if (index < timing.cues.length - 1 && timing.cues[index].lineId === null) return 'A text pause is marked for this interval.';
  if (index === timing.cues.length - 1 && timing.cues[index].lineId !== null) return 'The latest line mark needs a following mark or a text pause/end.';
  return 'After the final text pause/end marker. No line is highlighted.';
}
function updateAlignment() {
  setActive(hasClock() && timing ? lineAt(timing, media.timeSeconds) : null);
  text('alignment-status', alignmentMessage());
}
function updateClock() {
  const states = {unstarted: 'Ready', cued: 'Ready', playing: 'Playing', paused: 'Paused', buffering: 'Buffering', ended: 'Ended', error: 'Playback unavailable'};
  text('player-state', media ? states[media.state] || 'Opening player' : 'Not connected');
  text('media-time', media?.ready && Number.isFinite(media.timeSeconds)
    ? formatTime(media.timeSeconds) + (Number.isFinite(media.durationSeconds) && media.durationSeconds > 0 ? ' / ' + formatTime(media.durationSeconds) : '') : '—');
  text('playback-rate', media?.ready && Number.isFinite(media.rate) && media.rate > 0 ? media.rate + '×' : '');
  updateAlignment(); updateControls();
}
function acceptSnapshot(snapshot, token, expectedReading, expectedVideo) {
  if (token !== playerSequence || reading !== expectedReading || video?.videoId !== expectedVideo || snapshot?.videoId !== expectedVideo) return;
  media = snapshot;
  if (controller && snapshot.ready && pendingStart !== null) {
    const start = pendingStart; pendingStart = null;
    if (start > 0) {
      controller.pause();
      controller.seek(start);
      const current = controller.snapshot();
      if (token !== playerSequence || reading !== expectedReading || current?.videoId !== expectedVideo) return;
      media = current;
    }
  }
  if (media.ready && media.state !== 'error' && $('video-status').dataset.state !== 'ready')
    status('video-status', 'ready', 'Recording connected. Use YouTube’s controls for play, pause, seeking and speed.');
  updateClock();
}
function playerError(error, token, expectedReading, expectedVideo) {
  if (token !== playerSequence || reading !== expectedReading || video?.videoId !== expectedVideo || error?.code === 'YOUTUBE_CANCELLED') return;
  const message = error?.code === 'YOUTUBE_NOT_CONFIGURED'
    ? 'YouTube playback setup is not connected yet. You can still read here or open the video on YouTube.'
    : error?.code === 'YOUTUBE_CONFIGURATION'
      ? 'YouTube playback setup is unavailable. You can still read here or open the video on YouTube.'
      : error?.message || 'The recording could not be opened here. You can still read or watch it on YouTube.';
  status('video-status', 'unavailable', message);
  if (error?.code !== 'YOUTUBE_PLAYBACK_BLOCKED') { media = null; updateClock(); }
  updateFallback();
}
function detachPlayer(message) {
  ++playerSequence; connecting = false; pendingStart = null;
  const previous = controller; controller = null; media = null;
  try { previous?.pause(); } catch {}
  try { previous?.destroy(); } catch {}
  mount.replaceChildren(); mount.hidden = true; $('player-placeholder').hidden = false;
  setActive(null); updateClock();
  if (message) status('video-status', 'idle', message);
}
function resetTiming() {
  timing = null; video = null; baseline = null; dirty = false; undo = [];
  ++mapRevision; ++importSequence;
  renderTiming();
}
function renderSource() {
  const expected = reading, fragment = document.createDocumentFragment();
  rows.clear(); lineIndices.clear(); selectedId = null; activeId = null;
  expected.lines.forEach((line, index) => {
    const row = node('button', 'read-along-line'); row.type = 'button';
    row.dataset.lineId = line.id; row.dataset.selected = 'false'; row.dataset.active = 'false'; row.tabIndex = -1;
    const original = node('span', 'read-along-original', line.text); original.lang = 'pa-Guru';
    row.append(original, node('span', 'read-along-locator', line.label + ' · Line ' + (index + 1)),
      node('span', 'read-along-line-state'));
    row.addEventListener('click', () => { if (reading === expected) selectLine(line.id); });
    rows.set(line.id, row); lineIndices.set(line.id, index); fragment.append(row);
  });
  textPanel.replaceChildren(fragment); textPanel.scrollTop = 0; textPanel.setAttribute('aria-busy', 'false');
  text('source-title', expected.title);
  status('source-status', 'ready', expected.lines.length + ' original rows checked · ' + expected.binding.units.length + ' complete source ' + (expected.binding.units.length === 1 ? 'group' : 'groups'));
  text('source-provenance', 'Named edition: ' + expected.binding.editionId + '. This selection contains ' + expected.lines.length
    + ' original rows in ' + expected.binding.units.length + ' complete source ' + (expected.binding.units.length === 1 ? 'group.' : 'groups.'));
  document.documentElement.dataset.readAlongState = 'ready';
  selectLine(expected.lines[0].id); updateAlignment(); updateControls();
}
async function openSource(load) {
  const token = ++sourceSequence; ++contextSequence;
  detachPlayer('Text selection changed. Choose Load video to connect a recording for this text.');
  resetTiming(); reading = null; rows.clear(); lineIndices.clear(); selectedId = null; activeId = null;
  textPanel.replaceChildren(); textPanel.setAttribute('aria-busy', 'true');
  text('source-title', 'Opening original text'); text('selected-line', 'Select a source line after it has been checked.');
  status('source-status', 'loading', 'Checking the complete original text…');
  document.documentElement.dataset.readAlongState = 'loading'; updateControls(); updateFallback();
  try {
    const next = await load();
    if (token !== sourceSequence) return;
    reading = next; renderSource();
  } catch {
    if (token !== sourceSequence) return;
    textPanel.replaceChildren(); textPanel.setAttribute('aria-busy', 'false');
    text('source-title', 'Original text unavailable');
    status('source-status', 'refused', 'This complete source selection could not be verified. Choose the text again to retry.');
    document.documentElement.dataset.readAlongState = 'refused';
    updateAlignment(); updateControls();
  }
}
function chooserChanged() {
  ++browseSequence; browsing = false; options = []; optionBinding = null;
  const mode = $('source-mode').value, isJapji = mode === 'japji';
  $('source-page-field').hidden = isJapji; $('source-group-field').hidden = isJapji;
  text('source-page-label', mode === 'dasam' ? 'Source page · 1–1428' : 'Ang number · 1–1430');
  $('source-group').replaceChildren(node('option', '', 'Find passages to choose one'));
  $('source-group').disabled = true;
  text('source-options-status', isJapji ? 'Japji includes all 385 original rows in this named digital edition.' : 'Find a page, then choose the passage beginning you want. The complete provider group will open.');
  updateControls();
}
async function browse() {
  const collectionId = $('source-mode').value, raw = $('source-page').value;
  if (!['sggs', 'dasam'].includes(collectionId) || !/^[1-9][0-9]{0,3}$/.test(raw)
    || Number(raw) > (collectionId === 'sggs' ? 1430 : 1428)) {
    text('source-options-status', 'Enter an available Ang or source-page number.'); return;
  }
  const page = Number(raw), token = ++browseSequence;
  browsing = true; options = []; optionBinding = null; $('source-group').disabled = true;
  text('source-options-status', 'Checking complete passages on this page…'); updateControls();
  try {
    const found = await source.browsePage(collectionId, page);
    if (token !== browseSequence || $('source-mode').value !== collectionId || $('source-page').value !== raw) return;
    options = found; optionBinding = {collectionId, page}; browsing = false;
    const fragment = document.createDocumentFragment();
    for (const value of found) {
      const option = node('option', '', value.title + ' · ' + value.lineCount + ' rows · ' + value.firstLine);
      option.value = value.id; fragment.append(option);
    }
    $('source-group').replaceChildren(fragment); $('source-group').disabled = !found.length;
    text('source-options-status', found.length + ' complete passages available. Choose a beginning, then Open selected text.');
    updateControls();
  } catch {
    if (token !== browseSequence) return;
    browsing = false; text('source-options-status', 'These source passages could not be verified. Check the page number and try again.'); updateControls();
  }
}
function proceed(action, description) {
  if (!dirty) { action(); return; }
  pendingAction = action; dialogReturn = document.activeElement;
  text('discard-description', 'You have unsaved timing changes. Save or export a copy before you ' + description + '.');
  text('discard-status', ''); $('discard-save').disabled = !timing;
  try { controller?.pause(); } catch { detachPlayer('Video disconnected while you review your timing changes.'); }
  mount.hidden = true;
  if (!$('discard-dialog').open) $('discard-dialog').showModal();
}
function finishPending() {
  const action = pendingAction; pendingAction = null; $('discard-dialog').close();
  action?.();
}
async function connectVideo(identity) {
  const expectedReading = reading;
  if (!expectedReading) { status('video-status', 'refused', 'Open and verify the original text before connecting a recording.'); return; }
  const isSame = video?.videoId === identity.videoId && timing;
  detachPlayer();
  if (!isSame) {
    ++contextSequence; ++importSequence; ++mapRevision;
    video = identity; timing = emptyTiming(identity.videoId, expectedReading);
    baseline = serializeTiming(timing); dirty = false; undo = [];
    status('timing-status', 'idle', 'New recording and text selected. Mark timings or explicitly load a saved map.');
  } else video = identity;
  const token = playerSequence;
  connecting = true; pendingStart = identity.startSeconds;
  const holder = node('div', 'player-instance'); mount.replaceChildren(holder);
  mount.hidden = false; $('player-placeholder').hidden = true;
  status('video-status', 'loading', 'Checking the recording before opening YouTube…');
  renderTiming(); updateFallback(); updateControls();
  try {
    const next = await createYouTubePlayer({mount: holder, videoId: identity.videoId,
      onUpdate: snapshot => acceptSnapshot(snapshot, token, expectedReading, identity.videoId),
      onError: error => playerError(error, token, expectedReading, identity.videoId)});
    if (token !== playerSequence || reading !== expectedReading || video?.videoId !== identity.videoId) {
      try { next.destroy(); } catch {} return;
    }
    controller = next; connecting = false;
    acceptSnapshot(next.snapshot(), token, expectedReading, identity.videoId);
    updateControls();
  } catch (error) {
    if (token !== playerSequence || reading !== expectedReading || video?.videoId !== identity.videoId) return;
    connecting = false; controller = null; media = null;
    mount.replaceChildren(); mount.hidden = true; $('player-placeholder').hidden = false;
    playerError(error, token, expectedReading, identity.videoId);
    updateClock(); updateControls();
  }
}
function loadVideo(event) {
  event?.preventDefault();
  if (!reading) { status('video-status', 'refused', 'Open and verify the original text before connecting a recording.'); return; }
  let identity;
  try { identity = parseYouTubeURL($('video-url').value); }
  catch { status('video-status', 'refused', 'Use a link to one YouTube recording, such as a watch, share or shorts link.'); updateFallback(); return; }
  updateFallback();
  if (video?.videoId === identity.videoId) void connectVideo(identity);
  else proceed(() => { void connectVideo(identity); }, 'change recordings');
}
function replaceTiming(next, {clean = false, keepUndo = true} = {}) {
  const previous = timing, serial = serializeTiming(next);
  if (keepUndo && previous && serializeTiming(previous) !== serial) { undo.push(previous); if (undo.length > 20) undo.shift(); }
  timing = next; ++mapRevision; ++importSequence;
  if (clean) baseline = serial;
  dirty = serial !== baseline;
  renderTiming(); updateAlignment(); updateControls();
}
function renderTiming() {
  $('timing-cues').replaceChildren();
  if (!timing || !reading) {
    text('timing-summary', 'Connect a recording to create or load timings for this text.');
    text('cue-count', 'No markers yet.'); updateControls(); return;
  }
  const intervals = timing.cues.slice(0, -1).filter(cue => cue.lineId !== null).length;
  text('timing-summary', timing.cues.length + ' markers · ' + intervals + ' bounded line intervals' + (dirty ? ' · Unsaved changes' : ''));
  const first = Math.max(0, timing.cues.length - 20);
  text('cue-count', timing.cues.length ? (first ? 'Showing the latest 20 of ' + timing.cues.length + ' markers.' : 'Your markers in recording-time order.') : 'No markers yet.');
  $('timing-cues').start = first + 1;
  for (let index = first; index < timing.cues.length; index++) {
    const cue = timing.cues[index], item = node('li');
    const label = cue.lineId === null ? 'Text pause or end' : 'Line ' + (lineIndices.get(cue.lineId) + 1) + ' · ' + reading.lines[lineIndices.get(cue.lineId)].label;
    const go = node('button', 'quiet', formatTime(cue.at / 1000) + ' · ' + label); go.type = 'button'; go.dataset.cueAt = String(cue.at);
    go.addEventListener('click', () => seek(cue.at / 1000)); item.append(go);
    if (index === timing.cues.length - 1 && cue.lineId !== null) item.append(node('small', '', 'This final line marker needs a following marker to define its interval.'));
    $('timing-cues').append(item);
  }
  updateControls();
}
function currentClock() {
  if (!controller || !video || !reading) return null;
  const snapshot = controller.snapshot();
  if (!hasClock(snapshot)) return null;
  media = snapshot; return Math.round(snapshot.timeSeconds * 1000);
}
function mark(lineId, {select = false} = {}) {
  if (!timing || !reading) return;
  const at = currentClock();
  if (at === null) { status('timing-status', 'refused', 'The recording clock is not available. Use the player controls or reconnect before marking.'); updateClock(); return; }
  try {
    const next = putCue(timing, reading, at, lineId);
    replaceTiming(next);
    if (select && lineId) selectLine(lineId, {reveal: true});
    status('timing-status', dirty ? 'dirty' : 'loaded', (lineId === null ? 'Text pause/end' : 'Selected line') + ' marked at ' + formatTime(at / 1000) + '. Choose Save on device to keep your changes.');
  } catch { status('timing-status', 'refused', 'This marker could not be added. Your current map is unchanged; check the recording time or export your map.'); }
}
function seek(seconds) {
  const target = controller, snapshot = target?.snapshot();
  if (!hasClock(snapshot)) return false;
  const token = playerSequence, expectedReading = reading, expectedVideo = video.videoId;
  if (!['playing', 'buffering'].includes(snapshot.state) && target.pause() === false) return false;
  if (token !== playerSequence || controller !== target) return false;
  const moved = target.seek(seconds);
  if (token !== playerSequence || controller !== target) return false;
  acceptSnapshot(target.snapshot(), token, expectedReading, expectedVideo);
  return moved !== false;
}
function saveTiming() {
  if (!timing || !reading || !video) return false;
  try {
    const checked = validateTiming(timing, reading, video.videoId), serial = serializeTiming(checked);
    localStorage.setItem(timingKey(video.videoId, reading), serial);
    baseline = serial; dirty = false; renderTiming();
    status('timing-status', 'saved', 'Timings saved on this device for this recording and exact source selection.');
    return true;
  } catch { status('timing-status', 'refused', 'Timings could not be saved on this device. Your current map is still open; export it to keep a copy.'); return false; }
}
function exportTiming() {
  if (!timing || !reading || !video) return;
  try {
    const checked = validateTiming(timing, reading, video.videoId);
    const url = URL.createObjectURL(new Blob([serializeTiming(checked) + '\n'], {type: 'application/json'}));
    const link = node('a'); link.href = url;
    link.download = 'Gurbani-timings-' + video.videoId + '-' + reading.binding.selectionId.replace(':', '-') + '.json';
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    status('timing-status', dirty ? 'dirty' : 'loaded', 'Timing file exported. It contains your markers and source identity, without the recording.');
  } catch { status('timing-status', 'refused', 'The timing file could not be exported. Your current map remains open.'); }
}
function loadSaved() {
  if (!timing || !reading || !video) return;
  const expectedContext = contextSequence, expectedReading = reading, expectedVideo = video.videoId;
  const current = () => expectedContext === contextSequence && reading === expectedReading && video?.videoId === expectedVideo;
  const readSaved = () => {
    const raw = localStorage.getItem(timingKey(expectedVideo, expectedReading));
    if (raw === null) return null;
    return validateTiming(raw, expectedReading, expectedVideo);
  };
  const restore = () => {
    if (!current()) return;
    try {
      // Save and continue may have changed this key while the dialog was open.
      const next = readSaved();
      if (!next) { status('timing-status', dirty ? 'dirty' : 'idle', 'No saved timings were found for this recording and exact text selection.'); return; }
      replaceTiming(next, {clean: true}); status('timing-status', 'loaded', 'Saved timings loaded for this recording and exact text selection.');
    } catch { status('timing-status', 'refused', 'The saved timings could not be loaded or matched to this recording and source. The stored record and current map have been kept unchanged.'); }
  };
  if (!dirty) { restore(); return; }
  try {
    if (!readSaved()) { status('timing-status', 'dirty', 'No saved timings were found for this recording and exact text selection.'); return; }
    proceed(restore, 'load the saved timings');
  } catch { status('timing-status', 'refused', 'The saved timings could not be loaded or matched to this recording and source. The stored record and current map have been kept unchanged.'); }
}
async function importTiming(event) {
  const file = event.target.files?.[0]; if (!file || !timing || !reading || !video) return;
  const token = ++importSequence, expectedContext = contextSequence, revision = mapRevision, expectedReading = reading, expectedVideo = video.videoId;
  const current = () => token === importSequence && revision === mapRevision && expectedContext === contextSequence
    && reading === expectedReading && video?.videoId === expectedVideo;
  try {
    if (file.size > MAX_TIMING_BYTES) throw Error('Too large');
    const raw = await file.text();
    if (!current()) return;
    const next = validateTiming(raw, expectedReading, expectedVideo);
    proceed(() => {
      if (expectedContext !== contextSequence || reading !== expectedReading || video?.videoId !== expectedVideo || revision !== mapRevision) return;
      replaceTiming(next); status('timing-status', dirty ? 'dirty' : 'loaded', 'Timing file loaded. Save on this device if you want to keep a local copy.');
    }, 'import a different timing map');
  } catch { if (current()) status('timing-status', 'refused', 'This file is too large, malformed, or belongs to another recording or source edition. Your current map is unchanged.'); }
  finally { if (event.target.files?.[0] === file) event.target.value = ''; }
}

$('video-form').addEventListener('submit', loadVideo);
$('video-url').addEventListener('input', updateFallback);
$('video-disconnect').addEventListener('click', () => detachPlayer('Video disconnected. Your current timings remain open to save or export.'));
$('source-mode').addEventListener('change', chooserChanged);
$('source-page').addEventListener('input', chooserChanged);
$('source-find').addEventListener('click', () => { void browse(); });
$('source-group').addEventListener('change', updateControls);
$('source-open').addEventListener('click', () => {
  const mode = $('source-mode').value;
  if (mode === 'japji') proceed(() => { void openSource(() => source.japji()); }, 'open complete Japji Sahib');
  else if (optionBinding && options.some(option => option.id === $('source-group').value)) {
    const {collectionId, page} = optionBinding, unitId = $('source-group').value;
    proceed(() => { void openSource(() => source.group(collectionId, page, unitId)); }, 'change the source passage');
  }
});
textPanel.addEventListener('keydown', event => {
  if (!reading || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  let index = lineIndices.get(selectedId) ?? 0;
  index = event.key === 'Home' ? 0 : event.key === 'End' ? reading.lines.length - 1
    : Math.max(0, Math.min(reading.lines.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
  selectLine(reading.lines[index].id, {focus: true, reveal: true});
});
$('mark-selected').addEventListener('click', () => { if (selectedId) mark(selectedId); });
$('mark-next').addEventListener('click', () => {
  const index = lineIndices.get(selectedId);
  if (reading && index !== undefined && index + 1 < reading.lines.length) mark(reading.lines[index + 1].id, {select: true});
});
$('mark-pause').addEventListener('click', () => mark(null));
$('timing-undo').addEventListener('click', () => {
  const previous = undo.pop(); if (!previous) return;
  replaceTiming(previous, {keepUndo: false});
  status('timing-status', dirty ? 'dirty' : 'loaded', 'Previous timing map restored.');
});
$('follow-timings').addEventListener('change', () => { if (activeId) revealRow(activeId, {follow: true}); });
$('timing-save').addEventListener('click', saveTiming);
$('timing-load').addEventListener('click', loadSaved);
$('timing-export').addEventListener('click', exportTiming);
$('timing-import').addEventListener('change', event => { void importTiming(event); });
$('timing-replay').addEventListener('click', () => {
  if (!timing?.cues.length) return;
  if (seek(timing.cues[0].at / 1000))
    status('timing-status', dirty ? 'dirty' : 'loaded', 'Moved to the first marker. Use the YouTube Play control to replay.');
});
$('timing-clear').addEventListener('click', () => {
  if (!timing || !reading || !video) return;
  const expectedContext = contextSequence;
  proceed(() => {
    if (expectedContext !== contextSequence || !reading || !video) return;
    replaceTiming(emptyTiming(video.videoId, reading));
    status('timing-status', dirty ? 'dirty' : 'idle', 'Current markers cleared. Saved timings on this device have not been changed.');
  }, 'clear the current map');
});
$('timing-delete').addEventListener('click', () => {
  if (!timing || !reading || !video) return;
  try {
    localStorage.removeItem(timingKey(video.videoId, reading));
    baseline = serializeTiming(emptyTiming(video.videoId, reading)); dirty = serializeTiming(timing) !== baseline;
    renderTiming(); status('timing-status', dirty ? 'dirty' : 'idle', 'Saved timings deleted from this device. Your current map remains open.');
  } catch { status('timing-status', 'refused', 'Saved timings could not be deleted on this device. Your current map remains open.'); }
});
$('discard-cancel').addEventListener('click', () => { pendingAction = null; $('discard-dialog').close(); });
$('discard-confirm').addEventListener('click', finishPending);
$('discard-export').addEventListener('click', exportTiming);
$('discard-save').addEventListener('click', () => {
  if (saveTiming()) finishPending(); else text('discard-status', 'Saving was not available. Export a copy or keep editing.');
});
$('discard-dialog').addEventListener('close', () => {
  pendingAction = null;
  if ((controller || connecting) && mount.childElementCount) {
    mount.hidden = false; $('player-placeholder').hidden = true;
  }
  if (dialogReturn?.isConnected) dialogReturn.focus({preventScroll: true});
  dialogReturn = null;
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { try { controller?.pause(); } catch {} } });
window.addEventListener('pagehide', () => detachPlayer('Video disconnected. Choose Load video to connect again.'));
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });

chooserChanged(); updateFallback(); renderTiming();
void openSource(() => source.japji());
