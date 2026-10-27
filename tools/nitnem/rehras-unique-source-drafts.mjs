/* GLP-001 — 27 independently authored Rehras-specific source RECORD
 * bilingual EDUCATIONAL passage summaries; NOT word-by-word translations.
 *
 * Unlike Chaupai's four short tuks per unit, parts of this frozen Rehras
 * digital source concatenate multiple original SGGS verse lines into one
 * record. These notes must therefore be labeled "passage summary/context"
 * directly below their original source record — never as a line-by-line
 * literal translation. Unedited original is still the only scripture.
 *
 * One exact record source ID per row. Six-family SGGS and Dasam composition
 * boundaries preserved. All notes AI-assisted, DRAFT, unreviewed.
 */
export const rehrasUniqueLineDrafts=[];
export const rehrasUniqueDeepDrafts=[];
function add(unitId,records,care){
 const sourceFamily=unitId.startsWith('rehras.sggs')||unitId==='rehras.mundawani'||unitId==='rehras.slok'?'sggs':'dasam';
 for(let i=0;i<records.length;i++){
  const [simpleEn,simplePa]=records[i];
  rehrasUniqueLineDrafts.push({
   bani:'rehras',lineId:unitId+'.line'+String(i+1).padStart(2,'0'),
   simpleEn,simplePa,nuance:care,
   sourceContext:'REHRAS_ORIGINAL_AGGREGATED_TUK_RECORD; '+sourceFamily+' family; summary not literal per-tuk translation',
   meaningKind:'AGGREGATED_SOURCE_RECORD_EDUCATIONAL_CONTEXT_NOT_LITERAL_TRANSLATION',
   editorialStatus:'DRAFT_AI_UNREVIEWED'
  });
 }
}
function study(unitId,en,pa,focus,closeReading,words,care,reflection,teachBack){
 rehrasUniqueDeepDrafts.push({bani:'rehras',unitId,simpleEn:en,simplePa:pa,
  study:{focus,closeReading,words,care,reflection,teachBack},
  editorialStatus:'DRAFT_AI_UNREVIEWED'});
}
// Sodar: named raag/author/intro and cosmic praise of One.
add('rehras.sggs01',[
 ['Source heading: So Dar in Raag Aasa, Mahala 1, opens under the invocation of the One through the Guru’s grace.',
  'ਸਿਰਲੇਖ: ਸੋ ਦਰੁ, ਰਾਗ ਆਸਾ, ਮਹਲਾ ਪਹਿਲਾ; ਇੱਕ ਪ੍ਰਭੂ ਅਤੇ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਦੀ ਯਾਦ ਨਾਲ ਆਰੰਭ ਹੁੰਦਾ ਹੈ।'],
 ['The poet wonders at the Divine court and home, where countless sounds, raags and singers join the praise; even wind, water, fire and moral order are pictured singing.',
  'ਕਵੀ ਪ੍ਰਭੂ ਦੇ ਦਰਬਾਰ ਦਾ ਅਚਰਜ ਦੱਸਦਾ ਹੈ; ਅਣਗਿਣਤ ਨਾਦ, ਰਾਗ ਤੇ ਗਾਇਕ, ਪਵਣ, ਪਾਣੀ, ਅੱਗ ਅਤੇ ਧਰਮ ਵੀ ਉਸ ਦੀ ਸਿਫ਼ਤ ਵਿੱਚ ਜੁੜੇ ਦਿਖਦੇ ਹਨ।'],
 ['Traditional recorders of deeds, Brahma, Shiva, Indra, siddhs and seekers all join this vast hymn of Divine praise.',
  'ਧਰਮ ਦੇ ਲੇਖੇ ਵਾਲੇ ਪੁਰਾਣਕ ਪਾਤਰ, ਬ੍ਰਹਮਾ, ਸ਼ਿਵ, ਇੰਦਰ, ਸਿੱਧ ਅਤੇ ਸਾਧਕ ਸਭ ਪ੍ਰਭੂ ਦੀ ਵਡਿਆਈ ਕਰਦੇ ਦਿਖਾਏ ਗਏ ਹਨ।'],
 ['Ascetics, truthful people, scholars, enchanting beings, created jewels and holy places are all portrayed as part of creation’s praise.',
  'ਜਤੀ-ਸਤੀ, ਸੰਤੋਖੀ, ਪੰਡਿਤ, ਸੁੰਦਰ ਰਚਨਾਵਾਂ, ਰਤਨ ਅਤੇ ਤੀਰਥ ਸਾਰੇ ਸਿਰਜਣਹਾਰ ਦੀ ਸਿਫ਼ਤ ਵਾਲੇ ਵਿਸ਼ਾਲ ਦ੍ਰਿਸ਼ ਵਿੱਚ ਆਉਂਦੇ ਹਨ।'],
 ['Warriors, living beings and worlds beyond counting offer praise; those who please the One are absorbed in devotion, while the poet admits that the full number cannot be named.',
  'ਸੂਰਮੇ, ਜੀਵ ਤੇ ਬੇਅੰਤ ਲੋਕ ਪ੍ਰਭੂ ਦੀ ਵਡਿਆਈ ਕਰਦੇ ਹਨ; ਉਸ ਨੂੰ ਪਿਆਰੇ ਭਗਤ ਨਾਮ ਨਾਲ ਰੰਗੇ ਹਨ ਅਤੇ ਕਵੀ ਸਭ ਦੀ ਗਿਣਤੀ ਤੋਂ ਅਸਮਰੱਥਤਾ ਮੰਨਦਾ ਹੈ।'],
 ['The One true Lord remains through time, creates many forms and observes them, and the poet ends by counselling acceptance of Divine Hukam.',
  'ਸੱਚਾ ਸਾਹਿਬ ਸਦਾ ਕਾਇਮ ਰਹਿੰਦਾ ਹੈ, ਅਨੇਕ ਰੂਪ ਰਚਦਾ ਤੇ ਉਨ੍ਹਾਂ ਨੂੰ ਵੇਖਦਾ ਹੈ; ਅੰਤ ਵਿੱਚ ਨਾਨਕ ਰਜ਼ਾ ਵਿੱਚ ਰਹਿਣ ਦੀ ਸੇਧ ਦਿੰਦੇ ਹਨ।']
], 'These long frozen original source records each contain several original tuks. All accompanying text is a topical passage summary, not an approved literal translation. Mythic beings and cosmic “singing” are devotional imagery, not historical or scientific measurements.');

// Aasa M1: Divine greatness beyond measure.
add('rehras.sggs02',[
 ['Everyone calls the Lord great, yet no one can fully measure or price that greatness; the refrain praises the deep, generous Sovereign beyond counting.',
  'ਸਾਰੇ ਪ੍ਰਭੂ ਨੂੰ ਵੱਡਾ ਆਖਦੇ ਹਨ, ਪਰ ਉਸ ਦੀ ਮਹਿਮਾ ਦਾ ਪੂਰਾ ਮੋਲ ਨਹੀਂ ਪੈਂਦਾ; ਰਹਾਉ ਅਥਾਹ ਗੁਣਾਂ ਵਾਲੇ ਸਾਹਿਬ ਦੀ ਵਡਿਆਈ ਕਰਦਾ ਹੈ।'],
 ['Even gathered sages, meditators and virtuous practitioners cannot exhaust the One’s glory; spiritual accomplishment is received through grace, and Nanak remembers the inexhaustible truth.',
  'ਗਿਆਨੀ, ਧਿਆਨੀ ਤੇ ਨੇਕ ਕਰਮ ਵਾਲੇ ਮਿਲ ਕੇ ਵੀ ਉਸ ਦੀ ਵਡਿਆਈ ਪੂਰੀ ਨਹੀਂ ਕਹਿ ਸਕਦੇ; ਕਿਰਪਾ ਨਾਲ ਸੇਧ ਮਿਲਦੀ ਅਤੇ ਨਾਨਕ ਸੱਚ ਨੂੰ ਯਾਦ ਕਰਦੇ ਹਨ।']
], 'This source record combines multiple tuks and numbered sub-stanzas; the note is an attributed educational summary, not a tuk-by-tuk literal translation. The Great One is not a calculable object.');

// Aasa M1: craving for the True Naam.
add('rehras.sggs03',[
 ['The speaker lives through naming the True One and feels separation as spiritual death; the hunger for Naam helps put troubles into perspective, while the refrain asks why the mind forgets the True Lord.',
  'ਸੱਚੇ ਨਾਮ ਦੀ ਯਾਦ ਜੀਵਨ ਦਾ ਆਸਰਾ ਹੈ ਤੇ ਵਿਸਾਰਨਾ ਅੰਦਰਲੀ ਮੌਤ ਵਰਗਾ ਲੱਗਦਾ ਹੈ; ਨਾਮ ਦੀ ਭੁੱਖ ਦੁੱਖ ਤੋਂ ਰਾਹ ਦਿਖਾਉਂਦੀ ਅਤੇ ਰਹਾਉ ਪ੍ਰਭੂ ਨੂੰ ਨਾ ਭੁੱਲਣ ਦੀ ਸੇਧ ਦਿੰਦਾ ਹੈ।'],
 ['The Divine does not die or exhaust its giving; the Creator of day and night is praised as the true support, and forgetting Naam is condemned as spiritual disregard.',
  'ਪ੍ਰਭੂ ਸਦਾ ਰਹਿਣ ਤੇ ਦਾਤ ਦੇਣ ਵਾਲਾ ਹੈ; ਦਿਨ-ਰਾਤ ਦੇ ਰਚਨਹਾਰ ਨੂੰ ਅਸਲ ਸਹਾਰਾ ਆਖਿਆ ਅਤੇ ਨਾਮ ਵਿਸਾਰਨ ਨੂੰ ਡੂੰਘੀ ਭੁੱਲ ਦੱਸਿਆ ਹੈ।']
], 'Words about dying when remembrance is lost or suffering leaving are devotional metaphors, not clinical claims or a basis for judging caste or human dignity. Multiple original source tuks are summarized together.');

// Gujri M4: Guru’s protection and Naam as Rahras.
add('rehras.sggs04',[
 ['With profound humility the speaker approaches the True Guru, asking for the light of Naam; the refrain calls Naam a companion of life and Hari’s praise the true evening Rahras.',
  'ਨਿਮਰਤਾ ਨਾਲ ਸਤਿਗੁਰੂ ਦੀ ਸ਼ਰਨ ਆ ਕੇ ਨਾਮ ਦਾ ਚਾਨਣ ਮੰਗਿਆ ਹੈ; ਰਹਾਉ ਨਾਮ ਨੂੰ ਜੀਵਨ ਦਾ ਸਾਥੀ ਅਤੇ ਹਰਿ ਦੀ ਕੀਰਤ ਨੂੰ ਰਹਿਰਾਸਿ ਦੱਸਦਾ ਹੈ।'],
 ['The blessing of trusting Hari and joining the sangat is celebrated, while estrangement from Naam is pictured as a wasted opportunity; the hymn ends by praising the transformative sangat.',
  'ਹਰਿ ਨਾਲ ਸ਼ਰਧਾ ਅਤੇ ਸੰਗਤ ਦੇ ਮਿਲਾਪ ਦੀ ਵਡਿਆਈ ਹੈ; ਨਾਮ ਤੋਂ ਦੂਰ ਜੀਵਨ ਨੂੰ ਗੁਆਇਆ ਮੌਕਾ ਦੱਸਿਆ, ਅੰਤ ਵਿੱਚ ਸਤਸੰਗਤ ਦਾ ਧੰਨਵਾਦ ਹੈ।']
], 'Words about those outside sangat are the source poem’s devotional exhortation, not a right to stigmatize anyone. This is a multi-tuk source record summary.');

// Gujri M5: don’t live entirely in worry about sustenance.
add('rehras.sggs05',[
 ['The mind is asked why it worries constantly about provision when the One sustains even creatures among stones; the refrain recalls the uplifting presence of the sangat and Guru’s grace.',
  'ਮਨ ਨੂੰ ਪੁੱਛਿਆ ਕਿ ਰੋਜ਼ੀ ਦੀ ਚਿੰਤਾ ਕਿਉਂ ਜਕੜਦੀ ਹੈ, ਜਦ ਪ੍ਰਭੂ ਪੱਥਰਾਂ ਵਿਚਲੇ ਜੀਵਾਂ ਦੀ ਵੀ ਸੰਭਾਲ ਕਰਦਾ ਹੈ; ਰਹਾਉ ਸੰਗਤ ਤੇ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨੂੰ ਯਾਦ ਕਰਦਾ ਹੈ।'],
 ['The One sustains people and creatures beyond what family members alone can provide; birds and their young become images of care, ending in gratitude for Divine gifts without limit.',
  'ਪਰਿਵਾਰ ਤੋਂ ਵੀ ਵੱਡਾ ਪ੍ਰਭੂ ਦਾ ਆਸਰਾ ਯਾਦ ਕੀਤਾ ਹੈ; ਦੂਰ ਉੱਡਦੇ ਪੰਛੀਆਂ ਅਤੇ ਉਨ੍ਹਾਂ ਦੇ ਬੱਚਿਆਂ ਦੀ ਤਸਵੀਰ ਰਾਹੀਂ ਸੰਭਾਲ ਦਿਖਾ ਕੇ ਅੰਤ ਵਿੱਚ ਬੇਅੰਤ ਦਾਤਾਂ ਦਾ ਸ਼ੁਕਰਾਨਾ ਹੈ।']
], 'The source’s sustaining-care imagery must never mean “do not work, feed your children, seek care or plan for rent.” Animal behaviour in the verse is devotional illustration, not modern biological evidence.');

// Aasa M4 — So Purakh
add('rehras.sggs06',[
 ['So Purakh begins by praising the pure, boundless One whom all living beings remember, the Creator and sustainer of every life; Hari is depicted as both sovereign and present with devotees.',
  'ਸੋ ਪੁਰਖੁ ਵਿੱਚ ਨਿਰੰਜਨ ਬੇਅੰਤ ਪ੍ਰਭੂ ਨੂੰ ਸਿਰਜਣਹਾਰ ਤੇ ਜੀਵਾਂ ਦਾ ਦਾਤਾਰ ਆਖਿਆ ਹੈ; ਸਾਰੇ ਉਸ ਨੂੰ ਯਾਦ ਕਰਦੇ ਅਤੇ ਉਹ ਭਗਤਾਂ ਦਾ ਸਹਾਰਾ ਹੈ।'],
 ['The One pervades every heart; the poem sees giver and receiver alike within the Divine play, praising a Reality too vast for any one person to describe.',
  'ਇੱਕ ਪ੍ਰਭੂ ਹਰ ਘਟ ਵਿੱਚ ਵਿਆਪਕ ਹੈ; ਦਾਤਾ ਤੇ ਮੰਗਤਾ ਉਸੇ ਦੇ ਖੇਲ ਵਿੱਚ ਹਨ, ਉਸ ਦੀ ਪੂਰੀ ਵਡਿਆਈ ਬਿਆਨ ਨਹੀਂ ਹੁੰਦੀ।'],
 ['Those who remember the Fearless One are praised as finding peace and freedom from bondage to death and fear, and the devotee gives thanks for such remembrance.',
  'ਨਿਰਭਉ ਹਰਿ ਦੀ ਯਾਦ ਨਾਲ ਸੁਖ, ਡਰ ਤੇ ਕਾਲ ਦੇ ਬੰਧਨ ਤੋਂ ਮੁਕਤੀ ਦੀ ਆਤਮਕ ਤਸਵੀਰ ਹੈ; ਭਗਤ ਇਸ ਦਾਤ ਲਈ ਸਦਕੇ ਜਾਂਦਾ ਹੈ।'],
 ['Many people praise through devotion, worship, study, austerity and traditional practices; the poem honours those who are sincerely dear to the One.',
  'ਅਨੇਕ ਭਗਤ, ਪੂਜਾ, ਪਾਠ ਤੇ ਤਪਸਿਆ ਦੇ ਢੰਗਾਂ ਦਾ ਜ਼ਿਕਰ ਹੈ; ਪ੍ਰਭੂ ਨੂੰ ਪਿਆਰੇ ਸੱਚੇ ਭਗਤਾਂ ਦੀ ਵਡਿਆਈ ਹੈ।'],
 ['The One eternal Creator remains through all ages, brings forth and withdraws the creation, and Nanak sings of the Lord who knows everyone.',
  'ਇੱਕੋ ਕਰਤਾਰ ਜੁਗਾਂ ਤੋਂ ਅਡੋਲ ਹੈ; ਸ੍ਰਿਸ਼ਟੀ ਰਚਦਾ ਤੇ ਸਮੇਟਦਾ ਹੈ ਅਤੇ ਨਾਨਕ ਸਭ ਨੂੰ ਜਾਣਨ ਵਾਲੇ ਪ੍ਰਭੂ ਦੇ ਗੁਣ ਗਾਉਂਦੇ ਹਨ।']
], 'Source records combine several SGGS tuks. Statements about release from death and universal divine presence are theological poetry, not medical or scientific claims. Preserve the five-part source order.');

// Aasa M4 — Hukam and Divine river (new deep Study required)
add('rehras.sggs07',[
 ['You are the truthful Creator and Sovereign; all belongs to You, Naam is received through grace, and the river-like Divine holds creation and the changing meetings of living beings.',
  'ਤੂੰ ਸੱਚਾ ਕਰਤਾਰ ਤੇ ਸਾਹਿਬ ਹੈਂ; ਸਭ ਤੇਰਾ ਹੈ, ਕਿਰਪਾ ਨਾਲ ਨਾਮ-ਰਤਨ ਮਿਲਦਾ ਹੈ, ਅਤੇ ਦਰਿਆ ਵਰਗੇ ਪ੍ਰਭੂ ਵਿੱਚ ਜੀਵਾਂ ਦੇ ਮਿਲਾਪ-ਵਿਛੋੜੇ ਦਾ ਖੇਲ ਹੈ।'],
 ['Only those You make understand can know You; the hymn celebrates Hari’s virtues, natural peace and the Guru-oriented recognition that the Creator does everything.',
  'ਜਿਸ ਨੂੰ ਪ੍ਰਭੂ ਸੂਝ ਬਖ਼ਸ਼ਦਾ ਉਹੀ ਪਛਾਣਦਾ ਹੈ; ਹਰਿ ਦੀ ਸਿਫ਼ਤ, ਸਹਜ ਦਾ ਸੁਖ ਅਤੇ ਗੁਰਮੁਖ ਜੀਵਨ ਵਿੱਚ ਕਰਤਾਰ ਦੀ ਪਛਾਣ ਦੀ ਵਡਿਆਈ ਹੈ।']
], 'The river and encounters/separations are devotional imagery. Hukam must not be used to excuse harmful human conduct or deny responsibility. These long records are summaries of multiple original tuks.');

// Aasa M1 — the mud-filled pond and remembering the One
add('rehras.sggs08',[
 ['The mind is likened to a lotus entangled in a muddy pond of attachment; the refrain asks why the foolish mind forgets the One, and the speaker humbly seeks those who keep the Divine in remembrance.',
  'ਮਨ ਨੂੰ ਮੋਹ ਦੇ ਚਿੱਕੜ ਵਿੱਚ ਫਸੇ ਕੰਵਲ ਵਾਂਗ ਦੱਸਿਆ ਹੈ; ਰਹਾਉ ਮਨ ਨੂੰ ਇੱਕ ਪ੍ਰਭੂ ਯਾਦ ਕਰਨ ਦੀ ਸੇਧ ਦਿੰਦਾ ਅਤੇ ਕਵੀ ਨਾਮ ਨਾ ਭੁੱਲਣ ਵਾਲਿਆਂ ਦੀ ਸ਼ਰਨ ਮੰਗਦਾ ਹੈ।']
], 'Mud, drowning and an unwise mind are spiritual metaphors. They do not describe psychiatric illness, disability, caste or a literal physical drowning event. The source record contains a full hymn.');

// Aasa M5 — the opportunity of human life and Sangat
add('rehras.sggs09',[
 ['Human birth is described as an opportunity to meet Gobind through Naam and the sangat; the hymn urges the mind not to lose that opportunity in attachment and ends in a humble request for protection.',
  'ਮਨੁੱਖਾ ਜਨਮ ਗੋਬਿੰਦ ਨਾਲ ਮਿਲਾਪ ਦਾ ਮੌਕਾ ਹੈ; ਨਾਮ ਤੇ ਸਾਧਸੰਗਤ ਨਾਲ ਜੁੜ ਕੇ ਮਾਇਆ ਦੇ ਮੋਹ ਵਿੱਚ ਮੌਕਾ ਨਾ ਗੁਆਉਣ ਦੀ ਸੇਧ ਹੈ ਅਤੇ ਅੰਤ ਵਿੱਚ ਸ਼ਰਨ ਦੀ ਬੇਨਤੀ ਹੈ।']
], 'Human worth is not a performance score and this poem never authorizes judging someone who cannot attend sangat or has a disability. The source record contains multiple tuks, not a single translated line.');

// Evening Pae Gahe Savaiya (not the ten morning Sravag Sudh Savaiye)
add('rehras.savaiya01',[
 ['The poet takes refuge at the Divine feet, declining to make another ultimate refuge; Rama, Rahim and named scriptural traditions appear in a strong comparison that ends with the poet relying on Asipan’s grace.',
  'ਕਵੀ ਪ੍ਰਭੂ ਦੇ ਚਰਨਾਂ ਦੀ ਸ਼ਰਨ ਲੈ ਕੇ ਹੋਰ ਅੰਤਿਮ ਆਸਰਾ ਨਾ ਭਾਲਣ ਦੀ ਗੱਲ ਕਰਦਾ ਹੈ; ਰਾਮ-ਰਹੀਮ ਤੇ ਧਾਰਮਿਕ ਗ੍ਰੰਥਾਂ ਦਾ ਜ਼ਿਕਰ ਕਰਕੇ ਅੰਤ ਵਿੱਚ ਅਸਿਪਾਨ ਦੀ ਕਿਰਪਾ ਮੰਗਦਾ ਹੈ।']
], 'This is the EVENING Pae Gahe Savaiya, not the ten morning Sravag Sudh verses. The critique of religious paths must never be used to demean believers of other traditions. The original record includes multiple poetic tuks.');

// Evening Sagal Duar Dohira
add('rehras.dohira01',[
 ['Leaving every other doorway, the poet seeks the Divine doorway and asks the One to honour the protection of a servant who has grasped that refuge.',
  'ਹੋਰ ਸਭ ਦਰ ਛੱਡ ਕੇ ਕਵੀ ਪ੍ਰਭੂ ਦੇ ਦਰ ਦੀ ਸ਼ਰਨ ਲੈਂਦਾ ਹੈ ਅਤੇ ਬੇਨਤੀ ਕਰਦਾ ਹੈ ਕਿ ਆਪਣੀ ਬਾਂਹ ਫੜੇ ਸੇਵਕ ਦੀ ਲਾਜ ਰੱਖ।']
], 'Traditional martial/servant imagery expresses devotional refuge; not obedience to a human authority, literal rejection of all practical help or a promise of physical invulnerability. This is an evening Dohira, not the morning Savaiye.');

// Mundawani SGGS M5
add('rehras.mundawani',[
 ['In the poetic platter lie truth, contentment and reflective understanding, together with the nourishing Naam of the Lord; those who receive and live this gift are pictured as crossing worldly darkness.',
  'ਰੂਪਕ ਵਾਲੇ ਥਾਲ ਵਿੱਚ ਸਤ, ਸੰਤੋਖ ਤੇ ਵਿਚਾਰ ਦੀਆਂ ਤਿੰਨ ਵਸਤਾਂ ਹਨ; ਹਰਿ ਦਾ ਅੰਮ੍ਰਿਤ ਨਾਮ ਸਹਾਰਾ ਹੈ ਅਤੇ ਇਸ ਨੂੰ ਮਨ ਵਿੱਚ ਵਸਾਉਣ ਵਾਲਾ ਭਵਜਲ ਤੋਂ ਪਾਰ ਹੋਣ ਦੀ ਸੇਧ ਲੈਂਦਾ ਹੈ।']
], 'Mundawani uses a food/platter metaphor for qualities of a lived spiritual practice, not an actual edible cure or promise of material goods. Source is SGGS Mahala 5.');

// Final Tera Keeta slok, SGGS M5
add('rehras.slok',[
 ['The speaker admits that the Divine gifts cannot be fully understood, expresses humility and gratitude for compassion and the True Guru, and describes Naam as bringing renewed life to body and mind.',
  'ਕਵੀ ਮੰਨਦਾ ਹੈ ਕਿ ਪ੍ਰਭੂ ਦੀਆਂ ਦਾਤਾਂ ਪੂਰੀਆਂ ਨਹੀਂ ਸਮਝੀਆਂ ਜਾਂਦੀਆਂ; ਨਿਮਰਤਾ ਨਾਲ ਕਿਰਪਾ ਤੇ ਸਤਿਗੁਰੂ ਦਾ ਸ਼ੁਕਰ ਕਰਦਾ ਅਤੇ ਨਾਮ ਨੂੰ ਮਨ-ਤਨ ਦੀ ਹਰਿਆਵਲ ਦਾ ਆਸਰਾ ਦੱਸਦਾ ਹੈ।']
], '“Life and greening of body/mind” is devotional renewal, not a claim of treatment efficacy for illness. The slok belongs to SGGS Mahala 5 and must stay separate from Dasam source passages.');

study('rehras.sggs07',
 'The Creator alone is the True Sovereign: all lives rest within Divine order, and Naam and understanding are received through grace.',
 'ਸੱਚਾ ਕਰਤਾਰ ਸਭ ਦਾ ਸਾਹਿਬ ਹੈ; ਨਾਮ ਤੇ ਸੂਝ ਕਿਰਪਾ ਨਾਲ ਮਿਲਦੇ ਅਤੇ ਸਭ ਜੀਵ ਉਸ ਦੇ ਹੁਕਮ ਵਿੱਚ ਹਨ।',
 'Truthful Creator, the Divine river, grace and spiritual understanding.',
 'The source begins by naming the Creator as the True Sovereign and the reality of Hukam. It moves through grace that bestows the jewel of Naam and contrasts Guru-oriented understanding with losing sight of that gift. A river then images all existence within the Divine, including encounters and separations. The second source record returns to what it means to know the One and find natural peace through the Guru.',
 [['ਕਰਤਾ','Creator or maker'],['ਦਰੀਆਉ','River; metaphor for the One holding all beings']],
 'The river and the Divine source of meetings are spiritual metaphor, not a literal hydrological account. Hukam never excuses abuse or eliminates the need for responsible action.',
 'How might recognizing something larger than myself change my response to an unexpected separation?',
 'How does the image of a river connect the hymn’s first source record with the second?');
study('rehras.sggs08',
 'The mind caught in the muddy pool of attachment is invited to turn again toward the One through remembrance and humility.',
 'ਮੋਹ ਦੇ ਚਿੱਕੜ ਵਿੱਚ ਫਸਿਆ ਮਨ ਨਾਮ ਦੀ ਯਾਦ ਅਤੇ ਨਿਮਰਤਾ ਰਾਹੀਂ ਇੱਕ ਪ੍ਰਭੂ ਵੱਲ ਮੁੜਨ ਦੀ ਸੇਧ ਪਾਂਦਾ ਹੈ।',
 'The image of the lotus in a pond of attachment.',
 'The original source record contains a whole short hymn, starting with dwelling in a muddy pond and the lotus whose foot cannot move. The refrain addresses the unwise mind for forgetting the One. The poet does not boast of personal religious purity, but describes a vulnerable life and seeks refuge with those who do not forget the Divine. Its critical language should become self-examination, not contempt for other people.',
 [['ਪੰਕਜੁ','Lotus in this poetic context'],['ਸਰਵਰੜੈ','Pond or small lake; devotional environment image']],
 'This is figurative spiritual suffering, not a reason to stigmatize people with psychological distress. The pond is an image, not a location or a medical condition.',
 'What attachment might keep me from acting according to my deeper values?',
 'What does the muddy-pond/lotus metaphor add to the closing request for refuge?');
