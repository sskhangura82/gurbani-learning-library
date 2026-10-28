/* Jaap Sahib Chhands 53–60: original educational paraphrase drafts.
 * The 22 source lines, their Gurmukhi and their hashes remain frozen in
 * nitnem/data/jaap.json. Some lines contain several poetic clauses.
 * Interpretive alternatives and the existing comparison flags are noted
 * in jaap-chhands53-60-research.json. Nothing here grants source approval,
 * qualified translation status, santhiya authority or publication clearance.
 */

export const jaap53to60Lines = [];
export const jaap53to60Deep = [];

const expectedRecords = new Map([[53, 2], [54, 2], [55, 4], [56, 4], [57, 4], [58, 2], [59, 2], [60, 2]]);

function chhand(n, rows) {
  if (rows.length !== expectedRecords.get(n)) throw new Error('Invalid Jaap 53–60 draft unit');
  const unitId = 'jaap' + String(n).padStart(3, '0');
  rows.forEach(([simpleEn, simplePa, nuance], index) => {
    if (!simpleEn || !simplePa || !nuance) throw new Error('Incomplete bilingual line: ' + unitId);
    jaap53to60Lines.push({
      bani: 'jaap', lineId: unitId + '.line' + String(index + 1).padStart(2, '0'),
      simpleEn, simplePa, nuance,
      meaningKind: 'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
      editorialStatus: 'DRAFT_AI_UNREVIEWED', humanReviewed: false
    });
  });
}

function deep(n, simpleEn, simplePa, study) {
  jaap53to60Deep.push({
    bani: 'jaap', unitId: 'jaap' + String(n).padStart(3, '0'), simpleEn, simplePa,
    study, editorialStatus: 'DRAFT_AI_UNREVIEWED', humanReviewed: false
  });
}

chhand(53, [
  ['You have no defining garb and are free from delusion; You do not depend on worldly enjoyment and cannot be made an object of enjoyment.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰਾ ਕੋਈ ਨਿਸ਼ਚਿਤ ਭੇਖ ਨਹੀਂ ਅਤੇ ਤੂੰ ਭਰਮ ਤੋਂ ਰਹਿਤ ਹੈਂ; ਤੂੰ ਭੋਗਾਂ ਦਾ ਮੁਥਾਜ ਨਹੀਂ ਅਤੇ ਤੈਨੂੰ ਭੋਗ ਦੀ ਵਸਤ ਨਹੀਂ ਬਣਾਇਆ ਜਾ ਸਕਦਾ।',
   'The four epithets are kept distinct: ਅਭੇਖੀ concerns garb, ਅਭਰਮੀ delusion, ਅਭੋਗੀ worldly indulgence, and ਅਭੁਗਤੇ being enjoyed or consumed. The final phrase is a working paraphrase of the non-enjoyed sense in Punjabi commentary. Neki instead emphasises detachment and freedom from temptation. This address does not condemn human bodies or every form of joy.'],
  ['I bow to You, supreme master of the yogis, whose way is complete.',
   'ਹੇ ਪ੍ਰਭੂ, ਜੋਗੀਆਂ ਦੇ ਵੀ ਮਹਾਨ ਸੁਆਮੀ ਅਤੇ ਪੂਰਨ ਜੁਗਤ ਵਾਲੇ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਜੋਗ ਜੋਗੇਸ੍ਵਰੰ honours the Divine above masters of spiritual discipline. ਪਰਮ ਜੁਗਤੇ is provisionally read as supreme in method or wisdom of practice, following Punjabi commentary. A complete-union reading also occurs; Mahan Kosh includes both method and union within the related ਜੁਗਤਿ vocabulary. Neither reading supplies a physical yoga technique.']
]);

deep(53,
  'The first line removes four limits: a defining outfit, delusion, dependence on enjoyment, and being available for someone else to possess or consume. The second honours the Divine above even accomplished yogis. In this working reading, supreme spiritual mastery cannot be reduced to an appearance or an appetite.',
  'ਪਹਿਲੀ ਤੁਕ ਪ੍ਰਭੂ ਨੂੰ ਭੇਖ, ਭਰਮ ਅਤੇ ਭੋਗ ਦੀਆਂ ਹੱਦਾਂ ਤੋਂ ਪਰੇ ਕਹਿੰਦੀ ਹੈ। ਉਸ ਨੂੰ ਆਪਣੇ ਸੁਖ ਲਈ ਵਰਤੀ ਜਾਣ ਵਾਲੀ ਵਸਤ ਨਹੀਂ ਬਣਾਇਆ ਜਾ ਸਕਦਾ। ਦੂਜੀ ਤੁਕ ਜੋਗੀਆਂ ਦੇ ਵੀ ਸੁਆਮੀ ਅਤੇ ਪੂਰਨ ਜੁਗਤ ਵਾਲੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦੀ ਹੈ। ਇਸ ਕਾਰਜਕਾਰੀ ਅਰਥ ਵਿੱਚ ਆਤਮਕ ਮਹਾਨਤਾ ਕਿਸੇ ਪਹਿਰਾਵੇ ਜਾਂ ਭੋਗ ਦੀ ਲਾਲਸਾ ਵਿੱਚ ਨਹੀਂ ਸਮਾਉਂਦੀ।',
  {
    focus: 'Keep the four opening epithets distinct, then ask how they shape the praise of spiritual mastery.',
    closeReading: 'The first source line contains four closely sounding words, each removing a different limitation. The pair about enjoyment asks particular care: freedom from wanting pleasure is not quite the same statement as freedom from being used as someone else’s pleasure. The next line changes to an explicit salutation and places even advanced yogis within a greater horizon. The repetition of ਜੋਗ does not make the One a member of one human order. Read the stanza alongside Chhand 28, where enjoyment is praised in a different formulation; neither passage should erase the other. The lesson selects a method-related sense of ਪਰਮ ਜੁਗਤੇ while leaving the union-related interpretation visible.',
    words: [
      ['ਅਭੇਖੀ', 'without a defining garb'],
      ['ਅਭਰਮੀ', 'free from delusion'],
      ['ਅਭੋਗੀ', 'free from dependence on worldly enjoyment'],
      ['ਅਭੁਗਤੇ', 'not an object to be enjoyed or consumed, in this reading'],
      ['ਜੋਗ ਜੋਗੇਸ੍ਵਰੰ', 'supreme master of the yogis'],
      ['ਪਰਮ ਜੁਗਤੇ', 'supreme in method; complete union is an alternative reading']
    ],
    care: 'These are Divine attributes, not a demand to despise the body, suppress all enjoyment or claim superiority through a religious outfit. The method/union distinction remains a question for qualified Punjabi and Sikh review.',
    reflection: 'When might an outward sign of discipline become more important to you than the honesty of the practice itself?',
    teachBack: 'Explain the difference between ਅਭੋਗੀ and ਅਭੁਗਤੇ in this draft, and name the two noted approaches to ਪਰਮ ਜੁਗਤੇ.'
  }
);

chhand(54, [
  ['I bow to You, the enduring Narayan who sustains life and acts with fearsome power.',
   'ਹੇ ਸਦਾ ਕਾਇਮ ਨਾਰਾਇਣ, ਜੀਵਨ ਨੂੰ ਆਸਰਾ ਦੇਣ ਵਾਲੇ ਅਤੇ ਭਿਆਨਕ ਕਰਮ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਨਿੱਤ gives the enduring sense; ਨਾਰਾਇਣੇ is a Divine name associated here with sustaining care. ਕ੍ਰੂਰ ਕਰਮੇ retains the unsettling force of fierce or terrible action, including destruction, rather than turning it into gentle action alone. This is praise addressed to the Divine, not permission for human cruelty. The consulted texts differ between ਕ੍ਰੂਰ and ਕਰੂਰ; this explanation keeps the original wording.'],
  ['I bow to You, the Divine light of the departed and the living, whose dharam is noble.',
   'ਹੇ ਪ੍ਰਭੂ, ਮਰ ਚੁੱਕਿਆਂ ਤੇ ਜੀਉਂਦਿਆਂ ਦੀ ਜੋਤਿ ਅਤੇ ਸ੍ਰੇਸ਼ਟ ਧਰਮ ਵਾਲੇ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਪ੍ਰੇਤ/ਅਪ੍ਰੇਤ is provisionally heard as departed/not-departed, following one commentary’s contrast. Mahan Kosh supports departed as a sense of ਪ੍ਰੇਤ; it does not independently establish this whole paired reading. The Rampur Khera steek gives unsettled spirits and pure souls; another gloss contrasts inanimate and conscious being. ਦੇਵੇ is heard as Divine light and ਸੁਧਰਮੇ as excellent dharam. These alternatives remain open, without changing the text or treating spirit language as a diagnosis.']
]);

deep(54,
  'The stanza addresses an enduring Divine presence through both sustaining care and fearsome action. Its second line reaches across a difficult pair, read here as the departed and the living, and closes with light and noble dharam. The praise does not make the painful side of existence disappear, and it does not make cruelty a human virtue.',
  'ਛੰਦ ਸਦਾ ਕਾਇਮ ਪ੍ਰਭੂ ਨੂੰ ਜੀਵਨ ਦਾ ਆਸਰਾ ਅਤੇ ਭਿਆਨਕ ਕਰਮ ਕਰਨ ਵਾਲਾ ਕਹਿੰਦਾ ਹੈ। ਦੂਜੀ ਤੁਕ ਦੇ ਪ੍ਰੇਤ ਅਤੇ ਅਪ੍ਰੇਤ ਨੂੰ ਇੱਥੇ ਮਰ ਚੁੱਕਿਆਂ ਅਤੇ ਜੀਉਂਦਿਆਂ ਦੇ ਕਾਰਜਕਾਰੀ ਅਰਥ ਵਿੱਚ ਲਿਆ ਹੈ; ਇਸ ਜੋੜੇ ਦੇ ਹੋਰ ਅਰਥ ਵੀ ਮਿਲਦੇ ਹਨ। ਤੁਕ ਦਾ ਅੰਤ ਜੋਤਿ ਅਤੇ ਸ੍ਰੇਸ਼ਟ ਧਰਮ ਵੱਲ ਲੈ ਜਾਂਦਾ ਹੈ। ਇਹ ਉਸਤਤਿ ਮਨੁੱਖ ਨੂੰ ਜ਼ੁਲਮ ਕਰਨ ਦਾ ਹੱਕ ਨਹੀਂ ਦਿੰਦੀ।',
  {
    focus: 'Read sustaining care and fearsome power together while keeping the uncertain spirit vocabulary visible.',
    closeReading: 'Both lines begin with ਨਮੋ, so the grammatical direction remains an address of reverence. The first does not restrict the Divine to experiences that feel pleasant. Its fierce word should neither be hidden nor casually imitated by a person. In the second, the pair ਪ੍ਰੇਤ and ਅਪ੍ਰੇਤ resists a single confident gloss across all the consulted witnesses. The selected departed/living contrast gives the reader a clear way through the line, while the note preserves the other readings. ਦੇਵੇ and ਸੁਧਰਮੇ complete the address; omitting them would leave the stanza sounding like a catalogue of frightening beings rather than praise of the One.',
    words: [
      ['ਨਿੱਤ ਨਾਰਾਇਣੇ', 'the enduring Divine sustainer in this address'],
      ['ਕ੍ਰੂਰ ਕਰਮੇ', 'performing fierce or terrible deeds'],
      ['ਪ੍ਰੇਤ ਅਪ੍ਰੇਤ', 'departed and not-departed in the selected reading'],
      ['ਦੇਵੇ', 'Divine light; the luminous One'],
      ['ਸੁਧਰਮੇ', 'of noble or excellent dharam']
    ],
    care: 'The verse supplies no permission to harm, intimidate or identify another person as an evil spirit. Its traditional vocabulary is not evidence about the cause of someone’s distress. The spirits/pure-souls and inanimate/conscious readings remain alternatives, not settled classifications.',
    reflection: 'Can you acknowledge that an experience is painful without turning that pain into a judgment against the person enduring it?',
    teachBack: 'Identify the gentle and fearsome aspects named in the first line, then explain the chosen meaning and the uncertainty of the second line’s paired words.'
  }
);

chhand(55, [
  ['I bow to You, praised as the remover of illness and suffering.',
   'ਹੇ ਪ੍ਰਭੂ, ਰੋਗ ਅਤੇ ਦੁੱਖ ਦੂਰ ਕਰਨ ਵਾਲੇ ਵਜੋਂ ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਰੋਗ ਹਰਤਾ is devotional praise of the remover of affliction. It is not a promise that recitation will cure a condition or proof that ongoing illness reflects weak faith. The consulted texts differ in punctuation and line grouping here; this explanation follows the four lines as presented.'],
  ['I bow to You, whose being is love.',
   'ਹੇ ਪਿਆਰ ਸਰੂਪ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਰਾਗ is read as love or affection, supported by Punjabi commentary and the Mahan Kosh entry. Neki and the Bhai Vir Singh-derived commentary emphasise bliss here. The word also has musical senses, but this line does not prescribe a particular raag or make musical ability a condition of devotion.'],
  ['I bow to You, sovereign over every sovereign.',
   'ਹੇ ਸ਼ਾਹਾਂ ਦੇ ਵੀ ਸ਼ਾਹ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਸਾਹ ਸਾਹੰ is the repeated royal title, heard as Shah of shahs. In this context ਸਾਹ does not mean a breathing exercise. The spelling in the original is retained even though explanatory Punjabi commonly writes ਸ਼ਾਹ.'],
  ['I bow to You, ruler over all earthly rulers.',
   'ਹੇ ਧਰਤੀ ਦੇ ਸਾਰੇ ਰਾਜਿਆਂ ਦੇ ਵੀ ਰਾਜੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਭੂਪ ਭੂਪੇ repeats the language of rulers to place human authority beneath the Divine. It does not make any present ruler, institution or community exempt from moral responsibility.']
]);

deep(55,
  'The stanza places the language of healing and love beside two expressions of supreme sovereignty. Its movement invites the reader to understand greatness in relation to care for vulnerability. The prayer’s confidence is devotional; a person who remains ill has not failed this lesson.',
  'ਛੰਦ ਪਹਿਲਾਂ ਰੋਗ ਦੂਰ ਕਰਨ ਵਾਲੇ ਅਤੇ ਪਿਆਰ ਸਰੂਪ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਕਰਦਾ ਹੈ, ਫਿਰ ਉਸ ਨੂੰ ਸ਼ਾਹਾਂ ਦਾ ਸ਼ਾਹ ਅਤੇ ਰਾਜਿਆਂ ਦਾ ਰਾਜਾ ਕਹਿੰਦਾ ਹੈ। ਇਸ ਲੜੀ ਵਿੱਚ ਮਹਾਨਤਾ ਦੇ ਨਾਲ ਜੀਵਾਂ ਦੇ ਦੁੱਖ ਦੀ ਚਿੰਤਾ ਵੀ ਆਉਂਦੀ ਹੈ। ਇਹ ਭਗਤੀ ਦਾ ਸੰਬੋਧਨ ਹੈ; ਬਿਮਾਰੀ ਰਹਿ ਜਾਣਾ ਕਿਸੇ ਮਨੁੱਖ ਦੀ ਸ਼ਰਧਾ ਦੀ ਘਾਟ ਦਾ ਸਬੂਤ ਨਹੀਂ।',
  {
    focus: 'Notice what happens when royal greatness is preceded by care for suffering and the language of love.',
    closeReading: 'Four salutations create a steady movement through the stanza. The first names affliction, the second love in the selected reading, and the final two use royal titles. Those last titles reinforce each other without becoming names of two different deities. Their placement also gives the reader a question to carry into daily life: what should power be for when suffering is already in view? That question is an application, not an extra clause hidden in the original. The love reading of ਰਾਗ has contextual support; the bliss reading is also noted. Neither requires a particular voice, musical skill or sensory capacity.',
    words: [
      ['ਰੋਗ ਹਰਤਾ', 'remover of illness or affliction'],
      ['ਰਾਗ ਰੂਪੇ', 'love in its very being; bliss is another reading'],
      ['ਸਾਹ ਸਾਹੰ', 'sovereign of sovereigns'],
      ['ਭੂਪ ਭੂਪੇ', 'ruler of rulers']
    ],
    care: 'Praise of healing is not a clinical prediction, a treatment instruction or a guarantee of recovery. Illness, disability and continued pain do not establish spiritual failure. The royal language gives no human being unlimited authority.',
    reflection: 'Where do you have a little influence, and how could you use it to make room for someone who is struggling?',
    teachBack: 'Describe the stanza’s movement from affliction and love to sovereignty, and explain why its first line should not be presented as a cure guarantee.'
  }
);

chhand(56, [
  ['I bow to You, the giver from whom all givers receive.',
   'ਹੇ ਪ੍ਰਭੂ, ਸਭ ਦਾਨੀਆਂ ਨੂੰ ਵੀ ਦੇਣ ਵਾਲੇ ਦਾਤੇ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਦਾਨ ਦਾਨੇ is read as the giver of givers, supported by the Punjabi commentaries. The repeated expression places generosity in relation to its Divine source rather than measuring a person’s worth by the amount they donate.'],
  ['I bow to You, the honour of all who are honoured.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਾਰੇ ਮਾਣ ਵਾਲਿਆਂ ਦਾ ਵੀ ਮਾਣ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਮਾਨ ਮਾਨੇ has the same selected English and Punjabi explanation as its occurrence in Chhand 46. The honour-of-the-honoured reading follows Punjabi commentary; bestower of honour is another rendering. Honour here need not mean social rank or pride.'],
  ['I bow to You, praised as the affliction that overcomes afflictions.',
   'ਹੇ ਪ੍ਰਭੂ, ਰੋਗਾਂ ਲਈ ਵੀ ਰੋਗ ਬਣ ਕੇ ਉਨ੍ਹਾਂ ਨੂੰ ਮਿਟਾਉਣ ਵਾਲੇ ਵਜੋਂ ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਰੋਗ ਰੋਗੇ uses the striking disease-of-disease expression. This draft selects the destroyer-of-affliction reading found in Punjabi commentary and Neki. A Rampur Khera footnote instead stresses that even diseases receive their power within Divine sovereignty; that is a distinct interpretation. Neither reading makes illness a person’s fault or promises a particular medical outcome.'],
  ['I bow to You, source of purity, praised through the image of a cleansing bath.',
   'ਹੇ ਪਵਿੱਤਰਤਾ ਦੇ ਸੋਮੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੇਰੀ ਹਜ਼ੂਰੀ ਨੂੰ ਪਵਿੱਤਰ ਕਰਨ ਵਾਲੇ ਇਸ਼ਨਾਨ ਵਾਂਗ ਯਾਦ ਕੀਤਾ ਹੈ।',
   'ਸਨਾਨੇ is heard through bathing and purification imagery, supported by Punjabi commentary and the related dictionary entry ਇਸਨਾਨ. Neki’s health-focused rendering is not adopted as a medical claim. Some other witnesses print ਇਸਨਾਨੰ; the original ਸਨਾਨੇ remains unchanged. The source comparison also notes differences in punctuation and grouping, without replacing the original words.']
]);

deep(56,
  'The repeated expressions turn giving, honour and affliction back towards the Divine. The last line adds cleansing imagery. In the selected reading, the One supplies what generosity and honour depend on, overcomes affliction, and is addressed as a source of purity. The language asks for reverence, not a judgment about anyone’s health or social standing.',
  'ਛੰਦ ਦਾਨ, ਮਾਣ ਅਤੇ ਰੋਗ ਦੇ ਦੁਹਰਾਏ ਹੋਏ ਸ਼ਬਦਾਂ ਰਾਹੀਂ ਪ੍ਰਭੂ ਵੱਲ ਧਿਆਨ ਲੈ ਜਾਂਦਾ ਹੈ। ਦਾਤੇ ਨੂੰ ਦਾਨੀਆਂ ਦਾ ਦਾਤਾ ਅਤੇ ਮਾਣ ਵਾਲਿਆਂ ਦਾ ਮਾਣ ਕਿਹਾ ਹੈ। ਰੋਗਾਂ ਦਾ ਰੋਗ ਉਸ ਦੀ ਰੋਗ-ਨਾਸਕ ਸਮਰੱਥਾ ਦਾ ਕਾਰਜਕਾਰੀ ਅਰਥ ਹੈ; ਅਖ਼ੀਰ ਵਿੱਚ ਪਵਿੱਤਰ ਕਰਨ ਵਾਲੇ ਇਸ਼ਨਾਨ ਦਾ ਰੂਪਕ ਆਉਂਦਾ ਹੈ। ਇਸ ਤੋਂ ਕਿਸੇ ਮਨੁੱਖ ਦੀ ਸਿਹਤ ਜਾਂ ਪਵਿੱਤਰਤਾ ਬਾਰੇ ਫ਼ੈਸਲਾ ਨਹੀਂ ਕੱਢਣਾ।',
  {
    focus: 'Follow the repeated-word pattern without forcing giving, honour, affliction and cleansing into one identical meaning.',
    closeReading: 'The first three lines each repeat a key noun, but their relationships differ. A giver may receive before giving; honour can point beyond the person being praised; disease directed against disease becomes an image of its defeat. The final line changes the pattern and offers a bath as an image of purification. This variation matters: the stanza is not a list of interchangeable superlatives. The reading of ਰੋਗ ਰੋਗੇ is explicitly selected rather than treated as unanimous. Keeping its alternative separate also prevents a slide from broad Divine sovereignty into a personal explanation for why a particular individual is ill.',
    words: [
      ['ਦਾਨ ਦਾਨੇ', 'giver of givers'],
      ['ਮਾਨ ਮਾਨੇ', 'honour of all who are honoured'],
      ['ਰੋਗ ਰੋਗੇ', 'affliction overcoming affliction, in this reading'],
      ['ਸਨਾਨੇ', 'bathing or purifying imagery']
    ],
    care: 'Purification language must not be used to label an ill or disabled person impure. This lesson makes no cure promise and gives no medical or bathing instructions. Its reflection on generosity does not require money, status or public recognition.',
    reflection: 'Think of something you have received that you can pass on without taking all the credit for it.',
    teachBack: 'Explain how the repeated nouns work differently in the first three lines, and describe the final bathing image without making a claim about physical health.'
  }
);

chhand(57, [
  ['I bow to You as the mantra of mantras, supreme over sacred formulas.',
   'ਹੇ ਪ੍ਰਭੂ, ਸਭ ਮੰਤ੍ਰਾਂ ਤੋਂ ਸ੍ਰੇਸ਼ਟ ਮੰਤ੍ਰ ਰੂਪ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਮੰਤ੍ਰ can name a sacred utterance, formula or counsel. The repeated ਮੰਤ੍ਰ ਮੰਤ੍ਰੰ is an address of supremacy in this context. It gives no recitation count, operational formula or guarantee that a desired event will occur.'],
  ['I bow to You as the yantra of yantras, supreme over ritual devices and diagrams.',
   'ਹੇ ਪ੍ਰਭੂ, ਸਭ ਜੰਤ੍ਰਾਂ ਤੋਂ ਸ੍ਰੇਸ਼ਟ ਜੰਤ੍ਰ ਰੂਪ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਕੋਈ ਰਸਮੀ ਸਾਧਨ ਤੇਰੇ ਤੋਂ ਵੱਡਾ ਨਹੀਂ।',
   'ਜੰਤ੍ਰ has several dictionary senses, including device, instrument and ritual diagram or talisman. The pairing with mantra and tantra supports the ritual-device sense selected here. The lesson does not claim that diagrams, amulets or objects control the Divine, and it does not substitute the unrelated living-creature sense.'],
  ['I bow to You, the One worthy of worship even by those whom others worship.',
   'ਹੇ ਪ੍ਰਭੂ, ਜਿਨ੍ਹਾਂ ਨੂੰ ਲੋਕ ਪੂਜਦੇ ਹਨ, ਉਨ੍ਹਾਂ ਦੇ ਵੀ ਪੂਜਣਯੋਗ ਤੂੰ ਹੀ ਹੈਂ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਇਸਟ is read as a cherished or worship-worthy object of devotion; ਇਸਟ ਇਸਟੇ places the Divine above all such objects of worship. It is a reverent superlative, not an instruction to insult other people’s religious practice.'],
  ['I bow to You as the tantra of tantras, supreme over ritual systems and techniques.',
   'ਹੇ ਪ੍ਰਭੂ, ਸਭ ਤੰਤ੍ਰਾਂ ਤੋਂ ਸ੍ਰੇਸ਼ਟ ਤੰਤ੍ਰ ਰੂਪ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਾਰੀਆਂ ਰਸਮੀ ਵਿਧੀਆਂ ਤੋਂ ਉੱਚਾ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਤੰਤ੍ਰ can mean a system, method or ritual practice, among other senses. In this sequence the working reading concerns methods associated with ritual power. The phrase praises the One; it is not a recipe, endorsement of coercive magic or promise of special abilities.']
]);

deep(57,
  'Four repeated expressions place sacred utterance, ritual device, object of worship and ritual method in relation to the Divine. Their common direction is reverence for the One above any technique. Keeping the terms distinct helps the reader avoid treating the stanza as a set of instructions for obtaining power.',
  'ਚਾਰ ਤੁਕਾਂ ਮੰਤ੍ਰ, ਜੰਤ੍ਰ, ਇਸਟ ਅਤੇ ਤੰਤ੍ਰ ਨੂੰ ਪ੍ਰਭੂ ਦੇ ਸੰਬੰਧ ਵਿੱਚ ਰੱਖਦੀਆਂ ਹਨ। ਮੰਤ੍ਰ ਦਾ ਸੰਬੰਧ ਉਚਾਰੇ ਜਾਣ ਵਾਲੇ ਬੋਲਾਂ ਨਾਲ, ਜੰਤ੍ਰ ਦਾ ਰਸਮੀ ਸਾਧਨ ਨਾਲ, ਇਸਟ ਦਾ ਪੂਜਣਯੋਗ ਨਾਲ ਅਤੇ ਤੰਤ੍ਰ ਦਾ ਵਿਧੀ ਨਾਲ ਜੋੜ ਕੇ ਕਾਰਜਕਾਰੀ ਅਰਥ ਕੀਤਾ ਹੈ। ਹਰ ਨਮਸਕਾਰ ਉਸ ਇੱਕ ਵੱਲ ਹੈ ਜੋ ਕਿਸੇ ਵਿਧੀ ਦੇ ਅਧੀਨ ਨਹੀਂ। ਇਹ ਜਾਦੂਈ ਤਾਕਤ ਹਾਸਲ ਕਰਨ ਦੀਆਂ ਹਦਾਇਤਾਂ ਨਹੀਂ ਹਨ।',
  {
    focus: 'Identify four different kinds of religious means and keep the salutation directed towards the Divine.',
    closeReading: 'The surface pattern is very regular: ਨਮੋ followed by a repeated noun. Yet a spoken formula, a diagram or device, a revered object and a ritual system are not the same thing. Their juxtaposition supplies context for selecting among dictionary senses. Each phrase carries the same movement beyond the ordinary authority of that noun. There are no directions here for drawing, binding, counting or commanding. The Study reading therefore asks what the practitioner relies on, rather than supplying a new technique. An account of historical vocabulary can help comprehension without certifying the powers that people have attributed to such practices.',
    words: [
      ['ਮੰਤ੍ਰ ਮੰਤ੍ਰੰ', 'mantra of mantras; sacred-utterance language'],
      ['ਜੰਤ੍ਰ ਜੰਤ੍ਰੰ', 'yantra of yantras; ritual-device language here'],
      ['ਇਸਟ ਇਸਟੇ', 'the worship-worthy One above all objects of worship'],
      ['ਤੰਤ੍ਰ ਤੰਤ੍ਰੰ', 'tantra of tantras; method or ritual-system language here']
    ],
    care: 'No magical technique, supernatural result or control over another person is promised. The words have broader dictionary ranges than this one stanza requires. The teaching should not disparage a reader for knowing or not knowing ritual terminology.',
    reflection: 'When you practise something regularly, how can you remain sincere without treating the practice as a bargain that guarantees an outcome?',
    teachBack: 'Give one plain-language distinction between mantra, yantra, isht and tantra, then explain why this stanza is an address of praise rather than an instruction manual.'
  }
);

chhand(58, [
  ['You are eternally true being, awareness and bliss, and the One who brings all created things to their end.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਦਾ ਸੱਚੀ ਹੋਂਦ, ਚੇਤਨਾ ਅਤੇ ਅਨੰਦ ਸਰੂਪ ਹੈਂ; ਸਾਰੀ ਰਚਨਾ ਦਾ ਅੰਤ ਕਰਨ ਵਾਲਾ ਵੀ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਸੱਚਦਾਨੰਦ is conventionally explained through sat, chit and anand: true being, consciousness and bliss. ਸਰਬੰ ਪ੍ਰਣਾਸੀ names the ending of all, not merely the removal of bad habits. This reading follows the consulted commentaries without silently expanding the source spelling or making a prediction about when the world will end.'],
  ['You are beyond comparison and without form, yet dwell within all.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਪੂਰੀ ਉਪਮਾ ਨਹੀਂ ਦਿੱਤੀ ਜਾ ਸਕਦੀ; ਤੂੰ ਰੂਪ ਰਹਿਤ ਹੈਂ ਅਤੇ ਸਭ ਵਿੱਚ ਵੱਸਦਾ ਹੈਂ।',
   'ਅਨੂਪੇ denies an adequate comparison, ਅਰੂਪੇ a bounded form, and ਸਮਸਤੁਲ ਨਿਵਾਸੀ affirms presence within all. These are three distinct claims in one source line. Another website prints ਸਮਸਤੁਲਿ; this text’s ਸਮਸਤੁਲ is retained. Divine presence does not mean every human action is approved.']
]);

deep(58,
  'Enduring true being, awareness and bliss are named beside the power that ends creation. The second line brings together incomparability, formlessness and presence in all. The stanza asks the reader to hold these descriptions together without reducing the Divine to a pleasant feeling or one visible object.',
  'ਸਦਾ ਕਾਇਮ ਸੱਚੀ ਹੋਂਦ, ਚੇਤਨਾ ਅਤੇ ਅਨੰਦ ਦੇ ਨਾਲ ਹੀ ਸਾਰੀ ਰਚਨਾ ਦੇ ਅੰਤ ਦਾ ਜ਼ਿਕਰ ਆਉਂਦਾ ਹੈ। ਦੂਜੀ ਤੁਕ ਪ੍ਰਭੂ ਨੂੰ ਉਪਮਾ ਤੋਂ ਪਰੇ, ਰੂਪ ਰਹਿਤ ਅਤੇ ਸਭ ਵਿੱਚ ਵੱਸਦਾ ਕਹਿੰਦੀ ਹੈ। ਛੰਦ ਦੇ ਇਨ੍ਹਾਂ ਪੱਖਾਂ ਨੂੰ ਇਕੱਠੇ ਪੜ੍ਹਨਾ ਹੈ; ਪ੍ਰਭੂ ਨੂੰ ਸਿਰਫ਼ ਸੁਖਦਾਇਕ ਭਾਵਨਾ ਜਾਂ ਇੱਕ ਨਜ਼ਰ ਆਉਣ ਵਾਲੀ ਵਸਤ ਤਕ ਘਟਾ ਦੇਣਾ ਪੂਰਾ ਅਰਥ ਨਹੀਂ ਬਣਦਾ।',
  {
    focus: 'Notice the deliberate proximity of lasting being, bliss, endings and universal presence.',
    closeReading: 'ਸਦਾ stands at the opening, but the same line also contains ਪ੍ਰਣਾਸੀ. A quick reading that notices only bliss misses the ending of created things; a reading that notices only destruction misses the opening attributes. The next line moves from what cannot adequately describe or contain the Divine to presence within all. The movement is not a new physical description of the universe. It is a pattern of praise that both uses words and acknowledges their limits. The familiar sat-chit-anand explanation helps unpack the compound, while the source line itself keeps its own spelling and is never replaced with an expanded formula.',
    words: [
      ['ਸਦਾ', 'always; enduringly'],
      ['ਸੱਚਦਾਨੰਦ', 'true being, awareness and bliss in the conventional explanation'],
      ['ਸਰਬੰ ਪ੍ਰਣਾਸੀ', 'the One who brings all to its end'],
      ['ਅਨੂਪੇ', 'without an adequate comparison'],
      ['ਅਰੂਪੇ', 'without a bounded form'],
      ['ਸਮਸਤੁਲ ਨਿਵਾਸੀ', 'dwelling within all']
    ],
    care: 'Anand is ascribed to the Divine; it does not require every reader to feel happy at every moment. The line gives no date for cosmic destruction and no permission to hasten anyone’s death. The traditional compound is not a claim about a measurable state of the brain.',
    reflection: 'How might gratitude for something valuable change when you also recognise that its present form will not last forever?',
    teachBack: 'Name both sides of the first line and all three descriptions in the second, explaining why none should be omitted.'
  }
);

chhand(59, [
  ['You always grant spiritual attainment and understanding, and bring about growth.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਦਾ ਸਿੱਧੀ ਅਤੇ ਬੁੱਧੀ ਬਖ਼ਸ਼ਦਾ ਹੈਂ ਅਤੇ ਵਾਧਾ ਕਰਦਾ ਹੈਂ।',
   'ਸਿਧਦਾ and ਬੁਧਦਾ are provisionally read as granting attainment and understanding; ਬ੍ਰਿਧ ਕਰਤਾ as bringing increase or growth. Another consulted text reads ਸਿਧਿਦਾ ਬੁਧਿਦਾ ਬ੍ਰਿਧਿ. The commentary-supported compound reading does not settle that spelling question. Traditional siddhi can include extraordinary accomplishments or powers; this draft does not promise them to a reader.'],
  ['You are present below, above and between, and remove the gathered burden of wrongdoing.',
   'ਹੇ ਪ੍ਰਭੂ, ਹੇਠਾਂ, ਉੱਪਰ ਅਤੇ ਵਿਚਕਾਰ ਹਰ ਥਾਂ ਤੂੰ ਵਿਆਪਕ ਹੈਂ; ਪਾਪਾਂ ਦੇ ਸਮੂਹ ਨੂੰ ਦੂਰ ਕਰਨ ਵਾਲਾ ਤੂੰ ਹੀ ਹੈਂ।',
   'This selects the Rampur Khera spatial reading of ਅਧੋ ਉਰਧ ਅਰਧੰ, followed by ਅਘੰ ਓਘ as an accumulation of wrongdoing and ਹਰਤਾ as remover. Another Punjabi commentary instead relates the three descriptors to classes or degrees of wrongdoing. The alternatives are not merged into a fabricated single explanation. Removing wrongdoing is not permission to avoid responsibility for harm.']
]);

deep(59,
  'The first line names gifts of attainment, understanding and growth. The second, in the selected spatial reading, moves through below, above and between before naming the removal of accumulated wrongdoing. The lesson keeps both the gifts and moral responsibility in view while leaving the disputed compound spellings open.',
  'ਪਹਿਲੀ ਤੁਕ ਵਿੱਚ ਸਿੱਧੀ, ਬੁੱਧੀ ਅਤੇ ਵਾਧੇ ਦੀਆਂ ਦਾਤਾਂ ਦਾ ਜ਼ਿਕਰ ਹੈ। ਦੂਜੀ ਤੁਕ ਦੇ ਚੁਣੇ ਹੋਏ ਅਰਥ ਵਿੱਚ ਹੇਠਾਂ, ਉੱਪਰ ਅਤੇ ਵਿਚਕਾਰ ਹਰ ਥਾਂ ਪ੍ਰਭੂ ਦੀ ਵਿਆਪਕਤਾ ਆਉਂਦੀ ਹੈ, ਫਿਰ ਪਾਪਾਂ ਦੇ ਸਮੂਹ ਨੂੰ ਦੂਰ ਕਰਨ ਦੀ ਗੱਲ ਹੈ। ਦਾਤ ਮਿਲਣ ਦੇ ਨਾਲ ਆਪਣੇ ਕਰਮਾਂ ਦੀ ਜ਼ਿੰਮੇਵਾਰੀ ਵੀ ਯਾਦ ਰਹੇ। ਸੰਯੁਕਤ ਸ਼ਬਦਾਂ ਦੇ ਲਿਖਤ-ਫ਼ਰਕ ਹਾਲੇ ਖੁੱਲ੍ਹੇ ਹਨ।',
  {
    focus: 'Distinguish attainment, understanding and growth, then read the whole second line without losing its final moral language.',
    closeReading: 'The opening line repeats a giving-related ending before moving to ਕਰਤਾ. This supports a reading of several related gifts, rather than treating ਸਿਧਦਾ and ਬੁਧਦਾ as personal names. The source spellings still differ from another consulted text, so the analysis remains bounded. In the second line the selected spatial sequence covers below, above and the intervening region; the last words turn to the amassed burden of wrongdoing. A second commentary attaches the initial descriptors to wrongdoing itself. Stating that difference openly is more useful than making the sentence sound certain by silently choosing different original letters or suppressing half of the line.',
    words: [
      ['ਸਿਧਦਾ', 'granting attainment, in the selected compound reading'],
      ['ਬੁਧਦਾ', 'granting understanding, in the selected compound reading'],
      ['ਬ੍ਰਿਧ ਕਰਤਾ', 'bringing growth or increase'],
      ['ਅਧੋ ਉਰਧ ਅਰਧੰ', 'below, above and between in the selected reading'],
      ['ਅਘੰ ਓਘ', 'an accumulation or multitude of wrongdoing'],
      ['ਹਰਤਾ', 'remover']
    ],
    care: 'Attainment language does not guarantee occult powers, wealth or increasing status. The reading about wrongdoing should not be carried backwards into Chhands 55–56 as an explanation for someone’s illness. Hope for release from wrongdoing does not cancel apology, repair or accountability.',
    reflection: 'What is one place where increased understanding could help you recognise and repair harm you previously overlooked?',
    teachBack: 'Name the three gifts in the first line, explain the selected spatial reading of the second, and identify the alternative that remains open.'
  }
);

chhand(60, [
  ['You are the supreme Lord, higher than every greatness, who sustains all while remaining unseen.',
   'ਹੇ ਸਭ ਤੋਂ ਸ੍ਰੇਸ਼ਟ ਪਰਮੇਸ਼ਰ, ਤੂੰ ਸਭ ਦੀ ਪਾਲਣਾ ਕਰਦਾ ਹੈਂ ਅਤੇ ਆਪ ਨਜ਼ਰ ਨਹੀਂ ਆਉਂਦਾ।',
   'ਪਰੰ ਪਰਮ ਪਰਮੇਸ੍ਵਰੰ intensifies the address to the supreme Lord. ਪ੍ਰੋਛ ਪਾਲੰ is read as unseen or hidden sustenance, supported by Punjabi commentary and Neki. This contextual explanation does not claim a settled derivation of ਪ੍ਰੋਛ. Unseen describes the Divine mode of care, not the worth of people with different visual abilities.'],
  ['You are forever merciful, the giver of spiritual attainments at every time.',
   'ਹੇ ਦਿਆਲੂ ਪ੍ਰਭੂ, ਤੂੰ ਹਰ ਵੇਲੇ ਸਦਾ ਸਿੱਧੀਆਂ ਬਖ਼ਸ਼ਣ ਵਾਲਾ ਦਾਤਾ ਹੈਂ।',
   'ਸਦਾ ਸਰਬਦਾ reinforces continuity; ਦਿਆਲੰ names mercy. ਸਿੱਧ ਦਾਤਾ is provisionally read with the commentaries as bestower of siddhi, including traditional spiritual accomplishments or powers. Another consulted text prints ਸਿਧਿ ਦਾਤਾ; the original ਸਿੱਧ ਦਾਤਾ is unchanged and the edition question remains open. The line is not a guarantee that every wish or practice produces an extraordinary result.']
]);

deep(60,
  'Supreme greatness is joined to sustaining care that is not ordinarily seen. The next line repeats the sense of always and names a merciful giver of attainment. The focus is a continuing relationship of dependence and gratitude. The reading of ਸਿੱਧ remains provisional because the consulted texts differ.',
  'ਛੰਦ ਸਭ ਤੋਂ ਸ੍ਰੇਸ਼ਟ ਪ੍ਰਭੂ ਨੂੰ ਗੁਪਤ ਰੂਪ ਵਿੱਚ ਸਭ ਦੀ ਪਾਲਣਾ ਕਰਨ ਵਾਲਾ ਕਹਿੰਦਾ ਹੈ। ਅਗਲੀ ਤੁਕ ਸਦਾ ਅਤੇ ਸਰਬਦਾ ਰਾਹੀਂ ਹਰ ਵੇਲੇ ਦੀ ਗੱਲ ਦੋਹਰਾਉਂਦੀ ਹੈ ਅਤੇ ਦਿਆਲੂ ਦਾਤੇ ਨੂੰ ਯਾਦ ਕਰਦੀ ਹੈ। ਇਸ ਅਰਥ ਵਿੱਚ ਆਸਰੇ ਅਤੇ ਸ਼ੁਕਰਾਨੇ ਦਾ ਭਾਵ ਮੁੱਖ ਹੈ। ਸਿੱਧ ਅਤੇ ਸਿਧਿ ਦੇ ਲਿਖਤ-ਫ਼ਰਕ ਦਾ ਨਿਰਣਾ ਹਾਲੇ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।',
  {
    focus: 'Read supreme greatness together with hidden care, continuity and mercy.',
    closeReading: 'The first line builds its address through ਪਰੰ, ਪਰਮ and ਪਰਮੇਸ੍ਵਰੰ before arriving at ਪਾਲੰ. Grandeur therefore leads into the language of sustaining. ਪ੍ਰੋਛ qualifies how that care is understood in the selected reading: it need not appear as an object that can be pointed out. The second line repeats temporal language before naming the giver and mercy. The lesson retains attainment vocabulary without converting it into a technique for acquiring powers. The spelling difference around ਸਿੱਧ is part of the source line’s review history; a plausible explanation is not a substitute for qualified source review.',
    words: [
      ['ਪਰੰ ਪਰਮ ਪਰਮੇਸ੍ਵਰੰ', 'the supremely exalted Lord'],
      ['ਪ੍ਰੋਛ ਪਾਲੰ', 'sustaining while unseen, in this reading'],
      ['ਸਦਾ ਸਰਬਦਾ', 'always; at every time'],
      ['ਸਿੱਧ ਦਾਤਾ', 'giver of attainment, provisionally following commentary'],
      ['ਦਿਆਲੰ', 'merciful; compassionate']
    ],
    care: 'Hidden care is not a claim that a reader must have a vision or that visual ability determines spiritual worth. The verse offers no guarantee of special powers or fulfilled wishes. Its praise should leave room to acknowledge the real people whose often unnoticed work supports daily life.',
    reflection: 'What care or support have you received without seeing all the work behind it, and how might you respond with gratitude?',
    teachBack: 'Explain what the selected ਪ੍ਰੋਛ ਪਾਲੰ reading adds to the first line, and identify the three emphases of the closing line: continuity, giving and mercy.'
  }
);
