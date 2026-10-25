/** GLP-001 cross-room evidence and exact quotation contract. Pure validation only. */
import {createHash} from 'node:crypto';
const assert=(p,msg)=>{if(!p)throw Error('GLP_SOURCE_'+msg);};
const text=x=>typeof x==='string'&&x.trim().length>0;
const sha=x=>createHash('sha256').update(x,'utf8').digest('hex');
const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x+'T00:00:00Z'));
export const domains=Object.freeze(['scripture','exegesis','psychology','institution','media','reflection','ux']);
export const reviewerRoles=Object.freeze({
 scripture:['scripture-collation'],exegesis:['sikh-punjabi'],
 psychology:['sikh-punjabi','psychology-evidence'],institution:['place-history'],
 media:['media-rights'],reflection:[],ux:[]
});
export function indexOriginal(units){
 assert(Array.isArray(units)&&units.length,'INVALID_CORPUS');
 const index=new Map();
 for(const unit of units){
  assert(text(unit.id)&&Array.isArray(unit.lines),'INVALID_UNIT');
  for(const line of unit.lines){
   assert(text(line.id)&&text(line.text)&&text(line.sha256),'INVALID_LINE');
   assert(!index.has(line.id),'DUPLICATE_OCCURRENCE');
   assert(sha(line.text)===line.sha256,'SOURCE_HASH_MISMATCH');
   index.set(line.id,Object.freeze({occurrenceId:line.id,unitId:unit.id,ang:line.ang,text:line.text,sha256:line.sha256}));
  }
 }
 return index;
}
export function assertVerbatim(surface,corpus){
 assert(surface&&corpus instanceof Map,'INVALID_BINDING');
 assert(text(surface.occurrenceId)&&text(surface.sourceSha256)&&text(surface.quote),'MISSING_BINDING');
 const source=corpus.get(surface.occurrenceId);
 assert(source,'UNKNOWN_OCCURRENCE');
 assert(source.sha256===surface.sourceSha256,'STILL_MATCHES_FROZEN_HASH');
 assert(source.text.includes(surface.quote),'NOT_VERBATIM_GURBANI');
 if(surface.ang!==undefined)assert(surface.ang===source.ang,'ANG_MISMATCH');
 return Object.freeze({occurrenceId:source.occurrenceId,valid:true});
}
export function auditQuotationSurfaces(surfaces,corpus){
 assert(Array.isArray(surfaces),'INVALID_SURFACES');
 let scripture=0;
 for(const item of surfaces){
  assert(item&&['scripture','editorial'].includes(item.role),'ROLE_MISSING');
  if(item.role==='scripture'){assertVerbatim(item,corpus);scripture++;}
  else assert(text(item.text)&&text(item.label),'EDITORIAL_NOT_LABELED');
 }
 return Object.freeze({scripture,editorial:surfaces.length-scripture});
}
export function validateClaimEnvelope(claim,{corpus,evidence={}}){
 assert(claim&&typeof claim==='object'&&!Array.isArray(claim),'INVALID_CLAIM');
 for(const field of ['claimId','subjectId','domain','lang','text','steward'])assert(text(claim[field]),'MISSING_'+field.toUpperCase());
 assert(domains.includes(claim.domain),'UNKNOWN_DOMAIN');
 assert(['en','pa'].includes(claim.lang),'UNKNOWN_LANGUAGE');
 const s=claim.status;
 assert(s&&typeof s.sourceChecked==='boolean'&&typeof s.founderProductAccepted==='boolean'&&
  Array.isArray(s.reviewerSignoffs)&&(s.publishedRevision===null||text(s.publishedRevision)),'INVALID_STATUS');
 assert(s.reviewerSignoffs.every(r=>r&&text(r.role)&&text(r.contentSha256)&&date(r.reviewedOn)),'INVALID_SIGNOFF');
 if(claim.domain==='scripture'){
  assertVerbatim(claim.anchor,corpus);
  assert(claim.text===claim.anchor.quote,'SCRIPTURE_TEXT_DIFFERS');
 }else if(claim.anchor?.occurrenceId)assertVerbatim(claim.anchor,corpus);
 if(claim.domain==='exegesis')assert(text(claim.attribution),'ATTRIBUTION_REQUIRED');
 if(claim.domain==='psychology'){
  assert(['A','B','C','D'].includes(claim.tier),'EVIDENCE_TIER_REQUIRED');
  assert(text(claim.comparisonBoundary),'COMPARISON_BOUNDARY_REQUIRED');
 }
 if(claim.domain==='media')assert(claim.mediaRights&&text(claim.mediaRights.licenseOrPermission)&&
   typeof claim.mediaRights.publicUsePermitted==='boolean','MEDIA_RIGHTS_REQUIRED');
 if(claim.domain==='reflection')assert(claim.authorship==='ours','REFLECTION_OURS_REQUIRED');
 if(['exegesis','psychology','institution','media'].includes(claim.domain))
  assert(Array.isArray(claim.evidenceIds)&&claim.evidenceIds.length,'EVIDENCE_REQUIRED');
 for(const key of claim.evidenceIds||[]){
  assert(text(key)&&Object.prototype.hasOwnProperty.call(evidence,key),'UNRESOLVED_EVIDENCE');
  const item=evidence[key];
  assert(item&&/^https:\/\//.test(item.url),'INVALID_EVIDENCE_SOURCE');
  // Does not fetch source URLs or certify quote correctness.
  if(s.sourceChecked)assert(date(item.checkedOn)&&text(item.exactQuote),'NOT_SOURCE_CHECKED');
 }
 if(s.publishedRevision!==null){
  assert(s.sourceChecked&&s.founderProductAccepted,'PUBLISH_GATES_MISSING');
  for(const role of reviewerRoles[claim.domain])assert(s.reviewerSignoffs.some(r=>
   r.role===role&&r.contentSha256===sha(claim.text)),'REVIEW_MISSING_'+role);
  if(claim.domain==='media')assert(claim.mediaRights.publicUsePermitted,'RIGHTS_NOT_GRANTED');
 }
 return Object.freeze({id:claim.claimId,sourceChecked:s.sourceChecked,
  published:s.publishedRevision!==null,reviewedRoles:s.reviewerSignoffs.map(r=>r.role)});
}
