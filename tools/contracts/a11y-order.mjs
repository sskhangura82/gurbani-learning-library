/**
 * Proposed room-screen accessibility contract. This validates browser-derived
 * element measurements/metadata, not a physical device or a screenshot alone.
 */
export function validateRoomOutline(items) {
 if(!Array.isArray(items)||!items.length)throw Error('Room outline must not be empty');
 let scriptureFound=false;
 const seen=new Set();
 for(let i=0;i<items.length;i++){
  const item=items[i];
  if(!item||typeof item.id!=='string'||!item.id||seen.has(item.id))throw Error('Duplicate/missing accessible element id');
  seen.add(item.id);
  if(item.domOrder!==i||item.visualOrder!==i)throw Error('DOM/visual reading order mismatch: '+item.id);
  if(item.kind==='scripture'){
   scriptureFound=true;
   if(item.lang!=='pa'||!item.originalQuoteVerified)throw Error('Gurbani language/source missing: '+item.id);
  }
  if(item.interactive){
   if(!item.accessibleName||!item.accessibleName.trim())throw Error('Missing accessible name: '+item.id);
   if(!Number.isFinite(item.width)||!Number.isFinite(item.height)||item.width<44||item.height<44)
    throw Error('Target below 44px: '+item.id);
  }
 }
 if(!scriptureFound)throw Error('No source-verified Gurbani in room');
 return Object.freeze({items:items.length,scriptureFound});
}
