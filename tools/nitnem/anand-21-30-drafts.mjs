/* GLP-001 Anand 21–23 and 25–30 original bilingual teaching drafts.
 * Exact source occurrence and SHA provided only by immutable SGGS package.
 * Anand24 is ENTIRELY withheld from new teaching for source editorial review:
 * no explanation or gloss of its unresolved U+F03D original character.
 * NO religious/source approval, no pasted copyrighted teeka or AI runtime.
 */
export const anand2130Lines=[];
export const anand2130Deep=[];
function add(n,lines,study,care){
 if(n===24)throw Error('Source Pauri24 must remain editorially withheld');
 const id='anand'+String(n).padStart(2,'0');
 const [en,pa,focus,reading,words,studyCare,reflection,teachBack]=study;
 if(![5,6].includes(lines.length)||words.length<2)throw Error('Incomplete passage '+id);
 for(let i=0;i<lines.length;i++){
  const [simpleEn,simplePa]=lines[i];
  anand2130Lines.push({bani:'anand',lineId:id+'.line'+String(i+1).padStart(2,'0'),
   simpleEn,simplePa,nuance:care,
   meaningKind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
   editorialStatus:'DRAFT_AI_UNREVIEWED'});
 }
 anand2130Deep.push({bani:'anand',unitId:id,simpleEn:en,simplePa:pa,
  study:{focus,closeReading:reading,words,care:studyCare,reflection,teachBack}});
}
// 21 — What it means to face the Guru
add(21,[
 ['When a Sikh truly turns toward the Guru, that person becomes Guru-facing in life.',
  'ਜਦੋਂ ਕੋਈ ਸਿੱਖ ਗੁਰੂ ਵੱਲ ਸੱਚੇ ਦਿਲ ਨਾਲ ਮੁੜਦਾ ਹੈ, ਉਹ ਸਨਮੁਖ ਹੋ ਜਾਂਦਾ ਹੈ।'],
 ['To be genuinely Guru-facing is to keep the Guru close within the heart.',
  'ਅਸਲ ਸਨਮੁਖ ਸਿੱਖ ਮਨੋਂ ਗੁਰੂ ਦੇ ਨਾਲ ਜੁੜਿਆ ਰਹਿੰਦਾ ਹੈ।'],
 ['That Sikh remembers the Guru’s feet inwardly, holding the teaching in the heart and soul.',
  'ਉਹ ਗੁਰੂ ਦੇ ਚਰਨਾਂ ਦੀ ਯਾਦ ਹਿਰਦੇ ਤੇ ਅੰਤਰ ਆਤਮੇ ਵਿੱਚ ਵਸਾਉਂਦਾ ਹੈ।'],
 ['Letting go of selfish pride, the Sikh remains under the Guru’s refuge and seeks no higher guide.',
  'ਆਪਾ-ਭਾਵ ਛੱਡ ਕੇ ਉਹ ਗੁਰੂ ਦੀ ਸ਼ਰਨ ਵਿੱਚ ਰਹਿੰਦਾ ਤੇ ਹੋਰ ਅੰਤਿਮ ਆਸਰਾ ਨਹੀਂ ਭਾਲਦਾ।'],
 ['Nanak says: listen, seekers—such is the Sikh who genuinely faces the Guru.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਹੇ ਸੰਤੋ, ਇਹੀ ਸੱਚਾ ਸਨਮੁਖ ਸਿੱਖ ਹੈ।']
],[
 'Being sanmukh means orienting one’s heart and conduct toward the Guru, not merely appearing religious.',
 'ਸਨਮੁਖ ਹੋਣਾ ਕੇਵਲ ਬਾਹਰਲਾ ਰੂਪ ਨਹੀਂ; ਮਨ ਤੇ ਆਚਰਨ ਨੂੰ ਗੁਰੂ ਦੀ ਸਿੱਖਿਆ ਨਾਲ ਜੋੜਨਾ ਹੈ।',
 'An inward relationship rather than an external label.',
 'The first and last lines define sanmukh as facing the Guru. The middle three explain its lived meaning: staying near in one’s heart, remembering the Guru’s feet and setting down self-centred pride. Spiritual refuge is described as a sustained orientation, not as obedience to any unaccountable individual.',
 [['ਸਨਮੁਖੁ','Facing or turning toward the Guru'],['ਹਿਰਦੈ','Within the heart']],
 'An instruction to relinquish ego is not authorization for a religious leader to coerce, exploit or isolate a person; it refers to the Guru’s teaching in context.',
 'What action today would show the difference between saying I follow a teaching and living it?',
 'Which inner qualities define sanmukh in lines two through four?'
], 'The Guru’s feet are a symbol of humble learning and refuge, not a mandatory physical gesture to another person.');

// 22 — The danger of turning away from the Guru
add(22,[
 ['One who turns away from the Guru is described as unable to find liberation without the True Guru.',
  'ਜੋ ਗੁਰੂ ਤੋਂ ਵੇਮੁਖ ਹੁੰਦਾ ਹੈ, ਬਾਣੀ ਕਹਿੰਦੀ ਹੈ ਕਿ ਸਤਿਗੁਰੂ ਤੋਂ ਬਿਨਾਂ ਮੁਕਤੀ ਨਹੀਂ ਪਾਂਦਾ।'],
 ['Seek the counsel of discerning people: liberation is not found through another shortcut.',
  'ਬਿਬੇਕ ਵਾਲਿਆਂ ਤੋਂ ਪੁੱਛੋ; ਗੁਰੂ ਦੀ ਸੇਧ ਤੋਂ ਬਿਨਾਂ ਹੋਰ ਸੌਖਾ ਰਸਤਾ ਮੁਕਤੀ ਨਹੀਂ ਦਿੰਦਾ।'],
 ['Without the True Guru, the person is pictured wandering in confusion through many births.',
  'ਸਤਿਗੁਰੂ ਤੋਂ ਬਿਨਾਂ ਜੀਵ ਨੂੰ ਭਰਮ ਤੇ ਅਨੇਕ ਜੂਨਾਂ ਵਿੱਚ ਭਟਕਦਾ ਦਿਖਾਇਆ ਹੈ।'],
 ['Turning again toward the Guru’s feet, and listening to the Shabad, opens the way to liberation.',
  'ਮੁੜ ਗੁਰੂ ਦੀ ਸ਼ਰਨ ਆ ਕੇ ਅਤੇ ਸ਼ਬਦ ਸੁਣ ਕੇ ਮੁਕਤੀ ਦਾ ਰਾਹ ਖੁੱਲ੍ਹਦਾ ਹੈ।'],
 ['Nanak says: reflect carefully—the Guru’s guidance is central to this release.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਵਿਚਾਰ ਕੇ ਦੇਖੋ, ਸਤਿਗੁਰੂ ਦੀ ਸੇਧ ਮੁਕਤੀ ਲਈ ਕੇਂਦਰੀ ਹੈ।']
],[
 'The pauri contrasts turning away from the Guru with returning to the Guru’s Shabad for freedom.',
 'ਇਹ ਪਉੜੀ ਗੁਰੂ ਤੋਂ ਦੂਰ ਹੋਣ ਅਤੇ ਮੁੜ ਗੁਰੂ ਦੇ ਸ਼ਬਦ ਨਾਲ ਜੁੜਨ ਦੇ ਫ਼ਰਕ ਨੂੰ ਸਮਝਾਉਂਦੀ ਹੈ।',
 'Vemukh and sanmukh as paired teachings.',
 'This pauri deliberately answers Pauri 21. Rather than listing outward marks of a Sikh, it speaks about estrangement, recurring confusion and the possibility of return through the Guru’s Shabad. It is a theological picture of liberation, not a licence to shame someone who has questions or a different religious background.',
 [['ਵੇਮੁਖੁ','Turned away or estranged from the Guru'],['ਮੁਕਤਿ','Liberation or release in spiritual teaching']],
 'Do not turn a Sikh source’s liberation teaching into declarations that members of other faiths are inferior, or use it to pressure a person into unsafe obedience.',
 'When have I turned away from helpful guidance, and what helped me return?',
 'How does the fourth line offer a way back after the first three describe estrangement?'
], 'The imagery of repeated births is a Sikh religious teaching, not a scientifically established description of every individual’s fate.');

// 23 — True Bani, receiving it with grace
add(23,[
 ['Come, beloved Sikhs of the True Guru, and sing the true Bani.',
  'ਆਓ ਸਤਿਗੁਰੂ ਦੇ ਪਿਆਰੇ ਸਿੱਖੋ, ਸੱਚੀ ਬਾਣੀ ਗਾਵੋ।'],
 ['Sing the Guru’s Bani, praised here as highest among teachings.',
  'ਗੁਰੂ ਦੀ ਬਾਣੀ ਗਾਵੋ, ਜਿਸ ਨੂੰ ਇਸ ਪਉੜੀ ਵਿੱਚ ਸਭ ਤੋਂ ਉੱਚਾ ਦੱਸਿਆ ਹੈ।'],
 ['For those blessed by Divine grace, this Bani comes to dwell within the heart.',
  'ਜਿਨ੍ਹਾਂ ਉੱਤੇ ਨਦਰਿ ਕਰਮ ਹੁੰਦੀ ਹੈ, ਉਨ੍ਹਾਂ ਦੇ ਹਿਰਦੇ ਵਿੱਚ ਇਹ ਬਾਣੀ ਵੱਸਦੀ ਹੈ।'],
 ['Drink the spiritual amrit, remain coloured in Hari’s love and remember Sarangpani.',
  'ਆਤਮਕ ਅੰਮ੍ਰਿਤ ਪੀਓ, ਹਰਿ ਦੇ ਪ੍ਰੇਮ-ਰੰਗ ਵਿੱਚ ਰਹੋ ਤੇ ਸਾਰਿਗਪਾਣੀ ਨੂੰ ਸਿਮਰੋ।'],
 ['Nanak says: continue singing this true Bani.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਇਹ ਸੱਚੀ ਬਾਣੀ ਸਦਾ ਗਾਉਂਦੇ ਰਹੋ।']
],[
 'The sangat is invited to sing, receive and inwardly live the Guru’s true Bani.',
 'ਸੰਗਤ ਨੂੰ ਸੱਚੀ ਗੁਰਬਾਣੀ ਗਾਉਣ, ਸੁਣਨ ਤੇ ਹਿਰਦੇ ਵਿੱਚ ਵਸਾਉਣ ਦਾ ਸੱਦਾ ਹੈ।',
 'Singing as a form of attentive learning.',
 'The repeated invitation to sing Bani frames the pauri. The central lines move from vocal singing to grace, dwelling within the heart, and the imagery of drinking amrit and being coloured by Hari. Thus the teaching is not merely musical performance: it is attentive remembrance in a shared community.',
 [['ਬਾਣੀ','The Guru’s sacred Word in this source context'],['ਨਦਰਿ','A gracious or compassionate gaze']],
 'Amrit here is poetic/spiritual nourishment; do not turn it into a supplement, magic drink, medical promise or claim about a particular singer’s virtue.',
 'When I read or sing, am I also allowing the teaching to guide a real choice?',
 'Which line shifts the focus from audible singing to Bani dwelling in the heart?'
], 'The divine name Sarangpani has a traditional theological history that warrants qualified Sikh/Punjabi lexical review.');

// PAURI 24: source U+F03D under review; NO NEW notes or whole-pauri Study.

// 25 — Guru’s Word as a jewel set with diamonds
add(25,[
 ['The Guru’s Shabad is a jewel, described as set with precious diamonds.',
  'ਗੁਰੂ ਦਾ ਸ਼ਬਦ ਹੀਰਾ-ਜੜਿਆ ਕੀਮਤੀ ਰਤਨ ਦੱਸਿਆ ਹੈ।'],
 ['When the mind becomes attached to this precious Shabad, it enters a deeply fitting relationship.',
  'ਜਦ ਮਨ ਸ਼ਬਦ-ਰਤਨ ਨਾਲ ਜੁੜਦਾ ਹੈ, ਉਸ ਨੂੰ ਅੰਦਰਲਾ ਮਿਲਾਪ ਮਿਲਦਾ ਹੈ।'],
 ['The mind meeting the Shabad comes to love the True One.',
  'ਸ਼ਬਦ ਨਾਲ ਮਨ ਮਿਲੇ ਤਾਂ ਸੱਚੇ ਪ੍ਰਭੂ ਨਾਲ ਪਿਆਰ ਬਣਦਾ ਹੈ।'],
 ['The Divine is both the jewel and the precious stone, making this known to those granted understanding.',
  'ਪ੍ਰਭੂ ਆਪ ਹੀਰਾ ਤੇ ਰਤਨ ਹੈ ਅਤੇ ਜਿਸ ਨੂੰ ਸਮਝ ਬਖ਼ਸ਼ਦਾ ਹੈ, ਉਹ ਇਹ ਜਾਣਦਾ ਹੈ।'],
 ['Nanak repeats: the Guru’s Shabad is a diamond-studded jewel.',
  'ਨਾਨਕ ਮੁੜ ਆਖਦੇ ਹਨ: ਗੁਰੂ ਦਾ ਸ਼ਬਦ ਹੀਰੇ ਨਾਲ ਜੜਿਆ ਰਤਨ ਹੈ।']
],[
 'The Guru’s priceless Shabad becomes a lasting source of inward love and understanding of the True One.',
 'ਗੁਰੂ ਦਾ ਬੇਮੋਲ ਸ਼ਬਦ ਮਨ ਨੂੰ ਸੱਚੇ ਪ੍ਰਭੂ ਨਾਲ ਪਿਆਰ ਵਿੱਚ ਜੋੜਦਾ ਹੈ।',
 'A precious jewel as an image for transformative wisdom.',
 'The first and final lines repeat the jewel-and-diamond image. The middle connects that preciousness to the mind’s growing attachment to the Guru’s Word, love for the True One, and understanding bestowed by the Divine. This metaphor conveys enduring value, not a literal mineral hidden in scripture.',
 [['ਰਤੰਨੁ','A precious jewel or treasure'],['ਸਬਦੁ','Guru’s Shabad, Word or teaching']],
 'No physical gem, financial investment or magical gem power is being promised by this imagery. Exact morphology of the jeweled phrase needs review.',
 'What kind of wisdom has greater value to me than a temporary possession?',
 'Why might the poet describe the Shabad as a jewel rather than as a price?'
], 'The jewel imagery is poetic and does not imply selling physical objects or paywalling Gurbani.');

// 26 — Hukam, bondage and understanding
add(26,[
 ['The Creator brought forth the relationship of Shiva and Shakti and set Hukam into motion.',
  'ਕਰਤਾਰ ਨੇ ਸਿਵ-ਸ਼ਕਤੀ ਦੀ ਰਚਨਾ ਕਰ ਕੇ ਆਪਣਾ ਹੁਕਮ ਵਰਤਾਇਆ ਦੱਸਿਆ ਹੈ।'],
 ['The One enacts and witnesses Hukam, revealing its meaning to some through Guru-oriented awareness.',
  'ਉਹ ਆਪ ਹੁਕਮ ਵਰਤਾਉਂਦਾ ਤੇ ਵੇਖਦਾ ਹੈ; ਗੁਰਮੁਖ ਨੂੰ ਉਸ ਦੀ ਸਮਝ ਬਖ਼ਸ਼ਦਾ ਹੈ।'],
 ['Bondage breaks and freedom becomes possible when the Shabad comes to dwell in the mind.',
  'ਜਦ ਸ਼ਬਦ ਮਨ ਵਿੱਚ ਵੱਸਦਾ ਹੈ, ਬੰਧਨ ਟੁੱਟਦੇ ਤੇ ਮੁਕਤੀ ਦਾ ਰਾਹ ਖੁੱਲ੍ਹਦਾ ਹੈ।'],
 ['Those whom the One makes Guru-oriented come to focus their love upon the One.',
  'ਜਿਸ ਨੂੰ ਉਹ ਗੁਰਮੁਖ ਬਣਾਉਂਦਾ ਹੈ, ਉਸ ਦੀ ਲਿਵ ਇੱਕ ਪ੍ਰਭੂ ਨਾਲ ਜੁੜਦੀ ਹੈ।'],
 ['Nanak says: the Creator alone makes Hukam understood.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਕਰਤਾਰ ਆਪ ਹੀ ਆਪਣੇ ਹੁਕਮ ਦੀ ਸੂਝ ਦਿੰਦਾ ਹੈ।']
],[
 'Hukam, Shabad and the Guru-oriented mind lead toward freedom from inner bondage.',
 'ਹੁਕਮ ਦੀ ਸਮਝ, ਸ਼ਬਦ ਅਤੇ ਗੁਰਮੁਖ ਜੀਵਨ ਬੰਧਨਾਂ ਤੋਂ ਛੁਟਕਾਰੇ ਵੱਲ ਲੈ ਜਾਂਦੇ ਹਨ।',
 'The Creator as source of order and inner freedom.',
 'The first two lines name creation and the operation of Hukam. The third shifts the focus from cosmic description to individual spiritual bondage. The fourth speaks of a person drawn to the One, and the last credits the Creator with granting understanding. The Shiva–Shakti expression is a complex historical religious idiom.',
 [['ਹੁਕਮੁ','Divine order or command in context'],['ਬੰਧਨ','Bondage or attachment']],
 'Shiva/Shakti here must be interpreted carefully within Gurbani and not treated as a literal scientific description of cosmic forces or an attack on other communities.',
 'What kind of attachment might loosen when I remember a principle larger than my ego?',
 'Which line turns the subject from the Creator’s universal Hukam toward an inward change?'
], 'Release from bondage is a religious image, not a statement about legally or medically removing a person’s constraints.');

// 27 — Different texts, inward essence, awakening
add(27,[
 ['Scriptures and codes discuss merit and wrongdoing, yet their discussions alone do not uncover the deepest essence.',
  'ਸਿਮ੍ਰਿਤੀਆਂ ਤੇ ਸ਼ਾਸਤਰ ਪੁੰਨ-ਪਾਪ ਦੀ ਚਰਚਾ ਕਰਦੇ ਹਨ, ਪਰ ਕੇਵਲ ਚਰਚਾ ਨਾਲ ਤੱਤ ਦੀ ਸਾਰ ਨਹੀਂ ਮਿਲਦੀ।'],
 ['Without the Guru, the essential understanding remains unknown.',
  'ਗੁਰੂ ਤੋਂ ਬਿਨਾਂ ਅਸਲ ਤੱਤ ਦੀ ਸੂਝ ਨਹੀਂ ਪੈਂਦੀ।'],
 ['The world is pictured asleep in confusion through the three qualities as the night of life passes.',
  'ਤਿੰਨ ਗੁਣਾਂ ਦੇ ਭਰਮ ਵਿੱਚ ਸੰਸਾਰ ਸੁੱਤਾ ਰਹਿੰਦਾ ਹੈ ਤੇ ਜੀਵਨ ਦੀ ਰਾਤ ਲੰਘਦੀ ਜਾਂਦੀ ਹੈ।'],
 ['Through the Guru’s grace, those whose minds hold Hari awaken and speak life-giving Bani.',
  'ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਜਿਨ੍ਹਾਂ ਦੇ ਮਨ ਵਿੱਚ ਹਰਿ ਵੱਸਦਾ ਹੈ, ਉਹ ਜਾਗਦੇ ਤੇ ਅੰਮ੍ਰਿਤ ਬਾਣੀ ਬੋਲਦੇ ਹਨ।'],
 ['Nanak says the essence is found by those who remain lovingly attentive to Hari through day and night.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਜੋ ਹਰ ਵੇਲੇ ਹਰਿ ਦੀ ਲਿਵ ਵਿੱਚ ਜਾਗਦੇ ਰਹਿੰਦੇ ਹਨ, ਉਹ ਤੱਤ ਨੂੰ ਪਛਾਣਦੇ ਹਨ।']
],[
 'The deepest essence is not merely argued about in scripture; it is understood through the Guru and a wakeful life of Naam.',
 'ਤੱਤ ਦੀ ਅਸਲ ਸਮਝ ਕੇਵਲ ਸ਼ਾਸਤਰੀ ਚਰਚਾ ਨਾਲ ਨਹੀਂ; ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਤੇ ਹਰਿ ਨਾਲ ਲਿਵ ਰਾਹੀਂ ਆਉਂਦੀ ਹੈ।',
 'From discussion to lived awakening.',
 'The first two lines question reliance on book knowledge alone. The third portrays people asleep within confusion as the night passes. The fourth and fifth introduce an awakening through grace, Bani, and steadfast awareness. The imagery holds learning and transformation together rather than rejecting thoughtful study.',
 [['ਤਤੈ','The essential or ultimate truth'],['ਅੰਮ੍ਰਿਤ','Nectar-like, life-giving quality of spiritual Bani']],
 'The “three qualities” are a traditional framework, not a modern psychological diagnosis. The poem critiques insufficient engagement, not the human worth of other scriptural traditions.',
 'How can studying a teaching become a change in how I act?',
 'Which line marks the transition from sleeping in confusion to awakening?'
], '“Awake all night” is spiritual vigilance imagery, not instruction to deprive oneself of sleep.');

// 28 — Sustenance in the womb and gratitude
add(28,[
 ['Why forget the One who cared for you even within your mother’s womb?',
  'ਜਿਸ ਪ੍ਰਭੂ ਨੇ ਮਾਂ ਦੇ ਗਰਭ ਵਿੱਚ ਵੀ ਤੇਰੀ ਸੰਭਾਲ ਕੀਤੀ, ਉਸ ਨੂੰ ਕਿਉਂ ਭੁੱਲੀਏ?'],
 ['Why forget so great a Giver, who supplied nourishment amid the womb’s fiery imagery?',
  'ਇੰਨੇ ਵੱਡੇ ਦਾਤਾਰ ਨੂੰ ਕਿਉਂ ਵਿਸਾਰੀਏ, ਜੋ ਗਰਭ ਦੀ ਅੱਗ ਵਾਲੀ ਤਸਵੀਰ ਵਿੱਚ ਵੀ ਆਹਾਰ ਪਹੁੰਚਾਉਂਦਾ ਹੈ?'],
 ['The one whom the Divine joins to loving remembrance is pictured as protected from harm.',
  'ਜਿਸ ਜੀਵ ਨੂੰ ਪ੍ਰਭੂ ਆਪਣੀ ਲਿਵ ਨਾਲ ਜੋੜਦਾ ਹੈ, ਉਸ ਨੂੰ ਨੁਕਸਾਨ ਤੋਂ ਬਚਿਆ ਹੋਇਆ ਦੱਸਿਆ ਹੈ।'],
 ['The One itself gives this attunement; through the Guru, continue remembering.',
  'ਪ੍ਰਭੂ ਆਪ ਹੀ ਲਿਵ ਜੋੜਦਾ ਹੈ; ਗੁਰਮੁਖ ਹੋ ਕੇ ਉਸ ਨੂੰ ਸਦਾ ਯਾਦ ਰੱਖ।'],
 ['Nanak repeats: why forget such a generous Giver?',
  'ਨਾਨਕ ਮੁੜ ਪੁੱਛਦੇ ਹਨ: ਇੰਨੇ ਵੱਡੇ ਦਾਤਾਰ ਨੂੰ ਮਨੋਂ ਕਿਉਂ ਭੁਲਾਈਏ?']
],[
 'Care from before birth is a poetic reason for gratitude and remembrance of the Divine Giver.',
 'ਜਨਮ ਤੋਂ ਪਹਿਲਾਂ ਦੀ ਸੰਭਾਲ ਦੀ ਤਸਵੀਰ ਪ੍ਰਭੂ ਦੇ ਸ਼ੁਕਰਾਨੇ ਤੇ ਸਿਮਰਨ ਵੱਲ ਸੱਦਾ ਹੈ।',
 'Remembrance through vulnerability and care.',
 'The opening and final lines ask the same question about forgetting the Giver. The centre describes nourishment in the womb and a continuing bond of loving attention through Guru-oriented life. The womb’s heat is a devotional image of vulnerability and care, not an obstetric explanation.',
 [['ਉਦਰ','Womb or abdomen in context'],['ਪ੍ਰਤਿਪਾਲ','Sustaining care or nurture']],
 'Do not infer a promise of risk-free pregnancy, protection from congenital disease or medical immunity. The mother and child both deserve ordinary health care and support.',
 'What kindness and care in my life have I begun taking for granted?',
 'What repeated question binds this pauri together?'
], 'Pregnancy imagery does not constitute medical guidance or a description of fetal physiology.');

// 29 — The fire of Maya outside the womb
add(29,[
 ['The fire pictured inside the womb is compared with Maya’s compelling fire in the world outside.',
  'ਗਰਭ ਦੇ ਅੰਦਰਲੀ ਅੱਗ ਦੀ ਤੁਲਨਾ ਬਾਹਰਲੀ ਮਾਇਆ ਦੀ ਅੱਗ ਨਾਲ ਕੀਤੀ ਹੈ।'],
 ['The Creator arranged this poetic play, making both kinds of burning appear alike.',
  'ਕਰਤਾਰ ਨੇ ਇਹ ਖੇਲ ਰਚਿਆ ਹੈ; ਦੋਹਾਂ ਅੱਗਾਂ ਨੂੰ ਇਕੋ ਜਿਹਾ ਦਿਖਾਇਆ ਹੈ।'],
 ['When it pleased the One, the child was born and welcomed affectionately by family.',
  'ਜਦ ਪ੍ਰਭੂ ਦੀ ਰਜ਼ਾ ਹੋਈ, ਜੀਵ ਜੰਮਿਆ ਅਤੇ ਪਰਿਵਾਰ ਨੂੰ ਪਿਆਰਾ ਲੱਗਾ।'],
 ['The loving inward connection loosens and a thirst for Maya and craving begins to govern life.',
  'ਅੰਦਰਲੀ ਲਿਵ ਛੁੱਟਦੀ ਹੈ ਅਤੇ ਤ੍ਰਿਸ਼ਨਾ ਤੇ ਮਾਇਆ ਦਾ ਮੋਹ ਮਨ ਉੱਤੇ ਹਾਵੀ ਹੋ ਜਾਂਦਾ ਹੈ।'],
 ['Maya is the attachment that makes one forget Hari and turn toward a second, competing love.',
  'ਇਹ ਉਹ ਮਾਇਆ ਹੈ ਜਿਸ ਵਿੱਚ ਹਰਿ ਭੁੱਲ ਜਾਂਦਾ ਤੇ ਦੂਜੇ ਮੋਹ ਨਾਲ ਮਨ ਜੁੜ ਜਾਂਦਾ ਹੈ।'],
 ['Nanak says those joined to Hari through Guru’s grace discover a path even while living amid Maya.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਜਿਨ੍ਹਾਂ ਦੀ ਲਿਵ ਜੁੜਦੀ ਹੈ, ਉਹ ਮਾਇਆ ਵਿੱਚ ਰਹਿ ਕੇ ਵੀ ਰਾਹ ਲੱਭ ਲੈਂਦੇ ਹਨ।']
],[
 'Life outside the womb brings Maya and forgetfulness, yet Guru’s grace permits remembrance within ordinary life.',
 'ਜਨਮ ਮਗਰੋਂ ਮਾਇਆ ਦਾ ਮੋਹ ਮਨ ਨੂੰ ਭੁਲਾ ਸਕਦਾ ਹੈ, ਪਰ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਇਸੇ ਜੀਵਨ ਵਿੱਚ ਨਾਮ ਨਾਲ ਜੁੜਿਆ ਜਾ ਸਕਦਾ ਹੈ।',
 'The two fires and returning to connection.',
 'This stanza follows Pauri 28’s womb imagery. The first two compare the inward and worldly “fires”; the middle depicts birth, familial love and the arising of craving. The fifth defines harmful Maya as forgetfulness of Hari, and the sixth offers an important hope: the connection can return through the Guru while one still lives in the world.',
 [['ਤ੍ਰਿਸਨਾ','Craving or unfulfilled thirst'],['ਲਿਵ','Loving focused attunement or remembrance']],
 'Do not imply that parenting or family affection causes a clinical disorder or that the physical womb literally burns. Maya describes attachment that displaces remembrance, not children or women.',
 'How can I enjoy everyday responsibilities without letting craving direct my whole life?',
 'How does the final line complicate a simple story that the material world is entirely bad?'
], '“Fire” and “Maya” remain spiritual imagery; no literal temperature, fetal trauma or clinical mechanism is being described.');

// 30 — The Priceless One and loss of ego
add(30,[
 ['Hari is beyond price; no one can fully determine the worth of the Divine.',
  'ਹਰਿ ਆਪ ਅਮੁਲਕ ਹੈ; ਕੋਈ ਉਸ ਦਾ ਪੂਰਾ ਮੁੱਲ ਨਹੀਂ ਪਾ ਸਕਦਾ।'],
 ['No human can set that price, even when many remain anxious to measure it.',
  'ਕੋਈ ਉਸ ਦਾ ਮੁੱਲ ਨਹੀਂ ਲੱਭ ਸਕਦਾ, ਭਾਵੇਂ ਲੋਕ ਕੋਸ਼ਿਸ਼ ਕਰਦੇ ਫਿਰਨ।'],
 ['If one meets such a True Guru, offer one’s pride and self-importance, letting the ego fall away.',
  'ਅਜਿਹਾ ਸਤਿਗੁਰੂ ਮਿਲੇ ਤਾਂ ਆਪਾ ਤੇ ਹਉਮੈ ਛੱਡ ਕੇ ਉਸ ਦੀ ਸਿੱਖਿਆ ਅੱਗੇ ਨਿਮਰ ਹੋਈਏ।'],
 ['The life given by the Divine remains united with its true Source, and Hari comes to dwell within the mind.',
  'ਜਿਸ ਪ੍ਰਭੂ ਦਾ ਇਹ ਜੀਵਨ ਹੈ, ਉਸ ਨਾਲ ਮਨ ਜੁੜਦਾ ਤੇ ਹਰਿ ਮਨ ਵਿੱਚ ਵੱਸਦਾ ਹੈ।'],
 ['Nanak says the fortunate are those who receive the priceless Hari in their lives.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਭਾਗਾਂ ਵਾਲੇ ਉਹ ਹਨ ਜਿਨ੍ਹਾਂ ਨੂੰ ਅਮੁਲਕ ਹਰਿ ਦੀ ਦਾਤ ਮਿਲਦੀ ਹੈ।']
],[
 'No worldly price can measure the Divine; the Guru points the mind from ego toward closeness with Hari.',
 'ਪ੍ਰਭੂ ਦਾ ਮੁੱਲ ਨਹੀਂ ਪਾਇਆ ਜਾ ਸਕਦਾ; ਗੁਰੂ ਦੀ ਸੇਧ ਹਉਮੈ ਛੱਡ ਕੇ ਹਰਿ ਨਾਲ ਜੁੜਨ ਦੀ ਹੈ।',
 'Worth beyond commerce and surrender of ego.',
 'The first two lines deny that the Divine can be priced. The third says that meeting the True Guru calls for a giving-up of self-importance, and the next two turn toward relationship, Hari dwelling in the mind and the privilege of receiving that priceless gift. The metaphor is not a financial transaction or transfer of authority to a human.',
 [['ਅਮੁਲਕੁ','Priceless or beyond monetary valuation'],['ਸਿਰੁ','Head, used for humble offering of oneself in this context']],
 'The phrase “give one’s head” is traditional devotion and cannot justify coercion, self-harm, surrender of rights, money or bodily safety to another person.',
 'What matters to me that has value no price tag can express?',
 'How is letting go of ego connected to the poem’s insistence that Hari is priceless?'
], 'The symbol of surrender is devotional, not authorization to injure oneself or obey unsafe human commands.');
