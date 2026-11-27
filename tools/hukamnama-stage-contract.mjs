/* Original-only staging constraints, not a substitute for source acquisition,
   live SGPC evidence, qualified scholarship or written reuse permission. */
import {createHash} from "node:crypto";
import {validDate} from "../hukamnama/core.mjs";

const HEX=/^[a-f0-9]{64}$/;
const REPOSITORY="opengranth/open-granth",COMMIT="34d2a7cab032c8ea24d21ff20f64653bd03766f4",EDITION="opengranth-34d2a7c";
const RAW="https://raw.githubusercontent.com/"+REPOSITORY+"/"+COMMIT+"/";
const PORTAL="https://hs.sgpc.net/",ARCHIVE=PORTAL+"hssearchhukmanamaTestCalender.php";
const SCOPE="Unique full ordered sequence among entries beginning at the official starting Ang; adjacent pages establish continuation and boundaries. Global corpus uniqueness is not asserted.";
const NORMALIZATION="NONE; original witness entries joined by one ASCII space";
const ORIGINAL_KEYS=["date","ang","gheading1","gheading2","ghukamnama","gfooter1","gfooter2"];
const TRANSPORT_KEYS=["Content-Type","Date","X-Frame-Options","Content-Security-Policy","Access-Control-Allow-Origin"];
const POLICY=[
 {name:"opengranth-code-license",url:RAW+"LICENSE",sha256:"7c8ad948da650fdec6bca1dc769a1a80f8cdf527f9248e1df56aed46e75c3dc2"},
 {name:"opengranth-notice",url:RAW+"NOTICE",sha256:"7b2776c739ed3baa5e424597ad2b304d729dd2dfb87b657deffe3ef06e8155bf"},
 {name:"opengranth-provenance",url:RAW+"docs/provenance.md",sha256:"0e1f1c0b267b0c86bd4ac7b1a882b68f19aa3e3929059662fca47b69c098132e"},
 {name:"upstream-original-text-notice",url:"https://raw.githubusercontent.com/shabados/database/918c1d42d02e385e7ed48ef44994c75a2cb50293/README.md",sha256:"e06d574b19e31a876c987555329ef5959eb6735b081495a2a64136973d7456da"}
];
const LIMITATIONS=[
 "Digital full-text comparison is not qualified scholarly or printed-page approval.",
 "The portal and its archive are one publisher, not independent historical witnesses.",
 "Open Granth derives its original text from Shabad OS SSA2, attributed upstream to SGPC Shabadaarth.",
 "Open Granth MIT covers code/tooling, expressly not its corpus. The pinned upstream notice identifies original Gurbani/Panthic text as public domain; modern translations/commentary are excluded from this import.",
 "The upstream rights notice is pinned to the archived repository commit, not asserted to be the notice bundled with npm 5.0.0-next.0; that registry gitHead returned 404 during research.",
 "The archive endpoint is observed official implementation, not a documented external API contract.",
 "No publisher time-zone offset is invented for the displayed time."
];
const sha=value=>createHash("sha256").update(value).digest("hex");
const plain=value=>value!==null&&typeof value==="object"&&!Array.isArray(value);
function requireThat(condition,message){if(!condition)throw Error("Hukamnama staging contract: "+message);}
function keys(value,fields,label){
 requireThat(plain(value)&&Object.keys(value).length===fields.length&&fields.every(field=>Object.hasOwn(value,field)),label+" contains missing or unapproved fields.");
}
function stable(value){if(Array.isArray(value))return value.map(stable);if(plain(value))return Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])]));return value;}
const equal=(left,right)=>JSON.stringify(stable(left))===JSON.stringify(stable(right));
function utc(value){
 if(typeof value!=="string"||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value)||!Number.isFinite(Date.parse(value)))return false;
 return new Date(value).toISOString().slice(0,19)===value.slice(0,19);
}
function time(value){return value===null||typeof value==="string"&&/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(value);}
function originalText(value,label,{empty=false,max=200000}={}){
 requireThat(typeof value==="string"&&value.length<=max&&(empty||value.length>0)&&value===value.trim()&&!/[<>\u0000-\u001f\u007f\ufffd\uE000-\uF8FF\uD800-\uDFFF]/u.test(value),label+" is not an exact supported original/date field.");
}
function numberedClose(value){return /॥[੦-੯]+(?:॥[੦-੯]+)*॥$/u.test(value);}
function heading(value){
 return value.length<=180&&(/(?:ਮਹਲਾ|ਮਃ)\s*[੦-੯]+/u.test(value)||/^(?:ਪਉੜੀ|ਸਲੋਕੁ|ਸਲੋਕ|ਛੰਤੁ|ਛੰਤ)(?:\s+॥)?$/u.test(value)||value.startsWith("ੴ "));
}
function validateOriginal(original,{withTime,date,label}){
 keys(original,withTime?[...ORIGINAL_KEYS,"hukamnama_time"]:ORIGINAL_KEYS,label);
 requireThat(validDate(original.date)&&original.date===date,label+" date differs from the requested event.");
 requireThat(typeof original.ang==="string"&&/^[1-9]\d{0,3}$/.test(original.ang)&&Number(original.ang)<=1430,label+" Ang is invalid.");
 for(const field of ["gheading1","gheading2","ghukamnama","gfooter1","gfooter2"])originalText(original[field],label+" "+field,{empty:field==="gheading2",max:field.startsWith("gfooter")?1000:200000});
 requireThat(/[\u0a00-\u0a7f]/u.test(original.gheading1)&&/[\u0a00-\u0a7f]/u.test(original.ghukamnama),label+" original Gurmukhi is missing.");
 if(withTime)requireThat(time(original.hukamnama_time),label+" displayed time is invalid.");
 // The Nanakshahi footer stays an exact provider string; no Gregorian date is inferred.
 const footer=original.gfooter2.match(/^\(ਅੰਗ:\s*([੦-੯]+)\)$/u);
 requireThat(footer&&Number(Array.from(footer[1],c=>c.charCodeAt(0)-0x0a66).join(""))===Number(original.ang),label+" Ang footer differs from its structured Ang.");
}
function validateProvenance(provenance,source){
 keys(provenance,["repository","commit","pages","comparison","comparisonScope","precedingSha256","followingSha256"],"Source provenance");
 requireThat(provenance.repository===REPOSITORY&&provenance.commit===COMMIT&&provenance.comparison==="COMPLETE_ORDERED_TEXT_EQUALITY"&&provenance.comparisonScope===SCOPE,"Source provenance identity or comparison scope differs.");
 requireThat(HEX.test(provenance.precedingSha256)&&HEX.test(provenance.followingSha256),"Source boundary digests are missing.");
 requireThat(Array.isArray(provenance.pages)&&provenance.pages.length>0&&provenance.pages.length<=17,"Witness pages are missing or unbounded.");
 let previous=null;const witnessed=new Set();
 for(const page of provenance.pages){
  keys(page,["ang","url","sha256"],"Witness page");
  requireThat(Number.isInteger(page.ang)&&page.ang>=1&&page.ang<=1430&&(previous===null||page.ang===previous+1)&&HEX.test(page.sha256)&&page.url===RAW+"corpus/ang-"+String(page.ang).padStart(4,"0")+".md","Witness page identity, digest or sequence differs.");
  previous=page.ang;witnessed.add(page.ang);
 }
 requireThat(provenance.pages[0].ang>=source.angStart-1&&provenance.pages[0].ang<=source.angStart&&provenance.pages.at(-1).ang>=source.angEnd&&provenance.pages.at(-1).ang<=source.angEnd+1,"Witness page context does not bound the selected source.");
 requireThat(source.occurrences.every(line=>witnessed.has(line.ang)),"A continuation page lacks a witness.");
}

/** Checks parsed original-only artifacts and their exact cross-references.
 * Raw byte hashes and duplicate-key rejection belong at the signer input boundary.
 * Evidence metadata agreement does not prove that the provider actually said it.
 */
export function validateStage({payload,source,receipt}={}){
 keys(payload,["schema","id","date","timezone","venue","ritual","sourceUrl","archiveUrl","officialPublishedDate","officialDisplayedTime","checkedAtUtc","officialOriginalSha256","officialReceiptSha256","source","verification","status","publicationApproved","revision","lessons"],"Event payload");
 requireThat(payload.schema==="glp.hukamnama.event.v1"&&validDate(payload.date)&&payload.id==="harmandir-morning."+payload.date&&payload.officialPublishedDate===payload.date,"Event identity or official date differs.");
 requireThat(payload.timezone==="Asia/Kolkata"&&payload.venue==="sri-harmandir-sahib"&&payload.ritual==="morning-mukhwak"&&payload.sourceUrl===PORTAL&&payload.archiveUrl===PORTAL+"archiveView.php","Event venue, ritual or source differs.");
 requireThat(payload.status==="DIGITAL_TEXT_VERIFIED_PREVIEW"&&payload.publicationApproved===false&&payload.verification==="COMPLETE_ORDERED_TEXT_EQUALITY"&&Number.isSafeInteger(payload.revision)&&payload.revision>=1,"Only a complete unapproved development event may be sealed.");
 requireThat(utc(payload.checkedAtUtc)&&time(payload.officialDisplayedTime)&&HEX.test(payload.officialOriginalSha256)&&HEX.test(payload.officialReceiptSha256),"Event metadata is invalid.");
 keys(payload.source,["id","edition","textSha256","sha256","path"],"Event source binding");
 requireThat(HEX.test(payload.source.sha256)&&HEX.test(payload.source.textSha256)&&payload.source.id==="sggs.text."+payload.source.textSha256&&payload.source.edition===EDITION&&payload.source.path==="./sources/"+payload.source.textSha256+".json","Event source identity is invalid.");
 keys(payload.lessons,["simple","detailed","learning"],"Explanation states");
 requireThat(Object.values(payload.lessons).every(value=>value===null),"This staging publisher has no qualified explanatory content.");

 keys(source,["schema","id","edition","textSha256","angStart","angEnd","occurrences","provenance"],"Original source");
 requireThat(source.schema==="glp.hukamnama.source.v1"&&source.id===payload.source.id&&source.edition===EDITION&&source.textSha256===payload.source.textSha256&&source.textSha256===payload.officialOriginalSha256,"Source identity differs from the event.");
 requireThat(Number.isInteger(source.angStart)&&Number.isInteger(source.angEnd)&&source.angStart>=1&&source.angEnd<=1430&&source.angStart<=source.angEnd,"The source Ang span is invalid.");
 requireThat(Array.isArray(source.occurrences)&&source.occurrences.length>=2&&source.occurrences.length<=3000,"The complete source sequence is missing.");
 const counts=new Map();let previousAng=source.angStart;
 for(const occurrence of source.occurrences){
  keys(occurrence,["id","text","sha256","kind","ang"],"Original occurrence");originalText(occurrence.text,"Original occurrence",{max:12000});
  requireThat(/[\u0a00-\u0a7f]/u.test(occurrence.text)&&Number.isInteger(occurrence.ang)&&occurrence.ang>=previousAng&&occurrence.ang<=source.angEnd&&["heading","verse","rahao"].includes(occurrence.kind),"Original sequence or kind is invalid.");
  const digest=sha(occurrence.text),count=(counts.get(digest)||0)+1;counts.set(digest,count);
  requireThat(occurrence.sha256===digest&&occurrence.id===source.id+".line."+digest+"."+count,"An original occurrence identity differs.");
  previousAng=occurrence.ang;
 }
 const joined=source.occurrences.map(line=>line.text).join(" ");
 requireThat(sha(joined)===source.textSha256&&source.occurrences[0].ang===source.angStart&&source.occurrences.at(-1).ang===source.angEnd,"Complete source digest or boundaries differ.");
 validateProvenance(source.provenance,source);

 keys(receipt,["schema","requestedDate","timezone","original","checkedAtUtc","officialOriginalSha256","observations","witness","policyPins","limitations"],"Original-only receipt");
 requireThat(receipt.schema==="glp.hukamnama.receipt.v1"&&receipt.requestedDate===payload.date&&receipt.timezone===payload.timezone&&receipt.checkedAtUtc===payload.checkedAtUtc&&receipt.officialOriginalSha256===source.textSha256,"Receipt date, clock or source digest differs.");
 validateOriginal(receipt.original,{withTime:true,date:payload.date,label:"Receipt original"});
 requireThat(Number(receipt.original.ang)===source.angStart&&receipt.original.hukamnama_time===payload.officialDisplayedTime,"Receipt Ang or displayed time differs.");
 const official=[receipt.original.gheading1,receipt.original.gheading2,receipt.original.ghukamnama].filter(Boolean).join(" ");
 requireThat(official===joined,"Receipt complete original differs from the source sequence.");

 requireThat(Array.isArray(receipt.observations)&&receipt.observations.length>=1&&receipt.observations.length<=2,"Official observations are missing or ambiguous.");
 const kinds=new Set();let latest=null;
 for(const observation of receipt.observations){
  requireThat(plain(observation)&&["portal","archive"].includes(observation.kind)&&!kinds.has(observation.kind),"Official observation identity is missing or repeated.");kinds.add(observation.kind);
  const portal=observation.kind==="portal";
  keys(observation,portal?["kind","url","retrievedAtUtc","original","transport","verification"]:["kind","url","method","requestedDate","retrievedAtUtc","original","transport","verification"],"Official observation");
  requireThat(observation.url===(portal?PORTAL:ARCHIVE)&&observation.verification===(portal?"VISIBLE_AND_STRUCTURED_ORIGINAL_EQUAL":"EXPLICIT_DATED_COMPLETE_ORIGINAL"),"Observation source or verification method differs.");
  if(!portal)requireThat(observation.method==="POST"&&observation.requestedDate===payload.date,"Archive observation date or method differs.");
  requireThat(utc(observation.retrievedAtUtc),"Observation retrieval time is invalid.");
  if(latest===null||Date.parse(observation.retrievedAtUtc)>Date.parse(latest))latest=observation.retrievedAtUtc;
  validateOriginal(observation.original,{withTime:portal,date:payload.date,label:observation.kind+" observation"});
  for(const field of ORIGINAL_KEYS)requireThat(observation.original[field]===receipt.original[field],"An observed original/date field differs from the receipt.");
  if(portal)requireThat(observation.original.hukamnama_time===receipt.original.hukamnama_time&&observation.original.hukamnama_time!==null,"Portal observed publication time differs.");
  requireThat(plain(observation.transport)&&Object.hasOwn(observation.transport,"Content-Type")&&Object.keys(observation.transport).every(key=>TRANSPORT_KEYS.includes(key)),"Observation transport contains missing or unapproved fields.");
  for(const [key,value] of Object.entries(observation.transport))requireThat(typeof value==="string"&&value.length<=8192&&!/[\r\n\u0000]/u.test(value),"Observation transport metadata is invalid.");
  requireThat(observation.transport["Content-Type"].split(";",1)[0].trim()===(portal?"text/html":"application/json"),"Observation content type differs.");
 }
 requireThat(kinds.has("archive")&&(receipt.original.hukamnama_time===null?!kinds.has("portal"):kinds.has("portal")),"Observation sources do not explain the publication time.");
 requireThat(latest===receipt.checkedAtUtc,"Receipt retrieval time is not the latest official observation.");

 const witness=receipt.witness;
 keys(witness,["provenance","headingEntries","originalEntries","precedingOriginal","followingOriginal","normalization"],"Receipt witness");
 requireThat(equal(witness.provenance,source.provenance),"Receipt witness provenance differs from the source.");
 requireThat(witness.normalization===NORMALIZATION&&witness.originalEntries===source.occurrences.length&&Number.isInteger(witness.headingEntries)&&witness.headingEntries>=1&&witness.headingEntries<source.occurrences.length,"Witness entry counts or normalization differ.");
 const headingText=[receipt.original.gheading1,receipt.original.gheading2].filter(Boolean).join(" ");
 requireThat(source.occurrences.slice(0,witness.headingEntries).map(line=>line.text).join(" ")===headingText,"Witness heading count differs from the official heading prefix.");
 source.occurrences.forEach((line,index)=>{
  const kind=index<witness.headingEntries?"heading":(/ਰਹਾਉ(?:\s+ਦੂਜਾ)?\s*॥/u.test(line.text)?"rahao":"verse");
  requireThat(line.kind===kind,"An original occurrence's structural kind differs.");
 });
 originalText(witness.precedingOriginal,"Preceding original boundary",{max:12000});originalText(witness.followingOriginal,"Following original boundary",{max:12000});
 requireThat(sha(witness.precedingOriginal)===source.provenance.precedingSha256&&sha(witness.followingOriginal)===source.provenance.followingSha256,"Witness boundary text and digests differ.");
 requireThat(numberedClose(witness.precedingOriginal)&&numberedClose(source.occurrences.at(-1).text)&&heading(witness.followingOriginal),"Supported complete-unit boundaries are not established.");

 requireThat(Array.isArray(receipt.policyPins)&&receipt.policyPins.length===POLICY.length,"The required original-text policy pins are missing.");
 for(let index=0;index<POLICY.length;index++){keys(receipt.policyPins[index],["name","url","sha256"],"Policy pin");requireThat(equal(receipt.policyPins[index],POLICY[index]),"A required original-text policy pin differs.");}
 requireThat(equal(receipt.limitations,LIMITATIONS),"The recorded evidence limitations differ from the reviewed staging format.");
 return true;
}
