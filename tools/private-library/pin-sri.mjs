import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../private-library/',import.meta.url);
const bytes=await fs.readFile(new URL('app.mjs',root));
const source=bytes.toString('utf8');
if(/^\s*import\b/m.test(source)||/\bimport\s*\(/.test(source))throw Error('Private reader must remain a closed module.');
const integrity='sha384-'+createHash('sha384').update(bytes).digest('base64');
const filename=new URL('index.html',root),html=await fs.readFile(filename,'utf8');
const matcher=/(<script type="module" src="\.\/app\.mjs" integrity=")[^"]+(" crossorigin="anonymous"><\/script>)/g;
if([...html.matchAll(matcher)].length!==1)throw Error('Expected one pinned executable.');
const updated=html.replace(matcher,(_,before,after)=>before+integrity+after);
if(process.argv.includes('--write')){await fs.writeFile(filename,updated);process.stdout.write('Private reader SRI pinned.\n');}
else if(html!==updated)throw Error('Private reader SRI is stale.');
else process.stdout.write('Private reader SRI matches.\n');
