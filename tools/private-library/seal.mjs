#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {sealCollection,validatePin,MAX_PLAINTEXT_BYTES} from '../../private-library/app.mjs';

const decoder=new TextDecoder('utf-8',{fatal:true});
export async function assertOutsideGit(filename) {
  const real=await fs.realpath(filename),stat=await fs.stat(real);
  if(!stat.isFile())throw Error('Private input must be a regular file.');
  let directory=path.dirname(real);
  while(true){
    try{await fs.lstat(path.join(directory,'.git'));throw Error('Private input must remain outside every Git working tree.');}
    catch(error){if(error.code!=='ENOENT')throw error;}
    const parent=path.dirname(directory);if(parent===directory)break;directory=parent;
  }
  // Discard all Git environment overrides, including GIT_CONFIG_COUNT and worktree overrides.
  const env=Object.fromEntries(Object.entries(process.env).filter(([key])=>!key.startsWith('GIT_')));
  const check=spawnSync('git',['-C',path.dirname(real),'rev-parse','--is-inside-work-tree','--is-bare-repository'],{encoding:'utf8',env});
  if(check.error)throw Error('Git location checks are unavailable; no private input was read.');
  if(check.status===0)throw Error('Private input must remain outside every Git repository.');
  if(check.status!==128||!check.stderr.includes('not a git repository'))throw Error('Unable to establish that private input is outside Git.');
  return {real,stat};
}
async function readPinFile(filename) {
  const {real,stat}=await assertOutsideGit(filename);
  if(stat.size>2048)throw Error('PIN file is too large.');
  if(process.platform!=='win32'&&(stat.mode&0o077)!==0)throw Error('PIN file must be readable only by its owner (mode 0600).');
  const bytes=await fs.readFile(real);
  try{return validatePin(decoder.decode(bytes).replace(/\r?\n$/u,''));}finally{bytes.fill(0);}
}
async function hiddenPrompt(prompt) {
  if(!process.stdin.isTTY||!process.stdout.isTTY)throw Error('An interactive terminal or --pin-file outside Git is required.');
  process.stdout.write(prompt);process.stdin.setEncoding('utf8');process.stdin.setRawMode(true);process.stdin.resume();
  return await new Promise((resolve,reject)=>{
    let value='';
    const end=(error)=>{process.stdin.off('data',data);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');const answer=value;value='';error?reject(error):resolve(answer);};
    const data=chunk=>{
      for(const ch of chunk){
        if(ch==='\u0003'||ch==='\u0004'){end(Error('Cancelled.'));return;}
        if(ch==='\r'||ch==='\n'){end();return;}
        if(ch==='\u007f'||ch==='\b'){value=[...value].slice(0,-1).join('');continue;}
        if(ch.codePointAt(0)>=32&&value.length<257)value+=ch;
      }
    };
    process.stdin.on('data',data);
  });
}
export async function sealFile({input,output,pinFile,passphraseFile}) {
  if(pinFile&&passphraseFile)throw Error('Use one PIN file option only.');
  // The old filename option is an alias, not a bypass of the six-digit rule.
  const credentialFile=pinFile||passphraseFile;
  const {real,stat}=await assertOutsideGit(input);
  if(stat.size>MAX_PLAINTEXT_BYTES)throw Error('Private collection exceeds the 12 MiB input limit.');
  const target=path.resolve(output);await fs.access(path.dirname(target));
  try{await fs.lstat(target);throw Error('Output already exists; use a new destination.');}catch(error){if(error.code!=='ENOENT')throw error;}
  let pin=credentialFile?await readPinFile(credentialFile):validatePin(await hiddenPrompt('New six-digit private-library PIN (hidden): '));
  if(!credentialFile){let repeated=await hiddenPrompt('Repeat six-digit PIN (hidden): ');const match=repeated===pin;repeated='';if(!match){pin='';throw Error('PINs did not match.');}}
  let plaintext;
  try{
    plaintext=await fs.readFile(real);
    if(plaintext.length>MAX_PLAINTEXT_BYTES)throw Error('Private collection exceeds the input limit.');
    let parsed;
    try{parsed=JSON.parse(decoder.decode(plaintext));}catch{throw Error('Private collection must be valid UTF-8 JSON.');}
    const envelope=await sealCollection(parsed,pin);
    await fs.writeFile(target,JSON.stringify(envelope)+'\n',{flag:'wx',mode:0o600});
    return {output:target,bytes:(await fs.stat(target)).size};
  }finally{pin='';plaintext?.fill(0);}
}
async function main(){
  const args=process.argv.slice(2),options={};
  if(args.length===1&&args[0]==='--help'){
    process.stdout.write('Usage: node tools/private-library/seal.mjs --input /outside/git/collection.json --output private-library/collection.enc.json [--pin-file /outside/git/pin.txt]\nNew collections require exactly six digits, including any leading zeros. PIN values are never accepted as arguments or environment variables. Without a file, an interactive hidden prompt is used. --passphrase-file is a deprecated filename alias and still requires a six-digit PIN.\n');return;
  }
  for(let i=0;i<args.length;i+=2){
    const key={'--input':'input','--output':'output','--pin-file':'pinFile','--passphrase-file':'passphraseFile'}[args[i]];
    if(!key||options[key]||!args[i+1]||args[i+1].startsWith('--'))throw Error('Invalid arguments. Use --help for the supported file options.');
    options[key]=args[i+1];
  }
  if(!options.input||!options.output)throw Error('Both --input and --output are required.');
  const result=await sealFile(options);
  process.stdout.write(`Encrypted collection written (${result.bytes} bytes). No plaintext or PIN was written to the output.\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(error=>{process.stderr.write(`Private collection refused: ${error.message}\n`);process.exitCode=1;});
