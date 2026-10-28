/* Execute the real shared appearance controller and reader handlers against a small browser model.
 * Covers preference persistence, learning isolation and failure paths; visual/browser checks are recorded separately.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const raw=p=>fs.readFileSync(root+p,'utf8'),code=raw('nitnem/appearance.js');
const KEY='glp001.nitnem.appearance.v1',results=[],pendingChecks=[];
function check(name,fn){
 const passed=()=>results.push({name,status:'PASS'}),failed=e=>results.push({name,status:'FAIL',error:e.message});
 try{const result=fn();if(result&&typeof result.then==='function')pendingChecks.push(result.then(passed,failed));else passed();}catch(e){failed(e);}
}
class Target{
 constructor(){this.events={};this.dataset={};this.attributes={};this.style={setProperty:(k,v)=>{this.style[k]=v;}};}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 dispatchEvent(event){for(const fn of this.events[event.type]||[])fn(event);}
 setAttribute(k,v){this.attributes[k]=v;}
}
function browser({store=new Map(),dark=false,broken=false,headOnly=false,japji=false}={}){
 const window=new Target(),document=new Target(),media=new Target();media.matches=dark;
 const root=new Target(),body=new Target(),meta=new Target(),status=new Target(),header=new Target();
 meta.dataset={light:japji?'#faf6ec':'#faf7ee',dark:japji?'#111929':'#101c25'};
 const buttons=['day','amrit'].map(value=>{const b=new Target();b.dataset.appearance=value;return b;});
 const select=new Target(),japjiSelect=new Target();header.getBoundingClientRect=()=>({height:71});
 document.documentElement=root;document.body=headOnly?null:body;document.readyState='loading';
 document.querySelector=s=>s==='.appearance-header'?header:s==='meta[name="theme-color"]'?meta:null;
 document.querySelectorAll=s=>s==='[data-appearance]'?(document.body?buttons:[]):[];
 document.getElementById=id=>document.body?({'appearance-status':status,theme:select,'set-theme':japjiSelect}[id]||null):null;
 window.matchMedia=()=>media;let writes=0;
 const localStorage={getItem:key=>{if(broken)throw Error('blocked');return store.get(key)??null;},setItem:(key,value)=>{if(broken)throw Error('blocked');writes++;store.set(key,value);}};
 class CustomEvent{constructor(type,options){this.type=type;this.detail=options.detail;}}
 vm.runInNewContext(code,{window,document,localStorage,CustomEvent});
 const mount=()=>{document.body=body;document.readyState='interactive';document.dispatchEvent({type:'DOMContentLoaded'});};
 if(!headOnly)mount();
 return {api:window.GLP_APPEARANCE,window,document,root,body,meta,status,buttons,select,japjiSelect,store,mount,writes:()=>writes,
  system:value=>{media.matches=value;media.dispatchEvent({type:'change'});},
  storage:(newValue,key=KEY)=>window.dispatchEvent({type:'storage',key,newValue})};
}
check('Saved dark appearance applies in the head before the body exists',()=>{
 const b=browser({store:new Map([[KEY,'amrit']]),headOnly:true});
 assert.equal(b.root.dataset.theme,'amrit');assert.equal(b.root.style.colorScheme,'dark');
 b.mount();assert.equal(b.body.dataset.theme,'amrit');assert.equal(b.buttons[1].attributes['aria-pressed'],'true');
});
check('Device preference follows system changes until a reader makes an explicit choice',()=>{
 const b=browser({dark:true});assert.equal(b.api.get(),'amrit');assert.equal(b.writes(),0);
 b.system(false);assert.equal(b.api.get(),'day');b.api.set('day');b.system(true);assert.equal(b.api.get(),'day');
});
check('One tap synchronizes selected buttons, both settings menus and the browser color',()=>{
 const b=browser();let delivered=null;b.window.addEventListener('glp:appearance',e=>{delivered=e.detail.theme;});
 b.buttons[1].dispatchEvent({type:'click'});
 assert.equal(b.api.get(),'amrit');assert.equal(delivered,'amrit');assert.equal(b.buttons[0].attributes['aria-pressed'],'false');
 assert.equal(b.buttons[1].attributes['aria-pressed'],'true');assert.equal(b.select.value,'amrit');assert.equal(b.japjiSelect.value,'amrit');
 assert.equal(b.meta.content,'#101c25');assert.equal(b.status.textContent,'Dark mode is on.');
});
check('A selected theme survives reload and carries between Nitnem and Japji palettes',()=>{
 const store=new Map(),a=browser({store});a.api.set('amrit');
 const b=browser({store,japji:true});assert.equal(b.api.get(),'amrit');assert.equal(b.meta.content,'#111929');
 b.api.set('day');const c=browser({store,dark:true});assert.equal(c.api.get(),'day');assert.equal(c.meta.content,'#faf7ee');
});
check('Legacy per-bani preference migrates only once and cannot replace the shared choice',()=>{
 const b=browser();assert.equal(b.api.adoptLegacy('amrit'),'amrit');assert.equal(b.store.get(KEY),'amrit');
 assert.equal(b.api.adoptLegacy('day'),'amrit');b.api.set('day');assert.equal(b.api.adoptLegacy('amrit'),'day');
});
check('Readers without a legacy choice keep following the device after reload',()=>{
 const adoption=raw('nitnem/japji-assets/js/japji-full.js').split('\n').find(line=>line.includes('GLP_APPEARANCE.adoptLegacy('));
 assert.ok(adoption,'The shipped Japji migration statement must be exercised');
 for(const oldRecord of [null,{version:2,notes:{a:'A reflection without any theme preference'}}]){
  const store=new Map(),first=browser({store,dark:true,japji:true});
  vm.runInNewContext(adoption,{window:first.window,raw:oldRecord,state:{theme:'day'}});
  assert.equal(first.api.get(),'amrit');assert.equal(store.get(KEY),'system');
  first.system(false);assert.equal(first.api.get(),'day');assert.equal(store.get(KEY),'system');
  const reopened=browser({store,dark:true,japji:true});
  vm.runInNewContext(adoption,{window:reopened.window,raw:{version:2,theme:'day'},state:{theme:'day'}});
  assert.equal(reopened.api.get(),'amrit','An automatically saved old theme is not an explicit choice');
  assert.equal(store.get(KEY),'system');reopened.system(false);assert.equal(reopened.api.get(),'day');
 }
});
check('An appearance change in another tab updates this view without writing again',()=>{
 const b=browser();b.storage('amrit');assert.equal(b.api.get(),'amrit');assert.equal(b.writes(),0);
 b.storage('day','unrelated.learning.key');assert.equal(b.api.get(),'amrit');
});
check('Clearing the shared preference resumes the current device preference',()=>{
 const b=browser({dark:true});b.api.set('day');b.storage(null);assert.equal(b.api.get(),'amrit');
 b.system(false);assert.equal(b.api.get(),'day');b.api.set('amrit');b.storage(null,null);assert.equal(b.api.get(),'day');
});
check('Blocked local storage still allows theme switching and reports the saving limit',()=>{
 const b=browser({broken:true});assert.equal(b.api.set('amrit'),false);assert.equal(b.body.dataset.theme,'amrit');
 assert.match(b.status.textContent,/cannot save your choice/);b.system(false);assert.equal(b.api.get(),'amrit');
});
check('Invalid preferences cannot become CSS themes or overwrite other learning data',()=>{
 const store=new Map([[KEY,'unexpected'],['glp001.continuous.v2','existing learning']]),b=browser({store,dark:true});
 assert.equal(b.api.get(),'amrit');assert.equal(b.api.set('invalid'),false);b.storage('invalid');assert.equal(b.api.get(),'amrit');
 b.api.set('day');assert.equal(store.get('glp001.continuous.v2'),'existing learning');assert.equal(store.size,2);
});
check('Nitnem theme events preserve newer learning saved by another tab',()=>{
 const source=raw('nitnem/reader.js'),handler=source.match(/^window\.addEventListener\('glp:appearance'.*$/m)?.[0];
 assert.ok(handler,'The shipped Nitnem appearance listener must be exercised');
 const save=source.slice(source.indexOf('function save(){'),source.indexOf('const sourceLabel='));
 const learningKey='glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.test.edition';
 const newerRecord=JSON.stringify({schema:1,compositionId:'test',editionId:'edition',rev:12,payload:{notes:{a:'New reflection from another tab'},bookmarks:['b'],lineId:'b'}});
 const store=new Map([[learningKey,newerRecord]]),b=browser({store});
 const state={pack:{compositionId:'test',editionId:'edition'},model:{lines:[{id:'a'},{id:'b'}]},index:0,rev:3,currentKey:learningKey,sourceVerified:true,notes:{a:'Old reflection'},bookmarks:[],size:30,theme:'day',pace:70,mode:'read',view:'continuous'};
 const before=JSON.stringify(state);let learningWrites=0;
 vm.runInNewContext(save+'\n'+handler,{state,window:b.window,$:()=>b.select,localStorage:{setItem:(key,value)=>{learningWrites++;store.set(key,value);}},announce:()=>{}});
 for(const [name,action] of [
  ['local choice',()=>b.api.set('amrit')],
  ['remote choice',()=>b.storage('day')],
  ['remote preference removal',()=>b.storage(null)],
  ['device preference',()=>b.system(true)]
 ]){
  action();assert.equal(state.theme,b.api.get(),name);assert.equal(b.select.value,state.theme,name);
  assert.equal(learningWrites,0,name);assert.equal(store.get(learningKey),newerRecord,name);
  assert.deepEqual({...state,theme:'day'},JSON.parse(before),name);
 }
});
check('Japji theme events and its settings selector leave learning persistence untouched',async()=>{
 const source=raw('nitnem/japji-assets/js/japji-full.js'),handler=source.match(/^window\.addEventListener\('glp:appearance'.*$/m)?.[0];
 assert.ok(handler,'The shipped Japji appearance listener must be exercised');
 const start=source.indexOf("$('dialog-body').addEventListener('change',async e=>{"),end=source.indexOf("window.addEventListener('wheel'",start);
 assert.ok(start>=0&&end>start,'The shipped Japji settings change handler must be exercised');
 const learningKey='glp001.continuous.v2',newerRecord=JSON.stringify({version:2,notes:{a:'New reflection from another tab'},bookmarks:['b'],read:{id:'b',offset:17},guide:{index:20,token:1}});
 const store=new Map([[learningKey,newerRecord]]),b=browser({store,japji:true});
 const state={theme:'day',notes:{a:'Pending local reflection'},bookmarks:['a'],read:{id:'a',offset:-7},guide:{index:7,token:2},mode:'study'};
 const before=JSON.stringify(state),pendingPreferences={};let persistCalls=0,changeHandler;
 const context={state,window:b.window,pendingPreferences,persist:()=>persistCalls++,$:id=>id==='dialog-body'?{addEventListener:(_,fn)=>{changeHandler=fn;}}:null};
 vm.runInNewContext(handler+'\n'+source.slice(start,end),context);
 for(const [name,action] of [
  ['local choice',()=>b.api.set('amrit')],
  ['remote choice',()=>b.storage('day')],
  ['remote preference removal',()=>b.storage(null)],
  ['device preference',()=>b.system(true)],
  ['settings selector',()=>changeHandler({target:{id:'set-theme',value:'day'}})]
 ]){
  await action();assert.equal(state.theme,b.api.get(),name);assert.equal(persistCalls,0,name);
  assert.deepEqual(pendingPreferences,{},name);assert.equal(store.get(learningKey),newerRecord,name);
  assert.deepEqual({...state,theme:'day'},JSON.parse(before),name);
 }
 assert.equal(store.get(KEY),'day');
});
check('Both reader documents provide labeled native buttons before opening any menu',()=>{
 for(const file of ['nitnem/index.html','nitnem/japji.html']){
  const html=raw(file),header=html.match(/<header[\s\S]*?<\/header>/)[0];
  assert.match(header,/appearance-header/);assert.match(header,/role="group" aria-label="Color appearance"/);
  for(const [theme,label] of [['day','Light'],['amrit','Dark']])assert.match(header,new RegExp('<button type="button" data-appearance="'+theme+'" aria-pressed="(?:true|false)">'+label+'</button>'));
  assert.ok(html.indexOf('src="appearance.js"')<html.indexOf('<link rel="stylesheet"'));
 }
 const css=raw('nitnem/appearance.css');assert.match(css,/min-height:44px/);assert.match(css,/body\.quiet-reading \.page-header\.appearance-header\{display:flex\}/);
 assert.match(css,/html\{scroll-padding-top:0\}/);assert.ok(!/fetch\(|XMLHttpRequest|innerHTML|\.notes|\.bookmarks/.test(code));
});
check('Nitnem scroll tracking chooses a line below a wrapped persistent header',()=>{
 const text=raw('nitnem/reader.js'),fn=text.slice(text.indexOf('function updateScrolledLine(){'),text.indexOf('function guideStep(){'));
 const model={lines:[{id:'a',unitIndex:0},{id:'b',unitIndex:0},{id:'c',unitIndex:0}]};
 const state={sourceVerified:true,model,view:'continuous',playing:false,index:0,pack:{units:[{title:'Passage'}]}};
 const lineNodes=new Map([['a',150],['b',210],['c',270]].map(([id,bottom])=>[id,{getBoundingClientRect:()=>({bottom})}]));
 const context={state,lineNodes,scrollTrackTimer:1,programmaticUntil:0,innerHeight:500,performance:{now:()=>1},document:{querySelector:()=>({getBoundingClientRect:()=>({bottom:200})})},paint:()=>{},save:()=>{},$:()=>({})};
 vm.runInNewContext(fn+'\nupdateScrolledLine();',context);assert.equal(state.index,2);
});
await Promise.all(pendingChecks);
const failed=results.filter(r=>r.status==='FAIL').length;
console.log(JSON.stringify({status:failed?'FAIL':'PASS',checks:results.length,failed,environment:'Node VM using the shipped controller, reader handlers and scroll-tracking function; browser checks are separate',results},null,2));
if(failed)process.exitCode=1;
