// One closed executable: no imports, third-party scripts, storage or telemetry.
export const FORMAT = 'glp.private-library.encrypted.v1';
export const PAYLOAD_SCHEMA = 'glp.private-collection.v1';
export const ITERATIONS = 600000;
export const MAX_PLAINTEXT_BYTES = 12 * 1024 * 1024;
export const MAX_ENVELOPE_BYTES = 18 * 1024 * 1024;
export const IDLE_MILLISECONDS = 5 * 60 * 1000;
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', {fatal:true});
const refusal = () => new Error('Unable to unlock this collection. Check your passphrase and collection file.');
const object = v => !!v && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype;
function keys(v, expected) {
  if (!object(v) || Object.keys(v).sort().join('|') !== [...expected].sort().join('|')) throw refusal();
}
function text(v, max, empty=false) {
  if (typeof v !== 'string' || v.length > max || (!empty && !v.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(v)) throw refusal();
  return v;
}
function slug(v) { if (typeof v !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,79}$/.test(v)) throw refusal(); }
function b64(bytes) {
  let value='';
  for (let i=0;i<bytes.length;i+=0x8000) value+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return btoa(value);
}
function unb64(value, max) {
  if (typeof value !== 'string' || !value.length || value.length > Math.ceil(max/3)*4 || value.length%4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw refusal();
  const decoded=Uint8Array.from(atob(value), c=>c.charCodeAt(0));
  if (decoded.length>max || b64(decoded)!==value) throw refusal();
  return decoded;
}
export function validatePassphrase(value) {
  if (typeof value !== 'string' || value.length<24 || value.length>256 || /[\u0000-\u001f\u007f]/u.test(value) || new Set(value).size<8) {
    throw new Error('Use a strong passphrase of 24 to 256 characters, with at least eight different characters.');
  }
  return value;
}
export function validateCollection(value) {
  keys(value,['schema','title','editionId','works']);
  if(value.schema!==PAYLOAD_SCHEMA)throw refusal();
  text(value.title,160);slug(value.editionId);
  if(!Array.isArray(value.works)||!value.works.length||value.works.length>200)throw refusal();
  const ids=new Set();let total=0;
  for(const work of value.works){
    keys(work,['id','tradition','title','language','edition','source','paragraphs']);
    slug(work.id);if(ids.has(work.id))throw refusal();ids.add(work.id);
    if(!['bible','early-buddhist','tibetan-buddhist','other-religious'].includes(work.tradition))throw refusal();
    text(work.title,240);text(work.language,80);text(work.edition,300);
    keys(work.source,['url','rights','attribution','checkedOn','permissionRef']);
    text(work.source.url,2048);const url=new URL(work.source.url);
    if(url.protocol!=='https:'||url.username||url.password)throw refusal();
    if(!['public-domain','cc0','permission-recorded','licensed-unmodified'].includes(work.source.rights))throw refusal();
    text(work.source.attribution,2000);text(work.source.permissionRef,2000,true);
    if(['permission-recorded','licensed-unmodified'].includes(work.source.rights)&&!work.source.permissionRef.trim())throw refusal();
    if(!/^\d{4}-\d{2}-\d{2}$/.test(work.source.checkedOn)||new Date(work.source.checkedOn).toISOString().slice(0,10)!==work.source.checkedOn)throw refusal();
    if(!Array.isArray(work.paragraphs)||!work.paragraphs.length||work.paragraphs.length>10000)throw refusal();
    total+=work.paragraphs.length;if(total>100000)throw refusal();
    for(const paragraph of work.paragraphs)text(paragraph,100000);
  }
  if(encoder.encode(JSON.stringify(value)).length>MAX_PLAINTEXT_BYTES)throw refusal();
  return value;
}
export function validateEnvelope(value) {
  keys(value,['format','kdf','cipher','ciphertext']);
  keys(value.kdf,['name','hash','iterations','salt']);keys(value.cipher,['name','iv','tagLength']);
  if(value.format!==FORMAT||value.kdf.name!=='PBKDF2'||value.kdf.hash!=='SHA-256'||value.kdf.iterations!==ITERATIONS||value.cipher.name!=='AES-GCM'||value.cipher.tagLength!==128)throw refusal();
  const salt=unb64(value.kdf.salt,16),iv=unb64(value.cipher.iv,12),ciphertext=unb64(value.ciphertext,MAX_PLAINTEXT_BYTES+16);
  if(salt.length!==16||iv.length!==12||ciphertext.length<17)throw refusal();
  return {salt,iv,ciphertext};
}
async function derive(passphrase,salt,usage) {
  const bytes=encoder.encode(validatePassphrase(passphrase));
  try{
    const material=await globalThis.crypto.subtle.importKey('raw',bytes,'PBKDF2',false,['deriveKey']);
    return await globalThis.crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,[usage]);
  }finally{bytes.fill(0);}
}
const aad = () => encoder.encode(FORMAT);
export async function sealCollection(value,passphrase) {
  validateCollection(value);validatePassphrase(passphrase);
  const salt=globalThis.crypto.getRandomValues(new Uint8Array(16)),iv=globalThis.crypto.getRandomValues(new Uint8Array(12));
  const bytes=encoder.encode(JSON.stringify(value));
  try{
    const key=await derive(passphrase,salt,'encrypt');
    const encrypted=await globalThis.crypto.subtle.encrypt({name:'AES-GCM',iv,tagLength:128,additionalData:aad()},key,bytes);
    return {format:FORMAT,kdf:{name:'PBKDF2',hash:'SHA-256',iterations:ITERATIONS,salt:b64(salt)},cipher:{name:'AES-GCM',iv:b64(iv),tagLength:128},ciphertext:b64(new Uint8Array(encrypted))};
  }finally{bytes.fill(0);}
}
export async function unlockCollection(value,passphrase) {
  let plain;
  try{
    const {salt,iv,ciphertext}=validateEnvelope(value),key=await derive(passphrase,salt,'decrypt');
    plain=new Uint8Array(await globalThis.crypto.subtle.decrypt({name:'AES-GCM',iv,tagLength:128,additionalData:aad()},key,ciphertext));
    if(plain.length>MAX_PLAINTEXT_BYTES)throw refusal();
    return validateCollection(JSON.parse(decoder.decode(plain)));
  }catch{throw refusal();}finally{plain?.fill(0);}
}
async function boundedEnvelope(response) {
  if(!response.ok||response.redirected)throw refusal();
  const advertised=response.headers.get('content-length');
  if(advertised!==null&&(!/^\d+$/.test(advertised)||Number(advertised)>MAX_ENVELOPE_BYTES))throw refusal();
  const reader=response.body?.getReader();if(!reader)throw refusal();
  let size=0;const chunks=[];
  try{
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>MAX_ENVELOPE_BYTES)throw refusal();chunks.push(value);}
  }catch(error){await reader.cancel().catch(()=>{});throw error;}
  const joined=new Uint8Array(size);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(decoder.decode(joined));
}
function startReader() {
  const $=id=>document.getElementById(id);
  let collection=null,page=0,generation=0,lastActivity=0,request=null;
  const state=value=>{document.documentElement.dataset.privateState=value;};
  const notice=(message)=>{$('status').textContent=message;};
  const clear=()=>{
    collection=null;page=0;$('passphrase').value='';$('collection-title').textContent='';$('work-select').replaceChildren();
    $('work-title').textContent='';$('edition').textContent='';$('source').replaceChildren();$('passages').replaceChildren();$('page-status').textContent='';
    $('reading').hidden=true;$('unlock-panel').hidden=false;$('unlock').disabled=false;$('lock').disabled=true;
  };
  function lock(message='Private library locked. Enter your passphrase to read.') {
    generation++;request?.abort();request=null;clear();state('locked');notice(message);
  }
  function renderWork(){
    if(!collection)return;
    const work=collection.works[Number($('work-select').value)];if(!work)return;
    $('work-title').textContent=work.title;$('edition').textContent=`${work.edition} · ${work.language}`;
    const link=document.createElement('a');link.href=work.source.url;link.target='_blank';link.rel='noopener noreferrer';link.referrerPolicy='no-referrer';link.textContent='Original source';
    const attribution=document.createElement('p');attribution.textContent=work.source.attribution;
    const rights=document.createElement('p');rights.textContent=`Rights: ${work.source.rights}. Checked ${work.source.checkedOn}.`;
    $('source').replaceChildren(link,attribution,rights);
    const start=page*50,fragment=document.createDocumentFragment();
    for(const paragraph of work.paragraphs.slice(start,start+50)){const p=document.createElement('p');p.textContent=paragraph;fragment.append(p);}
    $('passages').replaceChildren(fragment);
    $('previous').disabled=page===0;$('next').disabled=start+50>=work.paragraphs.length;
    $('page-status').textContent=`Passages ${start+1}–${Math.min(start+50,work.paragraphs.length)} of ${work.paragraphs.length}`;
  }
  $('unlock-form').addEventListener('submit',async event=>{
    event.preventDefault();
    let passphrase=$('passphrase').value;$('passphrase').value='';
    try{validatePassphrase(passphrase);}catch(error){notice(error.message);passphrase='';return;}
    const attempt=++generation;
    $('unlock').disabled=true;state('unlocking');notice('Unlocking your private collection…');
    request=new AbortController();
    try{
      const target=new URL('./collection.enc.json',import.meta.url);
      const response=await fetch(target,{cache:'no-store',credentials:'omit',redirect:'error',referrerPolicy:'no-referrer',signal:request.signal});
      if(response.status===404){if(attempt===generation){lock('Your private collection is not configured yet. The reading area is ready for an encrypted collection.');state('setup-pending');}return;}
      const envelope=await boundedEnvelope(response);
      const opened=await unlockCollection(envelope,passphrase);
      if(attempt!==generation||document.hidden)return;
      collection=opened;page=0;lastActivity=performance.now();
      $('collection-title').textContent=collection.title;
      collection.works.forEach((work,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=work.title;$('work-select').append(option);});
      $('unlock-panel').hidden=true;$('reading').hidden=false;$('lock').disabled=false;
      renderWork();state('unlocked');notice('Unlocked for this visit. This view locks when you leave the tab or after five minutes without activity.');
      $('work-title').focus();
    }catch{
      if(attempt===generation){lock(refusal().message);state('refused');}
    }finally{passphrase='';if(attempt===generation){$('unlock').disabled=false;request=null;}}
  });
  $('lock').addEventListener('click',()=>{lock();$('passphrase').focus();});
  $('work-select').addEventListener('change',()=>{page=0;renderWork();});
  for(const [id,change] of [['previous',-1],['next',1]])$(id).addEventListener('click',()=>{page+=change;renderWork();$('work-title').focus();});
  for(const type of ['pointerdown','keydown','scroll','wheel'])document.addEventListener(type,()=>{if(collection)lastActivity=performance.now();},{passive:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)lock();});
  window.addEventListener('pagehide',()=>lock());
  window.addEventListener('pageshow',event=>{if(event.persisted)lock();});
  window.addEventListener('beforeprint',()=>lock('Private library locked. Private content is excluded from printing.'));
  setInterval(()=>{if(collection&&performance.now()-lastActivity>=IDLE_MILLISECONDS)lock('Private library locked after five minutes without activity.');},1000);
  lock();
  if(!globalThis.isSecureContext||!globalThis.crypto?.subtle){$('unlock').disabled=true;state('unavailable');notice('Secure reading is unavailable in this browser. Open this page over HTTPS in a current browser.');}
}
if(typeof document!=='undefined')startReader();
