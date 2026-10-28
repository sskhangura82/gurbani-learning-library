/* GLP-001 · Explicit editorial amendments to recovered Anand opening V8.
 * Baseline course.v8.json SHA-256:
 * b2fefd5aa5a76e7d47fe21ceae72bf987b35c49f507de89f119f3cf87bc2e8c5
 * These edits concern explanatory prose only. They confer no source,
 * translation, pronunciation, religious-review or publication approval.
 * The compiler must compare every previous field before applying an edit
 * to a NEW version, and retain the before/after ledger and immutable V8.
 * Byte inspection found no U+FFFD in V8 or its recovered author module;
 * anand05.line01 is a semantic clarification, not an encoding repair.
 */

const original917 = 'https://www.srigranth.org/servlet/gurbani.gurbani?Action=Page&Param=917&g=1&h=0&k=0&p=0&r=0&t=0';
const darpan917 = 'https://gurugranthdarpan.net/0917.html';

export const anandOpeningAmendments = [
  {
    lineId: 'anand01.line02',
    previousSimpleEn: 'By meeting the True Guru with natural ease, a new celebration begins within my mind.',
    previousSimplePa: 'ਸਹਜ ਨਾਲ ਸਤਿਗੁਰੂ ਮਿਲਿਆ ਅਤੇ ਮੇਰੇ ਮਨ ਵਿੱਚ ਖੁਸ਼ੀ ਦੀ ਵਧਾਈ ਗੂੰਜੀ।',
    previousNuance: 'Sahaj means inward poise in this poetic context; it is not a clinically measured mood state or a prescribed meditation technique.',
    simpleEn: 'I have found the True Guru and inward steadiness; celebration resounds in my mind.',
    simplePa: 'ਸਤਿਗੁਰੂ ਮਿਲਣ ਨਾਲ ਮਨ ਸਹਜ ਵਿੱਚ ਟਿਕਿਆ ਹੈ ਅਤੇ ਅੰਦਰ ਖੁਸ਼ੀ ਦੀਆਂ ਵਧਾਈਆਂ ਗੂੰਜ ਰਹੀਆਂ ਹਨ।',
    nuance: 'This working reading treats sahaj as inward poise accompanying the meeting with the Guru. It does not mean merely that meeting the Guru was easy, or prescribe a technique for producing a mood.',
    reason: 'Clarifies the relation of sahaj to finding the Guru; the earlier wording could make natural ease the manner or prerequisite of the encounter.',
    sourceUrls: [original917, darpan917, 'https://gurugranthsahib.io/bani/details/ASahib/1/2']
  },
  {
    lineId: 'anand03.line03',
    previousSimpleEn: 'May Your praise always be spoken, and may Your Naam abide in the mind.',
    previousSimplePa: 'ਤੇਰੀ ਸਿਫ਼ਤ-ਸਲਾਹ ਸਦਾ ਕਰੀਏ ਅਤੇ ਨਾਮ ਨੂੰ ਮਨ ਵਿੱਚ ਵਸਾਈਏ।',
    previousNuance: 'Praise and remembrance describe a way of living rather than an external prize or purchase.',
    simpleEn: 'That person continually praises You and keeps Your Naam within the mind.',
    simplePa: 'ਜਿਸ ਨੂੰ ਤੇਰੀ ਦਾਤ ਮਿਲਦੀ ਹੈ, ਉਹ ਸਦਾ ਤੇਰੀ ਸਿਫ਼ਤ ਕਰਦਾ ਅਤੇ ਤੇਰਾ ਨਾਮ ਮਨ ਵਿੱਚ ਵਸਾਉਂਦਾ ਹੈ।',
    nuance: 'The person receiving the gift in the preceding line remains the subject here. Praise and Naam describe that person’s life; the line is not a separate wish or a new first-person instruction.',
    reason: 'Restores the continuing third-person subject and descriptive sense, which the earlier English wish and Punjabi first-person exhortation obscured.',
    sourceUrls: [original917, darpan917, 'https://gurugranthsahib.io/bani/details/ASahib/3/2']
  },
  {
    lineId: 'anand03.line04',
    previousSimpleEn: 'Those whose hearts hold Naam are pictured as filled with many resonant Shabads.',
    previousSimplePa: 'ਜਿਨ੍ਹਾਂ ਦੇ ਮਨ ਵਿੱਚ ਨਾਮ ਵੱਸਦਾ ਹੈ, ਉਨ੍ਹਾਂ ਅੰਦਰ ਸ਼ਬਦਾਂ ਦੀ ਗੂੰਜ ਦਿਖਾਈ ਗਈ ਹੈ।',
    previousNuance: 'This sound imagery is poetic and not a claim that a particular audible frequency or track must play.',
    simpleEn: 'In minds where Naam dwells, many melodies of joy are pictured as resounding.',
    simplePa: 'ਜਿਨ੍ਹਾਂ ਦੇ ਮਨ ਵਿੱਚ ਨਾਮ ਵੱਸਦਾ ਹੈ, ਉਨ੍ਹਾਂ ਅੰਦਰ ਮਾਨੋ ਅਨੰਦ ਦੀਆਂ ਅਨੇਕ ਸੁਰਾਂ ਗੂੰਜਦੀਆਂ ਹਨ।',
    nuance: 'Sabada is read here in its musical sense of sounds or melodies. It should not automatically imply a collection of distinct canonical hymns, or require the reader to hear an actual sound.',
    reason: 'Clarifies the contextual musical sense of sabada ghanere instead of treating the plural as a definite set of canonical Shabads.',
    sourceUrls: [original917, darpan917, 'https://gurugranthsahib.io/bani/details/ASahib/3/2']
  },
  {
    lineId: 'anand05.line01',
    previousSimpleEn: 'In the blessed inner home, five Shabads are pictured as sounding.',
    previousSimplePa: 'ਭਾਗਾਂ ਵਾਲੇ ਹਿਰਦੇ-ਘਰ ਵਿੱਚ ਪੰਜ ਸ਼ਬਦਾਂ ਦੀ ਗੂੰਜ ਦੀ ਤਸਵੀਰ ਹੈ।',
    previousNuance: '“Five Shabads” and blessed home require qualified Sikh interpretive review; this is not evidence of five specific audio tracks or external sound waves.',
    simpleEn: 'In that fortunate inner home, a fivefold music of celebration is pictured as resounding.',
    simplePa: 'ਉਸ ਸੁਭਾਗੇ ਹਿਰਦੇ-ਘਰ ਵਿੱਚ ਮਾਨੋ ਪੰਜ ਕਿਸਮਾਂ ਦੇ ਸਾਜ਼ਾਂ ਦੀ ਸਾਂਝੀ ਧੁਨ ਵੱਜਦੀ ਹੈ।',
    nuance: 'Panch sabad is read here as five kinds of musical sounds. This musical image is distinct from the five disruptive impulses in line three; neither five particular hymns nor five audible tones are prescribed.',
    reason: 'Explains the fivefold musical image without implying five identified canonical hymns. The recovered original Punjabi was valid UTF-8 and is retained in the audit fields; no encoding repair is claimed.',
    sourceUrls: [original917, darpan917, 'https://gurugranthsahib.io/bani/details/ASahib/5/2']
  },
  {
    lineId: 'anand07.line02',
    previousSimpleEn: 'True Anand is understood through the Guru and the grace of the Beloved One.',
    previousSimplePa: 'ਸੱਚੇ ਅਨੰਦ ਦੀ ਸੂਝ ਗੁਰੂ ਦੀ ਸੇਧ ਤੇ ਪਿਆਰੇ ਪ੍ਰਭੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਮਿਲਦੀ ਹੈ।',
    previousNuance: 'Anand here is a spiritual relationship, not a demand for constant pleasant mood or an emotional-performance score.',
    simpleEn: 'Dear one, Anand is always learned through the Guru, through the Guru’s grace.',
    simplePa: 'ਹੇ ਪਿਆਰੇ, ਅਨੰਦ ਦੀ ਸਮਝ ਸਦਾ ਗੁਰੂ ਤੋਂ ਹੀ ਮਿਲਦੀ ਹੈ, ਜਦ ਗੁਰੂ ਕਿਰਪਾ ਕਰਦਾ ਹੈ।',
    nuance: 'In this grammatical reading, piaariaa addresses the dear listener and the Guru grants grace. Anand names spiritual understanding and relationship, not a demand for a constantly pleasant mood.',
    reason: 'Restores the vocative address and the Guru as the giver of grace in this reading; the previous wording treated piaariaa as a title for the Divine.',
    sourceUrls: [original917, darpan917, 'https://gurugranthsahib.io/bani/details/ASahib/7/2']
  },
  {
    lineId: 'anand07.line04',
    previousSimpleEn: 'When attachment loosens from within, the true Shabad reshapes their understanding and living.',
    previousSimplePa: 'ਜਿਨ੍ਹਾਂ ਦਾ ਅੰਦਰਲਾ ਮੋਹ ਟੁੱਟਦਾ ਹੈ, ਸੱਚਾ ਸ਼ਬਦ ਉਨ੍ਹਾਂ ਦੀ ਸੇਧ ਸੰਵਾਰਦਾ ਹੈ।',
    previousNuance: 'Breaking moh refers to attachment, not rejecting family responsibilities or cutting off loving relationships.',
    simpleEn: 'When attachment loosens from within, the true Shabad reshapes their understanding and living.',
    simplePa: 'ਜਿਨ੍ਹਾਂ ਦਾ ਅੰਦਰਲਾ ਮੋਹ ਟੁੱਟਦਾ ਹੈ, ਸੱਚਾ ਸ਼ਬਦ ਉਨ੍ਹਾਂ ਦੀ ਸੇਧ ਸੰਵਾਰਦਾ ਹੈ।',
    nuance: 'The main explanation retains the Shabad-centred reading. Prof. Sahib Singh instead reads sabadu as the person’s speech, made gracious by the True One as attachment falls away. These alternatives need qualified review; loosening moh does not mean abandoning loving relationships or family responsibilities.',
    reason: 'Retains the existing supported Shabad-centred explanation while making a material alternative reading explicit, rather than presenting one interpretation as settled.',
    sourceUrls: [original917, darpan917, 'https://gurugranthsahib.io/bani/details/ASahib/7/2']
  }
];
