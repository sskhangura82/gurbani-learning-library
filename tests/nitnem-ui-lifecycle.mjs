// Run the actual reader closure and real storage module against synthetic DOM,
// storage and controllable lock timing. This is not browser acceptance evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash,webcrypto} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),N=require('../nitnem/local-learning.js'),C=require('../js/continuous-core.js');
const readerURL=new URL('../nitnem/reader.js',import.meta.url),readerSource=fs.readFileSync(readerURL,'utf8');
const checks=[];
async function test(name,run){await run();checks.push({name,status:'PASS'});}
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};}
async function until(predicate,label){for(let n=0;n<100;n++){if(predicate())return;await Promise.resolve();}throw Error('Synthetic schedule did not reach '+label);}
async function flush(){for(let n=0;n<16;n++)await Promise.resolve();}
function controlledLocks(){
 const busy=new Set(),tails=new Map(),writeGates=[],editorGates=[];
 let writeRequests=0;
 return {busy,get writeRequests(){return writeRequests;},
  holdWrite(){const gate=deferred();writeGates.push(gate);return gate;},
  holdEditor(){const gate=deferred();editorGates.push(gate);return gate;},
  request(name,options,callback){
   if(typeof options==='function'){callback=options;options={};}
   if(options.ifAvailable){
    const gate=editorGates.shift();
    return Promise.resolve().then(async()=>{
     if(gate)await gate.promise;
     if(busy.has(name))return callback(null);
     busy.add(name);try{return await callback({name});}finally{busy.delete(name);}
    });
   }
   writeRequests++;const gate=writeGates.shift();
   const work=(tails.get(name)||Promise.resolve()).catch(()=>{}).then(async()=>{if(gate)await gate.promise;return callback({name});});
   tails.set(name,work);return work;
  }
 };
}
function harness(){
 const elements=new Map(),timers=new Map(),closedEvents=[],downloads=[],blobs=new Map(),storageMap=new Map();
 const locks=controlledLocks();let now=100,timerSerial=0,blobSerial=0,writeFailure=false;
 class Target{
  constructor(){this.listeners=new Map();}
  addEventListener(type,fn,options={}){const list=this.listeners.get(type)||[];list.push({fn,once:!!options?.once});this.listeners.set(type,list);}
  fire(type,values={}){
   const event={type,target:this,preventDefault(){this.defaultPrevented=true;},stopPropagation(){},...values};
   const list=[...(this.listeners.get(type)||[])];
   for(const listener of list)if(listener.once)this.listeners.set(type,(this.listeners.get(type)||[]).filter(x=>x!==listener));
   return Promise.all(list.map(listener=>listener.fn(event)));
  }
 }
 class Element extends Target{
  constructor(id,tag='div'){super();this.id=id;this.tagName=tag.toUpperCase();this.value='';this.hidden=false;this.disabled=false;this.readOnly=false;this.open=false;this.dataset={};this.style={setProperty(){}};this.children=[];this.attributes=new Map();this.isConnected=true;this._text='';this.rect={top:0,bottom:400};this.focusCount=0;}
  get textContent(){return this._text;}
  set textContent(value){this._text=String(value);this.children=[];}
  get childElementCount(){return this.children.length;}
  append(...children){for(const child of children){this.children.push(child);child.parent=this;}}
  replaceChildren(...children){this.children=[];this._text='';this.append(...children);}
  setAttribute(key,value){this.attributes.set(key,String(value));}
  removeAttribute(key){this.attributes.delete(key);}
  querySelectorAll(selector){const out=[];for(const child of this.children){if(selector==='button'&&child.tagName==='BUTTON')out.push(child);out.push(...child.querySelectorAll(selector));}return out;}
  closest(selector){return selector.includes(this.tagName.toLowerCase())?this:null;}
  showModal(){this.open=true;}
  close(){if(!this.open)return;this.open=false;closedEvents.push(this);}
  focus(){this.focusCount++;}
  scrollIntoView(){this.scrolled=true;}
  getBoundingClientRect(){return this.rect;}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this);this.isConnected=false;}
  click(){if(this.tagName==='A'){downloads.push({href:this.href,filename:this.download,blob:blobs.get(this.href)});return;}return this.fire('click');}
  contains(node){return node===this||this.children.some(child=>child.contains(node));}
 }
 function element(id){if(!elements.has(id))elements.set(id,new Element(id,id.includes('dialog')?'dialog':id==='note'?'textarea':id==='import-learning'?'input':'div'));return elements.get(id);}
 const document=new Target();document.getElementById=element;document.querySelectorAll=()=>[];
 document.querySelector=selector=>selector==='dialog[open]'?[...elements.values()].find(node=>node.tagName==='DIALOG'&&node.open)||null:null;
 document.createElement=tag=>new Element('',tag);document.createDocumentFragment=()=>new Element('','fragment');
 document.body=new Element('body','body');document.documentElement=new Element('html','html');
 const window=new Target();window.GLP_NITNEM_STORAGE=N;window.GLPContinuousCore=C;window.GLP_NitnemLearning={nextIndex:()=>-1};
 window.GLP_APPEARANCE={get:()=>'day',adoptLegacy:value=>value||'day'};window.scrollTo=()=>{};
 window.localStorage={getItem:key=>storageMap.get(key)??null,setItem:(key,value)=>{if(writeFailure)throw Error('SYNTHETIC storage failure');storageMap.set(key,value);}};
 class TestURL extends URL{}
 TestURL.createObjectURL=blob=>{const key='blob:synthetic-'+(++blobSerial);blobs.set(key,blob);return key;};TestURL.revokeObjectURL=key=>blobs.delete(key);
 const location=new URL('https://example.invalid/nitnem/'),history={replaceState(_state,_title,path){location.href=new URL(path,location).href;}};
 const context={window,document,navigator:{locks},location,history,URL:TestURL,TextDecoder,TextEncoder,Blob,crypto:webcrypto,
  performance:{now:()=>now},innerHeight:800,matchMedia:()=>({matches:false}),console,
  fetch:()=>Promise.reject(Error('SYNTHETIC fixture has no network')),
  setTimeout:(fn,delay)=>{const id=++timerSerial;timers.set(id,{fn,at:now+delay});return id;},clearTimeout:id=>timers.delete(id)};
 const exposed='window.__lifecycleTest={state,openTools,closeTools,saveNote,saveReflection,importLearning,exportLearning,savedLines,save,settleWrites,lineNodes,loadSaved,userScrollIntent,updateScrolledLine,scrollToCurrent,collection};';
 assert.match(readerSource,/\}\)\(\);\s*$/u,'Expected an enclosing reader closure for test-only instrumentation');
 vm.runInNewContext(readerSource.replace(/\}\)\(\);\s*$/u,exposed+'})();'),context,{filename:'nitnem/reader.js'});
 const api=window.__lifecycleTest;
 function pack(name){return {compositionId:name,editionId:'synthetic-2026',title:'SYNTHETIC '+name,units:[{id:name+'.unit1',title:'SYNTHETIC passage 1',lines:[{id:name+'.line01',text:'SYNTHETIC '+name+' first line'},{id:name+'.line02',text:'SYNTHETIC '+name+' second line'}]},{id:name+'.unit2',title:'SYNTHETIC passage 2',lines:[{id:name+'.line03',text:'SYNTHETIC '+name+' third line'}]}]};}
 function activate(name,notes={},bookmarks=[]){
  const source=pack(name),key=N.keyFor(name,source.editionId);
  if(!storageMap.has(key)&&Object.keys(notes).length+bookmarks.length)storageMap.set(key,JSON.stringify({schema:1,compositionId:name,editionId:source.editionId,rev:1,savedAt:'2026-11-25T00:00:00Z',payload:{notes,bookmarks,lineId:name+'.line01',size:30,theme:'day',pace:70,mode:'read',view:'continuous'}}));
  Object.assign(api.state,{pack:source,bani:name,units:source.units,model:C.flatten(source.units),unit:0,index:0,playing:false,sourceVerified:true});
  api.lineNodes.clear();api.loadSaved(source);return api.state.manager;
 }
 async function closeEvents(){while(closedEvents.length)await closedEvents.shift().fire('close');await flush();}
 async function switchTo(name,notes={},bookmarks=[]){element('tools-dialog').close();await closeEvents();const manager=activate(name,notes,bookmarks);await api.openTools();return manager;}
 function backup(name,notes,bookmarks=[]){const manager=N.create(pack(name),{storage:window.localStorage,locks});return JSON.stringify({project:N.PROJECT,schema:1,compositionId:name,editionId:'synthetic-2026',state:{...manager.seed(),notes,bookmarks}});}
 async function tick(milliseconds){now+=milliseconds;for(const [id,timer] of [...timers])if(timer.at<=now){timers.delete(id);timer.fn();}await flush();}
 function readingRows(){for(const [index,line] of api.state.model.lines.entries()){const row=new Element(line.id);row.rect={top:index*100,bottom:50+index*200};api.lineNodes.set(line.id,row);}}
 return {api,element,window,document,locks,storageMap,downloads,activate,switchTo,backup,closeEvents,tick,readingRows,
  failWrites(){writeFailure=true;},pendingTimers:()=>timers.size};
}

await test('A delayed file read from a closed dialog cannot import or change another bani editor',async()=>{
 const h=harness(),a=h.activate('a');await h.api.openTools();const file=deferred();let reading=false;
 const importing=h.api.importLearning({size:100,text(){reading=true;return file.promise;}});await until(()=>reading,'file read');
 assert.equal(h.element('note').readOnly,true);const beforeA=a.stored().raw;
 const b=await h.switchTo('b',{'b.line01':'SYNTHETIC saved B'});h.element('note').value='SYNTHETIC new B draft';h.element('save-status').textContent='SYNTHETIC B status';const beforeB=b.stored().raw;
 file.resolve(h.backup('a',{'a.line01':'SYNTHETIC incoming A'}));await importing;
 assert.equal(a.stored().raw,beforeA);assert.equal(b.stored().raw,beforeB);assert.equal(h.api.state.bani,'b');
 assert.equal(h.element('note').value,'SYNTHETIC new B draft');assert.equal(h.element('save-status').textContent,'SYNTHETIC B status');
 assert.deepEqual(h.api.state.notes,{'b.line01':'SYNTHETIC saved B'});assert.equal(h.element('note').readOnly,false);
});
await test('An import already waiting for its write lock stays bound to the old bani and preserves its lease until completion',async()=>{
 const h=harness(),a=h.activate('a');await h.api.openTools();const gate=h.locks.holdWrite(),before=h.locks.writeRequests;
 const importing=h.api.importLearning({size:100,text:async()=>h.backup('a',{'a.line01':'SYNTHETIC incoming A'})});await until(()=>h.locks.writeRequests>before,'import lock');
 const b=await h.switchTo('b',{'b.line01':'SYNTHETIC saved B'});h.element('note').value='SYNTHETIC B draft';h.element('save-status').textContent='SYNTHETIC B status';const beforeB=b.stored().raw;
 assert.equal(h.locks.busy.has(a.key+':editor'),true);gate.resolve();await importing;await flush();
 assert.equal(a.read().payload.notes['a.line01'],'SYNTHETIC incoming A');assert.equal(b.stored().raw,beforeB);
 assert.equal(h.element('note').value,'SYNTHETIC B draft');assert.equal(h.element('save-status').textContent,'SYNTHETIC B status');assert.equal(h.locks.busy.has(a.key+':editor'),false);
});
await test('Close freezes editing while saving and preserves a newer programmatic draft instead of closing it',async()=>{
 const h=harness(),a=h.activate('a');await h.api.openTools();h.element('note').value='SYNTHETIC first text';const gate=h.locks.holdWrite();const closing=h.api.closeTools();
 assert.equal(h.element('note').readOnly,true);assert.equal(h.element('tools-close').disabled,true);h.element('note').value='SYNTHETIC later text';gate.resolve();
 assert.equal(await closing,false);assert.equal(h.element('tools-dialog').open,true);assert.equal(a.read().payload.notes['a.line01'],'SYNTHETIC first text');
 assert.equal(h.element('note').value,'SYNTHETIC later text');assert.match(h.element('save-status').textContent,/newer changes/);assert.equal(h.element('note').readOnly,false);
 const event={preventDefault(){this.prevented=true;}};await h.window.fire('beforeunload',event);
 assert.equal(await h.api.closeTools(),true);assert.equal(a.read().payload.notes['a.line01'],'SYNTHETIC later text');assert.equal(h.element('tools-dialog').open,false);
});
await test('Explicit Save permits continued typing, keeps the later draft and marks it unsaved',async()=>{
 const h=harness(),a=h.activate('a');await h.api.openTools();h.element('note').value='SYNTHETIC first text';const gate=h.locks.holdWrite();const saving=h.element('save-note').fire('click');
 assert.equal(h.element('note').readOnly,false);h.element('note').value='SYNTHETIC later text';gate.resolve();await saving;
 assert.equal(a.read().payload.notes['a.line01'],'SYNTHETIC first text');assert.equal(h.element('note').value,'SYNTHETIC later text');assert.equal(h.element('tools-dialog').open,true);
 assert.match(h.element('save-status').textContent,/newer changes/);assert.equal(h.element('save-note').disabled,false);
 let prevented=false;await h.window.fire('beforeunload',{preventDefault(){prevented=true;}});assert.equal(prevented,true);
});
await test('A late export after a switch creates no download and cannot alter the new editor',async()=>{
 const h=harness(),a=h.activate('a');await h.api.openTools();h.element('note').value='SYNTHETIC export A';const gate=h.locks.holdWrite();const exporting=h.api.exportLearning();
 assert.equal(h.element('note').readOnly,true);const b=await h.switchTo('b',{'b.line01':'SYNTHETIC saved B'});const before=b.stored().raw;h.element('save-status').textContent='SYNTHETIC B status';
 gate.resolve();await exporting;assert.equal(a.read().payload.notes['a.line01'],'SYNTHETIC export A');assert.equal(b.stored().raw,before);assert.equal(h.downloads.length,0);assert.equal(h.element('save-status').textContent,'SYNTHETIC B status');
});
await test('An ordinary export uses the captured bani and contains the saved reflection',async()=>{
 const h=harness();h.activate('a');await h.api.openTools();h.element('note').value='SYNTHETIC export';await h.api.exportLearning();
 assert.equal(h.downloads.length,1);assert.equal(h.downloads[0].filename,'nitnem-a-learning.json');
 const exported=JSON.parse(await h.downloads[0].blob.text());assert.equal(exported.compositionId,'a');assert.equal(exported.state.notes['a.line01'],'SYNTHETIC export');assert.equal(h.element('note').readOnly,false);
});
await test('A late bookmark completes only in the original record and leaves a new dialog unchanged',async()=>{
 const h=harness(),a=h.activate('a');await h.api.openTools();const gate=h.locks.holdWrite();const bookmarking=h.element('bookmark').fire('click');
 const b=await h.switchTo('b');const before=b.stored().raw;h.element('bookmark').textContent='SYNTHETIC B button';h.element('save-status').textContent='SYNTHETIC B status';
 gate.resolve();await bookmarking;assert.deepEqual(a.read().payload.bookmarks,['a.line01']);assert.equal(b.stored().raw,before);
 assert.equal(h.element('bookmark').textContent,'SYNTHETIC B button');assert.equal(h.element('save-status').textContent,'SYNTHETIC B status');
});
await test('A saved-line navigation waiting on an old note cannot close or move the new bani',async()=>{
 const h=harness();h.activate('a',{},['a.line03']);await h.api.openTools();h.element('note').value='SYNTHETIC navigation A';const button=h.element('saved-list').querySelectorAll('button')[0];
 const gate=h.locks.holdWrite(),moving=button.fire('click');assert.equal(h.element('note').readOnly,true);
 await h.switchTo('b');h.api.state.index=1;h.element('note').value='SYNTHETIC B draft';gate.resolve();await moving;
 assert.equal(h.api.state.bani,'b');assert.equal(h.api.state.index,1);assert.equal(h.element('tools-dialog').open,true);assert.equal(h.element('note').value,'SYNTHETIC B draft');
});
await test('A current saved-line navigation saves its reflection and then moves to the selected line',async()=>{
 const h=harness(),a=h.activate('a',{},['a.line03']);await h.api.openTools();h.element('note').value='SYNTHETIC navigation';
 await h.element('saved-list').querySelectorAll('button')[0].fire('click');await h.api.settleWrites();
 assert.equal(h.element('tools-dialog').open,false);assert.equal(h.api.state.index,2);assert.equal(a.read().payload.notes['a.line01'],'SYNTHETIC navigation');assert.equal(a.read().payload.lineId,'a.line03');
});
await test('An obsolete lease result never replaces the lease of a newly opened dialog',async()=>{
 const h=harness(),a=h.activate('a'),gate=h.locks.holdEditor();const oldOpening=h.api.openTools();h.element('tools-dialog').close();await h.closeEvents();
 await h.api.openTools();const session=h.api.state.toolsSession,lease=session.lease;assert.equal(lease.available,true);
 gate.resolve();await oldOpening;assert.equal(h.api.state.toolsSession,session);assert.equal(session.lease,lease);assert.equal(h.api.state.editorLease,lease);assert.equal(h.element('note').disabled,false);
 assert.equal(h.locks.busy.has(a.key+':editor'),true);await h.api.closeTools();await flush();assert.equal(h.locks.busy.has(a.key+':editor'),false);
});
await test('A queued close event from the previous dialog does not retire a newly opened session',async()=>{
 const h=harness();h.activate('a');await h.api.openTools();assert.equal(await h.api.closeTools(),true);await flush();await h.api.openTools();const current=h.api.state.toolsSession;
 await h.closeEvents();assert.equal(h.api.state.toolsSession,current);assert.equal(current.closed,false);assert.equal(h.element('tools-dialog').open,true);assert.equal(h.element('note').disabled,false);
});
await test('A stale close completion cannot close a newly opened dialog for the same bani',async()=>{
 const h=harness(),a=h.activate('a');await h.api.openTools();h.element('note').value='SYNTHETIC old session';const gate=h.locks.holdWrite();const closing=h.api.closeTools();
 h.element('tools-dialog').close();await h.closeEvents();await h.api.openTools();const session=h.api.state.toolsSession;h.element('save-status').textContent='SYNTHETIC reopened status';
 gate.resolve();assert.equal(await closing,false);assert.equal(h.api.state.toolsSession,session);assert.equal(h.element('tools-dialog').open,true);assert.equal(h.element('save-status').textContent,'SYNTHETIC reopened status');assert.equal(a.read().payload.notes['a.line01'],'SYNTHETIC old session');
});
await test('Before-update freezes a pending reflection, rejects a stale session and preserves the new editor',async()=>{
 const h=harness();h.activate('a');await h.api.openTools();h.element('note').value='SYNTHETIC update A';const gate=h.locks.holdWrite();const updating=h.window.GLP_BEFORE_UPDATE();
 assert.equal(h.element('note').readOnly,true);await h.switchTo('b');h.element('note').value='SYNTHETIC update B draft';gate.resolve();assert.equal(await updating,false);
 assert.equal(h.element('note').value,'SYNTHETIC update B draft');assert.equal(h.element('tools-dialog').open,true);assert.equal(h.element('note').readOnly,false);
});
await test('An active import blocks overlapping close and update until it completes',async()=>{
 const h=harness();h.activate('a');await h.api.openTools();const gate=deferred();let reading=false;
 const importing=h.api.importLearning({size:100,text(){reading=true;return gate.promise;}});await until(()=>reading,'overlap file read');
 assert.equal(await h.api.closeTools(),false);assert.equal(await h.window.GLP_BEFORE_UPDATE(),false);assert.equal(h.element('tools-dialog').open,true);assert.equal(h.element('note').readOnly,true);
 gate.resolve(h.backup('a',{'a.line01':'SYNTHETIC imported'}));await importing;assert.equal(h.element('note').value,'SYNTHETIC imported');assert.equal(h.element('note').readOnly,false);
 assert.equal(await h.window.GLP_BEFORE_UPDATE(),true);
});
await test('Save failures keep the draft visible and selectable, block close and update, and preserve stored bytes',async()=>{
 const h=harness(),a=h.activate('a',{'a.line01':'SYNTHETIC existing'});await h.api.openTools();const before=a.stored().raw;h.element('note').value='SYNTHETIC unsaved';h.failWrites();
 assert.equal(await h.api.closeTools(),false);assert.equal(h.element('tools-dialog').open,true);assert.equal(h.element('note').value,'SYNTHETIC unsaved');assert.equal(h.element('note').disabled,false);assert.equal(h.element('note').readOnly,true);
 assert.equal(await h.window.GLP_BEFORE_UPDATE(),false);assert.equal(a.stored().raw,before);assert.equal(h.element('export-learning').disabled,false);
 await h.api.exportLearning();assert.equal(h.downloads.length,1);assert.equal(JSON.parse(await h.downloads[0].blob.text()).state.notes['a.line01'],'SYNTHETIC unsaved');assert.equal(a.stored().raw,before);
});
await test('A failed import restores its controls and leaves the existing note unchanged',async()=>{
 const h=harness(),a=h.activate('a',{'a.line01':'SYNTHETIC existing'});await h.api.openTools();const before=a.stored().raw;
 await h.element('import-learning').fire('change',{target:{files:[{size:50,text:async()=>'{bad json'}],value:'synthetic-file'}});
 assert.equal(a.stored().raw,before);assert.equal(h.element('note').value,'SYNTHETIC existing');assert.equal(h.element('note').readOnly,false);assert.equal(h.element('save-note').disabled,false);assert.match(h.element('save-status').textContent,/Import refused/);
});
await test('Programmatic scrolling alone remains suppressed and does not overwrite the selected reading place',async()=>{
 const h=harness(),a=h.activate('a');h.readingRows();h.api.scrollToCurrent();await h.window.fire('scroll');await h.tick(150);
 assert.equal(h.api.state.index,0);assert.equal(a.stored().raw,null);assert.equal(h.pendingTimers(),0);
});
for(const type of ['wheel','touchmove','keydown'])await test('A real '+type+' intent ends suppression and persists the visible reading line',async()=>{
 const h=harness(),a=h.activate('a');h.readingRows();h.api.scrollToCurrent();await h.window.fire(type,{isTrusted:true,key:'PageDown',target:type==='keydown'?h.document.createElement('button'):h.document.body});await h.tick(150);await h.api.settleWrites();
 assert.equal(h.api.state.index,1);assert.equal(a.read().payload.lineId,'a.line02');
});
await test('Synthetic events, text-field arrows and unrelated keys do not cancel programmatic-scroll suppression',async()=>{
 for(const event of [{type:'wheel',isTrusted:false},{type:'keydown',key:'ArrowDown',field:true},{type:'keydown',key:' ',button:true},{type:'keydown',key:'x'},{type:'keydown',key:'PageDown',ctrlKey:true}]){
  const h=harness(),a=h.activate('a');h.readingRows();h.api.scrollToCurrent();await h.window.fire(event.type,{...event,isTrusted:event.isTrusted??true,target:event.field?h.element('note'):event.button?h.document.createElement('button'):h.document.body});await h.tick(150);
  assert.equal(h.api.state.index,0);assert.equal(a.stored().raw,null);
 }
});

const report={checkedAt:new Date().toISOString(),environment:'Node VM running actual nitnem/reader.js and actual local-learning.js; synthetic DOM, records, and controlled write/editor locks',
 browserAcceptance:false,readerSHA256:createHash('sha256').update(readerSource).digest('hex'),storageSHA256:createHash('sha256').update(fs.readFileSync(new URL('../nitnem/local-learning.js',import.meta.url))).digest('hex'),
 scope:'Async dialog lifetimes, captured-bani persistence, draft preservation, editor leases, import/export/update, and real-versus-programmatic scroll intent',dataPolicy:'Only invented SYNTHETIC learning data; no user browser or saved learning accessed',checks};
fs.writeFileSync(new URL('../evidence/nitnem-ui-lifecycle-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({total:checks.length,status:'PASS',readerSHA256:report.readerSHA256}));
