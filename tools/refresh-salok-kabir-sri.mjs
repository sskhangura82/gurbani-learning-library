// Refresh the new page's script integrity after a reviewed shared-reader edit.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const page=new URL('../salok-kabir/index.html',import.meta.url);
let html=await fs.readFile(page,'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"[^>]*><\/script>/g)];
for(const match of scripts){
 const url=new URL(match[1],page);
 if(!url.pathname.includes('/nitnem/')||!url.pathname.endsWith('.js'))throw Error('Unexpected shared reader script');
 const digest=crypto.createHash('sha256').update(await fs.readFile(url)).digest('base64');
 html=html.replace(match[0],`<script src="${match[1]}" integrity="sha256-${digest}" crossorigin="anonymous"></script>`);
}
if(scripts.length!==6)throw Error('Unexpected script count');
await fs.writeFile(page,html);console.log(JSON.stringify({status:'PASS',scriptsPinned:scripts.length}));
