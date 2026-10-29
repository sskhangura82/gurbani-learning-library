/* Adapt the inspected browser scenario to a separate V15 package.
 * No existing profile, private invitation or running Mac process is used.
 * Actual font glyphs and pointer interactions are checked in fresh Chrome.
 */
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const at=process.argv.indexOf('--out');assert.ok(at>=0&&process.argv[at+1]);const out=path.resolve(process.argv[at+1]);
assert.ok(fs.existsSync(path.join(out,'site/learning/course.v15.json')));
const candidates=[process.env.CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
const chrome=candidates.find(p=>fs.existsSync(p));assert.ok(chrome,'No installed Chrome/Chromium found; browser verification remains blocked, not passed');
let s=fs.readFileSync(path.join(root,'tests/nitnem-v14-browser.mjs'),'utf8');
function one(a,b){assert.equal(s.split(a).length,2,'Harness adaptation must match once: '+a);s=s.replace(a,b);}
one("const site=path.join(temporary,'site'),profile=path.join(temporary,'profile');","const site=process.env.GLP_V15_SITE,profile=path.join(temporary,'profile');");
one("const evidence=path.join(root,'evidence');","const evidence=process.env.GLP_V15_EVIDENCE;");
one("const course=JSON.parse(fs.readFileSync(path.join(root,'nitnem/learning/course.v14.json')));","const course=JSON.parse(fs.readFileSync(path.join(site,'learning/course.v15.json')));");
const begin=s.indexOf(" const built=spawnSync('python3'");const end=s.indexOf(' const allowed=new Set();',begin);assert.ok(begin>0&&end>begin);
s=s.slice(0,begin)+" check('Actual separate V15 package is available',JSON.parse(fs.readFileSync(path.join(evidence,'build.json'))).assets===46);\n"+s.slice(end);
one("chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',","chrome=spawn(process.env.CHROME_PATH,");
s=s.replaceAll('v14','v15').replaceAll('V14','V15');
one('state.authoredLessons===90','state.authoredLessons===105');
s=s.replaceAll('All 346 Jaap','All 406 Jaap');one('.length===346','.length===406');
assert.equal(s.split('.slice(75,90)').length,3);s=s.replaceAll('.slice(75,90)','.slice(90,105)');
one('07[6-9]|08[0-9]|090','09[1-9]|10[0-5]');
one('jaap090.line02','jaap102.line02');one('smallest or the child','primal');
one('All 90 authored Jaap','All 105 authored Jaap');one('.length===90','.length===105');
one('jaap076.line01','jaap091.line01');s=s.replaceAll('jaap76-','jaap91-');
one('Fresh isolated headless Chrome on hosting Mac;','Fresh isolated headless Chrome in the candidate QA environment;');
// Unlike element.click(), actual pointer events also exercise native focus.
// Keep already visible sticky controls in place; only reveal offscreen targets.
const clickStart=s.indexOf('async function click(selector){'),clickEnd=s.indexOf('async function nav(',clickStart);
assert.ok(clickStart>0&&clickEnd>clickStart);
const pointerClick=String.raw`async function click(selector){
 const point=await run('(()=>{const e=document.querySelector('+JSON.stringify(selector)+');if(!e)throw Error("Missing control");let r=e.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight||r.left<0||r.right>innerWidth){e.scrollIntoView({block:"center",inline:"nearest",behavior:"instant"});r=e.getBoundingClientRect();}if(r.width<=0||r.height<=0)throw Error("Control is not visible");return {x:r.left+r.width/2,y:r.top+r.height/2}})()');
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point},session);
 await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point},session);
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point},session);
}
`;
s=s.slice(0,clickStart)+pointerClick+s.slice(clickEnd);
// Do not query diagnostics during the asynchronous pack/model transition.
const readiness='window.NITNEM_INTERNAL_QA?.getState().sourceVerified&&NITNEM_INTERNAL_QA.getState().teachingAvailable';
assert.equal(s.split(readiness).length,4);
s=s.replaceAll(readiness,'!!document.querySelector("#source-unit .scripture-line")&&'+readiness);
const glyphCheck=` await run('document.fonts.ready.then(()=>true)');
 await send('DOM.enable',{},session);await send('CSS.enable',{},session);
 const {root:fontDocument}=await send('DOM.getDocument',{depth:0},session);
 const glyphEvidence=[];
 for(const selector of ['[data-line-id="jaap091.line01"] .g-word','[data-meaning-line="jaap091.line01"] .punjabi']){
  const {nodeId}=await send('DOM.querySelector',{nodeId:fontDocument.nodeId,selector},session);
  if(!nodeId)throw Error('Gurmukhi glyph-test element missing: '+selector);
  const {fonts}=await send('CSS.getPlatformFontsForNode',{nodeId},session);
  glyphEvidence.push({selector,fonts});
 }
 check('Real Gurmukhi fonts supply glyphs for scripture and Punjabi explanation',glyphEvidence.every(x=>x.fonts.some(f=>/Gurmukhi/i.test(f.familyName)&&f.glyphCount>0)),{glyphEvidence});
 fs.writeFileSync(path.join(evidence,'rendered-fonts.json'),JSON.stringify({status:'PASS',source:'Chrome CSS.getPlatformFontsForNode',fontFilesIncluded:false,checks:glyphEvidence},null,2)+'\\n');
`;
one(' const expected=source.units.slice(90,105)',glyphCheck+' const expected=source.units.slice(90,105)');
const readPosition='await run('+JSON.stringify('(()=>{const row=document.getElementById("nitnem-passage-90").querySelector(".scripture-line");return {y:scrollY,index:NITNEM_INTERNAL_QA.getState().index,anchorTop:row.getBoundingClientRect().top,documentHeight:document.documentElement.scrollHeight}})()')+')';
// Wait out the unchanged reader's 1100ms programmatic-scroll guard, then
// trigger the normal debounced tracking path with a small real scroll.
const settle=` await delay(1200);
 await run('window.scrollBy(0,1)');
 await until('NITNEM_INTERNAL_QA.getState().unit===90','settled reading position at Chhand91');
 const themePosition=${readPosition};
`;
one(" check('Dark header stays visible while reading later chhands',",settle+" check('Dark header stays visible while reading later chhands',");
const positionCheck=` await run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
 const lightPosition=${readPosition};
 const positionPreserved=Math.abs(lightPosition.anchorTop-themePosition.anchorTop)<2&&lightPosition.index===themePosition.index;
 fs.writeFileSync(path.join(evidence,'theme-position.json'),JSON.stringify({status:positionPreserved?'PASS':'FAIL',before:themePosition,after:lightPosition,scope:'Visible source anchor and reading index after pointer theme click; settled manual scrolling, not rapid-switch race coverage'},null,2)+'\\n');
 await shot('nitnem-v15-jaap91-light-390.png');
 check('Pointer theme change preserves the visible source anchor and reading index',positionPreserved,{before:themePosition,after:lightPosition});
`;
one(" await shot('nitnem-v15-jaap91-light-390.png');",positionCheck);
const generated=path.join(root,'tests/.nitnem-v15-browser.generated.mjs');assert.ok(!fs.existsSync(generated));
fs.writeFileSync(generated,s,{flag:'wx'});
let status=1;
try{
 const r=spawnSync(process.execPath,[generated],{cwd:root,stdio:'inherit',timeout:120000,env:{...process.env,CHROME_PATH:chrome,GLP_V15_SITE:path.join(out,'site'),GLP_V15_EVIDENCE:path.join(out,'evidence')}});
 status=r.status??1;if(r.error)console.error(r.error.message);
}finally{fs.unlinkSync(generated);}
process.exitCode=status;
