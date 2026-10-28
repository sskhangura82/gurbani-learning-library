/* Jaap Sahib Chhands 38–45: original educational paraphrase drafts.
 * Exact original text, line IDs and hashes remain in nitnem/data/jaap.json.
 * Research and unresolved lexical alternatives are recorded separately in
 * jaap-chhands38-45-research.json. These notes do not grant source approval,
 * qualified translation status, santhiya authority or publication clearance.
 * The Bhujang Prayat heading before 44 remains separate from the 32 lines.
 */

export const jaap38to45Lines = [];
export const jaap38to45Deep = [];

function chhand(n, rows) {
  if (n < 38 || n > 45 || rows.length !== 4) throw new Error('Invalid Jaap 38–45 draft unit');
  const unitId = 'jaap' + String(n).padStart(3, '0');
  rows.forEach(([simpleEn, simplePa, nuance], index) => {
    if (!simpleEn || !simplePa || !nuance) throw new Error('Incomplete bilingual line: ' + unitId);
    jaap38to45Lines.push({
      bani: 'jaap', lineId: unitId + '.line' + String(index + 1).padStart(2, '0'),
      simpleEn, simplePa, nuance,
      meaningKind: 'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
      editorialStatus: 'DRAFT_AI_UNREVIEWED', humanReviewed: false
    });
  });
}

function deep(n, simpleEn, simplePa, study) {
  jaap38to45Deep.push({
    bani: 'jaap', unitId: 'jaap' + String(n).padStart(3, '0'), simpleEn, simplePa,
    study, editorialStatus: 'DRAFT_AI_UNREVIEWED', humanReviewed: false
  });
}

chhand(38, [
  ['You are the One addressed as Allah, worthy of devoted reverence.',
   'ਹੇ ਪ੍ਰਭੂ, ਅਲਾਹ ਕਹਿ ਕੇ ਵੀ ਤੈਨੂੰ ਹੀ ਆਦਰ ਨਾਲ ਯਾਦ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।',
   'ਅਲਾਹ is read as the Divine name Allah, as in Neki and the Bhai Vir Singh commentary. Other Punjabi explanations connect it with freedom from gain or with being beyond attainment. These readings are distinct; the selected Divine-name sense does not change the frozen spelling.'],
  ['You are not confined to any particular place or dwelling.',
   'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਇੱਕ ਥਾਂ ਜਾਂ ਟਿਕਾਣਾ ਤੇਰੀ ਹੋਂਦ ਨੂੰ ਸੀਮਤ ਨਹੀਂ ਕਰਦਾ।',
   'ਅਜਾਹ is read as without a fixed location, supported by Neki and the Rampur Khera steek. Another commentary uses glory and unveiled imagery; that alternative is recorded for specialist review, without asserting a settled etymology.'],
  ['You are without end; no boundary brings Your being to a close.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਬੇਅੰਤ ਹੈਂ; ਤੇਰੀ ਹੋਂਦ ਦਾ ਕੋਈ ਅੰਤ ਨਹੀਂ।',
   'ਅਨੰਤ names endlessness. The devotional claim is not a measurable estimate of physical size or a statement about the reader’s own lifespan.'],
  ['You are supreme in greatness, beyond every ordinary comparison.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਭ ਤੋਂ ਮਹਾਨ ਹੈਂ; ਆਮ ਤੁਲਨਾਵਾਂ ਤੇਰੀ ਵਡਿਆਈ ਨਹੀਂ ਸਮੇਟ ਸਕਦੀਆਂ।',
   'ਮਹੰਤ means supremely great in this address. The contextual sense should be distinguished from the title used for the head of a religious institution.']
]);

deep(38,
  'A Divine name is followed by freedom from a fixed location, endlessness and supreme greatness. In the selected reading, Allah addresses the same One throughout the stanza; the remaining words widen the reader’s sense of that address.',
  'ਇਸ ਕਾਰਜਕਾਰੀ ਅਰਥ ਵਿੱਚ ਅਲਾਹ ਨਾਮ ਨਾਲ ਉਸੇ ਇੱਕ ਪ੍ਰਭੂ ਨੂੰ ਯਾਦ ਕੀਤਾ ਗਿਆ ਹੈ। ਅੱਗੇ ਉਸ ਨੂੰ ਕਿਸੇ ਇੱਕ ਥਾਂ ਤੋਂ ਪਰੇ, ਬੇਅੰਤ ਅਤੇ ਮਹਾਨ ਕਿਹਾ ਹੈ। ਚਾਰਾਂ ਤੁਕਾਂ ਦਾ ਸੰਬੋਧਨ ਇੱਕੋ ਪ੍ਰਭੂ ਵੱਲ ਹੈ; ਨਾਮ ਉਸ ਦੀ ਹਸਤੀ ਨੂੰ ਛੋਟੀ ਹੱਦ ਵਿੱਚ ਨਹੀਂ ਬੰਨ੍ਹਦਾ।',
  {
    focus: 'Hear a named address together with the refusal to confine the One to a place or limit.',
    closeReading: 'All four lines retain the direct ਹੈਂ pattern of this Chachari section. The first line can therefore be heard as an address through a familiar Divine name, while the next three resist making that name a small container. Place, endpoint and ordinary scale fall short. The main reading of ਅਲਾਹ is supported, but it is not the only explanation in the consulted tradition. Keeping that lexical question visible allows the lesson to make its point without treating one dictionary sense as an unquestionable verdict.',
    words: [
      ['ਅਲਾਹ', 'Allah, the Divine name in this working reading'],
      ['ਅਜਾਹ', 'not confined to a fixed place'],
      ['ਅਨੰਤ', 'without end'],
      ['ਮਹੰਤ', 'supremely great']
    ],
    care: 'Do not turn a Divine name into a claim that the One belongs only to one human group. The first two epithets have recorded interpretive alternatives; this educational reading does not settle their philology or make claims about agreement between all religions.',
    reflection: 'How can a name help you address the Divine while leaving room for what you do not understand?',
    teachBack: 'Explain how the final three lines expand the first line’s address, and identify which reading of ਅਲਾਹ this draft uses.'
  }
);

chhand(39, [
  ['You cannot be enclosed by a defining outline or boundary.',
   'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਲਕੀਰ ਜਾਂ ਨਿਸ਼ਚਿਤ ਹੱਦ ਤੇਰੇ ਸਰੂਪ ਨੂੰ ਘੇਰ ਨਹੀਂ ਸਕਦੀ।',
   'ਅਲੀਕ is read through the absence of a limiting line or mark, the sense linked to Jaap Sahib in Mahan Kosh. Other commentary stresses inscrutability or affection. The separate Sanskrit dictionary sense of falsehood is not applied to this Divine epithet.'],
  ['You have no equal or rival who can share Your supreme place.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੇਰੇ ਬਰਾਬਰ ਦਾ ਕੋਈ ਸ਼ਰੀਕ ਜਾਂ ਮੁਕਾਬਲੇ ਵਾਲਾ ਨਹੀਂ।',
   'ਨ੍ਰਿਸ੍ਰੀਕ is read as without an equal or rival. The source’s exact spelling is retained; this praise is not a claim that any human community is entitled to dominate another.'],
  ['You need no outside support to sustain Your being.',
   'ਹੇ ਪ੍ਰਭੂ, ਆਪਣੀ ਹੋਂਦ ਲਈ ਤੈਨੂੰ ਕਿਸੇ ਹੋਰ ਆਸਰੇ ਦੀ ਲੋੜ ਨਹੀਂ।',
   'ਨ੍ਰਿਲੰਭ is read as needing no external support, supported by the Rampur Khera steek and Neki. The Bhai Vir Singh commentary offers an unreachable reading. It does not mean helpless or abandoned; its spelling is not silently changed to another witness’s form.'],
  ['You are uncreated; no other being brings You into existence.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਜਨਮ ਰਹਿਤ ਹੈਂ; ਤੈਨੂੰ ਕਿਸੇ ਹੋਰ ਨੇ ਪੈਦਾ ਨਹੀਂ ਕੀਤਾ।',
   'ਅਸੰਭ is read as birthless or ungenerated, the sense Mahan Kosh explicitly associates with Jaap Sahib. Other commentary emphasises unmanifest or self-radiant being. The ordinary sense of impossible is not the selected meaning here.']
]);

deep(39,
  'The stanza removes four kinds of limitation: an enclosing outline, a rival, dependence on another support, and a created beginning. Each line addresses the same One while naming a different limit that does not apply.',
  'ਛੰਦ ਪ੍ਰਭੂ ਨੂੰ ਲਕੀਰ ਦੀ ਹੱਦ, ਬਰਾਬਰ ਦੇ ਸ਼ਰੀਕ, ਬਾਹਰਲੇ ਆਸਰੇ ਅਤੇ ਜਨਮ ਦੀ ਲੋੜ ਤੋਂ ਪਰੇ ਕਹਿੰਦਾ ਹੈ। ਹਰ ਤੁਕ ਉਸੇ ਇੱਕ ਨੂੰ ਸੰਬੋਧਨ ਕਰਦੀ ਹੈ, ਪਰ ਹਰ ਵਿਸ਼ੇਸ਼ਣ ਵੱਖਰੀ ਹੱਦ ਹਟਾਉਂਦਾ ਹੈ। ਸਾਰੇ ਸ਼ਬਦਾਂ ਨੂੰ ਇੱਕੋ ਅਰਥ ਦੇਣ ਨਾਲ ਇਹ ਫ਼ਰਕ ਗੁੰਮ ਹੋ ਜਾਂਦਾ ਹੈ।',
  {
    focus: 'Distinguish the four limits being denied instead of flattening the stanza into one vague “beyond”.',
    closeReading: 'The repeated ending makes the stanza sound compact, but its four openings do different work. ਅਲੀਕ concerns a defining line or mark in the selected reading. ਨ੍ਰਿਸ੍ਰੀਕ concerns an equal or rival. ਨ੍ਰਿਲੰਭ turns to dependence on support, and ਅਸੰਭ to coming into existence. Asking what each word removes is a useful way to slow down the apparent repetition. The lesson’s chosen senses form a coherent reading, while the notes preserve alternatives where the consulted commentaries differ.',
    words: [
      ['ਅਲੀਕ', 'not enclosed by a defining line or mark'],
      ['ਨ੍ਰਿਸ੍ਰੀਕ', 'without an equal or rival'],
      ['ਨ੍ਰਿਲੰਭ', 'without need of external support'],
      ['ਅਸੰਭ', 'uncreated; birthless in this reading']
    ],
    care: 'Divine independence is not a demand that people avoid help or relationships. The unrelated falsehood sense of ਅਲੀਕ and everyday impossible sense of ਅਸੰਭ would mislead here. The draft records lexical alternatives without changing any original word.',
    reflection: 'Can you recognise your own need for support without treating that need as a failure?',
    teachBack: 'Name the four different limitations considered here, and explain why ਨ੍ਰਿਲੰਭ is not a description of helplessness.'
  }
);

chhand(40, [
  ['You are beyond the full reach of our senses and understanding.',
   'ਹੇ ਪ੍ਰਭੂ, ਮਨ ਅਤੇ ਇੰਦ੍ਰੀਆਂ ਤੇਰੇ ਪੂਰੇ ਸਰੂਪ ਤਕ ਨਹੀਂ ਪਹੁੰਚ ਸਕਦੀਆਂ।',
   'ਅਗੰਮ concerns what cannot be fully reached or fathomed. The line expresses the limit of ordinary grasp; it does not declare remembrance, learning or a loving relationship impossible.'],
  ['You are birthless; Your being does not begin through birth.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਅਜਨਮਾ ਹੈਂ; ਤੇਰੀ ਹੋਂਦ ਜਨਮ ਲੈਣ ਨਾਲ ਸ਼ੁਰੂ ਨਹੀਂ ਹੁੰਦੀ।',
   'ਅਜੰਮ names freedom from birth. This is a Divine attribute, not a statement that a person can avoid ordinary birth and death simply by repeating the line.'],
  ['You are not composed of the material elements of the world.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸੰਸਾਰ ਦੇ ਭੌਤਿਕ ਤੱਤਾਂ ਨਾਲ ਬਣਿਆ ਹੋਇਆ ਨਹੀਂ।',
   'ਅਭੂਤ is read as beyond material or elemental composition, consistently with the identical line in Chhand 34. Commentary also gives an unmanifest reading of this repeated epithet. The traditional five-element vocabulary is not a modern chemical model, and the word does not mean a ghost here.'],
  ['You are beyond physical touch and cannot be grasped as a material object.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸਰੀਰਕ ਛੋਹ ਤੋਂ ਪਰੇ ਹੈਂ; ਤੈਨੂੰ ਪਦਾਰਥ ਵਾਂਗ ਫੜਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ।',
   'ਅਛੂਤ is explicitly glossed for Jaap Sahib in Mahan Kosh as beyond touch. This Divine epithet must be distinguished from the word’s harmful caste usage; it does not declare any people impure or unworthy of contact.']
]);

deep(40,
  'The four lines distinguish limits of reach, birth, material composition and touch. Their praise points beyond treating the Divine as one more object that can be produced, inspected or held in the hand.',
  'ਚਾਰ ਤੁਕਾਂ ਪਹੁੰਚ, ਜਨਮ, ਤੱਤਾਂ ਦੀ ਬਣਤਰ ਅਤੇ ਸਰੀਰਕ ਛੋਹ ਦੀਆਂ ਹੱਦਾਂ ਵੱਖ-ਵੱਖ ਕਰਦੀਆਂ ਹਨ। ਪ੍ਰਭੂ ਨੂੰ ਆਮ ਵਸਤ ਵਾਂਗ ਬਣਾਇਆ, ਪਰਖਿਆ ਜਾਂ ਹੱਥ ਵਿੱਚ ਫੜਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ। ਇਹ ਉਸ ਦੀ ਉਸਤਤਿ ਹੈ, ਮਨੁੱਖੀ ਸਰੀਰਾਂ ਜਾਂ ਇੰਦ੍ਰੀਆਂ ਦੀ ਨਿੰਦਾ ਨਹੀਂ।',
  {
    focus: 'Understand the language of reach and touch without turning it into exclusion or bodily contempt.',
    closeReading: 'ਅਗੰਮ begins with the limit of reaching; ਅਛੂਤ ends with the limit of touching. Between them, ਅਜੰਮ and ਅਭੂਤ remove birth and material composition from the One addressed. That arrangement helps distinguish an object in the world from the Divine being praised. It also makes context essential for vocabulary. The final word has another, painful social use, but this verse applies it to the Divine and the classic dictionary links this occurrence specifically to freedom from physical touch.',
    words: [
      ['ਅਗੰਮ', 'beyond full reach or comprehension'],
      ['ਅਜੰਮ', 'birthless'],
      ['ਅਭੂਤ', 'not composed of material elements'],
      ['ਅਛੂਤ', 'beyond physical touch in this address']
    ],
    care: 'ਅਛੂਤ here gives no support to caste exclusion. Nor do limits on sight, touch or understanding rank people by sensory ability. The five elements belong to a traditional explanatory framework, not a scientific claim about the body.',
    reflection: 'What is the difference between being unable to hold something in your hand and being unable to relate to it meaningfully?',
    teachBack: 'Explain the role of the first and last words, and state clearly why the last one is not a label for a human caste.'
  }
);

chhand(41, [
  ['You are unseen, beyond the reach of ordinary sight.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਆਮ ਅੱਖੀਂ ਵੇਖਣ ਦੀ ਹੱਦ ਤੋਂ ਪਰੇ ਹੈਂ।',
   'ਅਲੋਕ is read as unseen, as in the consulted Punjabi steek and Neki. Here it is not a dismissal of the world or a claim that particular visual experiences prove spiritual attainment.'],
  ['You are free from sorrow; grief does not overwhelm Your being.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਸੋਗ ਤੋਂ ਰਹਿਤ ਹੈਂ; ਦੁੱਖ ਤੇਰੀ ਹੋਂਦ ਨੂੰ ਵੱਸ ਵਿੱਚ ਨਹੀਂ ਕਰਦਾ।',
   'ਅਸੋਕ names freedom from sorrow. It addresses the Divine; it does not shame human grief or promise that a devoted person will never feel sadness.'],
  ['You are not bound by actions and their karmic consequences.',
   'ਹੇ ਪ੍ਰਭੂ, ਕਰਮ ਅਤੇ ਉਨ੍ਹਾਂ ਦੇ ਫਲਾਂ ਦੇ ਬੰਧਨ ਤੈਨੂੰ ਨਹੀਂ ਬੰਨ੍ਹਦੇ।',
   'ਅਕਰਮ is read through freedom from karmic bondage. Some translations emphasise freedom from ritual obligation. Neither reading makes the Divine incapable of action or excuses a person from responsibility.'],
  ['You are free from delusion and the confusion it brings.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਭਰਮ ਅਤੇ ਉਸ ਤੋਂ ਪੈਦਾ ਹੋਣ ਵਾਲੇ ਭੁਲੇਖੇ ਤੋਂ ਰਹਿਤ ਹੈਂ।',
   'ਅਭਰਮ denies delusion or confusion. It should not be turned into a prohibition on honest questions; the poem describes the One addressed rather than a rule against inquiry.']
]);

deep(41,
  'Unseen being is joined with freedom from sorrow, karmic bondage and delusion. The stanza keeps these four qualities distinct, so being beyond ordinary sight does not become mere absence or indifference.',
  'ਅਦ੍ਰਿਸ਼ ਹੋਂਦ ਦੇ ਨਾਲ ਸੋਗ, ਕਰਮ-ਬੰਧਨ ਅਤੇ ਭਰਮ ਤੋਂ ਰਹਿਤ ਹੋਣ ਦੀ ਉਸਤਤਿ ਆਉਂਦੀ ਹੈ। ਚਾਰੇ ਗੁਣ ਵੱਖਰੇ ਪੱਖ ਦੱਸਦੇ ਹਨ। ਆਮ ਨਜ਼ਰ ਤੋਂ ਪਰੇ ਹੋਣ ਦਾ ਭਾਵ ਇਹ ਨਹੀਂ ਕਿ ਪ੍ਰਭੂ ਦੀ ਹੋਂਦ ਨਹੀਂ ਜਾਂ ਉਸ ਨਾਲ ਕੋਈ ਨਾਤਾ ਨਹੀਂ ਬਣ ਸਕਦਾ।',
  {
    focus: 'Hear four different freedoms while keeping the distinction between Divine praise and human experience.',
    closeReading: 'ਅਲੋਕ and ਅਸੋਕ are close in sound, but one concerns visibility and the other sorrow. The second pair likewise separates action and its binding consequences from confusion of understanding. This difference is easy to miss when the lines move quickly. Reading each word with its own question—can it be seen, grieved, bound by action, or confused—helps preserve the stanza’s range. These are questions about the Divine attributes named here, not tests that a learner must pass to count as devout.',
    words: [
      ['ਅਲੋਕ', 'unseen; beyond ordinary sight'],
      ['ਅਸੋਕ', 'free from sorrow'],
      ['ਅਕਰਮ', 'free from karmic bondage here'],
      ['ਅਭਰਮ', 'free from delusion']
    ],
    care: 'The passage is neither a judgment on bereavement nor a promise of permanent emotional calm. Freedom from karma in this address does not abolish human accountability. Curiosity and careful questioning are not equated with the delusion named by ਅਭਰਮ.',
    reflection: 'Which of these words are you most likely to blur together when reading quickly, and what would help you notice the difference?',
    teachBack: 'Distinguish ਅਲੋਕ from ਅਸੋਕ and ਅਕਰਮ from ਅਭਰਮ using one clear phrase for each.'
  }
);

chhand(42, [
  ['You cannot be conquered or overcome by another power.',
   'ਹੇ ਪ੍ਰਭੂ, ਕੋਈ ਹੋਰ ਤਾਕਤ ਤੈਨੂੰ ਜਿੱਤ ਜਾਂ ਹਰਾ ਨਹੀਂ ਸਕਦੀ।',
   'ਅਜੀਤ names the unconquerable One. The line does not transfer that quality to a reader’s body, status or personal conflicts.'],
  ['You are fearless, not ruled by fear of another.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਨਿਰਭਉ ਹੈਂ; ਕਿਸੇ ਹੋਰ ਦਾ ਡਰ ਤੈਨੂੰ ਨਹੀਂ ਚਲਾਉਂਦਾ।',
   'ਅਭੀਤ concerns fearlessness. It is paired with being unconquerable but names a distinct quality: fear and defeat are not the same thing.'],
  ['You remain unshaken; no outside force can dislodge Your being.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਅਡੋਲ ਹੈਂ; ਕੋਈ ਬਾਹਰਲੀ ਤਾਕਤ ਤੈਨੂੰ ਡੁਲਾ ਨਹੀਂ ਸਕਦੀ।',
   'ਅਬਾਹ is read as unmoving or unshakable, consistently supported by Neki, the Rampur Khera steek and the Bhai Vir Singh commentary. It is not read as a statement about lacking arms.'],
  ['Your depth cannot be fully fathomed or measured.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਅਥਾਹ ਹੈਂ; ਤੇਰੀ ਪੂਰੀ ਡੂੰਘਾਈ ਮਾਪੀ ਨਹੀਂ ਜਾ ਸਕਦੀ।',
   'ਅਗਾਹ concerns unfathomable depth. Keep it distinct from ਅਬਾਹ: the first stresses steadiness, while this word points to the limit of reaching the full depth.']
]);

deep(42,
  'The stanza joins unconquerable strength, fearlessness, steadiness and unfathomable depth. Familiar qualities return in the short Chachari form, inviting recognition with renewed attention rather than automatic repetition.',
  'ਇਸ ਛੰਦ ਵਿੱਚ ਅਜਿੱਤਤਾ, ਨਿਰਭਉਤਾ, ਅਡੋਲਤਾ ਅਤੇ ਅਥਾਹ ਡੂੰਘਾਈ ਇਕੱਠੀਆਂ ਆਉਂਦੀਆਂ ਹਨ। ਪਹਿਲਾਂ ਸੁਣੇ ਗੁਣ ਚਾਚਰੀ ਦੀ ਛੋਟੀ ਚਾਲ ਵਿੱਚ ਮੁੜ ਆਉਂਦੇ ਹਨ। ਦੁਹਰਾਵਾ ਹਰ ਸ਼ਬਦ ਦਾ ਆਪਣਾ ਭਾਵ ਨਵੇਂ ਧਿਆਨ ਨਾਲ ਪਛਾਣਨ ਦਾ ਮੌਕਾ ਬਣਦਾ ਹੈ।',
  {
    focus: 'Recognise returning epithets while distinguishing strength, fearlessness, steadiness and depth.',
    closeReading: 'The opening pair echoes earlier praise of the One who cannot be conquered and does not fear. The closing pair shifts from what cannot shake the Divine to what the reader cannot fully fathom. Although ਅਬਾਹ and ਅਗਾਹ rhyme closely, steadiness and depth are different ideas. The order here is also worth noticing alongside earlier salutations in the bani. Repetition allows recognition; attending to placement prevents recognition from becoming a substitute for understanding.',
    words: [
      ['ਅਜੀਤ', 'unconquerable'],
      ['ਅਭੀਤ', 'fearless'],
      ['ਅਬਾਹ', 'unmoving; unshakable'],
      ['ਅਗਾਹ', 'unfathomable']
    ],
    care: 'The strength described belongs to the Divine address, not to a promise of physical invulnerability. A person’s fear does not prove spiritual failure. ਅਬਾਹ is read through steadiness, without importing a misleading anatomical explanation.',
    reflection: 'What kind of steadiness can coexist with admitting that you do not fully understand a situation?',
    teachBack: 'Explain the difference between ਅਬਾਹ and ਅਗਾਹ, then connect each to one of the opening qualities.'
  }
);

chhand(43, [
  ['You are beyond measure; no scale can contain Your extent.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਮਿਣਤੀ ਤੋਂ ਪਰੇ ਹੈਂ; ਕੋਈ ਮਾਪ ਤੇਰਾ ਪੂਰਾ ਵਿਸਥਾਰ ਨਹੀਂ ਦੱਸ ਸਕਦਾ।',
   'ਅਮਾਨ is read as immeasurable, the sense Mahan Kosh explicitly associates with Jaap Sahib. Other dictionary senses involving dishonour, trust or safety are not selected for this line.'],
  ['You are the treasury from which every kind of abundance comes.',
   'ਹੇ ਪ੍ਰਭੂ, ਹਰ ਕਿਸਮ ਦੀ ਦਾਤ ਅਤੇ ਖ਼ਜ਼ਾਨੇ ਦਾ ਸੋਮਾ ਤੂੰ ਹੈਂ।',
   'ਨਿਧਾਨ supplies a treasury or storehouse image. In this praise it can include spiritual qualities and the gifts of existence; it is not a promise of money or possessions.'],
  ['You are present through countless forms, appearing as many.',
   'ਹੇ ਪ੍ਰਭੂ, ਅਨੇਕਾਂ ਰੂਪਾਂ ਵਿੱਚ ਤੇਰੀ ਹੀ ਵਿਆਪਕਤਾ ਦਿੱਸਦੀ ਹੈ।',
   'ਅਨੇਕ points to multiplicity. The following ਫਿਰਿ ਏਕ must remain with it: this line is not treated as a separate claim that the many have displaced the One.'],
  ['Yet through all that multiplicity, You remain One.',
   'ਇਨ੍ਹਾਂ ਅਨੇਕ ਰੂਪਾਂ ਵਿੱਚ ਵੀ, ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਇੱਕੋ ਹੀ ਹੈਂ।',
   'ਫਿਰਿ carries the return or contrast here: many, and still One. The frozen spelling ਫਿਰਿ is retained. The stanza does not describe a timetable in which separate gods later merge.']
]);

deep(43,
  'The immeasurable treasury is praised as many and still One. The final pair asks the reader to hold multiplicity and unity together, bringing this Chachari section to a close without reducing either side to a mere counting exercise.',
  'ਮਿਣਤੀ ਤੋਂ ਪਰੇ ਅਤੇ ਸਭ ਦਾਤਾਂ ਦੇ ਭੰਡਾਰ ਪ੍ਰਭੂ ਨੂੰ ਅਨੇਕ ਰੂਪਾਂ ਵਿੱਚ ਵਿਆਪਕ, ਫਿਰ ਵੀ ਇੱਕ ਕਿਹਾ ਹੈ। ਅਖੀਰਲੀ ਜੋੜੀ ਅਨੇਕਤਾ ਅਤੇ ਏਕਤਾ ਨੂੰ ਇਕੱਠੇ ਰੱਖਦੀ ਹੈ। ਇਸ ਨਾਲ ਚਾਚਰੀ ਦਾ ਇਹ ਭਾਗ ਮੁੱਕਦਾ ਹੈ; ਗੱਲ ਸਿਰਫ਼ ਗਿਣਤੀ ਕਰਨ ਦੀ ਨਹੀਂ ਰਹਿੰਦੀ।',
  {
    focus: 'Let the final “still One” complete the statement about the many.',
    closeReading: 'ਅਮਾਨ first resists measurement, and ਨਿਧਾਨ adds the image of a treasury. The final two lines then make the strongest movement: ਅਨੇਕ is followed by ਫਿਰਿ ਏਕ. The same ਹੈਂ addresses the same One in both lines. Reading only the third would miss the turn; reading only the fourth would miss the variety through which the praise has just moved. The small word ਫਿਰਿ matters because it holds the apparent contrast together rather than erasing the preceding line.',
    words: [
      ['ਅਮਾਨ', 'immeasurable'],
      ['ਨਿਧਾਨ', 'treasury; storehouse'],
      ['ਅਨੇਕ', 'many; manifold'],
      ['ਫਿਰਿ ਏਕ', 'and yet One; still One']
    ],
    care: 'One and many are theological terms in this address, not a mathematical proof or permission to erase differences among people. The treasury image should not become a guarantee of material reward for recitation.',
    reflection: 'Can you notice real variety in life while also recognising connections that make it more than isolated pieces?',
    teachBack: 'Explain what ਫਿਰਿ adds to the last line and why both of the final two lines are needed.'
  }
);

chhand(44, [
  ['I bow to You, worthy of honour throughout creation.',
   'ਹੇ ਸਾਰੇ ਜਗਤ ਵਿੱਚ ਸਤਿਕਾਰਯੋਗ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਸਰਬ ਮਾਨੇ gives honour a universal scope. This is devotional praise, not a survey claiming that every person consciously holds the same belief. A separate Bhujang Prayat heading precedes this stanza.'],
  ['You are the source and treasury of all abundance.',
   'ਹੇ ਪ੍ਰਭੂ, ਸਭ ਨਿਧੀਆਂ ਅਤੇ ਦਾਤਾਂ ਦਾ ਭੰਡਾਰ ਤੂੰ ਹੈਂ।',
   'ਸਮਸਤੀ ਨਿਧਾਨੇ continues the preceding salutation through the treasury image. Its opening is not ਨਮੋ in the frozen line; the explanation follows the continuing address without inserting a word into the scripture.'],
  ['I bow to You, supreme even among those called divine.',
   'ਹੇ ਦੇਵਤਿਆਂ ਤੋਂ ਵੀ ਉੱਚੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਦੇਵ ਦੇਵੇ is a repeated-word intensification, commonly explained as the Divine above the devas. The Bhai Vir Singh commentary emphasises the radiance that gives them light. It does not require a modern factual ranking of celestial beings.'],
  ['You are not defined by an outward guise, and Your being is undivided.',
   'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਕਿਸੇ ਭੇਖ ਵਿੱਚ ਨਹੀਂ ਬੱਝਦਾ ਅਤੇ ਤੇਰੇ ਸਰੂਪ ਵਿੱਚ ਵੰਡ ਨਹੀਂ।',
   'ਅਭੇਖੀ concerns outward guise. ਅਭੇਵੇ is provisionally read as without division or distinction, within the ਭੇਦ-ਰਹਿਤ reading of the Punjabi steek and Bhai Vir Singh commentary. Explanations involving absence of concealment or secrets also occur; these distinct senses remain for qualified review.']
]);

deep(44,
  'The return to Bhujang Prayat brings back explicit salutations. Universal honour, abundance and divine supremacy are followed by freedom from outward guise and, in the selected reading, division within the One.',
  'ਭੁਜੰਗ ਪ੍ਰਯਾਤ ਛੰਦ ਦੀ ਵਾਪਸੀ ਨਾਲ ਸਿੱਧੀਆਂ ਨਮਸਕਾਰਾਂ ਮੁੜ ਆਉਂਦੀਆਂ ਹਨ। ਪ੍ਰਭੂ ਨੂੰ ਸਭ ਦਾ ਸਤਿਕਾਰਯੋਗ, ਦਾਤਾਂ ਦਾ ਭੰਡਾਰ ਅਤੇ ਦੇਵਤਿਆਂ ਤੋਂ ਉੱਚਾ ਕਿਹਾ ਹੈ। ਅਖੀਰ ਵਿੱਚ ਭੇਖ ਅਤੇ, ਇਸ ਕਾਰਜਕਾਰੀ ਅਰਥ ਅਨੁਸਾਰ, ਸਰੂਪ ਦੀ ਵੰਡ ਤੋਂ ਰਹਿਤ ਹੋਣ ਦੀ ਗੱਲ ਆਉਂਦੀ ਹੈ।',
  {
    focus: 'Notice the return of a metrical form and how praise is paired with limits on outward definition.',
    closeReading: 'The heading before this stanza names ਭੁਜੰਗ ਪ੍ਰਯਾਤ ਛੰਦ, returning to a form used earlier. The direct ਹੈਂ endings give way here to explicit ਨਮੋ salutations and clauses that continue them. The first pair widens honour and abundance; the second intensifies divine supremacy before qualifying how the One is understood. ਅਭੇਖੀ prevents a particular guise from becoming the definition. Our reading of ਅਭੇਵੇ adds undivided being, while the note preserves the genuine interpretive disagreement around that word.',
    words: [
      ['ਸਰਬ ਮਾਨੇ', 'worthy of honour throughout creation'],
      ['ਸਮਸਤੀ ਨਿਧਾਨੇ', 'treasury of all abundance'],
      ['ਦੇਵ ਦੇਵੇ', 'supreme even among the devas'],
      ['ਅਭੇਖੀ', 'not defined by an outward guise'],
      ['ਅਭੇਵੇ', 'without division in this working reading; other senses remain open']
    ],
    care: 'The heading is separate from the four scripture lines and gives no automatic recitation speed. ਅਭੇਵੇ remains a lexical review point; an undivided reading must not be silently presented as identical to unconcealed or free from secrets. Freedom from guise does not dismiss meaningful religious discipline.',
    reflection: 'What happens when an outward sign becomes the whole of what you think you know about someone?',
    teachBack: 'Identify the metrical change and explain how the final line qualifies the honour and supremacy expressed earlier.'
  }
);

chhand(45, [
  ['I bow to You, whose sovereignty reaches even over death and time.',
   'ਹੇ ਪ੍ਰਭੂ, ਕਾਲ ਵੀ ਤੇਰੇ ਵੱਸ ਹੈ; ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਕਾਲ ਕਾਲੇ renews the earlier intensified address: the One beyond the authority of death and time. It is not a guarantee that the person reciting will escape mortality.'],
  ['I bow to You, who sustain and care for all beings.',
   'ਹੇ ਸਭ ਜੀਵਾਂ ਦੀ ਪਾਲਣਾ ਅਤੇ ਸੰਭਾਲ ਕਰਨ ਵਾਲੇ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਸਰਬ ਪਾਲੇ places universal care beside sovereignty over death. Both qualities address the same One; neither should be omitted when explaining this pair.'],
  ['I bow to You, whose presence extends everywhere.',
   'ਹੇ ਸਭ ਥਾਵਾਂ ਵਿੱਚ ਵਿਆਪਕ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਸਰਬ ਗਉਣੇ is read through pervading or moving throughout all places. The exact ਗਉਣੇ spelling is retained; its sense here should not be selected simply by resemblance to the modern Punjabi verb for singing.'],
  ['I bow to You, present throughout every realm and dwelling.',
   'ਹੇ ਸਾਰੇ ਭਵਨਾਂ ਅਤੇ ਟਿਕਾਣਿਆਂ ਵਿੱਚ ਵਿਆਪਕ ਪ੍ਰਭੂ, ਤੈਨੂੰ ਨਮਸਕਾਰ ਹੈ।',
   'ਸਰਬ ਭਉਣੇ reinforces presence in all places and realms. It is not limited to one building or shrine. Its overlap with the preceding line enriches the praise without requiring an artificial technical distinction.']
]);

deep(45,
  'Sovereignty over death is joined with care for all, and the final pair extends Divine presence to every place. Four repeated salutations connect power, nurture and pervasiveness without restricting the address to a single location.',
  'ਕਾਲ ਉੱਤੇ ਪ੍ਰਭੂ ਦੀ ਸਰਦਾਰੀ ਦੇ ਨਾਲ ਸਭ ਜੀਵਾਂ ਦੀ ਪਾਲਣਾ ਆਉਂਦੀ ਹੈ। ਅਖੀਰਲੀਆਂ ਦੋ ਤੁਕਾਂ ਉਸ ਦੀ ਵਿਆਪਕਤਾ ਸਭ ਥਾਵਾਂ ਅਤੇ ਭਵਨਾਂ ਤਕ ਲਿਆਉਂਦੀਆਂ ਹਨ। ਚਾਰ ਨਮਸਕਾਰਾਂ ਵਿੱਚ ਸਮਰੱਥਾ, ਸੰਭਾਲ ਅਤੇ ਸਰਬ-ਵਿਆਪਕਤਾ ਇੱਕੋ ਪ੍ਰਭੂ ਨਾਲ ਜੁੜਦੀਆਂ ਹਨ।',
  {
    focus: 'Read sovereignty, nurture and presence as connected parts of the same address.',
    closeReading: 'Each line begins with ਨਮੋ, but the opening intensification ਕਾਲ ਕਾਲੇ differs from the repeated ਸਰਬ that follows. The first pair places death and nurture together. The second uses two closely related expressions of all-pervading presence, so the movement is from power and care to their unrestricted scope. These phrases have appeared earlier in the bani; their return asks the reader to bring remembered meaning into the present arrangement. The lesson can acknowledge the overlap without inventing a sharp distinction unsupported by the words.',
    words: [
      ['ਕਾਲ ਕਾਲੇ', 'sovereign even over death and time'],
      ['ਸਰਬ ਪਾਲੇ', 'sustaining and caring for all'],
      ['ਸਰਬ ਗਉਣੇ', 'pervading or moving throughout all places'],
      ['ਸਰਬ ਭਉਣੇ', 'present in all realms and dwellings']
    ],
    care: 'This praise does not promise bodily invulnerability or supply a reason to blame anyone for suffering. All-pervading presence is a devotional claim, not a measurable travel route. Overlapping epithets need not be forced into separate technical categories.',
    reflection: 'Where in ordinary life might remembering care and presence change the quality of your attention?',
    teachBack: 'Describe the two pairs in this stanza and explain what the repeated ਸਰਬ adds after the opening line.'
  }
);

if (jaap38to45Lines.length !== 32 || jaap38to45Deep.length !== 8) {
  throw new Error('Jaap 38–45 packet must contain exactly 32 line drafts and 8 Study units');
}
