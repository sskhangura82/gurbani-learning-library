/* GLP N4 — pure, NONSHIPPING mixed-source composition adapter.
 * Rehras is NOT misrepresented as SGGS-only; source provenance and rights
 * gates remain in the model, not delegated to an on-screen boolean.
 */
import crypto from 'node:crypto';
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const parts=['sggs-nine','chaupai-25','savaiya-pae-gahe','dohira-sagal-duar','anand-selected','mundawani-slok'];
const kinds=['sggs','dasam','dasam','dasam','sggs','sggs'];
export function adaptNonshippingRehrasComposite(composition,{explicitReviewOnly=false}={}){
 if(explicitReviewOnly!==true)throw Error('Rehras draft requires explicitly authorized source-only parity review');
 if(composition?.compositionId!=='sodar-rehras-sgpc-digital-candidate'||composition.sourceFamily!=='composite')
  throw Error('Not the pinned SGPC Rehras digital source candidate');
 if(!Array.isArray(composition.sections)||composition.sections.length!==parts.length)
  throw Error('Six mandatory SGPC component boundaries missing');
 if(composition.humanTextCollationApproved!==false||composition.readerEnabled!==false||
    composition.sourceApproved!==false||composition.rightsApproved!==false||composition.releaseAuthorized!==false)
  throw Error('Unreviewed composite cannot claim source, rights or release authority');
 const ids=new Set(),sourceLocators={},units=[],sectionStarts=[];
 for(let i=0;i<parts.length;i++){
  const section=composition.sections[i];
  if(section.componentId!==parts[i]||section.sourceFamily!==kinds[i]||
     section.humanTextApproved!==false||section.rightsApproved!==false||section.variationReviewPending!==true)
   throw Error('SGPC component source family/order or human-review gate changed');
  if(!Array.isArray(section.units)||!section.units.length)throw Error('Empty SGPC source component');
  sectionStarts.push({componentId:section.componentId,sourceFamily:section.sourceFamily,unitStart:units.length});
  for(const u of section.units){
   if(!Array.isArray(u.lines)||!u.lines.length)throw Error('Missing source occurrence');
   const target={
    id:u.unitId,title:u.title,sourceFamily:u.sourceFamily,componentId:section.componentId,
    originalUnderlyingUnit:u.underlyingSourceUnit,
    lines:u.lines.map(l=>{
     if(ids.has(l.id)||l.sourceFamily!==section.sourceFamily||typeof l.text!=='string'||!l.text)
      throw Error('Duplicate or misattributed source occurrence');
     ids.add(l.id);
     if(digest(l.text)!==l.sha256)throw Error('Source hash mismatch');
     if(section.sourceFamily==='dasam'&&(l.location.system!=='dasam_section'||'ang' in l.location))
      throw Error('False SGGS Ang attributed to Dasam original');
     if(section.sourceFamily==='sggs'&&!['ang','sggs_rehras_section'].includes(l.location.system))
      throw Error('Unsupported SGGS original source reference');
     sourceLocators[l.id]=Object.freeze({sourceFamily:l.sourceFamily,...l.location,underlyingSourceOccurrenceId:l.underlyingSourceOccurrenceId});
     return Object.freeze({id:l.id,text:l.text,sha256:l.sha256,
                          ang:l.location.system==='ang'?l.location.ang:null});
    })
   };
   Object.freeze(target.lines);
   units.push(Object.freeze(target));
  }
 }
 if(units.length!==44||ids.size!==159||JSON.stringify(sectionStarts.map(x=>x.unitStart))!==JSON.stringify([0,9,34,35,36,42]))
  throw Error('Rehras 44-unit / 159-line source or order is incomplete');
 return Object.freeze({
  kind:'NONSHIPPING_MIXED_SOURCE_PARITY_ONLY',
  compositionId:composition.compositionId,sourceFamily:'composite',
  sourceDigest:digest(JSON.stringify(composition)),
  units:Object.freeze(units),
  sectionStarts:Object.freeze(sectionStarts.map(x=>Object.freeze(x))),
  sourceLocators:Object.freeze(sourceLocators),
  releaseAuthorized:false,
  uiRoute:null,
  learningNamespace:'glp001.bani.sodar-rehras-sgpc-digital-candidate.unapproved-not-for-family',
  approvedForRecitation:false
 });
}
