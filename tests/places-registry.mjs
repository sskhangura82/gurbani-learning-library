import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validatePlaceRegistry} from '../tools/places/validate-registry.mjs';
const registry=JSON.parse(fs.readFileSync(new URL('../data/places/registry.json',import.meta.url),'utf8'));
const evidence=JSON.parse(fs.readFileSync(new URL('../data/places/evidence.json',import.meta.url),'utf8'));
const change=(placeId,fn)=>{
 const r=structuredClone(registry),p=r.places.find(x=>x.placeId===placeId);
 assert.ok(p);fn(p);return r;
};

test('Three non-runtime institution records, with all fact and route bindings',()=>{
 assert.deepEqual(validatePlaceRegistry(registry,evidence),{places:3,facts:6,routes:4,conflicts:3,media:0,published:false});
});
test('Public data contains no photographs, embedded players, tracking or invented live status',()=>{
 assert.ok(registry.places.every(p=>p.media.assets.length===0&&p.routes.every(r=>r.liveStatus==='not_checked'&&r.kind.startsWith('official_outbound_'))));
 assert.equal(registry.rules.analytics,false);assert.equal(registry.rules.userLocation,false);
});
test('Fremont and San Jose Gurmukhi names are withheld until reviewed',()=>{
 for(const id of ['fremont','sanjose']){
  const n=registry.places.find(p=>p.placeId===id).names.pa;
  assert.equal(n.text,null);assert.match(n.review,/withheld/);
 }
});
test('Harmandir SGPC broadcast route is outward-only and rights-restricted',()=>{
 const p=registry.places.find(p=>p.placeId==='harmandir');
 assert.equal(p.routes[0].embedPermission,'not_granted');
 assert.deepEqual(p.routes[0].rightsEvidenceIds,['H3']);
 assert.ok(evidence.records.H3.url.includes('sgpc.net'));
});
test('Institutional and secondary dates and street names remain unresolved, not silently normalized',()=>{
 const f=registry.places.find(p=>p.placeId==='fremont'),s=registry.places.find(p=>p.placeId==='sanjose');
 assert.ok(f.conflicts.some(c=>c.id==='fremont.founding_year'));
 assert.ok(s.conflicts.some(c=>c.id==='sanjose.founding_vs_operation'));
 assert.ok(s.conflicts.some(c=>c.id==='sanjose.address'));
 assert.ok([...f.conflicts,...s.conflicts].every(c=>c.publicDisplay===false));
});
test('Every institution fact, name and route includes a source-backed evidence reference',()=>{
 for(const place of registry.places){
  for(const entry of [place.names.en,...place.facts,...place.routes,place.arrivalDraft]){
   assert.ok(entry.evidenceIds?.length);
   entry.evidenceIds.forEach(id=>{
    const e=evidence.records[id];assert.ok(e&&e.url.startsWith('https://'));
    assert.ok(e.checkedOn&&e.exactQuote);
   });
  }
 }
});
test('A fabricated live badge fails',()=>{
 const r=change('fremont',p=>p.routes[0].liveStatus='live_now');
 assert.throws(()=>validatePlaceRegistry(r,evidence),/LIVE_STATUS_NOT_VERIFIED/);
});
test('A hidden or unauthorized media embed fails',()=>{
 const r=change('harmandir',p=>p.routes[0].kind='youtube_embed');
 assert.throws(()=>validatePlaceRegistry(r,evidence),/NOT_OFFICIAL_OUTBOUND_ONLY/);
});
test('Autoplay flags cannot enter official outbound handoff',()=>{
 const r=change('sanjose',p=>p.routes[0].userGestureRequired=false);
 assert.throws(()=>validatePlaceRegistry(r,evidence),/AUTOPLAY_NOT_ALLOWED/);
});
test('No unlicensed photo becomes a route dependency',()=>{
 const r=change('fremont',p=>p.media.assets.push({assetId:'unlicensed',sourceUrl:'https://example.org/photo.jpg'}));
 assert.throws(()=>validatePlaceRegistry(r,evidence),/PHOTO_RIGHTS_NOT_CLEARED/);
});
test('An unresolved secondary-source claim may not become a public story',()=>{
 const r=change('fremont',p=>p.conflicts[0].publicDisplay=true);
 assert.throws(()=>validatePlaceRegistry(r,evidence),/UNRESOLVED_CONFLICT_DISPLAYED/);
});
test('Every fact requires a real evidence ID with a dated verbatim source excerpt',()=>{
 const r=change('fremont',p=>p.facts[0].evidenceIds=['FICTION']);
 assert.throws(()=>validatePlaceRegistry(r,evidence),/EVIDENCE_NOT_FOUND/);
 const e=structuredClone(evidence);e.records.F1.exactQuote=null;
 assert.throws(()=>validatePlaceRegistry(registry,e),/EVIDENCE_NOT_VERIFIED/);
});
test('No schedule inferred from the local clock',()=>{
 const r=change('harmandir',p=>p.programme={status:'live_now',schedule:'04:30'});
 assert.throws(()=>validatePlaceRegistry(r,evidence),/PROGRAMME_INVENTED/);
});
test('Invalid IANA timezone fails',()=>{
 const r=change('sanjose',p=>p.location.timeZone='California/SanJose');
 assert.throws(()=>validatePlaceRegistry(r,evidence),/INVALID_IANA_TIMEZONE/);
});
test('No founder or institutional approval is invented in this packet',()=>{
 const r=change('harmandir',p=>p.review.founderProductAccepted=true);
 assert.throws(()=>validatePlaceRegistry(r,evidence),/UNAUTHORIZED_PUBLICATION/);
});
test('Duplicate place or route identity fails',()=>{
 const r=structuredClone(registry);r.places[1].placeId='harmandir';
 assert.throws(()=>validatePlaceRegistry(r,evidence),/DUPLICATE_OR_INVALID_PLACE/);
});
