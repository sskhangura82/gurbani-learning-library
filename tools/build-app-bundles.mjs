// Private compiler dependencies live under tools/script-integrity, never at runtime.
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {buildAppBundles} from './script-integrity/build.mjs';
export {buildAppBundle,buildAppBundles} from './script-integrity/build.mjs';
export {APP_GRAPHS,BUILD_OPTIONS,GRAPH_MANIFEST,TOOL_VERSIONS} from './script-integrity/policy.mjs';
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){
  try{
    const args=process.argv.slice(2);
    if(args.length>1||args.some(a=>!['--check','--write'].includes(a)))throw Error('Use --check (default, no writes) or --write');
    const result=await buildAppBundles({write:args.includes('--write')});
    console.log(JSON.stringify(result));if(result.status!=='PASS')process.exitCode=1;
  }catch(error){console.error(error.message);process.exitCode=1;}
}
