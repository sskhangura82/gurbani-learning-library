import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import * as esbuild from 'esbuild';
import {APP_GRAPHS,BASELINE_COMMIT,BUILD_OPTIONS,GRAPH_MANIFEST,TOOL_VERSIONS} from './policy.mjs';
import {inspectModule} from './javascript.mjs';

export const DEFAULT_DIRECTORY=fileURLToPath(new URL('../../',import.meta.url));
const sha=(bytes,algorithm='sha256',encoding='hex')=>createHash(algorithm).update(bytes).digest(encoding);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sorted=a=>[...a].sort();
const decode=bytes=>new TextDecoder('utf-8',{fatal:true}).decode(bytes);
function normalPath(value){return value.split(path.sep).join('/');}
function normalizeOverrides(overrides){
  if(overrides instanceof Map)return Object.fromEntries(overrides);
  if(!overrides||typeof overrides!=='object'||Array.isArray(overrides))throw Error('Overrides must be a path-to-source object or Map');
  return overrides;
}

/** In-memory only. Overrides are explicit synthetic-fixture source inputs. */
export async function buildAppBundle(appId,{directory=DEFAULT_DIRECTORY,overrides={}}={}){
  if(!Object.hasOwn(APP_GRAPHS,appId))throw Error('Unknown application: '+appId);
  if(esbuild.version!==TOOL_VERSIONS.esbuild)throw Error('Unexpected esbuild version');
  const policy=APP_GRAPHS[appId],root=await fs.realpath(directory),replacement=normalizeOverrides(overrides);
  for(const name of Object.keys(replacement))if(!Object.hasOwn(policy.inputs,name))throw Error('Unapproved fixture input: '+name);
  const snapshot=new Map(),inputRecords=[];
  for(const name of sorted(Object.keys(policy.inputs))){
    const file=path.join(root,name),stat=await fs.lstat(file);
    if(!stat.isFile()||stat.isSymbolicLink())throw Error('Source must be a regular file: '+name);
    const original=await fs.readFile(file);
    if(sha(original)!==policy.inputs[name])throw Error('Frozen source bytes changed: '+name);
    const value=Object.hasOwn(replacement,name)?replacement[name]:original;
    if(typeof value!=='string'&&!(value instanceof Uint8Array))throw Error('Fixture source must be text or bytes: '+name);
    const bytes=typeof value==='string'?Buffer.from(value):Buffer.from(value),code=decode(bytes);
    const imports=inspectModule(code,{file:name});
    if(!same(imports.map(i=>[i.kind,i.path]),policy.imports[name]))throw Error('Dependency graph changed: '+name);
    snapshot.set(name,{code,bytes});
    inputRecords.push({path:name,bytes:bytes.length,sha256:sha(bytes),imports:imports.map(({kind,path})=>({kind,path}))});
  }
  const result=await esbuild.build({
    ...BUILD_OPTIONS,absWorkingDir:root,entryPoints:[policy.entry],outfile:policy.output,
    write:false,metafile:true,logLevel:'silent',plugins:[{
      name:'frozen-source-snapshot',
      setup(build){
        build.onLoad({filter:/.*/,namespace:'file'},args=>{
          const name=normalPath(path.relative(root,args.path));
          if(!snapshot.has(name))throw Error('Compiler requested an unapproved source: '+name);
          return {contents:snapshot.get(name).code,loader:'js',resolveDir:path.dirname(args.path)};
        });
      }
    }]
  });
  if(result.warnings.length)throw Error('Compiler warning: '+result.warnings.map(w=>w.text).join('; '));
  if(result.errors.length)throw Error('Compiler reported errors');
  if(!same(sorted(Object.keys(result.metafile.inputs)),sorted(Object.keys(policy.inputs))))throw Error('Compiler input closure differs from policy');
  for(const [name,input] of Object.entries(result.metafile.inputs)){
    if(input.imports.some(i=>i.external))throw Error('External compiler input: '+name);
    const imports=input.imports.map(i=>[i.kind,i.path]);
    if(!same(imports,policy.imports[name]))throw Error('Compiler dependency graph differs from parsed source: '+name);
  }
  if(!same(Object.keys(result.metafile.outputs),[policy.output])||result.outputFiles.length!==1)throw Error('Expected exactly one executable bundle');
  const output=result.metafile.outputs[policy.output];
  if(output.imports.length||output.cssBundle||output.entryPoint!==policy.entry)throw Error('Output is not a closed application entry');
  const generated=result.outputFiles[0];
  if(normalPath(path.relative(root,generated.path))!==policy.output)throw Error('Unexpected output path');
  const code=decode(generated.contents);
  inspectModule(code,{file:policy.output,closed:true});
  if(/sourceMappingURL\s*=/.test(code))throw Error('Source maps are outside this output contract');
  const graph={
    appId,entry:policy.entry,mode:Object.keys(replacement).length?'synthetic-fixture':'production',
    inputs:inputRecords,
    output:{path:policy.output,bytes:generated.contents.length,sha256:sha(generated.contents),integrity:'sha384-'+sha(generated.contents,'sha384','base64'),imports:[]}
  };
  return {code,outputPath:policy.output,graph};
}

/** Check by default; explicit writes occur only after every app has validated. */
export async function buildAppBundles({directory=DEFAULT_DIRECTORY,write=false}={}){
  const results=[];
  for(const appId of Object.keys(APP_GRAPHS))results.push(await buildAppBundle(appId,{directory}));
  const manifest={
    schema:'glp.app-script-graphs.v1',baseline:BASELINE_COMMIT,
    tools:TOOL_VERSIONS,options:BUILD_OPTIONS,apps:results.map(r=>r.graph)
  };
  const plans=results.map(r=>({path:r.outputPath,bytes:Buffer.from(r.code)}));
  plans.push({path:GRAPH_MANIFEST,bytes:Buffer.from(JSON.stringify(manifest,null,2)+'\n')});
  const changed=[];
  for(const plan of plans){
    let previous;
    try{
      const target=path.join(directory,plan.path),stat=await fs.lstat(target);
      if(!stat.isFile()||stat.isSymbolicLink())throw Error('Generated output must be a regular file: '+plan.path);
      previous=await fs.readFile(target);
    }catch(error){if(error.code!=='ENOENT')throw error;}
    if(!previous||!previous.equals(plan.bytes))changed.push(plan);
  }
  if(write)for(const plan of changed)await fs.writeFile(path.join(directory,plan.path),plan.bytes);
  return {
    status:write||!changed.length?'PASS':'NEEDS_REFRESH',mode:write?'write':'check',
    applications:results.length,changedFiles:changed.map(p=>p.path),
    sourceInputs:results.reduce((sum,r)=>sum+r.graph.inputs.length,0)
  };
}
