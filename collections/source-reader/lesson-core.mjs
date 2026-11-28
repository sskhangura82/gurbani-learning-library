// A narrow editorial bridge. Source identity comes only from verified source
// objects; editorial bytes are covered by the closed bundle's declared input
// hashes and HTML SRI. Passing this contract is not semantic or Claude approval.
import {verifiedSourceIdentity} from './core.mjs';
import {LESSONS} from './lesson-data.mjs';

const EDITION = 'shabados-5.0.0-next.0-SGGS-SSA2';
const MANIFEST = '04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def';
const ADMISSIONS = Object.freeze({
  DMP: Object.freeze({id: 'lesson.sggs.dmp.r1',
    sha256: 'ae2d9ba49508ddb5b05c818c55925fa7e51c9067aa62a26f00730c4babcd6566',
    lines: Object.freeze(['0NVY', 'RBP6', 'J92N', 'K0U6', 'BL70', 'GJW9', 'ZERL', '9MN2', 'MK1Q', 'H0PC']),
    sections: Object.freeze([['0NVY'], ['RBP6'], ['J92N', 'K0U6'], ['BL70', 'GJW9', 'ZERL', '9MN2', 'MK1Q', 'H0PC']].map(Object.freeze))}),
  LLL: Object.freeze({id: 'lesson.sggs.lll.r1',
    sha256: '55bd7530247d2464e0cde6eac490588557c8f1676d3e618737d7006dce4d6eab',
    lines: Object.freeze(['60LK', 'UVSL', 'GLXS', 'P2VG', 'MX4P', 'FKUU'])})
});
const SOURCE_URLS = new Set([
  'https://www.shabados.com/docs/database/sources/',
  'https://www.gurugranthdarpan.net/0001.html',
  'https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=1',
  'https://www.srigranth.org/guru_granth_sahib.html'
]);
const LEVELS = ['simple', 'detailed', 'deep'];
const ROOT_KEYS = ['id', 'revision', 'collectionId', 'editionId', 'manifestSha256', 'unitId', 'unitSha256',
  'lineIds', 'title', 'coverage', 'review', 'sections', 'sources', 'reflection', 'questions', 'psychologyLink'];

function need(condition, code) {
  if (!condition) { const error = new Error(code); error.code = code; throw error; }
}
function keys(value, expected) {
  need(value !== null && typeof value === 'object' && !Array.isArray(value)
    && [Object.prototype, null].includes(Object.getPrototypeOf(value)), 'LESSON_SCHEMA');
  const actual = Object.keys(value);
  need(actual.length === expected.length && actual.every(key => expected.includes(key)), 'LESSON_SCHEMA');
}
function text(value, max = 8000) {
  need(typeof value === 'string' && value.trim().length > 0 && value.length <= max, 'LESSON_TEXT');
  need(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/u.test(value), 'LESSON_TEXT');
  for (const character of value) {
    const point = character.codePointAt(0);
    need(point < 0xd800 || point > 0xdfff, 'LESSON_TEXT');
  }
}
function bilingual(value, max) {
  keys(value, ['en', 'pa']); text(value.en, max); text(value.pa, max);
  need(/[A-Za-z]/.test(value.en) && /[\u0A00-\u0A7F]/u.test(value.pa), 'LESSON_LANGUAGES');
}
function same(left, right) { return JSON.stringify(left) === JSON.stringify(right); }
function list(value, minimum, maximum) {
  need(Array.isArray(value) && value.length >= minimum && value.length <= maximum, 'LESSON_LIST');
}
function identifier(value) { need(typeof value === 'string' && /^[a-z0-9][a-z0-9.-]{0,79}$/.test(value), 'LESSON_ID'); }
function orderedSubset(value, owningIds) {
  list(value, 1, owningIds.length);
  need(new Set(value).size === value.length && value.every(id => owningIds.includes(id))
    && same(value, owningIds.filter(id => value.includes(id))), 'LESSON_LINE_BINDING');
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
function sourceAdmission(manifest, unit) {
  const identity = verifiedSourceIdentity(manifest, unit);
  const admitted = identity.collectionId === 'sggs' && Object.hasOwn(ADMISSIONS, identity.unitId) && ADMISSIONS[identity.unitId];
  if (!admitted) return null;
  need(identity.editionId === EDITION && identity.manifestSha256 === MANIFEST
    && identity.unitSha256 === admitted.sha256
    && same(unit.lines.map(line => line.id), admitted.lines), 'LESSON_SOURCE_BINDING');
  return {identity, admitted};
}

// Exposed for focused contract tests and future explicitly admitted revisions.
// Callers cannot bless an arbitrary manifest by supplying its own matching pin.
export function validateLesson(lesson, manifest, unit) {
  const match = sourceAdmission(manifest, unit);
  need(match, 'LESSON_NOT_ADMITTED');
  const {identity, admitted} = match;
  keys(lesson, ROOT_KEYS);
  need(lesson.id === admitted.id && lesson.revision === 1
    && Object.entries(identity).every(([key, value]) => lesson[key] === value)
    && same(lesson.lineIds, admitted.lines), 'LESSON_BINDING');
  bilingual(lesson.title, 600);
  keys(lesson.coverage, ['en', 'pa']);
  need(lesson.coverage.en === 'COMPLETE_DRAFT' && lesson.coverage.pa === 'COMPLETE_DRAFT', 'LESSON_COVERAGE');
  keys(lesson.review, ['status', 'secondReview']);
  need(lesson.review.status === 'AI_ASSISTED_DRAFT' && lesson.review.secondReview === 'PENDING', 'LESSON_REVIEW');

  list(lesson.sources, 1, 8);
  const sourceIds = new Set();
  for (const source of lesson.sources) {
    keys(source, ['id', 'label', 'url', 'locator']); identifier(source.id);
    text(source.label, 600); text(source.locator, 1200);
    need(!sourceIds.has(source.id) && SOURCE_URLS.has(source.url), 'LESSON_SOURCE_REFERENCE');
    sourceIds.add(source.id);
  }
  need(lesson.sources.some(source => source.id === 'original'
    && source.url === 'https://www.shabados.com/docs/database/sources/'), 'LESSON_PRIMARY_SOURCE');

  list(lesson.sections, 1, admitted.lines.length);
  const sectionIds = new Set(), covered = [];
  for (const section of lesson.sections) {
    keys(section, ['id', 'title', 'lineIds', ...LEVELS]); identifier(section.id);
    need(!sectionIds.has(section.id), 'LESSON_SECTION'); sectionIds.add(section.id);
    bilingual(section.title, 600); orderedSubset(section.lineIds, admitted.lines);
    covered.push(...section.lineIds);
    for (const level of LEVELS) {
      list(section[level], 1, 24);
      const levelLines = new Set();
      for (const paragraph of section[level]) {
        keys(paragraph, ['en', 'pa', 'lineIds', 'sourceIds']);
        bilingual({en: paragraph.en, pa: paragraph.pa}); orderedSubset(paragraph.lineIds, section.lineIds);
        paragraph.lineIds.forEach(id => levelLines.add(id));
        list(paragraph.sourceIds, 1, sourceIds.size);
        need(new Set(paragraph.sourceIds).size === paragraph.sourceIds.length
          && paragraph.sourceIds.every(id => sourceIds.has(id))
          && paragraph.sourceIds.includes('original'), 'LESSON_PARAGRAPH_SOURCE');
      }
      need(same([...levelLines], section.lineIds), 'LESSON_LEVEL_COVERAGE');
    }
  }
  need(same(covered, admitted.lines), 'LESSON_COMPLETE_COVERAGE');
  // DMP's provider grouping is larger than Pauri 1; keep its four displayed
  // subdivisions explicit without declaring a traditional recital boundary.
  if (admitted.sections) need(same(lesson.sections.map(section => section.lineIds), admitted.sections), 'LESSON_SECTION_BOUNDARIES');
  bilingual(lesson.reflection, 4000); list(lesson.questions, 1, 8);
  lesson.questions.forEach(question => bilingual(question, 2000));
  keys(lesson.psychologyLink, ['title', 'path', 'note']);
  bilingual(lesson.psychologyLink.title, 600); bilingual(lesson.psychologyLink.note, 4000);
  need(lesson.psychologyLink.path === '../../psychology/intellectual-humility.html', 'LESSON_PSYCHOLOGY_PATH');
  return freeze(lesson);
}

export function lessonForUnit(manifest, unit) {
  const match = sourceAdmission(manifest, unit);
  if (!match) return null;
  need(Array.isArray(LESSONS) && LESSONS.length === 2
    && same(LESSONS.map(lesson => lesson.id), ['lesson.sggs.dmp.r1', 'lesson.sggs.lll.r1']), 'LESSON_REGISTRY');
  const lesson = LESSONS.find(value => value.id === match.admitted.id);
  return validateLesson(lesson, manifest, unit);
}
