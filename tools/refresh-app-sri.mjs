import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {refreshAppSRI} from './script-integrity/html.mjs';
export {APP_SCRIPT_POLICY,EXCLUDED_HTML_ROOTS,pinAppHTML,refreshAppSRI,inspectHTMLScripts,inspectProductionHTMLInventory} from './script-integrity/html.mjs';
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
  try{
    const args=process.argv.slice(2);
    if(args.length>1||args.some(a=>!['--check','--write'].includes(a)))throw Error('Use --check (default, no writes) or --write');
    const result=await refreshAppSRI({write:args.includes('--write')});
    console.log(JSON.stringify(result));if(result.status!=='PASS')process.exitCode=1;
  }catch(error){console.error(error.message);process.exitCode=1;}
}
