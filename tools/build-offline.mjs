// Regenerate hashes only after the complete static release is in place.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const file=path.join(root,'sw.js'),source=fs.readFileSync(file,'utf8');
const previous=JSON.parse(source.match(/const EXPECTED=(\{[^\n]+\});/)[1]);
const additions=['./nitnem/','./nitnem/index.html','./nitnem/reader.js','./nitnem/reader.css','./nitnem/continuous-core.js','./nitnem/appearance.js','./nitnem/appearance.css','./nitnem/local-learning.js','./nitnem/offline.js','./nitnem/learning/learning-ui.js','./nitnem/learning/course.complete.json','./nitnem/data/library.json',...['jaap','savaiye','chaupai','anand','rehras','sohila'].map(name=>'./nitnem/data/'+name+'.json')];
const expected={};
for(const name of new Set([...Object.keys(previous),...additions])){
 const filename=path.join(root,name.endsWith('/')?name+'index.html':name);
 expected[name]=crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
}
const next=source.replace(/const VERSION="[^"]+";/,'const VERSION="0.14.1-nitnem-meanings-readable-20261125-1";').replace(/const EXPECTED=\{[^\n]+\};/,'const EXPECTED='+JSON.stringify(expected)+';');
fs.writeFileSync(file,next);console.log(JSON.stringify({assets:Object.keys(expected).length,status:'hashes regenerated'}));
