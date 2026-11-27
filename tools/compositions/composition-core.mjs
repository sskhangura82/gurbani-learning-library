/* GLP-001 multi-bani composition v0.1 — offline pure Node model prototype.
   Not wired into the live family app. No source import, media, user data or network.
   The immutable original text is stored and validated separately from meaning/lessons.
*/
import crypto from 'node:crypto';

const SOURCE_FAMILIES=new Set(['sggs','dasam','composite','ardas','synthetic_test']);
const UNIT_KINDS=new Set(['mool','title','opening','pauri','salok','shabad','stanza','closing','composite_unit','synthetic_section']);
const REVIEW_STATES=new Set(['machine_frozen','two_source_collation_pass','synthetic_fixture','not_ingested']);
const HEX=/^[a-f0-9]{64}$/i,SLUG=/^[a-z0-9](?:[a-z0-9-]{1,94}[a-z0-9])?$/;
const REPORT=(reason,at)=>({reason,...(at?{at}:{})});
export const sha256=text=>crypto.createHash('sha256').update(String(text),'utf8').digest('hex');
export const escapeHtml=text=>String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const stableSourceDigest=composition=>sha256(JSON.stringify(composition.units.flatMap(unit=>unit.lines.map(line=>[unit.unitId,line.id,line.text,line.sha256,line.location??null]))));

function sourceUnitKind(id){
 if(id==='mool')return'mool';
 if(id==='title')return'title';
 if(id==='opening')return'opening';
 if(id==='closing')return'closing';
 if(/^pauri\d+$/.test(id))return'pauri';
 return'stanza';
}

/** In-memory adapter of R7 frozen Japji source, not a new transcription or a copy of the entire corpus. */
export function adaptFrozenJapji(source,{sourceFileHash,editionId='glp-japji-r7'}={}){
 if(!source||source.project!=='GLP-001'||source.units?.length!==42)throw Error('Expected frozen GLP-001 Japji source');
 if(!HEX.test(sourceFileHash||''))throw Error('Frozen source file hash required');
 return {
  schemaVersion:1,compositionId:'japji-sahib',title:'Japji Sahib',titleGurmukhi:'ਜਪੁਜੀ ਸਾਹਿਬ',
  edition:{editionId,sourceFamily:'sggs',locationScheme:'ang',originalSteward:'Open Granth / Shabad OS (as registered in GLP R7)',sourceRelease:'japji-v1-0.9-r7',sourceFileHash,sourceStatus:'machine_frozen',rightsStatus:'original_public_domain_modern_editorial_separate',humanCollationApproved:false},
  ui:{readable:true,meaningReviewStatus:'draft',studyReviewStatus:'draft',preserveLegacyLearningKeys:true,raagStatus:'no_raag_prescribed'},
  units:source.units.map(u=>({
   unitId:u.id,kind:sourceUnitKind(u.id),title:u.title,titleGurmukhi:u.titlePunjabi,
   printedRaag:null,raagEvidence:null,
   lines:u.lines.map(l=>({id:l.id,text:l.text,sha256:l.sha256,location:{system:'ang',ang:l.ang},sourceLine:l.sourceLine}))
  }))
 };
}

/** A nonreligious fixture deliberately written in English, never production-ready or a bani. */
export function createSyntheticTwoShabadFixture(){
 const record=(unitId,num,text)=>({id:unitId+'.line'+String(num).padStart(2,'0'),text,sha256:sha256(text),location:{system:'fixture',reference:unitId+'.'+num}});
 return {
  schemaVersion:1,compositionId:'test-shabad-renderer',title:'Synthetic example — not Gurbani',titleGurmukhi:'',
  edition:{editionId:'internal-only-fixture',sourceFamily:'synthetic_test',locationScheme:'fixture',sourceFileHash:sha256('fixture'),sourceRelease:'fixture-v1',sourceStatus:'synthetic_fixture',rightsStatus:'not_scripture',humanCollationApproved:false},
  ui:{readable:false,meaningReviewStatus:'not_ingested',studyReviewStatus:'not_ingested',preserveLegacyLearningKeys:false,raagStatus:'synthetic_only'},
  units:[
   {unitId:'demo01',kind:'shabad',title:'Synthetic Shabad A — TEST ONLY',titleGurmukhi:'',printedRaag:'Test Heading A',raagEvidence:{kind:'synthetic_fixture',source:'not_a_real_raag'},lines:[record('demo01',1,'TEST ONLY: first synthetic line.'),record('demo01',2,'TEST ONLY: second synthetic line.')]},
   {unitId:'demo02',kind:'shabad',title:'Synthetic Shabad B — TEST ONLY',titleGurmukhi:'',printedRaag:null,raagEvidence:null,lines:[record('demo02',1,'TEST ONLY: another synthetic line.')]}
  ]
 };
}

export function validateComposition(model,{forPublication=false,allowSynthetic=false}={}){
 const errors=[];
 if(!model||typeof model!=='object')return {valid:false,publishable:false,errors:[REPORT('model_missing')]};
 if(model.schemaVersion!==1)errors.push(REPORT('invalid_version'));
 if(!SLUG.test(model.compositionId||''))errors.push(REPORT('invalid_composition_id'));
 const ed=model.edition||{},ui=model.ui||{};
 if(!SLUG.test(ed.editionId||''))errors.push(REPORT('invalid_edition_id'));
 if(!SOURCE_FAMILIES.has(ed.sourceFamily))errors.push(REPORT('invalid_source_family'));
 if(!REVIEW_STATES.has(ed.sourceStatus))errors.push(REPORT('unknown_source_review_status'));
 if(!HEX.test(ed.sourceFileHash||''))errors.push(REPORT('source_file_sha_missing'));
 if(!['ang','dasam_section','composite','prayer','fixture'].includes(ed.locationScheme))errors.push(REPORT('invalid_location_scheme'));
 if(ed.sourceFamily==='sggs'&&ed.locationScheme!=='ang')errors.push(REPORT('sggs_uses_ang'));
 if(ed.sourceFamily==='dasam'&&ed.locationScheme==='ang')errors.push(REPORT('dasam_cannot_invent_sggs_ang'));
 if(ed.sourceFamily==='synthetic_test'&&ed.sourceStatus!=='synthetic_fixture')errors.push(REPORT('synthetic_not_marked'));
 if(!Array.isArray(model.units)||model.units.length===0||model.units.length>2000)errors.push(REPORT('no_units_or_excess'));
 const uniqueUnits=new Set(),uniqueLines=new Set();
 let count=0;
 for(const u of (Array.isArray(model.units)?model.units:[])){
  if(!u||typeof u!=='object'){errors.push(REPORT('bad_unit'));continue;}
  if(!u.unitId||uniqueUnits.has(u.unitId))errors.push(REPORT('duplicate_or_empty_unit',u.unitId));
  uniqueUnits.add(u.unitId);
  if(!UNIT_KINDS.has(u.kind))errors.push(REPORT('unknown_unit_kind',u.unitId));
  if(typeof u.title!=='string'||!u.title.trim())errors.push(REPORT('missing_unit_title',u.unitId));
  if(u.printedRaag){
   if(!u.raagEvidence||typeof u.raagEvidence.source!=='string'||u.raagEvidence.source.trim().length<3)errors.push(REPORT('unproven_raag_heading',u.unitId));
   if(model.compositionId==='japji-sahib')errors.push(REPORT('japji_has_no_prescribed_raag'));
  }else if(u.raagEvidence!==null&&u.raagEvidence!==undefined)errors.push(REPORT('raag_evidence_without_heading',u.unitId));
  if(!Array.isArray(u.lines)||!u.lines.length||u.lines.length>1000){errors.push(REPORT('missing_or_excess_unit_lines',u.unitId));continue;}
  for(const l of u.lines){
   count++;
   if(!l||typeof l.text!=='string'||!l.text.trim()||l.text.includes('\0')){errors.push(REPORT('invalid_original_line',u.unitId));continue;}
   if(!l.id||uniqueLines.has(l.id))errors.push(REPORT('duplicate_line_id',u.unitId+'.'+l.id));
   uniqueLines.add(l.id);
   if(!HEX.test(l.sha256||'')||sha256(l.text)!==l.sha256)errors.push(REPORT('immutable_line_hash_mismatch',l.id));
   if(l.location?.system!==ed.locationScheme&&!(ed.locationScheme==='composite'&&['ang','dasam_section'].includes(l.location?.system)))errors.push(REPORT('invalid_location_system',l.id));
   if(l.location?.system==='ang'&&(!Number.isInteger(l.location.ang)||l.location.ang<1||l.location.ang>1430))errors.push(REPORT('invalid_sggs_ang',l.id));
   if(ed.sourceFamily==='dasam'&&l.location?.system==='ang')errors.push(REPORT('false_sggs_ang_for_dasam',l.id));
   if(ed.sourceFamily==='synthetic_test'&&!l.text.startsWith('TEST ONLY:'))errors.push(REPORT('synthetic_not_clearly_marked',l.id));
  }
 }
 if(model.compositionId==='japji-sahib'){
  if(count!==385||model.units.length!==42)errors.push(REPORT('japji_385_42_invariant'));
  if(ed.sourceStatus!=='machine_frozen')errors.push(REPORT('japji_source_state_changed'));
  if(ui.raagStatus!=='no_raag_prescribed')errors.push(REPORT('japji_raag_metadata_invalid'));
 }
 if(forPublication){
  if(ed.sourceFamily==='synthetic_test'||!ui.readable)errors.push(REPORT('not_a_public_reader'));
  if(model.compositionId!=='japji-sahib'&&(ed.sourceStatus!=='two_source_collation_pass'||ed.humanCollationApproved!==true||!ed.editionCitation||!ed.editionAuthority||ed.rightsStatus!=='reuse_cleared'))errors.push(REPORT('second_bani_source_approval_missing'));
  if(ed.sourceFamily==='synthetic_test')errors.push(REPORT('synthetic_never_published'));
 }
 if(ed.sourceFamily==='synthetic_test'&&!allowSynthetic)errors.push(REPORT('synthetic_not_allowed_outside_tests'));
 return {valid:errors.length===0,publishable:errors.length===0&&forPublication,unitCount:Array.isArray(model.units)?model.units.length:0,sourceOccurrences:count,errors};
}

export function learningNamespace(compositionId,editionId){
 if(!SLUG.test(compositionId)||!SLUG.test(editionId))throw Error('Invalid composition/edition namespace');
 return 'glp001.bani.'+compositionId+'.'+editionId+'.learning.v1';
}
export function renderPlainReader(composition,{internalSynthetic=false}={}){
 const result=validateComposition(composition,{forPublication:!internalSynthetic,allowSynthetic:internalSynthetic});
 if(!result.valid)throw Error('Composition cannot render: '+result.errors.map(e=>e.reason).join(','));
 const attrs=internalSynthetic?' data-testid="synthetic-no-gurbani"':'';
 const blocks=composition.units.map(unit=>{
  const heading='<h3 class="composition-section-heading">'+escapeHtml(unit.title)+'</h3>';
  const raag=unit.printedRaag?'<p class="composition-raag" data-source-heading="verified">'+escapeHtml(unit.printedRaag)+'</p>':'';
  const lines=unit.lines.map(l=>'<p class="composition-original" lang="'+(internalSynthetic?'en':'pa')+'" data-source-id="'+escapeHtml(l.id)+'" data-source-sha256="'+l.sha256+'">'+escapeHtml(l.text)+'</p>').join('');
  return '<section class="composition-unit" data-unit-id="'+escapeHtml(unit.unitId)+'">'+heading+raag+lines+'</section>';
 }).join('');
 return '<article class="composition-reader" data-composition-id="'+escapeHtml(composition.compositionId)+'"'+attrs+'>'+blocks+'</article>';
}
