// Article bindings are independent of editable catalog metadata.
// These pins authenticate the selected local edition, not its theological meaning.
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const SOURCE_CONTRACTS=freeze({
 'salok-mahalla9':{
  path:'../salok-mahalla9/data/salok-mahalla9.json',
  sha256:'f72690bb730b24e6631fbbabf574798e5451837987d227a807a3bcf49a366e75',
  editionId:'salok-mahalla9-opengranth-34d2a7c-20261126',
  releaseId:'salok-mahalla9-complete-draft-20261126',
  unitCount:57,lineCount:114,occurrenceCount:117,
  sequenceSha256:'16649b80d412b71d628eab27e372208bb74a5c9289702a0f581967ce91604e28',
  collectionLabel:'Salok Mahalla 9',
  attributionLabel:'Guru Tegh Bahadur Ji - attribution from the collection heading',
  sectionLabel:'Standalone Salok collection; no musical Raag assigned here',
  repository:'opengranth/open-granth',commit:'34d2a7cab032c8ea24d21ff20f64653bd03766f4',
  sourceStatus:'DIGITAL_SOURCE_COMPARED_QUALIFIED_REVIEW_PENDING'
 },
 'salok-kabir':{
  path:'../salok-kabir/data/salok-kabir.json',
  sha256:'34698bcbbaa8c54416de495011ee38493f549a5c0b92720e684f8c399dcf64f2',
  editionId:'salok-kabir-selected-witnesses-34d2a7c-20261126',
  releaseId:'salok-kabir-complete-draft-20261126',
  unitCount:243,lineCount:486,occurrenceCount:494,
  sequenceSha256:'f8de1c67654bbc6d62e1b6484c41ec31a27f930ea83cff13150a1b5eb4dae415',
  collectionLabel:'Salok Bhagat Kabir Ji',
  attributionLabel:'Collection attribution: Salok Bhagat Kabir Ji; individual attribution review pending',
  sectionLabel:'Standalone Salok collection; no musical Raag assigned here',
  repository:'opengranth/open-granth',commit:'34d2a7cab032c8ea24d21ff20f64653bd03766f4',
  sourceStatus:'SELECTED_DIGITAL_WITNESSES_WITH_DOCUMENTED_DIFFERENCES_QUALIFIED_REVIEW_PENDING'
 }
});
// Persistent article-reference names map to explicit edition/unit/line bindings.
// No row, ordinal, Ang, first-line or fuzzy fallback is permitted. A future
// edition requires a separately reviewed crosswalk; v1 has no automatic migration.
export const REFERENCE_CONTRACTS=freeze({
 'glp.article-ref.salok-mahalla9.019':{
  sourceId:'salok-mahalla9',editionId:SOURCE_CONTRACTS['salok-mahalla9'].editionId,
  unitId:'sggs.salok-mahalla9.salok019',ordinal:19,
  sourceDigest:'b6ca3f8ab083a6c1a064ea84aa49921b829b5a066900f397dc7ec68708afeba3',
  lines:[
   {id:'sggs.salok-mahalla9.salok019.line01',sha256:'a7338568b2b32b7ed745bbb343d542ceb555ddaee75c74da986a4dd265f9f733'},
   {id:'sggs.salok-mahalla9.salok019.line02',sha256:'28fc104485a73799e815d556cbcd3510284a6dd5f02a0fec3d4a91c01c135d5d'}
  ]
 },
 'glp.article-ref.salok-kabir.025':{
  sourceId:'salok-kabir',editionId:SOURCE_CONTRACTS['salok-kabir'].editionId,
  unitId:'sggs.salok-kabir.salok025',ordinal:25,
  sourceDigest:'1ae23b855dbcb5fc17ba8dea1eec4a6fae80dea791ab47e3f1bcff33bd92f5cb',
  lines:[
   {id:'sggs.salok-kabir.salok025.line01',sha256:'7d899f1634772b592177f7c2e78b5e96884b5490ea18b86e8d6b213c366db1eb'},
   {id:'sggs.salok-kabir.salok025.line02',sha256:'157be362ae307621ec83bcc11bc184c63e6627a25c660e52f8dffe0d715cddd3'}
  ]
 }
});
export const TOPIC_CONTRACTS=freeze([
 {id:'haumai',label:'Haumai',searchTerms:['haumai','ego'],articleIds:['haumai-source-sheet']},
 {id:'dubidha',label:'Dubidha',searchTerms:['dubidha','duality'],articleIds:['dubidha-source-sheet']}
]);
export const ARTICLE_CONTRACTS=freeze([
 {id:'haumai-source-sheet',topicId:'haumai',title:'Haumai - source reading sheet',referenceIds:['glp.article-ref.salok-mahalla9.019'],selectionToken:'ਹਉਮੈ'},
 {id:'dubidha-source-sheet',topicId:'dubidha',title:'Dubidha - source reading sheet',referenceIds:['glp.article-ref.salok-kabir.025'],selectionToken:'ਦੁਬਿਧਾ'}
]);
