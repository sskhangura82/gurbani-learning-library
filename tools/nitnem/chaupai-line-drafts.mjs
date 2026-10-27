/* GLP-001 | Benti Chaupai 29-pauri *digital candidate*.
 * Every pair below is manually authored ORIGINAL bilingual educational
 * commentary, not a copied Punjabi teeka or a certified literal translation.
 * Lines 1-4 of Pauri 1 were previously written; they are NEVER rewritten.
 * Current source has 25 Rehras-sourced stanzas plus FOUR expanded/endmatter
 * stanzas. The expanded four are NOT silently declared a universal morning
 * practice. Human Sikh/Punjabi/Braj/rights/corpus review remains OPEN.
 *
 * Each 4-line unit is individually interpreted, not populated by a template.
 * A stanza-level contextual caution applies to the four exact source lines.
 * The compiler binds every resulting line ID to a known frozen source SHA,
 * checks 112 net NEW records and refuses missing/duplicated source lines.
 */
export const chaupaiAdditional=[];
function add(unitId,interpretiveCare,lines){
 if(lines.length!==4)throw Error('Every source pauri must have exactly four authored line meanings: '+unitId);
 for(let i=0;i<4;i++){
  const [simpleEn,simplePa]=lines[i];
  chaupaiAdditional.push({
   bani:'chaupai',lineId:unitId+'.line0'+(i+1),
   simpleEn,simplePa,
   nuance:interpretiveCare,
   meaningKind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION',
   editorialStatus:'DRAFT_AI_UNREVIEWED'
  });
 }
}
// Pauri 1 is already authored source-exact in course.v1; do not duplicate.
// 2 · safety for self, family and sangat
add('chaupai-rehras02',
 'The prayer uses forceful historic enemy-language. Keep its poetic martial context; do not label current people enemies or use prayer as authorization to injure them.',
 [
 ['The speaker asks the Divine to defeat or remove those who threaten and harm.',
  'ਬੇਨਤੀ ਹੈ ਕਿ ਹੇ ਪ੍ਰਭੂ, ਸਾਨੂੰ ਨੁਕਸਾਨ ਪਹੁੰਚਾਉਣ ਵਾਲੀਆਂ ਵੈਰੀ ਤਾਕਤਾਂ ਨੂੰ ਹਰਾ ਦੇਹੋ।'],
 ['With Your own protecting hand, rescue me and keep me safe.',
  'ਆਪਣੇ ਰੱਖਿਆ ਵਾਲੇ ਹੱਥ ਨਾਲ ਮੈਨੂੰ ਬਚਾ ਲਵੋ।'],
 ['May my family dwell in peace and safety.',
  'ਮੇਰਾ ਪਰਿਵਾਰ ਸੁਖ-ਸ਼ਾਂਤੀ ਨਾਲ ਵਸਦਾ ਰਹੇ।'],
 ['O Creator, extend this care to the servants and Sikhs as well.',
  'ਹੇ ਕਰਤਾਰ, ਆਪਣੇ ਸੇਵਕਾਂ ਅਤੇ ਸਿੱਖਾਂ ਦੀ ਵੀ ਸੰਭਾਲ ਕਰ।']
]);
// 3 · protection and longing for remembrance
add('chaupai-rehras03',
 'Opponents in this historical martial vocabulary cannot be assigned to a modern community without context. The closing thirst for bhajan frames the prayer spiritually.',
 [
 ['Protect me through Your own hand and power, the speaker pleads.',
  'ਹੇ ਪ੍ਰਭੂ, ਆਪਣੇ ਹੀ ਹੱਥ ਨਾਲ ਮੇਰੀ ਰੱਖਿਆ ਕਰ।'],
 ['May hostile and harmful opposition be brought to an end, the prayer continues.',
  'ਮੇਰੇ ਨਾਲ ਵੈਰ ਤੇ ਨੁਕਸਾਨ ਕਰਨ ਵਾਲੀਆਂ ਤਾਕਤਾਂ ਦਾ ਅੰਤ ਹੋਵੇ—ਇਹ ਬੇਨਤੀ ਹੈ।'],
 ['May my hopes and sincere longings find completion.',
  'ਮੇਰੀਆਂ ਆਸਾਂ ਅਤੇ ਮਨ ਦੀ ਸੱਚੀ ਚਾਹ ਪੂਰੀ ਹੋਵੇ।'],
 ['Above all, may the thirst to remember and praise You remain within me.',
  'ਸਭ ਤੋਂ ਵੱਧ ਤੇਰੇ ਭਜਨ ਦੀ ਪਿਆਸ ਮੇਰੇ ਅੰਦਰ ਸਦਾ ਬਣੀ ਰਹੇ।']
]);
// 4 · reliance and care for Sikhs
add('chaupai-rehras04',
 'The stanza combines personal devotion, requested gifts and conflict. The expression about foes is devotional verse, never a directive to attack actual people.',
 [
 ['Apart from You, I do not turn my deepest contemplation toward another refuge.',
  'ਤੇਰੇ ਬਿਨਾਂ ਮੈਂ ਹੋਰ ਕਿਸੇ ਨੂੰ ਆਪਣਾ ਅੰਤਿਮ ਆਸਰਾ ਮੰਨ ਕੇ ਨਹੀਂ ਧਿਆਉਂਦਾ।'],
 ['Whatever blessing I ask for, I seek it from You.',
  'ਜੋ ਵੀ ਵਰ ਮੰਗਦਾ ਹਾਂ, ਉਹ ਤੇਰੇ ਕੋਲੋਂ ਹੀ ਮੰਗਦਾ ਹਾਂ।'],
 ['Carry through danger the servants and Sikhs who rely upon You.',
  'ਸਾਡੇ ਸੇਵਕਾਂ ਤੇ ਸਿੱਖਾਂ ਨੂੰ ਸੰਕਟਾਂ ਤੋਂ ਪਾਰ ਲੰਘਾ।'],
 ['The poet petitions for the defeat of every hostile force threatening his people.',
  'ਕਵੀ ਆਪਣੇ ਲੋਕਾਂ ਨੂੰ ਨੁਕਸਾਨ ਦੇਣ ਵਾਲੀਆਂ ਵੈਰੀ ਤਾਕਤਾਂ ਦੇ ਨਾਸ ਦੀ ਬੇਨਤੀ ਕਰਦਾ ਹੈ।']
]);
// 5 · facing death and fear
add('chaupai-rehras05',
 '“Asidhuj” is a traditional divine epithet here, not a self-issued human license to wield weapons; prayer about death never proves invulnerability.',
 [
 ['With Your own hand, lift me up and rescue me.',
  'ਆਪਣੇ ਹੱਥ ਨਾਲ ਮੈਨੂੰ ਉਬਾਰ ਕੇ ਬਚਾ ਲਵੋ।'],
 ['May my fear at the time of death be taken away.',
  'ਮੌਤ ਦੀ ਘੜੀ ਆਉਣ ਵੇਲੇ ਮੇਰਾ ਡਰ ਦੂਰ ਹੋਵੇ।'],
 ['Always remain on my side as my support.',
  'ਤੂੰ ਸਦਾ ਮੇਰਾ ਸਹਾਈ ਬਣ ਕੇ ਮੇਰੇ ਪੱਖ ਵਿੱਚ ਰਹਿ।'],
 ['O revered Asidhuj, grant Your protection.',
  'ਹੇ ਸ੍ਰੀ ਅਸਿਧੁਜ ਪ੍ਰਭੂ, ਮੇਰੀ ਰੱਖਿਆ ਕਰ।']
]);
// 6 · protector of the humble, traditional cosmos
add('chaupai-rehras06',
 'Fourteen worlds is a traditional cosmological image, not an astronomical measurement. Invoking a protector does not negate ordinary medical or physical safety precautions.',
 [
 ['O Protector, please save and shelter me.',
  'ਹੇ ਰੱਖਣਹਾਰੇ, ਮੈਨੂੰ ਆਪਣੀ ਰੱਖਿਆ ਵਿੱਚ ਲੈ ਲਵੋ।'],
 ['You are the dear Lord and helper of the saintly.',
  'ਹੇ ਪਿਆਰੇ ਸਾਹਿਬ, ਤੂੰ ਸੰਤ ਜਨਾਂ ਦਾ ਸਹਾਈ ਹੈਂ।'],
 ['You are friend of the humble and the one who overcomes harmful wickedness.',
  'ਤੂੰ ਦੀਨਾਂ ਦਾ ਸਾਥੀ ਤੇ ਦੁਰਜਨਾਂ ਦੇ ਨੁਕਸਾਨ ਨੂੰ ਰੋਕਣ ਵਾਲਾ ਹੈਂ।'],
 ['You are sovereign throughout all the fourteen realms of traditional imagination.',
  'ਪੁਰਾਣੀ ਧਾਰਮਿਕ ਤਸਵੀਰ ਦੇ ਚੌਦਾਂ ਭਵਨਾਂ ਦਾ ਵੀ ਤੂੰ ਹੀ ਮਾਲਕ ਹੈਂ।']
]);
// 7 · time, different gods, one Divine beyond time
add('chaupai-rehras07',
 'Named traditional divine figures are part of a theological contrast; the poem must not be used to demean people of other faiths or converted into a historical chronology.',
 [
 ['When the appointed time came, Brahma took a form, the verse says.',
  'ਕਾਲ ਦਾ ਸਮਾਂ ਆਉਣ ਉੱਤੇ ਬ੍ਰਹਮਾ ਨੇ ਰੂਪ ਧਾਰਿਆ—ਤੁਕ ਇਉਂ ਦੱਸਦੀ ਹੈ।'],
 ['At another appointed time, Shiva also appeared.',
  'ਕਾਲ ਦੇ ਅਧੀਨ ਸ਼ਿਵ ਜੀ ਦਾ ਵੀ ਪ੍ਰਗਟਾਵਾ ਹੋਇਆ।'],
 ['Vishnu too is portrayed as manifested within the reach of time.',
  'ਵਿਸ਼ਨੂ ਦਾ ਪ੍ਰਕਾਸ਼ ਵੀ ਕਾਲ ਦੇ ਅਧੀਨ ਦਿਖਾਇਆ ਹੈ।'],
 ['All these manifestations are pictured as part of the vast play of time.',
  'ਇਹ ਸਾਰੇ ਪ੍ਰਗਟਾਵੇ ਕਾਲ ਦੇ ਵਿਸ਼ਾਲ ਖੇਲ ਵਾਂਗ ਦਿਖਾਏ ਗਏ ਹਨ।']
]);
// 8 · who brings forth time and the three realms
add('chaupai-rehras08',
 '“Kaal” carries layered meanings: time, death and the Timeless in this poetic context. An unqualified dictionary substitution may reverse the theology.',
 [
 ['The Divine power within time is described as making Shiva a yogi.',
  'ਕਾਲ ਦੇ ਮਾਲਕ ਨੇ ਸ਼ਿਵ ਨੂੰ ਜੋਗੀ ਬਣਾਇਆ—ਇਹ ਕਵੀ ਦੀ ਤਸਵੀਰ ਹੈ।'],
 ['Through that same creative power, Brahma became the knower or ruler of the Vedas.',
  'ਉਸੇ ਪ੍ਰਭਾਵ ਹੇਠ ਬ੍ਰਹਮਾ ਵੇਦਾਂ ਦੇ ਗਿਆਨ ਨਾਲ ਜੁੜਿਆ ਦੱਸਿਆ ਗਿਆ ਹੈ।'],
 ['That power is credited with arranging and sustaining all the worlds.',
  'ਉਸੇ ਨੇ ਸਾਰੇ ਲੋਕਾਂ ਦੀ ਰਚਨਾ ਅਤੇ ਸੰਭਾਲ ਕੀਤੀ ਦੱਸਿਆ ਹੈ।'],
 ['To that One, beyond the limited figures, I offer salutations.',
  'ਉਸ ਇੱਕੋ ਅਕਾਲ ਸਰੋਤ ਅੱਗੇ ਮੈਂ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ।']
]);
// 9 · creation, demons, deity and one Guru
add('chaupai-rehras09',
 'The mythic categories in the second line are source-poetic, not laboratory classes. The choice of the Guru is theological devotion, not a claim against others’ dignity.',
 [
 ['That One created the whole world and its many forms.',
  'ਉਸ ਇੱਕ ਨੇ ਇਹ ਸਾਰਾ ਜਗਤ ਰਚਿਆ ਹੈ।'],
 ['Divine beings, adversarial beings and yakshas are also named among creation.',
  'ਦੇਵ, ਦੈਤ ਅਤੇ ਜੱਖ ਵਰਗੇ ਪੁਰਾਣਕ ਪਾਤਰ ਵੀ ਉਸ ਦੀ ਰਚਨਾ ਵਿੱਚ ਗਿਣੇ ਗਏ ਹਨ।'],
 ['The One alone is spoken of as present at the beginning and at the end.',
  'ਆਦਿ ਤੋਂ ਅੰਤ ਤਕ ਉਹ ਇੱਕੋ ਆਸਰਾ ਮੰਨਿਆ ਗਿਆ ਹੈ।'],
 ['Know that same One as my Guru, the speaker declares.',
  'ਕਵੀ ਆਖਦਾ ਹੈ: ਉਸੇ ਇੱਕ ਨੂੰ ਮੇਰਾ ਗੁਰੂ ਸਮਝੋ।']
]);
// 10 · salutation to Creator
add('chaupai-rehras10',
 'The martial expression about enemies is in a petition of praise; do not use it as a threat or assertion that all hardship vanishes for a devout reader.',
 [
 ['I offer my respectful salutation only to that One.',
  'ਮੈਂ ਸਿਰਫ਼ ਉਸ ਪ੍ਰਭੂ ਨੂੰ ਹੀ ਨਮਸਕਾਰ ਕਰਦਾ ਹਾਂ।'],
 ['That One has shaped and ordered all living beings.',
  'ਉਸੇ ਨੇ ਸਾਰੀ ਪਰਜਾ ਨੂੰ ਰਚ ਕੇ ਸੰਭਾਲਿਆ ਹੈ।'],
 ['To the devotees the One is praised as bringing peace and good qualities.',
  'ਆਪਣੇ ਸੇਵਕਾਂ ਨੂੰ ਉਹ ਸੁੱਖ ਅਤੇ ਚੰਗੇ ਗੁਣ ਬਖ਼ਸ਼ਦਾ ਦੱਸਿਆ ਗਿਆ ਹੈ।'],
 ['Hostile forces are described as overcome in an instant by that power.',
  'ਵੈਰੀ ਤਾਕਤਾਂ ਨੂੰ ਉਹ ਪਲ ਭਰ ਵਿੱਚ ਹਰਾ ਸਕਦਾ ਹੈ—ਇਉਂ ਬਾਣੀ ਵਿੱਚ ਵਡਿਆਈ ਹੈ।']
]);

// 11 · divine knowledge of every heart
add('chaupai-rehras11',
 'Intimate knowledge of the heart is devotional language, not a warrant for us to judge another person’s unseen thoughts. The ant-to-elephant comparison includes all beings.',
 [
 ['The One knows what lies within every heart, in every being.',
  'ਉਹ ਪ੍ਰਭੂ ਹਰ ਜੀਵ ਦੇ ਹਿਰਦੇ ਦੇ ਅੰਦਰ ਦੀ ਗੱਲ ਜਾਣਦਾ ਹੈ।'],
 ['The joys and pains of people, good and bad, are known to that One.',
  'ਭਲੇ ਤੇ ਬੁਰੇ ਸਭ ਜੀਵਾਂ ਦੀ ਪੀੜ ਤੇ ਹਾਲ ਉਸ ਤੋਂ ਲੁਕੇ ਨਹੀਂ।'],
 ['From a tiny ant to a huge elephant, all creatures are included.',
  'ਨਿੱਕੀ ਚੀਟੀ ਤੋਂ ਵੱਡੇ ਹਾਥੀ ਤਕ ਸਭ ਜੀਵ ਇਸ ਵਿੱਚ ਆ ਜਾਂਦੇ ਹਨ।'],
 ['The Divine looks on everyone with a gaze of compassionate grace.',
  'ਉਹ ਸਭ ਉੱਤੇ ਕਿਰਪਾ ਦੀ ਨਿਗਾਹ ਰੱਖਦਾ ਹੈ।']
]);
// 12 · compassionate presence in suffering and peace
add('chaupai-rehras12',
 'Poetry speaks of divine compassion through human terms for suffering and happiness; do not conclude that all forms of suffering are divinely approved or clinically avoidable.',
 [
 ['The suffering of saintly people is felt with concern by the Compassionate One.',
  'ਸੰਤ ਜਨਾਂ ਦੇ ਦੁੱਖ ਨੂੰ ਪ੍ਰਭੂ ਕਰੁਣਾ ਨਾਲ ਵੇਖਦਾ ਦੱਸਿਆ ਗਿਆ ਹੈ।'],
 ['Their happiness and peace are likewise honoured with joy.',
  'ਸਾਧ ਜਨਾਂ ਦੇ ਸੁੱਖ ਵਿੱਚ ਉਹ ਪ੍ਰਸੰਨ ਹੋਣ ਵਾਲਾ ਦੱਸਿਆ ਹੈ।'],
 ['The One recognizes each individual’s particular pain.',
  'ਹਰੇਕ ਜੀਵ ਦੀ ਆਪਣੀ ਪੀੜ ਉਹ ਜਾਣਦਾ ਹੈ।'],
 ['Every inner covering and secret of each heart is known to the Divine.',
  'ਹਰ ਘਟ ਦੇ ਅੰਦਰਲਾ ਪਰਦਾ ਅਤੇ ਭੇਦ ਵੀ ਉਸ ਤੋਂ ਓਹਲੇ ਨਹੀਂ।']
]);
// 13 · expansion and withdrawal of creation
add('chaupai-rehras13',
 '“Udarkh/akarkh” are old literary formulations of expansion and withdrawal, NOT modern cosmological equations. Their precise Braj morphology needs specialist review.',
 [
 ['When the Creator brings forth or expands creation, the poetic scene opens outward.',
  'ਜਦੋਂ ਕਰਤਾਰ ਸ੍ਰਿਸ਼ਟੀ ਦਾ ਵਿਸਤਾਰ ਕਰਦਾ ਹੈ, ਇਹ ਦ੍ਰਿਸ਼ ਫੈਲਦਾ ਹੈ।'],
 ['Countless beings then come into embodied existence.',
  'ਤਦ ਅਨੇਕ ਜੀਵ ਦੇਹਾਂ ਧਾਰ ਕੇ ਜਨਮ ਲੈਂਦੇ ਦਿਖਾਏ ਹਨ।'],
 ['When the Creator draws that expansive creation inward again, its forms withdraw.',
  'ਜਦੋਂ ਉਹ ਸ੍ਰਿਸ਼ਟੀ ਨੂੰ ਮੁੜ ਆਪਣੇ ਵਿੱਚ ਸਮੇਟਦਾ ਹੈ, ਰੂਪ ਸਿਮਟ ਜਾਂਦੇ ਹਨ।'],
 ['All embodied beings are portrayed as returning into that One.',
  'ਸਾਰੀਆਂ ਦੇਹਾਂ ਵਾਲੇ ਜੀਵ ਉਸੇ ਇੱਕ ਵਿੱਚ ਲੀਨ ਹੋ ਜਾਂਦੇ ਦੱਸੇ ਹਨ।']
]);
// 14 · different voices describe, One remains beyond
add('chaupai-rehras14',
 'Human descriptions are necessarily partial; references to the Vedas or the world must not be treated as proof that each speaker’s separate theology is identical.',
 [
 ['The whole creation has many voices, mouths and forms of expression.',
  'ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਵਿੱਚ ਅਨੇਕ ਮੂੰਹ ਅਤੇ ਬੋਲਣ ਵਾਲੇ ਜੀਵ ਹਨ।'],
 ['Each describes the Divine according to their own understanding.',
  'ਹਰੇਕ ਆਪਣੀ ਸਮਝ ਅਨੁਸਾਰ ਪ੍ਰਭੂ ਬਾਰੇ ਬੋਲਦਾ ਹੈ।'],
 ['Yet You remain distinct from, and beyond, every one of those descriptions.',
  'ਪਰ ਹੇ ਪ੍ਰਭੂ, ਤੂੰ ਉਨ੍ਹਾਂ ਸਾਰੀਆਂ ਹੱਦਾਂ ਤੋਂ ਨਿਰਾਲਾ ਹੈਂ।'],
 ['The Vedas and the learned world try to understand this profound mystery.',
  'ਵੇਦਾਂ ਅਤੇ ਜਗਤ ਦੇ ਗਿਆਨੀਆਂ ਨੂੰ ਵੀ ਇਸ ਗੂੜ੍ਹੇ ਭੇਦ ਦੀ ਭਾਲ ਹੈ।']
]);
// 15 · divine qualities beyond classification
add('chaupai-rehras15',
 'Several Sanskritic/Braj adjectives are densely packed; these are broad working senses only. “Beyond distinctions” should not be used to erase human moral accountability.',
 [
 ['The One is without confining form, corruption or dependence on another support.',
  'ਉਹ ਨਿਰੰਕਾਰ, ਵਿਕਾਰ ਤੋਂ ਰਹਿਤ ਤੇ ਕਿਸੇ ਹੋਰ ਆਸਰੇ ਦਾ ਮੁਹਤਾਜ ਨਹੀਂ।'],
 ['Beyond ordinary beginnings, colour or birth, the One is self-existent.',
  'ਉਹ ਆਦਿ ਤੋਂ ਪਰੇ, ਰੰਗ ਅਤੇ ਜਨਮ ਦੀ ਹੱਦ ਤੋਂ ਉੱਚਾ ਤੇ ਆਪ ਹੋਂਦ ਵਾਲਾ ਹੈ।'],
 ['A person without understanding tries to divide this limitless One into narrow categories.',
  'ਅਣਜਾਣ ਮਨੁੱਖ ਉਸ ਬੇਅੰਤ ਹਸਤੀ ਦੇ ਸੀਮਤ ਭੇਦ ਬਣਾਉਣ ਲੱਗਦਾ ਹੈ।'],
 ['Even sacred texts cannot completely grasp the One’s deepest mystery.',
  'ਵੇਦਾਂ ਵਰਗੇ ਧਰਮ-ਗ੍ਰੰਥ ਵੀ ਉਸ ਦਾ ਸਾਰਾ ਭੇਦ ਨਹੀਂ ਪਾ ਸਕਦੇ।']
]);
// 16 · aniconic teaching, theological polemic
add('chaupai-rehras16',
 'The original uses sharp polemical words about treating the formless One as an object or a named deity. Explain the Sikh theological distinction without mocking people or sacred objects of other traditions.',
 [
 ['Some imagine the limitless Divine to be fully represented by a stone form.',
  'ਕੋਈ ਬੇਅੰਤ ਪ੍ਰਭੂ ਨੂੰ ਪੱਥਰ ਦੇ ਰੂਪ ਵਿੱਚ ਪੂਰਾ ਸਮਝ ਬੈਠਦਾ ਹੈ।'],
 ['The poet sharply calls that a misunderstanding of the deeper reality.',
  'ਕਵੀ ਇਸ ਨੂੰ ਡੂੰਘੀ ਸੱਚਾਈ ਦਾ ਭੇਦ ਨਾ ਜਾਣਣਾ ਆਖਦਾ ਹੈ।'],
 ['Some address Mahadev as though that name alone exhausted the Eternal Divine.',
  'ਕੋਈ ਮਹਾਦੇਵ ਦੇ ਨਾਂ ਨੂੰ ਹੀ ਸਦਾ-ਸ਼ਿਵ ਦੀ ਪੂਰੀ ਹੱਦ ਮੰਨ ਲੈਂਦਾ ਹੈ।'],
 ['Such outward naming, the poet argues, can miss the formless mystery.',
  'ਕਵੀ ਅਨੁਸਾਰ ਸਿਰਫ਼ ਇਹ ਨਾਂ ਫੜਨ ਨਾਲ ਨਿਰੰਕਾਰ ਦਾ ਅਸਲ ਭੇਦ ਅਣਪਛਾਤਾ ਰਹਿ ਸਕਦਾ ਹੈ।']
]);
// 17 · limited minds describing vast creation
add('chaupai-rehras17',
 'The first two lines acknowledge diverse human understandings; the final questions express wonder, not a literal refusal of all inquiry or scientific cosmology.',
 [
 ['Each person has only as much understanding as their own mind can hold.',
  'ਹਰ ਮਨੁੱਖ ਦੀ ਬੁੱਧੀ ਦੀ ਆਪਣੀ ਇੱਕ ਹੱਦ ਹੁੰਦੀ ਹੈ।'],
 ['So people describe You in differing ways according to that understanding.',
  'ਇਸ ਲਈ ਲੋਕ ਆਪਣੀ-ਆਪਣੀ ਸਮਝ ਮੁਤਾਬਕ ਤੇਰੀ ਵਡਿਆਈ ਵੱਖਰੇ ਢੰਗ ਨਾਲ ਕਰਦੇ ਹਨ।'],
 ['Your vast creation cannot be fully measured or comprehended.',
  'ਤੇਰਾ ਸਾਰਾ ਪਸਾਰਾ ਕਿਸੇ ਦੇ ਪੂਰੇ ਮਾਪ ਵਿੱਚ ਨਹੀਂ ਆਉਂਦਾ।'],
 ['How, indeed, did this world first come into being? The poet wonders.',
  'ਇਹ ਸੰਸਾਰ ਪਹਿਲਾਂ ਕਿਵੇਂ ਰਚਿਆ ਗਿਆ—ਕਵੀ ਅਚਰਜ ਨਾਲ ਪੁੱਛਦਾ ਹੈ।']
]);
// 18 · singular Divine through human ranks and traditional birth categories
add('chaupai-rehras18',
 'Four “khanis” are a traditional way of classifying forms of birth: egg, womb, moisture and vegetation; they are not four exhaustive modern biological categories.',
 [
 ['The One appears as a single, incomparable Divine reality amid countless forms.',
  'ਅਨੇਕ ਰੂਪਾਂ ਵਿੱਚ ਵੀ ਉਹ ਇੱਕੋ ਅਨੂਪ ਸਰੂਪ ਹੈ।'],
 ['At one place a poor person appears, at another a ruler or king.',
  'ਕਿਤੇ ਰੰਕ ਤੇ ਕਿਤੇ ਰਾਜਾ ਜਾਂ ਭੂਪ ਦਿੱਸਦਾ ਹੈ।'],
 ['The poem names beings born from eggs, wombs and moisture.',
  'ਅੰਡਿਆਂ, ਗਰਭਾਂ ਅਤੇ ਨਮੀ ਨਾਲ ਜੁੜੇ ਰਵਾਇਤੀ ਜਨਮ-ਭੇਦ ਗਿਣੇ ਗਏ ਹਨ।'],
 ['It adds plants or sprouting life as another form of the One’s creation.',
  'ਉੱਗਣ ਵਾਲੀ ਬਨਸਪਤੀ ਨੂੰ ਵੀ ਸਿਰਜਣਹਾਰ ਦੀ ਰਚਨਾ ਦਾ ਰੂਪ ਦੱਸਿਆ ਹੈ।']
]);
// 19 · Divine in the play of earthly rank and the timeless
add('chaupai-rehras19',
 'These are poetic ways to point beyond fixed worldly form and status. “Sankar” has contextual lexical ambiguity and needs Dasam/Braj collation.',
 [
 ['In one place the One’s power is pictured as the splendour of a king.',
  'ਕਿਤੇ ਉਸ ਦਾ ਖੇਲ ਰਾਜੇ ਦੀ ਸ਼ਾਨ ਵਾਂਗ ਦਿੱਸਦਾ ਹੈ।'],
 ['In another, a contracted or ascetic form appears in the poem’s imagery.',
  'ਕਿਤੇ ਉਸੇ ਖੇਲ ਦਾ ਸਿਮਟਿਆ ਜਾਂ ਸੰਨਿਆਸੀ ਵਰਗਾ ਰੂਪ ਦਿਖਾਇਆ ਹੈ।'],
 ['The whole creation displays an astonishing variety of forms.',
  'ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ ਅਚਰਜ-ਭਰੇ ਅਨੇਕ ਰੂਪ ਵਿਖਾਉਂਦੀ ਹੈ।'],
 ['Yet its Source is described as self-existent from the beginning of ages.',
  'ਪਰ ਉਸ ਦਾ ਮੂਲ ਆਦਿ-ਜੁਗਾਦਿ ਤੋਂ ਆਪੇ ਹੋਂਦ ਵਾਲਾ ਦੱਸਿਆ ਹੈ।']
]);
// 20 · return to protection; hardest hostile-language line
add('chaupai-rehras20',
 'The original includes severe martial words “asikhya”, “dusht” and “malechh”. These are historically charged and can demean religious communities if misapplied. Do not equate contemporary non-Sikhs with enemies, endorse group violence or promise violent divine punishment. Human reviewer REQUIRED.',
 [
 ['Now, O Divine Protector, please shelter me from the dangers before me.',
  'ਹੇ ਪ੍ਰਭੂ, ਹੁਣ ਮੇਰੀ ਰੱਖਿਆ ਕਰ ਅਤੇ ਮੈਨੂੰ ਸੰਕਟ ਤੋਂ ਬਚਾ।'],
 ['Protect Sikh followers and overcome those portrayed as resisting or harming them.',
  'ਸਿੱਖ ਸੇਵਕਾਂ ਨੂੰ ਬਚਾ ਅਤੇ ਉਨ੍ਹਾਂ ਨੂੰ ਨੁਕਸਾਨ ਦੇਣ ਵਾਲੇ ਵਿਰੋਧ ਨੂੰ ਰੋਕ।'],
 ['The poem describes malicious forces that raise conflict and disturbance.',
  'ਦੁਸ਼ਟ ਤਾਕਤਾਂ ਦੇ ਉਪਦ੍ਰਵ ਅਤੇ ਫਸਾਦ ਖੜ੍ਹੇ ਕਰਨ ਦੀ ਗੱਲ ਆਉਂਦੀ ਹੈ।'],
 ['Using severe historical battle-language, the poet petitions for the defeat of hostile forces.',
  'ਕਵੀ ਇਤਿਹਾਸਕ ਜੰਗੀ ਭਾਸ਼ਾ ਨਾਲ ਵੈਰੀ ਤਾਕਤਾਂ ਦੇ ਹਾਰਨ ਦੀ ਬੇਨਤੀ ਕਰਦਾ ਹੈ।']
]);

// 21 · refuge in Asidhuj; harm and protection
add('chaupai-rehras21',
 '“Asidhuj” is a Divine name in this composition. Conflict imagery does not turn other humans into legitimate targets; refuge is the central request.',
 [
 ['Those who seek refuge in You, O Asidhuj, place themselves under Your protection.',
  'ਹੇ ਅਸਿਧੁਜ, ਜੋ ਤੇਰੀ ਸ਼ਰਨ ਆਉਂਦੇ ਹਨ, ਉਹ ਤੇਰੀ ਰੱਖਿਆ ਮੰਗਦੇ ਹਨ।'],
 ['The poem pictures their hostile persecutors as defeated and distressed.',
  'ਉਨ੍ਹਾਂ ਨੂੰ ਸਤਾਉਣ ਵਾਲੀਆਂ ਵੈਰੀ ਤਾਕਤਾਂ ਦੁਖੀ ਹੋ ਕੇ ਹਾਰਦੀਆਂ ਦਿਖਾਈਆਂ ਹਨ।'],
 ['People who bow at Your feet in humble dependence turn toward You.',
  'ਜੋ ਮਨੁੱਖ ਨਿਮਰਤਾ ਨਾਲ ਤੇਰੇ ਚਰਨਾਂ ਵਿੱਚ ਸਿਰ ਨਿਵਾਉਂਦੇ ਹਨ, ਉਹ ਤੇਰੀ ਸ਼ਰਨ ਲੈਂਦੇ ਹਨ।'],
 ['From their troubles and dangers, You are asked to deliver them.',
  'ਉਨ੍ਹਾਂ ਦੇ ਸਭ ਸੰਕਟ ਤੂੰ ਦੂਰ ਕਰ—ਇਹ ਬੇਨਤੀ ਹੈ।']
]);
// 22 · remembrance and traditional promise of protection
add('chaupai-rehras22',
 'Claims that death or harm cannot approach a devotee are devotional expressions of spiritual protection; they must not be interpreted as clinical immortality, neglect of danger or a replacement for emergency care.',
 [
 ['Whoever remembers the One even once in the difficulties of this age turns toward Divine refuge.',
  'ਜੋ ਇਸ ਕਲਿਯੁਗ ਵਿੱਚ ਇੱਕ ਵਾਰ ਵੀ ਪ੍ਰਭੂ ਨੂੰ ਯਾਦ ਕਰਦਾ ਹੈ, ਉਹ ਉਸ ਦੀ ਸ਼ਰਨ ਵੱਲ ਮੁੜਦਾ ਹੈ।'],
 ['The poet portrays the power of death as unable to draw near that devotee.',
  'ਕਵੀ ਦੀ ਭਗਤੀ-ਭਾਸ਼ਾ ਵਿੱਚ ਕਾਲ ਦੀ ਤਾਕਤ ਉਸ ਭਗਤ ਦੇ ਨੇੜੇ ਨਹੀਂ ਆਉਂਦੀ।'],
 ['That protection is praised as available through all times.',
  'ਉਸ ਰੱਖਿਆ ਨੂੰ ਹਰ ਵੇਲੇ ਦਾ ਸਹਾਰਾ ਦੱਸਿਆ ਹੈ।'],
 ['Hostility and harmful misfortune are envisioned as passing away at once.',
  'ਵੈਰ ਅਤੇ ਬਿਪਤਾ ਤੁਰੰਤ ਹਟਦੇ ਹੋਏ ਦਿਖਾਏ ਗਏ ਹਨ।']
]);
// 23 · grace, suffering and traditional poetic promises
add('chaupai-rehras23',
 'The imagery says distress is lifted and “riddhi/siddhi” granted; it is not a verified promise to cure illness, prevent injury, confer supernatural powers or eliminate financial hardship.',
 [
 ['The person who receives Your compassionate gaze is remembered in prayer.',
  'ਜਿਸ ਉੱਤੇ ਤੇਰੀ ਕਿਰਪਾ ਦੀ ਨਿਗਾਹ ਪੈਂਦੀ ਹੈ, ਉਸ ਦੀ ਬੇਨਤੀ ਇੱਥੇ ਯਾਦ ਕੀਤੀ ਹੈ।'],
 ['The poem imagines their suffering and burning distress removed in a moment.',
  'ਕਵੀ ਦੁੱਖ ਅਤੇ ਤਾਪ ਨੂੰ ਪਲ ਭਰ ਵਿੱਚ ਹਟਦਾ ਦਿਖਾਉਂਦਾ ਹੈ।'],
 ['Prosperity and extraordinary gifts are described as present in that household.',
  'ਰਿੱਧੀਆਂ-ਸਿੱਧੀਆਂ ਵਰਗੀਆਂ ਦਾਤਾਂ ਉਸ ਘਰ ਵਿੱਚ ਹੋਣ ਦੀ ਭਗਤੀ-ਤਸਵੀਰ ਹੈ।'],
 ['No hostile shadow is pictured as able to touch or overwhelm them.',
  'ਕੋਈ ਵੈਰੀ ਛਾਂ ਵੀ ਉਨ੍ਹਾਂ ਨੂੰ ਛੂਹ ਨਾ ਸਕੇ—ਅਜੇਹੀ ਰੱਖਿਆ ਦੀ ਤਸਵੀਰ ਹੈ।']
]);
// 24 · one remembrance and release
add('chaupai-rehras24',
 'This stanza uses heightened protective language about death, poverty and hostility. Do not tell a reader that one recitation medically prevents death or automatically fixes debts.',
 [
 ['Even once remembering You is described as turning a person toward rescue.',
  'ਜਿਸ ਨੇ ਇੱਕ ਵਾਰ ਵੀ ਤੈਨੂੰ ਸਿਮਰਿਆ, ਉਸ ਨੂੰ ਤੇਰੀ ਸ਼ਰਨ ਵਿੱਚ ਆਇਆ ਦੱਸਿਆ ਹੈ।'],
 ['That one is pictured as rescued from death’s noose.',
  'ਉਸ ਨੂੰ ਕਾਲ ਦੇ ਫੰਧੇ ਤੋਂ ਉਬਾਰਿਆ ਹੋਇਆ ਦਿਖਾਇਆ ਹੈ।'],
 ['A person who speaks Your Name seeks its sustaining protection.',
  'ਜੋ ਤੇਰਾ ਨਾਮ ਉਚਾਰਦਾ ਹੈ, ਉਹ ਉਸ ਦੇ ਸਹਾਰੇ ਦੀ ਬੇਨਤੀ ਕਰਦਾ ਹੈ।'],
 ['The poet describes freedom from poverty, harm and moral wrongdoing.',
  'ਕਵੀ ਦਰਿਦ੍ਰਤਾ, ਦੁਸ਼ਟਤਾ ਅਤੇ ਦੋਖ ਤੋਂ ਛੁਟਕਾਰੇ ਦੀ ਤਸਵੀਰ ਦਿੰਦਾ ਹੈ।']
]);
// 25 · important SGPC ending boundary
add('chaupai-rehras25',
 'Important edition boundary: “ਦੁਸਟ ਦੋਖ ਤੇ ਲੇਹੁ ਬਚਾਈ” ends the Benti Chaupai excerpt named in the SGPC Rehat Maryada for Rehras and Amrit ceremony. Additional digital candidate pauris 26–29 require separate named provenance. Do NOT silently merge variants.',
 [
 ['O Khargket, I come into Your refuge and seek protection.',
  'ਹੇ ਖੜਗਕੇਤ ਪ੍ਰਭੂ, ਮੈਂ ਤੇਰੀ ਸ਼ਰਨ ਵਿੱਚ ਆਇਆ ਹਾਂ।'],
 ['Stretch forth Your protecting hand and rescue me.',
  'ਆਪਣਾ ਹੱਥ ਦੇ ਕੇ ਮੈਨੂੰ ਬਚਾ ਲਵੋ।'],
 ['Be my helper in every place and every circumstance.',
  'ਸਭ ਥਾਵਾਂ ਅਤੇ ਹਾਲਾਤਾਂ ਵਿੱਚ ਮੇਰਾ ਸਹਾਈ ਬਣ।'],
 ['Deliver me from harmful forces and the suffering they bring.',
  'ਦੁਸ਼ਟ ਤਾਕਤਾਂ ਅਤੇ ਉਨ੍ਹਾਂ ਦੇ ਦੋਖ ਤੋਂ ਮੈਨੂੰ ਬਚਾ।']
]);
// 26 · EXPANDED candidate, not assumed part of all Gutka recitations
add('chaupai-long26',
 'EXTENDED SOURCE CANDIDATE, outside the bounded SGPC Rehras excerpt. This stanza explicitly mentions completing a granth and addresses jagmata; its narrative setting and textual boundaries need a named independent Dasam reviewer.',
 [
 ['The poet speaks of compassionate grace shown to us by Jagmata, the Mother of the world.',
  'ਕਵੀ ਜਗਮਾਤਾ ਵੱਲੋਂ ਸਾਡੇ ਉੱਤੇ ਕਿਰਪਾ ਹੋਣ ਦੀ ਗੱਲ ਕਰਦਾ ਹੈ।'],
 ['Under that grace, the work or granth is described as brought to completion on an auspicious night.',
  'ਉਸ ਕਿਰਪਾ ਨਾਲ ਗ੍ਰੰਥ ਨੂੰ ਸੁਭ ਰਾਤ ਵਿੱਚ ਪੂਰਾ ਕੀਤਾ ਦੱਸਿਆ ਹੈ।'],
 ['The One is praised as removing the moral stains or faults of the body.',
  'ਦੇਹ ਦੇ ਪਾਪ ਅਤੇ ਕਿਲਬਿਖ ਦੂਰ ਕਰਨ ਵਾਲੀ ਸ਼ਕਤੀ ਦੀ ਵਡਿਆਈ ਹੈ।'],
 ['Hostile wickedness and the harm it causes are portrayed as overcome.',
  'ਦੁਰਜਨਾਂ ਦੇ ਦੋਖ ਅਤੇ ਨੁਕਸਾਨ ਵਾਲੀਆਂ ਤਾਕਤਾਂ ਨੂੰ ਨਾਸ ਹੋਇਆ ਦੱਸਿਆ ਹੈ।']
]);
// 27 · expanded source, authorial conclusion and promised gifts
add('chaupai-long27',
 'EXTENDED textual section, not a universal paath requirement. Expressions that all wishes are met and suffering never visits are poetry/devotional promises, not a medical or economic guarantee.',
 [
 ['When the revered Asidhuj became compassionate, says the poet, grace arrived.',
  'ਸ੍ਰੀ ਅਸਿਧੁਜ ਦੇ ਦਇਆਲ ਹੋਣ ਉੱਤੇ ਕਿਰਪਾ ਪ੍ਰਗਟ ਹੋਈ ਦੱਸਿਆ ਹੈ।'],
 ['The granth was then completed without further delay.',
  'ਤਦ ਗ੍ਰੰਥ ਨੂੰ ਤੁਰੰਤ ਪੂਰਾ ਕੀਤਾ ਗਿਆ—ਇਸ ਤਰ੍ਹਾਂ ਲਿਖਿਆ ਹੈ।'],
 ['The speaker declares that a sincere person receives the fruit longed for in the mind.',
  'ਮਨ ਦੀ ਤਾਂਘ ਵਾਲਾ ਫਲ ਮਿਲਣ ਦੀ ਭਗਤੀ-ਭਰੀ ਗੱਲ ਕੀਤੀ ਹੈ।'],
 ['The verse depicts that person as free from overwhelming suffering.',
  'ਉਸ ਵਿਅਕਤੀ ਨੂੰ ਦੁੱਖ ਤੋਂ ਬਚਿਆ ਹੋਇਆ ਦਿਖਾਇਆ ਹੈ।']
]);
// 28 · expanded source; audio/health high-care interpretation
add('chaupai-long28',
 'EXTENDED pauri uses old-form poetic claims about a mute person gaining speech and a person called “mūṛh” gaining wisdom. These are NOT evidence of curing speech disorders, disabilities or neurological illness, and never replace medical or speech-language care.',
 [
 ['The poet declares that even one unable to speak may receive a voice through hearing this composition.',
  'ਕਵੀ ਕਹਿੰਦਾ ਹੈ ਕਿ ਗੂੰਗਾ ਮਨੁੱਖ ਵੀ ਇਸ ਬਾਣੀ ਨੂੰ ਸੁਣ ਕੇ ਬੋਲਣ ਦੀ ਦਾਤ ਪਾ ਸਕਦਾ ਹੈ।'],
 ['One without understanding is likewise pictured as gaining wisdom by listening attentively.',
  'ਧਿਆਨ ਨਾਲ ਸੁਣਨ ਵਾਲੇ ਅਣਜਾਣ ਮਨੁੱਖ ਨੂੰ ਵੀ ਸਮਝ ਆਉਣ ਦੀ ਤਸਵੀਰ ਹੈ।'],
 ['Pain, distress and fear are said to remain far from such a person.',
  'ਉਸ ਮਨੁੱਖ ਤੋਂ ਦੁੱਖ, ਦਰਦ ਅਤੇ ਡਰ ਦੂਰ ਰਹਿਣ ਦੀ ਅਸੀਸ ਵਰਗੀ ਗੱਲ ਹੈ।'],
 ['The poet associates these blessings with reciting the Chaupai even once.',
  'ਇਹ ਦਾਤਾਂ ਇੱਕ ਵਾਰ ਵੀ ਚੌਪਈ ਉਚਾਰਨ ਨਾਲ ਜੁੜੀਆਂ ਦੱਸੀਆਂ ਗਈਆਂ ਹਨ।']
]);
// 29 · expanded authorial colophon (date/place; not a healing verse)
add('chaupai-long29',
 'EXTENDED AUTHORIAL COLOPHON / historical date, NOT a standard prayer for material or medical benefits. The numeral words, Bikrami year, lunar calendrical reckoning and place need named edition/historical review; never silently convert the date.',
 [
 ['The poet begins stating the year, described as seventeen hundred.',
  'ਕਵੀ ਸੰਮਤ ਦੀ ਗਿਣਤੀ ਦੱਸਦਾ ਹੈ, ਜਿਸ ਦੀ ਸ਼ੁਰੂਆਤ ਸਤਾਰਾਂ ਸੌ ਤੋਂ ਹੁੰਦੀ ਹੈ।'],
 ['A further half hundred and three are added in the traditional date expression.',
  'ਫਿਰ ਉਸ ਵਿੱਚ ਅੱਧਾ ਸੌ ਅਤੇ ਤਿੰਨ ਜੋੜੇ ਦੱਸੇ ਗਏ ਹਨ।'],
 ['The date is described as the eighth bright lunar day of Bhadon, falling on Sunday.',
  'ਭਾਦੋਂ ਸੁਦੀ ਅੱਠਮੀ, ਐਤਵਾਰ—ਇਹ ਤਾਰੀਖ ਇਸ ਤੁਕ ਵਿੱਚ ਲਿਖੀ ਹੈ।'],
 ['The text states that the granth was completed beside the river Sutlej.',
  'ਸਤਲੁਜ ਦਰਿਆ ਦੇ ਕੰਢੇ ਗ੍ਰੰਥ ਸੰਪੂਰਨ ਕਰਨ ਦਾ ਜ਼ਿਕਰ ਹੈ।']
]);
