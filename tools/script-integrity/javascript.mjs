import path from 'node:path';
import {parse,version} from 'acorn';
import {TOOL_VERSIONS} from './policy.mjs';

function visit(node,fn){
  if(!node||typeof node!=='object')return;
  if(typeof node.type==='string')fn(node);
  for(const [key,value] of Object.entries(node)){
    if(key==='start'||key==='end'||key==='loc')continue;
    if(Array.isArray(value))for(const child of value)visit(child,fn);
    else if(value&&typeof value==='object')visit(value,fn);
  }
}
const propertyName=node=>node?.type==='MemberExpression'
  ? (node.computed ? node.property?.value : node.property?.name) : undefined;
const literalString=node=>node?.type==='Literal'&&typeof node.value==='string'?node.value:null;

/**
 * This is a closed-module policy, not a sandbox for arbitrary hostile JavaScript.
 * Frozen source hashes are checked separately. Parse both inputs and generated
 * output so comments/string examples cannot masquerade as executable imports.
 */
export function inspectModule(code,{file='module.mjs',closed=false}={}){
  if(version!==TOOL_VERSIONS.acorn)throw Error('Unexpected Acorn version');
  const ast=parse(code,{ecmaVersion:2022,sourceType:'module',allowHashBang:false});
  const imports=[];
  // The reviewed Knowledge module defines a local assertion helper named require.
  // It is not CommonJS. All other unbound require calls remain forbidden.
  const localRequire=ast.body.some(n=>n.type==='VariableDeclaration'&&n.declarations.some(d=>
    d.id.type==='Identifier'&&d.id.name==='require'&&d.init?.type==='ArrowFunctionExpression'&&d.init.params.length===2));
  visit(ast,node=>{
    let source=null,kind=null;
    if(node.type==='ImportDeclaration'||((node.type==='ExportNamedDeclaration'||node.type==='ExportAllDeclaration')&&node.source)){
      source=literalString(node.source);kind='import-statement';
      if(node.attributes?.length)throw Error(file+': import attributes are outside this graph');
    }else if(node.type==='ImportExpression'){
      source=literalString(node.source);kind='dynamic-import';
      if(node.options)throw Error(file+': dynamic import options are outside this graph');
    }
    if(kind){
      if(closed)throw Error(file+': generated bundle retains an executable import');
      if(!source||!source.startsWith('./')||/[?#\\]/.test(source))throw Error(file+': only literal same-directory imports are allowed');
      const resolved=path.posix.normalize(path.posix.join(path.posix.dirname(file),source));
      if(path.posix.dirname(resolved)!==path.posix.dirname(file))throw Error(file+': import escapes its application');
      imports.push({kind,path:resolved,original:source});
    }
    if(node.type==='CallExpression'||node.type==='NewExpression'){
      const direct=node.callee?.type==='Identifier'?node.callee.name:undefined;
      const member=propertyName(node.callee);
      if(['eval','Function','Worker','SharedWorker','importScripts'].includes(direct)||['eval','Function','Worker','SharedWorker','importScripts'].includes(member))
        throw Error(file+': dynamic evaluation or worker loading is outside this graph');
      if((direct==='require'&&!localRequire)||member==='require')throw Error(file+': unbound require is outside this graph');
      if(member==='createElement'&&String(literalString(node.arguments[0])).toLowerCase()==='script')
        throw Error(file+': runtime script creation is outside this graph');
      if(['write','writeln','insertAdjacentHTML'].includes(member)&&node.arguments.some(a=>/<script\b|\bon\w+\s*=|javascript:/i.test(literalString(a)||'')))
        throw Error(file+': runtime executable HTML is outside this graph');
      if(['setTimeout','setInterval'].includes(direct)&&literalString(node.arguments[0])!==null)
        throw Error(file+': string timers are outside this graph');
    }
  });
  return imports;
}
