import {decodeFixture,resolveDate,amritsarDate,EXAMPLE_DATE} from "./core.mjs";
const $=id=>document.getElementById(id);
const mk=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el;};
const statuses={INVALID_DATE:"Choose a valid Gregorian date.",FUTURE_DATE:"This date has not yet arrived in Amritsar.",TODAY_PENDING_NO_ADAPTER:"Today's official selection is not available in this development build. No earlier or random Shabad is substituted.",DATE_UNAVAILABLE:"This date is not in our verified development examples. No reading is substituted.",SOURCE_CONFLICT_HOLD:"Historical event held: a legacy encoding difference must be reviewed. No Scripture is rendered from this event.",DATED_DEVELOPMENT_EXAMPLE:"Dated development example only · digital source match, not a released or scholar-approved daily reading."};
let pack=null;
function link(label,url){const a=mk("a",label);const u=new URL(url);if(u.protocol!=="https:"||u.username||u.password)throw Error("Invalid link");a.href=u.href;a.target="_blank";a.rel="noopener noreferrer";return a;}
function render(){
 const now=new Date();$("clock").textContent="Amritsar date: "+amritsarDate(now);
 $("reading").hidden=true;$("scripture").replaceChildren();$("sources").replaceChildren();
 const r=resolveDate(pack,$("date").value,now);$("status").textContent=statuses[r.status]||"Reading unavailable.";
 if(r.event){const p=mk("p","Official dated reference: ");p.append(link(r.event.date,r.event.sourceUrl));$("sources").append(p);}
 if(r.status!=="DATED_DEVELOPMENT_EXAMPLE")return;
 const s=r.shabad;$("meta").textContent=r.event.date+" · Guru Nanak Dev Ji · Raag Gujri · Ang 504–505";$("calendar").textContent=r.event.calendar;$("identity").textContent="One source record for both matched dates: "+s.id;
 for(const x of s.occurrences){const div=mk("div",x.text);div.className="pankti";div.dataset.kind=x.kind;div.dataset.occurrence=x.id;div.append(mk("small",(x.kind==="rahao"?"Rahao · ":"")+"Ang "+x.ang));$("scripture").append(div);}
 for(const source of s.sourceBlobs){const p=mk("p","Pinned original-text witness: ");p.append(link("Ang "+source.ang,source.url));$("sources").append(p);}
 $("reading").hidden=false;
}
async function start(){
 try{const resp=await fetch("./fixture.json",{credentials:"same-origin",cache:"no-store"});if(!resp.ok)throw Error("Fixture unavailable");pack=await decodeFixture(await resp.arrayBuffer());
 $("date").value=EXAMPLE_DATE;
 $("open").addEventListener("click",render);$("today").addEventListener("click",()=>{$("date").value=amritsarDate();render()});
 for(const b of document.querySelectorAll("[data-date]"))b.addEventListener("click",()=>{$("date").value=b.dataset.date;render()});
 for(const b of document.querySelectorAll("button"))b.disabled=false;
 $("font-size").addEventListener("input",()=>{const n=Number($("font-size").value);if(n>=24&&n<=52){$("scripture").style.setProperty("--g-size",n+"px");$("font-value").textContent=n+" px";}});
 render();
 }catch(e){$("reading").hidden=true;$("scripture").replaceChildren();$("status").textContent="The pinned source fixture could not be verified. No reading will be shown. Please reload while online.";for(const b of document.querySelectorAll("button"))b.disabled=true;}
}
start();
