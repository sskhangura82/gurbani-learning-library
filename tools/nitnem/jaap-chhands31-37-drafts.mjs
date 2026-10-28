/* GLP-001 Jaap Sahib Chhands 31–37: original educational drafts.
 * Frozen original text and source hashes remain in nitnem/data/jaap.json.
 * These explanations are not approved translations, santhiya or human review.
 * Bibliography, source anchors, two open comparison flags and lexical choices
 * are recorded separately in jaap-chhands31-37-research.json.
 */

export const jaap31to37Lines = [];
export const jaap31to37Deep = [];

function chhand(n, rows) {
  if (n < 31 || n > 37 || rows.length !== 4) {
    throw new Error('Expected four lines for Jaap Chhand 31–37');
  }
  const unitId = 'jaap' + String(n).padStart(3, '0');
  rows.forEach(([simpleEn, simplePa, nuance], index) => {
    if (!simpleEn || !simplePa || !nuance) {
      throw new Error('Missing bilingual draft or nuance for ' + unitId);
    }
    jaap31to37Lines.push({
      bani: 'jaap',
      lineId: unitId + '.line' + String(index + 1).padStart(2, '0'),
      simpleEn,
      simplePa,
      nuance,
      meaningKind: 'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
      editorialStatus: 'DRAFT_AI_UNREVIEWED',
      humanReviewed: false
    });
  });
}

function deep(n, simpleEn, simplePa, study) {
  jaap31to37Deep.push({
    bani: 'jaap',
    unitId: 'jaap' + String(n).padStart(3, '0'),
    simpleEn,
    simplePa,
    study,
    editorialStatus: 'DRAFT_AI_UNREVIEWED',
    humanReviewed: false
  });
}

// 31 — The limits of mental grasp beside unconquerable fearlessness.
chhand(31, [
  [
    'You are beyond what the mind can fully hold in contemplation.',
    'ਹੇ ਪ੍ਰਭੂ, ਮਨ ਧਿਆਨ ਰਾਹੀਂ ਵੀ ਤੇਰੇ ਪੂਰੇ ਸਰੂਪ ਨੂੰ ਨਹੀਂ ਫੜ ਸਕਦਾ।',
    'ਅਧੇ is read through the limits of thought or contemplation, following Neki and the Bhai Vir Singh-derived account. Other readings differ: Mahan Kosh gives independence from external support, while Sant Sewa Singh says the Divine has no need to meditate on another. This draft selects the first sense without resolving the alternatives.'
  ],
  [
    'Your full mystery cannot be fathomed.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰਾ ਪੂਰਾ ਭੇਦ ਨਹੀਂ ਪਾਇਆ ਜਾ ਸਕਦਾ।',
    'ਅਭੇ is read here through an unfathomable ਭੇਦ, following Sant Sewa Singh. The Bhai Vir Singh-derived account suggests absence of distinction or secrecy, and Neki uses a fearlessness-related sense. These readings should not be silently collapsed; ਅਭੀਤ in the final line clearly names fearlessness.'
  ],
  [
    'No power can conquer You or make You subject to another.',
    'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਤਾਕਤ ਤੈਨੂੰ ਜਿੱਤ ਕੇ ਕਿਸੇ ਹੋਰ ਦੇ ਅਧੀਨ ਨਹੀਂ ਕਰ ਸਕਦੀ।',
    'ਅਜੀਤ denies being conquered. It renews the title already heard in earlier salutations, now in the direct ਹੈਂ form: You are. The claim concerns Divine sovereignty, not a prediction that a devotee will win every struggle.'
  ],
  [
    'You are free from fear of any other power.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਕਿਸੇ ਹੋਰ ਤਾਕਤ ਦਾ ਡਰ ਨਹੀਂ।',
    'ਅਭੀਤ directly concerns freedom from fear. Beside ਅਜੀਤ, it distinguishes being beyond conquest from being beyond intimidation. The two descriptions are closely related without becoming one identical word meaning.'
  ]
]);

deep(31,
  'The chhand moves from the limits of our contemplation and understanding to Divine freedom from conquest and fear. Its brief “You are” statements sustain a direct relationship even where full comprehension is impossible.',
  'ਇਹ ਛੰਦ ਸਾਡੇ ਧਿਆਨ ਅਤੇ ਸਮਝ ਦੀਆਂ ਹੱਦਾਂ ਤੋਂ ਅੱਗੇ ਪ੍ਰਭੂ ਦੀ ਅਜਿੱਤਤਾ ਅਤੇ ਨਿਰਭਉਤਾ ਵੱਲ ਲੈ ਜਾਂਦਾ ਹੈ। ਛੋਟੇ “ਹੈਂ” ਵਾਲੇ ਬਚਨ ਪ੍ਰਭੂ ਨਾਲ ਸਿੱਧਾ ਸੰਬੋਧਨ ਬਣਾਈ ਰੱਖਦੇ ਹਨ, ਭਾਵੇਂ ਉਸ ਦਾ ਪੂਰਾ ਭੇਦ ਨਾ ਪਾਇਆ ਜਾ ਸਕੇ।',
  {
    focus: 'Reverence without a claim to mental possession.',
    closeReading: 'Each line ends with ਹੈਂ, keeping the One directly addressed. In the selected opening readings, neither contemplation nor explanation makes the Divine an object we can fully possess in thought. The closing pair then changes the question: no opposing power can conquer or intimidate the One. Notice the difference between knowing a title and mastering what it names. The speaker can address the Divine with confidence while remaining modest about understanding. The first two words have competing lexical readings, so this movement is a working interpretation of the sequence, not a claim that every commentator gives the same account.',
    words: [
      ['ਅਧੇ', 'Beyond complete contemplation; selected sense, with support-related alternatives'],
      ['ਅਭੇ', 'Unfathomable in this reading; other senses remain open'],
      ['ਅਭੀਤ', 'Without fear']
    ],
    care: 'Distinguish the disputed first pair from the clearer conquest/fear pair. Divine fearlessness is not a demand to hide ordinary human fear or a guarantee of bodily invulnerability.',
    reflection: 'Can I be steady in devotion without pretending that I have understood everything?',
    teachBack: 'How do the first two titles and the final two titles address different kinds of limitation?'
  }
);

// 32 — Reverence and treasure; creation’s qualities beside uncreated being.
chhand(32, [
  [
    'You are worthy of reverence throughout every age and realm.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਹਰ ਕਾਲ ਅਤੇ ਹਰ ਲੋਕ ਵਿੱਚ ਸਤਿਕਾਰਯੋਗ ਹੈਂ।',
    'ਤ੍ਰਿਮਾਨ carries a threefold reference. Neki reads the three worlds, the Bhai Vir Singh-derived account reads the three times, and Sant Sewa Singh includes both. The broad paraphrase preserves reverence across those frames rather than inventing a negative meaning such as beyond honour.'
  ],
  [
    'You are the treasury of all gifts.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਾਰੀਆਂ ਦਾਤਾਂ ਦਾ ਖ਼ਜ਼ਾਨਾ ਹੈਂ।',
    'ਨਿਧਾਨ introduces the image of a treasury or store. After the title of reverence, the verse turns toward what is received from the One. This image concerns abundance and its source; it does not specify a particular material reward.'
  ],
  [
    'You are present through the three qualities of creation.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸ੍ਰਿਸ਼ਟੀ ਦੇ ਤਿੰਨਾਂ ਗੁਣਾਂ ਵਿੱਚ ਵਿਆਪਕ ਹੈਂ।',
    'ਤ੍ਰਿਬਰਗ is read here through the three gunas, following the selected Neki, Sewa Singh and Bhai Vir Singh-derived readings. Their precise descriptions of source and pervasion vary. The frozen ਹੈਂ is retained; the second digital witness has ਹੈ, an unresolved verb-form difference rather than a reason to rewrite the source.'
  ],
  [
    'You Yourself have not been brought into being by another.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਕਿਸੇ ਹੋਰ ਨੇ ਪੈਦਾ ਨਹੀਂ ਕੀਤਾ।',
    'ਅਸਰਗ is read as uncreated. Beside ਤ੍ਰਿਬਰਗ, it places the One’s relation to creation alongside freedom from being one more created product. The two titles can be considered together without treating creation as absent.'
  ]
]);

deep(32,
  'The One is honoured across ages and realms and praised as a treasury of gifts. The final pair holds presence through creation’s three qualities together with freedom from a created origin.',
  'ਪ੍ਰਭੂ ਹਰ ਕਾਲ ਅਤੇ ਲੋਕ ਵਿੱਚ ਸਤਿਕਾਰਯੋਗ ਹੈ ਅਤੇ ਸਾਰੀਆਂ ਦਾਤਾਂ ਦਾ ਖ਼ਜ਼ਾਨਾ ਹੈ। ਆਖ਼ਰੀ ਜੋੜੀ ਉਸ ਨੂੰ ਸ੍ਰਿਸ਼ਟੀ ਦੇ ਤਿੰਨਾਂ ਗੁਣਾਂ ਵਿੱਚ ਵਿਆਪਕ ਦੱਸਦਿਆਂ ਵੀ ਕਿਸੇ ਹੋਰ ਤੋਂ ਪੈਦਾ ਹੋਇਆ ਨਹੀਂ ਮੰਨਦੀ।',
  {
    focus: 'Present in creation without being its dependent product.',
    closeReading: 'The first two titles are affirmative: reverence is offered, and treasure is found in the One. The next pair asks us to hold two ideas together. In the selected reading, the three qualities of creation express Divine presence; yet the One is not created by a prior maker. The poem can therefore praise relationship with the world without confining the Divine to one changing condition within it. Notice also that ਤ੍ਰਿਮਾਨ and ਤ੍ਰਿਬਰਗ each contain a threefold element but do not name the same three. Ages or realms belong to the first interpretive question; creation’s qualities belong to the second.',
    words: [
      ['ਤ੍ਰਿਮਾਨ', 'Revered in the three worlds or times; working frames'],
      ['ਨਿਧਾਨ', 'Treasury or source of gifts'],
      ['ਤ੍ਰਿਬਰਗ', 'Creation’s three qualities; selected working reading'],
      ['ਅਸਰਗ', 'Uncreated; not brought into being by another']
    ],
    care: 'Three worlds, three times and three qualities are distinct traditional interpretive frames. Do not merge them into one definition or treat the open ਹੈਂ/ਹੈ source difference as already adjudicated.',
    reflection: 'How does gratitude change when I attend to the source of a gift as well as the gift itself?',
    teachBack: 'What distinction must be kept between the threefold references in ਤ੍ਰਿਮਾਨ and ਤ੍ਰਿਬਰਗ?'
  }
);

// 33 — Appearance, beginning, conquest and dependence are different limits.
chhand(33, [
  [
    'You are unstained, beyond any limiting colour.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਨਿਰਮਲ ਹੈਂ ਅਤੇ ਕਿਸੇ ਇੱਕ ਰੰਗ ਨਾਲ ਸੀਮਤ ਨਹੀਂ ਹੁੰਦਾ।',
    'ਅਨੀਲ is approached through colourlessness and unstainedness in the consulted commentaries. The main sentence gives that devotional range rather than a physical colour. It returns to a theme heard earlier in ਅਨੀਲੇ without altering either source spelling.'
  ],
  [
    'Your existence has no beginning.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਹੋਂਦ ਦਾ ਕੋਈ ਆਰੰਭ ਨਹੀਂ।',
    'ਅਨਾਦਿ negates an ਆਦਿ, beginning. It is stronger than saying the One is merely very old: the title does not assign an earlier date to an otherwise ordinary origin.'
  ],
  [
    'No power can overcome You.',
    'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਤਾਕਤ ਤੇਰੇ ਉੱਤੇ ਜਿੱਤ ਨਹੀਂ ਪਾ ਸਕਦੀ।',
    'ਅਜੇ is selected as unconquerable, agreeing with Neki, Sant Sewa Singh and the Bhai Vir Singh-derived account. Its shorter form should not automatically be confused with an unborn gloss; the explicit birth-related ਅਜਨਮ follows in the next chhand.'
  ],
  [
    'You are free in Your being, subject to no other power.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸੁਤੰਤਰ ਹੈਂ ਅਤੇ ਕਿਸੇ ਹੋਰ ਦੀ ਅਧੀਨਤਾ ਵਿੱਚ ਨਹੀਂ।',
    'ਅਜਾਦਿ is read through freedom or independence, following Neki and the Bhai Vir Singh-derived account. Sant Sewa Singh instead reads the One as the source even of Brahma, the traditional creator figure. The differing interpretations remain open; no unverified dictionary derivation is asserted.'
  ]
]);

deep(33,
  'The chhand removes four different limits: a defining colour, a beginning in time, conquest by another and dependence on another’s power. Its praise of freedom concerns the One’s being rather than a claim of human self-sufficiency.',
  'ਇਹ ਛੰਦ ਪ੍ਰਭੂ ਨੂੰ ਕਿਸੇ ਨਿਸ਼ਚਿਤ ਰੰਗ, ਸਮੇਂ ਦੀ ਸ਼ੁਰੂਆਤ, ਕਿਸੇ ਦੀ ਜਿੱਤ ਅਤੇ ਪਰਾਈ ਅਧੀਨਤਾ ਤੋਂ ਪਰੇ ਯਾਦ ਕਰਦਾ ਹੈ। ਇਹ ਸੁਤੰਤਰਤਾ ਪ੍ਰਭੂ ਦੇ ਸਰੂਪ ਬਾਰੇ ਹੈ; ਇਸ ਨੂੰ ਮਨੁੱਖ ਲਈ ਹਰ ਸਹਾਰੇ ਤੋਂ ਬਿਨਾ ਰਹਿਣ ਦਾ ਦਾਅਵਾ ਨਹੀਂ ਬਣਾਇਆ ਗਿਆ।',
  {
    focus: 'Four limits removed without erasing their differences.',
    closeReading: 'Listen to the succession of appearance, time, power and independence. These are different ways in which ordinary beings can be defined or constrained. Colour gives an outward description; a beginning places something within a sequence; conquest makes it subject to another; dependence requires another’s support. In the selected reading, none contains the One. The brevity of the lines should not flatten all four into the same vague idea of greatness. Their distinctions make the praise more precise. The final word also admits a source-of-Brahma reading, which changes the last emphasis from freedom to primordial source while retaining the unchanged original text.',
    words: [
      ['ਅਨੀਲ', 'Unstained or beyond limiting colour; working range'],
      ['ਅਨਾਦਿ', 'Without a beginning'],
      ['ਅਜੇ', 'Unconquerable; selected reading'],
      ['ਅਜਾਦਿ', 'Independent or unbound; an alternative source-of-Brahma reading exists']
    ],
    care: 'Language of colour and purity does not rank human complexions, caste or bodies. Keep the chosen final reading distinct from the documented alternative rather than presenting a single agreed derivation.',
    reflection: 'Which outward description most often tempts me to think I have understood someone completely?',
    teachBack: 'Name the different kinds of limitation addressed by the four titles.'
  }
);

// 34 — Birth and material dependence; a genuine adornment alternative remains.
chhand(34, [
  [
    'You do not come into existence through birth.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਹੋਂਦ ਜਨਮ ਲੈਣ ਨਾਲ ਸ਼ੁਰੂ ਨਹੀਂ ਹੁੰਦੀ।',
    'ਅਜਨਮ directly removes birth as an origin. It concerns Divine being and does not make human birth, family life or the care of children spiritually inferior.'
  ],
  [
    'You cannot be confined to one colour or outward form.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਕਿਸੇ ਇੱਕ ਰੰਗ ਜਾਂ ਬਾਹਰਲੇ ਰੂਪ ਵਿੱਚ ਨਹੀਂ ਬੰਨ੍ਹਿਆ ਜਾ ਸਕਦਾ।',
    'ਅਬਰਨ is read through colour and appearance, as in the Punjabi steek and Bhai Vir Singh-derived account; Neki emphasises unstainedness. It renews the resistance to a fixed visible description, not an assertion that one human appearance is more sacred than another.'
  ],
  [
    'You are not composed of the material elements of the world.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸੰਸਾਰ ਦੇ ਭੌਤਿਕ ਤੱਤਾਂ ਨਾਲ ਬਣਿਆ ਹੋਇਆ ਨਹੀਂ।',
    'ਅਭੂਤ is read here through the classical material elements, supported by Sant Sewa Singh and Neki’s incorporeal sense. The Bhai Vir Singh-derived account also offers an unmanifest reading. This title does not say that the Divine is nonexistent or has no relation to the world.'
  ],
  [
    'You need no one to nourish or sustain Your existence.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਹੋਂਦ ਦੀ ਪਾਲਣਾ ਲਈ ਕਿਸੇ ਹੋਰ ਆਸਰੇ ਦੀ ਲੋੜ ਨਹੀਂ।',
    'ਅਭਰਨ is provisionally read as needing no sustenance, following Sant Sewa Singh and Neki. Mahan Kosh explicitly cites Jaap for an adornment meaning, also reflected in the Bhai Vir Singh-derived account. That is a substantive alternative, not a spelling mistake to be silently repaired.'
  ]
]);

deep(34,
  'In the selected reading, the One is beyond birth, a fixed appearance, material composition and the need for nourishment. The closing word also has a classic adornment reading, which remains visible beside this interpretation.',
  'ਇੱਥੇ ਚੁਣੇ ਅਰਥ ਅਨੁਸਾਰ ਪ੍ਰਭੂ ਜਨਮ, ਨਿਸ਼ਚਿਤ ਦਿੱਖ, ਭੌਤਿਕ ਤੱਤਾਂ ਦੀ ਬਣਤਰ ਅਤੇ ਪਾਲਣਾ ਦੀ ਲੋੜ ਤੋਂ ਪਰੇ ਹੈ। ਆਖ਼ਰੀ ਸ਼ਬਦ ਦਾ ਪੁਰਾਣੇ ਕੋਸ਼ ਵਿੱਚ ਗਹਿਣੇ ਜਾਂ ਸ਼ਿੰਗਾਰ ਵਾਲਾ ਅਰਥ ਵੀ ਮਿਲਦਾ ਹੈ; ਉਹ ਵੱਖਰਾ ਅਰਥ ਨੋਟ ਵਿੱਚ ਸੰਭਾਲਿਆ ਹੈ।',
  {
    focus: 'Divine being and the ordinary conditions of embodied life.',
    closeReading: 'The first three lines name conditions familiar from embodied life: birth, appearance and material composition. The selected final reading adds the need for sustenance. Read together, they refuse to make the One simply another organism among organisms. This is a statement about the Divine, not an invitation to despise the body. The final word deserves special care because the historical dictionary’s adornment sense would change the movement: instead of another negation of dependence, it would introduce a positive image of beauty or ornament. A careful learner can understand the chosen sequence while remembering that its closing interpretation is provisional.',
    words: [
      ['ਅਜਨਮ', 'Not originating through birth'],
      ['ਅਭੂਤ', 'Not composed of material elements; selected reading'],
      ['ਅਭਰਨ', 'Needing no sustenance in this reading; adornment is a documented alternative']
    ],
    care: 'The element-free reading uses a traditional vocabulary of material composition. Divine independence from nourishment does not remove the need to nourish and care for human bodies. The adornment alternative remains unresolved.',
    reflection: 'Which ordinary gift of nourishment could I receive with more gratitude today?',
    teachBack: 'How would the adornment reading change the emphasis of the final line?'
  }
);

// 35 — Indestructibility, wholeness, unconquerability and freedom from quarrel.
chhand(35, [
  [
    'You cannot be destroyed.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰਾ ਨਾਸ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ।',
    'ਅਗੰਜ is approached as indestructible in the consulted readings. It resumes an earlier salutation’s theme in the short ਹੈਂ form, with the same Divine addressee.'
  ],
  [
    'Your being cannot be broken apart.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰਾ ਸਰੂਪ ਟੁੱਟਣ ਜਾਂ ਭੰਨੇ ਜਾਣ ਤੋਂ ਪਰੇ ਹੈ।',
    'ਅਭੰਜ concerns being unbroken. Beside ਅਗੰਜ, it adds the image of wholeness: destruction and fragmentation are related, but the two epithets need not be treated as one mechanically interchangeable word.'
  ],
  [
    'No opponent can overpower You in a contest.',
    'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਤੇਰੇ ਨਾਲ ਜੂਝ ਕੇ ਤੈਨੂੰ ਵੱਸ ਵਿੱਚ ਨਹੀਂ ਕਰ ਸਕਦਾ।',
    'ਅਝੂਝ is read through the impossibility of successfully contending with the One. Sant Sewa Singh and the Bhai Vir Singh-derived account retain the struggle-image; Neki gives a broader invulnerability sense. The line offers praise, not instructions for fighting.'
  ],
  [
    'You are free from quarrel and turmoil.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਝਗੜੇ ਅਤੇ ਉਲਝਣ ਤੋਂ ਰਹਿਤ ਹੈਂ।',
    'ਅਝੰਝ is read through freedom from wrangling or agitation, following the Punjabi and Bhai Vir Singh-derived explanations. Neki’s inviolability wording is broader. The selected reading changes the final emphasis from resisting force to being untouched by quarrel.'
  ]
]);

deep(35,
  'The One cannot be destroyed, broken or overpowered. The final title turns the praise of strength toward freedom from quarrel, inviting us to distinguish steadiness from the urge to keep proving ourselves.',
  'ਪ੍ਰਭੂ ਦਾ ਨਾਸ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ, ਉਸ ਨੂੰ ਭੰਨਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ ਅਤੇ ਕੋਈ ਉਸ ਨੂੰ ਜਿੱਤ ਨਹੀਂ ਸਕਦਾ। ਆਖ਼ਰੀ ਨਾਮ ਝਗੜੇ ਤੋਂ ਮੁਕਤੀ ਵੱਲ ਧਿਆਨ ਲੈ ਜਾਂਦਾ ਹੈ; ਇਸ ਤੋਂ ਅਡੋਲਤਾ ਅਤੇ ਆਪਣੇ ਆਪ ਨੂੰ ਲਗਾਤਾਰ ਸਾਬਤ ਕਰਨ ਦੀ ਲੋੜ ਵਿਚਲਾ ਫ਼ਰਕ ਵਿਚਾਰਿਆ ਜਾ ਸਕਦਾ ਹੈ।',
  {
    focus: 'Strength that does not depend on quarrelling.',
    closeReading: 'The first pair concerns destruction and breaking apart. The next line introduces an opponent or contest, but the final line, in the selected reading, removes wrangling itself. This sequence makes a useful distinction: being unconquerable is not the same as needing to argue continuously. The One is not made secure by another being’s defeat. The practical reflection about steadiness is an educational response to the sequence, not a literal command embedded in each word. Notice how four compact negatives can move from survival, to wholeness, to confrontation, and finally to freedom from agitation without changing their direct devotional address.',
    words: [
      ['ਅਗੰਜ', 'Indestructible'],
      ['ਅਭੰਜ', 'Unbroken; not shattered'],
      ['ਅਝੂਝ', 'Not overcome through contest; working sense'],
      ['ਅਝੰਝ', 'Free from wrangling or agitation; selected sense']
    ],
    care: 'These attributes praise the Divine; they do not promise that a person is immune to harm. Freedom from quarrel should not be used to silence a necessary, respectful objection to wrongdoing.',
    reflection: 'When I am challenged, what could strength look like without needing to win an argument?',
    teachBack: 'How does the final title change the emphasis of the preceding contest-image?'
  }
);

// 36 — Unfathomable depth and friendship, free from entanglement and bondage.
chhand(36, [
  [
    'Your depth is beyond measure.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਗਹਿਰਾਈ ਦੀ ਥਾਹ ਨਹੀਂ ਪਾਈ ਜਾ ਸਕਦੀ।',
    'ਅਮੀਕ is a depth-related word of Arabic origin, documented in Mahan Kosh with a Jaap citation. Its initial ਅ belongs to the word itself; it is not the negative prefix found in ਅਬੰਧ. Here depth describes Divine profundity rather than a measurable physical distance.'
  ],
  [
    'You are the companion and friend of all.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਭ ਦਾ ਸਾਥੀ ਅਤੇ ਮਿੱਤਰ ਹੈਂ।',
    'ਰਫ਼ੀਕ supplies companionship beside the preceding image of depth. The frozen ਫ਼ is retained even though the second digital witness prints ਫ; that open spelling difference does not authorize a silent source change or a different friendship meaning.'
  ],
  [
    'You remain free of the entangling business of the world.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸੰਸਾਰ ਦੇ ਧੰਧਿਆਂ ਦੀ ਉਲਝਣ ਵਿੱਚ ਨਹੀਂ ਫਸਦਾ।',
    'ਅਧੰਧ is read through freedom from worldly occupations and their entanglement. Neki’s unoccupied wording and the Bhai Vir Singh-derived illusion-related sense vary in emphasis. The selected reading concerns non-entanglement, not an instruction for people to abandon useful work.'
  ],
  [
    'No bond can hold You captive.',
    'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਬੰਧਨ ਤੈਨੂੰ ਬੰਨ੍ਹ ਨਹੀਂ ਸਕਦਾ।',
    'ਅਬੰਧ directly names freedom from bondage. Placed after friendship and worldly affairs, it helps distinguish relationship from captivity: the One can be addressed as a friend without becoming someone’s possession.'
  ]
]);

deep(36,
  'The unfathomably deep One is also a companion to all. The chhand holds this closeness together with freedom from worldly entanglement and bondage, so mystery does not have to become distance.',
  'ਅਥਾਹ ਪ੍ਰਭੂ ਸਭ ਦਾ ਸਾਥੀ ਅਤੇ ਮਿੱਤਰ ਵੀ ਹੈ। ਇਹ ਛੰਦ ਉਸ ਦੀ ਨੇੜਤਾ ਨੂੰ ਸੰਸਾਰੀ ਉਲਝਣਾਂ ਅਤੇ ਬੰਧਨਾਂ ਤੋਂ ਮੁਕਤੀ ਦੇ ਨਾਲ ਰੱਖਦਾ ਹੈ; ਪੂਰਾ ਭੇਦ ਨਾ ਪਾ ਸਕਣਾ ਉਸ ਨੂੰ ਦੂਰ ਮੰਨਣਾ ਨਹੀਂ ਬਣਦਾ।',
  {
    focus: 'A profound presence that can still be called friend.',
    closeReading: 'ਅਮੀਕ and ਰਫ਼ੀਕ form an affirmative opening pair: depth is immediately followed by companionship. The first word’s Arabic origin also warns against treating every initial ਅ as a negative prefix. The second pair then names freedom from entangling occupations and bonds. Read the pairs together. Divine friendship is not presented as a limited bargain in which the One becomes indebted to a particular person. Nor does unfathomable depth prevent a direct, trusting address. This combination offers a different emphasis from the preceding chhand’s images of strength: intimacy and freedom can belong together, and a relationship need not be reduced to ownership.',
    words: [
      ['ਅਮੀਕ', 'Profound or fathomlessly deep; Arabic-derived word'],
      ['ਰਫ਼ੀਕ', 'Companion or friend; stored spelling retained'],
      ['ਅਧੰਧ', 'Free from entangling worldly occupations; selected sense'],
      ['ਅਬੰਧ', 'Unbound; not captive']
    ],
    care: 'The source comparison’s ਫ਼/ਫ difference remains open. The lesson’s language of freedom does not make care, honest work or mutual responsibility into spiritual failures.',
    reflection: 'What helps me offer friendship without trying to possess or control the other person?',
    teachBack: 'Why is it misleading to interpret the initial ਅ in ਅਮੀਕ as a negative prefix?'
  }
);

// 37 — Neither comprehension, time nor a binding net contains the One.
chhand(37, [
  [
    'You cannot be fully comprehended by our understanding.',
    'ਹੇ ਪ੍ਰਭੂ, ਮਨੁੱਖੀ ਬੁੱਧੀ ਤੇਰੀ ਪੂਰੀ ਸਮਝ ਨਹੀਂ ਪਾ ਸਕਦੀ।',
    'ਨ੍ਰਿਬੂਝ concerns the limits of what can be understood about the One. The negation falls on our ability to comprehend fully; it is not a statement that the Divine lacks intelligence.'
  ],
  [
    'You lie beyond the full reach of our perception and insight.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਾਡੀ ਸੂਝ ਅਤੇ ਪਛਾਣ ਦੀ ਪੂਰੀ ਪਹੁੰਚ ਤੋਂ ਪਰੇ ਹੈਂ।',
    'ਅਸੂਝ carries a related limit on discernment or recognition. The first two lines overlap deliberately, approaching incomprehensibility through ਬੂਝ and ਸੂਝ; they need not be forced into two unrelated doctrines.'
  ],
  [
    'You are beyond the rule of time and death.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਮੇਂ ਅਤੇ ਮੌਤ ਦੇ ਵੱਸ ਵਿੱਚ ਨਹੀਂ।',
    'ਅਕਾਲ addresses the One beyond ਕਾਲ, whose range includes time and death. This title resumes a central name from Jaap’s opening salutations. It does not assign the reader a lifespan or promise escape from ordinary mortality.'
  ],
  [
    'No net of bondage can ensnare You.',
    'ਹੇ ਪ੍ਰਭੂ, ਬੰਧਨਾਂ ਦਾ ਕੋਈ ਜਾਲ ਤੈਨੂੰ ਫਸਾ ਨਹੀਂ ਸਕਦਾ।',
    'ਅਜਾਲ is read through freedom from a ਜਾਲ, net, with Maya and birth/death associations in the Punjabi and Bhai Vir Singh-derived explanations. Neki instead uses an unshakeable sense. The selected ਜਾਲ image is distinct from ਜਲ, water, encountered in Chhand 16.'
  ]
]);

deep(37,
  'Human understanding and insight do not contain the One, and neither time nor a net of bondage holds the One captive. The chhand brings the limits of knowing beside freedom from being caught.',
  'ਮਨੁੱਖ ਦੀ ਬੁੱਧੀ ਅਤੇ ਸੂਝ ਪ੍ਰਭੂ ਨੂੰ ਪੂਰੀ ਤਰ੍ਹਾਂ ਨਹੀਂ ਸਮਝ ਸਕਦੀਆਂ; ਸਮਾਂ ਅਤੇ ਬੰਧਨਾਂ ਦਾ ਜਾਲ ਵੀ ਉਸ ਨੂੰ ਵੱਸ ਵਿੱਚ ਨਹੀਂ ਕਰ ਸਕਦੇ। ਇਹ ਛੰਦ ਸਮਝ ਦੀ ਹੱਦ ਦੇ ਨਾਲ ਫਸਣ ਤੋਂ ਮੁਕਤੀ ਦਾ ਭਾਵ ਰੱਖਦਾ ਹੈ।',
  {
    focus: 'The One exceeds both mental grasp and binding forces.',
    closeReading: 'The opening pair works through the closely related words for understanding and insight. Both place a limit on the knower’s reach, rather than attributing ignorance to the One. The third line then moves from knowledge to time and mortality. In the selected final reading, the net supplies another image of containment: what cannot be fully captured in an explanation is also not caught by a binding force. Read this after the friendship of Chhand 36. Acknowledging the limits of comprehension can coexist with trust and relationship; the prayer continues to say You are instead of falling silent because an explanation is incomplete.',
    words: [
      ['ਨ੍ਰਿਬੂਝ', 'Beyond complete comprehension'],
      ['ਅਸੂਝ', 'Beyond the full reach of discernment'],
      ['ਅਕਾਲ', 'Beyond time and death'],
      ['ਅਜਾਲ', 'Uncaught by a binding net; selected reading']
    ],
    care: 'Incomprehensibility is about human limits of understanding, not Divine ignorance. The net-related final reading is provisional, and claims about the One’s freedom are not guarantees that people cannot be harmed.',
    reflection: 'How can admitting a limit in my understanding make my listening more patient?',
    teachBack: 'Which two lines concern knowing, and how does the selected final image change the kind of limitation being considered?'
  }
);
