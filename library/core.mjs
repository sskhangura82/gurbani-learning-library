import {READERS, COLLECTIONS, EXPLORE, TOOLS, PLANNED} from './catalog.mjs';

const VIEWS = Object.freeze(['today', 'read', 'explore', 'saved']);

// URL state chooses only one of four known screens. An ambiguous or malformed
// selection does not choose a reader or change any saved learning.
export function parseView(search = '') {
  if (typeof search !== 'string' && !(search instanceof URLSearchParams)) return 'today';
  const params = new URLSearchParams(search);
  const values = params.getAll('view');
  return values.length === 1 && VIEWS.includes(values[0]) ? values[0] : 'today';
}

// This normalization applies only to directory labels and explicit aliases.
// Scripture bytes, source identifiers and saved records are never normalized here.
function words(value) {
  return value.normalize('NFKC')
    .replace(/\p{Cf}/gu, '')
    .toLocaleLowerCase('en')
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(Boolean);
}

export function searchEntries(query, entries = READERS) {
  if (typeof query !== 'string' || !Array.isArray(entries)) return [];
  if (!query.trim()) return [...entries];
  const required = words(query);
  if (!required.length) return [];
  return entries.filter(entry => {
    if (!entry || typeof entry !== 'object') return false;
    const labels = [entry.title, entry.titlePa, ...(Array.isArray(entry.aliases) ? entry.aliases : [])]
      .filter(value => typeof value === 'string');
    const allowed = new Set(labels.flatMap(words));
    return required.every(word => allowed.has(word));
  });
}

export function getReader(id) {
  return typeof id === 'string' ? READERS.find(entry => entry.id === id) : undefined;
}

export function getEntry(id) {
  if (typeof id !== 'string') return undefined;
  return [...READERS, ...COLLECTIONS, ...EXPLORE, ...TOOLS, ...PLANNED].find(entry => entry.id === id);
}
