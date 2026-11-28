import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {syncBuiltinESMExports} from 'node:module';
const original=fs.writeFileSync;
const source=process.env.GLP_AUDIT_SOURCE;
const output=process.env.GLP_AUDIT_OUTPUT;
fs.writeFileSync=function(file,data,options){
  const name=file instanceof URL?fileURLToPath(file):path.resolve(String(file));
  const base=path.join(source,'evidence')+path.sep;
  if(!name.startsWith(base))throw Error('Unexpected test write refused: '+name);
  const target=path.join(output,'reports',path.relative(base,name));
  fs.mkdirSync(path.dirname(target),{recursive:true});
  return original.call(fs,target,data,options);
};
syncBuiltinESMExports();
