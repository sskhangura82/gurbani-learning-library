/* GLP-001 Jaap Sahib Chhands 16–22.
 * Original bilingual educational drafts, not approved translations or santhiya.
 * Every ID points to the unchanged, frozen nitnem/data/jaap.json source.
 *
 * Comparison references are recorded in the shared V10 source-notes ledger:
 * jaap-neki (printed pp. 29–31), jaap-rampurkhera (printed pp. 58–59),
 * and jaap-bvs-2-28. Short lexical comparisons inform the working choices;
 * the explanations, passage observations and learning questions are newly
 * written. Divergent senses are identified rather than silently harmonised.
 */

export const jaap16to22Lines = [];
export const jaap16to22Deep = [];

function chhand(n, rows) {
  if (n < 16 || n > 22 || rows.length !== 4) {
    throw new Error('Expected four source-bound lines for Jaap Chhand 16–22');
  }
  const unitId = 'jaap' + String(n).padStart(3, '0');
  rows.forEach(([simpleEn, simplePa, nuance], index) => {
    if (!simpleEn || !simplePa || !nuance) {
      throw new Error('Missing bilingual explanation or nuance for ' + unitId);
    }
    jaap16to22Lines.push({
      bani: 'jaap',
      lineId: unitId + '.line' + String(index + 1).padStart(2, '0'),
      simpleEn,
      simplePa,
      nuance,
      meaningKind: 'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
      editorialStatus: 'DRAFT_AI_UNREVIEWED'
    });
  });
}

function deep(n, simpleEn, simplePa, study) {
  jaap16to22Deep.push({
    bani: 'jaap',
    unitId: 'jaap' + String(n).padStart(3, '0'),
    simpleEn,
    simplePa,
    study,
    editorialStatus: 'DRAFT_AI_UNREVIEWED'
  });
}

// 16 — Beyond complete comprehension, present, sustaining, independent.
chhand(16, [
  [
    'I bow to You, beyond the full reach of thought and understanding.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸੋਚ ਅਤੇ ਸਮਝ ਦੀ ਪੂਰੀ ਪਕੜ ਤੋਂ ਪਰੇ ਹੈਂ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਅਗੰਮੇ is treated as not fully reachable. This limits the knower’s grasp; in the selected reading of the next title, the Divine is also present throughout existence. Unfathomability need not mean absence.'
  ],
  [
    'I bow to You, present throughout all existence.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਾਰੀ ਹੋਂਦ ਵਿੱਚ ਰਮਿਆ ਹੋਇਆ ਹੈਂ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਰੰਮੇ is read here as pervading, following Neki. Sant Seva Singh emphasises beauty, while the Bhai Vir Singh-derived account emphasises bliss. These are distinct interpretive possibilities; the main explanation selects one rather than claiming they are identical.'
  ],
  [
    'I bow to You, the sustaining support of the waters.',
    'ਜਲ ਨੂੰ ਆਸਰਾ ਦੇਣ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਜਲ is water. The support-reading follows the Bhai Vir Singh-derived account; Neki and Sant Seva Singh instead use an ocean-image. The compound is not read here through ਜਾਲ, a net. Its relation to ਨਿਰਾਸਰੇ gives the pair its teaching focus.'
  ],
  [
    'I bow to You, whose existence depends on no other support.',
    'ਉਸ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ ਜਿਸ ਦੀ ਹੋਂਦ ਕਿਸੇ ਹੋਰ ਦੇ ਆਸਰੇ ਨਹੀਂ।',
    'ਨਿਰਾਸਰੇ names freedom from dependence. After ਜਲਾਸਰੇ, it turns attention from what is supported to the One who needs no external support. Here the word does not mean dejected or hopeless.'
  ]
]);

deep(16,
  'The One is beyond our complete grasp yet present throughout existence, supporting the waters while depending on no other support.',
  'ਪ੍ਰਭੂ ਸਾਡੀ ਪੂਰੀ ਸਮਝ ਤੋਂ ਪਰੇ ਹੁੰਦਿਆਂ ਵੀ ਸਾਰੀ ਹੋਂਦ ਵਿੱਚ ਵਿਆਪਕ ਹੈ; ਉਹ ਜਲ ਦਾ ਆਸਰਾ ਹੈ, ਪਰ ਆਪ ਕਿਸੇ ਹੋਰ ਦੇ ਆਸਰੇ ਨਹੀਂ।',
  {
    focus: 'Presence and support without confinement or dependence.',
    closeReading: 'The first two salutations hold reach and presence together: our understanding cannot contain the One, yet the selected reading does not place the One outside existence. The final pair then turns to support. Water is named before the description of independence. Read the four lines as a movement of attention, from the limits of our knowing to what sustains life and finally to the One who needs no support. This sequence offers a way to contemplate dependence without reducing the Divine to another dependent thing.',
    words: [
      ['ਅਗੰਮੇ', 'Beyond complete reach or comprehension; working sense'],
      ['ਜਲਾਸਰੇ', 'Support of the waters; selected reading, with an ocean-image alternative'],
      ['ਨਿਰਾਸਰੇ', 'Dependent on no other support']
    ],
    care: 'The pervading and water-support readings are choices among documented alternatives. Keep them visible as working interpretations; the lesson does not prescribe isolation or refusing help in human life.',
    reflection: 'What sustains my daily life that I seldom pause to acknowledge?',
    teachBack: 'How do the final two titles place support beside independence?'
  }
);

// 17 — Caste, lineage and creed give way to wonder.
chhand(17, [
  [
    'I bow to You, beyond every division of caste.',
    'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਜਾਤ ਦੀ ਹਰ ਵੰਡ ਤੋਂ ਪਰੇ ਹੈਂ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਅਜਾਤੇ is read through caste here, following Neki and Sant Seva Singh and its pairing with ਅਪਾਤੇ. The Bhai Vir Singh-derived rendering instead takes it as unborn. The draft keeps that lexical alternative open.'
  ],
  [
    'I bow to You, not confined to any lineage or clan.',
    'ਕਿਸੇ ਗੋਤ ਜਾਂ ਖ਼ਾਨਦਾਨ ਦੀ ਹੱਦ ਵਿੱਚ ਨਾ ਬੱਝਣ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'The lineage reading connects ਅਪਾਤੇ with ਪਾਤਿ and the ਜਾਤਿ/ਪਾਤਿ pair in Chhand 1. Another consulted reading is not falling, or unfailing. Clan or lineage is the selected sense; the source word is not respelled to settle the difference.'
  ],
  [
    'I bow to You, whom no single creed can contain.',
    'ਉਸ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ ਜਿਸ ਨੂੰ ਕੋਈ ਇੱਕ ਮਜ਼ਹਬ ਆਪਣੀ ਹੱਦ ਵਿੱਚ ਨਹੀਂ ਬੰਨ੍ਹ ਸਕਦਾ।',
    'ਅਮਜਬੇ draws on ਮਜ਼ਹਬ, a religious way or creed, with a negative prefix. The title denies confinement of the Divine. It does not ask the reader to abandon faith or belittle another community.'
  ],
  [
    'I bow to You, the wondrous One.',
    'ਅਸਚਰਜ ਸਰੂਪ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਅਜਬੇ is affirmative wonder. After three titles that deny fixed classifications, the ending turns from what cannot contain the One toward reverent astonishment. The changed emphasis matters even within the repeated salutation.'
  ]
]);

deep(17,
  'Caste, lineage and creed cannot contain the One; the final salutation answers that freedom with wonder.',
  'ਜਾਤ, ਗੋਤ ਅਤੇ ਮਜ਼ਹਬ ਦੀਆਂ ਹੱਦਾਂ ਪ੍ਰਭੂ ਨੂੰ ਨਹੀਂ ਬੰਨ੍ਹ ਸਕਦੀਆਂ; ਅਖੀਰਲੀ ਨਮਸਕਾਰ ਉਸ ਦੇ ਅਸਚਰਜ ਸਰੂਪ ਵੱਲ ਮੁੜਦੀ ਹੈ।',
  {
    focus: 'Reverence that exceeds inherited labels.',
    closeReading: 'In the selected reading, the first three titles successively loosen the claim that caste, family descent or a religious label can define the Divine. The speaker continues to bow through all three: removing a limit does not remove devotion. The fourth title changes the movement. Instead of another negation, it names wonder. A student can notice how the passage opens a space for reverence after familiar classifications have proved too small, and can ask how inherited labels affect the way we regard other people.',
    words: [
      ['ਅਪਾਤੇ', 'Beyond clan or lineage; selected reading, with an unfailing alternative'],
      ['ਅਮਜਬੇ', 'Not confined by a creed'],
      ['ਅਜਬੇ', 'Wondrous; evoking awe']
    ],
    care: 'The caste and clan senses are selected readings of the opening pair. The passage does not make a person’s background shameful or give one community permission to claim exclusive possession of the Divine.',
    reflection: 'Which inherited label most quickly affects the way I listen to someone?',
    teachBack: 'What changes when the final title moves from negation to wonder?'
  }
);

// 18 — No fixed country, outward guise, abode or binding Maya.
chhand(18, [
  [
    'I bow in reverence to You, whom no country or place can enclose.',
    'ਦੇਸ ਜਾਂ ਥਾਂ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਪ੍ਰਭੂ ਨੂੰ ਮੇਰਾ ਨਮਸਕਾਰ ਹੈ।',
    'ਅਦੇਸੰ supplies the salutation while ਅਦੇਸੇ can describe freedom from locality. The Bhai Vir Singh-derived note also permits repeated salutation. The selected place-related reading fits the sequence continued by ਨ੍ਰਿਧਾਮੇ.'
  ],
  [
    'I bow to You, not restricted to any outward dress or disguise.',
    'ਕਿਸੇ ਇੱਕ ਭੇਖ ਜਾਂ ਬਾਹਰਲੀ ਦਿੱਖ ਵਿੱਚ ਨਾ ਬੱਝਣ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਅਭੇਸੇ returns to ਭੇਖ/ਭੇਸ, an outer guise. The description concerns the limits of assigning an appearance to the Divine. Religious clothing worn by people is a separate matter from this epithet.'
  ],
  [
    'I bow to You, beyond confinement in any dwelling.',
    'ਕਿਸੇ ਇੱਕ ਨਿਵਾਸ ਵਿੱਚ ਸੀਮਤ ਨਾ ਹੋਣ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਨ੍ਰਿਧਾਮੇ negates a fixed ਧਾਮ, abode. Read with the opening line, it extends the scale from country to dwelling. The emphasis is on the One’s freedom from a containing location.'
  ],
  [
    'I bow to You, untouched by the hold of Maya.',
    'ਮਾਇਆ ਦੇ ਬੰਧਨ ਤੋਂ ਨਿਰਲੇਪ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਨ੍ਰਿਬਾਮੇ is read here as freedom from Maya, following Sant Seva Singh. Neki reads it through the absence of a spouse; SikhTranslations also records freedom from enmity. The Maya sense is a selected interpretation, not a settled derivation.'
  ]
]);

deep(18,
  'No country, outward guise or dwelling encloses the One; the final title is read here as freedom from Maya’s binding hold.',
  'ਕੋਈ ਦੇਸ, ਭੇਖ ਜਾਂ ਨਿਵਾਸ ਪ੍ਰਭੂ ਨੂੰ ਸੀਮਤ ਨਹੀਂ ਕਰਦਾ; ਆਖ਼ਰੀ ਨਾਮ ਨੂੰ ਇੱਥੇ ਮਾਇਆ ਦੇ ਬੰਧਨ ਤੋਂ ਨਿਰਲੇਪ ਹੋਣ ਦੇ ਭਾਵ ਵਿੱਚ ਪੜ੍ਹਿਆ ਹੈ।',
  {
    focus: 'No address or appearance can contain the Divine.',
    closeReading: 'The sequence passes through country, guise and dwelling. These are familiar ways of locating and recognising a person, yet each fails to contain the One being addressed. The chosen final reading adds freedom from Maya’s hold. Notice that the poem still speaks directly and intimately to the One while refusing to assign a permanent address or costume. Chhand 22 will widen the picture with presence in all places; the two passages can be read together as freedom from confinement alongside universal presence.',
    words: [
      ['ਅਭੇਸੇ', 'Not confined to an outward guise'],
      ['ਨ੍ਰਿਧਾਮੇ', 'Without a fixed containing abode'],
      ['ਨ੍ਰਿਬਾਮੇ', 'Unaffected by Maya; selected reading among several']
    ],
    care: 'The last title has more than one interpretation. Treat Maya here as binding attachment, without turning its traditional personification into a judgement about women or marriage.',
    reflection: 'Where do I tend to assume that the Divine can be present only in familiar surroundings?',
    teachBack: 'Which three ways of locating or identifying someone does this chhand move beyond?'
  }
);

// 19 — The repeated sarab extends every title to all.
chhand(19, [
  [
    'I bow to You, who bring all created things to their end.',
    'ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਦਾ ਅੰਤ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਕਾਲੇ is read in its time, death and ending range, following Neki and Sant Seva Singh. The Bhai Vir Singh-derived account reads Chhand 19 as enduring through all times. The identical words recur in Chhand 20, line 3; this draft keeps their main explanation consistent.'
  ],
  [
    'I bow to You, whose compassion reaches all.',
    'ਸਭ ਉੱਤੇ ਦਇਆ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਸਰਬ gives compassion its universal reach. Coming after ਕਾਲੇ, ਦਿਆਲੇ keeps the stanza’s language of ending beside mercy. The repeated address does not divide these titles between rival powers.'
  ],
  [
    'I bow to You, present in every form.',
    'ਸਭ ਰੂਪਾਂ ਵਿੱਚ ਵਿਆਪਕ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਸਰਬ ਰੂਪੇ is an affirmative title after earlier descriptions of the formless One. This working paraphrase speaks of presence throughout forms, without making any one visible image an exhaustive description.'
  ],
  [
    'I bow to You, sovereign over all.',
    'ਸਭ ਦੇ ਮਾਲਕ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਭੂਪੇ brings the image of a ruler; ਸਰਬ widens it to all. Read with universal compassion in line 2, the title describes sovereignty without reducing the One to a particular earthly monarch.'
  ]
]);

deep(19,
  'The chhand addresses the One through ending, compassion, every form and universal sovereignty, repeating “all” in each salutation.',
  'ਇਹ ਛੰਦ ਪ੍ਰਭੂ ਨੂੰ ਸਭ ਦੇ ਅੰਤ, ਸਭ ਉੱਤੇ ਦਇਆ, ਸਭ ਰੂਪਾਂ ਵਿੱਚ ਵਿਆਪਕਤਾ ਅਤੇ ਸਭ ਦੀ ਮਾਲਕੀ ਰਾਹੀਂ ਯਾਦ ਕਰਦਾ ਹੈ; ਹਰ ਨਮਸਕਾਰ ਵਿੱਚ “ਸਰਬ” ਆਉਂਦਾ ਹੈ।',
  {
    focus: 'Universal power held together with universal compassion.',
    closeReading: 'Listen for ਸਰਬ before each changing title. Ending, mercy, form and sovereignty are all placed within that repeated scope. The second line is especially significant beside the first: the One addressed as the end of created things is also addressed as compassionate toward all. The final pair then takes the gaze across forms and their ruler. Reading the whole chhand keeps any single attribute from becoming the entire portrait and invites a reverence large enough to hold power and mercy together.',
    words: [
      ['ਸਰਬ', 'All; the repeated scope of each title'],
      ['ਕਾਲੇ', 'Time, death or ending; the ending sense is selected here'],
      ['ਦਿਆਲੇ', 'Compassionate; merciful']
    ],
    care: 'The time-related title has more than one reading. The verse does not identify a particular loss as punishment or give the reader knowledge of why another person suffers.',
    reflection: 'How might remembering compassion change what I admire in power?',
    teachBack: 'What does the repeated ਸਰਬ contribute to all four titles?'
  }
);

// 20 — Dissolution/establishment and ending/nurture are paired.
chhand(20, [
  [
    'I bow to You, who dissolve all that has been formed.',
    'ਸਾਰੀ ਬਣੀ ਹੋਈ ਰਚਨਾ ਨੂੰ ਲੀਨ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਖਾਪੇ has the sense of bringing to an end or consuming. Its immediate pairing with ਥਾਪੇ makes dissolution and establishment complementary titles. Dissolving is a devotional working rendering here, not a proposed physical mechanism.'
  ],
  [
    'I bow to You, who bring all into being and establish it.',
    'ਸਭ ਨੂੰ ਹੋਂਦ ਵਿੱਚ ਲਿਆ ਕੇ ਟਿਕਾਉਣ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਥਾਪੇ concerns setting up or establishing. The paraphrase keeps that action visible: the One is addressed in relation to things coming to stand in existence, alongside their passing away in the preceding line.'
  ],
  [
    'I bow to You, who bring all created things to their end.',
    'ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਦਾ ਅੰਤ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'The source repeats Chhand 19, line 1 exactly. Here ਕਾਲੇ stands beside ਪਾਲੇ, placing ending alongside nurture. The death or ending sense is selected consistently; an all-times reading is retained in the source comparison notes.'
  ],
  [
    'I bow to You, who nourish and sustain all.',
    'ਸਭ ਦੀ ਪਾਲਣਾ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਪਾਲੇ denotes caring for or sustaining. It closes the sequence on nurture, after the preceding titles have included both establishment and ending. The repeated ਸਰਬ extends this care to all.'
  ]
]);

deep(20,
  'Both becoming and passing away lie under the One’s power, and the chhand closes by remembering care for all.',
  'ਹੋਂਦ ਵਿੱਚ ਆਉਣਾ ਅਤੇ ਲੀਨ ਹੋਣਾ ਇੱਕੋ ਪ੍ਰਭੂ ਦੇ ਅਧੀਨ ਹਨ; ਛੰਦ ਅਖੀਰ ਵਿੱਚ ਸਭ ਦੀ ਪਾਲਣਾ ਨੂੰ ਯਾਦ ਕਰਦਾ ਹੈ।',
  {
    focus: 'Making, ending and sustaining in paired titles.',
    closeReading: 'Notice the paired sounds ਖਾਪੇ/ਥਾਪੇ and ਕਾਲੇ/ਪਾਲੇ. The first pair brings dissolution beside establishment; the second places ending beside nurture. Every line addresses the same One, and every line repeats ਸਰਬ. The prayer therefore does not reserve Divine presence for beginnings alone or care for one favoured group. Its last word leaves the learner with sustenance after acknowledging change. A useful reflection is to hold gratitude for what is given together with humility about what we cannot make permanent.',
    words: [
      ['ਖਾਪੇ', 'Bringing to an end; dissolving'],
      ['ਥਾਪੇ', 'Establishing; bringing into being'],
      ['ਪਾਲੇ', 'Nurturing or sustaining']
    ],
    care: 'Dissolution is praised here as a Divine attribute. The lines give no command for people to destroy life or neglect their own responsibilities of care.',
    reflection: 'What can I care for today even though I cannot make it permanent?',
    teachBack: 'Which pair names dissolution and establishment, and which final word names nurture?'
  }
);

// 21 — Radiance, mystery and birthlessness; subanme remains disputed.
chhand(21, [
  [
    'I bow to You, radiant with Divine light.',
    'ਪ੍ਰਕਾਸ਼ ਸਰੂਪ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਦੇਵੈ is read through radiance, as in Sant Seva Singh and the Bhai Vir Singh-derived account. Neki instead stresses worship-worthiness. Divine light is a devotional description here, not a defined visible shape or colour.'
  ],
  [
    'I bow to You, whose full mystery cannot be fathomed.',
    'ਜਿਸ ਦਾ ਪੂਰਾ ਭੇਦ ਨਹੀਂ ਪਾਇਆ ਜਾ ਸਕਦਾ, ਉਸ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਅਭੇਵੈ is treated here as unfathomable, following the Bhai Vir Singh-derived rendering. Neki’s no-secret wording and Sant Seva Singh’s ਭੇਦ ਰਹਿਤ point toward other readings. The main sentence does not claim to resolve them.'
  ],
  [
    'I bow to You, whose being does not begin with birth.',
    'ਉਸ ਅਜਨਮੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ ਜਿਸ ਦੀ ਹੋਂਦ ਜਨਮ ਨਾਲ ਸ਼ੁਰੂ ਨਹੀਂ ਹੁੰਦੀ।',
    'ਅਜਨਮੇ directly names absence of birth. Keep it distinct from the disputed next epithet; this line should not be rewritten to make a single theory of the pair appear certain.'
  ],
  [
    'I bow to You, the One of wondrous beauty.',
    'ਅਸਚਰਜ ਸੁੰਦਰਤਾ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਸੁਬਨਮੇ is provisionally read through beauty or splendour, following Neki; the Bhai Vir Singh-derived explanation stresses reverence. Sant Seva Singh instead uses the world-as-offspring image. The compound remains unresolved and is not derived here from good name.'
  ]
]);

deep(21,
  'The prayer honours Divine radiance, mystery and birthlessness, then closes with a title provisionally understood as wondrous beauty.',
  'ਪ੍ਰਾਰਥਨਾ ਪ੍ਰਭੂ ਦੇ ਪ੍ਰਕਾਸ਼, ਅਥਾਹ ਭੇਦ ਅਤੇ ਅਜਨਮੇ ਸਰੂਪ ਨੂੰ ਯਾਦ ਕਰਦੀ ਹੈ; ਆਖ਼ਰੀ ਨਾਮ ਨੂੰ ਇੱਥੇ ਅਸਥਾਈ ਤੌਰ ਤੇ ਸੁੰਦਰਤਾ ਦੇ ਭਾਵ ਵਿੱਚ ਪੜ੍ਹਿਆ ਹੈ।',
  {
    focus: 'Wonder without claiming to contain the Divine.',
    closeReading: 'The opening holds radiance beside mystery: something can be praised as light without being completely grasped. The third line removes birth as a limit on Divine being. In this draft, the final salutation returns to beauty and reverence. Notice how the speaker keeps addressing the One even while language reaches its limits. ਸੁਬਨਮੇ also has a world-as-offspring reading; that would make the final pair about the birthless source and its creation, so the alternative changes the emphasis and deserves attention.',
    words: [
      ['ਅਭੇਵੈ', 'Unfathomable; selected reading, with other senses of ਭੇਦ recorded'],
      ['ਅਜਨਮੇ', 'Without birth'],
      ['ਸੁਬਨਮੇ', 'Wondrous beauty or splendour; provisional, not a settled derivation']
    ],
    care: 'The final title remains a philological question. Preserve the source spelling and distinguish the selected beauty reading from the creation-as-offspring reading; neither is silently declared the only correct sense.',
    reflection: 'Can I express love and reverence while admitting that I do not fully understand?',
    teachBack: 'Which title clearly names birthlessness, and which has the unsettled beauty and offspring readings?'
  }
);

// 22 — Going, dwelling, colour and dissolution all receive sarab.
chhand(22, [
  [
    'I bow to You, whose presence reaches everywhere.',
    'ਹਰ ਥਾਂ ਵਿਆਪਕ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਗਉਨੇ carries the image of movement or going. With ਸਰਬ, it is read as presence extending everywhere. The image need not give the Divine a body that must travel to gain access to each place.'
  ],
  [
    'I bow to You, dwelling throughout all worlds and places.',
    'ਸਭ ਲੋਕਾਂ ਅਤੇ ਥਾਵਾਂ ਵਿੱਚ ਵੱਸਣ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਭਉਨੇ is connected in the consulted readings with ਭਵਨ, a dwelling or realm. After the movement-image of ਗਉਨੇ, it offers the complementary image of abiding presence throughout the worlds.'
  ],
  [
    'I bow to You, expressed in every colour and form.',
    'ਸਭ ਰੰਗਾਂ ਅਤੇ ਰੂਪਾਂ ਵਿੱਚ ਪ੍ਰਗਟ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਰੰਗੇ evokes colours and diverse appearances. The earlier ਅਰੰਗੇ in Chhand 15 denies a limiting colour; ਸਰਬ ਰੰਗੇ expands the address to every colour. The pairing creates a poetic contrast rather than a ranking of appearances.'
  ],
  [
    'I bow to You, who can bring every created form to an end.',
    'ਹਰ ਸਿਰਜੇ ਹੋਏ ਰੂਪ ਦਾ ਅੰਤ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
    'ਭੰਗੇ names breaking up or dissolution. Following the abundance of forms in ਰੰਗੇ, the ending prevents their variety from becoming a claim that any particular form lasts forever.'
  ]
]);

deep(22,
  'The One is present through every place and form, while no created form escapes dissolution.',
  'ਇੱਕੋ ਪ੍ਰਭੂ ਹਰ ਥਾਂ ਅਤੇ ਹਰ ਰੂਪ ਵਿੱਚ ਵਿਆਪਕ ਹੈ; ਸਿਰਜਿਆ ਕੋਈ ਵੀ ਰੂਪ ਸਦਾ ਕਾਇਮ ਨਹੀਂ ਰਹਿੰਦਾ।',
  {
    focus: 'Everywhere present, while forms remain changeable.',
    closeReading: 'ਸਰਬ appears four times again, opening each title outward. The first pair joins going with dwelling: presence reaches every place and abides throughout the worlds. The second pair joins the variety of colours with the dissolution of forms. Read this beside Chhand 18: freedom from one fixed abode can coexist with presence in every abode. Likewise, a form can express beauty without becoming permanent. The passage invites attentive regard for a changing creation while keeping the One beyond any single appearance.',
    words: [
      ['ਗਉਨੇ', 'Going or reaching; here expressing presence everywhere'],
      ['ਭਉਨੇ', 'Dwelling throughout worlds or realms; working sense'],
      ['ਭੰਗੇ', 'Bringing forms to dissolution']
    ],
    care: 'Going and dwelling are poetic ways to speak about Divine presence. This lesson does not assign a physical route or a bounded body to the One.',
    reflection: 'How might noticing change make my attention to the world more grateful and careful?',
    teachBack: 'How do going and dwelling complement one another before colour and dissolution appear?'
  }
);
