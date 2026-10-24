/* GLP-001 Psychology Room content pilot. This is original, draft educational comparison,
   not scripture translation, a religious ruling, therapy, diagnosis, or a personality test. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLP_MIND_ROOM=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const topics=[
 {id:'courage',title:'Courage without hostility',caption:'ਨਿਰਭਉ · ਨਿਰਵੈਰੁ',sourceId:'mool.line01',phrase:'ਨਿਰਭਉ ਨਿਰਵੈਰੁ',
  core:'The Mool Mantar describes the Divine as without fear and without enmity. A human ethical reflection may take inspiration from these qualities; this is not a claim that an ordinary person must never experience fear.',
  simplePa:'ਮੂਲ ਮੰਤਰ ਵਿਚ ਅਕਾਲ ਪੁਰਖ ਨਿਰਭਉ ਤੇ ਨਿਰਵੈਰੁ ਹੈ। ਇਨ੍ਹਾਂ ਗੁਣਾਂ ਤੋਂ ਮਨੁੱਖ ਆਪਣੇ ਵਰਤਾਓ ਲਈ ਸਿੱਖਿਆ ਲੈ ਸਕਦਾ ਹੈ, ਪਰ ਡਰ ਮਹਿਸੂਸ ਹੋਣਾ ਕੋਈ ਆਤਮਿਕ ਨਾਕਾਮੀ ਨਹੀਂ।',
  scholarly:'SikhRI explains Nirbhau and Nirvair together as a willingness to confront oppression without hate or revenge. The Guru Nanak Nishkam Sewak Jatha similarly emphasizes facing conflict with courage and love.',
  psych:'Modern CBT examines how our appraisal of threat shapes feelings and behavior. ACT distinguishes having a difficult feeling from the action we choose in light of our values. Neither model is a translation of Gurbani.',
  example:'A colleague speaks unfairly about you. You can say clearly that the claim is inaccurate, request respectful treatment, and protect your boundary—without insulting or dehumanizing the colleague.',
  notMeans:'Fearlessness is not recklessness, retaliation or permission to hate. Being without enmity is not passivity, denial of danger or tolerating abuse.',
  prompt:'What would a firm boundary sound like if you removed the insult but kept the truth?',
  sources:['https://sikhri.org/inspiration/our-root','https://gnnsj.org/sikh-dharam/gurbani/mool-mantar/','https://dictionary.apa.org/automatic-thoughts','https://pubmed.ncbi.nlm.nih.gov/38615492/']},
 {id:'haumai',title:'The stories the self tells',caption:'ਹੁਕਮ · ਹਉਮੈ',sourceId:'pauri02.line06',phrase:'ਹਉਮੈ',
  core:'Japji Pauri 2 contrasts being within Hukam with recognizing Hukam and speaking from haumai. Our learning question is about the claim of an isolated “I,” not a diagnosis of narcissism.',
  simplePa:'ਦੂਜੀ ਪਉੜੀ ਵਿਚ ਹੁਕਮ ਨੂੰ ਬੁੱਝਣ ਅਤੇ ਹਉਮੈ ਵਾਲੀ ਮੈਂ-ਮੈਂ ਕਰਨ ਵਿਚ ਅੰਤਰ ਆਉਂਦਾ ਹੈ। ਇਹ ਕਿਸੇ ਵਿਅਕਤੀ ਨੂੰ ਮਨੋਵਿਗਿਆਨਕ ਰੋਗ ਲਾਉਣ ਦੀ ਗੱਲ ਨਹੀਂ।',
  scholarly:'Guru Granth Darpan reads the ending in light of the Hukam developed across the pauri. Full related saloks, not orphaned phrases, will be reviewed for any eventual cross-reference.',
  psych:'Freud helped popularize questions about motives and processes outside conscious awareness; many specific classical Freudian claims are difficult to test. Contemporary cognitive approaches instead examine observable patterns of appraisals and automatic thoughts.',
  example:'After success, notice the thought “I did everything myself.” Then ask what came from your effort, other people, circumstances and opportunities. You do not need to erase responsible agency.',
  notMeans:'Haumai is not automatically the same construct as Freud’s ego, clinical narcissism, or a personality disorder. Psychology and Gurbani ask different questions.',
  prompt:'Which parts of a success were your responsibility, and what did you receive from others?',
  sources:['https://www.gurugranthdarpan.net/0001.html','https://dictionary.apa.org/psychoanalysis','https://dictionary.apa.org/cognitive-therapy']},
 {id:'craving',title:'Wanting and satisfaction',caption:'ਭੁਖਿਆ ਭੁਖ',sourceId:'pauri01.line03',phrase:'ਭੁਖਿਆ ਭੁਖ',
  core:'Pauri 1 examines why more accumulation does not necessarily end the hunger of craving. This is a close-reading subject, not a condemnation of ordinary food or material needs.',
  simplePa:'ਪਹਿਲੀ ਪਉੜੀ ਵਿਚ ਤ੍ਰਿਸ਼ਨਾ ਦੀ ਭੁੱਖ ਬਾਰੇ ਵਿਚਾਰ ਹੈ: ਹੋਰ ਇਕੱਠਾ ਕਰ ਲੈਣ ਨਾਲ ਮਨ ਦੀ ਲਾਲਸਾ ਲਾਜ਼ਮੀ ਨਹੀਂ ਮੁੱਕਦੀ। ਸਰੀਰ ਦੀ ਅਸਲ ਭੁੱਖ ਨੂੰ ਪਾਪ ਨਹੀਂ ਕਿਹਾ ਗਿਆ।',
  scholarly:'Sahib Singh’s Darpan discusses the word as craving/trishna in the argument leading to how one becomes sachiara.',
  psych:'Psychology distinguishes motives, habits and the ways rewards shape behavior. ACT adds a values question: does the urge push us toward a chosen life or narrow it? These are pedagogical comparisons, not equivalent doctrines.',
  example:'You buy something you wanted badly; satisfaction fades and you start searching again. Before judging yourself, ask which practical need it served and which feeling you expected it to resolve.',
  notMeans:'Do not use this verse to shame physical hunger, legitimate ambition, earning a livelihood or psychological distress.',
  prompt:'When does “more” answer a real need, and when does it only postpone a difficult question?',
  sources:['https://www.gurugranthdarpan.net/0001.html','https://pubmed.ncbi.nlm.nih.gov/38615492/']},
 {id:'quiet',title:'Silence and inner attention',caption:'ਚੁਪੈ ਚੁਪ',sourceId:'pauri01.line02',phrase:'ਚੁਪੈ ਚੁਪ',
  core:'Pauri 1 questions whether keeping the mouth silent automatically yields inner quiet. It does not deny the usefulness of peaceful attention; the distinction is between a technique and an inward condition.',
  simplePa:'ਚੁੱਪ ਬੈਠਣਾ ਲਾਭਦਾਇਕ ਹੋ ਸਕਦਾ ਹੈ, ਪਰ ਕੇਵਲ ਮੂੰਹ ਦੀ ਚੁੱਪ ਨਾਲ ਮਨ ਦਾ ਟਿਕਾਉ ਆਪਣੇ ਆਪ ਨਹੀਂ ਆਉਂਦਾ। ਇਹ ਪਹਿਲੀ ਪਉੜੀ ਦਾ ਵਿਚਾਰ ਹੈ।',
  scholarly:'The frozen canonical line is ਚੁਪੈ ਚੁਪ ਨ ਹੋਵਈ... ; avoid substituting unattested forms. Its grammatical interpretation requires qualified review.',
  psych:'Mindfulness-related therapeutic approaches investigate awareness of experience and thoughts. That research neither validates nor replaces the distinct theological meaning of Naam, Hukam or Gurbani.',
  example:'Sit quietly for a minute. When you notice worry, observe that silence and the presence of thoughts can coexist. Then choose what respectful action is needed outside the room.',
  notMeans:'This is not a prescription to suppress anxiety, control breathing, hold the breath or replace mental-health treatment.',
  prompt:'What is the difference between making a room quiet and responding gently to an unquiet mind?',
  sources:['https://www.gurugranthdarpan.net/0001.html','https://pubmed.ncbi.nlm.nih.gov/38615492/']}
];
const history=[
 {title:'Freud and psychodynamic ideas',sub:'Historical interpretive model',text:'Unconscious motivations, conflict and defense mechanisms shaped psychological thought. Specific classical hypotheses vary in testability and empirical support; they are not a diagnostic shortcut.',url:'https://dictionary.apa.org/psychoanalysis'},
 {title:'Bowlby and Ainsworth',sub:'Development and attachment',text:'Early relationships and their security matter for development, but attachment descriptions are not a person’s permanent destiny or a verdict about an individual family.',url:'https://dictionary.apa.org/attachment-theory'},
 {title:'Beck and cognitive therapy',sub:'Thoughts, emotion, evidence',text:'Automatic appraisals can influence emotion and action. Learning to examine an appraisal is different from claiming that suffering is a person’s fault.',url:'https://dictionary.apa.org/cognitive-therapy'},
 {title:'Personality science',sub:'The Big Five',text:'Extraversion, neuroticism, conscientiousness, agreeableness and openness describe population-level dimensions, not moral virtue or fixed spiritual worth.',url:'https://dictionary.apa.org/big-five-personality-model'},
 {title:'Acceptance and Commitment Therapy',sub:'Psychological flexibility',text:'Present-moment awareness, acceptance, values and committed action are studied in clinical trials. The findings are empirical psychology, not proof of scriptural interpretation.',url:'https://pubmed.ncbi.nlm.nih.gov/38615492/'}
];
function validateAgainstCorpus(units){
 const byId=new Map(units.flatMap(u=>u.lines.map(l=>[l.id,l])));
 const errors=[];
 for(const t of topics){const line=byId.get(t.sourceId);
  if(!line||!line.text.includes(t.phrase))errors.push({id:t.id,reason:'source_quote_missing'});
  if(t.sources.length<2)errors.push({id:t.id,reason:'not_enough_sources'});
 }
 return errors;
}
return Object.freeze({topics:Object.freeze(topics.map(x=>Object.freeze(x))),history:Object.freeze(history.map(x=>Object.freeze(x))),validateAgainstCorpus});
});
