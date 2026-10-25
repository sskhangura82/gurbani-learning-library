/* GLP N1-B nonshipping bridge to the EXISTING continuous-reader source model.
 * Only used to prove parity. It does not create a page, store learning or authorize
 * an unreviewed bani. Qualified human source/edition release remains separate.
 */
import {validateComposition,learningNamespace,stableSourceDigest} from './composition-core.mjs';

function freezeUnits(units){
 for(const u of units){for(const l of u.lines)Object.freeze(l);Object.freeze(u.lines);Object.freeze(u);}
 return Object.freeze(units);
}
export function adaptNonshippingSourceCandidate(composition,{explicitReviewOnly=false}={}){
 if(explicitReviewOnly!==true)throw Error('Source reviewer must explicitly request a nonshipping test adapter');
 const verified=validateComposition(composition);
 if(!verified.valid)throw Error('Source-candidate structure/hash mismatch: '+verified.errors.map(x=>x.reason).join(','));
 if(composition.edition.sourceFamily==='synthetic_test')throw Error('Synthetic example is handled by the separate fake fixture');
 if(composition.edition.humanCollationApproved===true||composition.ui.readable===true)
  throw Error('This adapter only accepts unapproved, not-yet-readable original source candidates');
 if(composition.ui.meaningReviewStatus!=='not_ingested'||composition.ui.studyReviewStatus!=='not_ingested')
  throw Error('Never mix unapproved study or translation into the original-only parity bridge');
 const sourceDigest=stableSourceDigest(composition);
 const units=freezeUnits(composition.units.map(u=>({
  id:u.unitId,title:u.title,titlePunjabi:u.titleGurmukhi||'',
  printedRaag:u.printedRaag,
  raagEvidence:u.raagEvidence,
  originalHeadingIsFirstLine:u.sourceHeadingIncludedInLines===true,
  lines:u.lines.map(l=>({id:l.id,text:l.text,sha256:l.sha256,ang:l.location.system==='ang'?l.location.ang:null}))
 })));
 return Object.freeze({
  kind:'NONSHIPPING_SOURCE_PARITY_ONLY',
  sourceDigest,compositionId:composition.compositionId,editionId:composition.edition.editionId,
  sourceFamily:composition.edition.sourceFamily,
  sourceLocationByOccurrence:Object.freeze(Object.fromEntries(composition.units.flatMap(u=>u.lines.map(l=>[l.id,Object.freeze({...l.location})])))),
  sourceStatus:composition.edition.sourceStatus,
  releaseAuthorized:false,
  uiRoute:null,
  learningNamespace:learningNamespace(composition.compositionId,composition.edition.editionId),
  units
 });
}
