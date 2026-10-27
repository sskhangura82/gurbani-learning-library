/* GLP-001 Jaap Sahib Chhands 1–15 source-exact bilingual educational
 * paraphrase DRAFTS — not a canonical translation, licensed teeka,
 * santhiya, scholarly review or authority to publish.
 *
 * The first seven Chhands have deep lessons in the historical V7 course.
 * Preserve the six already-authored source line notes (Chhand 1 first
 * 2, Chhand 2 all 4). Draft 56 individually attributed others here.
 * Braj/Sanskrit epithets with multiple linguistic readings are marked
 * explicitly provisional, not flattened into certainty. The exact original
 * Gurmukhi remains in frozen jaap.json, never stored in this manuscript.
 */
export const jaapEarlyLines=[];
export const jaapEarlyDeep=[];
function chhand(n,rows,care){
 const id='jaap'+String(n).padStart(3,'0');
 if(rows.length!==(n===1?6:4))throw Error('Expected Jaap chhand line count: '+id);
 for(let i=0;i<rows.length;i++){
  const [en,pa]=rows[i]||[];
  if(n===1&&i<2){if(rows[i]!==null)throw Error('Never overwrite first two Jaap chhand 1 notes');continue;}
  if(n===2){if(rows[i]!==null)throw Error('Never overwrite all four Jaap chhand 2 notes');continue;}
  if(!en||!pa)throw Error('No individually authored bilingual note for '+id+' line '+(i+1));
  jaapEarlyLines.push({bani:'jaap',lineId:id+'.line'+String(i+1).padStart(2,'0'),
   simpleEn:en,simplePa:pa,nuance:care,
   meaningKind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
   editorialStatus:'DRAFT_AI_UNREVIEWED'});
 }
}
function deep(n,en,pa,focus,closeReading,words,care,reflection,teachBack){
 jaapEarlyDeep.push({bani:'jaap',unitId:'jaap'+String(n).padStart(3,'0'),
  simpleEn:en,simplePa:pa,
  study:{focus,closeReading,words,care,reflection,teachBack},
  editorialStatus:'DRAFT_AI_UNREVIEWED'});
}
// Chhand 1 — The limitless One has no defining caste, form or dress.
// Exact original two line meanings already exist.
chhand(1,[
 null,null,
 ['The One is described as unchanging, self-radiant and of immeasurable splendour.',
  'ਪ੍ਰਭੂ ਨੂੰ ਅਡੋਲ, ਆਪ-ਪਰਕਾਸ਼ ਅਤੇ ਅਥਾਹ ਤੇਜ ਵਾਲਾ ਦੱਸਿਆ ਹੈ।'],
 ['Even countless Indras and sovereigns cannot match the sovereignty attributed to the One.',
  'ਕ੍ਰੋੜਾਂ ਇੰਦਰਾਂ ਅਤੇ ਬਾਦਸ਼ਾਹਾਂ ਤੋਂ ਵੀ ਉੱਚਾ ਉਸ ਇੱਕ ਦਾ ਰੁਤਬਾ ਦਿਖਾਇਆ ਹੈ।'],
 ['The three worlds, divine beings, humans, traditional adversaries, forests and grass all fall short of describing the One’s full extent.',
  'ਤਿੰਨ ਲੋਕ, ਦੇਵਤੇ, ਮਨੁੱਖ, ਪੁਰਾਣਕ ਵਿਰੋਧੀ, ਜੰਗਲ ਤੇ ਘਾਹ ਤਕ ਉਸ ਬੇਅੰਤ ਦਾ ਪੂਰਾ ਵਰਣਨ ਨਹੀਂ ਕਰ ਸਕਦੇ।'],
 ['Who could tell all Your names? The poet turns to action-related Divine names and the limits of understanding.',
  'ਤੇਰੇ ਸਾਰੇ ਨਾਮ ਕੌਣ ਗਿਣ ਸਕਦਾ ਹੈ? ਕਵੀ ਕਰਮ-ਨਾਮ ਅਤੇ ਸਮਝ ਦੀ ਹੱਦ ਵੱਲ ਧਿਆਨ ਦਿੰਦਾ ਹੈ।']
], 'Indra, the three worlds and “neti-neti” belong to traditional poetic/philosophical vocabulary, not measurable celestial rankings or a modern scientific model. This original six-line first Chhand is not the same as a six-line Japji pauri.');

// Chhand 2 has all four previous exact source-bound notes and one deep unit.
chhand(2,[null,null,null,null],'Historical Jaap Chhand2 note retained verbatim.');

// Chhand 3 — Beyond external appearance, enumeration, body, birth.
chhand(3,[
 ['Salutation to the One not confined to any visible costume, costume-based identity or outer appearance.',
  'ਉਸ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਕਿਸੇ ਇੱਕ ਭੇਖ ਜਾਂ ਬਾਹਰਲੇ ਰੂਪ ਵਿੱਚ ਨਹੀਂ ਬੱਝਦਾ।'],
 ['Salutation to the One beyond being fully written, numbered or exhaustively described.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜਿਸ ਦਾ ਪੂਰਾ ਲੇਖਾ ਜਾਂ ਵਰਣਨ ਨਹੀਂ ਲਿਖਿਆ ਜਾ ਸਕਦਾ।'],
 ['Salutation to the One not confined to a limited material body.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਕਿਸੇ ਸੀਮਤ ਸਰੀਰ ਦੀ ਹੱਦ ਵਿੱਚ ਨਹੀਂ।'],
 ['Salutation to the birthless One, beyond coming into existence in an ordinary way.',
  'ਉਸ ਅਜਨਮੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਆਮ ਜਨਮ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਹੈ।']
], 'The source epithets Abhekh, Alekh, Akay and Ajay are Sanskrit/Braj-derived and require exact philological review; devotional “beyond body” is not an instruction to disdain human bodies.');

// Chhand 4 — Indestructible, beyond names and abode.
chhand(4,[
 ['I bow to the One who cannot be vanquished or worn down by hostile forces.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਕਿਸੇ ਵੈਰ ਜਾਂ ਜ਼ੋਰ ਨਾਲ ਨਾਸ ਨਹੀਂ ਹੁੰਦਾ।'],
 ['I bow to the One whose reality cannot be broken or shattered.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜਿਸ ਦਾ ਸਰੂਪ ਭੰਨਿਆ ਜਾਂ ਟੁੱਟਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।'],
 ['I bow to the One not limited by one humanly assigned name.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਮਨੁੱਖਾਂ ਦੇ ਰੱਖੇ ਇੱਕੋ ਨਾਮ ਤਕ ਸੀਮਤ ਨਹੀਂ।'],
 ['I bow to the One not contained within a single fixed place or dwelling.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜਿਸ ਦਾ ਇੱਕੋ ਨਿਸ਼ਚਿਤ ਠਿਕਾਣਾ ਨਹੀਂ।']
], 'The source “Athame” and “Aname” need Braj/Sanskrit review; “unbreakable” is religious praise, not a guarantee of physical protection for the reader.');

// Chhand 5 — Beyond bondage of ordinary karmic/ritual categories.
chhand(5,[
 ['I bow to the One beyond the limits of ordinary actions or karmic obligation.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਆਮ ਕਰਮਾਂ ਦੀ ਬੰਧਨ-ਹੱਦ ਤੋਂ ਪਰੇ ਹੈ।'],
 ['I bow to the One beyond humanly defined religious duty; this is not a claim that the One is immoral.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਮਨੁੱਖੀ ਧਰਮ-ਵਰਗਾਂ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਹੈ; ਇਸ ਦਾ ਅਰਥ ਅਧਰਮੀ ਹੋਣਾ ਨਹੀਂ।'],
 ['I bow to the One who cannot be contained in any one humanly given title.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜਿਸ ਨੂੰ ਇੱਕ ਹੀ ਨਾਂ ਵਿੱਚ ਬੰਨ੍ਹਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।'],
 ['I bow to the One not confined to a fixed building, location or abode.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਕਿਸੇ ਇੱਕ ਘਰ ਜਾਂ ਠਿਕਾਣੇ ਵਿੱਚ ਸੀਮਤ ਨਹੀਂ।']
], 'Akarm and Adharm are easily misread; their theological use does NOT authorize immoral conduct, avoidance of responsibility or a claim that moral duties are meaningless. Human review mandatory.');

// Chhand 6 — Unconquerable, fearless, not overthrown.
chhand(6,[
 ['I bow to the One who cannot be conquered by worldly power.',
  'ਉਸ ਅਜਿੱਤ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਜਿਸ ਨੂੰ ਦੁਨੀਆ ਦੀ ਕੋਈ ਤਾਕਤ ਜਿੱਤ ਨਹੀਂ ਸਕਦੀ।'],
 ['I bow to the Fearless One, not ruled by fear of another.',
  'ਉਸ ਨਿਰਭਉ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਕਿਸੇ ਹੋਰ ਤੋਂ ਡਰਦਾ ਨਹੀਂ।'],
 ['I bow to the One described as beyond the limits of physical arms or ordinary force, a working sense needing review.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਸਰੀਰਕ ਬਾਹਾਂ ਜਾਂ ਆਮ ਬਲ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਦੱਸਿਆ ਹੈ; ਅਰਥ ਦੀ ਸਮੀਖਿਆ ਬਾਕੀ ਹੈ।'],
 ['I bow to the One who cannot be pulled down or demolished.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜਿਸ ਨੂੰ ਢਾਹਿਆ ਜਾਂ ਹੇਠਾਂ ਨਹੀਂ ਸੁੱਟਿਆ ਜਾ ਸਕਦਾ।']
], 'Abaha and Adhaha spellings are not adjudicated. The martial images praise the Divine; they do not instruct readers to be violent or promise invulnerability.');

// Chhand 7 — Beginningless, uncut, unfathomable.
chhand(7,[
 ['I bow to the One described as beyond limiting colour or stain; the exact Anile gloss remains provisional.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜੋ ਸੀਮਤ ਰੰਗ ਜਾਂ ਮੈਲ ਤੋਂ ਪਰੇ ਦੱਸਿਆ ਹੈ; “ਅਨੀਲੇ” ਦਾ ਅਰਥ ਹਾਲੇ ਅਸਥਾਈ ਹੈ।'],
 ['I bow to the One who has no ordinary beginning.',
  'ਉਸ ਅਨਾਦਿ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਜਿਸ ਦੀ ਆਮ ਸ਼ੁਰੂਆਤ ਨਹੀਂ।'],
 ['I bow to the One who cannot be severed or cut apart.',
  'ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਜਿਸ ਨੂੰ ਕੱਟ ਕੇ ਵੱਖਰਾ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ।'],
 ['I bow to the One whose depths cannot be reached or fully understood.',
  'ਉਸ ਅਥਾਹ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਜਿਸ ਦਾ ਪੂਰਾ ਭੇਦ ਨਹੀਂ ਪਾਇਆ ਜਾ ਸਕਦਾ।']
], 'The Anile epithet is especially sensitive to source vowels and Braj morphology; never silently equate it with a skin-colour judgment or literal anatomy.');

// Chhand 8 — Repeated indestructibility plus generosity and infinity.
chhand(8,[
 ['I bow once again to the One beyond defeat or destruction.',
  'ਮੈਂ ਮੁੜ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜਿਸ ਦਾ ਨਾਸ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ।'],
 ['I bow to the One who cannot be broken into parts.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜਿਸ ਨੂੰ ਭੰਨਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।'],
 ['I bow to the One praised as generous and open-handed in blessing.',
  'ਮੈਂ ਉਸ ਉਦਾਰ ਦਾਤਾਰ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਕਿਰਪਾ ਕਰਨ ਵਾਲਾ ਹੈ।'],
 ['I bow to the One who is without a measurable end or boundary.',
  'ਮੈਂ ਉਸ ਅਪਾਰ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜਿਸ ਦਾ ਅੰਤ ਨਹੀਂ।']
], 'Agange/Abhanje are deliberately repeated from Chhand4; Udare and Apare add generosity and immeasurability. Do not claim an approved literal Braj morphology or worldly gift guarantee.');

// Chhand 9 — The One, many appearances, beyond created forms.
chhand(9,[
 ['I bow to the One, undivided in its deepest reality.',
  'ਮੈਂ ਉਸ ਇੱਕੋ ਅਖੰਡ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ।'],
 ['I bow to the One present through countless expressions and forms.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਅਨੇਕ ਪ੍ਰਗਟਾਵਿਆਂ ਵਿੱਚ ਵੀ ਵਿਆਪਕ ਹੈ।'],
 ['I bow to the One described as beyond the limits of the created/material condition; the exact Abhute sense is provisional.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਸਿਰਜੀਆਂ ਵਸਤਾਂ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਹੈ; “ਅਭੂਤੇ” ਦਾ ਅਰਥ ਅਸਥਾਈ ਹੈ।'],
 ['I bow to the One not limited by a fixed form; the Ajūpe wording needs Sanskrit/Braj review.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਇੱਕ ਨਿਸ਼ਚਿਤ ਰੂਪ ਵਿੱਚ ਨਹੀਂ ਬੱਝਦਾ; “ਅਜੂਪੇ” ਦੀ ਸਮੀਖਿਆ ਲੋੜੀਂਦੀ ਹੈ।']
], 'This juxtaposes One and many; Abhute/Ajupe are working editorial glosses and must not be treated as a definitive doctrine about physical existence.');

// Chhand 10 — Beyond karma, delusion, direction and appearance.
chhand(10,[
 ['I bow to the One not held captive by ordinary karma or the bonds of actions.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਆਮ ਕਰਮਾਂ ਦੇ ਬੰਧਨ ਵਿੱਚ ਨਹੀਂ।'],
 ['I bow to the One free from confusion and deluding uncertainty.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਭਰਮ ਤੇ ਉਲਝਣ ਤੋਂ ਰਹਿਤ ਹੈ।'],
 ['I bow to the One not confined to one geographic direction, country or place.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਕਿਸੇ ਇੱਕ ਦੇਸ ਜਾਂ ਦਿਸ਼ਾ ਵਿੱਚ ਨਹੀਂ ਬੱਝਦਾ।'],
 ['I bow to the One not defined by costume, dress or external appearance.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਭੇਖ ਜਾਂ ਬਾਹਰਲੀ ਦਿੱਖ ਤੋਂ ਪਰੇ ਹੈ।']
], 'Nrikarme/Nribharme/Nrideshe/Nribheshe use old negative prefixes and spellings; meanings are draft working paraphrases, not pronunciation or lexical certification.');

// Chhand 11 — Without fixed name, craving or contingent support.
chhand(11,[
 ['I bow to the One not confined to a single humanly assigned name.',
  'ਮੈਂ ਉਸ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਕਿਸੇ ਇੱਕ ਰੱਖੇ ਹੋਏ ਨਾਂ ਵਿੱਚ ਸੀਮਤ ਨਹੀਂ।'],
 ['I bow to the One free from demanding or grasping desire.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਮੰਗਣ ਵਾਲੀ ਤ੍ਰਿਸ਼ਨਾ ਤੋਂ ਰਹਿਤ ਹੈ।'],
 ['I bow to the One praised as beyond a created support or fixed dependence; “Nirdhate” requires a qualified gloss.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਬਣਾਏ ਆਸਰੇ ਤੋਂ ਪਰੇ ਹੈ; “ਨ੍ਰਿਧਾਤੇ” ਦੇ ਪੱਕੇ ਅਰਥ ਦੀ ਜਾਂਚ ਬਾਕੀ ਹੈ।'],
 ['I bow to the One beyond injury or defeat; the precise “Nirghate” lexical form remains unsettled.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਨਾਸ ਜਾਂ ਘਾਤ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਹੈ; “ਨ੍ਰਿਘਾਤੇ” ਦਾ ਪੱਕਾ ਅਰਥ ਹਾਲੇ ਅਣਨਿਰਣਿਤ ਹੈ।']
], 'Nirdhate and Nirghate are difficult Sanskrit/Braj epithets. These are working educational senses only, NOT verified morphological interpretations; no claim of immunity to harm.');

// Chhand 12 — Beyond stain and ordinary embodied worlds.
chhand(12,[
 ['I bow to the One beyond being soiled or shaken; the exact old-form “Nirdhute” requires review.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਮੈਲ ਜਾਂ ਹਿਲਾਉ ਤੋਂ ਪਰੇ ਹੈ; “ਨ੍ਰਿਧੂਤੇ” ਦਾ ਅਰਥ ਅਸਥਾਈ ਹੈ।'],
 ['I bow to the One not confined to ordinary formed or created states; “Abhute” remains a working gloss.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਸਿਰਜੀਆਂ ਰੂਪ-ਹੱਦਾਂ ਤੋਂ ਪਰੇ ਹੈ; “ਅਭੂਤੇ” ਦੀ ਜਾਂਚ ਲੋੜੀਂਦੀ ਹੈ।'],
 ['I bow to the One not fully grasped by the visible worlds or ordinary perception.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜਿਸ ਨੂੰ ਦਿੱਸਦੇ ਲੋਕ ਜਾਂ ਆਮ ਇੰਦਰੀਆਂ ਪੂਰਾ ਨਹੀਂ ਫੜ ਸਕਦੀਆਂ।'],
 ['I bow to the One not governed by grief or sorrow.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਸੋਗ ਜਾਂ ਦੁੱਖ ਦੀ ਬੰਧਨ-ਹੱਦ ਵਿੱਚ ਨਹੀਂ।']
], 'Nirdhute/Abhute/Aloke are lexically complex and could admit more than one qualified reading. Assumption is documented, not asserted as standard scholarly translation.');

// Chhand 13 — Beyond burning, fixation, worldly triple categories; treasury.
chhand(13,[
 ['I bow to the One beyond ordinary burning or affliction; the Sanskritic epithet needs source review.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਆਮ ਤਾਪ ਜਾਂ ਕਲੇਸ਼ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਹੈ; ਸ਼ਬਦ-ਅਰਥ ਦੀ ਸਮੀਖਿਆ ਬਾਕੀ ਹੈ।'],
 ['I bow to the One not placed or established by another force.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜਿਸ ਨੂੰ ਹੋਰ ਕੋਈ ਟਿਕਾਣਾ ਜਾਂ ਸਥਾਪਨਾ ਨਹੀਂ ਦੇ ਸਕਦਾ।'],
 ['I bow to the One transcending narrowly measured threefold categories; “Trimane” remains provisional.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਸੀਮਤ ਤਿੰਨ-ਭੇਦਾਂ ਤੋਂ ਪਰੇ ਹੈ; “ਤ੍ਰਿਮਾਨੇ” ਦਾ ਅਰਥ ਅਸਥਾਈ ਹੈ।'],
 ['I bow to the One praised as an inexhaustible store of goodness and treasure.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜਿਸ ਨੂੰ ਗੁਣਾਂ ਤੇ ਦਾਤਾਂ ਦਾ ਅਥਾਹ ਖਜ਼ਾਨਾ ਕਿਹਾ ਗਿਆ ਹੈ।']
], 'Nritape, Athape, Trimane and Nidhane require a specialist Braj/Sanskrit review; do not use the idea of a “treasury” as a promised financial reward.');

// Chhand 14 — Unfathomable, beyond ordinary reach and creation.
chhand(14,[
 ['I bow to the One whose depth cannot be completely fathomed.',
  'ਮੈਂ ਉਸ ਅਥਾਹ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜਿਸ ਦੀ ਗਹਿਰਾਈ ਨਹੀਂ ਪਾਈ ਜਾ ਸਕਦੀ।'],
 ['I bow to the One beyond the grasp of ordinary arms or force; the precise Abahe word sense remains under review.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਆਮ ਬਲ ਜਾਂ ਬਾਂਹਾਂ ਦੀ ਪਹੁੰਚ ਤੋਂ ਪਰੇ ਹੈ; “ਅਬਾਹੇ” ਦਾ ਅਰਥ ਅਸਥਾਈ ਹੈ।'],
 ['I bow to the One beyond limiting threefold categories or pursuits; the exact Tribarge use needs scholarly checking.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਸੀਮਤ ਤਿੰਨ-ਭੇਦਾਂ ਜਾਂ ਲਾਲਸਾਵਾਂ ਤੋਂ ਪਰੇ ਹੈ; “ਤ੍ਰਿਬਰਗੇ” ਦੀ ਸਮੀਖਿਆ ਚਾਹੀਦੀ ਹੈ।'],
 ['I bow to the One described as beyond created origin; Asarge needs a careful source-based gloss.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਬਣਾਈ ਸ੍ਰਿਸ਼ਟੀ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਹੈ; “ਅਸਰਗੇ” ਦਾ ਅਰਥ ਜਾਂਚਯੋਗ ਹੈ।']
], 'This cluster has multiple difficult lexical items. Do not claim certain literal translations for Abahe, Tribarge or Asarge until qualified textual review.');

// Chhand 15 — Beyond colour and disintegration; the One’s sustaining relation to creation.
chhand(15,[
 ['I bow to the One related to every experience and enjoyment, yet not bounded by it; Prabhoge is a working sense.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਜੀਵਾਂ ਦੇ ਭੋਗ ਤੇ ਅਨੁਭਵ ਤੋਂ ਪਰੇ ਹੈ; “ਪ੍ਰਭੋਗੇ” ਦਾ ਅਰਥ ਅਸਥਾਈ ਹੈ।'],
 ['I bow to the One praised as rightly joined to all things and the source of harmony; Sujoge requires review.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਹਰ ਸਹੀ ਜੋੜ ਤੇ ਸੰਬੰਧ ਦਾ ਮੂਲ ਹੈ; “ਸੁਜੋਗੇ” ਦੀ ਸਮੀਖਿਆ ਲੋੜੀਂਦੀ ਹੈ।'],
 ['I bow to the One beyond limiting physical colour or appearance.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਕਿਸੇ ਇੱਕ ਰੰਗ ਜਾਂ ਦਿੱਖ ਨਾਲ ਨਹੀਂ ਬੱਝਦਾ।'],
 ['I bow to the One who cannot be broken, lost or diminished.',
  'ਮੈਂ ਉਸ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ ਜੋ ਅਭੰਗ ਹੈ, ਟੁੱਟਦਾ ਜਾਂ ਨਾਸ ਨਹੀਂ ਹੁੰਦਾ।']
], 'Prabhoge/Sujoge require qualified interpretation, and the critique of colour is about Divine transcendence, never caste, race or human worth.');

// Chhands 8–15: distinct previously-unwritten deeper lessons.
deep(8,
 'The poet repeats salutations to the unassailable One, then names generosity and boundlessness.',
 'ਕਵੀ ਅਜਿੱਤ ਪ੍ਰਭੂ ਨੂੰ ਮੁੜ ਨਮਸਕਾਰ ਕਰਦਾ ਤੇ ਉਸ ਦੀ ਉਦਾਰਤਾ ਅਤੇ ਅਪਾਰਤਾ ਯਾਦ ਕਰਦਾ ਹੈ।',
 'Repetition adds depth, not a score of spoken words.',
 'Chhand 8 deliberately repeats the first two descriptive salutations from Chhand 4, then shifts toward Udare and Apare. The pattern teaches that the One is beyond destruction and also generous and without limit. It is a sequence of names/attributes, not four unrelated deities or instructions to perform four physical acts.',
 [['ਅਗੰਜੇ','Unassailable or not destroyed; working gloss'],['ਅਪਾਰੇ','Boundless or beyond a measurable end']],
 'The lexical forms require qualified Dasam/Braj review; Divine generosity is not a contractual guarantee that an individual will receive money or avoid injury.',
 'What does repeating an idea help me notice that I might miss once?',
 'How do the final two titles extend the first two?');
deep(9,
 'One Divine reality is invoked through both unity and many expressions, while remaining beyond fixed created form.',
 'ਇੱਕ ਪ੍ਰਭੂ ਦੀ ਇਕਤਾ ਅਤੇ ਅਨੇਕ ਪ੍ਰਗਟਾਵਿਆਂ ਦੀ ਵਡਿਆਈ ਹੈ, ਪਰ ਉਹ ਬਣੇ ਰੂਪਾਂ ਤਕ ਸੀਮਤ ਨਹੀਂ।',
 'One and many held together in praise.',
 'The first line greets the One, the second invokes the Many, and the remaining two use complex epithets relating to created and defined forms. The meaningful interpretive move is not to treat these as contradictions, but to explore the difference between the one unbounded Source and its diverse expressions. The exact old-word morphology has not been independently settled.',
 [['ਏਕੈ','One or singular'],['ਅਨੇਕੈ','Many or manifold']],
 'Abhute and Ajupe remain provisional working glosses. Do not present a precise cosmological mechanism or equate religious metaphor with scientific measurements.',
 'Where might I see unity without denying genuine differences?',
 'Which first two words set up this chhand’s central comparison?');
deep(10,
 'The One is praised as beyond limiting actions, confusion, place and costume.',
 'ਪ੍ਰਭੂ ਨੂੰ ਕਰਮਾਂ ਦੇ ਬੰਧਨ, ਭਰਮ, ਥਾਂ ਅਤੇ ਭੇਖ ਦੀਆਂ ਹੱਦਾਂ ਤੋਂ ਪਰੇ ਯਾਦ ਕੀਤਾ ਹੈ।',
 'Negative titles protect against narrow definitions.',
 'The four original salutation-lines describe what cannot confine the Divine: action and its binding consequences, bewilderment, a geographical region and a specific mode of dress. This does not make action, learning or respect for places meaningless; rather, the verse separates a human limitation from the Source revered by the speaker.',
 [['ਨ੍ਰਿਕਰਮੇ','Not limited by binding action, working gloss'],['ਨ੍ਰਿਭੇਸੇ','Without a limiting costume or appearance']],
 'Negative Braj prefixes need qualified linguistic review. The teaching does not excuse immoral actions, reject geography or dismiss sincere physical worship.',
 'What external appearance do I sometimes mistake for real understanding?',
 'What four categories does this stanza say cannot fully define the One?');
deep(11,
 'Names, desire and the causes of loss do not confine the One in this poetic salutation.',
 'ਨਾਂ, ਚਾਹ ਅਤੇ ਨਾਸ-ਵਿਨਾਸ ਦੀਆਂ ਹੱਦਾਂ ਤੋਂ ਉਪਰ ਪ੍ਰਭੂ ਦੀ ਵਡਿਆਈ ਕੀਤੀ ਹੈ।',
 'A source-specific study of four difficult epithets.',
 'The opening lines invoke the One beyond a fixed name and without grasping desire. The second pair uses the harder Nirdhate/Nirghate forms, which have not been philologically adjudicated. These later terms should be taught as tentative meanings with explicit uncertainty, rather than building large doctrinal conclusions on an unverified short gloss.',
 [['ਨ੍ਰਿਨਾਮੇ','Beyond a fixed name'],['ਨ੍ਰਿਕਾਮੇ','Without desire or craving']],
 'Nirdhate and Nirghate are not approved dictionary definitions. Do not promise bodily invulnerability or suggest the Divine commands harmful behaviour.',
 'How do names help us learn while still limiting what they describe?',
 'Which two familiar words precede the more difficult pair requiring specialist review?');
deep(12,
 'The chhand addresses the One beyond ordinary stain, worldly form, limited perception and sorrow.',
 'ਇਹ ਛੰਦ ਪ੍ਰਭੂ ਨੂੰ ਮੈਲ, ਬਣੇ ਰੂਪ, ਆਮ ਨਿਗਾਹ ਅਤੇ ਸੋਗ ਦੀਆਂ ਹੱਦਾਂ ਤੋਂ ਪਰੇ ਯਾਦ ਕਰਦਾ ਹੈ।',
 'The limits of appearance and the language of sorrow.',
 'These four names form a cluster of negations. The specific meanings of Nirdhute, Abhute and Aloke are provisional, while Asoke invites a relatively clear contrast with sorrow. The reader can learn how Braj salutation syntax works without pretending every compound has one certain English equivalent.',
 [['ਨ੍ਰਿਧੂਤੇ','Unstained or not shaken; tentative'],['ਅਸੋਕੇ','Free from sorrow']],
 'Do not equate “without sorrow” with a clinical guarantee or suggest that anyone experiencing grief has failed spiritually. Linguistic review is open.',
 'What is the difference between respecting grief and finding hope in a spiritual text?',
 'Which of these four titles most directly names sorrow?');
deep(13,
 'The poem bows to a One beyond ordinary affliction or establishment and describes inexhaustible treasure.',
 'ਕਵੀ ਆਮ ਤਾਪ ਤੇ ਠਿਕਾਣੇ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਅਤੇ ਉਸ ਨੂੰ ਨਿਧਾਨ ਆਖਦਾ ਹੈ।',
 'Unsettled old vocabulary beside the image of a treasury.',
 'The sequence moves through Nritape and Athape, followed by Trimane and Nidhane. Nidhane suggests a repository or treasury, while the preceding forms need close textual and morphological attention. Rather than asserting a sure “three worlds” or “three gunas” gloss, the Study layer should leave the third term openly unresolved until a qualified scholar can compare dictionaries and textual witnesses.',
 [['ਨ੍ਰਿਤਾਪੇ','Beyond affliction or heat; tentative'],['ਨਿਧਾਨੇ','Treasury, source or store of gifts']],
 '“Treasure” is devotional praise and not evidence of financial returns; Trimane’s meaning is unsettled and should not be inserted as a certain doctrine.',
 'How can I learn to hold an unresolved word without making up certainty?',
 'Which term in the fourth line introduces the treasury image?');
deep(14,
 'The One is praised as unfathomable and beyond ordinary reach, categories and created origin.',
 'ਅਥਾਹ ਪ੍ਰਭੂ ਨੂੰ ਆਮ ਪਹੁੰਚ, ਵੰਡ ਅਤੇ ਸ੍ਰਿਸ਼ਟੀ ਦੀਆਂ ਹੱਦਾਂ ਤੋਂ ਪਰੇ ਨਮਸਕਾਰ ਹੈ।',
 'A cluster of attributes requiring source comparison.',
 'Agahe points toward unfathomability, while Abahe, Tribarge and Asarge carry additional old-language possibilities. This chhand is useful for learning to distinguish an easy general religious idea from a precise word-level translation. The final three terms should remain visibly provisional until review, even though the four original source lines themselves are fully displayed.',
 [['ਅਗਾਹੇ','Unfathomable'],['ਅਸਰਗੇ','Beyond created origin; tentative']],
 'Uncertain Braj/Sanskrit words require qualified review, not a silent source correction. No word here is authority for a physical or medical experiment.',
 'What is gained by acknowledging the limits of an explanation?',
 'Which title begins the chhand and what general theme does it establish?');
deep(15,
 'The chhand praises a sustaining One beyond limiting colour and disintegration.',
 'ਇਹ ਛੰਦ ਪ੍ਰਭੂ ਨੂੰ ਜੀਵਨ ਦਾ ਮੂਲ, ਰੰਗ-ਹੱਦਾਂ ਤੋਂ ਪਰੇ ਅਤੇ ਅਭੰਗ ਦੱਸਦਾ ਹੈ।',
 'Enjoyment, relationship and transcendence in four titles.',
 'Prabhoge and Sujoge are difficult source words for which the draft offers only a provisional sense. The final pair is more clearly structured around absence of limiting colour and indestructibility. The student is invited to notice how devotional naming moves from relation with the world to a reality that cannot be assigned one human appearance or broken apart.',
 [['ਅਰੰਗੇ','Not limited by one colour'],['ਅਭੰਗੇ','Not broken or destroyed']],
 'Never use the absence of colour to rank human skin tones, caste or race. No explanation here proves invulnerability to harm; Prabhoge/Sujoge need human review.',
 'How might I look beyond appearance when assessing someone’s character?',
 'How do the last two descriptive titles differ from the first two?');
