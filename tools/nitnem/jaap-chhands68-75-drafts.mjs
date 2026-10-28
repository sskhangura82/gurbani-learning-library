/* Jaap Sahib Chhands 68–75: original educational paraphrase drafts.
 * The 31 source lines, their Gurmukhi and their hashes remain frozen in
 * nitnem/data/jaap.json. The Charpat heading before 74 is not a verse line.
 * Research locators, alternative senses and comparison flags are recorded
 * separately in jaap-chhands68-75-research.json. These drafts do not grant
 * qualified translation status, source approval or santhiya authority.
 */

export const jaap68to75Lines = [];
export const jaap68to75Deep = [];

function chhand(n, rows) {
  const expectedLines = n === 73 ? 3 : 4;
  if (n < 68 || n > 75 || rows.length !== expectedLines) throw new Error('Invalid Jaap 68–75 draft unit');
  const unitId = 'jaap' + String(n).padStart(3, '0');
  rows.forEach(([simpleEn, simplePa, nuance], index) => {
    if (!simpleEn || !simplePa || !nuance) throw new Error('Incomplete bilingual line: ' + unitId);
    jaap68to75Lines.push({
      bani: 'jaap', lineId: unitId + '.line' + String(index + 1).padStart(2, '0'),
      simpleEn, simplePa, nuance,
      meaningKind: 'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
      editorialStatus: 'DRAFT_AI_UNREVIEWED', humanReviewed: false
    });
  });
}

function deep(n, simpleEn, simplePa, study) {
  jaap68to75Deep.push({
    bani: 'jaap', unitId: 'jaap' + String(n).padStart(3, '0'), simpleEn, simplePa,
    study, editorialStatus: 'DRAFT_AI_UNREVIEWED', humanReviewed: false
  });
}

chhand(68, [
  ['I bow to You, the song at the heart of every song.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਗੀਤਾਂ ਦਾ ਸਾਰ ਅਤੇ ਮਿਠਾਸ ਤੂੰ ਹੀ ਹੈਂ।',
   'This is the same original line as 47.03, and its main explanation is unchanged. The repeated ਗੀਤ praises the One as the essence of song. Here its neighbours move from love to fierce power and dissolution, giving the familiar line a different setting without changing its central image.'],
  ['I bow to You, the deepest love within every love.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਪ੍ਰੀਤ ਦਾ ਡੂੰਘਾ ਆਧਾਰ ਅਤੇ ਸਾਰ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਪ੍ਰੀਤ ਪ੍ਰੀਤੇ intensifies the language of love, as the preceding line intensifies song. Punjabi commentary also expresses this as the supreme loving One among all who love. Another consulted text has ਪ੍ਰੀਤਿ in the first position; the source spelling ਪ੍ਰੀਤ remains unchanged, with the shared love sense selected provisionally.'],
  ['I bow to You, the supreme force of fierce resolve.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੂੰ ਪ੍ਰਚੰਡ ਜੋਸ਼ ਦਾ ਵੀ ਪਰਮ ਜੋਸ਼ ਹੈਂ।',
   'Mahan Kosh cites this exact line under martial ardour or ਜੋਸ਼, while also listing anger among the senses of ਰੋਖ. Sant Sewa Singh joins fierce feeling with great ardour; Neki emphasises wrath. The main explanation selects forceful resolve, not uncontrolled personal anger. The praise does not authorise a reader to threaten or harm anyone.'],
  ['I bow to You, the supreme power that draws all creation into dissolution.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਨੂੰ ਸਮੇਟ ਲੈਣ ਵਾਲੀ ਪਰਮ ਸ਼ਕਤੀ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਸੋਖ carries the image of drying or absorption, not the word ਸੁਖ for comfort. The repeated form heightens that image. The selected explanation follows the Punjabi reading of gathering creation into dissolution; Neki retains drought imagery, and the Bhai Vir Singh-derived commentary speaks of drying even dryness. These are related poetic readings, not identical literal glosses.']
]);

deep(68,
  'Song and love stand beside fierce resolve and dissolution. The same repeated-word pattern carries each act of praise, so the gentler images do not exhaust what the passage says about the Divine. The opening song line keeps its earlier meaning; its new neighbours widen the range of the address.',
  'ਗੀਤ ਅਤੇ ਪ੍ਰੀਤ ਦੇ ਨਾਲ ਹੀ ਪ੍ਰਚੰਡ ਜੋਸ਼ ਅਤੇ ਸ੍ਰਿਸ਼ਟੀ ਨੂੰ ਸਮੇਟਣ ਦੀ ਸ਼ਕਤੀ ਦਾ ਜ਼ਿਕਰ ਆਉਂਦਾ ਹੈ। ਹਰ ਤੁਕ ਵਿੱਚ ਸ਼ਬਦ ਦੁਹਰਾਉਣ ਦਾ ਢੰਗ ਨਮਸਕਾਰ ਨੂੰ ਹੋਰ ਡੂੰਘਾ ਕਰਦਾ ਹੈ। ਪ੍ਰਭੂ ਦੀ ਉਸਤਤ ਕੇਵਲ ਕੋਮਲ ਚਿੱਤਰਾਂ ਤੱਕ ਸੀਮਤ ਨਹੀਂ ਰਹਿੰਦੀ। ਗੀਤ ਵਾਲੀ ਪਹਿਲੀ ਤੁਕ ਦਾ ਪਹਿਲਾਂ ਵਾਲਾ ਅਰਥ ਕਾਇਮ ਹੈ; ਇੱਥੇ ਨਾਲ ਦੀਆਂ ਤੁਕਾਂ ਉਸ ਨੂੰ ਹੋਰ ਵਿਆਪਕ ਸੰਦਰਭ ਦਿੰਦੀਆਂ ਹਨ।',
  {
    focus: 'Follow one pattern of praise across love, intensity and dissolution.',
    closeReading: 'All four lines begin with ਨਮੋ and repeat a central word. The pattern places song, love, fierce resolve and drying or absorption in parallel, even though they do not feel alike. First notice the words before trying to smooth away that difference. The song line has already appeared in Chhand 47; repetition allows a familiar image to enter a new relationship. ਰੋਖ can carry martial ardour as well as anger, while ਸੋਖ requires attention to drying and dissolution rather than comfort. Read the last two lines as praise of a power beyond human possession. A useful question is how the continuing act of bowing changes the way that power is approached.',
    words: [
      ['ਨਮੋ', 'I bow; a salutation'],
      ['ਗੀਤ ਗੀਤੇ', 'the essence or supreme depth of song'],
      ['ਪ੍ਰੀਤ ਪ੍ਰੀਤੇ', 'the deepest love; the supreme loving One'],
      ['ਰੋਖ ਰੋਖੇ', 'supreme fierce ardour; wrath is another attested emphasis'],
      ['ਸੋਖ ਸੋਖੇ', 'supreme drying or absorbing power, read here as dissolution']
    ],
    care: 'Divine martial imagery does not make personal rage sacred or give permission for cruelty. The exact ਪ੍ਰੀਤ/ਪ੍ਰੀਤਿ spelling difference remains open for qualified review. Keep the chosen dissolution reading distinct from Neki’s more immediate drought image.',
    reflection: 'When you feel strong resolve, what helps it remain accountable to compassion rather than become a claim to unlimited power?',
    teachBack: 'Name the four repeated images, explain why ਸੋਖ is not ਸੁਖ, and describe how the unchanged song line gains a new setting here.'
  }
);

chhand(69, [
  ['I bow to You, whose all-encompassing reality includes every illness.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਾਰੇ ਰੋਗ ਵੀ ਤੇਰੀ ਸਰਬ-ਵਿਆਪਕ ਹਸਤੀ ਤੋਂ ਬਾਹਰ ਨਹੀਂ ਹਨ।',
   'The Punjabi steeks describe ਸਰਬ ਰੋਗੇ as taking the form of all illness; Neki renders a source of ailments. The main explanation keeps illness within the passage’s universal address without claiming to diagnose why someone is ill. The Bhai Vir Singh-derived page also gives a breaking or removing sense. This is different wording from ਰੋਗ ਹਰਤਾ in Chhand 55 and promises no clinical cure.'],
  ['I bow to You, the One who enjoys all creation.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਨੂੰ ਭੋਗਣ ਵਾਲਾ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਭੋਗੇ turns from the preceding illness image toward enjoyment or experience. Punjabi commentary selects the One who enjoys all; another emphasis is the form of bliss. The explanation preserves this positive enjoyment language rather than making it identical to the freedom from dependence on pleasure described in Chhand 53.'],
  ['I bow to You, the One who prevails over all.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਭ ਨੂੰ ਜਿੱਤਣ ਵਾਲਾ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਸਰਬ ਜੀਤੰ places every finite power within Divine sovereignty. The wording concerns the One addressed in praise. It does not identify a human ruler, army, nation or reader as entitled to conquer other people.'],
  ['I bow to You, whose majesty fills all with awe and fear.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੇਰੀ ਮਹਾਨਤਾ ਸਭ ਦੇ ਅੰਦਰ ਭੈ ਅਤੇ ਅਦਬ ਜਗਾਉਂਦੀ ਹੈ।',
   'ਭੀਤੰ is read here as giving fear, as the Punjabi commentaries state; Neki chooses awe. It is not the fearlessness epithet ਅਭੀਤ encountered elsewhere. Awe and fear retain the recognition of a power greater than oneself without making intimidation by a person a spiritual duty.']
]);

deep(69,
  'Illness, enjoyment, victory and awe are all brought into the same address to the Divine. The passage does not reserve reverence for pleasant experiences alone. Its illness language is devotional, not an explanation of a person’s medical condition or a judgment on their faith; the final two lines keep victory and fear directed toward Divine sovereignty.',
  'ਰੋਗ, ਭੋਗ, ਜਿੱਤ ਅਤੇ ਭੈ—ਚਾਰੋ ਉਸੇ ਪ੍ਰਭੂ ਨੂੰ ਕੀਤੀ ਨਮਸਕਾਰ ਵਿੱਚ ਆਉਂਦੇ ਹਨ। ਉਸਤਤ ਕੇਵਲ ਸੁਖਦਾਈ ਅਨੁਭਵਾਂ ਤੱਕ ਸੀਮਤ ਨਹੀਂ ਰਹਿੰਦੀ। ਰੋਗ ਵਾਲੀ ਤੁਕ ਭਗਤੀ ਦੀ ਬੋਲੀ ਹੈ; ਇਹ ਕਿਸੇ ਦੀ ਬਿਮਾਰੀ ਦਾ ਕਾਰਨ ਨਹੀਂ ਦੱਸਦੀ ਅਤੇ ਨਾ ਉਸ ਦੀ ਸ਼ਰਧਾ ਨੂੰ ਤੋਲਦੀ ਹੈ। ਅਖੀਰ ਦੀਆਂ ਦੋ ਤੁਕਾਂ ਜਿੱਤ ਅਤੇ ਭੈ ਨੂੰ ਪ੍ਰਭੂ ਦੀ ਸਰਬੋਚ ਸੱਤਾ ਨਾਲ ਜੋੜਦੀਆਂ ਹਨ।',
  {
    focus: 'Read the four uses of ਸਰਬ without turning suffering into blame or sovereignty into human entitlement.',
    closeReading: 'The repeated ਸਰਬ gives each line a comprehensive reach. Illness and enjoyment appear side by side, followed by victory and fear. The first word is ਰੋਗੇ, not the earlier phrase ਰੋਗ ਹਰਤਾ, so the explanation must not quietly replace it with a promise of healing. The next line makes room for enjoyment within the same address. The final pair then changes the scale: every apparent victory stands beneath the One, and the sense of awe belongs to that greater sovereignty. Keep each epithet audible in the reading. One can acknowledge suffering in devotional language without claiming to know its medical cause or treating another person’s distress as deserved.',
    words: [
      ['ਸਰਬ', 'all; the repeated comprehensive scope'],
      ['ਰੋਗੇ', 'illness, included within the Divine address in the selected reading'],
      ['ਭੋਗੇ', 'enjoyer of all; enjoyment or experience'],
      ['ਜੀਤੰ', 'prevailing over all; victory'],
      ['ਭੀਤੰ', 'giving fear or inspiring awe']
    ],
    care: 'No line diagnoses illness, promises a cure through recitation or makes illness evidence of weak faith. The passage supplies no medical instruction. Its victory and fear language grants no person permission to dominate or frighten others.',
    reflection: 'How could you remain present with someone’s suffering without offering a spiritual explanation for why it happened?',
    teachBack: 'Explain all four epithets, distinguish ਰੋਗੇ from ਰੋਗ ਹਰਤਾ, and say why ਭੀਤੰ here should not be translated as fearlessness.'
  }
);

chhand(70, [
  ['I bow to You, the source and fullness of all knowledge.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਾਰੇ ਗਿਆਨ ਦਾ ਪੂਰਾ ਆਧਾਰ ਅਤੇ ਸਰੋਤ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਸਰਬ ਗਿਆਨੰ praises comprehensive knowledge. The Punjabi witnesses describe the Divine as knowledge itself or as its giver; the main explanation brings those close emphases together. It does not claim that any learner, teacher or institution possesses complete knowledge.'],
  ['I bow to You, the supreme strength.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਭ ਤੋਂ ਉੱਚੀ ਸ਼ਕਤੀ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਤਾਨ is selected in its strength sense here, following the Punjabi steeks and the Bhai Vir Singh-derived explanation. Bhai Maya Singh’s dictionary also lists power under ਤਾਨ. This differs from the musical ਤਾਨ ਤਾਨੇ beside song in Chhand 47. Neki’s all-attracting reading remains a separate alternative; it is not silently substituted for the selected strength sense.'],
  ['I bow to You, the source and substance of every mantra.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਮੰਤਰ ਦਾ ਮੂਲ ਅਤੇ ਸਾਰ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਮੰਤ੍ਰੰ brings the vocabulary of sacred utterance, spiritual instruction or formula into the praise of the One. The Punjabi steeks retain the all-mantra form, while the Bhai Vir Singh-derived commentary stresses knowledge and devotional utterance. The line gives no formula for controlling events, curing illness or gaining power over anyone.'],
  ['I bow to You, the power at work through every instrument and means.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰ ਜੰਤਰ ਅਤੇ ਸਾਧਨ ਦੇ ਪਿੱਛੇ ਕੰਮ ਕਰਨ ਵਾਲੀ ਸ਼ਕਤੀ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਜੰਤ੍ਰੰ is kept distinct from the preceding spoken or taught ਮੰਤ੍ਰੰ. Mahan Kosh includes instruments, devices and ritual uses within ਜੰਤ੍ਰ. The selected means-related explanation follows the Bhai Vir Singh-derived account, alongside the Punjabi steeks’ all-jantra wording. Neki emphasises spells. Naming that historical vocabulary does not establish magical effects or make a technique capable of possessing the Divine.']
]);

deep(70,
  'The stanza brings knowledge, supreme strength, sacred utterance and instruments or means into one act of bowing. Similar words need careful attention to their neighbours: ਤਾਨ here is read as strength, while the earlier musical passage used melody. The address honours the source of wisdom and capacity without promising control through a formula or device.',
  'ਇਹ ਛੰਦ ਗਿਆਨ, ਪਰਮ ਸ਼ਕਤੀ, ਮੰਤਰ ਅਤੇ ਜੰਤਰ ਨੂੰ ਇੱਕੋ ਨਮਸਕਾਰ ਵਿੱਚ ਲਿਆਉਂਦਾ ਹੈ। ਮਿਲਦੇ ਸ਼ਬਦਾਂ ਦੇ ਅਰਥ ਨਾਲ ਦੀਆਂ ਤੁਕਾਂ ਵੱਲ ਧਿਆਨ ਦੇ ਕੇ ਸਮਝਣੇ ਪੈਂਦੇ ਹਨ: ਇੱਥੇ ਤਾਨ ਦਾ ਅਰਥ ਬਲ ਚੁਣਿਆ ਗਿਆ ਹੈ, ਜਦਕਿ ਪਹਿਲੇ ਸੰਗੀਤਕ ਸੰਦਰਭ ਵਿੱਚ ਤਾਨ ਸੁਰਾਂ ਦੀ ਲਹਿਰ ਸੀ। ਉਸਤਤ ਗਿਆਨ ਅਤੇ ਸਮਰੱਥਾ ਦੇ ਮੂਲ ਵੱਲ ਹੈ; ਕੋਈ ਮੰਤਰ ਜਾਂ ਜੰਤਰ ਵਰਤ ਕੇ ਮਨਚਾਹਾ ਨਤੀਜਾ ਲੈਣ ਦਾ ਵਾਅਦਾ ਨਹੀਂ ਹੈ।',
  {
    focus: 'Distinguish knowledge, strength, utterance and means without turning praise into a technique.',
    closeReading: 'The first two lines place comprehensive knowledge beside supreme strength. The next two name forms through which people may seek understanding or effective action: mantra and jantra. Their neighbouring position matters, but it does not make them one word. A mantra involves utterance or teaching; a jantra can be an instrument, device or ritual means. The repeated ਨਮੋ directs attention toward the One being honoured through all four descriptions. Compare ਤਾਨ here with the musical sequence in Chhand 47: a word can have more than one established sense, and the same English gloss should not be carried between passages merely because the spelling matches. The strength reading is selected, with the differing attraction reading still visible.',
    words: [
      ['ਸਰਬ ਗਿਆਨੰ', 'all knowledge; its fullness or source'],
      ['ਪਰਮ ਤਾਨੰ', 'supreme strength, in the selected contextual reading'],
      ['ਮੰਤ੍ਰੰ', 'sacred utterance, instruction or formula'],
      ['ਜੰਤ੍ਰੰ', 'instrument, device or means; ritual senses also occur']
    ],
    care: 'These lines do not offer a magical procedure or guarantee an outcome from repetition or a device. Preserve the difference between the strength sense of ਤਾਨ here and its musical use earlier. The dictionary’s different attributions and Neki’s alternative reading are documented for further review.',
    reflection: 'Where might confidence in your knowledge or tools become a wish to control what cannot be controlled?',
    teachBack: 'Explain the four epithets separately, give the contextual reason for the strength reading of ਤਾਨ, and distinguish a mantra from a jantra.'
  }
);

chhand(71, [
  ['I bow to You, who behold all.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੂੰ ਸਭ ਨੂੰ ਵੇਖਦਾ ਅਤੇ ਜਾਣਦਾ ਹੈਂ।',
   'ਦ੍ਰਿੱਸੰ is explained by the Punjabi steeks as seeing all; the Bhai Vir Singh-derived page adds the sense of looking after all. The devotional image expresses comprehensive awareness. It is not a statement that a person with physical sight has greater spiritual worth than someone without it.'],
  ['I bow to You, who draw all toward Yourself.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਸਭ ਨੂੰ ਆਪਣੇ ਵੱਲ ਖਿੱਚਣ ਵਾਲਾ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਕ੍ਰਿੱਸੰ is read as drawing or attracting all, supported by both Punjabi steeks and the Bhai Vir Singh-derived commentary. Neki instead uses supreme power. The main explanation selects attraction without constructing an unsupported word origin or replacing the source epithet with a different proper name.'],
  ['I bow to You, present through every colour and delight.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਤੂੰ ਸਾਰੇ ਰੰਗਾਂ ਵਿੱਚ ਵਿਆਪਕ ਅਤੇ ਅਨੰਦ ਦਾ ਸਰੂਪ ਹੈਂ।',
   'ਰੰਗੇ allows the Punjabi commentaries to speak both of the many colours of creation and of delight or bliss. The explanation keeps those related images together. Divine presence across variety is not a ranking of human complexions, bodies or ways of perceiving colour.'],
  ['You are the bodiless One who brings the three worlds to their end.',
   'ਹੇ ਨਿਰੰਕਾਰ, ਤੂੰ ਤਿੰਨਾਂ ਲੋਕਾਂ ਦਾ ਅੰਤ ਕਰਨ ਵਾਲਾ ਹੈਂ ਅਤੇ ਆਪ ਕਿਸੇ ਸਰੀਰ ਵਿੱਚ ਬੱਝਿਆ ਨਹੀਂ।',
   'Both epithets matter. The Punjabi steeks select dissolution of the three worlds for ਤ੍ਰਿਭੰਗੀ and freedom from a bodily limit for ਅਨੰਗੇ. Mahan Kosh cites this exact phrase under a different three-guna reading, involving sattva, rajas and tamas. That alternative remains distinct. Its separate entries about a triple-bent posture or a metre should not automatically replace this contextual reading.']
]);

deep(71,
  'The One who sees all, draws all and is present through every colour is also beyond a bodily limit. The final line holds two epithets together: in the selected Punjabi reading, the three worlds pass away through Divine power, while the Divine is not confined to a form. A different classic dictionary reading of ਤ੍ਰਿਭੰਗੀ is kept visible.',
  'ਸਭ ਨੂੰ ਵੇਖਣ ਵਾਲਾ, ਸਭ ਨੂੰ ਆਪਣੇ ਵੱਲ ਖਿੱਚਣ ਵਾਲਾ ਅਤੇ ਸਾਰੇ ਰੰਗਾਂ ਵਿੱਚ ਵਿਆਪਕ ਪ੍ਰਭੂ ਆਪ ਸਰੀਰ ਦੀ ਹੱਦ ਵਿੱਚ ਬੱਝਿਆ ਨਹੀਂ। ਅਖੀਰ ਦੀ ਤੁਕ ਦੇ ਦੋਵੇਂ ਵਿਸ਼ੇਸ਼ਣ ਜ਼ਰੂਰੀ ਹਨ। ਚੁਣੇ ਪੰਜਾਬੀ ਅਰਥ ਅਨੁਸਾਰ ਤਿੰਨਾਂ ਲੋਕਾਂ ਦਾ ਅੰਤ ਵੀ ਉਸ ਦੀ ਸ਼ਕਤੀ ਵਿੱਚ ਹੈ, ਪਰ ਉਹ ਆਪ ਨਿਰੰਕਾਰ ਹੈ। ਤ੍ਰਿਭੰਗੀ ਦਾ ਮਹਾਨ ਕੋਸ਼ ਵਿੱਚ ਦਿੱਤਾ ਤਿੰਨ ਗੁਣਾਂ ਵਾਲਾ ਵੱਖਰਾ ਅਰਥ ਵੀ ਵਿਚਾਰ ਲਈ ਖੁੱਲ੍ਹਾ ਰੱਖਿਆ ਗਿਆ ਹੈ।',
  {
    focus: 'Hold universal presence and freedom from bodily limits together, keeping both words of the last line.',
    closeReading: 'The first three lines repeat ਸਰਬ: all are seen, all are drawn, and every colour or delight belongs within the address. The fourth line changes the pattern and gives two descriptions without another ਨਮੋ. Do not let the absence of a new salutation cause ਅਨੰਗੇ to disappear from the explanation. In the selected reading, ਤ੍ਰਿਭੰਗੀ concerns the ending of the three worlds, whereas ਅਨੰਗੇ concerns the absence of a bodily limit. These are different claims. Their position after the images of seeing, attraction and colour allows the reader to consider Divine presence without restricting the One to the particular forms through which that presence has been praised.',
    words: [
      ['ਦ੍ਰਿੱਸੰ', 'seeing or beholding all'],
      ['ਕ੍ਰਿੱਸੰ', 'drawing or attracting all, in the selected reading'],
      ['ਰੰਗੇ', 'colours and delight'],
      ['ਤ੍ਰਿਭੰਗੀ', 'dissolver of the three worlds in these Punjabi steeks; a three-guna reading also exists'],
      ['ਅਨੰਗੇ', 'without a bodily limit; formless']
    ],
    care: 'The main ਤ੍ਰਿਭੰਗੀ reading is provisional because Mahan Kosh gives a distinct, specifically cited interpretation. The three-world image is traditional cosmological language, not permission to destroy people or places. Sight and colour imagery do not measure a person’s spiritual capacity or worth.',
    reflection: 'What changes when you attend to another person as someone fully known to the Divine, beyond the features you can perceive?',
    teachBack: 'Explain every epithet and give both parts of the final line. Name the three-guna alternative without confusing it with the selected three-world reading.'
  }
);

chhand(72, [
  ['I bow to You, the life within every living being.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰੇਕ ਜੀਵ ਦੇ ਜੀਵਨ ਦਾ ਆਧਾਰ ਤੂੰ ਹੀ ਹੈਂ।',
   'ਜੀਵ ਜੀਵੰ repeats the language of life to praise its deepest source. Punjabi commentary describes life given to beings; the repeated-noun form also supports life of lives. The line does not divide people into those with more or less spiritual value because of their physical condition.'],
  ['I bow to You, the source from which every seed receives life.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਹਰੇਕ ਬੀਜ ਵਿੱਚ ਉੱਗਣ ਦੀ ਸਮਰੱਥਾ ਤੇਰੇ ਤੋਂ ਹੈ।',
   'ਬੀਜ ਬੀਜੇ shifts the image from living beings to their beginning or potential. The Punjabi witnesses speak of the cause beneath causes or the power through which seeds sprout. This is an image of originating life, not an agricultural instruction or a promise that every planted seed must grow.'],
  ['You are never provoked into irritation and remain free of attachment.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਖਿਝਦਾ ਨਹੀਂ ਅਤੇ ਮੋਹ ਵਿੱਚ ਨਹੀਂ ਭਿੱਜਦਾ।',
   'ਅਖਿੱਜੇ and ਅਭਿੱਜੇ are kept separate. The main reading follows the untroubled and unattached emphasis, alongside Punjabi explanations of not being irritated or emotionally swayed. Mahan Kosh’s ਅਭਿਜ entry cites this Jaap phrase under a fully knowing sense through its ਅਭਿਗ cross-reference; the Bhai Vir Singh-derived page instead gives undivided wholeness. These alternatives need qualified review and should not be merged into one literal gloss.'],
  ['You are gracious and compassionate toward all.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਮਿਹਰ ਅਤੇ ਦਇਆ ਸਭ ਲਈ ਹੈ।',
   'ਸਮਸਤੰ keeps the reach universal. ਪ੍ਰਸਿੱਜੇ is explained as being gracious, pleased or compassionate toward all. Read this beside the preceding freedom from agitation or attachment: the pair does not require a picture of an indifferent Divine. Compassion is explicitly present in the line.']
]);

deep(72,
  'The imagery moves from life and seed to a freedom from irritation or attachment that stands beside compassion for all. The two closing lines need to be read together. In the selected interpretation, steadiness does not mean absence of care; alternative readings of ਅਭਿੱਜੇ remain open, including the classic dictionary’s knowledge-related sense.',
  'ਜੀਵਨ ਅਤੇ ਬੀਜ ਦੇ ਚਿੱਤਰਾਂ ਤੋਂ ਛੰਦ ਖਿਝ ਅਤੇ ਮੋਹ ਤੋਂ ਰਹਿਤ ਅਵਸਥਾ ਵੱਲ ਵਧਦਾ ਹੈ, ਅਤੇ ਨਾਲ ਹੀ ਸਭ ਲਈ ਦਇਆ ਕਹਿੰਦਾ ਹੈ। ਅਖੀਰ ਦੀਆਂ ਦੋ ਤੁਕਾਂ ਨੂੰ ਇਕੱਠੇ ਪੜ੍ਹਨਾ ਜ਼ਰੂਰੀ ਹੈ। ਚੁਣੇ ਅਰਥ ਵਿੱਚ ਅਡੋਲਤਾ ਦਾ ਮਤਲਬ ਬੇਪਰਵਾਹੀ ਨਹੀਂ। ਅਭਿੱਜੇ ਦੇ ਹੋਰ ਅਰਥ ਵੀ ਵਿਚਾਰ ਅਧੀਨ ਹਨ; ਮਹਾਨ ਕੋਸ਼ ਇਸੇ ਤੁਕ ਦੇ ਹਵਾਲੇ ਨਾਲ ਪੂਰੀ ਤਰ੍ਹਾਂ ਜਾਣਨ ਵਾਲੇ ਦਾ ਅਰਥ ਵੀ ਦਿੰਦਾ ਹੈ।',
  {
    focus: 'Read freedom from agitation alongside the explicit compassion of the final line.',
    closeReading: 'The opening pair addresses the source of living beings and of seeds. The repeated ਜੀਵ and ਬੀਜ ask the attention to move beyond an individual example toward the ground of life itself. The closing pair shifts from these images to qualities of the One addressed. ਅਖਿੱਜੇ concerns not being provoked; ਅਭਿੱਜੇ is more disputed and is provisionally read through freedom from attachment. The next words, ਸਮਸਤੰ ਪ੍ਰਸਿੱਜੇ, immediately speak of graciousness toward all. Keep that neighbour in view rather than turning a difficult word into a claim that care is absent. The stanza offers a place to reflect on steady compassion without pretending that all scholarly readings of the vocabulary agree.',
    words: [
      ['ਜੀਵ ਜੀਵੰ', 'the life or source of every living being'],
      ['ਬੀਜ ਬੀਜੇ', 'seed of seeds; the originating power of life'],
      ['ਅਖਿੱਜੇ', 'not irritated or provoked'],
      ['ਅਭਿੱਜੇ', 'unattached in the selected reading; fully knowing and undivided are distinct alternatives'],
      ['ਸਮਸਤੰ ਪ੍ਰਸਿੱਜੇ', 'gracious or compassionate toward all']
    ],
    care: 'Do not use this passage to demand emotional numbness or to dismiss suffering. The compassion of the final line is explicit. Another consulted text groups the first two lines together; that punctuation difference leaves the lexical sequence intact. The substantive ਅਭਿੱਜੇ alternatives remain unresolved.',
    reflection: 'Can you recall a way of caring for someone that stayed steady without being driven by irritation or a wish to control them?',
    teachBack: 'Explain the life and seed images, keep ਅਖਿੱਜੇ distinct from ਅਭਿੱਜੇ, and show how the final line prevents an interpretation of simple indifference.'
  }
);

chhand(73, [
  ['You are compassion itself.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਕਿਰਪਾ ਦਾ ਸਰੂਪ ਹੈਂ।',
   'ਕ੍ਰਿਪਾਲੰ ਸਰੂਪੇ describes compassion as central to the One being addressed. It continues the graciousness toward all at the end of the previous chhand. The language of ਸਰੂਪ here names a quality rather than assigning the Divine a fixed physical body.'],
  ['You bring wrongdoing to an end.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਮੰਦੇ ਕਰਮਾਂ ਦਾ ਨਾਸ ਕਰਨ ਵਾਲਾ ਹੈਂ।',
   'ਕੁਕਰਮੰ names harmful or wrongful actions, and ਪ੍ਰਣਾਸੀ names their ending. The object of the phrase is wrongdoing, not a category of people to be attacked. Beside compassion, the line allows ethical change to be taken seriously without turning it into a warrant for revenge.'],
  ['All abundance and spiritual powers have their lasting home in You, always and everywhere.',
   'ਹੇ ਪ੍ਰਭੂ, ਰਿੱਧੀਆਂ ਅਤੇ ਸਿੱਧੀਆਂ—ਸੰਪਦਾ ਤੇ ਆਤਮਕ ਸ਼ਕਤੀਆਂ—ਸਦਾ ਤੇ ਹਰ ਥਾਂ ਤੇਰੇ ਵਿੱਚ ਟਿਕੀਆਂ ਹਨ।',
   'The whole long line matters: ਸਦਾ ਸਰਬਦਾ stresses abiding presence, ਰਿਧਿ ਸਿਧੰ names abundance and attainments or extraordinary powers, and ਨਿਵਾਸੀ supplies the dwelling image. Punjabi commentary also brings out presence in every place. The traditional powers are named as dependent on the Divine, not as results promised to a reader; no wealth, miracle or occult ability is guaranteed.']
]);

deep(73,
  'Compassion, the ending of wrongdoing, and the abiding source of abundance and spiritual powers are held together. The longer third line needs room for each part of its meaning: always, all places, riddhi, siddhi and dwelling. The passage directs reverence toward the One in whom these powers rest, without offering them as rewards for completing a practice.',
  'ਕਿਰਪਾ, ਮੰਦੇ ਕਰਮਾਂ ਦਾ ਨਾਸ ਅਤੇ ਰਿੱਧੀਆਂ-ਸਿੱਧੀਆਂ ਦਾ ਸਦੀਵੀ ਆਧਾਰ—ਇਹ ਤਿੰਨੇ ਵਿਚਾਰ ਇਕੱਠੇ ਆਉਂਦੇ ਹਨ। ਲੰਮੀ ਤੀਜੀ ਤੁਕ ਵਿੱਚ ਸਦਾ, ਹਰ ਥਾਂ, ਰਿੱਧੀ, ਸਿੱਧੀ ਅਤੇ ਨਿਵਾਸ ਦੇ ਸਾਰੇ ਭਾਵਾਂ ਲਈ ਥਾਂ ਦੇਣੀ ਚਾਹੀਦੀ ਹੈ। ਉਸਤਤ ਉਸ ਪ੍ਰਭੂ ਵੱਲ ਹੈ ਜਿਸ ਵਿੱਚ ਇਹ ਸਮਰੱਥਾਵਾਂ ਟਿਕੀਆਂ ਹਨ; ਕੋਈ ਅਭਿਆਸ ਪੂਰਾ ਕਰਨ ਬਦਲੇ ਧਨ ਜਾਂ ਅਲੌਕਿਕ ਸ਼ਕਤੀ ਮਿਲਣ ਦਾ ਵਾਅਦਾ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।',
  {
    focus: 'Keep compassion, ethical change and the long dwelling image connected.',
    closeReading: 'The source presents two short lines followed by one longer line. The first speaks of a compassionate nature; the second names wrongful actions as what is ended. Neither should be swallowed by the third line’s striking vocabulary of riddhi and siddhi. In that final line, ਸਦਾ ਸਰਬਦਾ establishes continuity, and ਨਿਵਾਸੀ gives abundance and attainment an abiding home. Punjabi explanations also express this presence across places. Read the line slowly enough to retain those relations rather than reducing it to a list of supernatural powers. The order matters for reflection: the discussion of power comes after compassion and the ending of wrongdoing, not as an independent invitation to acquire impressive abilities.',
    words: [
      ['ਕ੍ਰਿਪਾਲੰ ਸਰੂਪੇ', 'compassionate in nature; compassion itself'],
      ['ਕੁਕਰਮੰ', 'wrongful or harmful actions'],
      ['ਪ੍ਰਣਾਸੀ', 'bringing to an end'],
      ['ਸਦਾ ਸਰਬਦਾ', 'always and abidingly; the selected Punjabi explanation also brings out every place'],
      ['ਰਿਧਿ', 'abundance or prosperity; also part of traditional extraordinary-power vocabulary'],
      ['ਸਿਧੰ', 'attainments or siddhis, including powers described in spiritual traditions'],
      ['ਨਿਵਾਸੀ', 'dwelling; having an abiding home']
    ],
    care: 'The passage names traditional powers without proving them or promising their acquisition. Ending wrongdoing is not permission to harm people, and a devotional practice does not erase responsibility to repair harm. Another consulted text joins the opening two lines; the source’s three-line form is preserved.',
    reflection: 'What would make the wish for ability or success accountable to compassion and the repair of wrongdoing?',
    teachBack: 'Explain all three lines and every major phrase of the long third line. Say why naming riddhi and siddhi is different from promising them to a reader.'
  }
);

chhand(74, [
  ['Your deeds are deathless.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੇ ਕਰਮ ਅਮਰ ਹਨ।',
   'ਅੰਮ੍ਰਿੱਤ ਕਰਮੇ is provisionally read as deathless deeds, following the Punjabi chapter and the Bhai Vir Singh-derived explanation. Sant Sewa Singh stresses making immortal, while Neki uses nectar-like deeds. The image concerns the character of Divine action; it is not a promise that a human body will avoid death or that created forms never change.'],
  ['Your dharam is unbroken and unobstructed.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰਾ ਧਰਮ ਅਖੰਡ ਹੈ; ਉਸ ਵਿੱਚ ਕੋਈ ਰੁਕਾਵਟ ਜਾਂ ਟੁੱਟ ਨਹੀਂ ਹੈ।',
   'The source says ਅੰਬ੍ਰਿਤ, and that spelling is retained. Mahan Kosh specifically cites ਅੰਬ੍ਰਿਤ ਧਰਮੇ under unobstructed and unbroken, a sense supported by the Punjabi steeks. Its separate cross-reference to ਅਮ੍ਰਿਤ is not a reason to make these two neighbouring epithets identical or to rewrite the original word.'],
  ['You are joined with the whole of creation.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਨਾਲ ਇੱਕਮਿੱਕ ਹੈਂ।',
   'The source reads ਅਖੱਲ ਜੋਗੇ; another consulted text reads ਅਖਿਲ ਜੋਗੇ. The selected all-inclusive union follows the Punjabi steeks and the dictionary’s ਅਖਲ/ਅਖਿਲ sense of all or whole. The Bhai Vir Singh-derived main wording instead stresses unwavering union, while its note also gives union with everyone. The choice remains provisional; the source word is not normalised.'],
  ['Your store of sustenance is unfailing.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੇ ਭੰਡਾਰੇ ਅਟੱਲ ਹਨ ਅਤੇ ਕਦੇ ਮੁੱਕਦੇ ਨਹੀਂ।',
   'The selected ਭੋਗੇ reading concerns unfailing provision: the Punjabi steeks describe enduring supplies or stores. Other consulted explanations emphasise enduring enjoyment or bliss, and Neki uses enduring rule. These are retained as alternatives rather than combined into one literal definition. The devotional image does not promise a person unlimited possessions.']
]);

deep(74,
  'The Charpat heading introduces four compact descriptions: deathless deeds, unbroken dharam, union with all, and unfailing provision. Similar sounds do not make ਅੰਮ੍ਰਿੱਤ and ਅੰਬ੍ਰਿਤ the same word in this reading. The selected explanation preserves both source spellings and keeps the disputed ਅਖੱਲ/ਅਖਿਲ reading open for qualified review.',
  'ਚਰਪਟ ਛੰਦ ਦੇ ਸਿਰਲੇਖ ਤੋਂ ਬਾਅਦ ਚਾਰ ਛੋਟੇ ਵਰਣਨ ਆਉਂਦੇ ਹਨ: ਅਮਰ ਕਰਮ, ਅਖੰਡ ਧਰਮ, ਸਭ ਨਾਲ ਜੋੜ ਅਤੇ ਅਮੁੱਕ ਭੰਡਾਰੇ। ਸੁਣਨ ਵਿੱਚ ਮਿਲਦੇ ਹੋਣ ਦੇ ਬਾਵਜੂਦ ਇਸ ਅਰਥ ਵਿੱਚ ਅੰਮ੍ਰਿੱਤ ਅਤੇ ਅੰਬ੍ਰਿਤ ਨੂੰ ਇੱਕੋ ਸ਼ਬਦ ਨਹੀਂ ਮੰਨਿਆ ਗਿਆ। ਦੋਵੇਂ ਮੂਲ ਸ਼ਬਦ ਜਿਉਂ ਦੇ ਤਿਉਂ ਹਨ। ਅਖੱਲ ਅਤੇ ਅਖਿਲ ਵਾਲਾ ਪਾਠ-ਫ਼ਰਕ ਯੋਗ ਸਮੀਖਿਆ ਲਈ ਖੁੱਲ੍ਹਾ ਰੱਖਿਆ ਗਿਆ ਹੈ।',
  {
    focus: 'Hear the compact Charpat form while preserving four distinct descriptions.',
    closeReading: 'The heading names ਚਰਪਟ ਛੰਦ and invokes grace through ਤ੍ਵ ਪ੍ਰਸਾਦਿ. Four short descriptions follow, without a new ਨਮੋ before each one. Their sound pairs invite comparison: ਕਰਮੇ with ਧਰਮੇ, and ਜੋਗੇ with ਭੋਗੇ. Yet sound alone cannot decide meaning. The first ਅੰਮ੍ਰਿੱਤ is read through deathlessness, while the next ਅੰਬ੍ਰਿਤ has specific dictionary support for unobstructed continuity. The final pair is selected through union with all and enduring provision. Notice how much meaning is carried by these brief phrases. A slower reading can keep their relationships clear without supplying an unverified pronunciation rule or pretending that all the consulted explanations agree.',
    words: [
      ['ਅੰਮ੍ਰਿੱਤ ਕਰਮੇ', 'deathless deeds, in the selected reading'],
      ['ਅੰਬ੍ਰਿਤ ਧਰਮੇ', 'unobstructed, unbroken dharam'],
      ['ਅਖੱਲ ਜੋਗੇ', 'joined with all, provisionally; unwavering union is another reading'],
      ['ਅਚੱਲ ਭੋਗੇ', 'unfailing provision in the selected reading; enduring enjoyment is an alternative']
    ],
    care: 'The heading is kept separate from the four lines. Source differences include ਅਖੱਲ/ਅਖਿਲ, additional consonant marks and heading spacing; these still need qualified review. The reading of ਅੰਬ੍ਰਿਤ is independently supported and must not be silently changed to ਅੰਮ੍ਰਿੱਤ. Deathlessness here guarantees neither physical immortality nor protection from illness.',
    reflection: 'Which of the four descriptions becomes clearer when you pause between the similar-sounding words instead of treating them as repetitions?',
    teachBack: 'Name the new metre, distinguish ਅੰਮ੍ਰਿੱਤ from ਅੰਬ੍ਰਿਤ in this reading, explain the selected meanings of ਜੋਗੇ and ਭੋਗੇ, and identify the unresolved ਅਖੱਲ/ਅਖਿਲ difference.'
  }
);

chhand(75, [
  ['Your sovereignty is unshakable.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰਾ ਰਾਜ ਅਡੋਲ ਹੈ।',
   'ਅਚੱਲ ਰਾਜੇ describes enduring Divine rule. The line addresses the One, not a historical regime or a claim that human rulers should never be questioned. The source’s doubled consonant spelling is retained although another consulted text prints ਅਚਲ.'],
  ['Your creative power is steadfast.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੀ ਸਿਰਜਣ ਵਾਲੀ ਸ਼ਕਤੀ ਅਟੱਲ ਹੈ।',
   'ਸਾਜੇ is read through creation or the power to bring things into being. Punjabi commentary distinguishes steadfast creative power from the preceding sovereignty. ਅਟੱਲ does not require the claim that every created object or arrangement stays unchanged forever.'],
  ['Your dharam is universal.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰਾ ਧਰਮ ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਵਿੱਚ ਵਿਆਪਕ ਹੈ।',
   'The selected reading follows the Punjabi explanation of universal dharam and the dictionary’s all-or-whole sense for ਅਖਲ. Another Punjabi witness and the Bhai Vir Singh-derived page speak of all dharams; Neki emphasises unhindered laws. The source ਅਖੱਲ is preserved. This breadth does not declare every human custom equally wise or erase differences among religious traditions.'],
  ['Your deeds cannot be fully traced or fathomed.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੇ ਕਰਮਾਂ ਦਾ ਪੂਰਾ ਭੇਤ ਮਨੁੱਖੀ ਸਮਝ ਵਿੱਚ ਨਹੀਂ ਆਉਂਦਾ।',
   'ਅਲੱਖ ਕਰਮੰ places Divine action beyond complete perception or comprehension. The Punjabi witnesses include unseen deeds and wondrous activity; the other consulted readings stress what cannot be fully known. Humility about understanding is not a reason to stop asking responsible questions about human actions.']
]);

deep(75,
  'Unshakable sovereignty is followed by steadfast creative power, universal dharam and deeds beyond complete understanding. The first three descriptions give the address a sense of steadiness and breadth; the last keeps human understanding from claiming to contain it. The lesson concerns Divine qualities, not permanent authority for a person or institution.',
  'ਅਡੋਲ ਰਾਜ ਦੇ ਨਾਲ ਅਟੱਲ ਸਿਰਜਣ-ਸ਼ਕਤੀ, ਸਰਬ-ਵਿਆਪਕ ਧਰਮ ਅਤੇ ਪੂਰੀ ਸਮਝ ਤੋਂ ਪਰੇ ਕਰਮਾਂ ਦੀ ਉਸਤਤ ਹੈ। ਪਹਿਲੇ ਤਿੰਨ ਵਰਣਨ ਅਡੋਲਤਾ ਅਤੇ ਵਿਆਪਕਤਾ ਵੱਲ ਧਿਆਨ ਲੈ ਜਾਂਦੇ ਹਨ; ਅਖੀਰਲੀ ਤੁਕ ਮਨੁੱਖੀ ਸਮਝ ਦੀ ਹੱਦ ਯਾਦ ਕਰਵਾਉਂਦੀ ਹੈ। ਇਹ ਗੁਣ ਪ੍ਰਭੂ ਦੇ ਹਨ; ਕਿਸੇ ਮਨੁੱਖ ਜਾਂ ਸੰਸਥਾ ਨੂੰ ਸਦਾ ਲਈ ਬੇਸਵਾਲ ਅਧਿਕਾਰ ਦੇਣ ਦਾ ਬਿਆਨ ਨਹੀਂ ਹੈ।',
  {
    focus: 'Distinguish sovereignty, creation, dharam and the limits of human comprehension.',
    closeReading: 'The compact Charpat form continues, with ਰਾਜੇ and ਸਾਜੇ followed by ਧਰਮੰ and ਕਰਮੰ. The first pair relates enduring sovereignty to the act or power of creation. The second adds universal dharam and action that cannot be completely fathomed. They should not be reduced to four versions of the same idea. In particular, ਅਖੱਲ is selected through the attested all-or-whole sense, whereas ਅਲੱਖ concerns what cannot be fully perceived. The sound resemblance makes careful attention useful. The last line also qualifies the learner’s confidence: a short explanation can offer a path into the words without claiming to have exhausted what they praise.',
    words: [
      ['ਅਚੱਲ ਰਾਜੇ', 'unshakable sovereignty'],
      ['ਅਟੱਲ ਸਾਜੇ', 'steadfast creative power'],
      ['ਅਖੱਲ ਧਰਮੰ', 'universal dharam, in the selected reading'],
      ['ਅਲੱਖ ਕਰਮੰ', 'deeds beyond complete perception or understanding']
    ],
    care: 'Another consulted text omits the doubled consonant marks in these four phrases; the source spellings remain unchanged. The universal-dharam reading and Neki’s unhindered-law emphasis are kept distinct. Divine sovereignty or mystery must not be used to shield human power from accountability.',
    reflection: 'Where can steadiness of commitment coexist with an honest admission that you do not fully understand?',
    teachBack: 'Explain the four descriptions separately and distinguish ਅਖੱਲ from ਅਲੱਖ. Describe why enduring creative power does not mean every created form is permanent.'
  }
);

if (jaap68to75Lines.length !== 31 || jaap68to75Deep.length !== 8) throw new Error('Incomplete Jaap 68–75 draft coverage');
