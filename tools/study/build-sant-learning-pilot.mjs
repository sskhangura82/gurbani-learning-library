/* GLP-001 — curated Sukhmani Sant and Salok M9 comparative Study pilot.
 * Original scripture comes ONLY from exact SHA-bound source intake JSON.
 * No generator or LLM runtime: manually authored explicit context, English &
 * Punjabi as EDITORIAL DRAFT. Never mark human Sikh scholarship complete.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const parse=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const sha=x=>createHash('sha256').update(x).digest('hex');
function guard(v,m){if(!v)throw Error('GLP SANT EDITORIAL HOLD: '+m);}
const sukh=parse('study/sources/sukhmani-shabados-487-candidate.json');
const salok=parse('study/sources/salok-mahala9-shabados-487-candidate.json');
const index=new Map(sukh.intro.concat(sukh.ashtpadis.flatMap(g=>[g.salokHeading,...g.salok,g.ashtpadiHeading,...g.ashtpadi])).map(x=>[x.id,x]));
const editor=[
 // Sukhmani Ang 265 — Ashtpadi 2 (not a title worship primer).
 ['N9ZJ',
  'The company of spiritually devoted people is described as a rare blessing.',
  'ਨਾਮ ਨਾਲ ਜੁੜੇ ਸੰਤ ਜਨਾਂ ਦੀ ਸੰਗਤ ਨੂੰ ਵੱਡੇ ਭਾਗਾਂ ਦੀ ਦਾਤ ਕਿਹਾ ਹੈ।',
  'The line places the value of company in its spiritual fruits, especially connection to Naam in the following verse. It does not define a Sant merely by clothes, status or a claimed title.',
  'ਸੰਗਤ ਦੀ ਪਛਾਣ ਉਸ ਦੇ ਫਲ—ਨਿਮਰਤਾ, ਨਾਮ ਦੀ ਯਾਦ ਅਤੇ ਚੰਗੀ ਸੇਧ—ਨਾਲ ਕਰੀਏ, ਨਾ ਕਿ ਕਿਸੇ ਦੇ ਲਿਬਾਸ ਜਾਂ ਖਿਤਾਬ ਨਾਲ।',
  'This is not an independent permission to follow or pay an unaccountable leader.'],
 ['LB45',
  'Serving in the company of the spiritually devoted directs attention toward remembering Naam.',
  'ਸੰਤਾਂ ਦੀ ਸੇਵਾ ਤੇ ਸੰਗਤ ਨਾਮ ਸਿਮਰਨ ਵੱਲ ਲੈ ਜਾਣ ਵਾਲੀ ਦੱਸੀ ਹੈ।',
  'The teaching joins seva directly to remembrance of the One; it is not an unrestricted command to obey a human personality. Interpret the service language beside humility, teaching and human dignity.',
  'ਸੇਵਾ ਦਾ ਮੂਲ ਮਕਸਦ ਨਾਮ ਨਾਲ ਜੁੜਨਾ ਤੇ ਨਿਮਰਤਾ ਸਿੱਖਣਾ ਹੈ, ਕਿਸੇ ਮਨੁੱਖ ਨੂੰ ਬਿਨਾ ਸਵਾਲ ਅਧਿਕਾਰ ਦੇਣਾ ਨਹੀਂ।',
  'Never use this wording to demand money, unsafe obedience or surrender of individual autonomy.'],
 // Ang 271 — Ashtpadi7 (Sadh sangat)
 ['91LZ',
  'In the company of the spiritually wise, pride and self-importance begin to fade.',
  'ਸਾਧ-ਸੰਗਤ ਵਿੱਚ ਹਉਮੈ ਤੇ ਆਪਣੇ ਵੱਡੇਪਣ ਦਾ ਭਰਮ ਘਟਦਾ ਹੈ।',
  'The passage offers a test of healthy company: not increased hero-worship but reduced ego. It is part of an Ashtpadi about the effects of spiritual association.',
  'ਜਿਹੜੀ ਸੰਗਤ ਮਨੁੱਖ ਵਿੱਚ ਨਿਮਰਤਾ ਪੈਦਾ ਕਰੇ, ਉਸ ਦਾ ਇਹ ਗੁਰਬਾਣੀ ਵਿੱਚ ਦੱਸਿਆ ਫਲ ਹੈ।',
  'Do not confuse humility with humiliation, coercive submission or avoidance of questions.'],
 ['V2NX',
  'Spiritual wisdom becomes clearer through good, Guru-oriented company.',
  'ਚੰਗੀ ਗੁਰੂ-ਮੁਖੀ ਸੰਗਤ ਨਾਲ ਸੁਗਿਆਨ ਤੇ ਸੂਝ ਪਰਗਟ ਹੁੰਦੀ ਹੈ।',
  'Sugiān is more than collecting information. It points toward insight about the Divine and conduct; the paired line about diminishing arrogance keeps knowledge attached to character.',
  'ਅਸਲ ਸੁਗਿਆਨ ਦਾ ਸੰਬੰਧ ਕੇਵਲ ਜਾਣਕਾਰੀ ਨਾਲ ਨਹੀਂ, ਅੰਦਰਲੀ ਸੂਝ ਅਤੇ ਚੰਗੇ ਕਰਮਾਂ ਨਾਲ ਵੀ ਹੈ।',
  'Working gloss only: qualified Sikh/Punjabi grammatical review needed.'],
 ['CNCV',
  'The greatness of the spiritually enlightened cannot be fully captured in words.',
  'ਸਾਧ ਜਨਾਂ ਦੀ ਆਤਮਕ ਮਹਿਮਾ ਪੂਰੀ ਤਰ੍ਹਾਂ ਬਿਆਨ ਕਰਨੀ ਔਖੀ ਦੱਸੀ ਗਈ ਹੈ।',
  'The line praises a life devoted to the One, not a certificate of infallibility. The neighboring lines turn repeatedly to Naam, wisdom and Guru-oriented living.',
  'ਮਹਿਮਾ ਦੇ ਸ਼ਬਦ ਕਿਸੇ ਵਿਅਕਤੀ ਨੂੰ ਗਲਤੀ ਤੋਂ ਪਰੇ ਨਹੀਂ ਬਣਾ ਦਿੰਦੇ; ਅਰਥ ਸਾਧ-ਸੰਗਤ ਦੇ ਆਤਮਕ ਗੁਣਾਂ ਨਾਲ ਜੁੜਿਆ ਹੈ।',
  'Never assert that merely adopting the title Sant makes criticism or scrutiny forbidden.'],
 // Ang 279 Ashtpadi13 — strong Ninda warnings.
 ['44JT',
  'Seeking refuge in holy, spiritually uplifting company is pictured as a means of spiritual deliverance.',
  'ਸੰਤ-ਸੰਗਤ ਦੀ ਸ਼ਰਨ ਨੂੰ ਆਤਮਕ ਬੰਧਨਾਂ ਤੋਂ ਉਬਰਨ ਦਾ ਸਹਾਰਾ ਦੱਸਿਆ ਹੈ।',
  'The following Salok and Ashtpadi discuss slander of the spiritually devoted. Read the complete context: guidance and truth should not be replaced by protecting a leader’s reputation.',
  'ਅਗਲੀ ਅਸਟਪਦੀ ਨਿੰਦਾ ਦੀ ਚੇਤਾਵਨੀ ਦਿੰਦੀ ਹੈ; ਪਰ ਸੱਚੀ ਗੱਲ, ਪ੍ਰਮਾਣ ਵਾਲੀ ਪੁੱਛਗਿੱਛ ਅਤੇ ਜਵਾਬਦੇਹੀ ਨੂੰ ਝੂਠੀ ਨਿੰਦਾ ਨਾ ਸਮਝੀਏ।',
  'No use as institutional immunity from legitimate, evidence-based safeguarding concerns.'],
 ['4U0A',
  'Nanak warns that malicious slander of the spiritually devoted deepens the cycle of spiritual entanglement.',
  'ਨਾਨਕ ਜੀ ਸੰਤਾਂ ਦੀ ਝੂਠੀ ਨਿੰਦਾ ਤੋਂ ਸਖ਼ਤ ਚੇਤਾਵਨੀ ਦਿੰਦੇ ਹਨ ਅਤੇ ਜਨਮ-ਮਰਨ ਦੇ ਗੇੜ ਦੀ ਤਸਵੀਰ ਵਰਤਦੇ ਹਨ।',
  'This is a powerful religious warning about contempt and intentional harm. Readers must distinguish ninda, a knowingly malicious attack, from honestly reporting harm, asking questions, or seeking justice. The word Sant has differing referents in Sikh commentary and must be studied in context.',
  'ਇਸ ਤੁਕ ਨੂੰ ਕਿਸੇ ਅਖੌਤੀ ਧਾਰਮਿਕ ਅਗੂ ਨੂੰ ਸਵਾਲਾਂ ਤੋਂ ਬਚਾਉਣ ਲਈ ਵਰਤਣਾ ਠੀਕ ਨਹੀਂ; ਸੱਚੇ ਤੱਥ ਦੱਸਣਾ ਤੇ ਨਿੰਦਿਆ ਕਰਨਾ ਇੱਕੋ ਗੱਲ ਨਹੀਂ।',
  'Birth-and-rebirth is a theological frame, not a threat of physical punishment for investigating wrongdoing.'],
 // Ang 288 Ashtpadi19 — inquiry within sangat
 ['2HNK',
  'Gather with spiritually oriented people and reflect thoughtfully together.',
  'ਸੰਤ ਜਨਾਂ ਨਾਲ ਮਿਲ ਕੇ ਗੁਰਮਤਿ ਬਾਰੇ ਵਿਚਾਰ ਕਰੋ।',
  'The invitation is to bīchār—reflection and discernment. It complements the earlier praise of sangat and makes the practice an inquiry rather than unthinking dependence on another person.',
  'ਇੱਥੇ “ਬੀਚਾਰੁ” ਮਹੱਤਵਪੂਰਨ ਹੈ: ਚੰਗੀ ਸੰਗਤ ਮਨੁੱਖ ਨੂੰ ਸਮਝਣ, ਵਿਚਾਰਨ ਤੇ ਸੱਚਾ ਜੀਵਨ ਜੀਉਣ ਵੱਲ ਲੈ ਜਾਂਦੀ ਹੈ।',
  'Dialogue and critical reflection are compatible with reverence; no AI religious rulings.']
];
const santLines=editor.map(([id,meaningEn,meaningPa,studyEn,studyPa,reviewCare])=>{
 const row=index.get(id);
 guard(row&&!row.sourceTextHeld,'Sant reference missing or held '+id);
 guard(sha(row.text)===row.textSha256,'source text mutated '+id);
 guard(/[\u0a00-\u0a7f]/u.test(meaningPa)&&meaningPa.length>35,'Punjabi draft omitted '+id);
 return {
  id:'sant-study-'+id,
  source:'sukhmani',ashtpadi:sukh.ashtpadis.find(g=>g.salok.includes(row)||g.ashtpadi.includes(row))?.ordinal,
  sourceLineId:id,ang:row.ang,sourceTextSha256:row.textSha256,
  meaningEn,meaningPa,deeperEn:studyEn,deeperPa:studyPa,
  care:reviewCare,
  editorialStatus:'DRAFT_AI_UNREVIEWED',religiousAuthority:'NONE',
  meaningKind:'INTERPRETIVE_TEACHING_NOT_LITERAL_TRANSLATION'
 };
});
guard(santLines.length===8,'Expected eight individually authored Sant source teaching notes');
const salokStudies=[
 {ordinal:12,summaryEn:'The spiritually devoted proclaim that Hari lives within every heart; remember the One to cross the world-ocean.',
  summaryPa:'ਸੰਤ ਜਨ ਯਾਦ ਕਰਵਾਉਂਦੇ ਹਨ ਕਿ ਹਰਿ ਹਰ ਘਟ ਵਿੱਚ ਵੱਸਦਾ ਹੈ; ਉਸ ਦੀ ਯਾਦ ਹੀ ਆਤਮਕ ਰਾਹ ਹੈ।',
  studyEn:'The first line presents what Santan proclaim—Divine presence in every heart—while the second calls the mind to remembrance. This parallels Sukhmani’s emphasis on Naam and spiritually wise company. “Crossing the ocean” is a devotional metaphor for liberation.',
  care:'Do not use the image as a guarantee of medical recovery or as religious superiority.'},
 {ordinal:56,summaryEn:'At the passing of worldly things, Naam, the Holy, Guru and Gobind are praised as abiding.',
  summaryPa:'ਜਦ ਦੁਨਿਆਵੀ ਚੀਜ਼ਾਂ ਲੰਘ ਜਾਂਦੀਆਂ ਹਨ, ਨਾਮ, ਸਾਧੂ, ਗੁਰੂ ਅਤੇ ਗੋਬਿੰਦ ਦੇ ਅਟੱਲ ਆਸਰੇ ਦੀ ਗੱਲ ਹੈ।',
  studyEn:'This late salok combines Naam, Sadhu, Guru and Gobind in an enduring spiritual support. Read in the context of the entire collection on life’s impermanence and detachment. It is not an identification of a particular living claimant to religious authority.',
  care:'Theological referents of “Sadhu,” “Guru” and “Gobind” require a qualified Sikh review before definitive commentary.'}
].map(item=>{
 const unit=salok.saloks.find(s=>s.ordinal===item.ordinal);
 guard(unit&&unit.sourceRows.length===2,'salok absent or wrong unit '+item.ordinal);
 guard(item.summaryPa.length>30,'Punjabi explanation missing');
 return {
  id:'salok-mehla9-study-'+item.ordinal,source:'salok-mahala9',ordinal:item.ordinal,
  sourceLineIds:unit.sourceRows.map(x=>x.id),
  sourceLineSha256:unit.sourceRows.map(x=>x.textSha256),
  sourceAng:unit.angStart,
  simpleEn:item.summaryEn,simplePa:item.summaryPa,
  deeperEn:item.studyEn,care:item.care,
  editorialStatus:'DRAFT_AI_UNREVIEWED',religiousAuthority:'NONE',
  meaningKind:'INTERPRETIVE_TEACHING_NOT_LITERAL_TRANSLATION'
 };
});
const pilot={
 schema:'GLP-001-SOURCE-ANCHORED-EDITORIAL-PILOT-V1',
 title:'ਸੰਤ ਅਤੇ ਨਾਮ · Sukhmani Sahib / Salok Mahalla 9',
 status:'REVIEW_CANDIDATE_NOT_IN_READER',
 introducedCollections:['sukhmani','salok-mahala9'],
 originalGurmukhiUnchanged:true,
 copyrightedModernTeekaBundled:false,
 sourceStatus:'DIGITAL_WITNESS_UNCOLLATED',
 humanPunjabiReviewerApproved:false,humanSikhReviewerApproved:false,
 familyPublicationAuthorized:false,
 noAIChatInReader:true,
 santInterpretationCaveat:'Sant/Sadh may denote different referents across Gurbani contexts; avoid assigning them mechanically to a self-proclaimed contemporary individual.',
 sukhmaniSant:santLines,
 salokMahala9Connections:salokStudies
};
const rel='study/content/sant-source-anchored-pilot.v1.json',output=path.join(root,rel);
const raw=JSON.stringify(pilot,null,2)+'\n';
if(process.argv.includes('--verify')){
 guard(fs.existsSync(output)&&fs.readFileSync(output,'utf8')===raw,'editorial pilot drift or missing');
}else{
 guard(!fs.existsSync(output),'refuse overwrite older editorial pilot');
 fs.writeFileSync(output,raw);
}
console.log(JSON.stringify({status:'SOURCE_ANCHORED_DRAFT',sourceNotes:santLines.length,salokUnitPilots:salokStudies.length,
 sha256:sha(raw),verify:process.argv.includes('--verify'),published:false}));
