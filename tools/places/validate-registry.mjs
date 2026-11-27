/**
 * GLP-001 additive institutional source registry validator.
 * Pure: no network, photos, GPS, stream playback or runtime publication.
 */
const need=(yes,label)=>{if(!yes)throw Error('GLP_PLACE_'+label);};
const text=x=>typeof x==='string'&&x.trim().length>0;
const isHttps=x=>text(x)&&/^https:\/\//.test(x)&&(()=>{try{return new URL(x).protocol==='https:'}catch{return false}})();
const date=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x);
const sourceIds=(ids,evidence,{requireQuote=true}={})=>{
 need(Array.isArray(ids)&&ids.length>0,'EVIDENCE_MISSING');
 for(const key of ids){
  need(text(key)&&Object.prototype.hasOwnProperty.call(evidence.records,key),'EVIDENCE_NOT_FOUND');
  const e=evidence.records[key];
  need(isHttps(e.url)&&text(e.authority),'EVIDENCE_INVALID_SOURCE');
  if(requireQuote)need(date(e.checkedOn)&&text(e.exactQuote),'EVIDENCE_NOT_VERIFIED');
 }
};
export function validatePlaceRegistry(registry,evidence){
 need(registry&&registry.schemaVersion===2&&registry.projectId==='GLP-001'&&registry.recordStatus==='draft_non_runtime','INVALID_REGISTRY');
 need(evidence&&evidence.schemaVersion===1&&evidence.records&&typeof evidence.records==='object','INVALID_EVIDENCE');
 need(Array.isArray(registry.places)&&registry.places.length>0,'NO_PLACES');
 const ids=new Set(),routes=new Set(),allFacts=[],allConflicts=[];
 for(const place of registry.places){
  need(text(place.placeId)&&!ids.has(place.placeId),'DUPLICATE_OR_INVALID_PLACE');
  ids.add(place.placeId);
  need(place.names&&place.names.en&&text(place.names.en.text),'ENGLISH_NAME_MISSING');
  sourceIds(place.names.en.evidenceIds,evidence);
  need(place.names.pa&&typeof place.names.pa.review==='string','PUNJABI_REVIEW_STATE_MISSING');
  if(place.names.pa.text!==null)sourceIds(place.names.pa.evidenceIds,evidence);
  else need(place.names.pa.review.includes('withheld'),'UNREVIEWED_PUNJABI_RENDERED');
  need(place.location&&text(place.location.city)&&text(place.location.country)&&text(place.location.timeZone),'INVALID_LOCATION');
  try{new Intl.DateTimeFormat('en',{timeZone:place.location.timeZone}).format(new Date('2026-10-24T12:00:00Z'))}
  catch{throw Error('GLP_PLACE_INVALID_IANA_TIMEZONE')}
  sourceIds(place.location.evidenceIds,evidence);
  need(Array.isArray(place.facts)&&place.facts.length>0,'NO_FACTS');
  for(const fact of place.facts){
   need(text(fact.factId)&&text(fact.en)&&fact.status==='source_checked_draft'&&fact.pa===null,'FACT_NOT_DRAFT');
   sourceIds(fact.evidenceIds,evidence);
   allFacts.push(fact.factId);
  }
  need(place.arrivalDraft&&text(place.arrivalDraft.en)&&place.arrivalDraft.status==='editorial_draft','ARRIVAL_MUST_BE_DRAFT');
  sourceIds(place.arrivalDraft.evidenceIds,evidence);
  need(Array.isArray(place.routes)&&place.routes.length,'NO_ROUTES');
  for(const route of place.routes){
   need(text(route.routeId)&&!routes.has(route.routeId),'DUPLICATE_ROUTE');
   routes.add(route.routeId);
   need(isHttps(route.url)&&route.kind.startsWith('official_outbound_'),'NOT_OFFICIAL_OUTBOUND_ONLY');
   need(route.userGestureRequired===true,'AUTOPLAY_NOT_ALLOWED');
   need(['official_linked','official_page'].includes(route.linkStatus),'LINK_STATUS_MISSING');
   need(route.liveStatus==='not_checked','LIVE_STATUS_NOT_VERIFIED');
   need(['not_assessed','not_granted'].includes(route.embedPermission),'EMBED_NOT_AUTHORIZED');
   need(!route.url.includes('/embed/')&&!route.url.includes('autoplay='),'EMBED_URL_NOT_ALLOWED');
   sourceIds(route.evidenceIds,evidence);
   if(route.rightsEvidenceIds)sourceIds(route.rightsEvidenceIds,evidence);
  }
  need(place.media&&Array.isArray(place.media.assets),'MEDIA_STATUS_MISSING');
  for(const item of place.media.assets){
   need(text(item.assetId)&&text(item.sourceUrl)&&isHttps(item.sourceUrl),'MEDIA_ASSET_INVALID');
   need(text(item.licenseOrPermission)&&text(item.attribution)&&item.publicUsePermitted===true,'PHOTO_RIGHTS_NOT_CLEARED');
  }
  need(place.programme&&place.programme.status==='not_checked'&&place.programme.schedule===null,'PROGRAMME_INVENTED');
  need(place.review&&place.review.founderProductAccepted===false&&place.review.publishedRevision===null,'UNAUTHORIZED_PUBLICATION');
  need(Array.isArray(place.conflicts),'CONFLICT_STATE_MISSING');
  for(const c of place.conflicts){
   need(text(c.id)&&text(c.details)&&c.publicDisplay===false&&text(c.status)&&(c.status.includes('pending')||c.status.startsWith('unresolved_')),'UNRESOLVED_CONFLICT_DISPLAYED');
   sourceIds(c.evidenceIds,evidence,{requireQuote:false});
   allConflicts.push(c.id);
  }
  need(place.recheck&&place.recheck.routesEveryDays>0&&place.recheck.factsEveryDays>0,'RECHECK_INTERVAL_MISSING');
 }
 return Object.freeze({places:ids.size,facts:allFacts.length,routes:routes.size,conflicts:allConflicts.length,media:registry.places.reduce((n,p)=>n+p.media.assets.length,0),published:false});
}
