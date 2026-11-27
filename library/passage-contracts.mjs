// Frozen metadata bindings. Exact bytes establish this digital edition, not religious authority.
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const CORPUS_COMMIT='34d2a7cab032c8ea24d21ff20f64653bd03766f4';
export const PROJECTION_CONTRACT='1cecb2b130df6e214af165a3c01387344792c4ec600d196be02830ce28fcf74f';
export const CROSSWALK_PATH='library/complete-passages.json';
export const CROSSWALK_SHA256="da4c8240e181de975892ddaac9f9f20ef2426f75eebad5d01e6b440601cba964";
export const PASSAGE_SOURCES=freeze([
 {id:'salok-mahalla9',path:'salok-mahalla9/data/salok-mahalla9.json',sha256:'f72690bb730b24e6631fbbabf574798e5451837987d227a807a3bcf49a366e75',editionId:'salok-mahalla9-opengranth-34d2a7c-20261126',format:'nitnem-source',unitCount:57,label:'Salok Mahalla 9',review:'Digital source comparison · qualified review pending'},
 {id:'salok-kabir',path:'salok-kabir/data/salok-kabir.json',sha256:'34698bcbbaa8c54416de495011ee38493f549a5c0b92720e684f8c399dcf64f2',editionId:'salok-kabir-selected-witnesses-34d2a7c-20261126',format:'nitnem-source',unitCount:243,label:'Salok Bhagat Kabir Ji',review:'Selected digital witnesses · attribution and qualified review pending'},
 {id:'knowledge',path:'knowledge/scripture.json',sha256:'cf5b6e72f1cfaad9180d41f4214081cb3dc795644309696d8aba91f3ede64d7b',editionId:'edition.sggs.opengranth-34d2a7c',format:'knowledge-source',unitCount:3,label:'Knowledge source passages',review:'Digital source comparison · qualified review pending'}
]);
export const KNOWLEDGE_UNITS=freeze([
 {id:'sggs.asa-di-vaar.pauri014.salok01',label:'Asa Di Vaar · Pauri 14 · Salok 1'},
 {id:'sggs.asa-di-vaar.pauri007.salok02',label:'Asa Di Vaar · Pauri 7 · Salok 2'},
 {id:'sggs.kabir.salok007',label:'Kabir Salok 7 · Knowledge view'}
]);
