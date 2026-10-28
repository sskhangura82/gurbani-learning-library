/* GLP-001: Anand Sahib Pauris1–7 previously missing EXACT 33
 * individually-authored bilingual original-line educational notes.
 * Three earlier Pauri1/2/7 line01 original teaching records MUST survive
 * unchanged. Seven existing Deep Study units remain exactly as before.
 * This is neither literal canonical translation nor licensed teeka.
 * No new material for quarantined Pauri24.
 */
export const anandFirstSevenLines=[];
const add=(pauri,rows)=>{
 const id='anand'+String(pauri).padStart(2,'0');
 for(const [number,simpleEn,simplePa,nuance] of rows){
  anandFirstSevenLines.push({bani:'anand',
   lineId:id+'.line'+String(number).padStart(2,'0'),
   simpleEn,simplePa,nuance,
   meaningKind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
   editorialStatus:'DRAFT_AI_UNREVIEWED'});
 }
};
// 1 · Joy found through Satguru, Shabad and inner musical imagery.
add(1,[
 [2,
 'By meeting the True Guru with natural ease, a new celebration begins within my mind.',
 'ਸਹਜ ਨਾਲ ਸਤਿਗੁਰੂ ਮਿਲਿਆ ਅਤੇ ਮੇਰੇ ਮਨ ਵਿੱਚ ਖੁਸ਼ੀ ਦੀ ਵਧਾਈ ਗੂੰਜੀ।',
 'Sahaj means inward poise in this poetic context; it is not a clinically measured mood state or a prescribed meditation technique.'],
 [3,
 'Precious melodies and their companions are imagined arriving to sing the Guru’s Shabad.',
 'ਰਾਗਾਂ ਦੇ ਰਤਨ ਤੇ ਉਨ੍ਹਾਂ ਦੇ ਸੰਗੀ ਮਨ ਵਿੱਚ ਸ਼ਬਦ ਗਾਉਣ ਆਏ ਹੋਏ ਦਿਖਾਏ ਗਏ ਹਨ।',
 'The musical procession is spiritual poetry. It does not establish a real recording, a specific performance raag or a claim about instruments heard by everyone.'],
 [4,
 'Sing the Shabad of Hari, whose remembrance has found a dwelling within the mind.',
 'ਜਿਨ੍ਹਾਂ ਦੇ ਮਨ ਵਿੱਚ ਹਰਿ ਵੱਸਦਾ ਹੈ, ਉਹ ਹਰਿ ਦਾ ਸ਼ਬਦ ਗਾਉਣ।',
 'Singing may be lived through reading and reflection too; this is not a claim that only people able to sing can engage with the Guru.'],
 [5,
 'Nanak concludes that joy has arisen because the True Guru has been found.',
 'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਸਤਿਗੁਰੂ ਮਿਲਣ ਨਾਲ ਮੇਰੇ ਅੰਦਰ ਅਨੰਦ ਜਾਗਿਆ ਹੈ।',
 'The closing repetition completes the devotional theme. Anand is not a promise that sadness or illness can never return.']
]);
// 2 · Remember the Divine while acting responsibly in life.
add(2,[
 [2,
 'O mind, stay in remembrance of Hari, and let the grip of suffering become less consuming.',
 'ਹੇ ਮਨ, ਹਰਿ ਦੀ ਯਾਦ ਵਿੱਚ ਰਹਿ; ਦੁੱਖਾਂ ਦਾ ਭਾਰ ਮਨ ਉੱਤੇ ਘੱਟ ਹਾਵੀ ਹੋਵੇਗਾ।',
 'The relief of sorrow is spiritual language and not a promise to cure depression, pain or any medical condition.'],
 [3,
 'The One receives you into protection and helps bring your life’s concerns into order.',
 'ਪ੍ਰਭੂ ਤੈਨੂੰ ਆਪਣੀ ਸੰਭਾਲ ਵਿੱਚ ਲੈਂਦਾ ਤੇ ਤੇਰੇ ਕੰਮਾਂ ਨੂੰ ਸੇਧ ਦਿੰਦਾ ਦੱਸਿਆ ਹੈ।',
 'Divine help in a prayer must not be treated as a guarantee that every worldly plan will succeed automatically.'],
 [4,
 'The Lord is capable in every matter; why forget that sustaining Source in your heart?',
 'ਉਹ ਸੁਆਮੀ ਸਭ ਕੁਝ ਕਰਨ ਦੇ ਸਮਰੱਥ ਹੈ; ਫਿਰ ਉਸ ਨੂੰ ਮਨੋਂ ਕਿਉਂ ਵਿਸਾਰੀਏ?',
 'The rhetorical question encourages remembrance, not abandoning practical responsibility or needed help.'],
 [5,
 'Nanak repeats to his own mind: remain with Hari in constant remembrance.',
 'ਨਾਨਕ ਆਪਣੇ ਮਨ ਨੂੰ ਮੁੜ ਆਖਦੇ ਹਨ: ਸਦਾ ਹਰਿ ਦੇ ਨਾਲ ਜੁੜਿਆ ਰਹਿ।',
 'The first and last lines frame a devotional practice, not a continuous attention test or time-based score.']
]);
// 3 · Divine treasury and the enduring song of praise.
add(3,[
 [1,
 'O True Sovereign, is anything absent from Your limitless abundance?',
 'ਹੇ ਸੱਚੇ ਸਾਹਿਬ, ਤੇਰੇ ਘਰ ਕਿਹੜੀ ਚੀਜ਼ ਦੀ ਕਮੀ ਹੈ?',
 'A devotional question about the Divine’s fullness, not a statement that all material goods should be available on demand.'],
 [2,
 'Your house holds every gift; the one to whom You grant receives.',
 'ਤੇਰੇ ਘਰ ਸਭ ਕੁਝ ਹੈ; ਜਿਸ ਨੂੰ ਤੂੰ ਦਾਤ ਦੇਂਦਾ ਹੈਂ ਉਹੀ ਪਾਉਂਦਾ ਹੈ।',
 'The image of a divine house and gifts does not imply that people without resources lack merit or grace.'],
 [3,
 'May Your praise always be spoken, and may Your Naam abide in the mind.',
 'ਤੇਰੀ ਸਿਫ਼ਤ-ਸਲਾਹ ਸਦਾ ਕਰੀਏ ਅਤੇ ਨਾਮ ਨੂੰ ਮਨ ਵਿੱਚ ਵਸਾਈਏ।',
 'Praise and remembrance describe a way of living rather than an external prize or purchase.'],
 [4,
 'Those whose hearts hold Naam are pictured as filled with many resonant Shabads.',
 'ਜਿਨ੍ਹਾਂ ਦੇ ਮਨ ਵਿੱਚ ਨਾਮ ਵੱਸਦਾ ਹੈ, ਉਨ੍ਹਾਂ ਅੰਦਰ ਸ਼ਬਦਾਂ ਦੀ ਗੂੰਜ ਦਿਖਾਈ ਗਈ ਹੈ।',
 'This sound imagery is poetic and not a claim that a particular audible frequency or track must play.'],
 [5,
 'Nanak returns to the wonder of the True Lord’s inexhaustible abundance.',
 'ਨਾਨਕ ਮੁੜ ਪੁੱਛਦੇ ਹਨ: ਹੇ ਸੱਚੇ ਸਾਹਿਬ, ਤੇਰੇ ਘਰ ਕੀ ਨਹੀਂ?',
 'The repeated rhetorical question directs gratitude, not a claim that prayer guarantees wealth or immunity from hardship.']
]);
// 4 · True Naam as the steady support.
add(4,[
 [1,
 'The True Naam alone is my enduring support.',
 'ਸੱਚਾ ਨਾਮ ਹੀ ਮੇਰਾ ਸਦਾ ਕਾਇਮ ਰਹਿਣ ਵਾਲਾ ਆਸਰਾ ਹੈ।',
 'Support is a devotional/metaphorical quality, not an assertion that material responsibilities disappear.'],
 [2,
 'That True Naam satisfies a deeper longing that outward cravings could not fill.',
 'ਉਹ ਸੱਚਾ ਨਾਮ ਮੇਰੀ ਅੰਦਰਲੀ ਭੁੱਖ ਤੇ ਅਧੂਰੀ ਚਾਹ ਨੂੰ ਸ਼ਾਂਤ ਕਰਦਾ ਹੈ।',
 'The word hunger is spiritually figurative and not an instruction to ignore actual food insecurity or hunger.'],
 [3,
 'Peace and inner contentment arrive as the Divine comes to dwell in the mind.',
 'ਪ੍ਰਭੂ ਮਨ ਵਿੱਚ ਵੱਸੇ ਤਾਂ ਸ਼ਾਂਤੀ ਤੇ ਸੁਖ ਦੀ ਤਸਵੀਰ ਬਣਦੀ ਹੈ।',
 'This is spiritual wellbeing language, not a clinical treatment guarantee or a promise that every wish is materially fulfilled.'],
 [4,
 'I remain deeply grateful to the Guru through whose guidance these gifts were understood.',
 'ਜਿਸ ਗੁਰੂ ਨੇ ਇਹ ਸਮਝ ਅਤੇ ਵਡਿਆਈ ਦਿੱਤੀ, ਉਸ ਦਾ ਮੈਂ ਸਦਾ ਸ਼ੁਕਰਗੁਜ਼ਾਰ ਹਾਂ।',
 '“Kurbaan” expresses deep gratitude and devotion, never actual self-harm or coerced transfer of property.'],
 [5,
 'Nanak says: listen, seekers, and place loving attention upon the Shabad.',
 'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਹੇ ਸੰਤੋ, ਸੁਣੋ ਅਤੇ ਸ਼ਬਦ ਨਾਲ ਪਿਆਰ ਜੋੜੋ।',
 'The invitation is to attentive living and study, not forced obedience to an unaccountable teacher.'],
 [6,
 'The pauri ends as it began: the True Naam is my support.',
 'ਪਉੜੀ ਮੁੜ ਕਹਿੰਦੀ ਹੈ: ਸੱਚਾ ਨਾਮ ਹੀ ਮੇਰਾ ਆਸਰਾ ਹੈ।',
 'The repetition highlights reliance on Naam, not the replacement of ordinary care, safety or relationships.']
]);

// 5 · The fortunate inward home and the "five thieves."
add(5,[
 [1,
 'In the blessed inner home, five Shabads are pictured as sounding.',
 'ਭਾਗਾਂ ਵਾਲੇ ਹਿਰਦੇ-ਘਰ ਵਿੱਚ ਪੰਜ ਸ਼ਬਦਾਂ ਦੀ ਗੂੰਜ ਦੀ ਤਸਵੀਰ ਹੈ।',
 '“Five Shabads” and blessed home require qualified Sikh interpretive review; this is not evidence of five specific audio tracks or external sound waves.'],
 [2,
 'That fortunate inner dwelling is pictured as filled with Shabad, sustained by Divine power.',
 'ਉਸ ਸੁਭਾਗੇ ਹਿਰਦੇ-ਘਰ ਵਿੱਚ ਸ਼ਬਦ ਵੱਜਦਾ ਅਤੇ ਰੱਬੀ ਸ਼ਕਤੀ ਦਾ ਆਸਰਾ ਹੈ।',
 'The “house” is an inward metaphor, not an address, building or price-based spiritual status.'],
 [3,
 'The five harmful impulses are subdued and the thorn of death or fear is overcome in the poem’s image.',
 'ਪੰਜ ਵਿਕਾਰਾਂ ਨੂੰ ਵੱਸ ਵਿੱਚ ਕੀਤਾ ਅਤੇ ਕਾਲ ਦੇ ਕੰਡੇ ਨੂੰ ਹਰਾਇਆ ਦੱਸਿਆ ਗਿਆ ਹੈ।',
 'The traditional five impulses often refer to lust, anger, greed, attachment and ego. Conquering death is devotional imagery, NOT a medical promise of immortality.'],
 [4,
 'Those blessed through Divine grace become joined to Hari’s Naam.',
 'ਜਿਨ੍ਹਾਂ ਉੱਤੇ ਧੁਰੋਂ ਕਿਰਪਾ ਹੋਈ, ਉਹ ਹਰਿ ਨਾਮ ਨਾਲ ਜੁੜੇ।',
 'Grace and remembrance should not become a test of someone’s worth, illness or social rank.'],
 [5,
 'Nanak says there is profound peace in that inner home, where unstruck Shabad is heard.',
 'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਉਸ ਅੰਦਰਲੇ ਘਰ ਵਿੱਚ ਸੁਖ ਹੈ ਅਤੇ ਅਨਹਦ ਸ਼ਬਦ ਦੀ ਤਸਵੀਰ ਗੂੰਜਦੀ ਹੈ।',
 'Anhad is spiritual/musical metaphor and does not verify an audible frequency, noise hallucination or recording.']
]);
// 6 · The body needs loving orientation to Truth.
add(6,[
 [1,
 'Without loving attention to Truth, the body is described as spiritually helpless.',
 'ਸੱਚੀ ਲਿਵ ਤੋਂ ਬਿਨਾਂ ਸਰੀਰ ਨੂੰ ਆਤਮਕ ਤੌਰ ਤੇ ਨਿਮਾਣਾ ਦੱਸਿਆ ਹੈ।',
 'This addresses spiritual direction, not bodily disability or a person’s medical capacity.'],
 [2,
 'Without that loving inward bond, what lasting spiritual orientation can the vulnerable body find?',
 'ਉਸ ਲਿਵ ਤੋਂ ਬਿਨਾਂ ਇਹ ਬੇਚਾਰਾ ਸਰੀਰ ਅੰਦਰਲੀ ਸੇਧ ਕਿਵੇਂ ਲੱਭੇ?',
 '“Helpless body” is devotional language and must not be used to shame illness, weakness, aging or disability.'],
 [3,
 'O sustaining One, none beside You has this ultimate power; please show compassion.',
 'ਹੇ ਬਨਵਾਰੀ ਪ੍ਰਭੂ, ਤੇਰੇ ਬਿਨਾਂ ਹੋਰ ਅੰਤਿਮ ਸਮਰੱਥ ਨਹੀਂ; ਮੇਹਰ ਕਰ।',
 'A Divine petition does not forbid seeking professional or community assistance.'],
 [4,
 'No other lasting place of refuge is named; attachment to the Shabad brings spiritual order.',
 'ਇਸ ਦੇਹ ਨੂੰ ਹੋਰ ਸਦਾ ਕਾਇਮ ਰਹਿਣ ਵਾਲਾ ਠਿਕਾਣਾ ਨਹੀਂ; ਸ਼ਬਦ ਨਾਲ ਜੁੜ ਕੇ ਇਹ ਸੰਵਰਦੀ ਹੈ।',
 'The refuge metaphor is spiritual and not a claim that an ill person needs no safe shelter or treatment.'],
 [5,
 'Nanak repeats the question: without the bond of love, what can the vulnerable body do?',
 'ਨਾਨਕ ਮੁੜ ਪੁੱਛਦੇ ਹਨ: ਲਿਵ ਤੋਂ ਬਿਨਾਂ ਇਹ ਨਿਮਾਣਾ ਸਰੀਰ ਕੀ ਕਰੇ?',
 'The repeated opening and closing are a call toward inward remembrance, not an assertion that physical strength determines spiritual value.']
]);
// 7 · The nature of true Anand, received from Guru.
add(7,[
 [2,
 'True Anand is understood through the Guru and the grace of the Beloved One.',
 'ਸੱਚੇ ਅਨੰਦ ਦੀ ਸੂਝ ਗੁਰੂ ਦੀ ਸੇਧ ਤੇ ਪਿਆਰੇ ਪ੍ਰਭੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਮਿਲਦੀ ਹੈ।',
 'Anand here is a spiritual relationship, not a demand for constant pleasant mood or an emotional-performance score.'],
 [3,
 'Through grace, moral faults fall away and the Guru applies the healing ointment of spiritual knowledge.',
 'ਕਿਰਪਾ ਨਾਲ ਕਿਲਵਿਖ ਘਟਦੇ ਹਨ ਅਤੇ ਗੁਰੂ ਗਿਆਨ ਦਾ ਅੰਜਨ ਲਾ ਕੇ ਅੰਦਰਲੀ ਸੂਝ ਜਗਾਉਂਦਾ ਹੈ।',
 '“Gyan anjan” is an image of wisdom, not an ophthalmic ointment, miraculous cure or treatment for vision problems.'],
 [4,
 'When attachment loosens from within, the true Shabad reshapes their understanding and living.',
 'ਜਿਨ੍ਹਾਂ ਦਾ ਅੰਦਰਲਾ ਮੋਹ ਟੁੱਟਦਾ ਹੈ, ਸੱਚਾ ਸ਼ਬਦ ਉਨ੍ਹਾਂ ਦੀ ਸੇਧ ਸੰਵਾਰਦਾ ਹੈ।',
 'Breaking moh refers to attachment, not rejecting family responsibilities or cutting off loving relationships.'],
 [5,
 'Nanak says this is Anand: its real nature is recognized through the Guru.',
 'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਇਹੀ ਅਨੰਦ ਹੈ, ਜਿਸ ਦੀ ਸੱਚੀ ਸਮਝ ਗੁਰੂ ਤੋਂ ਮਿਲਦੀ ਹੈ।',
 'The closing defines bliss through Guru-centred insight, not a promise that anxiety or grief never returns.']
]);
