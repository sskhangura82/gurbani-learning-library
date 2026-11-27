import {amritsarDate, validDate} from "./core.mjs";
import {loadReading, admitLesson} from "./delivery.mjs";
import {LEARNING_KEY, LIMITS, loadLearning, saveLearning, exportLearning, importLearning} from "./learning.mjs";

const $ = id => document.getElementById(id);
const text = (tag, value, className) => { const node = document.createElement(tag); node.textContent = value; if (className) node.className = className; return node; };
const PANELS = ["original", "simple", "detailed", "learning"];
const params = new URL(location.href).searchParams;
let clockDate = amritsarDate();
const requestedDates = params.getAll("date");
let selectedDate = requestedDates.length === 0 ? clockDate : requestedDates.length === 1 && validDate(requestedDates[0]) ? requestedDates[0] : "";
let followingToday = requestedDates.length === 0;
let active = null, requestNumber = 0, controller = null, busy = false, boundaryTimer = null;
let notes = loadLearning();
let editor = {id:null, binding:null, baseRevision:notes.ok ? notes.revision : 0, question:"", reflection:""};
let selectedPanel = params.get("learning") === "saved" ? "learning" : (PANELS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "original");

const messages = {
 INVALID_DATE:"Choose a valid calendar date. No reading has been substituted.",
 FUTURE_DATE:"This date has not yet arrived in Amritsar. No reading is shown.",
 TODAY_PENDING:"Today's verified selection is not available in this preview yet. Read today's publication on the official SGPC site above.",
 DATE_UNAVAILABLE:"A verified selection for this date is not available here. The official site remains available; no other reading has been substituted.",
 SOURCE_REFUSED:"The complete dated source could not be verified, so no original or explanation is shown. Your saved notes have not been changed.",
 DATE_ROLLED_OVER:"The date changed in Amritsar while the reading was opening. Checking the new date.",
 ABORTED:"The previous request was cancelled."
};

function formattedDate(value) {
 if (!validDate(value)) return value || "";
 return new Intl.DateTimeFormat("en-GB", {day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(value + "T12:00:00Z"));
}
function formatChecked(value) {
 const date = new Date(value);
 return Number.isFinite(+date) ? new Intl.DateTimeFormat("en-GB", {dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Kolkata"}).format(date) + " in Amritsar" : "Not available";
}
function external(label, href) {
 const node = text("a", label), url = new URL(href);
 if (url.protocol !== "https:" || url.username || url.password) throw Error("Invalid source link");
 node.href = url.href; node.target = "_blank"; node.rel = "noopener noreferrer"; return node;
}
function showPanel(name, {updateHash = true, focus = false} = {}) {
 if (!PANELS.includes(name)) return;
 selectedPanel = name;
 for (const key of PANELS) $(key + "-panel").hidden = key !== name;
 for (const link of document.querySelectorAll("[data-panel]")) {
  if (link.dataset.panel === name) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
 }
 if (updateHash) history.replaceState(null, "", location.pathname + location.search + "#" + name);
 if (focus) { const heading = $(name + "-title"); heading.tabIndex = -1; heading.focus({preventScroll:true}); }
}
function sameBindingSource(binding) {
 return Boolean(active && binding && binding.eventId === active.event.id && binding.date === active.event.date &&
  binding.sourceId === active.source.id && binding.edition === active.source.edition &&
  binding.sourceSha256 === active.event.source.sha256 && binding.textSha256 === active.source.textSha256);
}
function sourceBinding() {
 if (!active) return null;
 return {eventId:active.event.id,date:active.event.date,sourceId:active.source.id,edition:active.source.edition,
  sourceSha256:active.event.source.sha256,textSha256:active.source.textSha256,lineId:null,lineSha256:null};
}
function draft() {
 return {binding:editor.binding, question:$("question").value, reflection:$("reflection").value};
}
function dirty() {
 return $("question").value !== editor.question || $("reflection").value !== editor.reflection;
}
function protectDraft() {
 if (busy) { $("note-status").textContent = "Please wait for the current save or import to finish. Your text is still here."; return false; }
 if (!dirty()) return true;
 return window.confirm("You have unsaved text in Learning. Cancel to keep editing, save it, or download it. OK discards the unsaved changes before switching.");
}
function updateEditorControls() {
 const bound = Boolean(editor.binding), writable = bound && notes.ok && !busy;
 $("question").disabled = !bound || busy; $("reflection").disabled = !bound || busy;
 $("save-note").disabled = !writable;
 $("new-note").disabled = !active || busy;
 $("line-choice").disabled = !bound || Boolean(editor.id) || !sameBindingSource(editor.binding) || busy;
 $("export-draft").disabled = !bound || !dirty();
 $("export-learning").disabled = busy;
 $("import-learning").disabled = busy;
}
function refreshSelectedLine() {
 const line = sameBindingSource(editor.binding) && editor.binding.lineId ? active.source.occurrences.find(item => item.id === editor.binding.lineId && item.sha256 === editor.binding.lineSha256) : null;
 $("selected-line").textContent = line ? line.text : "";
 $("selected-line").hidden = !line;
}
function refreshEditorSource() {
 $("line-choice").replaceChildren(new Option("Complete reading", ""));
 if (active && sameBindingSource(editor.binding)) {
  for (const line of active.source.occurrences) $("line-choice").append(new Option(line.text, line.id));
 }
 if (editor.binding?.lineId) {
  if (![...$("line-choice").options].some(option => option.value === editor.binding.lineId)) $("line-choice").append(new Option("Saved line — its original source is not open", editor.binding.lineId));
  $("line-choice").value = editor.binding.lineId;
 }
 if (!editor.binding) $("editor-source").textContent = "Open a verified dated reading to start a new note, or open a saved note below.";
 else {
  const detail = sameBindingSource(editor.binding) ? "This note is attached to this exact original." : "This note keeps its saved source identity. That exact original is not currently open; it has not been attached to another reading.";
  $("editor-source").textContent = formattedDate(editor.binding.date) + " · " + detail;
 }
 refreshSelectedLine(); updateEditorControls();
}
function setEditor(record = null) {
 editor = {id:record?.id || null,binding:record ? structuredClone(record.binding) : sourceBinding(),
  baseRevision:notes.ok ? notes.revision : 0,question:record?.question || "",reflection:record?.reflection || ""};
 $("question").value = editor.question; $("reflection").value = editor.reflection;
 refreshEditorSource();
 $("note-title").textContent = record ? "Your saved question and reflection" : "Your private question and reflection";
 $("note-status").textContent = record ? (record.conflictOf ? "This is a preserved version of a conflicting edit." : "Saved note opened. Changes stay unsaved until you choose Save.") : "No note has been saved by opening this page.";
 if (!notes.ok) $("note-status").textContent = notes.message;
 refreshSelectedLine(); updateEditorControls();
}
function clearReading() {
 active = null;
 $("reading").hidden = true; $("reading-empty").hidden = false;
 $("scripture").replaceChildren(); $("source-details").replaceChildren();
 $("reading-title").textContent = ""; $("meta").textContent = ""; $("checked").textContent = "";
 for (const layer of ["simple","detailed","learning"]) {
  $(layer + "-content").replaceChildren(); $(layer + "-pending").hidden = false;
 }
}
function refreshReadingLabels() {
 if (!active) return;
 const current = active.event.date === amritsarDate();
 $("reading-title").textContent = (current ? "Today's original · " : "Historical original · ") + formattedDate(active.event.date);
 $("meta").textContent = "Ang " + active.source.angStart + (active.source.angEnd !== active.source.angStart ? "–" + active.source.angEnd : "") + " · Sri Harmandir Sahib";
 $("checked").textContent = "Source checked " + formatChecked(active.event.checkedAtUtc) + ".";
 $("status").textContent = (active.fromCache ? "Opened from this browser's verified source cache." : "Complete original text checked.") + " Development preview.";
}
function showSourceLine(id) {
 const node = [...$("scripture").children].find(item => item.dataset.occurrence === id);
 if (!node) return;
 showPanel("original"); node.tabIndex = -1; node.focus({preventScroll:true}); node.scrollIntoView({block:"center",behavior:"auto"});
}
function renderLessons() {
 for (const layer of ["simple","detailed","learning"]) {
  const admitted = admitLesson(active.event.lessons?.[layer]?.en, {event:active.event,source:active.source,layer,language:"en"});
  const container = $(layer + "-content"); container.replaceChildren(); $(layer + "-pending").hidden = Boolean(admitted);
  if (!admitted) continue;
  container.append(text("p", "Qualified review: " + admitted.review.reviewer.name + " · " + admitted.review.reviewer.qualification, "review-label"));
  for (const claim of admitted.claims) {
   const paragraph = text("p", claim.text); container.append(paragraph);
   const citations = document.createElement("div"); citations.className = "claim-citations";
   claim.citations.forEach((citation, index) => { const button = text("button", "View source line" + (claim.citations.length > 1 ? " " + (index + 1) : ""), "secondary"); button.type = "button"; button.addEventListener("click", () => showSourceLine(citation.occurrenceId)); citations.append(button); });
   container.append(citations);
  }
 }
}
function renderReading(result) {
 active = result;
 $("scripture").replaceChildren();
 for (const line of result.source.occurrences) {
  const block = document.createElement("div"); block.className = "pankti"; block.dataset.kind = line.kind; block.dataset.occurrence = line.id;
  block.append(text("p", line.text, "original-text"));
  block.append(text("small", (line.kind === "rahao" ? "Rahao · " : "") + "Ang " + line.ang, "line-reference"));
  $("scripture").append(block);
 }
 $("source-details").append(
  text("p", "Official dated selection: " + result.event.date + (result.event.officialDisplayedTime ? " · published time shown by SGPC: " + result.event.officialDisplayedTime : "")),
  text("p", "The complete ordered original was compared with a pinned digital transcription. This is a digital comparison, not a claim of qualified approval."),
  text("p", "Independent and qualified review remain separate. Daily automatic publication is not yet enabled."),
  text("p", "The library signs its own dated data to detect transport changes. SGPC has not signed the library’s record."),
  external("Open SGPC's current publication ↗", result.event.sourceUrl),
  text("p", "The external portal shows its current publication; check its date separately.")
 );
 if (result.source.provenance?.pages) {
  const list = document.createElement("ul");
  for (const page of result.source.provenance.pages) { const item = document.createElement("li"); item.append(external("Digital reference · Ang " + page.ang, page.url)); list.append(item); }
  $("source-details").append(list);
 }
 $("reading").hidden = false; $("reading-empty").hidden = true;
 refreshReadingLabels(); renderLessons();
}
function updateDateAddress(date, {today = false, preserveInvalidURL = false} = {}) {
 const address = new URL(location.href);
 if (today) address.searchParams.delete("date");
 else if (validDate(date) || !preserveInvalidURL) address.searchParams.set("date", date);
 history.replaceState(null, "", address.pathname + address.search + address.hash);
}
async function openDate(date, {today = false, record = null, bypassGuard = false, preserveInvalidURL = false} = {}) {
 if (!bypassGuard && !protectDraft()) { $("date").value = selectedDate; return false; }
 followingToday = today; selectedDate = date; updateDateAddress(date, {today,preserveInvalidURL});
 if (validDate(date)) $("date-controls").open = false;
 const request = ++requestNumber;
 if (controller) controller.abort(); controller = new AbortController();
 clearReading(); setEditor(record); $("date").value = date;
 $("rollover").hidden = true; $("status").textContent = "Checking the complete original for " + (formattedDate(date) || "the selected date") + "…";
 let result;
 try { result = await loadReading(date, {baseURL:new URL("./", location.href),signal:controller.signal}); } catch { result = {status:"SOURCE_REFUSED"}; }
 if (request !== requestNumber) return false;
 if (result.status === "DATE_ROLLED_OVER" && followingToday && !dirty()) {
  clockDate = amritsarDate(); return openDate(clockDate, {today:true,bypassGuard:true});
 }
 // A late response must never regain today's label after the Amritsar date changes.
 if (followingToday && date !== amritsarDate() && !dirty()) return openDate(amritsarDate(), {today:true,bypassGuard:true});
 if (result.status !== "DIGITAL_TEXT_VERIFIED_PREVIEW") {
  $("status").textContent = messages[result.status] || messages.SOURCE_REFUSED;
  // Existing notes can be edited while the source is pending. Never reset their text on a response.
  if (record) refreshEditorSource();
  return false;
 }
 renderReading(result);
 if (record) refreshEditorSource(); else if (!dirty()) setEditor();
 return true;
}
function refreshSaved() {
 notes = loadLearning();
 $("saved-list").replaceChildren();
 if (!notes.ok) { $("saved-status").textContent = notes.message; updateEditorControls(); return; }
 $("saved-status").textContent = notes.records.length ? "These notes belong to this browser. Each keeps its original date and source identity." : "No Daily Hukamnama notes are saved on this device yet.";
 const sorted = [...notes.records].sort((a,b) => b.binding.date.localeCompare(a.binding.date) || b.updatedAt.localeCompare(a.updatedAt));
 for (const record of sorted) {
  const item = document.createElement("li"); item.className = "saved-card";
  item.append(text("h4", formattedDate(record.binding.date)), text("p", record.binding.lineId ? "Attached to one exact line" : "Attached to the complete original", "small"));
  if (record.conflictOf) item.append(text("p", "Preserved version from a conflicting edit", "state-label"));
  if (record.question) { item.append(text("strong", "My question"), text("p", record.question, "private-preview")); }
  if (record.reflection) { item.append(text("strong", "My reflection"), text("p", record.reflection, "private-preview")); }
  const button = text("button", "Open saved note", "secondary"); button.type = "button"; button.dataset.noteId = record.id;
  button.addEventListener("click", async () => {
   if (!protectDraft()) return;
   showPanel("learning");
   await openDate(record.binding.date, {record,bypassGuard:true});
   $("note-title").scrollIntoView({block:"start",behavior:"auto"});
  });
  item.append(button); $("saved-list").append(item);
 }
 updateEditorControls();
}
function download(content, filename, type = "application/json;charset=utf-8") {
 const url = URL.createObjectURL(new Blob([content], {type})), link = document.createElement("a");
 link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
 setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function saveNote(event) {
 event.preventDefault();
 if (!editor.binding || busy) return;
 const submitted = draft(), recordId = editor.id;
 if (!submitted.question && !submitted.reflection) { $("note-status").textContent = "Write a question or a reflection before saving."; return; }
 const submittedRecord = {...submitted}; if (recordId) submittedRecord.id = recordId;
 busy = true; updateEditorControls();
 let result;
 try { result = await saveLearning({record:submittedRecord,baseRevision:editor.baseRevision}); }
 catch { result = {ok:false,message:"The note could not be saved. Your text is still here; download the unsaved text before leaving."}; }
 busy = false;
 if (result.ok) {
  editor = {...editor,id:result.savedRecord.id,baseRevision:result.revision,question:submitted.question,reflection:submitted.reflection};
  refreshSaved(); $("note-title").textContent = "Your saved question and reflection";
 }
 $("note-status").textContent = result.message;
 updateEditorControls();
}
async function importBackup(file) {
 if (!file || busy) return;
 if (file.size > LIMITS.store * 8) { $("backup-status").textContent = "This file is too large for a Daily backup. Your existing record has been preserved."; return; }
 busy = true; updateEditorControls();
 let result;
 try { result = await importLearning({text:await file.text()}); }
 catch { result = {ok:false,message:"The backup could not be read. Your existing record and any unsaved text have been preserved."}; }
 busy = false;
 // Retain the editor's base revision: a concurrent/imported change must be preserved as a conflict, not overwritten.
 if (result.ok) refreshSaved();
 $("backup-status").textContent = result.message;
 updateEditorControls();
}
function scheduleClockBoundary() {
 clearTimeout(boundaryTimer);
 // Asia/Kolkata uses IST. Schedule the next local midnight, not a periodic stale-today window.
 const nextMidnight = Date.parse(amritsarDate() + "T00:00:00+05:30") + 86400000;
 boundaryTimer = setTimeout(checkClock, Math.max(1, nextMidnight - Date.now()));
}
function checkClock() {
 scheduleClockBoundary();
 const next = amritsarDate(); $("clock").textContent = "Today in Amritsar: " + formattedDate(next); $("date").max = next;
 if (clockDate === next) return;
 clockDate = next;
 if (active) refreshReadingLabels();
 if (followingToday && selectedDate !== next) {
  if (dirty() || busy) {
   followingToday = false; updateDateAddress(selectedDate); $("rollover").hidden = false;
   $("rollover").textContent = "A new date has begun in Amritsar. Your unsaved text stays attached to " + formattedDate(selectedDate) + ". Save or download it, then choose Today in Amritsar.";
  } else { void openDate(next, {today:true,bypassGuard:true}); }
 }
}
async function registerOffline() {
 const area = $("offline-status");
 if (!("serviceWorker" in navigator) || !globalThis.isSecureContext) { area.textContent = "Offline reader pages are not available in this browser context."; return; }
 try {
  const registration = await navigator.serviceWorker.register(new URL("../sw.js", import.meta.url), {updateViaCache:"none"});
  const report = () => {
   if (registration.waiting) area.textContent = "A reader update is waiting. Open the Library home for the explicit update controls; this page will not reload itself.";
   else if (registration.active) area.textContent = "The reader shell is available offline. A dated reading must also be saved in this browser’s verified source cache.";
   else area.textContent = "Downloading the reader pages for offline use…";
  };
  report(); registration.addEventListener("updatefound", () => { const worker = registration.installing; if (worker) worker.addEventListener("statechange", report); report(); });
  navigator.serviceWorker.addEventListener("controllerchange", report);
 } catch { area.textContent = "Offline reader pages could not be prepared. Online reading and private-note recovery remain separate."; }
}
function init() {
 const offline = document.createElement("p"); offline.id = "offline-status"; offline.className = "small no-print"; offline.textContent = "Checking offline reader availability…";
 const home = document.createElement("p"); home.className = "small no-print"; const homeLink = text("a", "Library home and update controls"); homeLink.href = "../index.html"; home.append(homeLink);
 $("date-help").after(offline, home);
 // Let the validator refuse oversized text intact; browser maxlength would silently cut a paste.
 $("open").disabled = false; $("today").disabled = false;
 for (const link of document.querySelectorAll("[data-panel]")) link.addEventListener("click", event => { event.preventDefault(); showPanel(link.dataset.panel, {focus:true}); });
 window.addEventListener("hashchange", () => showPanel(location.hash.slice(1), {updateHash:false}));
 $("open").addEventListener("click", () => openDate($("date").value));
 $("today").addEventListener("click", () => openDate(amritsarDate(), {today:true}));
 $("date").addEventListener("keydown", event => { if (event.key === "Enter") { event.preventDefault(); void openDate($("date").value); } });
 $("font-size").addEventListener("input", () => { const value = Number($("font-size").value); if (value >= 24 && value <= 52) { $("scripture").style.setProperty("--g-size", value + "px"); $("font-value").textContent = value + " px"; } });
 $("print").addEventListener("click", () => window.print());
 $("line-choice").addEventListener("change", () => {
  if (editor.id || !active || !editor.binding) return;
  const line = active.source.occurrences.find(item => item.id === $("line-choice").value);
  editor.binding = {...sourceBinding(),lineId:line?.id || null,lineSha256:line?.sha256 || null};
  refreshSelectedLine();
 });
 for (const id of ["question","reflection"]) $(id).addEventListener("input", () => { $("note-status").textContent = dirty() ? "Unsaved text — save on this device or download it before leaving." : "No unsaved changes."; updateEditorControls(); });
 $("note-form").addEventListener("submit", saveNote);
 $("saved-link").addEventListener("click", event => { event.preventDefault(); showPanel("learning"); $("saved-notes").scrollIntoView({block:"start",behavior:"auto"}); });
 $("new-note").addEventListener("click", () => { if (protectDraft()) { refreshSaved(); setEditor(); } });
 $("export-draft").addEventListener("click", () => {
  if (!editor.binding) return;
  download(JSON.stringify({format:"glp-hukamnama-unsaved-text",version:1,...draft()}, null, 2) + "\n", "Hukamnama-unsaved-text.json");
  $("note-status").textContent = "Your current text was downloaded as a recovery file. This is not an importable Daily backup; the unsaved text remains here.";
 });
 $("export-learning").addEventListener("click", () => {
  const result = exportLearning();
  if (!result.ok) { $("backup-status").textContent = result.message; return; }
  download(result.text, result.filename);
  $("backup-status").textContent = "Saved Daily learning exported." + (dirty() ? " Your current unsaved text is not in this backup; use Download unsaved text for it." : "");
 });
 $("import-learning").addEventListener("click", () => $("import-file").click());
 $("import-file").addEventListener("change", async () => { const file = $("import-file").files[0]; $("import-file").value = ""; await importBackup(file); });
 window.addEventListener("beforeunload", event => { if (dirty() || busy) { event.preventDefault(); event.returnValue = ""; } });
 window.addEventListener("storage", event => { if (event.key === LEARNING_KEY || event.key === null) { refreshSaved(); if (editor.id) $("note-status").textContent = "Saved learning changed in another tab. Your current text stays here; saving keeps conflicting versions separately."; } });
 document.addEventListener("visibilitychange", () => { if (!document.hidden) checkClock(); });
 window.addEventListener("pageshow", checkClock); window.addEventListener("focus", checkClock);
 showPanel(selectedPanel, {updateHash:false}); refreshSaved(); checkClock();
 void openDate(selectedDate, {today:followingToday,bypassGuard:true,preserveInvalidURL:requestedDates.length > 0 && selectedDate === ""});
 void registerOffline();
}
init();
