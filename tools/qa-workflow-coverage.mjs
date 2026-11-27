import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Deliberately supports the repository's block-style trigger subset, not YAML
// in general. An unrecognised shape is a refusal, never assumed coverage.
export function inspectCandidateTrigger(text){
 if(typeof text!=='string')throw new Error('Workflow text is required.');
 const lines=text.split(/\r?\n/),starts=[];
 for(let i=0;i<lines.length;i++)if(/^on:\s*$/.test(lines[i]))starts.push(i);
 const onKeys=lines.filter(line=>/^["']?on["']?\s*:/.test(line));
 if(starts.length!==1||onKeys.length!==1)throw new Error('Expected one plain block-style on trigger.');
 const start=starts[0]+1;
 let end=start;
 while(end<lines.length&&(!lines[end].trim()||/^\s|^#/.test(lines[end])))end++;
 const trigger=lines.slice(start,end),pr=[];
 for(let i=0;i<trigger.length;i++)if(/^  pull_request:\s*$/.test(trigger[i]))pr.push(i);
 if(pr.length!==1)throw new Error('Expected one plain block-style pull_request trigger.');
 const begin=pr[0]+1;
 let finish=begin;
 while(finish<trigger.length&&!/^  \S/.test(trigger[finish]))finish++;
 const body=trigger.slice(begin,finish),fields=new Set();let active=null,items=0;
 for(const line of body){
  if(!line.trim()||/^\s*#/.test(line))continue;
  if(/^    ["']?branches(?:-ignore)?["']?\s*:/.test(line))throw new Error('Pull-request base branches are filtered.');
  const field=/^    (paths|paths-ignore):\s*$/.exec(line);
  if(field){
   if(active!==null&&items===0)throw new Error('Empty path filter is unsupported.');
   if(fields.has(field[1]))throw new Error('Duplicate path filter is unsupported.');
   fields.add(field[1]);active=field[1];items=0;continue;
  }
  if(active&&/^      -\s+\S/.test(line)){items++;continue;}
  throw new Error('Unsupported pull_request trigger shape; coverage needs review.');
 }
 if(active!==null&&items===0)throw new Error('Empty path filter is unsupported.');
 // Inline/quoted/duplicate pull_request keys and aliases must not evade the
 // supported plain-key block above. The event body cannot contain a new key.
 const aliases=trigger.filter(line=>/^  ["']?pull_request["']?\s*:/.test(line));
 if(aliases.length!==1)throw new Error('Duplicate or unsupported pull_request key.');
 return {allBaseBranches:true,pathFilters:[...fields]};
}

export async function inspectQualityWorkflows(root){
 const directory=path.join(root,'.github/workflows');
 const names=(await fs.readdir(directory)).filter(name=>/-qa\.yml$/.test(name)).sort();
 if(!names.length)throw new Error('No quality workflows found.');
 const results=[];
 for(const name of names){
  try{results.push({path:'.github/workflows/'+name,...inspectCandidateTrigger(await fs.readFile(path.join(directory,name),'utf8'))});}
  catch(error){throw new Error(name+': '+error.message);}
 }
 return results;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 inspectQualityWorkflows(fileURLToPath(new URL('../',import.meta.url))).then(results=>console.log(JSON.stringify({scope:'QA pull-request base-branch coverage only; path conditions retained',workflows:results},null,2))).catch(error=>{console.error(error.message);process.exitCode=1;});
}
