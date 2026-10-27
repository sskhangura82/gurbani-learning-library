/* GLP-001 Anand Sahib Pauris 8–20: personally authored English/Punjabi
 * educational paraphrases and separate deeper Study units.
 * NOT a copied translation or religiously approved explanation.
 * No original Gurmukhi source text duplicated here.
 * Exact occurrence IDs, word presence, UTF-8 SHA and frozen digital edition
 * are verified by the deterministic compiler. No guess for held Pauri24.
 */
export const anandNewLines=[];
export const anandNewDeep=[];
function add(n,lines,study,care){
 const id='anand'+String(n).padStart(2,'0');
 if(![5,6].includes(lines.length))throw Error('Unusual Anand source line count '+id);
 const [simpleEn,simplePa,focus,closeReading,words,studyCare,reflection,teachBack]=study;
 if(words.length<2)throw Error('Working vocabulary missing '+id);
 for(let i=0;i<lines.length;i++){
  const [en,pa]=lines[i];
  anandNewLines.push({bani:'anand',lineId:id+'.line'+String(i+1).padStart(2,'0'),
   simpleEn:en,simplePa:pa,nuance:care,
   meaningKind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
   editorialStatus:'DRAFT_AI_UNREVIEWED'});
 }
 anandNewDeep.push({bani:'anand',unitId:id,simpleEn,simplePa,study:{
  focus,closeReading,words,care:studyCare,reflection,teachBack}});
}
// Pauri 8 · Receiving Naam through grace, not bargaining for it
add(8,[
 ['O revered One, only the person to whom You grant this gift can truly receive it.',
  'ਹੇ ਬਾਬਾ, ਜਿਸ ਮਨੁੱਖ ਨੂੰ ਤੂੰ ਦਾਤ ਦੇਂਦਾ ਹੈਂ, ਉਹੀ ਉਸ ਨੂੰ ਪ੍ਰਾਪਤ ਕਰਦਾ ਹੈ।'],
 ['Only those You give to receive it; what power have others to secure it by themselves?',
  'ਜਿਸ ਨੂੰ ਤੂੰ ਬਖ਼ਸ਼ਦਾ ਹੈਂ, ਉਹੀ ਪਾਉਂਦਾ ਹੈ; ਹੋਰ ਵਿਚਾਰੇ ਆਪਣੇ ਜ਼ੋਰ ਨਾਲ ਕੀ ਕਰ ਸਕਦੇ ਹਨ?'],
 ['Some wander confused in many directions, while others are shaped and steadied by Naam.',
  'ਕਈ ਭਰਮ ਵਿੱਚ ਦਸੀਂ ਪਾਸੀਂ ਭਟਕਦੇ ਹਨ; ਕੁਝ ਨਾਮ ਨਾਲ ਜੁੜ ਕੇ ਸੰਵਰ ਜਾਂਦੇ ਹਨ।'],
 ['By the Guru’s grace the mind becomes clear, and those people come to accept Your will.',
  'ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਮਨ ਨਿਰਮਲ ਹੁੰਦਾ ਹੈ ਤੇ ਮਨੁੱਖ ਤੇਰੀ ਰਜ਼ਾ ਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹੈ।'],
 ['Nanak repeats: O Beloved, the person You bless is the one who receives the gift.',
  'ਨਾਨਕ ਮੁੜ ਆਖਦੇ ਹਨ: ਹੇ ਪਿਆਰੇ ਪ੍ਰਭੂ, ਜਿਸ ਨੂੰ ਤੂੰ ਬਖ਼ਸ਼ੇਂ, ਉਹੀ ਇਹ ਦਾਤ ਪਾਉਂਦਾ ਹੈ।']
],[
 'The gift of Naam is received through the Divine and Guru’s grace, not won by anxious effort alone.',
 'ਨਾਮ ਦੀ ਦਾਤ ਪ੍ਰਭੂ ਤੇ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਮਿਲਦੀ ਹੈ; ਕੇਵਲ ਆਪਣੀ ਚਤੁਰਾਈ ਨਾਲ ਨਹੀਂ।',
 'Gift, wandering and acceptance of Hukam.',
 'The first two lines repeat that the gift is granted, then contrast wandering in bewilderment with lives being shaped through Naam. The fourth connects a clear mind with Guru’s grace and accepting bhana. The final line circles back to the opening, making grace the pauri’s recurring theme.',
 [['ਭਰਮਿ','In confusion or delusion'],['ਭਾਣਾ','The Divine will; acceptance in this devotional context']],
 'This is religious language about grace and agency, not a reason to deny individual responsibility or fail to seek practical assistance.',
 'Where does striving help me, and where do I need humility about outcomes?',
 'What contrast does Pauri 8 draw between wandering and living in Naam?'
], '“Bhana” and “Naam” require source-specific Sikh theological review; receiving grace is not a guarantee of a desired worldly outcome.');

// Pauri 9 · The unsayable Divine, lived rather than mastered
add(9,[
 ['Come, beloved saintly friends; let us speak together of the One who cannot fully be described.',
  'ਆਓ ਪਿਆਰੇ ਸੰਤੋ, ਅਸੀਂ ਉਸ ਅਕਥ ਪ੍ਰਭੂ ਦੀ ਵਡਿਆਈ ਦੀ ਗੱਲ ਕਰੀਏ।'],
 ['Let us speak of the Ineffable One—and ask by what doorway this understanding is found.',
  'ਅਕਥ ਦੀ ਕਥਾ ਕਰੀਏ; ਇਹ ਸਮਝ ਕਿਸ ਦੁਆਰ ਰਾਹੀਂ ਮਿਲਦੀ ਹੈ, ਇਸ ਦੀ ਭਾਲ ਕਰੀਏ।'],
 ['By offering body, mind and possessions to the Guru and following Hukam, one comes to this path.',
  'ਤਨ, ਮਨ ਅਤੇ ਧਨ ਗੁਰੂ ਅੱਗੇ ਸਮਰਪਿਤ ਕਰਕੇ, ਹੁਕਮ ਮੰਨਣ ਨਾਲ ਇਹ ਰਾਹ ਮਿਲਦਾ ਹੈ।'],
 ['Accept the Guru’s teaching and sing the true Bani.',
  'ਗੁਰੂ ਦਾ ਹੁਕਮ ਮੰਨੋ ਅਤੇ ਸੱਚੀ ਬਾਣੀ ਗਾਵੋ।'],
 ['Nanak says: listen, beloved seekers, and continue sharing this wonder of the Unsayable.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਹੇ ਸੰਤੋ, ਸੁਣੋ ਅਤੇ ਅਕਥ ਪ੍ਰਭੂ ਦੀ ਗੱਲ ਸਾਂਝੀ ਕਰੋ।']
],[
 'The pauri invites the sangat to approach the indescribable Divine through Guru, Hukam and true Bani.',
 'ਇਹ ਪਉੜੀ ਸੰਗਤ ਨੂੰ ਗੁਰੂ, ਹੁਕਮ ਅਤੇ ਸੱਚੀ ਬਾਣੀ ਰਾਹੀਂ ਅਕਥ ਪ੍ਰਭੂ ਨਾਲ ਜੁੜਨ ਦਾ ਸੱਦਾ ਦਿੰਦੀ ਹੈ।',
 'Community, surrender and the limits of speech.',
 'The repeated invitation to narrate the “akath” is deliberately paradoxical: the Divine exceeds description, yet the community is called to speak and sing. The centre names offering body, mind and possessions, following Hukam and the Guru’s Bani. It is not a request to surrender property to a person, but spiritual dedication in its scriptural setting.',
 [['ਅਕਥ','Beyond full expression or narration'],['ਹੁਕਮਿ','In or through Divine/Guru-directed order']],
 'Do not use the language of offering wealth or obedience to justify exploitative authority, financial coercion or religious pressure; qualified Sikh review is required.',
 'How can I participate in a shared practice without pretending I understand everything?',
 'Which practical steps follow the question about the “doorway” to the Unsayable?'
], '“Tan man dhan” expresses devotion, not an obligation to transfer money or independence to an unaccountable teacher.');

// Pauri 10 · The restless mind, cleverness and Maya
add(10,[
 ['O restless mind, clever strategies alone have never brought this realization.',
  'ਹੇ ਚੰਚਲ ਮਨ, ਕੇਵਲ ਚਤੁਰਾਈ ਨਾਲ ਕਿਸੇ ਨੇ ਪ੍ਰਭੂ ਦੀ ਪ੍ਰਾਪਤੀ ਨਹੀਂ ਕੀਤੀ।'],
 ['Listen, my mind: cleverness on its own cannot secure the Divine.',
  'ਸੁਣ ਹੇ ਮੇਰੇ ਮਨ, ਸਿਰਫ਼ ਅਕਲ ਦੇ ਚਾਲਾਕ ਢੰਗ ਨਾਲ ਇਹ ਮਿਲਾਪ ਨਹੀਂ ਹੁੰਦਾ।'],
 ['Enchanting Maya can draw people into confusion and make them forget what matters.',
  'ਮੋਹਣੀ ਮਾਇਆ ਮਨੁੱਖ ਨੂੰ ਭਰਮ ਵਿੱਚ ਪਾ ਕੇ ਅਸਲ ਮਕਸਦ ਭੁਲਾ ਸਕਦੀ ਹੈ।'],
 ['The One who created the world also made Maya’s alluring power.',
  'ਜਿਸ ਨੇ ਇਹ ਸ੍ਰਿਸ਼ਟੀ ਰਚੀ, ਉਸੇ ਨੇ ਮਾਇਆ ਦਾ ਮੋਹਕ ਖੇਲ ਬਣਾਇਆ ਹੈ।'],
 ['The speaker bows in wonder before the One who made this attraction appear so sweet.',
  'ਕਵੀ ਉਸ ਕਰਤਾਰ ਤੋਂ ਸਦਕੇ ਜਾਂਦਾ ਹੈ ਜਿਸ ਨੇ ਇਹ ਮੋਹ ਇੰਨਾ ਮਿੱਠਾ ਲਾਇਆ ਹੈ।'],
 ['Nanak returns to the restless mind: mere cleverness does not bring the deepest understanding.',
  'ਨਾਨਕ ਮੁੜ ਚੰਚਲ ਮਨ ਨੂੰ ਆਖਦੇ ਹਨ: ਚਤੁਰਾਈ ਇਕੱਲੀ ਇਹ ਅਸਲ ਸਮਝ ਨਹੀਂ ਦਿੰਦੀ।']
],[
 'The mind’s ingenuity is not sufficient when Maya continually distracts it from remembrance.',
 'ਮਾਇਆ ਦਾ ਮੋਹ ਮਨ ਨੂੰ ਭਟਕਾਉਂਦਾ ਹੈ; ਕੇਵਲ ਚਤੁਰਾਈ ਨਾਲ ਅੰਦਰਲੀ ਸੂਝ ਨਹੀਂ ਮਿਲਦੀ।',
 'The ambivalence of Maya and cleverness.',
 'Opening and closing lines address the mind directly and repeat “chaturai.” Between them Maya is called enchanting and confusion-producing, yet also part of the Creator’s wondrous play. This is a more complex picture than declaring the material world simply bad: the issue is attachment that overtakes discernment.',
 [['ਚੰਚਲਾ','Restless or changeable'],['ਮਾਇਆ','Worldly appearance or the entangling attraction of things, context dependent']],
 'Maya is a rich Sikh theological term; do not equate it simplistically with women, money, sensory experience or psychological illness.',
 'Which kind of cleverness helps me learn, and when does it turn into evasion?',
 'Why does the stanza repeat “chaturai” before and after describing Maya?'
], 'The metaphor of being “charmed” does not imply a literal spell, psychiatric disorder or a condemnation of ordinary family life.');

// Pauri 11 · Remember Truth beyond transient attachments
add(11,[
 ['O beloved mind, remember the True One continually.',
  'ਹੇ ਪਿਆਰੇ ਮਨ, ਸਦਾ ਸੱਚੇ ਪ੍ਰਭੂ ਨੂੰ ਯਾਦ ਰੱਖ।'],
 ['The family you see around you does not accompany you after life ends.',
  'ਜਿਸ ਪਰਿਵਾਰ ਨੂੰ ਤੂੰ ਵੇਖਦਾ ਹੈਂ, ਉਹ ਮੌਤ ਤੋਂ ਬਾਅਦ ਤੇਰੇ ਨਾਲ ਨਹੀਂ ਜਾਵੇਗਾ।'],
 ['Why fasten the whole mind to what cannot accompany you forever?',
  'ਜੋ ਅੰਤ ਤਕ ਨਾਲ ਨਹੀਂ ਜਾਣਾ, ਉਸ ਨਾਲ ਮਨ ਦੀ ਸਾਰੀ ਲਗਨ ਕਿਉਂ ਬੰਨ੍ਹੀਏ?'],
 ['Do not choose actions that will bring remorse at the end.',
  'ਅਜੇਹੇ ਕਰਮ ਨਾ ਕਰ ਜਿਨ੍ਹਾਂ ਲਈ ਅੰਤ ਵਿੱਚ ਪਛਤਾਉਣਾ ਪਵੇ।'],
 ['Listen to the True Guru’s teaching; it can remain with you.',
  'ਸਤਿਗੁਰੂ ਦਾ ਉਪਦੇਸ਼ ਸੁਣ, ਇਹੀ ਅਸਲ ਵਿੱਚ ਤੇਰਾ ਸਾਥ ਦੇ ਸਕਦਾ ਹੈ।'],
 ['Nanak repeats: beloved mind, keep remembering the True One.',
  'ਨਾਨਕ ਮੁੜ ਆਖਦੇ ਹਨ: ਹੇ ਪਿਆਰੇ ਮਨ, ਸਦਾ ਸੱਚ ਨੂੰ ਸੰਭਾਲ।']
],[
 'Love one’s family while remembering that worldly relationships and possessions cannot replace Truth.',
 'ਪਰਿਵਾਰ ਨੂੰ ਪਿਆਰ ਕਰਦਿਆਂ ਵੀ ਸੱਚੇ ਪ੍ਰਭੂ ਦੀ ਯਾਦ ਨੂੰ ਜੀਵਨ ਦਾ ਮੂਲ ਆਸਰਾ ਬਣਾਉ।',
 'What accompanies the mind, and what does not.',
 'The first and last lines frame the pauri as counsel to the mind. Family is mentioned to illuminate impermanence, not to command abandonment. Between the questions about what accompanies us, the poem warns against acts of regret and points to the Guru’s teaching as enduring guidance.',
 [['ਕੁਟੰਬੁ','Family or household'],['ਪਛੋਤਾਈਐ','To feel regret or remorse']],
 'A spiritual verse about impermanence is never permission to neglect children, elders, spouse, safety or legitimate family responsibilities.',
 'What would I do differently today if I remembered which actions I may later regret?',
 'What does the pauri distinguish between loving people and placing absolute dependence on transient ties?'
], 'Do not suggest withdrawing care from family; the text contrasts impermanent ties with moral/spiritual guidance.');

// Pauri 12 · The One beyond reach of the senses
add(12,[
 ['You are beyond ordinary reach and senses; no one has discovered Your full limit.',
  'ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਅਗਮ ਤੇ ਅਗੋਚਰ ਹੈਂ; ਕੋਈ ਤੇਰਾ ਪੂਰਾ ਅੰਤ ਨਹੀਂ ਪਾ ਸਕਿਆ।'],
 ['Only You know Your own depth and extent; no one else has fully measured it.',
  'ਤੂੰ ਆਪਣਾ ਸਰੂਪ ਆਪ ਹੀ ਜਾਣਦਾ ਹੈਂ; ਹੋਰ ਕਿਸੇ ਨੇ ਤੇਰਾ ਅੰਤ ਨਹੀਂ ਲੱਭਿਆ।'],
 ['All beings are part of Your creation; how could anyone describe the whole play?',
  'ਸਾਰੇ ਜੀਵ ਤੇਰੀ ਰਚਨਾ ਦੇ ਖੇਲ ਵਿੱਚ ਹਨ; ਉਸ ਦਾ ਪੂਰਾ ਵਰਣਨ ਕੌਣ ਕਰ ਸਕਦਾ ਹੈ?'],
 ['You speak, behold and pervade creation, O One who brought the world into being.',
  'ਹੇ ਜਗਤ ਦੇ ਸਿਰਜਣਹਾਰ, ਤੂੰ ਹੀ ਬੋਲਣ ਤੇ ਵੇਖਣ ਵਾਲੇ ਹਰ ਰੂਪ ਵਿੱਚ ਵਿਆਪਕ ਹੈਂ।'],
 ['Nanak says: You remain forever beyond human reach; Your fullness cannot be exhausted.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਤੂੰ ਸਦਾ ਅਗੰਮ ਹੈਂ, ਤੇਰਾ ਅੰਤ ਕਦੇ ਪੂਰਾ ਨਹੀਂ ਪਾਇਆ ਜਾ ਸਕਦਾ।']
],[
 'The Creator remains beyond complete description even while all living things appear within the Divine play.',
 'ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਵਿੱਚ ਪ੍ਰਭੂ ਦਾ ਖੇਲ ਦਿੱਸਦਾ ਹੈ, ਪਰ ਮਨੁੱਖੀ ਬੋਲ ਉਸ ਦਾ ਪੂਰਾ ਅੰਤ ਨਹੀਂ ਪਾ ਸਕਦੇ।',
 'Wonder without pretending total knowledge.',
 'The first two lines state the limitation of sense and knowledge; the third describes all life as the Creator’s play. The fourth turns toward Divine immanence: the One is present as speaker and witness in creation. The last repeats the unknowability, holding transcendence and immanence together.',
 [['ਅਗਮ','Beyond easy approach or comprehension'],['ਅਗੋਚਰਾ','Beyond the ordinary senses']],
 'Neither these adjectives nor the cosmic “play” are empirical descriptions of a scientific mechanism. Respect the theological nuance of both presence and unknowability.',
 'Can I remain curious without claiming certainty about everything?',
 'How does this pauri affirm both the One’s presence in creation and the limits of description?'
], 'This is reverent poetry about ineffability and Divine presence, not literal statements about human sensory perception or omniscient surveillance.');

// Pauri 13 · Amrit found through the Guru
add(13,[
 ['Divine beings, people and sages seek the life-giving amrit; that nectar is found through the Guru.',
  'ਦੇਵ, ਮਨੁੱਖ ਤੇ ਮੁਨੀ ਅੰਮ੍ਰਿਤ ਦੀ ਭਾਲ ਕਰਦੇ ਹਨ; ਉਹ ਅੰਮ੍ਰਿਤ ਗੁਰੂ ਤੋਂ ਮਿਲਦਾ ਹੈ।'],
 ['Through the Guru’s grace this amrit is received and the True One comes to dwell within the mind.',
  'ਗੁਰੂ ਨੇ ਕਿਰਪਾ ਕੀਤੀ ਤਾਂ ਇਹ ਅੰਮ੍ਰਿਤ ਮਿਲਿਆ ਤੇ ਸੱਚਾ ਪ੍ਰਭੂ ਮਨ ਵਿੱਚ ਵੱਸਿਆ।'],
 ['You created all living beings; some are drawn to seeing and encountering the Divine.',
  'ਹੇ ਪ੍ਰਭੂ, ਸਾਰੇ ਜੀਵ ਤੂੰ ਰਚੇ; ਕਈ ਦਰਸ਼ਨ ਅਤੇ ਮਿਲਾਪ ਦੀ ਭਾਵਨਾ ਨਾਲ ਆਉਂਦੇ ਹਨ।'],
 ['Greed, covetousness and ego begin to fall away as the True Guru becomes dear.',
  'ਜਦ ਸਤਿਗੁਰੂ ਪਿਆਰਾ ਲੱਗਦਾ ਹੈ ਤਾਂ ਲਾਲਚ, ਲੋਭ ਅਤੇ ਹਉਮੈ ਘਟਣ ਲੱਗਦੇ ਹਨ।'],
 ['Nanak says: the one on whom the Divine is pleased finds this amrit through the Guru.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਜਿਸ ਉੱਤੇ ਪ੍ਰਭੂ ਪ੍ਰਸੰਨ ਹੋਇਆ, ਉਸ ਨੂੰ ਗੁਰੂ ਰਾਹੀਂ ਅੰਮ੍ਰਿਤ ਮਿਲਿਆ।']
],[
 'The amrit sought across the world is spoken of as the Guru’s gift, expressed through truth and release from ego.',
 'ਦੁਨੀਆ ਜਿਸ ਅੰਮ੍ਰਿਤ ਦੀ ਭਾਲ ਕਰਦੀ ਹੈ, ਬਾਣੀ ਉਸ ਨੂੰ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਮਿਲਦੀ ਆਤਮਕ ਦਾਤ ਦੱਸਦੀ ਹੈ।',
 'Search, grace and inner transformation.',
 'The opening lists diverse seekers, while the second line explains that the Guru brings the True One into the mind. The centre turns to creation, and the fourth offers a visible moral sign—greed and ego losing their hold. The final line completes the circle: amrit is received through grace, not purchased as a product.',
 [['ਅੰਮ੍ਰਿਤੁ','Spiritual nectar, often linked to Naam in Gurbani'],['ਅਹੰਕਾਰੁ','Ego or self-importance']],
 'Amrit here is devotional language and must not be misrepresented as a particular ingestible cure, secret supplement, or scientifically measurable substance.',
 'Which desire or pride could I loosen as I reflect on this teaching?',
 'What change of behaviour accompanies the discovery of amrit in line four?'
], '“Amrit” has important Sikh meanings; do not flatten it into an ordinary drink, assert physical immortality or claim the word always has one translation.');

// Pauri 14 · The demanding way of devotion
add(14,[
 ['The path and way of devotees is different from the usual path.',
  'ਭਗਤਾਂ ਦੀ ਜੀਵਨ-ਚਾਲ ਆਮ ਰਸਤੇ ਤੋਂ ਨਿਰਾਲੀ ਹੈ।'],
 ['This unusual way of devotion calls for walking a difficult path.',
  'ਭਗਤੀ ਦੀ ਇਹ ਨਿਰਾਲੀ ਚਾਲ ਔਖੇ ਮਾਰਗ ਉੱਤੇ ਤੁਰਨ ਦੀ ਮੰਗ ਕਰਦੀ ਹੈ।'],
 ['Leave behind grasping, greed, ego and craving; speak less in empty self-display.',
  'ਲਬ, ਲੋਭ, ਹਉਮੈ ਤੇ ਤ੍ਰਿਸ਼ਨਾ ਛੱਡੋ ਅਤੇ ਫ਼ਜ਼ੂਲ ਬੋਲ ਘਟਾਓ।'],
 ['The way is pictured as sharper than a blade and finer than a hair.',
  'ਇਹ ਰਾਹ ਖੰਡੇ ਦੀ ਧਾਰ ਤੋਂ ਵੀ ਤਿੱਖਾ ਤੇ ਵਾਲ ਤੋਂ ਵੀ ਬਾਰੀਕ ਦੱਸਿਆ ਹੈ।'],
 ['Through the Guru’s grace, those who loosen self-centredness find their longings absorbed in Hari.',
  'ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਜਿਨ੍ਹਾਂ ਨੇ ਆਪਣਾ ਆਪਾ ਛੱਡਿਆ, ਉਨ੍ਹਾਂ ਦੀ ਚਾਹ ਹਰਿ ਵਿੱਚ ਟਿਕੀ।'],
 ['Nanak says: in every age the devotee’s way remains distinct.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਜੁਗਾਂ-ਜੁਗਾਂ ਤੋਂ ਭਗਤਾਂ ਦੀ ਚਾਲ ਨਿਰਾਲੀ ਹੈ।']
],[
 'The path of devotion demands humility and reduced greed, not spectacular displays or physical danger.',
 'ਭਗਤੀ ਦੇ ਰਾਹ ਵਿੱਚ ਨਿਮਰਤਾ, ਲੋਭ ਤੋਂ ਦੂਰੀ ਤੇ ਅੰਦਰਲੀ ਸਚਾਈ ਲੋੜੀਂਦੀ ਹੈ, ਨਾ ਕਿ ਦਿਖਾਵਾ।',
 'Discipline framed by grace rather than performance.',
 'The first and last lines repeat that the path is different. The middle describes its difficult inner demands: leaving greed and self-centred habits, restraint in speech, and the imagery of razor-sharp narrowness. The fifth shows Guru’s grace rather than self-punishment as the source of change.',
 [['ਤ੍ਰਿਸਨਾ','Unsatisfied craving or thirst'],['ਖੰਨਿਅਹੁ','A sharpened blade or sword-edge, metaphorically']],
 'Do not promote self-injury, dangerous challenges, extreme fasting or social withdrawal as required devotion. “Sharper than a blade” is not a literal activity.',
 'How could I practise humility without turning it into another achievement?',
 'What practical habits accompany the blade-and-hair imagery?'
], 'The sharp-blade imagery conveys difficulty, not an actual physical task or a test of endurance.');

// Pauri 15 · The Guru’s path and remembrance
add(15,[
 ['O Sovereign, we move as You direct us; how could we fully know all Your virtues?',
  'ਹੇ ਸੁਆਮੀ, ਜਿਵੇਂ ਤੂੰ ਚਲਾਉਂਦਾ ਹੈਂ ਅਸੀਂ ਤਿਵੇਂ ਚੱਲਦੇ ਹਾਂ; ਤੇਰੇ ਸਾਰੇ ਗੁਣ ਕਿਵੇਂ ਜਾਣੀਏ?'],
 ['Those whom You put upon a path move along that path.',
  'ਜਿਨ੍ਹਾਂ ਨੂੰ ਤੂੰ ਰਸਤੇ ਉੱਤੇ ਪਾਉਂਦਾ ਹੈਂ, ਉਹ ਉਸੇ ਰਾਹ ਤੁਰਦੇ ਹਨ।'],
 ['Those whom You join to Naam through grace remember Hari continually.',
  'ਜਿਨ੍ਹਾਂ ਨੂੰ ਤੂੰ ਕਿਰਪਾ ਨਾਲ ਨਾਮ ਨਾਲ ਜੋੜਦਾ ਹੈਂ, ਉਹ ਸਦਾ ਹਰਿ ਨੂੰ ਸਿਮਰਦੇ ਹਨ।'],
 ['Those to whom You share Your own teaching find peace through the Guru’s doorway.',
  'ਜਿਨ੍ਹਾਂ ਨੂੰ ਤੂੰ ਆਪਣੀ ਕਥਾ ਸੁਣਾਉਂਦਾ ਹੈਂ, ਉਹ ਗੁਰੂ ਦੇ ਦੁਆਰੇ ਸੁਖ ਪਾਉਂਦੇ ਹਨ।'],
 ['Nanak says: O True Sovereign, You guide beings as it pleases You.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਹੇ ਸੱਚੇ ਸਾਹਿਬ, ਆਪਣੀ ਰਜ਼ਾ ਅਨੁਸਾਰ ਤੂੰ ਜੀਵਾਂ ਨੂੰ ਰਾਹ ਦਿਖਾਉਂਦਾ ਹੈਂ।']
],[
 'Guidance, grace and remembrance are connected in the poem’s vision of Hukam and the Guru’s teaching.',
 'ਬਾਣੀ ਵਿੱਚ ਰਜ਼ਾ, ਕਿਰਪਾ, ਗੁਰੂ ਦੀ ਸਿੱਖਿਆ ਅਤੇ ਨਾਮ-ਸਿਮਰਨ ਇੱਕ-ਦੂਜੇ ਨਾਲ ਜੁੜੇ ਹਨ।',
 'Hukam as orientation to remembrance.',
 'The pauri opens and closes by acknowledging the Divine direction of life. Between them it names the path, grace that brings Naam, and teaching heard through the Guru. Rather than resignation or passivity, the text describes an actively remembered relationship.',
 [['ਮਾਰਗਿ','On a path or way'],['ਗੁਰਦੁਆਰੈ','Through the Guru’s doorway or presence, context dependent']],
 '“Gurdware” has both textual and institutional uses; do not silently impose one modern architectural reading on every historic occurrence.',
 'What does it mean to walk responsibly within circumstances I cannot fully choose?',
 'Which of the middle lines connects guidance with active practice?'
], 'A devotional statement about Hukam does not justify fatalism, abuse, or the refusal to seek needed help.');

// Pauri 16 · The Shabad as the true Sohila
add(16,[
 ['This beautiful Sohila is the Guru’s lovely Shabad.',
  'ਇਹ ਸੁਹਾਵਾ ਸੋਹਿਲਾ ਗੁਰੂ ਦਾ ਸੋਹਣਾ ਸ਼ਬਦ ਹੈ।'],
 ['The True Guru has caused this enduring song of praise to be heard.',
  'ਸਤਿਗੁਰੂ ਨੇ ਇਹ ਸਦਾ ਸੁਹਾਵਾ ਸ਼ਬਦ-ਸੋਹਿਲਾ ਸੁਣਾਇਆ ਹੈ।'],
 ['It comes to dwell within the minds of those for whom this grace has been written.',
  'ਜਿਨ੍ਹਾਂ ਨੂੰ ਧੁਰੋਂ ਕਿਰਪਾ ਮਿਲੀ, ਉਨ੍ਹਾਂ ਦੇ ਮਨ ਵਿੱਚ ਇਹ ਸ਼ਬਦ ਵੱਸਦਾ ਹੈ।'],
 ['Some wander and talk endlessly, but mere talk does not bring the experience.',
  'ਕਈ ਬਹੁਤ ਭਟਕਦੇ ਤੇ ਗੱਲਾਂ ਕਰਦੇ ਹਨ, ਪਰ ਸਿਰਫ਼ ਗੱਲਾਂ ਨਾਲ ਇਹ ਅਨੁਭਵ ਨਹੀਂ ਮਿਲਦਾ।'],
 ['Nanak says: this true Sohila and Shabad were made known through the True Guru.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਸਤਿਗੁਰੂ ਨੇ ਇਹ ਸੱਚਾ ਸ਼ਬਦ-ਸੋਹਿਲਾ ਸੁਣਾਇਆ ਹੈ।']
],[
 'The Guru’s Shabad is the enduring song of praise, experienced within rather than attained through talk alone.',
 'ਸਤਿਗੁਰੂ ਦਾ ਸ਼ਬਦ ਹੀ ਅਸਲ ਸੋਹਿਲਾ ਹੈ; ਸਿਰਫ਼ ਬੋਲਣ ਨਾਲ ਨਹੀਂ, ਉਸ ਨੂੰ ਮਨ ਵਿੱਚ ਵਸਾਉਣ ਨਾਲ ਅਰਥ ਬਣਦਾ ਹੈ।',
 'Hearing, remembering and doing more than speaking.',
 'The repeated “shabad-sohila” frames the five lines; its inward dwelling is contrasted with aimless wandering and countless words. This is close to—but not the same source poem as—the separate five-shabad Kirtan Sohila night bani. The identity and musical meaning of “sohila” depend on context.',
 [['ਸੋਹਿਲਾ','A song of joy or praise in this context'],['ਸਬਦੁ','The Guru’s Word or teaching']],
 'Do not confuse this Anand Pauri with the separate Kirtan Sohila composition, nor claim that the same word guarantees identical musical settings.',
 'Can my words about values become a habit I actually practise?',
 'What difference does the pauri describe between discussing the Shabad and letting it live in the mind?'
], 'The word “sohila” does not by itself refer to the whole night Nitnem composition; keep exact source occurrence attribution.');

// Pauri 17 · Remembrance and ripples of goodness
add(17,[
 ['Those who remember Hari are described as becoming inwardly pure.',
  'ਜਿਨ੍ਹਾਂ ਨੇ ਹਰਿ ਨੂੰ ਸਿਮਰਿਆ, ਉਹ ਅੰਦਰੋਂ ਪਵਿੱਤਰ ਹੋਏ ਦੱਸੇ ਗਏ ਹਨ।'],
 ['Through Guru-oriented remembrance, their lives become purified.',
  'ਗੁਰਮੁਖ ਹੋ ਕੇ ਹਰਿ ਨੂੰ ਧਿਆਉਣ ਨਾਲ ਉਨ੍ਹਾਂ ਦੇ ਜੀਵਨ ਵਿੱਚ ਪਵਿੱਤਰਤਾ ਆਉਂਦੀ ਹੈ।'],
 ['Their family, parents and the whole sangat are pictured as sharing in this goodness.',
  'ਮਾਤਾ, ਪਿਤਾ, ਪਰਿਵਾਰ ਅਤੇ ਸਾਰੀ ਸੰਗਤ ਤੱਕ ਇਸ ਚੰਗਿਆਈ ਦਾ ਪ੍ਰਭਾਵ ਪਹੁੰਚਦਾ ਦੱਸਿਆ ਹੈ।'],
 ['Those who speak, listen and hold Hari within the mind are named pure.',
  'ਜੋ ਹਰਿ ਦੀ ਸਿਫ਼ਤ ਕਹਿੰਦੇ, ਸੁਣਦੇ ਅਤੇ ਮਨ ਵਿੱਚ ਵਸਾਉਂਦੇ ਹਨ, ਉਹ ਪਵਿੱਤਰ ਕਹੇ ਗਏ ਹਨ।'],
 ['Nanak repeats that Guru-oriented remembrance of Hari purifies a person.',
  'ਨਾਨਕ ਮੁੜ ਆਖਦੇ ਹਨ: ਗੁਰਮੁਖ ਹੋ ਕੇ ਹਰਿ ਦਾ ਧਿਆਨ ਕਰਨ ਵਾਲੇ ਪਵਿੱਤਰ ਹੁੰਦੇ ਹਨ।']
],[
 'Remembrance transforms one’s own conduct and is celebrated as beneficial to family and sangat.',
 'ਨਾਮ ਦੀ ਯਾਦ ਮਨੁੱਖ ਦੇ ਜੀਵਨ ਨੂੰ ਸੰਵਾਰਦੀ ਹੈ ਅਤੇ ਪਰਿਵਾਰ ਤੇ ਸੰਗਤ ਤੱਕ ਭਲਾਈ ਦੀ ਤਸਵੀਰ ਲੈ ਜਾਂਦੀ ਹੈ।',
 'Purity as inward relationship and shared influence.',
 'The opening and closing lines define the theme through remembrance. The third line stretches this influence through parents, family and the full community, while the fourth connects speaking, hearing and inward holding of Naam. In this context purity is devotional and ethical language, not a social hierarchy.',
 [['ਪਵਿਤੁ','Pure or spiritually cleansed, context dependent'],['ਸੰਗਤਿ','Community or company of seekers']],
 'Do not tell someone that a relative’s illness, disability, social standing or bad luck reflects “impurity.” A poetic family blessing is not a medical guarantee.',
 'What good habit could spread quietly through my household or community?',
 'Which verbs describe what a person does with the Bani: speaking, listening and what else?'
], 'The extended family-purity image is not a claim about inherited virtue, caste, ritual exclusion or automatic health outcomes.');

// Pauri 18 · External action versus Sahaj
add(18,[
 ['Inner steadiness is not produced through outward religious actions alone; without Sahaj, doubt remains.',
  'ਕੇਵਲ ਬਾਹਰਲੇ ਕਰਮਾਂ ਨਾਲ ਸਹਜ ਨਹੀਂ ਆਉਂਦਾ; ਸਹਜ ਤੋਂ ਬਿਨਾਂ ਮਨ ਦਾ ਸੰਸਾ ਬਣਿਆ ਰਹਿੰਦਾ ਹੈ।'],
 ['Many perform practices and restraints, but the deep uncertainty still does not disappear.',
  'ਲੋਕ ਅਨੇਕ ਸੰਜਮ ਤੇ ਕਰਮ ਕਰਦੇ ਰਹਿੰਦੇ ਹਨ, ਪਰ ਅੰਦਰਲਾ ਸੰਸਾ ਇਉਂ ਨਹੀਂ ਮਿਟਦਾ।'],
 ['Doubt troubles and clouds the living mind; what practice could really wash it away?',
  'ਸੰਸਾ ਮਨ ਨੂੰ ਮੈਲਾ ਕਰਦਾ ਹੈ; ਕਿਹੜੇ ਸੰਜਮ ਨਾਲ ਇਸ ਦੀ ਅਸਲ ਮੈਲ ਧੋਤੀ ਜਾਵੇ?'],
 ['Cleanse the mind by attaching yourself to the Shabad and keeping attention on Hari.',
  'ਸ਼ਬਦ ਨਾਲ ਜੁੜੋ, ਮਨ ਨੂੰ ਸੁੱਚਾ ਕਰੋ ਅਤੇ ਚਿੱਤ ਹਰਿ ਵਿੱਚ ਲਗਾਈ ਰੱਖੋ।'],
 ['Nanak says Sahaj arises through the Guru’s grace, and in that way the doubt leaves.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਸਹਜ ਜਾਗਦਾ ਹੈ ਤੇ ਇਉਂ ਸੰਸਾ ਦੂਰ ਹੁੰਦਾ ਹੈ।']
],[
 'Sahaj grows through Guru’s grace and inward Shabad-attention, not merely multiplying external ritual actions.',
 'ਸਹਜ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਤੇ ਸ਼ਬਦ ਨਾਲ ਜੁੜਨ ਨਾਲ ਮਿਲਦਾ ਹੈ; ਸਿਰਫ਼ ਬਾਹਰਲੇ ਕਰਮ ਕਾਫ਼ੀ ਨਹੀਂ।',
 'The question “how can the mind be cleansed?”',
 'The pauri repeatedly pairs ritual action with lingering doubt, then asks how the inward stain can be washed. The practical turn is the fourth line—attach the mind to the Shabad and Hari. The final line attributes enduring Sahaj to Guru’s grace instead of technique alone.',
 [['ਸਹਜੁ','Natural poise, inner spiritual equipoise'],['ਸਹਸਾ','Doubt, inner uncertainty or suspicion']],
 'Sahaj is not simply a measurable calm state, and “doubt” is not a diagnosis. Do not promise a religious practice as a treatment for anxiety disorders or other health conditions.',
 'When have repeated routines failed to address what was troubling me inwardly?',
 'Which line moves from criticism of ritual to an inward practice?'
], 'The cleansing imagery is spiritual, not a prescription for physical purification rituals or psychiatric care.');

// Pauri 19 · An outward appearance of purity, inner attachment
add(19,[
 ['One may appear pure on the outside while the inner life remains stained.',
  'ਮਨੁੱਖ ਬਾਹਰੋਂ ਨਿਰਮਲ ਦਿੱਸ ਸਕਦਾ ਹੈ ਪਰ ਅੰਦਰਲਾ ਮਨ ਮੈਲਾ ਰਹਿ ਸਕਦਾ ਹੈ।'],
 ['Such an outwardly clean yet inwardly troubled life is likened to losing a precious birth in gambling.',
  'ਬਾਹਰਲੀ ਸੁਚਾਈ ਹੋਵੇ ਪਰ ਅੰਦਰ ਮੈਲ ਹੋਵੇ ਤਾਂ ਕੀਮਤੀ ਜਨਮ ਜੂਏ ਵਿੱਚ ਹਾਰਨ ਵਰਗੀ ਤਸਵੀਰ ਹੈ।'],
 ['Craving is described as a great inner affliction, while the person forgets that life will end.',
  'ਤ੍ਰਿਸ਼ਨਾ ਨੂੰ ਵੱਡਾ ਅੰਦਰਲਾ ਰੋਗ ਕਿਹਾ ਹੈ ਤੇ ਮਨੁੱਖ ਆਪਣੀ ਮਰਣਹਾਰਤਾ ਭੁੱਲ ਜਾਂਦਾ ਹੈ।'],
 ['Even though Naam is held highest within religious teaching, some do not listen and wander aimlessly.',
  'ਧਾਰਮਿਕ ਸਿੱਖਿਆ ਵਿੱਚ ਨਾਮ ਉੱਤਮ ਦੱਸਿਆ ਹੈ, ਪਰ ਕੁਝ ਸੁਣਦੇ ਨਹੀਂ ਤੇ ਭਟਕਦੇ ਰਹਿੰਦੇ ਹਨ।'],
 ['Nanak says that abandoning Truth for falsehood is like gambling away life’s opportunity.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਸੱਚ ਛੱਡ ਕੇ ਕੂੜ ਨਾਲ ਲੱਗਣਾ ਕੀਮਤੀ ਜੀਵਨ ਜੂਏ ਵਿੱਚ ਹਾਰਨ ਵਰਗਾ ਹੈ।']
],[
 'A spotless outward appearance cannot substitute for inner truth when craving and falsehood rule the mind.',
 'ਬਾਹਰਲੀ ਸੁਚਾਈ ਅੰਦਰਲੀ ਸੱਚਾਈ ਦਾ ਬਦਲ ਨਹੀਂ; ਤ੍ਰਿਸ਼ਨਾ ਅਤੇ ਕੂੜ ਜੀਵਨ ਦੀ ਸੇਧ ਖੋਹ ਸਕਦੇ ਹਨ।',
 'Contrasting visible purity with inward responsibility.',
 'The first two lines set the direct inner–outer contrast and the striking image of life lost in gambling. The third names unsatisfied craving and mortality; the fourth points to Naam yet describes people ignoring it. The concluding line binds them to the truth-versus-falsehood decision. This imagery is a warning about values, not a label for people.',
 [['ਤਿਸਨਾ','Craving or insatiable thirst'],['ਕੂੜੇ','Falsehood or what lacks Truth, context dependent']],
 'The word “rog” for craving is metaphorical. Never equate this spiritual critique with diagnosis, shame people with substance-use or other medical conditions, or present it as clinical care.',
 'How can I compare what I appear to value with what I actually do?',
 'How does the image of gambling away life connect to abandoning Truth?'
], 'A high-stakes spiritual metaphor about gambling is not a judgment of a real person’s mental health, worth or medical treatment.');

// Pauri 20 · Inner and outer integrity
add(20,[
 ['A person becomes pure inwardly and outwardly when life is aligned with Truth.',
  'ਜਦ ਮਨੁੱਖ ਦਾ ਅੰਦਰਲਾ ਜੀਵਨ ਅਤੇ ਬਾਹਰਲਾ ਆਚਰਨ ਸੱਚ ਨਾਲ ਮਿਲਦਾ ਹੈ, ਉਹ ਨਿਰਮਲ ਹੁੰਦਾ ਹੈ।'],
 ['True inner and outward purity arises through living the teaching received from the True Guru.',
  'ਸਤਿਗੁਰੂ ਦੀ ਸਿੱਖਿਆ ਮੁਤਾਬਕ ਕਰਣੀ ਕਰਨ ਨਾਲ ਅੰਦਰ ਤੇ ਬਾਹਰ ਦੋਹਾਂ ਪਾਸੇ ਸੁਚਾਈ ਆਉਂਦੀ ਹੈ।'],
 ['Falsehood cannot take hold there, for the mind’s intention is absorbed in Truth.',
  'ਜਿਥੇ ਮਨ ਦਾ ਮਨੋਰਥ ਸੱਚ ਨਾਲ ਜੁੜਿਆ ਹੈ, ਉਥੇ ਕੂੜ ਦੀ ਪਹੁੰਚ ਨਹੀਂ ਬਣਦੀ।'],
 ['Those who make good use of the jewel of human birth are called worthy traders.',
  'ਜਿਨ੍ਹਾਂ ਨੇ ਜੀਵਨ ਦੇ ਰਤਨ ਨੂੰ ਸਾਰਥਕ ਕੀਤਾ, ਉਹ ਚੰਗੇ ਵਣਜਾਰੇ ਆਖੇ ਹਨ।'],
 ['Nanak says that people whose minds are clear remain near the Guru in spirit.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਜਿਨ੍ਹਾਂ ਦਾ ਮਨ ਨਿਰਮਲ ਹੈ, ਉਹ ਸਦਾ ਗੁਰੂ ਦੇ ਨਾਲ ਜੁੜੇ ਰਹਿੰਦੇ ਹਨ।']
],[
 'The companion to Pauri 19 emphasizes outward and inward truth together, cultivated through the Guru’s teaching.',
 'ਉੱਨੀਵੀਂ ਪਉੜੀ ਦੇ ਉਲਟ, ਇੱਥੇ ਮਨ ਤੇ ਕਰਮ ਦੋਹਾਂ ਦੀ ਸਚਾਈ ਗੁਰੂ ਦੀ ਸਿੱਖਿਆ ਨਾਲ ਜੁੜਦੀ ਹੈ।',
 'The paired answer to Pauri 19.',
 'The immediately previous pauri began “dirty inside, clean outside.” This one deliberately reverses that to “clean inside, clean outside,” then explains the Guru-oriented conduct behind it. The trade/gem imagery means the human opportunity has been used wisely, not that spiritual life is a financial enterprise.',
 [['ਕਰਣੀ','Conduct or lived practice'],['ਵਣਜਾਰੇ','Traders, used as a metaphor for people making good use of life']],
 'Do not make “purity” into caste hierarchy or claim that a person with illness, disability or grief is spiritually unclean. The trading image has no promise of monetary profit.',
 'What concrete action could bring my outer behaviour closer to my inner commitments?',
 'How does Pauri 20 answer the inner–outer contrast begun in Pauri 19?'
], 'The ethical/inner purity metaphor does not define social status, medical health or a right to exclude others.');
