// Regenerate hashes only after the complete static release is in place.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)));
const file=path.join(root,'sw.js'),source=fs.readFileSync(file,'utf8');
const previous=JSON.parse(source.match(/const EXPECTED=(\{[^\n]+\});/)[1]);
const additions=['./nitnem/','./nitnem/index.html','./nitnem/reader.js','./nitnem/reader.css','./nitnem/continuous-core.js','./nitnem/appearance.js','./nitnem/appearance.css','./nitnem/local-learning.js','./nitnem/offline.js','./nitnem/learning/learning-ui.js','./nitnem/learning/course.complete.json','./nitnem/data/library.json',...['jaap','savaiye','chaupai','anand','rehras','sohila'].map(name=>'./nitnem/data/'+name+'.json')];
additions.push('./js/source-integrity.js');
additions.push('./breathing.html','./css/breathing.css','./js/breathing-core.js','./js/breathing.js');
additions.push('./salok-mahalla9/','./salok-mahalla9/index.html','./salok-mahalla9/data/library.json','./salok-mahalla9/data/salok-mahalla9.json','./salok-mahalla9/learning/course.complete.json');
additions.push('./salok-kabir/','./salok-kabir/index.html','./salok-kabir/data/library.json','./salok-kabir/data/salok-kabir.json','./salok-kabir/learning/course.complete.json');
additions.push('./salok-farid/','./salok-farid/index.html','./salok-farid/data/library.json','./salok-farid/data/salok-farid.json');
additions.push('./articles/','./articles/index.html','./articles/article.html','./articles/articles.css','./articles/app.mjs','./articles/core.mjs','./articles/source-contracts.mjs','./articles/catalog.json');
additions.push('./library/catalog.mjs','./library/core.mjs','./library/app.mjs','./library/library.css');
// Same-directory bundles contain the complete executable module graphs. Keep
// source assets for documented inspection; runtime pages load only the bundles.
additions.push('./library/app.bundle.mjs','./articles/app.bundle.mjs');
additions.push('./library/complete-passages.json','./library/passage-contracts.mjs','./library/passages.mjs','./library/passage-ui.mjs','./library/search.mjs','./library/kinds.mjs');
additions.push('./knowledge/','./knowledge/index.html','./knowledge/style.css','./knowledge/app.bundle.mjs','./knowledge/scripture.json','./knowledge/pilot.json');
// Dated events and content-addressed sources use their own verified-pair cache.
// They must never enter the versioned application shell.
additions.push('./hukamnama/','./hukamnama/index.html','./hukamnama/style.css','./hukamnama/reader.bundle.mjs');
additions.push('./vendor/opengranth/LICENSE','./vendor/opengranth/NOTICE');
additions.push('./collections/dasam/','./collections/dasam/index.html','./collections/collections.css','./psychology/','./psychology/index.html');
// Reader shells are small public assets. The 155 source chunks stay on demand;
// a shell being available offline never implies a complete source can be read.
additions.push('./collections/sggs/','./collections/sggs/index.html','./collections/dasam/read.html','./collections/source-reader/reader.css','./collections/source-reader/reader.bundle.mjs');
// The three public psychology modules are self-contained, script-free study pages.
additions.push('./psychology/intellectual-humility.html','./psychology/attention.html','./psychology/emotion-regulation.html','./psychology/study.css');
// The optional YouTube companion shell contains no video, provider scripts or
// provider metadata. Playback and the full-source corpus require a connection.
additions.push('./listen/','./listen/index.html','./listen/read-along.css','./collections/source-reader/read-along.bundle.mjs');
// The encrypted reading room is fetched on demand with no-store. It is not a
// public offline/search asset, and decrypted content never enters this manifest.
const expected={};
const inventory=new Set([...Object.keys(previous),...additions]);
for(const name of inventory){
 const pathname=decodeURIComponent(new URL(name,'https://offline.invalid/').pathname);
 if(pathname==='/private-library'||pathname.startsWith('/private-library/'))
  throw Error('Private-library assets must not enter the public offline manifest.');
}
for(const name of inventory){
 const filename=path.join(root,name.endsWith('/')?name+'index.html':name);
 expected[name]=crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
}
const next=source.replace(/const VERSION="[^"]+";/,'const VERSION="0.31-youtube-bani-read-along-20261127-1";').replace(/const EXPECTED=\{[^\n]+\};/,'const EXPECTED='+JSON.stringify(expected)+';');
fs.writeFileSync(file,next);console.log(JSON.stringify({assets:Object.keys(expected).length,status:'hashes regenerated'}));
