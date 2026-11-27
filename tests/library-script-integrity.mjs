// Builder mutation checks: production transport coverage is distinct from content approval.
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {buildAppBundle,buildAppBundles} from '../tools/build-app-bundles.mjs';
import {APP_SCRIPT_POLICY,pinAppHTML,refreshAppSRI} from '../tools/refresh-app-sri.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const require=createRequire(new URL('../tools/script-integrity/package.json',import.meta.url));
const {parse}=require('acorn');
const read=name=>fs.readFile(path.join(root,name));
const baseline='bf744d1ac5b845d63c3324ed1f231c3fec31e40e';
const expected={
 'index.html':['js/home.js','js/pwa.js','library/app.bundle.mjs'],
 'gurdwara.html':['js/arrivals.js'],
 'gurdwaras.html':[],
 'pauri-2-lesson.html':['js/content.js','js/core.js','js/gurdwaras.js','js/places.js','js/app.js'],
 'simran.html':['js/simran.js'],
 'breathing.html':['js/breathing-core.js','js/breathing.js'],
 'articles/index.html':['app.bundle.mjs'],
 'articles/article.html':['app.bundle.mjs'],
 'knowledge/index.html':['app.bundle.mjs'],
 'hukamnama/index.html':['./reader.bundle.mjs'],
 'full-japji.html':['js/source-integrity.js','js/japji-full-data.js','js/content.js','js/gurdwaras.js','js/continuous-core.js','js/learning.js','js/shared-learning.js','js/japji-lessons.js','js/line-meanings.js','js/japji-full.js','js/pwa.js'],
 'sukhmani.html':['js/source-integrity.js','js/sukhmani-data.js','js/sukhmani-teaching.js','js/sukhmani-learning.js','js/shared-learning.js','js/sukhmani-reader.js','js/pwa.js'],
 'nitnem/index.html':['appearance.js','continuous-core.js','learning/learning-ui.js','local-learning.js','reader.js','offline.js'],
 'salok-mahalla9/index.html':['appearance.js','continuous-core.js','learning/learning-ui.js','local-learning.js','reader.js','offline.js'].map(p=>'../nitnem/'+p),
 'salok-kabir/index.html':['appearance.js','continuous-core.js','learning/learning-ui.js','local-learning.js','reader.js','offline.js'].map(p=>'../nitnem/'+p)
};
const tags=html=>[...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)].map(m=>m[0]);
const attr=(tag,name)=>tag.match(new RegExp('\\b'+name+'="([^"]*)"'))?.[1];
function walk(node,visit){if(!node||typeof node!=='object')return;visit(node);for(const value of Object.values(node))if(Array.isArray(value))value.forEach(x=>walk(x,visit));else if(value&&typeof value==='object')walk(value,visit);}

test('All 15 production pages carry exactly 52 independently inventoried script pins',async()=>{
 assert.deepEqual(APP_SCRIPT_POLICY.map(p=>p.page).sort(),Object.keys(expected).sort());
 let total=0,baselineUnpinned=0;
 for(const [page,ordered] of Object.entries(expected)){
  const html=(await read(page)).toString(),list=tags(html);
  assert.deepEqual(list.map(tag=>attr(tag,'src')),ordered,page);
  if(page!=='hukamnama/index.html'){
   const previous=execFileSync('git',['show',baseline+':'+page],{cwd:root,encoding:'utf8'});
   baselineUnpinned+=tags(previous).filter(tag=>!attr(tag,'integrity')).length;
  }
  for(const tag of list){
   const src=attr(tag,'src'),algorithm=page.startsWith('salok-')?'sha256':'sha384';
   const bytes=await read(path.posix.normalize(path.posix.join(path.posix.dirname(page),src)));
   assert.equal(attr(tag,'integrity'),algorithm+'-'+createHash(algorithm).update(bytes).digest('base64'),page+' '+src);
   assert.equal(attr(tag,'crossorigin'),'anonymous',page+' '+src);
   assert.equal(attr(tag,'type'),src.endsWith('.bundle.mjs')?'module':undefined,page+' script type');
   assert.equal(/\sasync(?:\s|[=>])/.test(tag),false);
   total++;
  }
 }
 assert.equal(total,52);
 assert.equal(baselineUnpinned,15,'negative baseline confirms this extends the existing 36 reader pins');
});

test('Generated modules reproduce exactly and contain no executable import or export-from edges',async()=>{
 for(const name of ['library','articles','knowledge','hukamnama']){
  const first=await buildAppBundle(name),second=await buildAppBundle(name);
  assert.equal(first.outputPath,name+(name==='hukamnama'?'/reader.bundle.mjs':'/app.bundle.mjs'));
  assert.equal(first.code,second.code,name+' deterministic output');
  assert.equal(first.code,(await read(first.outputPath)).toString(),name+' committed bundle');
  const ast=parse(first.code,{ecmaVersion:'latest',sourceType:'module'});
  walk(ast,node=>{
   assert.notEqual(node.type,'ImportDeclaration',name+' static import');
   assert.notEqual(node.type,'ImportExpression',name+' dynamic import');
   if(node.type==='ExportNamedDeclaration'||node.type==='ExportAllDeclaration')assert.equal(node.source,null,name+' export-from');
  });
  assert.equal(first.code.includes(root),false,'no machine-specific directory in generated output');
 }
});

test('Ordinary check mode writes neither bundles nor HTML',async()=>{
 const files=[...Object.keys(expected),...['library','articles','knowledge'].map(n=>n+'/app.bundle.mjs'),'hukamnama/reader.bundle.mjs'];
 const before=await Promise.all(files.map(read));
 assert.equal((await buildAppBundles({write:false})).status,'PASS');
 assert.equal((await refreshAppSRI({write:false})).status,'PASS');
 const after=await Promise.all(files.map(read));
 assert.deepEqual(after,before);
});

test('Loader policy refuses missing, extra, inline, duplicate, reordered, async and foreign scripts',async()=>{
 for(const name of ['index.html','breathing.html','articles/index.html','knowledge/index.html','hukamnama/index.html']){
  const policy=APP_SCRIPT_POLICY.find(p=>p.page===name),html=(await read(name)).toString(),list=tags(html);
  const first=list[0];
  const mutations=[
   html.replace(first,''),
   html.replace('</body>','<script src="unreviewed.js"></script></body>'),
   html.replace(first,'<script>window.__unreviewed=true;</script>'),
   html.replace(first,first+first),
   html.replace(first,first.replace('<script ','<script async ')),
   html.replace(first,first.replace('src="','src="https://example.invalid/')),
   html.replace(first,first.replace('src="','src="../unreviewed/'))
  ];
  if(list.length>1)mutations.push(html.replace(first,'__FIRST__').replace(list[1],first).replace('__FIRST__',list[1]));
  if(first.includes('type="module"'))mutations.push(html.replace(first,first.replace('type="module"','type="text/javascript"')));
  if(first.includes('defer'))mutations.push(html.replace(first,first.replace(/\sdefer/,'')));
  for(const mutated of mutations)await assert.rejects(()=>pinAppHTML(mutated,policy,read),undefined,name+' must refuse changed execution policy');
 }
});

test('Bundling rejects unexpected dependencies and unresolved dynamic executable loading',async()=>{
 const original=(await read('library/core.mjs')).toString();
 for(const addition of [
  '\nimport "./unreviewed-extra.mjs";\n',
  '\nimport "https://example.invalid/unreviewed.mjs";\n',
  '\nconst unknown=globalThis.__syntheticModule; import(unknown);\n'
 ])await assert.rejects(()=>buildAppBundle('library',{overrides:{'library/core.mjs':original+addition}}));
});

test('Extra HTML and stale source cannot silently pass default checks',async()=>{
 const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'glp-script-contract-'));
 try{
  const files=execFileSync('git',['ls-tree','-r','--name-only',baseline],{cwd:root,encoding:'utf8'}).trim().split('\n').filter(n=>!n.startsWith('evidence/'));
  for(const name of [...files,...['passage-ui.mjs','passages.mjs','passage-contracts.mjs','search.mjs','kinds.mjs','complete-passages.json'].map(n=>'library/'+n),'tools/script-integrity/app-graphs.json',...['library','articles','knowledge'].map(n=>n+'/app.bundle.mjs'),...['index.html','reader.mjs','reader.bundle.mjs','core.mjs','delivery.mjs','learning.mjs','json.mjs','publication-key.mjs','style.css'].map(n=>'hukamnama/'+n)]){
   let bytes;try{bytes=await read(name);}catch(error){if(error.code==='ENOENT')continue;throw error;}
   const destination=path.join(fixture,name);await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,bytes);
  }
  // Positive control: the complete copied fixture passes before any mutation.
  assert.equal((await buildAppBundle('library',{directory:fixture})).code,(await read('library/app.bundle.mjs')).toString());
  assert.equal((await refreshAppSRI({directory:fixture,write:false})).status,'PASS');
  await fs.writeFile(path.join(fixture,'unreviewed.html'),'<script src="js/home.js"></script>');
  await assert.rejects(()=>refreshAppSRI({directory:fixture,write:false}),/Production HTML inventory differs/);
  await fs.unlink(path.join(fixture,'unreviewed.html'));
  const fixturePage=path.join(fixture,'index.html'),validHTML=await fs.readFile(fixturePage,'utf8');
  const wrongPin=validHTML.replace(/integrity="sha384-[^"]+"/,'integrity="sha384-'+Buffer.alloc(48).toString('base64')+'"');
  assert.notEqual(wrongPin,validHTML);
  await fs.writeFile(fixturePage,wrongPin);
  assert.equal((await refreshAppSRI({directory:fixture,write:false})).status,'NEEDS_REFRESH');
  assert.equal(await fs.readFile(fixturePage,'utf8'),wrongPin,'checking a wrong pin does not silently bless it');
  await fs.writeFile(fixturePage,validHTML);
  const source=path.join(fixture,'library/core.mjs');
  await fs.appendFile(source,'\n// synthetic stale source\n');
  const before=await fs.readFile(path.join(fixture,'library/app.bundle.mjs'));
  await assert.rejects(()=>buildAppBundle('library',{directory:fixture}),/Frozen source bytes changed/);
  assert.deepEqual(await fs.readFile(path.join(fixture,'library/app.bundle.mjs')),before,'failed check never writes a replacement');
 }finally{await fs.rm(fixture,{recursive:true,force:true});}
});

test('A pinned bundle cannot retain secondary imports or recover an inline execution path',async()=>{
 const policy=APP_SCRIPT_POLICY.find(p=>p.page==='knowledge/index.html');
 const html=(await read(policy.page)).toString();
 for(const addition of [
  '\nimport "./extra.mjs";\n',
  '\nimport("./extra.mjs");\n',
  '\nexport * from "./extra.mjs";\n'
 ])await assert.rejects(()=>pinAppHTML(html,policy,async name=>{
  const original=await read(name);return name==='knowledge/app.bundle.mjs'?original.toString()+addition:original;
 }),/executable import/);
 for(const injection of [
  '<img src="x" onerror="window.__unreviewed=true">',
  '<a href="java&#x73;cript:window.__unreviewed=true">link</a>',
  '<iframe srcdoc="unreviewed"></iframe>',
  '<link rel="modulepreload" href="extra.mjs">'
 ])await assert.rejects(()=>pinAppHTML(html.replace('</body>',injection+'</body>'),policy,read));
});
