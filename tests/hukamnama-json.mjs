import assert from 'node:assert/strict';
import {parseStrictJSON} from '../hukamnama/json.mjs';

let passed = 0, failed = 0;
function check(name, run) {
  try { run(); passed++; console.log('PASS ' + name); }
  catch (error) { failed++; console.error('FAIL ' + name + '\n' + error.stack); }
}
function agrees(text) { assert.deepEqual(parseStrictJSON(text), JSON.parse(text)); }

check('ordinary JSON whitespace, key order, arrays, numbers and primitives retain native meaning', () => {
  for (const text of [
    ' \t\r\n{ "z": [true, false, null, -0, 1.25, -2e3, 4E+2], "a": {} } \r\n',
    '[]', '{}', 'true', 'false', 'null', '-0', '1e400', '9007199254740993',
    '"Gurmukhi ਪੰਜਾਬੀ and emoji 😀"',
  ]) agrees(text);
  assert.deepEqual(Object.keys(parseStrictJSON('{"z":1,"a":2}')), ['z', 'a']);
  assert(Object.is(parseStrictJSON('-0'), -0));
});
check('string escapes and quoted delimiters are not scanned as structures', () => {
  for (const value of [
    'quoted { braces } [ brackets ] : , and "quotes"',
    'embedded JSON {"same":1,"same":2} is only a string',
    'backslash \\ then " quote and \n newline',
    '\b\f\n\r\t',
  ]) agrees(JSON.stringify({value}));
  agrees('{"\\u0061":"\\u0A38\\uD83D\\uDE00","slash":"\\/","quote":"\\\""}');
});
check('nested objects may reuse keys only in distinct objects', () => {
  agrees('{"same":{"same":1},"array":[{"same":2},{"same":3}]}');
});
check('duplicates at root, nested objects and array objects are rejected', () => {
  for (const text of ['{"a":1,"a":2}', '{"outer":{"x":1,"x":2}}', '[{"x":1,"x":2}]', '{"":1,"":2}']) {
    assert.throws(() => parseStrictJSON(text), /Duplicate JSON object key/);
  }
});
check('escaped-equivalent keys are duplicates regardless of spelling order', () => {
  for (const text of [
    '{"a":1,"\\u0061":2}', '{"\\u0061":1,"a":2}',
    '{"é":1,"\\u00e9":2}', '{"x\\ny":1,"x\\u000ay":2}',
    '{"\\\\":1,"\\u005c":2}', '{"😀":1,"\\ud83d\\ude00":2}',
  ]) assert.throws(() => parseStrictJSON(text), /Duplicate JSON object key/);
});
check('Unicode canonical equivalence is not silently imposed on distinct keys', () => {
  agrees('{"é":1,"é":2}');
  assert.equal(Object.keys(parseStrictJSON('{"é":1,"é":2}')).length, 2);
});
check('a discarded duplicate value cannot hide protected content', () => {
  const text = '{"text":"SYNTHETIC_HIDDEN_PROTECTED_CONTENT","text":"accepted original"}';
  assert.throws(() => parseStrictJSON(text), error => {
    assert(error instanceof SyntaxError);
    assert.match(error.message, /Duplicate/);
    assert(!error.message.includes('SYNTHETIC_HIDDEN_PROTECTED_CONTENT'));
    return true;
  });
});
check('prototype-like keys remain ordinary own data properties', () => {
  const value = parseStrictJSON('{"__proto__":{"syntheticFlag":true},"constructor":1}');
  assert.equal(Object.getPrototypeOf(value), Object.prototype);
  assert(Object.hasOwn(value, '__proto__'));
  assert.equal({}.syntheticFlag, undefined);
  assert.throws(() => parseStrictJSON('{"__proto__":1,"\\u005f_proto__":2}'), /Duplicate/);
});
check('malformed objects, arrays, literals and numbers are rejected', () => {
  for (const text of [
    '', ' ', '{', '[', '{"x":1,}', '[1,]', '{"x" 1}', '{"x":}', '[1 2]',
    '{"x":1 "y":2}', '{"x":[1}', '{x:1}', '--1', '01', '1.', '+1', '.1',
    '1e', '[truefalse]', 'NaN', 'Infinity', 'undefined', 'nul', 'False',
  ]) assert.throws(() => parseStrictJSON(text), SyntaxError, text);
});
check('malformed string escapes and unterminated strings are rejected', () => {
  for (const text of ['{"\\uZZZZ":1}', '{"x":"\\x41"}', '"unterminated', '"\\', '"\\u12"', '"\\v"']) {
    assert.throws(() => parseStrictJSON(text), SyntaxError, text);
  }
});
check('raw control characters inside strings are rejected', () => {
  for (const character of ['\0', '\n', '\r', '\t', '\b', '\u001f']) {
    assert.throws(() => parseStrictJSON('"before' + character + 'after"'), SyntaxError);
  }
});
check('trailing text, comments, extra values and non-JSON whitespace are rejected', () => {
  for (const text of ['{} {}', '{}/* comment */', 'true\0', '{"x":1}\u00a0', '\ufeff{}', '{}\u2028', '0false']) {
    assert.throws(() => parseStrictJSON(text), SyntaxError, text);
  }
});
check('forty nested containers are allowed and forty-one are refused', () => {
  agrees('['.repeat(40) + '0' + ']'.repeat(40));
  assert.throws(() => parseStrictJSON('['.repeat(41) + '0' + ']'.repeat(41)), RangeError);
  agrees('{"x":'.repeat(40) + '0' + '}'.repeat(40));
  assert.throws(() => parseStrictJSON('{"x":'.repeat(41) + '0' + '}'.repeat(41)), RangeError);
});
check('large strings containing braces do not increase structural depth', () => {
  agrees(JSON.stringify('{['.repeat(1000)));
});
check('text bound supports a large cached pair and refuses larger input before parsing', () => {
  const maximum = 2_621_440;
  assert.equal(parseStrictJSON('"' + 'a'.repeat(maximum - 2) + '"').length, maximum - 2);
  assert.throws(() => parseStrictJSON('"' + 'a'.repeat(maximum - 1) + '"'), RangeError);
});
check('non-string input is never implicitly converted', () => {
  for (const value of [null, undefined, 1, {}, [], true]) assert.throws(() => parseStrictJSON(value), TypeError);
});

console.log('Strict JSON checks: ' + passed + ' passed; ' + failed + ' failed.');
if (failed) process.exitCode = 1;
