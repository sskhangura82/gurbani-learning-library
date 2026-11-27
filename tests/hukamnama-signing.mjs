/* Actual original-only source capture, ephemeral in-memory keys, no private-key files. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash, generateKeyPairSync, sign, webcrypto} from 'node:crypto';
import {sealPayload} from '../tools/sign-hukamnama.mjs';
import {decodeEvent, decodeSource} from '../hukamnama/delivery.mjs';

if (!globalThis.crypto) globalThis.crypto = webcrypto;
const directory = new URL('../evidence/daily-hukamnama/capture-2026-11-27/', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('manifest.json', directory), 'utf8'));
const [payloadBytes, sourceBytes, receiptBytes] = await Promise.all(
  ['payload', 'source', 'receipt'].map(kind => fs.readFile(new URL(manifest[kind].path, directory)))
);
const payload = JSON.parse(payloadBytes), receipt = JSON.parse(receiptBytes);
const keyPair = generateKeyPairSync('ec', {namedCurve: 'prime256v1'});
const publicKey = keyPair.publicKey.export({format: 'jwk'});
const keyId = 'ephemeral-signer-test';
const now = new Date(Date.parse(payload.checkedAtUtc) + 60_000);
const options = {payloadBytes, sourceBytes, receiptBytes, privateKey: keyPair.privateKey, publicKey, keyId, now};
const bytes = value => Buffer.from(JSON.stringify(value, null, 2) + '\n', 'utf8');
const digest = value => createHash('sha256').update(value).digest('hex');
const buffer = value => value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
const copy = value => structuredClone(value);
function duplicateField(raw, key, encodedKey = JSON.stringify(key)) {
  const text = raw.toString('utf8'), needle = JSON.stringify(key) + ':';
  assert(text.includes(needle));
  return Buffer.from(text.replace(needle, encodedKey + ':"SYNTHETIC_HIDDEN_PROTECTED_VALUE",' + needle));
}
function changedReceipt(mutate) {
  const changed = copy(receipt), event = copy(payload);
  mutate(changed);
  const altered = bytes(changed);
  event.officialReceiptSha256 = digest(altered);
  return {...options, receiptBytes: altered, payloadBytes: bytes(event)};
}
let passed = 0, failed = 0;
async function check(name, run) {
  try { await run(); passed++; console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name + '\n' + error.stack); }
}

await check('actual full cross-Ang source seals and independently decodes with an ephemeral key', async () => {
  const sealed = await sealPayload(options);
  const event = await decodeEvent(buffer(sealed.envelope), payload.date, {now, publicKey, keyId});
  const source = await decodeSource(buffer(sourceBytes), event);
  const official = [receipt.original.gheading1, receipt.original.gheading2, receipt.original.ghukamnama].filter(Boolean).join(' ');
  assert.equal(source.occurrences.map(line => line.text).join(' '), official);
  assert.equal(source.occurrences.length, 7);
  assert.equal(source.angStart, 719);
  assert.equal(source.angEnd, 720);
  assert.equal(event.publicationApproved, false);
  assert.deepEqual(event.lessons, {simple: null, detailed: null, learning: null});
  assert.equal(Buffer.from(JSON.parse(sealed.envelope).signature, 'base64').length, 64);
});
await check('receipt and payload carry the same canonical UTC retrieval timestamp', async () => {
  assert.match(receipt.checkedAtUtc, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/);
  assert.equal(receipt.checkedAtUtc, payload.checkedAtUtc);
  const altered = changedReceipt(value => value.checkedAtUtc = new Date(Date.parse(value.checkedAtUtc) + 1000).toISOString());
  await assert.rejects(() => sealPayload(altered), /retrieval time|date, clock or source digest/);
});
await check('raw receipt tampering cannot reuse the old receipt digest', async () => {
  const changed = copy(receipt);
  changed.original.gfooter1 += ' synthetic altered metadata';
  await assert.rejects(() => sealPayload({...options, receiptBytes: bytes(changed)}), /receipt bytes|observed original\/date field/);
});
await check('rehashed receipt with changed full original cannot reuse the selected source', async () => {
  await assert.rejects(() => sealPayload(changedReceipt(value => value.original.ghukamnama += ' synthetic mutation')), /complete (?:source|original)/);
});
await check('rehashed truncated source cannot omit the continuation ending', async () => {
  const changedSource = JSON.parse(sourceBytes), event = copy(payload);
  changedSource.occurrences.pop();
  const alteredSource = bytes(changedSource);
  event.source.sha256 = digest(alteredSource);
  await assert.rejects(() => sealPayload({...options, sourceBytes: alteredSource, payloadBytes: bytes(event)}));
});
await check('wrong private key cannot seal against the selected public key', async () => {
  const other = generateKeyPairSync('ec', {namedCurve: 'prime256v1'});
  await assert.rejects(() => sealPayload({...options, privateKey: other.privateKey}), /Private key/);
});
await check('a signed event cannot verify against a different public key', async () => {
  const sealed = await sealPayload(options);
  const other = generateKeyPairSync('ec', {namedCurve: 'prime256v1'});
  await assert.rejects(() => decodeEvent(buffer(sealed.envelope), payload.date, {
    now, keyId, publicKey: other.publicKey.export({format: 'jwk'})
  }), /signature/);
});
await check('non-null unreviewed explanation is refused before sealing', async () => {
  const event = copy(payload);
  event.lessons.simple = {en: {status: 'DRAFT_AI_UNREVIEWED', content: 'Synthetic test placeholder.'}};
  await assert.rejects(() => sealPayload({...options, payloadBytes: bytes(event)}), /qualified explanatory/);
});
await check('protected commentary field is excluded even from a rehashed original receipt', async () => {
  await assert.rejects(() => sealPayload(changedReceipt(value => value.original.ghukamnamadesc = 'SYNTHETIC_PROTECTED_FIELD')), /allowlist|unapproved fields/);
});
await check('rehashed receipt starting Ang must agree with the full verified source span', async () => {
  await assert.rejects(() => sealPayload(changedReceipt(value => value.original.ang = '718')), /Ang|starting|span/);
});
await check('rehashed receipt displayed time must agree with the dated event', async () => {
  await assert.rejects(() => sealPayload(changedReceipt(value => value.original.hukamnama_time = '06:00:00')), /time/);
});
await check('duplicate payload field cannot hide a discarded value before sealing', async () => {
  await assert.rejects(() => sealPayload({...options, payloadBytes: duplicateField(payloadBytes, 'id')}), /Duplicate/);
});
await check('escaped-equivalent duplicate original field cannot hide in rehashed source bytes', async () => {
  const alteredSource = duplicateField(sourceBytes, 'text', '"te\\u0078t"'), event = copy(payload);
  event.source.sha256 = digest(alteredSource);
  await assert.rejects(() => sealPayload({...options, sourceBytes: alteredSource, payloadBytes: bytes(event)}), /Duplicate/);
});
await check('nested duplicate original field cannot hide in a rehashed receipt', async () => {
  const alteredReceipt = duplicateField(receiptBytes, 'gheading1'), event = copy(payload);
  event.officialReceiptSha256 = digest(alteredReceipt);
  await assert.rejects(() => sealPayload({...options, receiptBytes: alteredReceipt, payloadBytes: bytes(event)}), /Duplicate/);
});
await check('reader rejects duplicate envelope fields even when the remaining payload signature is valid', async () => {
  const sealed = await sealPayload(options);
  const alteredEnvelope = duplicateField(sealed.envelope, 'payload');
  await assert.rejects(() => decodeEvent(buffer(alteredEnvelope), payload.date, {now, publicKey, keyId}));
});
await check('reader rejects duplicate decoded payload fields even with a valid ephemeral signature', async () => {
  const sealed = await sealPayload(options), envelope = JSON.parse(sealed.envelope);
  const alteredPayload = duplicateField(payloadBytes, 'date');
  envelope.payload = alteredPayload.toString('base64');
  envelope.signature = sign('sha256', alteredPayload, {key: keyPair.privateKey, dsaEncoding: 'ieee-p1363'}).toString('base64');
  await assert.rejects(() => decodeEvent(buffer(bytes(envelope)), payload.date, {now, publicKey, keyId}));
});

console.log('Signing checks: ' + passed + ' passed; ' + failed + ' failed. Keys existed only in memory.');
if (failed) process.exitCode = 1;
