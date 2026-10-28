/* Jaap Sahib, Chhands 23–30: original bilingual educational drafts.
 * Source anchors are the frozen jaap023..jaap030 records in jaap.json.
 * No scripture, heading, transliteration or earlier lesson is replaced here.
 * These are selective explanations, not a qualified translation or santhiya.
 *
 * Lexical checks, not copied translation prose: Sant Sewa Singh's Nitnem
 * Saral Steek (Rampur Khera, printed pp. 60–62); Jaswant Singh Neki's
 * Basking in the Divine Presence (printed pp. 32–34); the Bhai Vir Singh
 * commentary presented by SikhTranslations; the Mahan Kosh entries for
 * ਰਾਗ, ਸੁਹਾਗ, ਅਜੂ and ਅਕਾਮ; and Narain Singh's Das Granthi Steek.
 * The companion 16–30 source-notes ledger records the URLs and differences.
 *
 * Preserve the frozen ਸਰਬ ਦਿਆਲੇ in 28.03: one commentary website displays
 * ਖ੍ਯਾਲੇ there. That website is a lexical aid, not our source-text authority.
 * The separate Chachari heading before 29 is discussed, never counted as
 * an extra explanation line. Unresolved readings remain visible below.
 */

export const jaap23to30Lines = [];
export const jaap23to30Deep = [];

function chhand(n, rows) {
  if (n < 23 || n > 30 || rows.length !== 4) throw new Error('Invalid Jaap 23–30 draft unit');
  const unitId = 'jaap' + String(n).padStart(3, '0');
  rows.forEach(([simpleEn, simplePa, nuance], index) => {
    if (!simpleEn || !simplePa || !nuance) throw new Error('Incomplete bilingual line: ' + unitId);
    jaap23to30Lines.push({
      bani: 'jaap',
      lineId: unitId + '.line' + String(index + 1).padStart(2, '0'),
      simpleEn, simplePa, nuance,
      meaningKind: 'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
      editorialStatus: 'DRAFT_AI_UNREVIEWED'
    });
  });
}

function deep(n, simpleEn, simplePa, study) {
  jaap23to30Deep.push({
    bani: 'jaap', unitId: 'jaap' + String(n).padStart(3, '0'),
    simpleEn, simplePa, study, editorialStatus: 'DRAFT_AI_UNREVIEWED'
  });
}

chhand(23, [
  ['I bow to You, the One before whom even death has no final power.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਮੌਤ ਦਾ ਵੀ ਅੰਤ ਤੇਰੇ ਵੱਸ ਹੈ।',
   'ਕਾਲ ਕਾਲੇ intensifies the language of death and time: even their power is subject to the Divine. It praises the One addressed; it does not promise bodily immortality to a reader.'],
  ['I bow to You, whose nature is compassionate and merciful.',
   'ਹੇ ਦਇਆਲ ਪ੍ਰਭੂ, ਤੇਰੀ ਮਿਹਰ ਅਤੇ ਰਹਿਮ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਦਿਆਲੇ brings compassion immediately beside the strong death imagery. The two descriptions address the same One, so power should be read together with mercy.'],
  ['I bow to You, whose reality no description can fully contain.',
   'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਵਰਣਨ ਤੇਰੇ ਸਰੂਪ ਨੂੰ ਪੂਰੀ ਤਰ੍ਹਾਂ ਨਹੀਂ ਬਿਆਨ ਕਰ ਸਕਦਾ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਅਬਰਨੇ is read here as beyond complete description, following the Rampur Khera and Neki readings. The Bhai Vir Singh commentary also gives the colourless reading: without a defining colour. The lexical choice remains open to review.'],
  ['I bow to You, the deathless One whose being does not perish.',
   'ਹੇ ਅਮਰ ਪ੍ਰਭੂ, ਤੇਰੀ ਹੋਂਦ ਨਾਸ ਨਹੀਂ ਹੁੰਦੀ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਅਮਰਨੇ names the deathless Divine. Read it with the opening ਕਾਲ ਕਾਲੇ, while keeping the difference between a Divine attribute and the mortal condition of human beings.']
]);

deep(23,
  'The stanza places sovereignty over death beside compassion. Its praise ends with the One beyond a complete description and beyond dying; strength and mercy remain together throughout the address.',
  'ਇਸ ਛੰਦ ਵਿੱਚ ਮੌਤ ਉੱਤੇ ਪ੍ਰਭੂ ਦੀ ਸਰਦਾਰੀ ਦੇ ਨਾਲ ਉਸ ਦੀ ਦਇਆ ਆਉਂਦੀ ਹੈ। ਅਖੀਰਲੀਆਂ ਤੁਕਾਂ ਉਸ ਦੇ ਬੇਅੰਤ ਵਰਣਨ ਅਤੇ ਅਮਰ ਹੋਂਦ ਵੱਲ ਧਿਆਨ ਲਿਆਉਂਦੀਆਂ ਹਨ। ਇੱਕੋ ਪ੍ਰਭੂ ਦੀ ਸਮਰੱਥਾ ਅਤੇ ਮਿਹਰ ਨੂੰ ਇਕੱਠਿਆਂ ਯਾਦ ਕੀਤਾ ਗਿਆ ਹੈ।',
  {
    focus: 'Hear compassion within the praise of a power greater than death.',
    closeReading: 'The first and fourth lines form a frame: death is named at the start, and deathlessness at the close. Inside that frame, ਦਿਆਲੇ prevents the strong opening from becoming a portrait of power alone. ਅਬਰਨੇ also checks the reader’s confidence that a few descriptions could contain the One being praised. A useful reading practice is to pause after each epithet, then join the four again. Each salutation adds a quality; none should erase the others.',
    words: [
      ['ਕਾਲ ਕਾਲੇ', 'the One sovereign even over death and time'],
      ['ਦਿਆਲੇ', 'compassionate; merciful'],
      ['ਅਬਰਨੇ', 'beyond description here; also read as without a defining colour'],
      ['ਅਮਰਨੇ', 'deathless']
    ],
    care: 'These are devotional descriptions of the Divine. They offer no guarantee that illness, loss or physical death will spare a person who recites them. The two attested senses of ਅਬਰਨੇ remain an editorial question.',
    reflection: 'When you imagine strength, how much room do you leave for tenderness and mercy?',
    teachBack: 'Show how the opening and closing lines frame the stanza, then explain what ਦਿਆਲੇ adds inside that frame.'
  }
);

chhand(24, [
  ['I bow to You, the ageless One whom growing old cannot diminish.',
   'ਹੇ ਪ੍ਰਭੂ, ਬੁਢਾਪਾ ਤੇਰੀ ਹੋਂਦ ਨੂੰ ਘਟਾ ਨਹੀਂ ਸਕਦਾ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਜਰਾਰੰ is provisionally read as beyond aging, supported by Neki and Narain Singh. Sant Sewa Singh’s Rampur Khera steek instead reads it as mighty or powerful. The draft preserves that alternative rather than claiming one settled derivation.'],
  ['I bow to You, the Creator through whom things come into being.',
   'ਹੇ ਸਭ ਕੁਝ ਰਚਣ ਵਾਲੇ ਕਰਤਾਰ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਕ੍ਰਿਤਾਰੰ is read as Creator here, as in Narain Singh, Neki and the Bhai Vir Singh commentary. The Rampur Khera steek reads it as the One who cuts karmic bonds. These are distinct readings; this draft does not adjudicate their derivation.'],
  ['I bow to You, through whose power the world’s many activities unfold.',
   'ਹੇ ਪ੍ਰਭੂ, ਜਗਤ ਦੇ ਸਾਰੇ ਕਾਰ-ਵਿਹਾਰ ਤੇਰੀ ਸੱਤਾ ਨਾਲ ਚੱਲਦੇ ਹਨ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਸਰਬ ਧੰਧੇ concerns all the world’s activities and engagements. The next line is necessary to the sense: involvement in their unfolding is placed beside freedom from their bonds.'],
  ['I bow to You, who remain free from the bonds of all those activities.',
   'ਹੇ ਪ੍ਰਭੂ, ਇਨ੍ਹਾਂ ਸਾਰੇ ਕਾਰ-ਵਿਹਾਰਾਂ ਦੇ ਬੰਧਨ ਤੈਨੂੰ ਨਹੀਂ ਬੰਨ੍ਹਦੇ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਅਬੰਧੇ supplies the unbound quality. The frozen source joins ਨਮੋਸਤ; the draft does not silently change its spacing or treat an alternative parsing as a corrected scripture text.']
]);

deep(24,
  'The working reading praises the ageless Creator, present in the unfolding of every activity yet free from its bonds. The last two lines hold action and freedom together; the first two epithets retain recorded alternatives.',
  'ਇਸ ਕਾਰਜਕਾਰੀ ਅਰਥ ਵਿੱਚ ਬੁਢਾਪੇ ਤੋਂ ਰਹਿਤ ਕਰਤਾਰ ਨੂੰ ਨਮਸਕਾਰ ਹੈ। ਜਗਤ ਦੇ ਕਾਰ-ਵਿਹਾਰ ਉਸ ਦੀ ਸੱਤਾ ਨਾਲ ਚੱਲਦੇ ਹਨ, ਪਰ ਉਹ ਆਪ ਉਨ੍ਹਾਂ ਦੇ ਬੰਧਨਾਂ ਵਿੱਚ ਨਹੀਂ ਬੱਝਦਾ। ਪਹਿਲੇ ਦੋ ਵਿਸ਼ੇਸ਼ਣਾਂ ਦੇ ਹੋਰ ਟੀਕਾਕਾਰੀ ਅਰਥ ਵੀ ਸਮੀਖਿਆ ਲਈ ਸੰਭਾਲੇ ਗਏ ਹਨ।',
  {
    focus: 'Read action and freedom from bondage together, while noticing where lexical readings differ.',
    closeReading: 'The clearest structural turn comes between ਸਰਬ ਧੰਧੇ and ਅਬੰਧੇ. The stanza first directs attention across the many engagements of the world and then denies that those engagements bind the One addressed. That contrast remains useful whichever documented reading of the first pair is preferred. Our main explanation uses agelessness and creative agency; the alternatives are might and release from karmic bonds. Holding those options honestly keeps a short devotional explanation from pretending to settle a scholarly question.',
    words: [
      ['ਜਰਾਰੰ', 'ageless here; alternatively mighty'],
      ['ਕ੍ਰਿਤਾਰੰ', 'Creator here; alternatively cutter of karmic bonds'],
      ['ਸਰਬ ਧੰਧੇ', 'all worldly activities and engagements'],
      ['ਅਬੰਧੇ', 'unbound; free of bonds']
    ],
    care: 'Freedom from bondage is a Divine attribute in this address, not permission to evade responsibility. The ageless/mighty and Creator/karmic-liberator readings require qualified linguistic review; neither alternative is a change to the original line.',
    reflection: 'Can you attend carefully to a task without making its outcome the whole measure of your worth?',
    teachBack: 'Explain the relationship between ਸਰਬ ਧੰਧੇ and ਅਬੰਧੇ, and name one lexical question that this draft leaves open.'
  }
);

chhand(25, [
  ['I bow to You, who are not bound by the limits of family or kinship.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਾਕ-ਸੰਬੰਧਾਂ ਦੀਆਂ ਹੱਦਾਂ ਵਿੱਚ ਨਹੀਂ ਬੱਝਦਾ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਨ੍ਰਿਸਾਕੇ negates limiting kinship ties. The following merciful and generous epithets rule out reading this simply as coldness or indifference to others.'],
  ['I bow to You, who are free from fear of any other power.',
   'ਹੇ ਨਿਰਭਉ ਪ੍ਰਭੂ, ਤੂੰ ਕਿਸੇ ਹੋਰ ਦੀ ਤਾਕਤ ਤੋਂ ਨਹੀਂ ਡਰਦਾ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਨ੍ਰਿਬਾਕੇ is read as fearless, with ਬਾਕ carrying the sense of fear. It is a different word from ਨ੍ਰਿਬਾਮੇ in Chhand 18; their similar sounds do not make their meanings interchangeable.'],
  ['I bow to You, the merciful One who responds with compassion.',
   'ਹੇ ਰਹਿਮ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਦਇਆ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਰਹੀਮੇ carries the quality of mercy. Keep its sense distinct but connected to the generosity named by ਕਰੀਮੇ in the next line.'],
  ['I bow to You, the generous One, abundant in giving and grace.',
   'ਹੇ ਉਦਾਰ ਦਾਤਾਰ ਪ੍ਰਭੂ, ਤੇਰੀ ਬਖ਼ਸ਼ਿਸ਼ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਕਰੀਮੇ is read here through generosity and gracious giving. The praise does not specify a particular material gift or make Divine generosity a transaction.']
]);

deep(25,
  'The One is free from limiting kinship and fear, yet full of mercy and generosity. The movement of the stanza joins independence with care, so freedom does not become emotional distance.',
  'ਪ੍ਰਭੂ ਸਾਕ-ਸੰਬੰਧਾਂ ਦੀਆਂ ਹੱਦਾਂ ਅਤੇ ਡਰ ਤੋਂ ਰਹਿਤ ਹੈ, ਪਰ ਉਸੇ ਨੂੰ ਰਹਿਮ ਅਤੇ ਬਖ਼ਸ਼ਿਸ਼ ਵਾਲਾ ਵੀ ਕਿਹਾ ਗਿਆ ਹੈ। ਛੰਦ ਆਜ਼ਾਦੀ ਦੇ ਨਾਲ ਦਇਆ ਨੂੰ ਜੋੜਦਾ ਹੈ; ਨਿਰਲੇਪਤਾ ਦਾ ਭਾਵ ਬੇਪਰਵਾਹੀ ਨਹੀਂ ਬਣਦਾ।',
  {
    focus: 'Notice how the stanza joins freedom from constraint with a generous relationship to others.',
    closeReading: 'The first pair removes two familiar constraints: the claims of a particular kin group and the pressure of fear. The second pair speaks positively of mercy and generosity. Read in sequence, these qualities keep the first pair from sounding like withdrawal from care. ਨ੍ਰਿਸਾਕੇ and ਨ੍ਰਿਬਾਕੇ share a sound pattern, while ਰਹੀਮੇ and ਕਰੀਮੇ answer with another. Those audible pairs support memory, but each word still contributes its own meaning to the praise.',
    words: [
      ['ਨ੍ਰਿਸਾਕੇ', 'free from limiting kinship ties'],
      ['ਨ੍ਰਿਬਾਕੇ', 'fearless'],
      ['ਰਹੀਮੇ', 'merciful'],
      ['ਕਰੀਮੇ', 'generous; gracious in giving']
    ],
    care: 'The stanza does not ask people to abandon family or shame those who feel fear. Its address is to the Divine. A personal reflection about care without favouritism is an application, not a literal translation of ਨ੍ਰਿਸਾਕੇ.',
    reflection: 'Where could your kindness extend beyond the people you already count as your own?',
    teachBack: 'Explain why the second pair matters when interpreting the first pair, using one word from each pair.'
  }
);

chhand(26, [
  ['I bow to You, whose being has no end or enclosing boundary.',
   'ਹੇ ਬੇਅੰਤ ਪ੍ਰਭੂ, ਤੇਰੀ ਹੋਂਦ ਦਾ ਕੋਈ ਅੰਤ ਜਾਂ ਘੇਰਾ ਨਹੀਂ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਅਨੰਤੇ praises endlessness. This is a devotional recognition of the limits of measurement, not a count or a physical size.'],
  ['I bow to You, whose greatness surpasses every comparison.',
   'ਹੇ ਸਭ ਤੋਂ ਮਹਾਨ ਪ੍ਰਭੂ, ਤੇਰੀ ਵਡਿਆਈ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਮਹੰਤੇ expresses supreme greatness here. It is not being used as the later institutional title for the head of a religious establishment.'],
  ['I bow to You, praised as love itself.',
   'ਹੇ ਪ੍ਰੇਮ-ਸਰੂਪ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਰਾਗੇ is read in the sense of love or affection, supported by the commentaries and the Mahan Kosh ਰਾਗ entry. The familiar musical sense of raag should not automatically replace that contextual reading.'],
  ['I bow to You, praised as the fullness of blessedness and auspiciousness.',
   'ਹੇ ਸੁਹਾਗ-ਭਾਗ ਅਤੇ ਮੰਗਲ ਦੇ ਪੂਰਨ ਸਰੂਪ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਸੁਹਾਗੇ is provisionally read through blessed fortune or auspiciousness. Other explanations bring out glory or the beloved/spouse relationship. Such imagery does not rank people by marriage, gender or a spouse’s survival.']
]);

deep(26,
  'Limitless greatness is followed by the language of love and blessedness. The stanza lets closeness and wonder coexist: the One beyond every measure is also addressed through qualities that touch the heart.',
  'ਬੇਅੰਤਤਾ ਅਤੇ ਮਹਾਨਤਾ ਤੋਂ ਬਾਅਦ ਛੰਦ ਪ੍ਰੇਮ ਅਤੇ ਸੁਹਾਗ-ਭਾਗ ਦੀ ਬੋਲੀ ਲਿਆਉਂਦਾ ਹੈ। ਪ੍ਰਭੂ ਹਰ ਮਾਪ ਤੋਂ ਪਰੇ ਹੈ, ਫਿਰ ਵੀ ਉਸ ਨੂੰ ਦਿਲ ਨਾਲ ਜੁੜੇ ਗੁਣਾਂ ਰਾਹੀਂ ਯਾਦ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਅਚਰਜ ਅਤੇ ਨੇੜਤਾ ਇਕੱਠੇ ਰਹਿੰਦੇ ਹਨ।',
  {
    focus: 'Let the movement from greatness to love shape the reading of the whole stanza.',
    closeReading: 'ਅਨੰਤੇ and ਮਹੰਤੇ open the address toward what exceeds a reader’s scale. ਰਾਗੇ then changes the emphasis: greatness is also spoken of through love. ਸੁਹਾਗੇ follows with a word whose field includes blessed fortune and relational happiness. This draft chooses blessedness as its main sense and keeps the other readings visible. The sequence is worth hearing as a whole: wonder at the immeasurable does not prevent an intimate, affectionate address to the same One.',
    words: [
      ['ਅਨੰਤੇ', 'without end'],
      ['ਮਹੰਤੇ', 'supremely great'],
      ['ਰਾਗੇ', 'love; loving affection in this reading'],
      ['ਸੁਹਾਗੇ', 'blessedness or auspiciousness here; relational readings also occur']
    ],
    care: 'The use of ਰਾਗੇ here is not a specification of musical raag. ਸੁਹਾਗੇ has several attested explanatory senses; its relationship imagery must not become a judgment about the spiritual worth of unmarried or widowed people.',
    reflection: 'Does thinking of the Divine as immeasurably great make loving address easier or harder for you?',
    teachBack: 'Describe the shift between the first two and last two epithets, and explain the working sense chosen for ਰਾਗੇ.'
  }
);

chhand(27, [
  ['I bow to You, who bring all created forms to their end.',
   'ਹੇ ਪ੍ਰਭੂ, ਸਾਰੇ ਸਿਰਜੇ ਹੋਏ ਰੂਪਾਂ ਦਾ ਅੰਤ ਤੇਰੇ ਵੱਸ ਹੈ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਸੋਖੰ carries drying up, absorbing or dissolving, read here as bringing forms to an end. It must not be silently read as ਸੁਖ, happiness. The sustaining ਪੋਖੰ follows immediately.'],
  ['I bow to You, who nourish and sustain all.',
   'ਹੇ ਸਭ ਦੀ ਪਾਲਣਾ ਅਤੇ ਪੋਸ਼ਣਾ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਪੋਖੰ contributes nourishment and maintenance. It answers the dissolving sense of ਸੋਖੰ; the rhyme joins contrasting activities rather than giving the two words the same meaning.'],
  ['I bow to You, the Creator of all that exists.',
   'ਹੇ ਸਾਰੇ ਜਗਤ ਦੇ ਸਿਰਜਣਹਾਰ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਕਰਤਾ is the creative agent. With ਸਰਬ, the praise gives this action universal scope, rather than restricting it to one community or place.'],
  ['I bow to You, through whose power all created forms are dissolved.',
   'ਹੇ ਪ੍ਰਭੂ, ਸਾਰੇ ਸਿਰਜੇ ਰੂਪ ਤੇਰੀ ਸੱਤਾ ਨਾਲ ਮਿਟ ਜਾਂਦੇ ਹਨ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਹਰਤਾ has the sense of removing or bringing to an end, paired here with ਕਰਤਾ. It is not an instruction for a reader to destroy anything.']
]);

deep(27,
  'Four universal actions are placed together: dissolving, nourishing, creating and bringing to an end. Their shared address recognises the One throughout the life of creation, including both its growth and its passing.',
  'ਚਾਰਾਂ ਤੁਕਾਂ ਵਿੱਚ ਸਭ ਨੂੰ ਮਿਟਾਉਣ, ਪਾਲਣ, ਸਿਰਜਣ ਅਤੇ ਅੰਤ ਤਕ ਲਿਆਉਣ ਦੀ ਸੱਤਾ ਇੱਕੋ ਪ੍ਰਭੂ ਨਾਲ ਜੋੜੀ ਹੈ। ਜਗਤ ਦੇ ਵਧਣ ਅਤੇ ਮੁੱਕਣ ਦੋਹਾਂ ਵਿੱਚ ਉਸ ਇੱਕ ਨੂੰ ਯਾਦ ਕੀਤਾ ਜਾਂਦਾ ਹੈ। ਹਰ ਤੁਕ ਦਾ “ਸਰਬ” ਇਸ ਗੱਲ ਨੂੰ ਸਭ ਵੱਲ ਫੈਲਾਉਂਦਾ ਹੈ।',
  {
    focus: 'Follow the two contrasting pairs without dropping either nourishment or dissolution.',
    closeReading: 'Every line repeats ਨਮੋ ਸਰਬ, so the scope stays wide even as the action changes. The first pair moves from dissolution to nourishment; the second moves from creation to dissolution. This is not a chronological timetable. It is a compact arrangement of contrasting powers within one act of praise. Looking closely at ਸੋਖੰ and ਪੋਖੰ also shows why sound alone is not enough for interpretation: their closeness on the page and in recitation accompanies a meaningful difference.',
    words: [
      ['ਸਰਬ', 'all; the whole scope'],
      ['ਸੋਖੰ', 'drying up; absorbing or dissolving'],
      ['ਪੋਖੰ', 'nourishing; sustaining'],
      ['ਕਰਤਾ', 'creator'],
      ['ਹਰਤਾ', 'remover; one who brings to an end']
    ],
    care: 'The lines praise cosmic creation, preservation and dissolution. They do not license human cruelty or explain a particular person’s suffering as deserved. No date or mechanism of the world’s end is stated here.',
    reflection: 'What changes when you remember both the nourishment you receive and the passing nature of what you possess?',
    teachBack: 'Identify the two contrasting pairs and explain why ਸੋਖੰ cannot be substituted with the familiar word ਸੁਖ.'
  }
);

chhand(28, [
  ['I bow to You, praised as the Yogi above all yogis.',
   'ਹੇ ਜੋਗੀਆਂ ਦੇ ਪਰਮ ਜੋਗੀ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਜੋਗ ਜੋਗੇ intensifies the language of spiritual union and yogic detachment. It praises the Divine as supreme; it is not a lesson in physical yoga postures or a ranking of living teachers.'],
  ['I bow to You, praised as the enjoyer above all enjoyers.',
   'ਹੇ ਸਭ ਤੋਂ ਉੱਚੇ ਭੋਗੀ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਭੋਗ ਭੋਗੇ gives a supreme-enjoyer reading in the Rampur Khera steek; the Bhai Vir Singh commentary brings out fullness of bliss. Both belong beside ਜੋਗ ਜੋਗੇ, without making indulgence a command for the reader.'],
  ['I bow to You, whose compassion embraces all.',
   'ਹੇ ਸਭ ਉੱਤੇ ਦਇਆ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'The frozen line reads ਸਰਬ ਦਿਆਲੇ, so this explanation concerns compassion toward all. A different word displayed by one commentary website is not imported into the original or used as this line’s anchor.'],
  ['I bow to You, who sustain and care for all.',
   'ਹੇ ਸਭ ਦੀ ਪਾਲਣਾ ਅਤੇ ਸੰਭਾਲ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਸਰਬ ਪਾਲੇ joins universal care to the preceding universal compassion. It completes the stanza’s praise of the same One addressed through both ਜੋਗ and ਭੋਗ.']
]);

deep(28,
  'The supreme Yogi and supreme enjoyer are praised as the same One. The stanza then turns to mercy and care for all, bringing its striking opening pair into a shared devotional address.',
  'ਪਰਮ ਜੋਗੀ ਅਤੇ ਪਰਮ ਭੋਗੀ ਕਹਿ ਕੇ ਇੱਕੋ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਕੀਤੀ ਹੈ। ਫਿਰ ਉਸ ਦੀ ਸਭ ਉੱਤੇ ਦਇਆ ਅਤੇ ਸਭ ਦੀ ਪਾਲਣਾ ਯਾਦ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। ਜੋਗ ਅਤੇ ਭੋਗ ਦੇ ਵੱਖਰੇ ਪੱਖ ਇੱਕੋ ਪ੍ਰਭੂ ਦੀ ਉਸਤਤਿ ਵਿੱਚ ਇਕੱਠੇ ਆਉਂਦੇ ਹਨ।',
  {
    focus: 'Read the paired intensifications of ਜੋਗ and ਭੋਗ alongside universal compassion and care.',
    closeReading: 'The first two lines repeat their key word within each salutation: ਜੋਗ ਜੋਗੇ, then ਭੋਗ ਭੋਗੇ. A reader should notice that the praise does not choose one and reject the other. The same address holds the freedom associated with the Yogi and the fullness associated with enjoyment. The last pair changes to ਸਰਬ and extends compassion and nurture to all. This also closes the present Bhujang Prayat section before the new metrical heading introduces Chhand 29.',
    words: [
      ['ਜੋਗ ਜੋਗੇ', 'supreme in yogic union or detachment'],
      ['ਭੋਗ ਭੋਗੇ', 'supreme enjoyer; also explained through fullness of bliss'],
      ['ਸਰਬ ਦਿਆਲੇ', 'compassionate toward all'],
      ['ਸਰਬ ਪਾਲੇ', 'sustaining and caring for all']
    ],
    care: 'ਭੋਗ here is a Divine epithet, not permission for harmful excess, and ਜੋਗ does not prescribe a bodily technique. The original ਦਿਆਲੇ is retained even where a commentary site shows a different reading.',
    reflection: 'How might gratitude for ordinary joys coexist with freedom from the need to possess them?',
    teachBack: 'Explain how the first two lines hold a striking pair together, and show what the final two lines add.'
  }
);

chhand(29, [
  ['You are formless, not contained within a body or visible outline.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਕਿਸੇ ਦੇਹ ਜਾਂ ਦਿੱਸਦੇ ਆਕਾਰ ਵਿੱਚ ਸੀਮਤ ਨਹੀਂ ਹੈਂ।',
   'ਅਰੂਪ denies a defining material form. The preceding ਚਾਚਰੀ ਛੰਦ heading introduces a new metre, and the repeated ਹੈਂ now makes the devotional address directly “You are”.'],
  ['You are incomparable; no likeness can fully match You.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਬੇਮਿਸਾਲ ਹੈਂ; ਕੋਈ ਤੁਲਨਾ ਤੇਰਾ ਪੂਰਾ ਸਰੂਪ ਨਹੀਂ ਦੱਸ ਸਕਦੀ।',
   'ਅਨੂਪ concerns the absence of an adequate comparison. Commentary also expresses this through the limits of praise; the line does not say that devotion or speaking of the Divine is pointless.'],
  ['You are birthless; Your being does not begin with a birth.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਅਜਨਮਾ ਹੈਂ; ਤੇਰੀ ਹੋਂਦ ਕਿਸੇ ਜਨਮ ਤੋਂ ਸ਼ੁਰੂ ਨਹੀਂ ਹੁੰਦੀ।',
   'ਅਜੂ is read as birthless here, as in the Rampur Khera steek. Mahan Kosh records both birthless and unmoving, while the Bhai Vir Singh commentary favours the latter. These are retained as distinct readings of this exact word.'],
  ['You are not made from the material elements that compose created bodies.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਹੋਂਦ ਸਿਰਜੇ ਹੋਏ ਸਰੀਰਾਂ ਵਾਂਗ ਪਦਾਰਥ ਦੇ ਤੱਤਾਂ ਨਾਲ ਬਣੀ ਨਹੀਂ ਹੈ।',
   'ਅਭੂ is read here as not composed of the traditional five elements, following the Rampur Khera steek. The Bhai Vir Singh commentary gives an uncreated reading. Neither sense means nonexistent; the precise derivation remains for review.']
]);

deep(29,
  'A new Chachari metre opens with four brief addresses: formless, incomparable, birthless and beyond material composition. The repeated “You are” sustains a personal address even while each epithet denies a familiar limit.',
  'ਚਾਚਰੀ ਛੰਦ ਦੀ ਨਵੀਂ ਚਾਲ ਵਿੱਚ ਚਾਰ ਛੋਟੀਆਂ ਤੁਕਾਂ ਆਉਂਦੀਆਂ ਹਨ। ਪ੍ਰਭੂ ਨੂੰ ਰੂਪ ਦੀ ਹੱਦ, ਤੁਲਨਾ, ਜਨਮ ਅਤੇ ਪਦਾਰਥਕ ਬਣਤਰ ਤੋਂ ਪਰੇ ਕਿਹਾ ਹੈ। ਹਰ ਤੁਕ ਦਾ “ਹੈਂ” ਉਸੇ ਪ੍ਰਭੂ ਨਾਲ ਸਿੱਧੇ ਸੰਬੋਧਨ ਦਾ ਨਾਤਾ ਬਣਾਈ ਰੱਖਦਾ ਹੈ।',
  {
    focus: 'Notice the new metrical heading and the movement from repeated salutations to “You are”.',
    closeReading: 'The separate heading names ਚਾਚਰੀ ਛੰਦ and invokes ਤ੍ਵ ਪ੍ਰਸਾਦਿ, by Your grace. The four verse lines then share the compact pattern of an epithet followed by ਹੈਂ. This differs visibly from the preceding repeated ਨਮੋ, yet the devotional address continues. The repeated opening ਅ also invites close attention to each word rather than treating all four as interchangeable. Our working readings of ਅਜੂ and ਅਭੂ are birthlessness and freedom from material composition; documented alternatives remain in the line notes.',
    words: [
      ['ਅਰੂਪ', 'without a defining form'],
      ['ਅਨੂਪ', 'incomparable'],
      ['ਅਜੂ', 'birthless here; alternatively unmoving'],
      ['ਅਭੂ', 'not composed of material elements here; alternatively uncreated'],
      ['ਹੈਂ', 'are, in respectful direct address']
    ],
    care: 'The traditional five-element explanation is a philosophical vocabulary, not a claim about modern chemistry. The heading is separate from the four verse lines. This lesson identifies the metrical change but does not prescribe an authoritative recitation speed or pronunciation.',
    reflection: 'How does directly saying “You are” feel different from only listing qualities about someone?',
    teachBack: 'Identify the change in address and name the working meanings of ਅਜੂ and ਅਭੂ, including one recorded alternative.'
  }
);

chhand(30, [
  ['You cannot be fully captured by an account, calculation or written description.',
   'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਲੇਖਾ, ਗਿਣਤੀ ਜਾਂ ਲਿਖਿਆ ਵਰਣਨ ਤੈਨੂੰ ਪੂਰੀ ਤਰ੍ਹਾਂ ਨਹੀਂ ਸਮੇਟ ਸਕਦਾ।',
   'ਅਲੇਖ is read through the limits of accounting and description. Some commentary stresses freedom from a written destiny. The main point is not that writing or careful study has no value.'],
  ['You are not confined to a particular dress or outward religious appearance.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਕਿਸੇ ਇੱਕ ਪਹਿਰਾਵੇ ਜਾਂ ਬਾਹਰਲੇ ਧਾਰਮਿਕ ਭੇਖ ਵਿੱਚ ਸੀਮਤ ਨਹੀਂ ਹੈਂ।',
   'ਅਭੇਖ denies that an outward costume defines the Divine. It does not dismiss the significance of a person’s chosen discipline, religious dress or Sikh identity.'],
  ['No single name can contain the whole of who You are.',
   'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਇੱਕ ਨਾਮ ਤੇਰੀ ਪੂਰੀ ਹਸਤੀ ਨੂੰ ਆਪਣੇ ਵਿੱਚ ਨਹੀਂ ਸਮੇਟ ਸਕਦਾ।',
   'ਅਨਾਮ is explained here as beyond the reach of a fully defining name. The poem itself uses many names, so namelessness is not a prohibition on Naam, remembrance or devotional address.'],
  ['You are free from desire and are not driven by personal craving.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਨਿੱਜੀ ਚਾਹ ਜਾਂ ਲਾਲਸਾ ਦੇ ਵੱਸ ਨਹੀਂ ਹੈਂ।',
   'ਅਕਾਮ means without desire in this context; Mahan Kosh explicitly gives that sense for the Jaap Sahib usage. Do not confuse ਕਾਮ, desire, with an assertion that the Divine is useless or unable to act.']
]);

deep(30,
  'Description, dress, name and desire cannot confine the One addressed. These four brief lines invite humility about the labels people use, while continuing the personal, reverent address established in Chhand 29.',
  'ਲੇਖੇ, ਭੇਖ, ਨਾਮ ਅਤੇ ਕਾਮਨਾ ਦੀਆਂ ਹੱਦਾਂ ਪ੍ਰਭੂ ਨੂੰ ਨਹੀਂ ਬੰਨ੍ਹਦੀਆਂ। ਇਹ ਚਾਰ ਛੋਟੀਆਂ ਤੁਕਾਂ ਮਨੁੱਖੀ ਲੇਬਲਾਂ ਦੀ ਸੀਮਾ ਯਾਦ ਕਰਾਉਂਦੀਆਂ ਹਨ। ਨਾਲ ਹੀ ਪਿਛਲੇ ਛੰਦ ਵਾਂਗ ਪ੍ਰਭੂ ਨਾਲ ਸਿੱਧਾ ਅਤੇ ਆਦਰ ਭਰਿਆ ਸੰਬੋਧਨ ਜਾਰੀ ਰਹਿੰਦਾ ਹੈ।',
  {
    focus: 'Understand negation as a limit on human categories, while keeping the address alive.',
    closeReading: 'The four lines retain the same short ਹੈਂ pattern. ਅਲੇਖ concerns an account or description; ਅਭੇਖ an outward presentation; ਅਨਾਮ a defining name; ਅਕਾਮ desire. Distinguishing those four domains gives the repetition depth. The third line is especially striking inside a composition full of Divine names: using a name does not mean its speaker has exhausted the One it addresses. The final line then shifts from how something is represented to what might motivate it.',
    words: [
      ['ਅਲੇਖ', 'beyond a complete account or description'],
      ['ਅਭੇਖ', 'not defined by an outward garb'],
      ['ਅਨਾਮ', 'beyond a fully defining name'],
      ['ਅਕਾਮ', 'free from desire or craving']
    ],
    care: 'These negations describe the Divine; they do not abolish human responsibilities, meaningful religious practice or the remembrance of Naam. Desirelessness here should not be turned into shame about ordinary human needs.',
    reflection: 'Which label do you most readily mistake for a complete understanding of someone or something?',
    teachBack: 'Give the four distinct limits named in this stanza and explain why ਅਨਾਮ does not make devotional naming meaningless.'
  }
);

if (jaap23to30Lines.length !== 32 || jaap23to30Deep.length !== 8) {
  throw new Error('Jaap 23–30 packet must contain exactly 32 lines and 8 Study units');
}
