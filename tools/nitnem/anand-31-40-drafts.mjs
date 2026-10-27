/* GLP-001 · Anand Sahib final ten pauris (31–40) — English/Punjabi
 * interpretive source-specific educational draft, not a licensed teeka,
 * santhiya recitation or certified literal translation.
 * Every original source line ID and UTF-8 SHA checked by a separate compiler.
 * Pauri24 source dispute untouched, original Gurmukhi never stored here.
 */
export const anand3140Lines=[];
export const anand3140Deep=[];
function add(n,lines,study,care){
 if(n<31||n>40||![5,6].includes(lines.length))throw Error('Unexpected Pauri31–40 source packet '+n);
 const id='anand'+n;
 const [simpleEn,simplePa,focus,closeReading,words,studyCare,reflection,teachBack]=study;
 if(words.length<2)throw Error('Two source-bound words required '+id);
 for(let i=0;i<lines.length;i++){
  const [en,pa]=lines[i];
  anand3140Lines.push({bani:'anand',lineId:id+'.line'+String(i+1).padStart(2,'0'),
   simpleEn:en,simplePa:pa,nuance:care,editorialStatus:'DRAFT_AI_UNREVIEWED',
   meaningKind:'SELECTIVE_EDUCATIONAL_PARAPHRASE_NOT_LITERAL_TRANSLATION'});
 }
 anand3140Deep.push({bani:'anand',unitId:id,simpleEn,simplePa,
  study:{focus,closeReading,words,care:studyCare,reflection,teachBack}});
}
// 31 · Naam as the only enduring spiritual capital
add(31,[
 ['Hari is my true capital and my mind is a trader who seeks it.',
  'ਹਰਿ ਦਾ ਨਾਮ ਮੇਰੀ ਅਸਲ ਪੂੰਜੀ ਹੈ ਅਤੇ ਮੇਰਾ ਮਨ ਉਸ ਦਾ ਵਣਜਾਰਾ ਹੈ।'],
 ['From the True Guru I learned that Hari is this precious capital for the mind’s trade.',
  'ਸਤਿਗੁਰੂ ਤੋਂ ਸਮਝ ਆਈ ਕਿ ਹਰਿ ਦਾ ਨਾਮ ਹੀ ਮਨ ਦੀ ਅਸਲੀ ਰਾਸਿ ਹੈ।'],
 ['Remember Hari each day and earn the spiritual profit of remembrance in daily life.',
  'ਹਰ ਰੋਜ਼ ਹਰਿ ਨੂੰ ਯਾਦ ਕਰਕੇ ਆਤਮਕ ਲਾਹਾ ਖੱਟੋ।'],
 ['This spiritual treasure comes as a gift to those whom Hari blesses with grace.',
  'ਇਹ ਨਾਮ-ਧਨ ਉਨ੍ਹਾਂ ਨੂੰ ਮਿਲਦਾ ਹੈ ਜਿਨ੍ਹਾਂ ਉੱਤੇ ਪ੍ਰਭੂ ਦੀ ਕਿਰਪਾ ਹੁੰਦੀ ਹੈ।'],
 ['Nanak repeats: Hari is my capital, and my mind has become its trader.',
  'ਨਾਨਕ ਮੁੜ ਆਖਦੇ ਹਨ: ਹਰਿ ਮੇਰੀ ਰਾਸਿ ਹੈ, ਮੇਰਾ ਮਨ ਉਸ ਦਾ ਵਣਜਾਰਾ ਬਣਿਆ ਹੈ।']
],[
 'The Guru shows the mind a form of wealth that cannot be measured in money: remembrance of Hari.',
 'ਗੁਰੂ ਮਨ ਨੂੰ ਅਜਿਹੀ ਦੌਲਤ ਨਾਲ ਜੋੜਦਾ ਹੈ ਜਿਸ ਦੀ ਕੀਮਤ ਪੈਸਿਆਂ ਨਾਲ ਨਹੀਂ—ਹਰਿ ਦਾ ਸਿਮਰਨ।',
 'Trading language reorients what the mind treasures.',
 'The pauri opens and closes with the same merchant and capital imagery. The Guru helps the mind recognize real capital, then the daily act of remembrance is named an earned “profit.” The fourth line returns to grace: spiritual wealth is not a possession bought by effort. This imagery does not celebrate exploitation or encourage financial speculation.',
 [['ਰਾਸਿ','Capital, spiritual treasure in this comparison'],['ਵਣਜਾਰਾ','Trader or merchant; a metaphor for the mind']],
 'The language of profit is spiritual, not financial or transactional. Never sell Naam, promise material income, or interpret poverty as a failure of prayer.',
 'What am I investing attention in today that will still matter later?',
 'Which two words carry the trade metaphor through the first and final lines?'
], 'Trading and earnings refer to remembrance and ethical living, not money, investment advice or religious merchandise.');

// 32 · Restless tastes and the sweetness of Hari
add(32,[
 ['O tongue, while you are absorbed in other tastes, your deepest thirst remains unsatisfied.',
  'ਹੇ ਰਸਨਾ, ਹੋਰ ਸੁਆਦਾਂ ਵਿੱਚ ਰੁੱਝ ਕੇ ਵੀ ਤੇਰੀ ਅਸਲ ਪਿਆਸ ਨਹੀਂ ਮਿਟਦੀ।'],
 ['No other taste finally removes this thirst until the joy of Hari is received.',
  'ਜਦ ਤਕ ਹਰਿ-ਰਸ ਨਹੀਂ ਮਿਲਦਾ, ਹੋਰ ਕਿਸੇ ਸੁਆਦ ਨਾਲ ਇਹ ਪਿਆਸ ਨਹੀਂ ਬੁੱਝਦੀ।'],
 ['When one receives and drinks the sweetness of Hari, craving is pictured as falling away.',
  'ਜਦ ਮਨੁੱਖ ਹਰਿ-ਰਸ ਪੀਂਦਾ ਹੈ, ਤਦ ਤ੍ਰਿਸ਼ਨਾ ਦੀ ਪਿਆਸ ਮੁੜ ਨਹੀਂ ਸਤਾਉਂਦੀ—ਇਹ ਭਗਤੀ-ਤਸਵੀਰ ਹੈ।'],
 ['This spiritual sweetness is received through grace and meeting the True Guru.',
  'ਸਤਿਗੁਰੂ ਦੀ ਮਿਲਾਪ ਤੇ ਕਿਰਪਾ ਨਾਲ ਇਹ ਹਰਿ-ਰਸ ਦੀ ਦਾਤ ਮਿਲਦੀ ਹੈ।'],
 ['Nanak says other competing tastes lose their hold when Hari enters the mind.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਜਦ ਹਰਿ ਮਨ ਵਿੱਚ ਵੱਸਦਾ ਹੈ, ਹੋਰ ਰਸਾਂ ਦਾ ਮੋਹ ਘੱਟ ਜਾਂਦਾ ਹੈ।']
],[
 'The taste of Hari represents the fulfilment that outward pleasures alone cannot provide.',
 'ਹਰਿ-ਰਸ ਅਜਿਹੀ ਆਤਮਕ ਤ੍ਰਿਪਤੀ ਦੀ ਤਸਵੀਰ ਹੈ ਜੋ ਸਿਰਫ਼ ਬਾਹਰਲੇ ਸੁਆਦਾਂ ਨਾਲ ਨਹੀਂ ਮਿਲਦੀ।',
 'A tongue addressed as a doorway to the heart.',
 'The poet addresses the rasna directly, repeating thirst and rasa before pointing to the Guru and grace. The ending is not a rule about food or taste, but about what truly satisfies the mind. The contrast between worldly pleasure and Hari’s sweetness is a spiritual critique of attachment, not of human senses themselves.',
 [['ਰਸਨਾ','Tongue; poetically the faculty of tasting and speaking'],['ਤ੍ਰਿਸਨਾ','Thirst or unfulfilled craving']],
 'Do not turn spiritual thirst into instructions to avoid eating, hydration, medication, pleasure or family meals; Hari ras is devotional imagery, not a special chemical substance.',
 'Which short-lived pleasures can distract me from deeper values?',
 'How does the repeated word “ras” shift meaning across this pauri?'
], 'Hari ras is not an ingestible cure or diet. Do not diagnose cravings as sin or prescribe unsafe restraint.');

// 33 · Divine Light within the body
add(33,[
 ['O my body, Hari placed a light within you, and through it you came into the world.',
  'ਹੇ ਮੇਰੇ ਸਰੀਰ, ਪ੍ਰਭੂ ਨੇ ਤੇਰੇ ਅੰਦਰ ਜੋਤ ਰੱਖੀ, ਇਸੇ ਨਾਲ ਤੂੰ ਸੰਸਾਰ ਵਿੱਚ ਆਇਆ।'],
 ['That Divine light within the body is named again as the foundation of life.',
  'ਸਰੀਰ ਵਿੱਚ ਰੱਖੀ ਹਰਿ ਦੀ ਜੋਤ ਜੀਵਨ ਦਾ ਮੂਲ ਦੱਸ ਕੇ ਮੁੜ ਯਾਦ ਕੀਤੀ ਹੈ।'],
 ['The Divine is pictured as both mother and father, the One who gives life and reveals the world.',
  'ਪ੍ਰਭੂ ਆਪ ਮਾਤਾ ਤੇ ਪਿਤਾ ਵਾਂਗ ਜੀਵਨ ਦੇਣ ਵਾਲਾ ਅਤੇ ਜਗਤ ਵਿਖਾਉਣ ਵਾਲਾ ਦੱਸਿਆ ਹੈ।'],
 ['Through the Guru’s grace, this astonishing play of existence becomes understood.',
  'ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਇਹ ਅਚਰਜ ਰਚਨਾ ਤੇ ਜੀਵਨ ਦਾ ਖੇਲ ਸਮਝ ਵਿੱਚ ਆਉਂਦਾ ਹੈ।'],
 ['Nanak says the Source placed the light within you, through which embodied life appeared.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਸ੍ਰਿਸ਼ਟੀ ਦੇ ਮੂਲ ਨੇ ਜੋਤਿ ਰੱਖੀ ਅਤੇ ਤੂੰ ਜਗਤ ਵਿੱਚ ਆਇਆ।']
],[
 'The body is honoured as a place where the Divine light and creative care are remembered.',
 'ਸਰੀਰ ਅੰਦਰ ਰੱਬੀ ਜੋਤ ਤੇ ਸਿਰਜਣਹਾਰ ਦੀ ਸੰਭਾਲ ਯਾਦ ਕਰਵਾਈ ਜਾਂਦੀ ਹੈ।',
 'Speaking to the body, not despising it.',
 'Beginning and end repeat that the Divine places light within the human body. In the middle, parental images of God emphasize care, and the Guru makes the wonder of creation understandable. The “light” is sacred metaphor, not a measured physical illumination or proof of a specific fetal process.',
 [['ਜੋਤਿ','Divine light or spiritual presence'],['ਸਰੀਰਾ','O body; direct address']],
 'Do not use this poetic origin story as a claim about photons, inheritance, pregnancy science or disability. Honor actual human bodies and medical care.',
 'How would my choices change if I treated my body with greater respect and gratitude?',
 'Why does the pauri speak to the body directly rather than calling it worthless?'
], 'A spiritual source-of-life image does not provide an empirical account of embryology, biology or physiology.');

// 34 · Joy of the Divine arrival and the Guru’s Shabad
add(34,[
 ['Joy fills the mind on hearing of the coming or presence of the Divine Beloved.',
  'ਪ੍ਰਭੂ ਦੇ ਆਉਣ ਦੀ ਖ਼ਬਰ ਸੁਣ ਕੇ ਮਨ ਵਿੱਚ ਚਾਉ ਤੇ ਖੁਸ਼ੀ ਜਾਗਦੀ ਹੈ।'],
 ['O friends, sing the auspicious praise of Hari; the home of the heart has become a place of welcome.',
  'ਹੇ ਸਖੀਓ, ਹਰਿ ਦਾ ਮੰਗਲ ਗਾਓ; ਹਿਰਦੇ ਦਾ ਘਰ ਸੁਆਗਤ ਲਈ ਸਜਿਆ ਹੈ।'],
 ['Continue singing this joy with companions, in a vision where sorrow cannot overtake the mind.',
  'ਸਖੀਓ, ਹਰਿ ਦਾ ਮੰਗਲ ਸਦਾ ਗਾਓ; ਦੁੱਖ ਤੇ ਸੋਗ ਤੋਂ ਪਰੇ ਖੁਸ਼ੀ ਦੀ ਤਸਵੀਰ ਹੈ।'],
 ['Blessed are the days spent close to the Guru, when the Beloved Lord is recognized.',
  'ਗੁਰੂ ਦੇ ਚਰਨਾਂ ਨਾਲ ਜੁੜੇ ਦਿਨ ਸੁਭਾਗੇ ਹਨ ਅਤੇ ਪਿਆਰਾ ਪ੍ਰਭੂ ਪਛਾਣ ਵਿੱਚ ਆਉਂਦਾ ਹੈ।'],
 ['Through the Guru’s Shabad the unstruck Bani is known; enjoy the sweetness of Hari Naam.',
  'ਗੁਰੂ ਦੇ ਸ਼ਬਦ ਰਾਹੀਂ ਅਨਹਦ ਬਾਣੀ ਦੀ ਸੂਝ ਆਉਂਦੀ ਹੈ ਅਤੇ ਹਰਿ ਨਾਮ ਦਾ ਰਸ ਮਿਲਦਾ ਹੈ।'],
 ['Nanak says the One who makes all causes possible has itself come into loving union.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਸਭ ਕੰਮ ਕਰਨ ਜੋਗ ਪ੍ਰਭੂ ਆਪ ਹੀ ਮਿਲ ਪਿਆ ਹੈ।']
],[
 'The Guru’s Shabad is celebrated as a joyful welcome to the Divine Beloved within the heart.',
 'ਗੁਰੂ ਦਾ ਸ਼ਬਦ ਮਨ ਵਿੱਚ ਪਿਆਰੇ ਪ੍ਰਭੂ ਦੇ ਮਿਲਾਪ ਦੀ ਖੁਸ਼ੀ ਅਤੇ ਮੰਗਲ ਦਾ ਸੱਦਾ ਦਿੰਦਾ ਹੈ।',
 'The language of a festive home and spiritual union.',
 'The first line announces joy; the second and third invite companions to celebrate as if a beloved guest has arrived. The fourth credits closeness to the Guru, and the fifth places anhad Bani and Hari Naam at the centre. The conclusion names the Lord as the true agent of meeting. This is poetic marital/household imagery, not a claim that sincere people never experience sadness.',
 [['ਮੰਗਲੁ','Auspicious song or celebration'],['ਅਨਹਤ','Unstruck; devotional sound imagery']],
 'Do not market prayer as preventing clinical depression or sorrow, or interpret “anhad” as a measurable external acoustic frequency or special recording.',
 'How can gratitude become something I share quietly with others?',
 'How do the welcoming-home and Shabad images reinforce one another?'
], 'The sorrow-not-overtaking image is devotional celebration, not a psychiatric treatment guarantee.');

// 35 · What has the body done with its opportunity?
add(35,[
 ['O my body, what actions have you carried out after entering this world?',
  'ਹੇ ਮੇਰੇ ਸਰੀਰ, ਜਗਤ ਵਿੱਚ ਆ ਕੇ ਤੂੰ ਕਿਹੜੇ ਕਰਮ ਕੀਤੇ?'],
 ['The poet repeats the question: what has your life become through the deeds you perform?',
  'ਕਵੀ ਮੁੜ ਪੁੱਛਦਾ ਹੈ: ਇਸ ਜੀਵਨ ਵਿੱਚ ਤੇਰੀ ਕਰਣੀ ਦਾ ਅਸਲ ਮੋਲ ਕੀ ਹੈ?'],
 ['You may forget to hold within the mind the very Hari who created you.',
  'ਜਿਸ ਹਰਿ ਨੇ ਤੈਨੂੰ ਰਚਿਆ, ਉਸ ਨੂੰ ਮਨ ਵਿੱਚ ਵਸਾਉਣਾ ਭੁੱਲਿਆ ਜਾ ਸਕਦਾ ਹੈ।'],
 ['Through the Guru’s grace, Hari is known within the mind, and an earlier blessing bears fruit.',
  'ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਹਰਿ ਮਨ ਵਿੱਚ ਵੱਸਦਾ ਹੈ ਤੇ ਪੂਰਬਲੀ ਦਾਤ ਫਲ ਲਿਆਉਂਦੀ ਹੈ।'],
 ['Nanak says the body becomes worthwhile when the mind is devoted to the True Guru.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਸਰੀਰਕ ਜੀਵਨ ਸਾਰਥਕ ਹੁੰਦਾ ਹੈ ਜਦ ਚਿੱਤ ਸਤਿਗੁਰੂ ਨਾਲ ਜੁੜਦਾ ਹੈ।']
],[
 'Human life is an opportunity for thoughtful action and remembrance, not merely outward achievement.',
 'ਮਨੁੱਖਾ ਜਨਮ ਚੰਗੇ ਕਰਮ ਅਤੇ ਹਰਿ ਦੀ ਯਾਦ ਦਾ ਮੌਕਾ ਹੈ, ਸਿਰਫ਼ ਬਾਹਰਲੀ ਕਾਮਯਾਬੀ ਨਹੀਂ।',
 'A second intimate address to the body.',
 'Like Pauri33, the poet addresses the body. This time the question concerns conduct: what did one do with life? The middle reveals forgetfulness of the Creator and the possibility of returning through Guru’s grace; the final line treats connection to the True Guru as the measure of meaningful life.',
 [['ਕਰਮ','Actions or deeds, with context-dependent meanings'],['ਪਰਵਾਣੁ','Accepted, worthwhile or spiritually approved in this idiom']],
 'Do not treat a person with illness, disability or limited opportunities as having a “failed body”; spiritual worth is not bodily productivity or medical status.',
 'What meaningful action can I take within my own real abilities today?',
 'How does Pauri35 answer the earlier description of Divine light placed within the body?'
], 'The direct question to the body is a moral-poetic prompt, not a tool for shaming anyone’s health or physical capacity.');

// 36 · The eyes as a way to see the One in creation
add(36,[
 ['O my eyes, Hari placed light within you; look upon the world without forgetting the One.',
  'ਹੇ ਮੇਰੇ ਨੇਤਰੋ, ਹਰਿ ਨੇ ਤੁਹਾਡੇ ਵਿੱਚ ਜੋਤਿ ਰੱਖੀ; ਸੰਸਾਰ ਨੂੰ ਵੇਖਦਿਆਂ ਉਸ ਇੱਕ ਨੂੰ ਨਾ ਵਿਸਾਰੋ।'],
 ['See no reality separate from Hari; through gracious insight the One is recognized.',
  'ਹਰਿ ਤੋਂ ਵੱਖਰਾ ਕੋਈ ਅੰਤਿਮ ਆਸਰਾ ਨਾ ਵੇਖੋ; ਕਿਰਪਾ ਦੀ ਨਿਗਾਹ ਨਾਲ ਉਸ ਦੀ ਪਛਾਣ ਹੁੰਦੀ ਹੈ।'],
 ['The entire visible universe is described as a form of Hari’s presence.',
  'ਇਹ ਸਾਰਾ ਦਿੱਸਦਾ ਸੰਸਾਰ ਹਰਿ ਦੇ ਰੂਪ ਦੀ ਤਸਵੀਰ ਵਾਂਗ ਦੱਸਿਆ ਹੈ।'],
 ['Through the Guru’s grace I understood that the Divine One is present throughout.',
  'ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਸੂਝ ਆਈ ਕਿ ਹਰ ਥਾਂ ਉਹ ਇੱਕੋ ਪ੍ਰਭੂ ਵਿਆਪਕ ਹੈ।'],
 ['Nanak says eyes previously unseeing gained deeper spiritual vision by meeting the True Guru.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਸਤਿਗੁਰੂ ਨੂੰ ਮਿਲ ਕੇ ਅੱਖਾਂ ਨੂੰ ਅੰਦਰਲੀ ਦਿਬ-ਦ੍ਰਿਸ਼ਟੀ ਮਿਲੀ।']
],[
 'The eye’s purpose in this pauri is to recognize the Divine throughout creation through Guru-given insight.',
 'ਇਸ ਪਉੜੀ ਵਿੱਚ ਨੇਤਰਾਂ ਦੀ ਸੇਧ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਸ੍ਰਿਸ਼ਟੀ ਵਿੱਚ ਰੱਬੀ ਜੋਤਿ ਪਛਾਣਣਾ ਹੈ।',
 'From looking at forms to seeing a shared Divine presence.',
 'The first line addresses the eyes and recalls the Divine light that enabled life. Lines two through four teach a change of perspective: everything seen can invite recognition of the One. The final “blindness” is the lack of spiritual insight, not a judgment of actual vision ability; the Guru grants a different kind of understanding.',
 [['ਨੇਤ੍ਰਹੁ','O eyes; direct address to the faculty of seeing'],['ਦ੍ਰਿਸਟਿ','Sight, insight or vision by context']],
 'Do not imply that blind or visually impaired people lack spirituality, or promise that Gurbani restores sight. Divine “light” here is not measurable optical radiation.',
 'How can I look at another person with respect rather than making quick judgments?',
 'Which phrase in the final line describes spiritual insight rather than physical eyesight?'
], 'This is spiritual vision imagery, never a cure claim for blindness or a clinical evaluation of eyesight.');

// 37 · The ears, listening and the living Word
add(37,[
 ['O my ears, you were sent to listen to what is True.',
  'ਹੇ ਮੇਰੇ ਕੰਨੋ, ਤੁਹਾਨੂੰ ਸੱਚ ਸੁਣਨ ਲਈ ਭੇਜਿਆ ਗਿਆ ਹੈ।'],
 ['The ears are part of the body for attentive listening; hear the true Bani.',
  'ਸਰੀਰ ਵਿੱਚ ਕੰਨ ਸੱਚ ਦੀ ਗੱਲ ਸੁਣਨ ਲਈ ਹਨ; ਸੱਚੀ ਬਾਣੀ ਸੁਣੋ।'],
 ['Hearing that Bani is pictured as making body and mind flourish, with the tongue absorbed in its sweetness.',
  'ਸੱਚੀ ਬਾਣੀ ਸੁਣਨ ਨਾਲ ਮਨ ਤੇ ਤਨ ਖਿੜਦੇ ਅਤੇ ਰਸਨਾ ਉਸ ਦੇ ਰਸ ਵਿੱਚ ਰੰਗੀ ਜਾਂਦੀ ਦਿਖਾਈ ਹੈ।'],
 ['The True One is wondrous and beyond full sight or description; its extent cannot be exhaustively expressed.',
  'ਸੱਚਾ ਪ੍ਰਭੂ ਅਲਖ ਤੇ ਅਚਰਜ ਹੈ; ਉਸ ਦੀ ਪੂਰੀ ਗਤਿ ਕਹੀ ਨਹੀਂ ਜਾ ਸਕਦੀ।'],
 ['Nanak says: listen to the amrit of Naam and become inwardly pure, for you were given ears for Truth.',
  'ਨਾਨਕ ਆਖਦੇ ਹਨ: ਅੰਮ੍ਰਿਤ ਨਾਮ ਸੁਣੋ ਤੇ ਅੰਦਰੋਂ ਨਿਰਮਲ ਹੋਵੋ; ਕੰਨ ਸੱਚ ਸੁਣਨ ਲਈ ਮਿਲੇ ਹਨ।']
],[
 'Attentive listening to true Bani can deepen remembrance and ethical awareness in the heart.',
 'ਸੱਚੀ ਬਾਣੀ ਨੂੰ ਧਿਆਨ ਨਾਲ ਸੁਣਨਾ ਹਿਰਦੇ ਵਿੱਚ ਨਾਮ ਦੀ ਯਾਦ ਤੇ ਸੂਝ ਨੂੰ ਡੂੰਘਾ ਕਰਦਾ ਹੈ।',
 'Listening is presented as an active spiritual practice.',
 'The poet addresses the ears directly, much as Pauri36 addressed the eyes. Hearing the true Bani is connected with inner flourishing and sweetness. The fourth line reminds us that the Divine cannot be fully captured by words, even as the fifth returns to listening and Naam. This is attentive spiritual reception, not an exclusion of learners who communicate differently.',
 [['ਸ੍ਰਵਣਹੁ','O ears or listeners; direct address'],['ਬਾਣੀ','Sacred Word or spoken teaching in this context']],
 'Hearing disability or deafness does not make a person impure or less able to engage with Gurbani through reading, signing or other accessible means. No clinical hearing improvement is promised.',
 'What changes when I listen carefully rather than only waiting to speak?',
 'How do the references to ears and tongue work together in the middle of this pauri?'
], 'The language of listening is devotional and accessibility inclusive; not a medical treatment or proof of audio-frequency effects.');

// 38 · Breath and the body as an instrument; inner spiritual doorway
add(38,[
 ['The Divine placed life within the body-like cave and set the instrument of breath in motion.',
  'ਪ੍ਰਭੂ ਨੇ ਸਰੀਰ-ਗੁਫਾ ਵਿੱਚ ਜੀਵਨ ਰੱਖਿਆ ਤੇ ਪਵਣ ਦਾ ਵਾਜਾ ਵਜਾਇਆ—ਇਹ ਕਵੀ ਦੀ ਤਸਵੀਰ ਹੈ।'],
 ['The poem describes nine visible gates of the body and a tenth kept hidden.',
  'ਬਾਣੀ ਸਰੀਰ ਦੇ ਨੌਂ ਪ੍ਰਗਟ ਦੁਆਰਿਆਂ ਅਤੇ ਇਕ ਲੁਕੇ ਦਸਵੇਂ ਦੁਆਰ ਦੀ ਤਸਵੀਰ ਦਿੰਦੀ ਹੈ।'],
 ['Through the Guru’s teaching, some are brought into loving awareness of that deeper tenth doorway.',
  'ਗੁਰੂ ਦੀ ਸੇਧ ਨਾਲ ਕੁਝ ਮਨੁੱਖਾਂ ਨੂੰ ਉਸ ਡੂੰਘੇ ਦਸਵੇਂ ਦੁਆਰ ਦੀ ਸੂਝ ਹੁੰਦੀ ਹੈ।'],
 ['Within that mystery are countless forms and the treasure of spiritual gifts, beyond our ability to measure fully.',
  'ਉਸ ਅਚਰਜ ਵਿੱਚ ਅਨੇਕ ਰੂਪ ਤੇ ਨੌਂ ਨਿਧੀਆਂ ਦੀ ਭਗਤੀ-ਤਸਵੀਰ ਹੈ; ਪੂਰਾ ਅੰਤ ਨਹੀਂ ਪਾਇਆ ਜਾਂਦਾ।'],
 ['Nanak repeats that the Beloved placed life in this cave of the body and stirred the wind-like instrument.',
  'ਨਾਨਕ ਮੁੜ ਆਖਦੇ ਹਨ: ਪਿਆਰੇ ਹਰਿ ਨੇ ਸਰੀਰ-ਗੁਫਾ ਵਿੱਚ ਜੀਵਨ ਰੱਖਿਆ ਤੇ ਪਵਣ ਦਾ ਵਾਜਾ ਚਲਾਇਆ।']
],[
 'The body’s breath and inward spiritual attention are described through a cave, a wind instrument and a hidden doorway.',
 'ਸਰੀਰ ਦੀ ਸਾਂਸ ਤੇ ਅੰਦਰਲੀ ਸੂਝ ਨੂੰ ਗੁਫਾ, ਪਵਣ ਦੇ ਵਾਜੇ ਅਤੇ ਗੁਪਤ ਦੁਆਰ ਦੇ ਰੂਪਕਾਂ ਨਾਲ ਸਮਝਾਇਆ ਹੈ।',
 'Respect symbolic traditional anatomy without treating it as a device manual.',
 'The pauri’s opening and ending describe the body as a cave holding life, with breath as an instrument. The middle invokes nine visible and one hidden door, then says the Guru grants awareness. The “tenth doorway” has a rich Sikh interpretive history and needs qualified theological review; the poem does not specify an anatomical opening or a breath-control exercise.',
 [['ਗੁਫਾ','Cave; a metaphor for the embodied inner space'],['ਦੁਆਰੁ','Doorway; symbol of spiritual awareness in context']],
 'Do not claim a literal tenth anatomical hole, prescribe breath-holding/hyperventilation, promise altered consciousness, or instruct children to attempt a bodily exercise. An expert Sikh/Santhiya reviewer must approve contextual interpretation.',
 'How might ordinary breathing remind me to be attentive without forcing any special technique?',
 'Which features of the body are presented as musical or architectural imagery?'
], 'The nine/tenth gate imagery is devotional, not a medical anatomy guide, yoga instruction or objective experimental map.');

// 39 · True Sohila sung in the house of Truth
add(39,[
 ['Sing this true Sohila, a song of praise, in the home of Truth.',
  'ਸੱਚ ਦੇ ਘਰ ਵਿੱਚ ਇਹ ਸੱਚਾ ਸੋਹਿਲਾ ਗਾਓ।'],
 ['Sing the joyful song in the true home where the One is continually remembered.',
  'ਉਸ ਸੱਚੇ ਘਰ ਵਿੱਚ ਸੋਹਿਲਾ ਗਾਓ ਜਿੱਥੇ ਸਦਾ ਸੱਚੇ ਪ੍ਰਭੂ ਦਾ ਧਿਆਨ ਹੁੰਦਾ ਹੈ।'],
 ['The One is remembered by those upon whom grace rests; the Guru-oriented are given understanding.',
  'ਜਿਨ੍ਹਾਂ ਉੱਤੇ ਕਿਰਪਾ ਹੋਵੇ, ਉਹ ਸੱਚ ਨੂੰ ਧਿਆਉਂਦੇ ਅਤੇ ਗੁਰਮੁਖ ਹੋ ਕੇ ਸੂਝ ਪਾਂਦੇ ਹਨ।'],
 ['The True One is Lord of everyone, and each receives through Divine blessing.',
  'ਸੱਚਾ ਪ੍ਰਭੂ ਸਭ ਦਾ ਖਸਮ ਹੈ; ਜਿਸ ਨੂੰ ਬਖ਼ਸ਼ੇ ਉਹ ਇਹ ਦਾਤ ਪਾਂਦਾ ਹੈ।'],
 ['Nanak repeats: sing the true Sohila within that true home.',
  'ਨਾਨਕ ਮੁੜ ਆਖਦੇ ਹਨ: ਸੱਚੇ ਘਰ ਵਿੱਚ ਸੱਚਾ ਸੋਹਿਲਾ ਗਾਓ।']
],[
 'True praise grows where the heart remembers the Divine through grace and Guru-given understanding.',
 'ਸੱਚਾ ਸੋਹਿਲਾ ਉਥੇ ਗੂੰਜਦਾ ਹੈ ਜਿੱਥੇ ਮਨ ਨਾਮ ਨਾਲ ਜੁੜਦਾ ਅਤੇ ਗੁਰੂ ਦੀ ਸੇਧ ਪਾਉਂਦਾ ਹੈ।',
 'Sohila as the song of the true home.',
 'The first and final lines frame the pauri with “sacha sohila” and “sachai ghar.” The middle identifies what fills that home: remembrance of Truth, Guru-oriented understanding and Divine grace shared without regard to status. This use of “sohila” is a poetic description within Anand Sahib; it is not the text identity of the separate Kirtan Sohila night composition.',
 [['ਸੋਹਿਲਾ','A joyful song of praise or celebration'],['ਖਸਮੁ','Lord, Protector or Sovereign in devotional usage']],
 'Do not confuse this Anand stanza with all five shabads of Kirtan Sohila merely because both use the word “sohila.” Nor equate the “true home” with one physical building.',
 'What might a home devoted to truth look like in ordinary relationships?',
 'What belongs in the “true home” according to the central lines?'
], 'The true home may be inward spiritual belonging; no literal location, building or separate-bani identity should be imposed.');

// 40 · Anand, liberation from distress in devotional imagery
add(40,[
 ['Listen, blessed ones, to this Anand; the heart’s longings are pictured as fulfilled.',
  'ਹੇ ਵਡਭਾਗੀਓ, ਇਹ ਅਨੰਦ ਸੁਣੋ; ਮਨੋਰਥ ਪੂਰੇ ਹੋਣ ਦੀ ਭਗਤੀ-ਭਰੀ ਤਸਵੀਰ ਹੈ।'],
 ['Finding the Transcendent Divine, the poem says, removes deep anxieties and grief.',
  'ਪਾਰਬ੍ਰਹਮ ਪ੍ਰਭੂ ਦੇ ਮਿਲਾਪ ਨਾਲ ਮਨ ਦੇ ਵਿਸੂਰੇ ਦੂਰ ਹੋਣ ਦੀ ਗੱਲ ਹੈ।'],
 ['Suffering, illness and burning distress are described as lifted by hearing the true Bani.',
  'ਸੱਚੀ ਬਾਣੀ ਸੁਣਨ ਨਾਲ ਦੁੱਖ, ਰੋਗ ਤੇ ਸੰਤਾਪ ਦੂਰ ਹੋਣ ਦੀ ਧਾਰਮਿਕ ਅਸੀਸ ਦਿੱਤੀ ਹੈ।'],
 ['Saintly companions become joyful, receiving understanding through the Perfect Guru.',
  'ਸੰਤ ਤੇ ਸੱਜਣ ਪ੍ਰਸੰਨ ਹੋ ਜਾਂਦੇ ਅਤੇ ਪੂਰੇ ਗੁਰੂ ਰਾਹੀਂ ਸੂਝ ਪਾਂਦੇ ਹਨ।'],
 ['Listening and speaking this Bani are praised as purifying because the True Guru is fully present.',
  'ਇਸ ਬਾਣੀ ਨੂੰ ਸੁਣਨਾ ਤੇ ਕਹਿਣਾ ਨਿਰਮਲ ਕਰਨ ਵਾਲਾ ਦੱਸਿਆ ਹੈ; ਸਤਿਗੁਰੂ ਸਰਬ-ਵਿਆਪਕ ਹੈ।'],
 ['Nanak bows at the Guru’s feet, while the unstruck trumpets of joy resound in the poem.',
  'ਨਾਨਕ ਗੁਰੂ ਦੇ ਚਰਨਾਂ ਨਾਲ ਜੁੜ ਕੇ ਅਨਹਦ ਤੂਰਿਆਂ ਦੀ ਖੁਸ਼ੀ ਵਾਲੀ ਤਸਵੀਰ ਦਿੰਦੇ ਹਨ।']
],[
 'The closing Anand Pauri celebrates the joy and spiritual relief of listening to true Bani through the Guru.',
 'ਅਨੰਦ ਦੀ ਅੰਤਲੀ ਪਉੜੀ ਗੁਰੂ ਰਾਹੀਂ ਸੱਚੀ ਬਾਣੀ ਸੁਣਨ, ਸਮਝਣ ਤੇ ਆਤਮਕ ਖੁਸ਼ੀ ਦੀ ਵਡਿਆਈ ਕਰਦੀ ਹੈ।',
 'A closing blessing rather than a measurable treatment claim.',
 'The last pauri gathers the bani’s themes into a blessing: listening, finding the One, relief from distress, joy among companions, purification and the music of spiritual celebration. The third line explicitly mentions “dookh rog santaap”; this must be presented faithfully as what the sacred text says, **not** as an empirical guarantee that hearing the bani cures infections, cancer, mental illness or disability. The closing anhad trumpets are spiritual imagery, not a literal recorded concert.',
 [['ਅਨਦੁ','Spiritual joy or bliss'],['ਰੋਗ','Illness or affliction, used in this devotional blessing']],
 'Do NOT market Gurbani as a replacement for medical care or a guaranteed cure for physical or mental illness. “Manorath poore” is devotional hope, not a contractual promise of every worldly desire being met.',
 'How could hearing these teachings help me face suffering with compassion while still seeking appropriate help?',
 'What themes from the whole Anand Sahib return in this final pauri?'
], 'Statements of illness disappearing are religious/devotional language, not clinical efficacy data, and should not be used to dissuade anyone from medical treatment.');
