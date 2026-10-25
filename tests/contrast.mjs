import test from 'node:test';
import assert from 'node:assert/strict';
import {contrastRatio,assertReadableInk} from '../tools/contracts/contrast.mjs';
const day='#faf6ec',amrit='#111929';
test('Known black-on-white ratio is 21:1',()=>assert.equal(contrastRatio('#000000','#ffffff'),21));
test('Quiet Study inks remain legible in both environments',()=>{
 const pairs=[
  {ink:'#5a4634',ground:day,role:'Sikh interpretation (day)'},
  {ink:'#3f4f63',ground:day,role:'Psychology lens (day)'},
  {ink:'#e3d3b3',ground:amrit,role:'Sikh interpretation (Amrit)'},
  {ink:'#b9c6d6',ground:amrit,role:'Psychology lens (Amrit)'}
 ];
 pairs.forEach(p=>assert.ok(assertReadableInk(p).ratio>=4.5));
});
test('Faint gold and pale text on light paper fail when contrast is inadequate',()=>{
 assert.throws(()=>assertReadableInk({ink:'#fffbea',ground:day,role:'Too light'}),/Insufficient contrast/);
});
test('Malformed and transparent colors are not silently tested against the wrong backdrop',()=>{
 for(const value of ['rgb(0,0,0)','#fff','#12abZZ','rgba(1,2,3,.5)'])assert.throws(()=>contrastRatio(value,day));
});
