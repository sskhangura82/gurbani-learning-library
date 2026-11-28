import path from 'node:path';
import {parse,version} from 'acorn';
import {TOOL_VERSIONS,YOUTUBE_SCRIPT_CAPABILITY} from './policy.mjs';

function visit(node,fn,parent=null){
  if(!node||typeof node!=='object')return;
  if(typeof node.type==='string')fn(node,parent);
  for(const [key,value] of Object.entries(node)){
    if(key==='start'||key==='end'||key==='loc')continue;
    if(Array.isArray(value))for(const child of value)visit(child,fn,node);
    else if(value&&typeof value==='object')visit(value,fn,node);
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
  const provider=[YOUTUBE_SCRIPT_CAPABILITY.source,YOUTUBE_SCRIPT_CAPABILITY.output].includes(file)
    ? YOUTUBE_SCRIPT_CAPABILITY:null;
  const loaderCreations=[],loaderSources=[],parents=new WeakMap();
  // This is an exact additional capability, not a general dynamic-loader flag.
  // The surrounding complete source hash and compiler graph remain mandatory.
  visit(ast,(node,parent)=>{
    if(parent)parents.set(node,parent);
    if(node.type==='CallExpression'&&propertyName(node.callee)==='createElement'
      &&String(literalString(node.arguments[0])).toLowerCase()==='script')loaderCreations.push({node,parent});
    if(provider&&node.type==='AssignmentExpression'&&node.left.type==='MemberExpression'
      &&node.left.object.type==='Identifier'&&node.left.object.name===provider.variable
      &&propertyName(node.left)==='src')loaderSources.push(node);
    if(provider&&node.type==='CallExpression'&&propertyName(node.callee)==='setAttribute'
      &&node.callee.object?.type==='Identifier'&&node.callee.object.name===provider.variable)
      throw Error(file+': provider script attributes must use the fixed declarative loader');
    if(provider&&node.type==='AssignmentExpression'&&node.left.type==='Identifier'&&node.left.name===provider.variable)
      throw Error(file+': provider script element cannot be reassigned');
  });
  if(provider){
    const creation=loaderCreations[0],assignment=loaderSources[0];
    if(loaderCreations.length!==1||creation.parent?.type!=='VariableDeclarator'
      ||creation.parent.id.type!=='Identifier'||creation.parent.id.name!==provider.variable
      ||creation.node.callee.object?.type!=='Identifier'||creation.node.callee.object.name!=='document'
      ||creation.node.arguments.length!==1||literalString(creation.node.arguments[0])!=='script'
      ||loaderSources.length!==1||assignment.operator!=='='||literalString(assignment.right)!==provider.url)
      throw Error(file+': exact YouTube loader capability differs');
    // Keep the approved element local: no aliases, object spreads, reflective
    // writes or passing it to an arbitrary helper that could replace its URL.
    visit(ast,(node,parent)=>{
      if(node.type!=='Identifier'||node.name!==provider.variable)return;
      if(parent===creation.parent&&parent.id===node)return;
      if(parent?.type==='MemberExpression'&&parent.object===node&&!parent.computed){
        const property=propertyName(parent),use=parents.get(parent);
        if(['src','async','referrerPolicy'].includes(property)
          &&use?.type==='AssignmentExpression'&&use.left===parent&&use.operator==='='){
          const expected=property==='src'?provider.url:property==='async'?true:'strict-origin-when-cross-origin';
          if(use.right.type==='Literal'&&use.right.value===expected)return;
        }
        if(['addEventListener','removeEventListener','remove'].includes(property)
          &&use?.type==='CallExpression'&&use.callee===parent)return;
      }
      const callee=parent?.callee;
      if(parent?.type==='CallExpression'&&parent.arguments.length===1&&parent.arguments[0]===node
        &&callee?.type==='MemberExpression'&&!callee.computed&&propertyName(callee)==='append'
        &&callee.object.type==='MemberExpression'&&!callee.object.computed&&propertyName(callee.object)==='head'
        &&callee.object.object.type==='Identifier'&&callee.object.object.name==='document')return;
      throw Error(file+': provider script element cannot escape its fixed loader');
    });
  }
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
        if(!provider||node!==loaderCreations[0]?.node)throw Error(file+': runtime script creation is outside this graph');
      if(['write','writeln','insertAdjacentHTML'].includes(member)&&node.arguments.some(a=>/<script\b|\bon\w+\s*=|javascript:/i.test(literalString(a)||'')))
        throw Error(file+': runtime executable HTML is outside this graph');
      if(['setTimeout','setInterval'].includes(direct)&&literalString(node.arguments[0])!==null)
        throw Error(file+': string timers are outside this graph');
    }
  });
  return imports;
}
