/* GLP-001 Nitnem registry v0.1. Source, edition and review status are explicit.
   Do not manufacture text, translations or paths for a bani not verified in this project. */
(function(root,factory){'use strict';const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.GLP_NITNEM_REGISTRY=api;})(typeof window!=='undefined'?window:globalThis,function(){
'use strict';
const MARYADA='https://sgpc.net/sikh-rehat-maryada-in-english/';
const records=[
 {id:'japji',name:'Japji Sahib',gurmukhi:'ਜਪੁਜੀ ਸਾਹਿਬ',time:'morning',sourceWork:'Sri Guru Granth Sahib Ji',sourceAng:'1–8',sourceDetail:'Guru Nanak Sahib · Mool Mantar, opening, 38 pauris, closing Salok',status:'full_read_draft_meanings',review:'unapproved_drafts',reader:'full-japji.html',coverage:{occurrences:385,bilingualDrafts:385,studyDrafts:42},authority:MARYADA},
 {id:'jaap',name:'Jaap Sahib',gurmukhi:'ਜਾਪੁ ਸਾਹਿਬ',time:'morning',sourceWork:'Dasam Bani',sourceDetail:'Traditional attribution to Guru Gobind Singh Sahib. Verify the edition and every composition boundary before importing.',status:'source_not_ingested',review:'not_started',reader:null,authority:MARYADA},
 {id:'savaiye',name:'Tav-Prasad Savaiye',gurmukhi:'ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ',time:'morning',sourceWork:'Dasam Bani',sourceDetail:'The ten Savaiye beginning ਸ੍ਰਾਵਗ ਸੁਧ; verify precise Gurmukhi text, transliteration and source edition.',status:'source_not_ingested',review:'not_started',reader:null,authority:MARYADA},
 {id:'chaupai',name:'Benti Chaupai Sahib',gurmukhi:'ਬੇਨਤੀ ਚੌਪਈ ਸਾਹਿਬ',time:'morning',sourceWork:'Dasam Bani',sourceDetail:'Begins ਹਮਰੀ ਕਰੋ ਹਾਥ ਦੈ ਰੱਛਾ; boundaries differ in some recitation traditions. Show named accepted editions rather than silently trimming or extending.',status:'source_not_ingested',review:'not_started',reader:null,authority:MARYADA},
 {id:'anand',name:'Anand Sahib',gurmukhi:'ਅਨੰਦੁ ਸਾਹਿਬ',time:'morning',sourceWork:'Sri Guru Granth Sahib Ji',sourceAng:'917–922',sourceDetail:'Guru Amar Das Sahib. Full Anand has 40 pauris; the shorter selected Anand in composite Rehras has a different reading context.',status:'source_not_ingested',review:'not_started',reader:null,authority:MARYADA},
 {id:'rehras',name:'Sodar Rehras Sahib',gurmukhi:'ਸੋ ਦਰੁ ਰਹਿਰਾਸਿ ਸਾਹਿਬ',time:'evening',sourceWork:'Composite Nitnem',sourceDetail:'A sequence that includes prescribed SGGS hymns and related Dasam Bani and Anand/Mundawani portions; delimit each unit and disclose tradition-specific differences.',status:'source_not_ingested',review:'not_started',reader:null,authority:MARYADA},
 {id:'sohila',name:'Kirtan Sohila',gurmukhi:'ਕੀਰਤਨ ਸੋਹਿਲਾ',time:'night',sourceWork:'Sri Guru Granth Sahib Ji',sourceAng:'12–13',sourceDetail:'Five shabads for the night reading, with their original authors and raag headings retained in context.',status:'source_not_ingested',review:'not_started',reader:null,authority:MARYADA}
];
const extra=[{id:'ardas',name:'Ardas',gurmukhi:'ਅਰਦਾਸ',time:'practice',sourceWork:'Sikh collective prayer',sourceDetail:'Official SGPC Rehat Maryada gives the prescribed text and times. Ardas accompanies morning/evening readings; do not present it as another bani of Sri Guru Granth Sahib Ji.',status:'source_not_ingested',review:'not_started',reader:null,authority:MARYADA}];
function validate(xs){
 const ids=new Set();
 for(const a of xs){
  if(ids.has(a.id))throw Error('Duplicate source ID: '+a.id);ids.add(a.id);
  if(!['morning','evening','night','practice'].includes(a.time))throw Error('Unknown time');
  if(!['full_read_draft_meanings','source_not_ingested','source_verified','editorial_reviewed'].includes(a.status))throw Error('Unknown source coverage state');
  if(a.reader&&a.status==='source_not_ingested')throw Error('Unverified bani cannot link to a reading route');
  if(a.reader&&a.id!=='japji'&&(!a.sourceEditionId||!a.canonicalSourceSha256||!Number.isInteger(a.originalOccurrences)||a.originalOccurrences<1||a.secondSourceCollation!=='PASS'))throw Error('A second bani cannot open until source edition, hashes, occurrences and independent collation are verified');
  if(!a.authority?.startsWith('https://'))throw Error('Authority source required');
 }
 return true;
}
validate([...records,...extra]);
function byId(id){return [...records,...extra].find(x=>x.id===id)||null;}
return Object.freeze({records:Object.freeze(records.map(x=>Object.freeze(x))),extra:Object.freeze(extra.map(x=>Object.freeze(x))),byId,validate,source:{sgpc:MARYADA}});
});
