// Reader-page subresource pins. This does not authenticate the served HTML or worker.
// Check by default. After reviewing an executable change, refresh explicitly with --write.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const nitnem=['appearance.js','continuous-core.js','learning/learning-ui.js','local-learning.js','reader.js','offline.js'];
export const READER_SCRIPT_POLICY=Object.freeze([
 {page:'nitnem/index.html',algorithm:'sha384',scripts:nitnem},
 {page:'full-japji.html',algorithm:'sha384',scripts:['js/source-integrity.js','js/japji-full-data.js','js/content.js','js/gurdwaras.js','js/continuous-core.js','js/learning.js','js/shared-learning.js','js/japji-lessons.js','js/line-meanings.js','js/japji-full.js','js/pwa.js']},
 {page:'sukhmani.html',algorithm:'sha384',scripts:['js/source-integrity.js','js/sukhmani-data.js','js/sukhmani-teaching.js','js/sukhmani-learning.js','js/shared-learning.js','js/sukhmani-reader.js','js/pwa.js']},
 {page:'salok-mahalla9/index.html',algorithm:'sha256',scripts:nitnem.map(s=>'../nitnem/'+s)},
 {page:'salok-kabir/index.html',algorithm:'sha256',scripts:nitnem.map(s=>'../nitnem/'+s)},
 {page:'salok-farid/index.html',algorithm:'sha256',scripts:nitnem.map(s=>'../nitnem/'+s)}
].map(p=>Object.freeze({...p,scripts:Object.freeze([...p.scripts])})));
// Existing frozen verifier/source pins are checked, never regenerated to bless changed content.
const fixedSourcePins=Object.freeze({
 'js/source-integrity.js':'sha384-4wtGx8ehIEsARvunp+qghj8zOBiENZwLczb7zPw5O+32ci3bJEnC/5+sz8CklTUI',
 'js/japji-full-data.js':'sha384-3hnUzcWx/ddEEuVHebSyjwiVDrAf7uzSB2LRCr81zIjX7y/HrqRyIspnOI+m24JA',
 'js/sukhmani-data.js':'sha384-abNkrv6ILVMVvPLWbGaOmM8DVWSAAbfhNsGBhGg+8n6w/Wi92BwM1UB7bFyWqRNo'
});
export async function pinReaderHTML(html,policy,readScript){
 const openings=[...html.matchAll(/<script\b/gi)];
 const tags=[...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi)];
 if(openings.length!==tags.length || tags.length!==policy.scripts.length)throw Error(policy.page+': unexpected script count or malformed script');
 const replacements=[];
 for(let i=0;i<tags.length;i++){
  const tag=tags[i],m=tag[0].match(/^<script\s+src="([^"]+)"(?:\s+integrity="([^"]*)")?(?:\s+crossorigin="anonymous")?\s*><\/script>$/);
  if(!m || m[1]!==policy.scripts[i])throw Error(policy.page+': unexpected, inline, module or reordered script at '+(i+1));
  const relative=path.posix.normalize(path.posix.join(path.posix.dirname(policy.page),m[1]));
  if(relative.startsWith('../') || path.posix.isAbsolute(relative))throw Error('Script escapes the reader tree');
  const digest=policy.algorithm+'-'+createHash(policy.algorithm).update(await readScript(relative)).digest('base64');
  if(fixedSourcePins[relative] && digest!==fixedSourcePins[relative])throw Error('Frozen source/verifier bytes changed: '+relative);
  replacements.push({before:tag[0],after:'<script src="'+m[1]+'" integrity="'+digest+'" crossorigin="anonymous"></script>'});
 }
 let next=html;
 for(const change of replacements)next=next.replace(change.before,change.after);
 return next;
}
export async function refreshReaderSRI({directory=root,write=false}={}){
 const plans=[];
 for(const policy of READER_SCRIPT_POLICY){
  const file=path.join(directory,policy.page),before=await fs.readFile(file,'utf8');
  const after=await pinReaderHTML(before,policy,relative=>fs.readFile(path.join(directory,relative)));
  plans.push({page:policy.page,file,before,after});
 }
 // Validate every page and frozen source pin before writing any page.
 const changed=plans.filter(p=>p.before!==p.after);
 if(write)for(const p of changed)await fs.writeFile(p.file,p.after);
 return {status:write||!changed.length?'PASS':'NEEDS_REFRESH',mode:write?'write':'check',pages:plans.length,scriptOccurrences:READER_SCRIPT_POLICY.reduce((n,p)=>n+p.scripts.length,0),changedPages:changed.map(p=>p.page),scope:'Six reader pages only; trusted HTML, worker and library module graph remain outside this check.'};
}
if(process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
 try{
  const args=process.argv.slice(2);
  if(args.some(a=>!['--check','--write'].includes(a)) || args.length>1)throw Error('Use --check (default, no writes) or --write');
  const result=await refreshReaderSRI({write:args.includes('--write')});
  console.log(JSON.stringify(result));if(result.status!=='PASS')process.exitCode=1;
 }catch(error){console.error(error.message);process.exitCode=1;}
}
