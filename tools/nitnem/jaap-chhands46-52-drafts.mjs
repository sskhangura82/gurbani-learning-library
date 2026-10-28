/* GLP-001 Jaap Sahib Chhands 46–52: original educational drafts.
 * The immutable Gurmukhi and source hashes remain in nitnem/data/jaap.json.
 * These are selective explanations, not approved translations or santhiya.
 * Source inspection, lexical alternatives and comparison limits are recorded
 * in jaap-chhands46-52-research.json. No qualified human review is claimed.
 */

export const jaap46to52Lines = [];
export const jaap46to52Deep = [];

function chhand(n, rows) {
  const expected = n === 50 || n === 51 ? 2 : 4;
  if (n < 46 || n > 52 || rows.length !== expected) {
    throw new Error('Unexpected source-record count for Jaap Chhand ' + n);
  }
  const unitId = 'jaap' + String(n).padStart(3, '0');
  rows.forEach(([simpleEn, simplePa, nuance], index) => {
    if (!simpleEn || !simplePa || !nuance) {
      throw new Error('Missing bilingual draft or nuance for ' + unitId);
    }
    jaap46to52Lines.push({
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
  jaap46to52Deep.push({
    bani: 'jaap',
    unitId: 'jaap' + String(n).padStart(3, '0'),
    simpleEn,
    simplePa,
    study,
    editorialStatus: 'DRAFT_AI_UNREVIEWED',
    humanReviewed: false
  });
}

const sunEn = 'I bow to You, the radiance from which every sun receives its light.';
const sunPa = 'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਸੂਰਜ ਦਾ ਚਾਨਣ ਤੇਰੇ ਪ੍ਰਕਾਸ਼ ਤੋਂ ਹੈ।';

// 46 — Independence, dissolution, radiance and honour remain distinct claims.
chhand(46, [
  [
    'You are without a physical body, and no other master rules over You.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਰੀਰ ਤੋਂ ਰਹਿਤ ਹੈਂ ਅਤੇ ਤੇਰੇ ਉੱਪਰ ਕੋਈ ਹੋਰ ਮਾਲਕ ਨਹੀਂ।',
    'ਅਨੰਗੀ concerns the absence of bodily limbs; ਅਨਾਥੇ concerns having no ਨਾਥ, master, above the One. Both epithets belong to this line. The second is a statement of Divine independence, not the ordinary social condition of an abandoned or unsupported person.'
  ],
  [
    'You depend on no companion and hold the power that brings creation to its end.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਕਿਸੇ ਸਾਥੀ ਦੀ ਲੋੜ ਨਹੀਂ ਅਤੇ ਸ੍ਰਿਸ਼ਟੀ ਦਾ ਅੰਤ ਕਰਨ ਦੀ ਸਮਰੱਥਾ ਤੇਰੇ ਕੋਲ ਹੈ।',
    'ਨ੍ਰਿਸੰਗੀ is read through freedom from a necessary companion. ਪ੍ਰਮਾਥੇ is provisionally read as destructive or dissolving power, supported by Sant Sewa Singh and Neki. The Bhai Vir Singh-derived account instead develops a churning image. That alternative remains open; the main sentence does not turn the two words into a single title.'
  ],
  [
    sunEn,
    sunPa,
    'ਭਾਨ is the sun. The repeated ਭਾਨ ਭਾਨੇ construction directs praise through the image of a sun beyond suns; the explanation selects the source-of-radiance emphasis. This whole original line recurs at 47.02, where its main bilingual explanation is identical.'
  ],
  [
    'I bow to You, the honour of all who are honoured.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਾਰੇ ਮਾਣ ਵਾਲਿਆਂ ਦਾ ਵੀ ਮਾਣ ਤੂੰ ਹੀ ਹੈਂ।',
    'ਮਾਨ ਮਾਨੇ intensifies honour and reverence. It is read here as the One to whom even the honoured owe reverence, not as praise of personal arrogance. The same wording is used at 56.02; a bestower-of-honour emphasis also appears in Neki’s rendering there.'
  ]
]);

deep(46,
  'The opening pairs describe the One as free from bodily limits, an external master and dependence on a companion, while also naming the power of dissolution. The closing salutations turn toward the source of radiance and honour. Independence does not make the Divine distant from what shines or deserves reverence.',
  'ਪਹਿਲੀਆਂ ਜੋੜੀਆਂ ਪ੍ਰਭੂ ਨੂੰ ਸਰੀਰ ਦੀ ਹੱਦ, ਕਿਸੇ ਉੱਪਰਲੇ ਮਾਲਕ ਅਤੇ ਸਾਥੀ ਦੀ ਲੋੜ ਤੋਂ ਰਹਿਤ ਦੱਸਦੀਆਂ ਹਨ; ਨਾਲ ਹੀ ਸ੍ਰਿਸ਼ਟੀ ਦੇ ਅੰਤ ਦੀ ਸਮਰੱਥਾ ਵੀ ਉਸੇ ਦੀ ਹੈ। ਅੰਤ ਦੀਆਂ ਨਮਸਕਾਰਾਂ ਪ੍ਰਕਾਸ਼ ਅਤੇ ਮਾਣ ਦੇ ਮੂਲ ਵੱਲ ਮੁੜਦੀਆਂ ਹਨ। ਪ੍ਰਭੂ ਦੀ ਸੁਤੰਤਰਤਾ ਦਾ ਭਾਵ ਇਹ ਨਹੀਂ ਕਿ ਚਾਨਣ ਅਤੇ ਸਤਿਕਾਰ ਨਾਲ ਉਸ ਦਾ ਕੋਈ ਸੰਬੰਧ ਨਹੀਂ।',
  {
    focus: 'The independent One as the source of radiance and honour.',
    closeReading: 'The first two lines each carry two epithets, so pause over both halves: body and master, companion and dissolving power. They address different kinds of dependence and action. The next two lines explicitly renew ਨਮੋ and use a repeated noun to deepen praise. A sun illuminates other things, yet here the sun itself points beyond its own brightness. A person may receive honour, yet honour also points beyond the person receiving it. The movement invites gratitude without pretending that familiar greatness contains the One. Read the destruction word beside these affirming images; it is one aspect of the praise, not the entire portrait.',
    words: [
      ['ਅਨੰਗੀ', 'Without bodily limbs; not an embodied organism'],
      ['ਅਨਾਥੇ', 'Having no master above the One'],
      ['ਪ੍ਰਮਾਥੇ', 'Dissolving or destructive power; churning is an alternative reading'],
      ['ਭਾਨ', 'Sun'],
      ['ਮਾਨ', 'Honour or reverence in this phrase']
    ],
    care: 'Body-free language does not demean human bodies, and needing no companion does not make human loneliness a spiritual ideal. The destruction title describes Divine power; it gives the reader no instruction to harm.',
    reflection: 'When I admire someone’s brilliance or stature, can gratitude reach beyond the admired person?',
    teachBack: 'Identify both epithets in each opening line, then explain how the sun and honour images change the emphasis.'
  }
);

// 47 — Moon and sun give way to song and melodic movement.
chhand(47, [
  [
    'I bow to You, whose gentle radiance shines through every moon.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਚੰਦ ਦੀ ਠੰਢੀ ਰੌਸ਼ਨੀ ਵਿੱਚ ਤੇਰੀ ਹੀ ਜੋਤ ਹੈ।',
    'ਚੰਦ੍ਰ ਚੰਦ੍ਰੇ repeats the moon image to direct praise toward its supreme source. Coolness and gentle radiance follow the Punjabi commentary’s devotional emphasis. These are poetic associations of moonlight, not an explanation of how a physical moon produces or reflects light.'
  ],
  [
    sunEn,
    sunPa,
    'This is the exact original line already encountered at 46.03. Keeping the main explanation unchanged makes the repetition visible: the same sun image now stands immediately beside moon, song and melody. Context adds a relation without changing the word ਭਾਨ into a new epithet.'
  ],
  [
    'I bow to You, the song at the heart of every song.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਗੀਤਾਂ ਦਾ ਸਾਰ ਅਤੇ ਮਿਠਾਸ ਤੂੰ ਹੀ ਹੈਂ।',
    'ਗੀਤ ਗੀਤੇ uses the same repeated-noun pattern as the celestial images. Song becomes a way of praising the One as its inner essence and delight. The line names no particular song, singer or musical tradition as an exclusive dwelling of the Divine.'
  ],
  [
    'I bow to You, the melody within every melody.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਤਾਨ ਦੀ ਸੁਰਿਲੀ ਧੁਨ ਦਾ ਆਧਾਰ ਤੂੰ ਹੀ ਹੈਂ।',
    'ਤਾਨ is selected in its musical sense, supported by the adjacent ਗੀਤ, Sant Sewa Singh, Neki and the historical dictionary’s account of melodic movement. The Bhai Vir Singh-derived page gives power and instrument alternatives. Those are recorded rather than silently merged with the selected melody reading.'
  ]
]);

deep(47,
  'Moonlight, sunlight, song and melody become four ways of bowing to the same One. Each familiar beauty points toward a depth beyond itself. The selected reading moves from what is seen in the sky to what is heard in music, keeping the rhythm of reverence throughout.',
  'ਚੰਦ ਦਾ ਚਾਨਣ, ਸੂਰਜ ਦਾ ਪ੍ਰਕਾਸ਼, ਗੀਤ ਅਤੇ ਤਾਨ—ਇਹ ਚਾਰੋ ਉਸੇ ਇੱਕ ਪ੍ਰਭੂ ਅੱਗੇ ਨਮਸਕਾਰ ਦੇ ਰੂਪ ਬਣਦੇ ਹਨ। ਜਾਣੀ ਹੋਈ ਸੁੰਦਰਤਾ ਆਪਣੇ ਤੋਂ ਪਰੇ ਕਿਸੇ ਡੂੰਘੇ ਆਧਾਰ ਵੱਲ ਧਿਆਨ ਲੈ ਜਾਂਦੀ ਹੈ। ਚੁਣੇ ਅਰਥ ਵਿੱਚ ਛੰਦ ਅਸਮਾਨ ਦੀ ਦਿੱਖ ਤੋਂ ਸੰਗੀਤ ਦੀ ਸੁਣਨ ਵਾਲੀ ਸੁੰਦਰਤਾ ਵੱਲ ਵਧਦਾ ਹੈ, ਪਰ ਨਮਸਕਾਰ ਦੀ ਲੈ ਇੱਕੋ ਰਹਿੰਦੀ ਹੈ।',
  {
    focus: 'Visible and musical beauty as languages of praise.',
    closeReading: 'Every line begins with ਨਮੋ, and every image is doubled: moon, sun, song, melody. This repetition does more than supply a list of attractive things. It asks where their beauty leads the attention. The sun line is unchanged from the preceding chhand, but its neighbours now make a new sequence: two celestial images followed by two musical ones. Within the selected musical reading, a song and a taan are related without being interchangeable; a taan concerns the movement or unfolding of notes. Notice how the poem can carry the same act of bowing through different experiences without requiring one experience to replace all the others.',
    words: [
      ['ਚੰਦ੍ਰ', 'Moon'],
      ['ਭਾਨ', 'Sun'],
      ['ਗੀਤ', 'Song'],
      ['ਤਾਨ', 'Melodic movement or phrase; selected sense'],
      ['ਨਮੋ', 'An expression of bowing or salutation']
    ],
    care: 'These images do not prescribe a ritual of sun or moon worship, a compulsory musical performance or a particular sensory experience. The power/instrument alternatives for ਤਾਨ remain provisional lexical choices, not new words inserted into the verse.',
    reflection: 'What familiar beauty helps me turn appreciation into gratitude?',
    teachBack: 'Describe the two pairs of images, and explain why the repeated sun line keeps its meaning while gaining a new setting.'
  }
);

// 48 — Dance, resonance, the strength of hands and instrumental sound.
chhand(48, [
  [
    'I bow to You, the living rhythm of every dance.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਨਾਚ ਵਿੱਚ ਵੱਸਦੀ ਲੈ ਤੈਥੋਂ ਹੈ।',
    'ਨ੍ਰਿੱਤ is read through dance and movement. Neki retains the dance image, while Sant Sewa Singh relates it to the movement of the world; the Bhai Vir Singh-derived account develops bliss and churning associations. The main explanation keeps the dance image without prescribing a performance. The frozen addak in ਨ੍ਰਿੱਤ is preserved.'
  ],
  [
    'I bow to You, the resonance at the heart of every sound.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਨਾਦ ਦੇ ਅੰਦਰ ਗੂੰਜਦਾ ਸੁਰ ਤੂੰ ਹੀ ਹੈਂ।',
    'ਨਾਦ concerns sound or resonance. The repeated ਨਾਦ ਨਾਦੇ carries praise through that image, following the dance line. It does not name one required pitch, an audible inner phenomenon or a test of the reader’s spiritual progress.'
  ],
  [
    'I bow to You, the strength within all hands.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਾਰੇ ਹੱਥਾਂ ਦੀ ਸਮਰੱਥਾ ਦਾ ਮੂਲ ਤੂੰ ਹੀ ਹੈਂ।',
    'ਪਾਨ is provisionally read as hand, supported by Sant Sewa Singh, the Bhai Vir Singh-derived account and Mahan Kosh’s ਪਾਣਿ/ਹੱਥ sense. Neki instead gives a drum-beating image. The dictionary also lists unrelated homonyms, including drinking; they should not be substituted automatically. The original ਪਾਨ spelling is unchanged.'
  ],
  [
    'I bow to You, the music voiced through every instrument.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਸਾਜ਼ ਵਿੱਚ ਗੂੰਜਦੀ ਸੰਗੀਤ ਦੀ ਧੁਨ ਤੂੰ ਹੀ ਹੈਂ।',
    'ਬਾਦ is read through ਵਾਦਯ, instrumental sound, following the musical context and the consulted commentaries. It is not taken here as the ordinary homonym for a quarrel. The pair praises the One through the sounding of instruments without naming a required instrument or method.'
  ]
]);

deep(48,
  'Dance, resonance, the strength of hands and instrumental sound place movement and creative capacity within the language of devotion. The hand reading is a deliberate choice: another rendering hears drum-beating in that line. The lesson keeps the distinction while attending to the repeated act of bowing.',
  'ਨਾਚ, ਨਾਦ, ਹੱਥਾਂ ਦੀ ਸਮਰੱਥਾ ਅਤੇ ਸਾਜ਼ਾਂ ਦੀ ਧੁਨ—ਇਹਨਾਂ ਰਾਹੀਂ ਗਤੀ ਅਤੇ ਰਚਨਾਤਮਕ ਤਾਕਤ ਭਗਤੀ ਦੀ ਬੋਲੀ ਬਣਦੀਆਂ ਹਨ। ਪਾਨ ਦਾ ਹੱਥ ਵਾਲਾ ਅਰਥ ਇੱਥੇ ਸੋਚ ਕੇ ਚੁਣਿਆ ਹੈ; ਇੱਕ ਹੋਰ ਵਿਆਖਿਆ ਇਸ ਵਿੱਚ ਢੋਲ ਵਜਾਉਣ ਦਾ ਭਾਵ ਲੈਂਦੀ ਹੈ। ਪਾਠ ਇਹ ਫ਼ਰਕ ਸੰਭਾਲਦਿਆਂ ਵਾਰ-ਵਾਰ ਆਉਂਦੀ ਨਮਸਕਾਰ ਵੱਲ ਧਿਆਨ ਲਿਆਉਂਦਾ ਹੈ।',
  {
    focus: 'Creative movement, sound and capacity received with gratitude.',
    closeReading: 'The doubled words continue the pattern of the preceding chhand, but the images draw closer to movement and making. Dance and resonance lead into the capacity of hands and the sounding of instruments. Under the selected hand reading, the third line does not have to become another musical noun merely because its neighbours concern performance. It can draw attention to the ability through which something is made or played. Under Neki’s drum reading, the sequence would remain more uniformly musical. Holding that difference openly is part of careful reading. In either account, the repeated salutation prevents the artist’s skill from becoming the sole object of admiration.',
    words: [
      ['ਨ੍ਰਿੱਤ', 'Dance or rhythmic movement'],
      ['ਨਾਦ', 'Sound or resonance'],
      ['ਪਾਨ', 'Hand in the selected reading; a drum-related alternative is recorded'],
      ['ਬਾਦ', 'Instrumental sound; selected contextual sense']
    ],
    care: 'The passage is praise, not a requirement to dance, play an instrument or hear an inner sound. Hand imagery expresses capacity; it does not measure human worth by physical strength, dexterity or ability.',
    reflection: 'How might I practise a skill with gratitude for what makes the practice possible?',
    teachBack: 'What changes in the sequence when ਪਾਨ is read as the strength of hands rather than drum-beating?'
  }
);

// 49 — Beyond one body or name, present in all forms, and beyond possession.
chhand(49, [
  [
    'You are without bodily limbs, and no single name can contain You.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਰੀਰ ਦੇ ਅੰਗਾਂ ਤੋਂ ਰਹਿਤ ਹੈਂ ਅਤੇ ਕੋਈ ਇੱਕ ਨਾਮ ਤੈਨੂੰ ਪੂਰਾ ਨਹੀਂ ਬਿਆਨ ਕਰ ਸਕਦਾ।',
    'ਅਨੰਗੀ repeats the body-free title; ਅਨਾਮੇ adds namelessness. The explanation treats namelessness as the inability of a fixed descriptive name to exhaust the One. It does not deny the devotional remembrance of Naam, nor omit the first of the two epithets.'
  ],
  [
    'You are present in all the forms of creation.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸ੍ਰਿਸ਼ਟੀ ਦੇ ਸਾਰੇ ਰੂਪਾਂ ਵਿੱਚ ਵਿਆਪਕ ਹੈਂ।',
    'ਸਮਸਤੀ ਸਰੂਪੇ is a connected phrase concerning all forms, not two unrelated titles. Beside ਅਨੰਗੀ, it places pervasion of forms alongside freedom from a single body. The wording preserves that tension rather than claiming that the first line has been withdrawn.'
  ],
  [
    'You break apart what has been formed and bring it to an end.',
    'ਹੇ ਪ੍ਰਭੂ, ਬਣੇ ਹੋਏ ਰੂਪਾਂ ਨੂੰ ਭੰਗ ਕਰਨ ਵਾਲਾ ਅਤੇ ਉਹਨਾਂ ਦਾ ਅੰਤ ਕਰਨ ਵਾਲਾ ਤੂੰ ਹੀ ਹੈਂ।',
    'ਪ੍ਰਭੰਗੀ and ਪ੍ਰਮਾਥੇ are both retained in this account of breaking and dissolution. Their overlap is not evidence that one may be skipped. The selected reading follows the Punjabi steek’s destruction emphasis; the Bhai Vir Singh-derived account distinguishes a breaking title from a churning title. The latter remains a real alternative.'
  ],
  [
    'All the abundance and splendour of creation rest in You.',
    'ਹੇ ਪ੍ਰਭੂ, ਸ੍ਰਿਸ਼ਟੀ ਦੀ ਸਾਰੀ ਸੰਪਦਾ ਅਤੇ ਵਡਿਆਈ ਤੇਰੇ ਵਿੱਚ ਹੈ।',
    'ਬਿਭੂਤੇ is read through abundance, wealth and splendour; ਸਮਸਤੀ extends the phrase to all. Mahan Kosh distinguishes the wealth sense of ਬਿਭੂਤ from its ash-related homonym. Sant Sewa Singh stresses the treasury of all things, while Neki stresses the source of wealth. No material reward is promised to the reader.'
  ]
]);

deep(49,
  'The One cannot be confined to a body or name, yet is present in every form. The same verse sequence names the dissolution of forms and the fullness of abundance. It invites a relationship with the world that notices both its gifts and its passing forms without claiming to possess the Divine.',
  'ਪ੍ਰਭੂ ਨੂੰ ਕਿਸੇ ਇੱਕ ਸਰੀਰ ਜਾਂ ਨਾਮ ਵਿੱਚ ਬੰਨ੍ਹਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ, ਫਿਰ ਵੀ ਉਹ ਹਰ ਰੂਪ ਵਿੱਚ ਵਿਆਪਕ ਹੈ। ਇਹੀ ਛੰਦ ਰੂਪਾਂ ਦੇ ਭੰਗ ਹੋਣ ਅਤੇ ਸਾਰੀ ਸੰਪਦਾ ਦੇ ਮੂਲ ਨੂੰ ਇਕੱਠੇ ਯਾਦ ਕਰਦਾ ਹੈ। ਇਸ ਤੋਂ ਜਗਤ ਦੀਆਂ ਦਾਤਾਂ ਅਤੇ ਉਸ ਦੇ ਬਦਲਦੇ ਰੂਪਾਂ ਦੋਹਾਂ ਵੱਲ ਧਿਆਨ ਜਾਂਦਾ ਹੈ, ਪਰ ਪ੍ਰਭੂ ਨੂੰ ਆਪਣੀ ਮਲਕੀਅਤ ਬਣਾਉਣ ਦਾ ਦਾਅਵਾ ਨਹੀਂ ਬਣਦਾ।',
  {
    focus: 'Formlessness, pervasion, dissolution and abundance held together.',
    closeReading: 'Read the first and second lines beside one another before trying to resolve their tension. The One is not an organism identified by limbs or an object exhausted by a name, yet every form is included in the scope of ਸਮਸਤੀ ਸਰੂਪੇ. The third line then brings the breaking of forms into the same address. Finally, ਸਮਸਤੀ returns with abundance and splendour. The repeated word all widens both presence and treasure. This sequence can loosen possessiveness: a form can matter, and a gift can be appreciated, without either becoming permanent or capturing the whole of the Divine. That reflection arises from the passage’s contrasts, not from an instruction to abandon care for creation.',
    words: [
      ['ਅਨਾਮੇ', 'Beyond a name that could exhaustively describe the One'],
      ['ਸਮਸਤੀ', 'All or the whole'],
      ['ਸਰੂਪੇ', 'Form or being'],
      ['ਪ੍ਰਭੰਗੀ', 'Breaking or dissolving'],
      ['ਬਿਭੂਤੇ', 'Abundance, wealth or splendour; selected sense']
    ],
    care: 'Formlessness is not contempt for bodies, and dissolution is not permission to destroy what others need. Presence in all forms does not mean that every human action deserves approval.',
    reflection: 'Can I value a gift deeply without treating it as something I can keep forever?',
    teachBack: 'Explain why the body-free opening and the all-forms phrase need to be read together.'
  }
);

// 50 — Two complete lines: unstained being and supreme sovereignty.
chhand(50, [
  [
    'Your being is entirely unstained; no blemish attaches to You.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰਾ ਸਰੂਪ ਪੂਰੀ ਤਰ੍ਹਾਂ ਨਿਰਮਲ ਹੈ; ਕੋਈ ਕਲੰਕ ਤੈਨੂੰ ਨਹੀਂ ਲੱਗਦਾ।',
    'ਕਲੰਕੰ ਬਿਨਾ and ਨੇਕਲੰਕੀ reinforce one another: absence of blemish and unstained being. The whole phrase occupies one line. In this context, ਨੇਕਲੰਕੀ is not used to identify a particular Kalki incarnation or to replace the frozen spelling with another edition’s form.'
  ],
  [
    'I bow to You, the sovereign over every ruler, whose being is supreme.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੂੰ ਸਾਰੇ ਰਾਜਿਆਂ ਦਾ ਮਹਾਰਾਜਾ ਹੈਂ ਅਤੇ ਤੇਰਾ ਸਰੂਪ ਪਰਮ ਮਹਾਨ ਹੈ।',
    'ਰਾਜ ਰਾਜੇਸ੍ਵਰੰ and ਪਰਮ ਰੂਪੇ both belong to this line. The first places kings beneath Divine sovereignty; the second praises supreme being or form. Sant Sewa Singh brings out radiance, while Neki brings out supreme existence. The main paraphrase avoids reducing ਰੂਪ to bodily appearance.'
  ]
]);

deep(50,
  'This two-line chhand joins unstained being with sovereignty above every ruler. The doubled language of freedom from blemish prepares for praise of supreme authority. Its royal image does not make an earthly office or title equal to the One being addressed.',
  'ਦੋ ਤੁਕਾਂ ਵਾਲਾ ਇਹ ਛੰਦ ਨਿਰਮਲ ਸਰੂਪ ਨੂੰ ਸਾਰੇ ਰਾਜਿਆਂ ਤੋਂ ਉੱਚੀ ਪ੍ਰਭੂਤਾ ਨਾਲ ਜੋੜਦਾ ਹੈ। ਕਲੰਕ ਤੋਂ ਰਹਿਤ ਹੋਣ ਦੀ ਦੁਹਰਾਈ ਪਰਮ ਅਧਿਕਾਰ ਦੀ ਸਿਫ਼ਤ ਲਈ ਭੂਮਿਕਾ ਬਣਦੀ ਹੈ। ਰਾਜਸੀ ਉਪਮਾ ਕਿਸੇ ਧਰਤੀ ਦੇ ਅਹੁਦੇ ਜਾਂ ਖ਼ਿਤਾਬ ਨੂੰ ਸੰਬੋਧਿਤ ਪ੍ਰਭੂ ਦੇ ਬਰਾਬਰ ਨਹੀਂ ਕਰਦੀ।',
  {
    focus: 'Unstained being as the setting for supreme authority.',
    closeReading: 'Although this chhand has only two lines, each is a full phrase with more than one point of attention. The first repeats freedom from blemish, then speaks of ਸਰੂਪ. The second repeats kingship at a higher order and closes with ਪਰਮ ਰੂਪੇ. The movement from unstainedness to supreme sovereignty is therefore also held together by the language of being or form. A reader can hear authority here without stopping at the outward splendour of a throne. The ruler of rulers remains the One praised as beyond blemish. As a reflection on responsibility, this can prompt us to ask whether the authority we exercise serves what is worthy of respect.',
    words: [
      ['ਕਲੰਕੰ', 'Blemish, stain or blame'],
      ['ਬਿਨਾ', 'Without'],
      ['ਨੇਕਲੰਕੀ', 'Unstained; free of blemish in this phrase'],
      ['ਰਾਜੇਸ੍ਵਰੰ', 'Sovereign of rulers'],
      ['ਪਰਮ', 'Supreme']
    ],
    care: 'Blemish language here concerns the praised Divine being, not skin, disability, caste or bodily worth. The royal image gives no human leader immunity from moral responsibility.',
    reflection: 'Where I have responsibility, what would make my use of it worthy of trust?',
    teachBack: 'Identify the two linked ideas in each of the chhand’s two lines.'
  }
);

// 51 — Spiritual mastery and royal power each answer to the same One.
chhand(51, [
  [
    'I bow to You, master of the masters of yoga and supreme in spiritual perfection.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੂੰ ਵੱਡੇ ਯੋਗੀਆਂ ਦਾ ਵੀ ਮਾਲਕ ਹੈਂ ਅਤੇ ਆਤਮਕ ਪੂਰਨਤਾ ਦਾ ਸਰਬੋਤਮ ਸਰੂਪ ਹੈਂ।',
    'ਜੋਗ ਜੋਗੇਸ੍ਵਰੰ names mastery beyond the masters of yoga; ਪਰਮ ਸਿੱਧੇ adds supreme perfection or accomplishment. The Punjabi steek also emphasises mastery over siddhis. The draft keeps both clauses without claiming that the Divine had to acquire perfection through a bodily practice or that a reader will gain extraordinary powers.'
  ],
  [
    'I bow to You, ruler over all rulers, whose greatness is unsurpassed.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੂੰ ਸਾਰੇ ਰਾਜਿਆਂ ਦਾ ਮਹਾਰਾਜਾ ਹੈਂ ਅਤੇ ਤੇਰੀ ਮਹਾਨਤਾ ਦਾ ਕੋਈ ਸਾਨੀ ਨਹੀਂ।',
    'The kingship phrase recurs from Chhand 50, but the ending is now ਪਰਮ ਬ੍ਰਿਧੇ. Sant Sewa Singh and the Bhai Vir Singh-derived account emphasise greatness; Neki emphasises esteem. The selected sense is eminence, not the age of a Divine body. The frozen ਬ੍ਰਿਧੇ is retained despite a comparator commentary’s ਬ੍ਰਿੱਧੇ spelling.'
  ]
]);

deep(51,
  'Masters of spiritual discipline and holders of royal power are placed before the same supreme One. Each line adds a further quality: fullness of spiritual accomplishment and unsurpassed greatness. The parallel gives devotion a wider horizon than either spiritual prestige or worldly rank.',
  'ਆਤਮਕ ਸਾਧਨਾ ਦੇ ਮਾਹਰ ਅਤੇ ਰਾਜਸੀ ਅਧਿਕਾਰ ਵਾਲੇ ਉਸੇ ਪਰਮ ਪ੍ਰਭੂ ਅੱਗੇ ਆਉਂਦੇ ਹਨ। ਹਰ ਤੁਕ ਇੱਕ ਹੋਰ ਗੁਣ ਜੋੜਦੀ ਹੈ: ਆਤਮਕ ਪੂਰਨਤਾ ਅਤੇ ਬੇਮਿਸਾਲ ਮਹਾਨਤਾ। ਇਹ ਸਮਾਂਤਰ ਬਣਤਰ ਭਗਤੀ ਨੂੰ ਆਤਮਕ ਪ੍ਰਸਿੱਧੀ ਜਾਂ ਦੁਨਿਆਵੀ ਦਰਜੇ ਦੀ ਹੱਦ ਤੋਂ ਅੱਗੇ ਲੈ ਜਾਂਦੀ ਹੈ।',
  {
    focus: 'Spiritual and worldly distinction beneath one supreme mastery.',
    closeReading: 'The two lines are built in parallel. Both begin with salutation, name a sphere of mastery, and end with ਪਰਮ followed by a further quality. The first concerns yoga and accomplishment; the second concerns rule and greatness. The word supreme therefore does not attach only to power in the public world or only to achievement in spiritual practice. Both are drawn into one act of reverence. Compare the second line with Chhand 50: its kingship phrase is familiar, but the final epithet changes. Careful attention notices that change instead of treating every repeated royal phrase as an identical whole line. The passage can support humility about both credentials and position.',
    words: [
      ['ਜੋਗ', 'Yoga or spiritual discipline in this compound'],
      ['ਜੋਗੇਸ੍ਵਰੰ', 'Master of the masters of yoga'],
      ['ਸਿੱਧੇ', 'Accomplished or perfected; spiritual perfection in this reading'],
      ['ਬ੍ਰਿਧੇ', 'Eminent or greatly exalted in this context']
    ],
    care: 'The language of siddhi does not promise supernatural abilities, and ਬ੍ਰਿਧੇ here should not be reduced to physical old age. Neither spiritual attainment nor worldly status makes one person’s dignity greater than another’s.',
    reflection: 'What changes when I regard an achievement as a responsibility rather than a reason to feel above others?',
    teachBack: 'Show the parallel between the two lines, then name the changed ending in the repeated kingship phrase.'
  }
);

// 52 — Martial power, complete knowing and maternal care address one Divine.
chhand(52, [
  [
    'I bow to You, the bearer of weapons.',
    'ਹੇ ਸ਼ਸਤ੍ਰ ਧਾਰਨ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਸਸਤ੍ਰ ਪਾਣੇ presents a martial image of weapons borne in the hand. ਪਾਣੇ supplies the hand-bearing element. ਸਸਤ੍ਰ is a broad weapons term; it need not exclude the projected weapons named in the next line. This is a salutation to Divine power, not an instruction to arm or attack.'
  ],
  [
    'I bow to You, who wield weapons that are sent forth.',
    'ਹੇ ਅਸਤ੍ਰ ਚਲਾਉਣ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'Mahan Kosh distinguishes ਅਸਤ੍ਰ as a weapon projected or cast forth. Sant Sewa Singh explains the compound through using such weapons, while Neki stresses their projection. The Bhai Vir Singh-derived account develops an arrow-of-wisdom interpretation. That metaphor remains an attributed alternative, not a replacement of the martial wording.'
  ],
  [
    'I bow to You, whose knowing is complete.',
    'ਹੇ ਸਭ ਕੁਝ ਪੂਰੀ ਤਰ੍ਹਾਂ ਜਾਣਨ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਪਰਮ ਗਿਆਤਾ praises supreme knowing. It adds discernment to the preceding power images rather than naming another weapon. The frozen ਗਿਆਤਾ spelling is retained; a consulted commentary prints ਗਯਾਤਾ, which is recorded as that witness’s form rather than a correction.'
  ],
  [
    'I bow to You, the Mother who gives life and care to the world.',
    'ਹੇ ਜਗਤ ਦੀ ਮਾਤਾ ਸਰੂਪ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੂੰ ਸਭ ਨੂੰ ਜੀਵਨ ਅਤੇ ਸੰਭਾਲ ਦਿੰਦਾ ਹੈਂ।',
    'ਲੋਕ ਮਾਤਾ directly introduces the world’s Mother. The draft retains this maternal form of address and draws out its life-giving care. It is not a claim that the Divine is exclusively male or female, nor a restriction of human caregiving to women. The same One receives all four salutations.'
  ]
]);

deep(52,
  'The chhand places the bearer and wielder of weapons beside complete knowing and the Mother of the world. Strength, discernment and care are addressed to one Divine presence. The maternal ending belongs fully to the passage and changes how its opening martial images are heard.',
  'ਇਹ ਛੰਦ ਸ਼ਸਤ੍ਰ ਧਾਰਨ ਕਰਨ ਅਤੇ ਅਸਤ੍ਰ ਚਲਾਉਣ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਪੂਰੇ ਗਿਆਨ ਅਤੇ ਜਗਤ ਦੀ ਮਾਤਾ ਦੇ ਰੂਪ ਨਾਲ ਜੋੜਦਾ ਹੈ। ਸਮਰੱਥਾ, ਸੂਝ ਅਤੇ ਸੰਭਾਲ ਉਸੇ ਇੱਕ ਪ੍ਰਭੂ ਨੂੰ ਸੰਬੋਧਿਤ ਹਨ। ਮਾਂ ਵਾਲਾ ਆਖ਼ਰੀ ਰੂਪ ਛੰਦ ਦਾ ਪੂਰਾ ਹਿੱਸਾ ਹੈ ਅਤੇ ਪਹਿਲੀਆਂ ਜੰਗੀ ਉਪਮਾਵਾਂ ਨੂੰ ਸਮਝਣ ਵਿੱਚ ਵੀ ਰਾਹ ਦਿਖਾਉਂਦਾ ਹੈ।',
  {
    focus: 'Strength understood alongside knowing and maternal care.',
    closeReading: 'The repeated ਨਮੋ holds four images within one address. The first two concern weapons: bearing them and, in the selected second reading, projecting them. The verse then turns to knowing and finally to the Mother of the world. Do not stop after the first pair, or soften the pair until its martial character disappears. Instead, listen to the whole sequence. Power is praised together with complete knowing and a relationship of care that reaches the world. The final maternal title also prevents the royal and martial imagery from fixing devotion into exclusively masculine terms. A useful reflection is how courage can remain attentive to those who need protection rather than becoming a display of dominance.',
    words: [
      ['ਸਸਤ੍ਰ', 'Weapons; a broad term'],
      ['ਪਾਣੇ', 'Bearing in the hand in this compound'],
      ['ਅਸਤ੍ਰ', 'A weapon projected or cast forth'],
      ['ਗਿਆਤਾ', 'Knower'],
      ['ਲੋਕ ਮਾਤਾ', 'Mother of the world']
    ],
    care: 'These salutations are not permission for aggression, cruelty or hostility toward a group. Divine motherhood is a devotional relationship, not a biological description or a hierarchy of genders.',
    reflection: 'Where can courage and careful concern for others guide the same action?',
    teachBack: 'Explain how the knowing and maternal titles affect your reading of the two martial titles.'
  }
);
