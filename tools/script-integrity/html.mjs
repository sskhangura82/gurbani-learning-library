import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {APP_GRAPHS,APP_SCRIPT_POLICY,EXCLUDED_HTML_ROOTS} from './policy.mjs';
import {DEFAULT_DIRECTORY,buildAppBundles} from './build.mjs';
import {inspectModule} from './javascript.mjs';

export {APP_SCRIPT_POLICY,EXCLUDED_HTML_ROOTS};
const digest=(bytes,algorithm)=>algorithm+'-'+createHash(algorithm).update(bytes).digest('base64');
const own=(o,key)=>Object.hasOwn(o,key);

export async function inspectProductionHTMLInventory(directory=DEFAULT_DIRECTORY){
  const found=[];
  async function walk(relative=''){
    const entries=await fs.readdir(path.join(directory,relative),{withFileTypes:true});
    for(const entry of entries){
      if(entry.name==='.git'||entry.name==='node_modules')continue;
      const name=relative?relative+'/'+entry.name:entry.name;
      if(EXCLUDED_HTML_ROOTS.some(e=>name===e.path.slice(0,-1)||name.startsWith(e.path)))continue;
      if(entry.isSymbolicLink())throw Error('Uninventoried symbolic link: '+name);
      if(entry.isDirectory())await walk(name);
      else if(/\.(?:html?|xhtml)$/i.test(name))found.push(name);
    }
  }
  await walk();
  const expected=APP_SCRIPT_POLICY.map(p=>p.page).sort(),actual=found.sort();
  if(JSON.stringify(actual)!==JSON.stringify(expected)){
    const missing=expected.filter(p=>!actual.includes(p)),extra=actual.filter(p=>!expected.includes(p));
    throw Error('Production HTML inventory differs: '+JSON.stringify({missing,extra}));
  }
  return {pages:actual,excludedRoots:EXCLUDED_HTML_ROOTS};
}

function maskedComments(html){
  return html.replace(/<!--[\s\S]*?(?:-->|$)/g,comment=>{
    if(!comment.endsWith('-->'))throw Error('Unclosed HTML comment');
    return comment.replace(/[^\r\n]/g,' ');
  });
}
function readTag(html,start){
  let quote=null;
  for(let i=start+1;i<html.length;i++){
    const ch=html[i];
    if(quote){if(ch===quote)quote=null;}
    else if(ch==='"'||ch==="'")quote=ch;
    else if(ch==='>')return {raw:html.slice(start,i+1),end:i+1};
    else if(ch==='<')throw Error('Malformed nested HTML tag');
  }
  throw Error('Unclosed HTML tag');
}
function attributes(raw,name){
  let body=raw.slice(1+name.length,-1),selfClosing=false;
  if(/\/\s*$/.test(body)){selfClosing=true;body=body.replace(/\/\s*$/,'');}
  const attrs=Object.create(null);
  let offset=0;
  while(offset<body.length){
    const whitespace=/^\s+/.exec(body.slice(offset));
    if(!whitespace)throw Error('Malformed '+name+' attributes');
    offset+=whitespace[0].length;
    if(offset===body.length)break;
    const key=/^[A-Za-z_:][A-Za-z0-9_:.-]*/.exec(body.slice(offset));
    if(!key)throw Error('Malformed '+name+' attribute name');
    const originalKey=key[0],normalized=originalKey.toLowerCase();offset+=originalKey.length;
    if(own(attrs,normalized))throw Error('Duplicate '+name+' attribute: '+normalized);
    let cursor=offset;while(/\s/.test(body[cursor]||'')&&cursor<body.length)cursor++;
    let value=null;
    if(body[cursor]==='='){
      cursor++;while(/\s/.test(body[cursor]||'')&&cursor<body.length)cursor++;
      const q=body[cursor];
      if(q==='"'||q==="'"){
        const end=body.indexOf(q,cursor+1);if(end<0)throw Error('Unclosed attribute value');
        value=body.slice(cursor+1,end);offset=end+1;
      }else{
        const token=/^[^\s"'\x60=<>]+/.exec(body.slice(cursor));
        if(!token)throw Error('Missing attribute value');
        value=token[0];offset=cursor+token[0].length;
      }
    }
    attrs[normalized]=value;
  }
  return {attrs,selfClosing};
}
function decodedAttribute(value){
  return String(value??'').replace(/&#(x[0-9a-f]+|[0-9]+);?/gi,(_,n)=>{
    const cp=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):parseInt(n,10);
    return cp>0&&cp<=0x10ffff?String.fromCodePoint(cp):'';
  }).replace(/&colon;/gi,':').replace(/&tab;/gi,'\t').replace(/&newline;/gi,'\n');
}
export function inspectHTMLScripts(html,page='HTML'){
  const masked=maskedComments(html),scripts=[],open=/<([a-z][a-z0-9:-]*)(?=[\s/>])/gi;
  let match;
  while((match=open.exec(masked))){
    const name=match[1].toLowerCase(),tag=readTag(masked,match.index),{attrs,selfClosing}=attributes(tag.raw,match[1]);
    for(const [key,value] of Object.entries(attrs)){
      if(/^on[a-z]/.test(key)||key==='srcdoc')throw Error(page+': inline event or embedded HTML loader is forbidden');
      const normalized=decodedAttribute(value).replace(/[\u0000-\u0020]/g,'').toLowerCase();
      if(normalized.startsWith('javascript:'))throw Error(page+': executable URL is forbidden');
    }
    if(['base','iframe','object','embed'].includes(name))throw Error(page+': unapproved page or embedded loader');
    if(name==='meta'&&String(attrs['http-equiv']).toLowerCase()==='refresh')throw Error(page+': refresh loader is forbidden');
    if(name==='link'){
      const rel=String(attrs.rel??'').toLowerCase().split(/\s+/);
      if(rel.includes('modulepreload')||rel.includes('import')||(rel.includes('preload')&&String(attrs.as).toLowerCase()==='script'))
        throw Error(page+': unapproved executable preload');
    }
    if(name==='script'){
      if(selfClosing)throw Error(page+': self-closing script is forbidden');
      const tail=masked.slice(tag.end),closing=/^([\s\S]*?)<\/script\s*>/i.exec(tail);
      if(!closing)throw Error(page+': unclosed script');
      if(html.slice(tag.end,tag.end+closing[1].length).trim())throw Error(page+': inline script is forbidden');
      const end=tag.end+closing[0].length;
      scripts.push({attrs,start:match.index,end,raw:html.slice(match.index,end)});
      open.lastIndex=end;
    }else open.lastIndex=tag.end;
  }
  // Refuse malformed spellings that the narrow tag scanner did not accept.
  const openings=[...masked.matchAll(/<script\b/gi)];
  if(openings.length!==scripts.length)throw Error(page+': malformed script tag');
  return scripts;
}
function targetPath(page,src){
  const relative=path.posix.normalize(path.posix.join(path.posix.dirname(page),src));
  if(relative.startsWith('../')||path.posix.isAbsolute(relative))throw Error('Script escapes the application tree');
  return relative;
}
async function pinPolicyHTML(html,policy,readScript,{allowSourceEntries=false}={}){
  const canonical=policy&&APP_SCRIPT_POLICY.find(p=>p.page===policy.page);
  if(!canonical||policy.algorithm!==canonical.algorithm||policy.reader!==canonical.reader||JSON.stringify(policy.scripts)!==JSON.stringify(canonical.scripts))throw Error('Unknown or altered HTML policy');
  const scripts=inspectHTMLScripts(html,policy.page);
  if(scripts.length!==policy.scripts.length)throw Error(policy.page+': unexpected script count');
  const replacements=[];
  for(let i=0;i<scripts.length;i++){
    const tag=scripts[i],expected=policy.scripts[i],a=tag.attrs;
    if(Object.keys(a).some(k=>!['src','type','defer','integrity','crossorigin'].includes(k)))throw Error(policy.page+': unapproved script attribute');
    if(a.src!==expected.src&&!(allowSourceEntries&&expected.type==='module'&&a.src===expected.sourceSrc))throw Error(policy.page+': unexpected, duplicate or reordered script');
    if(expected.type==='module' ? a.type!=='module' : own(a,'type'))throw Error(policy.page+': script type changed');
    if(own(a,'defer')!==expected.defer||(expected.defer&&a.defer!==null))throw Error(policy.page+': script scheduling changed');
    if(own(a,'crossorigin')&&a.crossorigin!=='anonymous')throw Error(policy.page+': unsupported crossorigin');
    if(own(a,'integrity')&&(typeof a.integrity!=='string'||!/^sha(?:256|384|512)-[A-Za-z0-9+/]+={0,2}$/.test(a.integrity)))throw Error(policy.page+': malformed integrity');
    const relative=targetPath(policy.page,expected.src),bytes=await readScript(relative);
    if(expected.type==='module')inspectModule(typeof bytes==='string'?bytes:new TextDecoder('utf-8',{fatal:true}).decode(bytes),{file:relative,closed:true});
    const integrity=digest(bytes,policy.algorithm);
    const after='<script'+(expected.type==='module'?' type="module"':'')+' src="'+expected.src+'"'+(expected.defer?' defer':'')+' integrity="'+integrity+'" crossorigin="anonymous"></script>';
    if(policy.reader&&tag.raw!==after)throw Error(policy.page+': frozen reader pin/tag differs; this tool cannot rewrite it');
    replacements.push({...tag,after});
  }
  let next=html;
  for(const change of replacements.reverse())next=next.slice(0,change.start)+change.after+next.slice(change.end);
  return next;
}

/**
 * Policy form: pinAppHTML(html, policy, readScript).
 * Fixture form: pinAppHTML(html, {appId, code, page?, directory?}).
 * Both return a string, never write. Fixture pinning is explicit and isolated.
 */
export async function pinAppHTML(html,policyOrFixture,readScript){
  if(policyOrFixture?.appId){
    const {appId,code,directory=DEFAULT_DIRECTORY}=policyOrFixture;
    if(!own(APP_GRAPHS,appId)||typeof code!=='string')throw Error('Invalid fixture application/code');
    const page=policyOrFixture.page??({knowledge:'knowledge/index.html',library:'index.html',articles:'articles/article.html',hukamnama:'hukamnama/index.html'})[appId];
    const policy=APP_SCRIPT_POLICY.find(p=>p.page===page);
    if(!policy||!policy.scripts.some(s=>s.appId===appId))throw Error('Fixture page/application mismatch');
    return pinPolicyHTML(html,policy,relative=>relative===APP_GRAPHS[appId].output?code:fs.readFile(path.join(directory,relative)));
  }
  if(typeof readScript!=='function')throw Error('A script reader is required');
  return pinPolicyHTML(html,policyOrFixture,readScript);
}

export async function refreshAppSRI({directory=DEFAULT_DIRECTORY,write=false}={}){
  const inventory=await inspectProductionHTMLInventory(directory);
  const bundles=await buildAppBundles({directory});
  if(bundles.status!=='PASS')throw Error('Bundles or graph manifest are stale; explicitly build them before refreshing pins');
  const plans=[];
  for(const policy of APP_SCRIPT_POLICY){
    const file=path.join(directory,policy.page),before=await fs.readFile(file,'utf8');
    const after=await pinPolicyHTML(before,policy,relative=>fs.readFile(path.join(directory,relative)),{allowSourceEntries:write});
    plans.push({page:policy.page,file,before,after,reader:policy.reader});
  }
  const changed=plans.filter(p=>p.before!==p.after);
  if(write)for(const plan of changed){
    if(plan.reader)throw Error('Reader HTML cannot be rewritten');
    await fs.writeFile(plan.file,plan.after);
  }
  return {
    status:write||!changed.length?'PASS':'NEEDS_REFRESH',mode:write?'write':'check',
    pages:inventory.pages.length,scriptOccurrences:APP_SCRIPT_POLICY.reduce((n,p)=>n+p.scripts.length,0),
    moduleOccurrences:APP_SCRIPT_POLICY.flatMap(p=>p.scripts).filter(s=>s.type==='module').length,
    changedPages:changed.map(p=>p.page),
    scope:'Subresource protection under trusted HTML; HTML and worker authenticity remain outside this check.'
  };
}
