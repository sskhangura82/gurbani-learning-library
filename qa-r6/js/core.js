/* Pure reader state and validation. No DOM, credentials, or network access. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GLP = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const THEMES = Object.freeze(['day', 'amrit', 'system']);
  const MODES = Object.freeze(['read', 'understand', 'study']);
  const RAAG_STATES = Object.freeze(['specified', 'no_heading_specified', 'unchecked', 'unresolved_or_disputed']);
  const KEY = 'glp001.qa-r6.reader.v1';
  const firstLine = 'sggs.japji.pauri02.line01';
  const validLine = id => typeof id === 'string' && /^sggs\.japji\.pauri02\.line0[1-6]$/.test(id);
  const plainObject = x => !!x && typeof x === 'object' && !Array.isArray(x);
  const finite = (x, fallback) => typeof x === 'number' && Number.isFinite(x) ? x : fallback;
  const clip = (x, n) => typeof x === 'string' ? x.slice(0, n) : '';
  function defaults() {
    return {schemaVersion: 3, mode: 'understand', fontSize: 29, anchor: firstLine,
      bookmarks: [], note: '', appearance: {theme:'day', halo:false}};
  }
  function normalize(input) {
    const d = defaults();
    if (!plainObject(input)) return d;
    if (MODES.includes(input.mode)) d.mode = input.mode;
    d.fontSize = Math.min(40, Math.max(23, finite(input.fontSize, d.fontSize)));
    if (validLine(input.anchor)) d.anchor = input.anchor;
    if (Array.isArray(input.bookmarks)) d.bookmarks = [...new Set(input.bookmarks.filter(validLine))].slice(0, 6);
    d.note = clip(input.note, 12000);
    if (plainObject(input.appearance)) {
      if (THEMES.includes(input.appearance.theme)) d.appearance.theme=input.appearance.theme;
      d.appearance.halo=input.appearance.halo===true;
    }
    // Ignore legacy audio fields: this version is a reader, not a media player.
    return d;
  }
  function readState(storage) {
    try { return {state: normalize(JSON.parse(storage.getItem(KEY))), persisted: true}; }
    catch (_) { return {state: defaults(), persisted: false}; }
  }
  function saveState(storage, state) {
    try { storage.setItem(KEY, JSON.stringify(normalize(state))); return true; }
    catch (_) { return false; }
  }
  function setMode(state, mode) {
    if (!MODES.includes(mode)) throw new Error('Unknown reading mode');
    return {...state, mode};
  }
  function toggleBookmark(state, id) {
    if (!validLine(id)) throw new Error('Unknown scripture occurrence');
    const items = new Set(state.bookmarks);
    items.has(id) ? items.delete(id) : items.add(id);
    return {...state, bookmarks: [...items]};
  }
  function exportState(state) {
    return JSON.stringify({format:'glp-learning-export', version:3, projectId:'GLP-001', state:normalize(state)}, null, 2);
  }
  function importState(text) {
    if (typeof text !== 'string' || text.length > 100000) throw new Error('The learning file is too large.');
    let obj;
    try { obj=JSON.parse(text); } catch (_) { throw new Error('This is not valid JSON. Your current learning was not changed.'); }
    if (!plainObject(obj) || obj.format !== 'glp-learning-export' || ![1,2,3].includes(obj.version) || obj.projectId !== 'GLP-001' || !plainObject(obj.state)) {
      throw new Error('This file is not a supported GLP-001 learning export.');
    }
    return normalize(obj.state);
  }
  function raagLabel(association) {
    if (!association || !RAAG_STATES.includes(association.status)) return 'Not yet checked';
    return {specified: association.name || 'Specified; name pending', no_heading_specified:'No raag specified',
      unchecked:'Not yet checked', unresolved_or_disputed:'Unresolved / disputed'}[association.status];
  }
  function validateContent(c) {
    const errors=[];
    if (c.projectId !== 'GLP-001') errors.push('Unexpected project ID');
    const ls = c.scripture?.lines;
    if (!Array.isArray(ls) || ls.length !== 6) errors.push('Pauri 2 must contain all six lines');
    const ids = new Set();
    for (const line of ls || []) {
      if (ids.has(line.id)) errors.push('Duplicate occurrence ID');
      ids.add(line.id);
      if (!line.text || !line.sha256 || !line.sourceIds?.length) errors.push('Source text lacks provenance');
      const e=c.explanations?.[line.id];
      if (!e?.english || !e?.punjabi || !e?.study) errors.push('Missing explanation');
      if (e?.humanReviewed !== false) errors.push('Unverified human review claim');
    }
    if (!RAAG_STATES.includes(c.scripture?.raag?.status)) errors.push('Unknown raag state');
    if (c.scripture?.raag?.status==='no_heading_specified' && c.scripture.raag.name !== null) errors.push('Invented raag association');
    for (const card of c.related || []) {
      if (!card.context?.some(t=>t.includes(card.excerpt))) errors.push('Excerpt is not inside its enclosing unit');
      if (!card.sourceIds?.every(id=>c.sources[id])) errors.push('Unknown source');
      if (card.humanReviewed !== false) errors.push('Unverified connection approval');
    }
    if (c.coverage?.fullCorpus !== false || c.coverage?.lineAlignment !== false) errors.push('Overstated prototype coverage');
    return errors;
  }
  function deepFreeze(obj) {
    if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {Object.values(obj).forEach(deepFreeze); Object.freeze(obj);}
    return obj;
  }
  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  return {THEMES, MODES, RAAG_STATES, KEY, defaults, normalize, readState, saveState, setMode, toggleBookmark,
    exportState, importState, raagLabel, validateContent, deepFreeze, escapeHTML};
});
