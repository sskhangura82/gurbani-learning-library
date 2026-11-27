import {JOURNEY_BINDING,LEARNING_KEY,LIMITS,journeyAvailable,sameBinding,loadLearning,saveLearning,exportLearning,importLearning,localDate,weekFrom,returnReady} from "./learning.mjs";
export const JOURNEY_ID=JOURNEY_BINDING.journeyId;
export const SAVED_ID="knowledge.saved";
const drafts=new Map();
let notice="";
function showNotice(parent){if(notice){const p=el("p",notice,"note");p.setAttribute("role","status");parent.append(p);notice="";}}
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,fn)=>{const b=el("button",text);b.type="button";b.addEventListener("click",fn);return b;};
const paragraph=text=>el("p",text,"note");
function download(text,filename,type="application/json"){
 const url=URL.createObjectURL(new Blob([text],{type})),a=el("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function backups(parent,onImported){
 const box=el("section",undefined,"private-learning backup-tools");box.dataset.privateLearning="true";box.append(el("h3","Your Knowledge learning backup"),paragraph("This file contains only your private Knowledge questions and reflections. Other readers have their own backups."));
 const status=el("p","","note");status.setAttribute("role","status");
 const output=button("Export Knowledge learning",()=>{const r=exportLearning();if(r.ok){download(r.text,r.filename);status.textContent="Knowledge learning exported. Keep this private file somewhere safe.";}else status.textContent=r.message;});
 const label=el("label","Import Knowledge learning"),input=el("input");input.type="file";input.accept=".json,application/json";input.id="journey-import";label.htmlFor=input.id;
 input.addEventListener("change",async()=>{
  const file=input.files?.[0];if(!file)return;input.disabled=true;
  try{
   if(file.size>LIMITS.store*6){status.textContent="This backup is too large. Your existing record has been preserved.";return;}
   const r=await importLearning({text:await file.text()});status.textContent=r.message;if(r.ok&&box.isConnected){notice=r.message;onImported?.(r);}
  }catch{status.textContent="The backup could not be read. Your existing record has been preserved.";}finally{input.disabled=false;input.value="";}
 });
 box.append(output,label,input,status);parent.append(box);return status;
}
function source(parent,index){
 const p=index.nodes.get(JOURNEY_BINDING.passageId),box=el("section",undefined,"journey-original");box.dataset.contentKind="scripture";
 box.append(el("h3","Read the complete source passage"),paragraph("Original Gurbani · pinned digital source · "+index.nodes.get(p.authorId).title+" · "+index.nodes.get(p.compositionId).title));
 for(const id of p.occurrenceIds){const o=index.occ.get(id),line=el("p",o.text,"pankti"+(o.kind==="heading"?" source-heading":""));line.lang="pa";line.dataset.occurrence=id;box.append(line);}
 const a=el("a","Open the pinned source");a.href=p.sourceUrl;a.target="_blank";a.rel="noopener noreferrer";box.append(paragraph(p.comparison),a);parent.append(box);
}
function learningSlots(parent,navigate){
 const box=el("section",undefined,"journey-review");box.dataset.contentKind="editorial";
 for(const [id,title] of [["explanation","Qualified explanation"],["practice","Gurbani practice guidance"]]){
  const slot=el("section",undefined,"review-slot");slot.dataset.reviewSlot=id;slot.dataset.reviewStatus="AWAITING_QUALIFIED_REVIEW";slot.append(el("h3",title),paragraph("Awaiting qualified review. No approved content is available here."));box.append(slot);
 }
 const details=el("details");details.append(el("summary","Existing editorial drafts — optional, awaiting qualified review"),paragraph("The existing Haumai draft has an unresolved omission: it does not discuss the complete remedy clause in the source passage. It is not a finished or qualified explanation."),button("Open existing labelled draft",()=>navigate({id:"concept.haumai",depth:"simple"})));
 box.append(details);parent.append(box);
}
function comparison(parent,index){
 const edge=index.graph.edges.find(e=>e.id==="edge.24"),study=edge&&index.nodes.get(edge.to);if(!edge||!study)return;
 const details=el("details",undefined,"journey-comparison");details.dataset.contentKind="comparison";details.setAttribute("aria-label","Optional comparative study, separate from Gurbani explanation");
 details.append(el("summary","Optional comparison — editorial draft"),paragraph("This existing comparison is separate from the passage's explanation and practice guidance. Qualified review is pending."),el("h3",study.title),el("p","Similarity: "+edge.similarity),el("p","Difference: "+edge.difference));
 const a=el("a",study.citation);a.href=study.reference;a.target="_blank";a.rel="noopener noreferrer";details.append(a);parent.append(details);
}
function noteFields(form,record,draft){
 const inputs={};
 for(const [key,title] of [["question","Your question"],["initialReflection",record?"Your earlier reflection — kept as saved":"Your first reflection"],["laterReflection","Your later reflection"]]){
  const label=el("label",title),input=el("textarea");input.id="journey-"+key;input.rows=key==="question"?3:6;input.maxLength=key==="question"?LIMITS.question:LIMITS.reflection;input.value=draft[key];label.htmlFor=input.id;
  if(record&&key!=="laterReflection")input.readOnly=true;
  if(!record&&key==="laterReflection")input.disabled=true;
  inputs[key]=input;form.append(label,input);
 }
 const label=el("label","Optional return date"),date=el("input");date.type="date";date.id="journey-return-date";date.value=draft.returnOn||"";label.htmlFor=date.id;inputs.returnOn=date;
 form.append(label,date,paragraph("Choose a date if you want to revisit your own note. This is a personal reading intention, with no notifications or practice tracking."));
 return inputs;
}
function editor(parent,index,record,loaded,navigate){
 const key=record?.id||"new",existing=drafts.get(key);
 const original={question:record?.question||"",initialReflection:record?.initialReflection||"",laterReflection:record?.laterReflection||"",returnOn:record?.returnOn||null};
 const draft=existing||{...original,baseRevision:loaded.revision};
 const form=el("form",undefined,"private-learning journey-editor");form.dataset.privateLearning="true";form.addEventListener("submit",e=>e.preventDefault());
 form.append(el("h3",record?"Return to your own words":"Your question and reflection"),paragraph("What would you like to understand about this passage? What would you like to remember when you return? Your words stay on this device unless you export them."));
 if(record){
  if(record.conflictOf)form.append(paragraph("This is a preserved version from a conflicting edit or backup. Both versions remain in Saved."));
  if(returnReady(record))form.append(paragraph("Your chosen return date has arrived. Your earlier reflection is here whenever you want to revisit it."));
  else if(record.returnOn)form.append(paragraph("Your chosen return date: "+record.returnOn+". You can revisit this note at any time."));
 }
 const inputs=noteFields(form,record,draft),status=el("p","","note");status.id="journey-note-status";status.setAttribute("role","status");
 const collect=()=>({question:inputs.question.value,initialReflection:inputs.initialReflection.value,laterReflection:inputs.laterReflection.value,returnOn:inputs.returnOn.value||null});
 const remember=()=>{const value=collect();if(Object.keys(original).every(k=>value[k]===original[k]))drafts.delete(key);else drafts.set(key,{...value,baseRevision:draft.baseRevision});};
 Object.values(inputs).forEach(input=>input.addEventListener("input",remember));
 const week=button("Return in a week",()=>{inputs.returnOn.value=weekFrom(localDate());remember();});
 const clear=button("No return date",()=>{inputs.returnOn.value="";remember();});
 const save=button(record?"Save later reflection":"Save first reflection",async()=>{
  const value=collect();remember();status.textContent="Saving your reflection…";save.disabled=true;week.disabled=true;clear.disabled=true;
  Object.values(inputs).forEach(i=>i.disabled=true);
  const r=await saveLearning({record:{...(record?{id:record.id}:{}),binding:JOURNEY_BINDING,...value},baseRevision:draft.baseRevision});
  status.textContent=r.message;
  if(r.ok){drafts.delete(key);if(form.isConnected){navigate({id:JOURNEY_ID,note:r.savedRecord.id});document.getElementById("journey-note-status").textContent=r.message;}}
  else{save.disabled=false;week.disabled=false;clear.disabled=false;for(const [k,i] of Object.entries(inputs))i.disabled=!record&&k==="laterReflection";}
 });
 const keep=button("Download unsaved text",()=>{const v=collect();download("Private Knowledge reflection\n\nQuestion\n"+v.question+"\n\nEarlier reflection\n"+v.initialReflection+"\n\nLater reflection\n"+v.laterReflection+"\n\nReturn date: "+(v.returnOn||"Not chosen")+"\n","Knowledge-unsaved-reflection.txt","text/plain");});
 const actions=el("div",undefined,"journey-actions");actions.append(week,clear,save,keep);form.append(actions,status);parent.append(form);
}
export function renderJourney({parent,index,noteId,navigate}){
 showNotice(parent);
 parent.append(el("p","LEARNING MECHANICS · DEVELOPMENT CANDIDATE","kicker"),el("h2","Haumai — read, ask, reflect"),paragraph("A source-bound reading and private reflection space. Qualified explanation and practice guidance are still incomplete."));
 const nav=el("div",undefined,"journey-actions");nav.append(button("Saved Knowledge learning",()=>navigate({id:SAVED_ID})),button("Start another reflection",()=>navigate({id:JOURNEY_ID,note:"new"})));parent.append(nav);
 if(!journeyAvailable(index)){parent.append(paragraph("This journey's exact source or lesson revision is unavailable. Saved questions and reflections remain readable and exportable."));return;}
 source(parent,index);learningSlots(parent,navigate);
 const loaded=loadLearning();if(!loaded.ok){parent.append(paragraph(loaded.message));backups(parent);return;}
 const bound=loaded.records.filter(r=>sameBinding(r.binding,JOURNEY_BINDING));
 let record=noteId&&noteId!=="new"?loaded.records.find(r=>r.id===noteId):noteId==="new"?null:bound.at(-1)||null;
 if(noteId&&noteId!=="new"&&!record){parent.append(paragraph("This saved note is unavailable. Open Saved Knowledge learning to choose a record."));}
 else if(record&&!sameBinding(record.binding,JOURNEY_BINDING)){parent.append(paragraph("This saved note belongs to another source or lesson revision. Open Saved to read or export it; it cannot be moved onto this passage."));}
 else editor(parent,index,record,loaded,navigate);
 comparison(parent,index);backups(parent,r=>{if(!drafts.size&&parent.isConnected)navigate({id:SAVED_ID});});
}
export function renderSaved({parent,index,navigate}){
 showNotice(parent);
 parent.append(el("p","PRIVATE LEARNING · ON THIS DEVICE","kicker"),el("h2","Saved Knowledge learning"),paragraph("Questions and reflections you chose to save. No practice sessions, scores, or reminders are recorded."),button("Open Haumai reading and reflection",()=>navigate({id:JOURNEY_ID})));
 const loaded=loadLearning();
 if(!loaded.ok)parent.append(paragraph(loaded.message));
 else if(!loaded.records.length)parent.append(paragraph("No Knowledge reflections saved on this device yet."));
 else{
  const list=el("div",undefined,"private-learning");list.dataset.privateLearning="true";
  for(const record of loaded.records){
   const card=el("section",undefined,"saved-reflection");card.dataset.noteId=record.id;card.append(el("h3","Your saved reflection"),paragraph("Saved "+record.createdAt.slice(0,10)));
   if(record.conflictOf)card.append(paragraph("Preserved conflict version."));
   if(record.returnOn)card.append(paragraph((returnReady(record)?"Ready to revisit · ":"Chosen return date · ")+record.returnOn));
   for(const [key,title] of [["question","Your question"],["initialReflection","Your earlier reflection"],["laterReflection","Your later reflection"]]){card.append(el("h4",title));const p=el("p",record[key]||"Nothing written here.","private-copy");card.append(p);}
   if(journeyAvailable(index)&&sameBinding(record.binding,JOURNEY_BINDING))card.append(button("Open this reflection",()=>navigate({id:JOURNEY_ID,note:record.id})));
   else card.append(paragraph("The source or lesson revision for this record is unavailable. Your words remain here and in your export; they have not been attached to a different passage."));
   list.append(card);
  }parent.append(list);
 }
 backups(parent,r=>{if(parent.isConnected)navigate({id:SAVED_ID});});
}
if(typeof window!=="undefined")window.addEventListener("beforeunload",event=>{if(drafts.size){event.preventDefault();event.returnValue="";}});
