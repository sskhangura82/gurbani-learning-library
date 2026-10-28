/* GLP-001 Jaap Sahib Chhands 61–67: original educational drafts.
 * Frozen Gurmukhi, source hashes and separate metrical headings are unchanged.
 * These are selective explanations, not approved translations or santhiya.
 * Sources, inspection methods and alternatives are documented separately in
 * jaap-chhands61-67-research.json. No qualified human review is claimed.
 */

export const jaap61to67Lines = [];
export const jaap61to67Deep = [];

function chhand(n, rows) {
  const expected = n === 61 ? 2 : n === 62 ? 5 : 4;
  if (n < 61 || n > 67 || rows.length !== expected) {
    throw new Error('Unexpected source-record count for Jaap Chhand ' + n);
  }
  const unitId = 'jaap' + String(n).padStart(3, '0');
  rows.forEach(([simpleEn, simplePa, nuance], index) => {
    if (!simpleEn || !simplePa || !nuance) {
      throw new Error('Missing bilingual draft or nuance for ' + unitId);
    }
    jaap61to67Lines.push({
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
  jaap61to67Deep.push({
    bani: 'jaap',
    unitId: 'jaap' + String(n).padStart(3, '0'),
    simpleEn,
    simplePa,
    study,
    editorialStatus: 'DRAFT_AI_UNREVIEWED',
    humanReviewed: false
  });
}

// 61 — Four opening qualities, followed by creation and indwelling.
chhand(61, [
  [
    'You cannot be cut or pierced; no name confines You and no craving governs You.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਾ ਕੱਟਿਆ ਜਾ ਸਕਦਾ ਹੈ ਨਾ ਵਿੰਨ੍ਹਿਆ; ਕੋਈ ਨਾਮ ਤੈਨੂੰ ਸੀਮਤ ਨਹੀਂ ਕਰਦਾ ਅਤੇ ਕੋਈ ਕਾਮਨਾ ਤੈਨੂੰ ਨਹੀਂ ਚਲਾਉਂਦੀ।',
    'The line holds four distinct titles: ਅਛੇਦੀ, uncut; ਅਭੇਦੀ, unpierced; ਅਨਾਮੰ, nameless; and ਅਕਾਮੰ, free from desire. The first pair uses images of physical penetration, while the second concerns naming and desire. The explanation of namelessness follows the earlier distinction between a devotional name and a description that could exhaust the One.'
  ],
  [
    'You bring all into being and dwell throughout all.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਭ ਨੂੰ ਪੈਦਾ ਕਰਨ ਵਾਲਾ ਹੈਂ ਅਤੇ ਸਭ ਵਿੱਚ ਵੱਸਦਾ ਹੈਂ।',
    'ਸਮਸਤੋ ਪਰਾਜੀ is provisionally read through bringing all into being, following Sant Sewa Singh and the Bhai Vir Singh-derived account. Neki instead reads overcoming every power. That is a substantive alternative, not an interchangeable gloss. ਸਮਸਤਸਤੁ ਧਾਮੰ adds dwelling throughout all; both parts of the line remain present in the main explanation.'
  ]
]);

deep(61,
  'The first line sets out four freedoms: from being cut, pierced, confined by a name or governed by desire. In the selected reading, the second turns toward creation and indwelling. The One beyond those limits is also the source of life and present throughout it; the conquest reading of the second line remains a documented alternative.',
  'ਪਹਿਲੀ ਤੁਕ ਚਾਰ ਗੱਲਾਂ ਦੱਸਦੀ ਹੈ: ਪ੍ਰਭੂ ਨਾ ਕੱਟਿਆ ਜਾ ਸਕਦਾ ਹੈ, ਨਾ ਵਿੰਨ੍ਹਿਆ, ਨਾ ਕਿਸੇ ਨਾਮ ਵਿੱਚ ਸੀਮਤ ਹੁੰਦਾ ਹੈ ਅਤੇ ਨਾ ਕਾਮਨਾ ਦੇ ਅਧੀਨ ਹੈ। ਚੁਣੇ ਅਰਥ ਅਨੁਸਾਰ ਦੂਜੀ ਤੁਕ ਰਚਨਾ ਅਤੇ ਸਭ ਵਿੱਚ ਨਿਵਾਸ ਵੱਲ ਮੁੜਦੀ ਹੈ। ਇਹਨਾਂ ਹੱਦਾਂ ਤੋਂ ਪਰੇ ਪ੍ਰਭੂ ਹੀ ਸਭ ਦਾ ਪੈਦਾ ਕਰਨ ਵਾਲਾ ਹੈ ਅਤੇ ਸਭ ਵਿੱਚ ਵੱਸਦਾ ਹੈ। ਸਭ ਉੱਤੇ ਜਿੱਤ ਵਾਲਾ ਵੱਖਰਾ ਅਰਥ ਵੀ ਨੋਟ ਵਿੱਚ ਸੰਭਾਲਿਆ ਹੈ।',
  {
    focus: 'Beyond limitation while giving existence and dwelling within it.',
    closeReading: 'The first line is compact but should not be reduced to one general statement of greatness. Cutting and piercing form one pair; naming and desire form another. Each asks us to notice a different limit that does not govern the One. The second line then repeats the scope of all in two connected phrases. Under the selected creation reading, the One gives existence and inhabits it. Under Neki’s conquest reading, sovereignty over every power takes the place of the first emphasis, while indwelling remains. The alternative changes the movement of the passage, so it deserves to stay visible. Neither reading makes the Divine a distant object described only by what it lacks.',
    words: [
      ['ਅਛੇਦੀ', 'Not cut or severed'],
      ['ਅਭੇਦੀ', 'Not pierced or penetrated in this reading'],
      ['ਅਕਾਮੰ', 'Free from desire or craving'],
      ['ਸਮਸਤੋ ਪਰਾਜੀ', 'Bringing all into being; conquest is a documented alternative'],
      ['ਧਾਮੰ', 'Dwelling or abode']
    ],
    care: 'Divine inviolability does not promise that a reader’s body cannot be injured. Freedom from craving is not contempt for ordinary human needs. The alternative conquest image does not instruct anyone to dominate others.',
    reflection: 'How can a familiar Divine name deepen my attention while leaving room for what I do not fully understand?',
    teachBack: 'Name the four opening qualities, then explain how the two readings of the second line change its emphasis.'
  }
);

// 62 — The invocation remains a line; Chachari is a separate metrical heading.
chhand(62, [
  [
    'I rely on Your strength.',
    'ਹੇ ਪ੍ਰਭੂ, ਮੈਨੂੰ ਤੇਰੀ ਹੀ ਸਮਰੱਥਾ ਦਾ ਆਸਰਾ ਹੈ।',
    'ਤੇਰਾ ਜੋਰੁ is a brief invocation accompanying the transition to Chachari metre. Its words acknowledge Your strength; the selected explanation draws out reliance on that strength, as in Sant Sewa Singh. Neki gives a by-Your-power emphasis, while the Bhai Vir Singh-derived account frames an appeal for help. The metre name is a separate heading.'
  ],
  [
    'You are present in the waters.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਜਲਾਂ ਵਿੱਚ ਵਿਆਪਕ ਹੈਂ।',
    'ਜਲੇ is read from ਜਲ, water, with ਹੈਂ directly addressing the One. The word does not mean burning in this context. Read it with the following land image: the pair extends attention across different settings without dividing Divine presence into separate beings.'
  ],
  [
    'You are present throughout the land.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਧਰਤੀ ਉੱਤੇ ਵਿਆਪਕ ਹੈਂ।',
    'ਥਲੇ is read through land or dry ground beside ਜਲੇ. The Punjabi commentary includes arid land in that scope. The pair is not a claim that the Divine resides only below something, nor a boundary between places where the One can and cannot be found.'
  ],
  [
    'You are free from fear of any other power.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਕਿਸੇ ਹੋਰ ਤਾਕਤ ਦਾ ਡਰ ਨਹੀਂ।',
    'ਅਭੀਤ retains the fearlessness sense already selected at Chhand 31, with the same main explanation. Sant Sewa Singh and Neki support that reading here. The Bhai Vir Singh-derived account instead stresses not causing fear; the two directions of fear should not be silently treated as identical.'
  ],
  [
    'Your full mystery cannot be fathomed.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰਾ ਪੂਰਾ ਭੇਦ ਨਹੀਂ ਪਾਇਆ ਜਾ ਸਕਦਾ।',
    'ਅਭੇ keeps the unfathomable-mystery reading used at Chhand 31. Sant Sewa Singh’s explanation and Neki’s rendering of this chhand support it. A fearlessness reading occurs in the Bhai Vir Singh-derived account. Keeping the selected sense distinct from the preceding ਅਭੀਤ helps preserve the final pair’s different emphases.'
  ]
]);

deep(62,
  'The invocation places reliance on Divine strength before four short statements of presence, fearlessness and unfathomable mystery. Water and land widen the field of attention. The One present in those familiar places remains beyond being fully comprehended or intimidated by another power.',
  'ਸ਼ੁਰੂ ਦੀ ਬੇਨਤੀ ਪ੍ਰਭੂ ਦੀ ਸਮਰੱਥਾ ਦਾ ਆਸਰਾ ਲੈਂਦੀ ਹੈ। ਇਸ ਤੋਂ ਬਾਅਦ ਚਾਰ ਛੋਟੀਆਂ ਤੁਕਾਂ ਉਸ ਦੀ ਵਿਆਪਕਤਾ, ਨਿਰਭਉਤਾ ਅਤੇ ਅਥਾਹ ਭੇਦ ਨੂੰ ਯਾਦ ਕਰਦੀਆਂ ਹਨ। ਜਲ ਅਤੇ ਧਰਤੀ ਦੇ ਰੂਪ ਧਿਆਨ ਦਾ ਘੇਰਾ ਵਧਾਉਂਦੇ ਹਨ। ਇਹਨਾਂ ਜਾਣੀਆਂ ਥਾਵਾਂ ਵਿੱਚ ਵੱਸਦੇ ਪ੍ਰਭੂ ਨੂੰ ਨਾ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸਮਝਿਆ ਜਾ ਸਕਦਾ ਹੈ ਅਤੇ ਨਾ ਕੋਈ ਹੋਰ ਤਾਕਤ ਡਰਾ ਸਕਦੀ ਹੈ।',
  {
    focus: 'Reliance on Divine strength within a widening field of presence.',
    closeReading: 'ਤੇਰਾ ਜੋਰੁ accompanies the move into Chachari rhythm as an acknowledgment of dependence. The next four lines are very short, each ending in ਹੈਂ, You are. First the address reaches across water and land. Then the final pair turns from location toward fearlessness and the limits of understanding. Presence is therefore not the same as having the Divine completely explained or under our control. Listen to how the repeated direct address sustains relationship across that change. A reader can recognise presence and rely on the One while remaining modest about comprehension. The selected difference between ਅਭੀਤ and ਅਭੇ is deliberate; their alternative readings are kept in the line notes.',
    words: [
      ['ਤੇਰਾ ਜੋਰੁ', 'Your strength; an invocation of reliance'],
      ['ਜਲੇ', 'In the waters'],
      ['ਥਲੇ', 'In or upon the land'],
      ['ਅਭੀਤ', 'Free from fear; selected reading'],
      ['ਅਭੇ', 'Beyond full comprehension; selected reading']
    ],
    care: 'Reliance on Divine strength is not a promise that every undertaking will succeed. Fearlessness names a Divine attribute here; it does not require a person to conceal fear or refuse help.',
    reflection: 'How might I bring the same attentive remembrance to an ordinary place that I bring to a place I already associate with prayer?',
    teachBack: 'Explain the role of ਤੇਰਾ ਜੋਰੁ, then distinguish the water/land pair from the final two descriptions.'
  }
);

// 63 — Lordship without confinement to birth, country or outward guise.
chhand(63, [
  [
    'You are the sovereign Lord of all.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਭ ਦਾ ਮਾਲਕ ਹੈਂ।',
    'ਪ੍ਰਭੂ is a title of lordship and sovereignty. After the preceding chhand’s address across water and land, this line states the relationship directly. It does not assign that supreme status to a human officeholder.'
  ],
  [
    'You are birthless; Your being does not begin with a birth.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਅਜਨਮਾ ਹੈਂ; ਤੇਰੀ ਹੋਂਦ ਕਿਸੇ ਜਨਮ ਤੋਂ ਸ਼ੁਰੂ ਨਹੀਂ ਹੁੰਦੀ।',
    'The exact ਅਜੂ ਹੈਂ phrase already appears at Chhand 29, whose main explanation is retained. Sant Sewa Singh supports freedom from birth here. Mahan Kosh also records motionlessness, the emphasis followed by Neki and the Bhai Vir Singh-derived account. Birthlessness and immutability are related theological descriptions, but they are not the same lexical claim.'
  ],
  [
    'No single place or country can contain You.',
    'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਇੱਕ ਥਾਂ ਜਾਂ ਦੇਸ਼ ਤੈਨੂੰ ਸੀਮਤ ਨਹੀਂ ਕਰ ਸਕਦਾ।',
    'ਅਦੇਸ removes confinement to a particular ਦੇਸ, place or country. Read beside presence in water and land, it does not mean the One is simply absent. The same theme will be expressed positively through ਸਰਬ ਦੇਸੇ, all lands, in Chhand 66.'
  ],
  [
    'No particular outward guise defines You.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਕਿਸੇ ਇੱਕ ਖ਼ਾਸ ਭੇਸ ਵਿੱਚ ਬੱਝਿਆ ਹੋਇਆ ਨਹੀਂ।',
    'ਅਭੇਸ concerns freedom from a defining ਭੇਸ, guise or attire. It does not single out a garment or a community’s appearance for rejection. The later ਸਰਬ ਭੇਸੇ, all guises, expands the relation to visible forms without making one appearance an exhaustive definition.'
  ]
]);

deep(63,
  'The One addressed as Lord is not confined to a birth, a particular country or an outward guise. These brief statements continue the direct relationship of “You are.” Freedom from a fixed location or appearance does not cancel the presence just affirmed in water and land.',
  'ਜਿਸ ਪ੍ਰਭੂ ਨੂੰ ਸਭ ਦਾ ਮਾਲਕ ਕਿਹਾ ਹੈ, ਉਹ ਕਿਸੇ ਜਨਮ, ਖ਼ਾਸ ਦੇਸ਼ ਜਾਂ ਬਾਹਰਲੇ ਭੇਸ ਦੀ ਹੱਦ ਵਿੱਚ ਨਹੀਂ। “ਹੈਂ” ਵਾਲੀਆਂ ਛੋਟੀਆਂ ਤੁਕਾਂ ਉਸ ਨਾਲ ਸਿੱਧਾ ਸੰਬੋਧਨ ਬਣਾਈ ਰੱਖਦੀਆਂ ਹਨ। ਕਿਸੇ ਨਿਸ਼ਚਿਤ ਥਾਂ ਜਾਂ ਦਿੱਖ ਵਿੱਚ ਬੱਝਿਆ ਨਾ ਹੋਣਾ ਜਲ ਅਤੇ ਧਰਤੀ ਵਿੱਚ ਪਹਿਲਾਂ ਕਹੀ ਉਸ ਦੀ ਵਿਆਪਕਤਾ ਨੂੰ ਮਿਟਾਉਂਦਾ ਨਹੀਂ।',
  {
    focus: 'A direct relationship without a claim to exclusive possession.',
    closeReading: 'The opening title is affirmative: You are Lord. The following descriptions remove limits that might otherwise turn that address into a confined picture. The selected ਅਜੂ reading concerns origin through birth; ਅਦੇਸ concerns location; ਅਭੇਸ concerns appearance. These are different questions, so hear each one before moving on. The repeated ਹੈਂ keeps the address personal even as a fixed picture is loosened. Read across the chhand boundary as well: presence in water and land has already been affirmed, and presence in all lands and guises will follow. Together, these phrases can deepen belonging without allowing one place or visible form to claim exclusive possession of the Divine.',
    words: [
      ['ਪ੍ਰਭੂ', 'Lord or sovereign master'],
      ['ਅਜੂ', 'Birthless here; motionless is a documented alternative'],
      ['ਅਦੇਸ', 'Not confined to a particular place or country'],
      ['ਅਭੇਸ', 'Not defined by a particular guise or attire']
    ],
    care: 'The absence of a fixed Divine birthplace, country or guise does not diminish human homes, cultural belonging or dignity. Birthless language does not make human birth or bodily life impure.',
    reflection: 'How can love for my own place remain open to recognising worth and presence elsewhere?',
    teachBack: 'Name the different limits addressed by ਅਜੂ, ਅਦੇਸ and ਅਭੇਸ, and connect the last two with the surrounding chhands.'
  }
);

// 64 — Depth and unhindered being, bliss, honour and the treasury image.
chhand(64, [
  [
    'Your depth cannot be fathomed, and nothing can obstruct You.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਥਾਹ ਨਹੀਂ ਪਾਈ ਜਾ ਸਕਦੀ ਅਤੇ ਕੋਈ ਰੁਕਾਵਟ ਤੈਨੂੰ ਰੋਕ ਨਹੀਂ ਸਕਦੀ।',
    'ਅਗਾਧੇ and ਅਬਾਧੇ are both explained. The first concerns depth beyond fathoming; the second is provisionally read as unhindered, following Neki. Sant Sewa Singh and the Bhai Vir Singh-derived account emphasise freedom from destruction for ਅਬਾਧੇ. That alternative should remain distinct from the selected obstruction-related sense.'
  ],
  [
    'Your very being is complete joy.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਹੋਂਦ ਪੂਰੇ ਆਨੰਦ ਦਾ ਸਰੂਪ ਹੈ।',
    'ਅਨੰਦੀ ਸਰੂਪੇ joins joy or bliss with the One’s very being. It is a connected description, not a claim that ਸਰੂਪ requires a physical body. Beside the opening pair, the verse moves from limits that do not apply to the One toward an affirmative quality of Divine presence.'
  ],
  [
    'I bow to You, worthy of honour throughout creation.',
    'ਹੇ ਸਾਰੇ ਜਗਤ ਵਿੱਚ ਸਤਿਕਾਰਯੋਗ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਨਮੋ ਸਰਬ ਮਾਨੇ repeats the line already encountered at Chhand 44, and its main explanation is unchanged. ਸਰਬ gives reverence a universal scope. The expression praises worthiness of honour without claiming that every person consciously holds the same beliefs.'
  ],
  [
    'You are the source and treasury of all abundance.',
    'ਹੇ ਪ੍ਰਭੂ, ਸਭ ਨਿਧੀਆਂ ਅਤੇ ਦਾਤਾਂ ਦਾ ਭੰਡਾਰ ਤੂੰ ਹੈਂ।',
    'ਸਮਸਤੀ ਨਿਧਾਨੇ returns to the treasury image from Chhand 44, with the same main explanation. The address continues even though this line does not repeat ਨਮੋ. Abundance is praised through its source; no particular wealth or reward is promised to the reader.'
  ]
]);

deep(64,
  'The chhand holds unfathomable depth and unhindered being beside bliss, universal reverence and the treasury of all abundance. The repeated honour and treasury lines return with new neighbours. Their familiar praise now follows an invitation to recognise fullness without claiming to measure or contain it.',
  'ਇਹ ਛੰਦ ਅਥਾਹ ਡੂੰਘਾਈ ਅਤੇ ਰੁਕਾਵਟ ਤੋਂ ਪਰੇ ਹੋਣ ਨੂੰ ਆਨੰਦ, ਸਾਰੇ ਜਗਤ ਦੇ ਸਤਿਕਾਰ ਅਤੇ ਸਭ ਦਾਤਾਂ ਦੇ ਭੰਡਾਰ ਨਾਲ ਜੋੜਦਾ ਹੈ। ਮਾਣ ਅਤੇ ਨਿਧੀਆਂ ਵਾਲੀਆਂ ਜਾਣੀਆਂ ਤੁਕਾਂ ਨਵੇਂ ਸੰਦਰਭ ਵਿੱਚ ਮੁੜ ਆਉਂਦੀਆਂ ਹਨ। ਇੱਥੇ ਉਹ ਉਸ ਪੂਰਨਤਾ ਦੀ ਸਿਫ਼ਤ ਬਣਦੀਆਂ ਹਨ ਜਿਸ ਨੂੰ ਪੂਰਾ ਮਾਪਣ ਜਾਂ ਆਪਣੇ ਕਾਬੂ ਵਿੱਚ ਲਿਆਉਣ ਦਾ ਦਾਅਵਾ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਦਾ।',
  {
    focus: 'Unfathomable fullness expressed through joy and generosity.',
    closeReading: 'A Bhujang Prayat heading introduces this chhand. Its first line carries two qualities, so pause between depth beyond fathoming and freedom from obstruction in the selected reading. The next line gives a positive description: bliss belongs to the One’s very being. The final pair then renews the honour and treasury language heard at Chhand 44. Repetition allows recognition, while the new setting changes what we notice around those familiar words. Here joy and inexhaustible depth stand immediately before reverence and abundance. A reader can respond to a gift with gratitude without assuming that possessing a gift means possessing its source. The destruction-related alternative for ਅਬਾਧੇ remains in the note.',
    words: [
      ['ਅਗਾਧੇ', 'Beyond fathoming or measuring in depth'],
      ['ਅਬਾਧੇ', 'Unhindered here; undestroyed is an alternative'],
      ['ਅਨੰਦੀ', 'Joyful or blissful in being'],
      ['ਨਿਧਾਨੇ', 'Treasury or source of abundance']
    ],
    care: 'Divine bliss does not demand constant human cheerfulness or make grief a failure of devotion. The treasury image expresses abundance without guaranteeing money, status or success.',
    reflection: 'How does gratitude change when I give attention to the source of a gift as well as the gift itself?',
    teachBack: 'Explain both words in the opening pair, then describe what the bliss line adds before the repeated closing salutations.'
  }
);

// 65 — No superior master; dissolving power that is itself unbroken.
chhand(65, [
  [
    'I bow to You, who have no master above You.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੇਰੇ ਉੱਪਰ ਕੋਈ ਹੋਰ ਮਾਲਕ ਨਹੀਂ।',
    'ਨ੍ਰਿਨਾਥੇ is selected as without a superior master, supported by Sant Sewa Singh, Neki and the Bhai Vir Singh-derived account. Mahan Kosh also lists a ruler-of-people sense for ਨ੍ਰਿਨਾਥ. The selected negative construction describes Divine independence, not the abandonment of a vulnerable person.'
  ],
  [
    'I bow to You, whose power brings creation to its end.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸ੍ਰਿਸ਼ਟੀ ਦਾ ਅੰਤ ਕਰਨ ਦੀ ਸਮਰੱਥਾ ਤੇਰੇ ਕੋਲ ਹੈ।',
    'ਪ੍ਰਮਾਥੇ returns to the dissolution title encountered in Chhands 46 and 49. Sant Sewa Singh and Neki support a destructive sense here; the Bhai Vir Singh-derived account again uses churning. The main explanation retains the selected dissolution sense without presenting the alternative as settled.'
  ],
  [
    'I bow to You, whom nothing can destroy.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਕੋਈ ਤਾਕਤ ਤੇਰਾ ਨਾਸ ਨਹੀਂ ਕਰ ਸਕਦੀ।',
    'ਅਗੰਜੇ concerns freedom from destruction in the selected Punjabi and Bhai Vir Singh-derived readings. Neki emphasises being unconquered. The placement after ਪ੍ਰਮਾਥੇ matters: the One associated with the ending of created things is not presented as another thing awaiting the same destruction.'
  ],
  [
    'I bow to You, who cannot be broken or divided apart.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੈਨੂੰ ਤੋੜਿਆ ਜਾਂ ਟੁਕੜਿਆਂ ਵਿੱਚ ਵੰਡਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।',
    'ਅਭੰਜੇ uses the image of not being broken. It complements ਅਗੰਜੇ while keeping its own emphasis on unbrokenness. The image does not require the One to be a physical object made from unusually strong material.'
  ]
]);

deep(65,
  'The One has no superior master, holds the power of dissolution and remains beyond destruction or breaking. The sequence distinguishes the ending of created forms from the being of the One addressed. Its repeated salutations keep power within the language of reverence.',
  'ਪ੍ਰਭੂ ਦੇ ਉੱਪਰ ਕੋਈ ਹੋਰ ਮਾਲਕ ਨਹੀਂ, ਸ੍ਰਿਸ਼ਟੀ ਦੇ ਅੰਤ ਦੀ ਸਮਰੱਥਾ ਉਸੇ ਦੀ ਹੈ ਅਤੇ ਉਹ ਆਪ ਨਾਸ ਜਾਂ ਟੁੱਟਣ ਤੋਂ ਪਰੇ ਹੈ। ਇਹ ਲੜੀ ਬਣੇ ਹੋਏ ਰੂਪਾਂ ਦੇ ਅੰਤ ਅਤੇ ਸੰਬੋਧਿਤ ਪ੍ਰਭੂ ਦੀ ਹੋਂਦ ਵਿੱਚ ਫ਼ਰਕ ਦਿਖਾਉਂਦੀ ਹੈ। ਮੁੜ-ਮੁੜ ਆਉਂਦੀ ਨਮਸਕਾਰ ਸਮਰੱਥਾ ਨੂੰ ਸਤਿਕਾਰ ਦੀ ਬੋਲੀ ਵਿੱਚ ਰੱਖਦੀ ਹੈ।',
  {
    focus: 'The dissolving power that is itself beyond breaking.',
    closeReading: 'Each line begins with ਨਮਸਤ੍ਵੰ, maintaining an explicit act of salutation. The first removes a superior master. The second names the power of dissolution in the selected reading. The final pair then refuses to place the One among the things that can be destroyed or broken. Attend to that turn from action to inviolability. If all four lines become only a vague claim of strength, the sequence loses its particular movement. There is also continuity with earlier chhands: ਪ੍ਰਮਾਥੇ returns with its documented churning alternative, and the final pair recalls the unbrokenness language already encountered. Repetition here helps deepen attention to a relationship among qualities rather than merely lengthening a list.',
    words: [
      ['ਨ੍ਰਿਨਾਥੇ', 'Having no master above the One; selected sense'],
      ['ਪ੍ਰਮਾਥੇ', 'Dissolving or destructive power; churning is an alternative'],
      ['ਅਗੰਜੇ', 'Not destroyed; unconquered is another emphasis'],
      ['ਅਭੰਜੇ', 'Not broken or fragmented']
    ],
    care: 'Praise of Divine power does not authorise human cruelty or domination. Being unbroken is a Divine description here, not a demand that people remain untouched by grief, injury or dependence on others.',
    reflection: 'Can reverence for strength help me act with steadiness while remaining gentle toward vulnerability?',
    teachBack: 'How does the relation between ਪ੍ਰਮਾਥੇ and the final two titles shape the chhand’s account of power?'
  }
);

// 66 — Beyond time and dependence, present in all lands and guises.
chhand(66, [
  [
    'A salutation to the Timeless One.',
    'ਅਕਾਲ ਨੂੰ ਨਮਸਕਾਰ।',
    'This is the same ਨਮਸਤ੍ਵੰ ਅਕਾਲੇ line heard at Chhand 2, so its main explanation is retained. ਅਕਾਲੇ reaches beyond time and death. Here the title leads into independence from nurture and presence throughout lands and guises.'
  ],
  [
    'I bow to You, who need no one else to nourish or sustain You.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੇਰੀ ਪਾਲਣਾ ਲਈ ਕਿਸੇ ਹੋਰ ਆਸਰੇ ਦੀ ਲੋੜ ਨਹੀਂ।',
    'ਅਪਾਲੇ is selected through freedom from needing another’s nurture, supported by the commentaries and Mahan Kosh. The dictionary also records a boundless sense, reflected in a Bhai Vir Singh-derived note. The chosen meaning concerns Divine independence, not a judgement against receiving care.'
  ],
  [
    'I bow to You, present throughout every land.',
    'ਹੇ ਹਰ ਦੇਸ਼ ਅਤੇ ਧਰਤੀ ਵਿੱਚ ਵਿਆਪਕ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਸਰਬ ਦੇਸੇ affirms presence across all lands. Read with ਅਦੇਸ in Chhand 63, it develops the distinction between having no exclusive country and being present everywhere. It does not assign the Divine to one nation or endorse every action of a state.'
  ],
  [
    'I bow to You, present through every form and guise.',
    'ਹੇ ਸਾਰੇ ਰੂਪਾਂ ਅਤੇ ਭੇਸਾਂ ਵਿੱਚ ਵਿਆਪਕ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਸਰਬ ਭੇਸੇ extends the address through all guises or appearances. Its relation to ਅਭੇਸ in Chhand 63 is deliberate: no particular appearance exhausts the One, while the range of appearances is not excluded from Divine presence.'
  ]
]);

deep(66,
  'The timeless One needs no external nurture and is present throughout all lands and guises. The last pair answers the earlier language of no fixed country or appearance with an all-embracing affirmation. Independence and presence are held together within the same praise.',
  'ਕਾਲ ਤੋਂ ਪਰੇ ਪ੍ਰਭੂ ਨੂੰ ਕਿਸੇ ਬਾਹਰਲੇ ਪਾਲਣਹਾਰ ਦੀ ਲੋੜ ਨਹੀਂ ਅਤੇ ਉਹ ਸਾਰੇ ਦੇਸ਼ਾਂ ਤੇ ਭੇਸਾਂ ਵਿੱਚ ਵਿਆਪਕ ਹੈ। ਆਖ਼ਰੀ ਜੋੜੀ ਪਹਿਲਾਂ ਕਹੀ ਕਿਸੇ ਖ਼ਾਸ ਦੇਸ਼ ਜਾਂ ਭੇਸ ਵਿੱਚ ਨਾ ਬੱਝਣ ਦੀ ਗੱਲ ਨੂੰ ਸਭ ਵਿੱਚ ਹਾਜ਼ਰੀ ਨਾਲ ਜੋੜਦੀ ਹੈ। ਇੱਕੋ ਸਿਫ਼ਤ ਵਿੱਚ ਸੁਤੰਤਰਤਾ ਅਤੇ ਵਿਆਪਕਤਾ ਦੋਹਾਂ ਨੂੰ ਯਾਦ ਕੀਤਾ ਹੈ।',
  {
    focus: 'Independent being with presence that excludes no land or guise.',
    closeReading: 'The opening pair concerns time and dependence on nurture. The closing pair turns toward the breadth of presence, repeating ਸਰਬ, all. This arrangement prevents independence from becoming a picture of absence or remoteness. Compare ਦੇਸ and ਭੇਸ here with the negative forms in Chhand 63. There, no particular place or guise could define the One; here, every land and guise enters the address. The two passages need not cancel each other. They distinguish exclusive confinement from pervasive presence. That distinction also matters for devotion across human differences: a familiar place or appearance may support attention without giving us grounds to dismiss everyone outside its boundaries.',
    words: [
      ['ਅਕਾਲੇ', 'Beyond time and death'],
      ['ਅਪਾਲੇ', 'Not dependent on another’s nurture; selected sense'],
      ['ਦੇਸੇ', 'Lands, countries or places'],
      ['ਭੇਸੇ', 'Guises, attire or appearances'],
      ['ਸਰਬ', 'All']
    ],
    care: 'Divine independence from nurture does not make ordinary care, food or support spiritually inferior. Presence across places and appearances does not erase the responsibility to judge harmful actions honestly.',
    reflection: 'What unfamiliar setting might I approach with greater attentiveness and respect?',
    teachBack: 'Explain how ਸਰਬ ਦੇਸੇ and ਸਰਬ ਭੇਸੇ can stand beside the earlier ਅਦੇਸ and ਅਭੇਸ.'
  }
);

// 67 — Sovereignty, creative making and the radiance of moons.
chhand(67, [
  [
    'I bow to You, the King above every king.',
    'ਹੇ ਸਾਰੇ ਰਾਜਿਆਂ ਤੋਂ ਉੱਚੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਰਾਜ ਰਾਜੇ intensifies the royal image by placing kingship beneath the One addressed. It continues the poem’s repeated-noun pattern of praise. The image concerns Divine sovereignty and does not turn an earthly ruler into its equal.'
  ],
  [
    'I bow to You, the Maker of all that is made.',
    'ਹੇ ਸਭ ਕੁਝ ਰਚਣ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਸਾਜ ਸਾਜੇ is read through making, forming and ordering creation, supported by the consulted commentaries. The context differs from the instrumental ਬਾਦ image earlier in the bani; a familiar modern use of ਸਾਜ for a musical instrument should not decide this phrase on its own.'
  ],
  [
    'I bow to You, the Shah above every shah.',
    'ਹੇ ਸ਼ਾਹਾਂ ਦੇ ਸ਼ਾਹ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਸ਼ਾਹ is a Persian royal title. The repeated phrase renews sovereignty in another part of the bani’s vocabulary. It is not a breathing instruction or a use of ਸਾਹ as breath; the established source form here is ਸ਼ਾਹ.'
  ],
  [
    'I bow to You, the light that makes every moon radiant.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਚੰਦ ਨੂੰ ਰੌਸ਼ਨ ਕਰਨ ਵਾਲੀ ਜੋਤ ਤੂੰ ਹੈਂ।',
    'ਮਾਹ is selected as moon, with an explicit Jaap citation in Mahan Kosh and support from the commentaries. Other uses of the word, including month, do not govern this phrase. The moon-of-moons image directs praise through radiance and beauty; the main explanation remains devotional rather than astronomical.'
  ]
]);

deep(67,
  'The chhand moves through kingship, creative making, the royal title Shah and the radiance of moons. Repeated words deepen each image without making the four images interchangeable. Authority and beauty are both directed toward the One, while creation’s making stands between the two royal expressions.',
  'ਇਹ ਛੰਦ ਰਾਜਸੀ ਪ੍ਰਭੂਤਾ, ਰਚਨਾ ਕਰਨ, ਸ਼ਾਹਾਂ ਦੇ ਸ਼ਾਹ ਅਤੇ ਚੰਦਾਂ ਦੇ ਪ੍ਰਕਾਸ਼ ਰਾਹੀਂ ਸਿਫ਼ਤ ਕਰਦਾ ਹੈ। ਦੁਹਰਾਏ ਸ਼ਬਦ ਹਰ ਉਪਮਾ ਨੂੰ ਗੂੜ੍ਹਾ ਕਰਦੇ ਹਨ, ਪਰ ਚਾਰੇ ਉਪਮਾਵਾਂ ਇੱਕੋ ਅਰਥ ਨਹੀਂ ਬਣ ਜਾਂਦੀਆਂ। ਅਧਿਕਾਰ ਅਤੇ ਸੁੰਦਰਤਾ ਦੋਵੇਂ ਇੱਕ ਪ੍ਰਭੂ ਵੱਲ ਲੈ ਜਾਂਦੇ ਹਨ; ਦੋ ਰਾਜਸੀ ਸੰਬੋਧਨਾਂ ਦੇ ਵਿਚਕਾਰ ਰਚਨਾ ਦੀ ਗੱਲ ਆਉਂਦੀ ਹੈ।',
  {
    focus: 'Sovereignty and beauty joined through the making of creation.',
    closeReading: 'Each line begins with ਨਮੋ and repeats a key word. The first and third lines share a royal field of meaning, while the second names making and the fourth turns toward lunar radiance. Notice that the repetition is a form of intensification, not permission to replace every title with the same general adjective. The shift from ਰਾਜ to ਸ਼ਾਹ also lets more than one vocabulary of sovereignty enter the praise. Then ਮਾਹ changes the image again, from a court or ruler toward light and beauty. A reader can attend to authority without overlooking creativity and radiance. The familiar things become occasions for reverence while remaining distinct images.',
    words: [
      ['ਰਾਜ', 'Rule or kingship'],
      ['ਸਾਜ', 'Making or forming in this phrase'],
      ['ਸ਼ਾਹ', 'Shah; a Persian title of sovereignty'],
      ['ਮਾਹ', 'Moon in this phrase']
    ],
    care: 'Royal language does not justify human authoritarianism or rank human dignity by status. The moon image is poetic praise, not a requirement to worship a celestial body or an account of physical astronomy.',
    reflection: 'How can attention to creativity and beauty change the way I understand power?',
    teachBack: 'Identify the two royal titles, the creative title and the lunar title, explaining why none should disappear into a generic statement of greatness.'
  }
);
