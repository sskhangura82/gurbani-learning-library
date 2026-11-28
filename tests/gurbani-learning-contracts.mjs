// Actual public lesson/source bytes plus synthetic adversarial mutations only.
// These tests check bindings and delivery, never doctrinal or Claude approval.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {verifyManifest, verifyChunk, verifiedSourceIdentity} from '../collections/source-reader/core.mjs';
import {lessonForUnit, validateLesson} from '../collections/source-reader/lesson-core.mjs';
import {LESSONS} from '../collections/source-reader/lesson-data.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => fs.readFile(path.join(root, name));
const hash = value => createHash('sha256').update(value).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const sggsPin = {collectionId: 'sggs', editionId: 'shabados-5.0.0-next.0-SGGS-SSA2', bytes: 1116397,
  sha256: '04da157b5e7ba85ce0fe35aae983baba3284bc75990be374e556ab3c52da5def'};
const manifestBytes = await read('collections/source-data/sggs/manifest.json');
const chunkBytes = await read('collections/source-data/sggs/chunks/c0001.json');
const manifest = await verifyManifest(manifestBytes, sggsPin);
const chunk = await verifyChunk(chunkBytes, manifest.chunks[0], manifest);
const dmp = chunk.units.find(unit => unit.id === 'DMP');
const lll = chunk.units.find(unit => unit.id === 'LLL');
const originalLesson = id => clone(LESSONS.find(lesson => lesson.unitId === id));
const dmpLines = ['0NVY', 'RBP6', 'J92N', 'K0U6', 'BL70', 'GJW9', 'ZERL', '9MN2', 'MK1Q', 'H0PC'];
const lllLines = ['60LK', 'UVSL', 'GLXS', 'P2VG', 'MX4P', 'FKUU'];

test('The two admitted lessons cover the actual complete opening groups at all six language/depth choices', () => {
  assert.deepEqual(LESSONS.map(lesson => lesson.id), ['lesson.sggs.dmp.r1', 'lesson.sggs.lll.r1']);
  for (const [unit, lines] of [[dmp, dmpLines], [lll, lllLines]]) {
    const before = JSON.stringify(unit), lesson = lessonForUnit(manifest, unit);
    assert.equal(lesson.unitSha256, hash(before));
    assert.equal(lesson.manifestSha256, sggsPin.sha256);
    assert.deepEqual(lesson.lineIds, lines);
    assert.deepEqual(lesson.sections.flatMap(section => section.lineIds), lines);
    for (const level of ['simple', 'detailed', 'deep']) {
      const covered = new Set(lesson.sections.flatMap(section => section[level].flatMap(paragraph => paragraph.lineIds)));
      assert.deepEqual([...covered], lines);
      for (const section of lesson.sections) for (const paragraph of section[level]) {
        assert.match(paragraph.en, /[A-Za-z]/);
        assert.match(paragraph.pa, /[\u0A00-\u0A7F]/u);
      }
    }
    assert.deepEqual(lesson.review, {status: 'AI_ASSISTED_DRAFT', secondReview: 'PENDING'});
    assert.equal(JSON.stringify(unit), before, 'validating learning never edits original text');
    assert.ok(Object.isFrozen(lesson) && Object.isFrozen(lesson.sections[0].simple[0]));
    assert.throws(() => { lesson.sections[0].simple[0].en = 'changed'; }, TypeError);
  }
  assert.deepEqual(lessonForUnit(manifest, dmp).sections.map(section => section.lineIds), [
    ['0NVY'], ['RBP6'], ['J92N', 'K0U6'], ['BL70', 'GJW9', 'ZERL', '9MN2', 'MK1Q', 'H0PC']
  ], 'DMP retains its four teaching subdivisions and is never reduced to Pauri 1');
});

test('A verified byte receipt refuses copied or cross-instance source objects', async () => {
  assert.deepEqual(verifiedSourceIdentity(manifest, dmp), {collectionId: 'sggs', editionId: sggsPin.editionId,
    manifestSha256: sggsPin.sha256, unitId: 'DMP', unitSha256: hash(JSON.stringify(dmp))});
  assert.throws(() => lessonForUnit(clone(manifest), dmp), /SOURCE_UNVERIFIED_MANIFEST/);
  assert.throws(() => lessonForUnit(manifest, clone(dmp)), /SOURCE_UNVERIFIED_UNIT/);
  const secondManifest = await verifyManifest(manifestBytes, sggsPin);
  assert.throws(() => lessonForUnit(secondManifest, dmp), /SOURCE_UNVERIFIED_UNIT/);
});

test('An independently repinned manifest cannot transfer the lesson to changed source metadata', async () => {
  const changed = clone(manifest); changed.sections[0].name.Latn = 'Synthetic altered section';
  const bytes = Buffer.from(JSON.stringify(changed) + '\n');
  const other = await verifyManifest(bytes, {...sggsPin, bytes: bytes.length, sha256: hash(bytes)});
  const otherChunk = await verifyChunk(chunkBytes, other.chunks[0], other);
  const sameText = otherChunk.units.find(unit => unit.id === 'DMP');
  assert.deepEqual(sameText, dmp, 'unit bytes deliberately remain identical in this fixture');
  assert.throws(() => lessonForUnit(other, sameText), /LESSON_SOURCE_BINDING/);
});

test('Neighbouring and Dasam source groups never inherit opening explanations', async () => {
  const neighbour = chunk.units.find(unit => unit.id === 'ZKH');
  assert.equal(lessonForUnit(manifest, neighbour), null);
  assert.throws(() => validateLesson(originalLesson('DMP'), manifest, neighbour), /LESSON_NOT_ADMITTED/);
  assert.throws(() => validateLesson(originalLesson('DMP'), manifest, lll), /LESSON_BINDING/);
  const bytes = await read('collections/source-data/dasam/manifest.json');
  const other = await verifyManifest(bytes, {collectionId: 'dasam', editionId: 'shabados-5.0.0-next.0-SDGR-DGDG',
    bytes: 1101376, sha256: '2ba6005655429eeb07b4477d4bf9a18b4f62e86224107d72793ec5f2bd441ad6'});
  const original = await verifyChunk(await read('collections/source-data/dasam/chunks/c0001.json'), other.chunks[0], other);
  assert.equal(lessonForUnit(other, original.units[0]), null);
});

test('Lesson binding refuses legacy identity, stale digests, changed revisions and incomplete or reordered source rows', () => {
  const changes = [
    value => { value.collectionId = 'dasam'; },
    value => { value.editionId = 'edition.sggs.opengranth-34d2a7c'; },
    value => { value.manifestSha256 = '0'.repeat(64); },
    value => { value.unitId = 'LLL'; },
    value => { value.unitSha256 = 'a4df72d9dc683a83f229048df86ef66a9ba2df9d63253b3b3de7a9748f51f306'; },
    value => { value.id = 'lesson.haumai.r1'; },
    value => { value.revision = 2; },
    value => { value.lineIds.pop(); },
    value => { value.lineIds.reverse(); },
    value => { value.lineIds[0] = 'mool.line01'; }
  ];
  for (const change of changes) {
    const lesson = originalLesson('DMP'); change(lesson);
    assert.throws(() => validateLesson(lesson, manifest, dmp), /LESSON_BINDING/);
  }
});

test('Review status cannot be promoted by an editable lesson field', () => {
  for (const change of [value => { value.review.status = 'APPROVED'; },
    value => { value.review.secondReview = 'CLAUDE_APPROVED'; },
    value => { value.review.reviewer = 'Claude'; },
    value => { value.humanReviewed = true; },
    value => { value.coverage.pa = 'COMPLETE_APPROVED'; }]) {
    const lesson = originalLesson('DMP'); change(lesson);
    assert.throws(() => validateLesson(lesson, manifest, dmp), /LESSON_(SCHEMA|REVIEW|COVERAGE)/);
  }
});

test('Every section and level requires complete ordered ownership and resolvable paragraph references', () => {
  const changes = [
    value => { value.sections.pop(); },
    value => { value.sections.reverse(); },
    value => { value.sections[1].id = value.sections[0].id; },
    value => { value.sections[0].lineIds = ['60LK']; },
    value => { value.sections[0].simple[0].lineIds = ['RBP6']; },
    value => { value.sections[0].simple[0].lineIds = ['0NVY', '0NVY']; },
    value => { value.sections[0].deep = []; },
    value => { value.sections.at(-1).simple.reverse(); },
    value => { value.sections[0].detailed[0].sourceIds = ['not-inspected']; },
    value => { value.sections[0].detailed[0].sourceIds = ['darpan-1']; },
    value => { value.sections[0].simple[0].pa = ''; },
    value => { value.sections[0].simple[0].pa = 'English only'; },
    value => { value.sections[0].simple[0].en = '\ud800'; },
    value => { value.sections[0].simple[0].translationApproved = true; }
  ];
  for (const change of changes) {
    const lesson = originalLesson('DMP'); change(lesson);
    assert.throws(() => validateLesson(lesson, manifest, dmp), /LESSON_/);
  }
});

test('Editorial citation and psychology routes cannot become executable, private or unrelated destinations', () => {
  for (const url of ['javascript:alert(1)', 'https://example.invalid/commentary', '../private-library/index.html']) {
    const lesson = originalLesson('DMP'); lesson.sources[0].url = url;
    assert.throws(() => validateLesson(lesson, manifest, dmp), /LESSON_SOURCE_REFERENCE/);
  }
  for (const route of ['../../private-library/index.html', 'https://example.invalid/study', '../../psychology/intellectual-humility.html?note=private']) {
    const lesson = originalLesson('DMP'); lesson.psychologyLink.path = route;
    assert.throws(() => validateLesson(lesson, manifest, dmp), /LESSON_PSYCHOLOGY_PATH/);
  }
  const duplicate = originalLesson('DMP'); duplicate.sources.push(clone(duplicate.sources[0]));
  assert.throws(() => validateLesson(duplicate, manifest, dmp), /LESSON_SOURCE_REFERENCE/);
});
