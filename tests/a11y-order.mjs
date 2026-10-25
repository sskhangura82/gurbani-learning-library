import test from 'node:test';
import assert from 'node:assert/strict';
import {validateRoomOutline} from '../tools/contracts/a11y-order.mjs';
const sample=[
 {id:'back',kind:'navigation',domOrder:0,visualOrder:0,interactive:true,accessibleName:'Return to library',width:44,height:44},
 {id:'line',kind:'scripture',domOrder:1,visualOrder:1,lang:'pa',originalQuoteVerified:true,interactive:false},
 {id:'view-source',kind:'navigation',domOrder:2,visualOrder:2,interactive:true,accessibleName:'Open original source',width:48,height:50}
];
test('Valid proposed room outline passes source, order, language and target gates',()=>assert.equal(validateRoomOutline(sample).items,3));
test('A voice reading order that differs from visual order fails',()=>assert.throws(()=>validateRoomOutline(sample.map((x,i)=>i===1?{...x,visualOrder:2}:x)),/DOM\/visual/));
test('Small touch target fails',()=>assert.throws(()=>validateRoomOutline(sample.map(x=>x.id==='back'?{...x,width:38}:x)),/44px/));
test('Untested scripture/source or missing Punjabi lang cannot pass',()=>{
 assert.throws(()=>validateRoomOutline(sample.map(x=>x.id==='line'?{...x,originalQuoteVerified:false}:x)),/Gurbani language/);
 assert.throws(()=>validateRoomOutline(sample.map(x=>x.id==='line'?{...x,lang:'en'}:x)),/Gurbani language/);
});
test('No actual iPhone success is implied by a metadata contract',()=>assert.throws(()=>validateRoomOutline([{...sample[0]}]),/No source-verified/));
