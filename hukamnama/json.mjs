// Shared JSON syntax guard. JSON.parse alone silently discards duplicate keys.
// The scan retains no values, normalizes nothing, and never evaluates code.
const MAX_TEXT_LENGTH = 2_621_440; // UTF-16 code units; callers also bound raw bytes.
const MAX_DEPTH = 40; // Nested object/array containers, including a root container.
const whitespace = character => character === ' ' || character === '\t' || character === '\n' || character === '\r';

export function parseStrictJSON(text) {
  if (typeof text !== 'string') throw new TypeError('JSON input must be a string.');
  if (text.length > MAX_TEXT_LENGTH) throw new RangeError('JSON input exceeds the text limit.');
  let position = 0;
  const syntax = message => { throw new SyntaxError(message + ' at character ' + position + '.'); };
  const skipWhitespace = () => { while (whitespace(text[position])) position++; };

  function stringToken(decode) {
    if (text[position] !== '"') syntax('Expected a JSON string');
    const start = position++;
    while (position < text.length) {
      const character = text[position++];
      if (character === '"') {
        if (!decode) return;
        try { return JSON.parse(text.slice(start, position)); }
        catch { syntax('Malformed JSON string'); }
      }
      if (character.charCodeAt(0) < 0x20) syntax('Unescaped control character in JSON string');
      if (character === '\\') {
        if (position >= text.length) syntax('Unterminated JSON escape');
        // Skip one escaped character. JSON.parse validates all escape semantics.
        // In a Unicode escape the following hexadecimal digits contain no quotes.
        position++;
      }
    }
    syntax('Unterminated JSON string');
  }

  function primitive() {
    if (!'-0123456789tfn'.includes(text[position] || '\0')) syntax('Expected a JSON value');
    const start = position;
    while (position < text.length && !whitespace(text[position]) && !',]}'.includes(text[position])) position++;
    // A primitive cannot contain an object/array. Native JSON.parse validates its
    // numeric/literal grammar, without any opportunity to discard object keys.
    const token = text.slice(start, position);
    if (token.includes('{') || token.includes('[') || token.includes('"')) syntax('Malformed JSON primitive');
    try { JSON.parse(token); }
    catch { syntax('Malformed JSON primitive'); }
  }

  function value(depth) {
    skipWhitespace();
    const character = text[position];
    if (character === '"') { stringToken(false); return; }
    if (character !== '{' && character !== '[') { primitive(); return; }
    if (depth >= MAX_DEPTH) throw new RangeError('JSON nesting exceeds the depth limit.');
    const object = character === '{', closing = object ? '}' : ']';
    position++;
    skipWhitespace();
    if (text[position] === closing) { position++; return; }
    const keys = object ? new Set() : null;
    while (true) {
      if (object) {
        const key = stringToken(true);
        if (keys.has(key)) syntax('Duplicate JSON object key');
        keys.add(key);
        skipWhitespace();
        if (text[position] !== ':') syntax('Expected a colon after JSON object key');
        position++;
      }
      value(depth + 1);
      skipWhitespace();
      if (text[position] === closing) { position++; return; }
      if (text[position] !== ',') syntax('Expected a JSON separator or closing delimiter');
      position++;
      skipWhitespace();
      // The next iteration deliberately rejects a trailing comma.
    }
  }

  value(0);
  skipWhitespace();
  if (position !== text.length) syntax('Unexpected trailing JSON content');
  // Only after every object key has been inspected may native parsing construct
  // the result. Native parsing also validates escapes in non-key string values.
  try { return JSON.parse(text); }
  catch { syntax('Malformed JSON'); }
}
