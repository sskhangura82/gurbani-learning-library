// Retrieval-only normalization. Never write these forms back to scripture.
const normalize = value => String(value ?? "").normalize("NFC").toLowerCase().trim().replace(/\s+/gu," ");
const digits = value => value.replace(/[੦-੯]/gu,c => String("੦੧੨੩੪੫੬੭੮੯".indexOf(c)));
const words = value => normalize(value).match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu) || [];
const roman = value => normalize(value).normalize("NFD").replace(/(\p{Script=Latin})\p{M}+/gu,"$1").normalize("NFC");
const labelWords = value => words(digits(roman(value))).join(" ");
const carriers = new Map([...["ੳਉਊਓ","ਅਆਐਔ","ੲਇਈਏ"].flatMap(group => [...group].map(c => [c,group[0]]))]);
const firstUnit = token => [...token][0]+([...token][1]==="਼"?"਼":"");
const foldInitial = unit => digits(carriers.get(unit) || unit);
const scriptLetter = c => /\p{L}/u.test(c) && /\p{Script=Gurmukhi}/u.test(c);
const modes = new Set(["auto","phrase","first-letter","first-letter-anywhere"]);
const lookupAliases = {
 "composition.asa-di-vaar":["Asa Ki Vaar","Asa Ki Var","ਆਸਾ ਕੀ ਵਾਰ"],
 "author.guru-nanak":["Guru Nanak Dev","Mehl 1","Mahalla 1","Mahala 1","Mahla 1","M1","ਮਹਲਾ ੧","ਮਃ ੧","ਗੁਰੂ ਨਾਨਕ","ਨਾਨਕ"],
 "author.guru-angad":["Guru Angad Dev","Mehl 2","Mahalla 2","Mahala 2","Mahla 2","M2","ਮਹਲਾ ੨","ਮਃ ੨","ਗੁਰੂ ਅੰਗਦ","ਅੰਗਦ"],
 "author.bhagat-kabir":["Bhagat Kabir","Bhagat Kabeer","ਭਗਤ ਕਬੀਰ","ਕਬੀਰ"],
 "raag.asa":["aasaa"],
 "concept.humility":["nimrta","humbleness"],
 "concept.haumai":["houmai","haumein"],
 "concept.seva":["sewa"],
 "concept.shabad":["sabad","ਸਬਦੁ"]
};
const cache = new WeakMap();
function retrieveIndex(index) {
 if(cache.has(index)) return cache.get(index);
 const labels = index.graph.nodes.map(node => ({
  node, labels:[node.title,node.pa,node.editorialTitle,node.editorialPa,...(node.aliases || []),...(lookupAliases[node.id] || [])]
   .filter(x => typeof x === "string" && x.trim()).map(labelWords)
 }));
 const passages = index.passages.map(node => ({
  node, lines:node.occurrenceIds.map(id => {
   const occurrence=index.occ.get(id), tokens=words(occurrence.text);
   return {occurrence,tokens,initials:tokens.map(token => foldInitial(firstUnit(token)))};
  })
 }));
 const value={labels,passages};cache.set(index,value);return value;
}
function aliasQuery(query) {
 // Accept an exact indexed name, optionally in a narrow question frame.
 // Remaining substantive words are not discarded: "psychology of colour" is not "psychology".
 return labelWords(query).replace(/^(?:what (?:is|are|does)|tell me about|teach me about|show me|learn about)\s+/u,"")
  .replace(/\s+(?:mean|means)$/u,"");
}
function phraseAt(haystack,needle) {
 if(!needle.length || needle.length>haystack.length) return false;
 for(let i=0;i<=haystack.length-needle.length;i++) if(needle.every((token,j) => token===haystack[i+j])) return true;
 return false;
}
function initialsQuery(query) {
 const compact=query.replace(/\s+/gu,"");
 const units=compact.match(/[\p{L}0-9੦-੯]\u0a3c?/gu) || [];
 if(units.length<2 || units.join("")!==compact || !units.some(unit=>scriptLetter([...unit][0]))) return null;
 if(!units.every(unit=>scriptLetter([...unit][0]) || /^[0-9੦-੯]$/u.test(unit))) return null;
 return units.map(foldInitial);
}
function referenceMatches(node,q) {
 const kabir=q.match(/^(?:(?:bhagat|ਭਗਤ)\s+)?(?:kabir|kabeer|ਕਬੀਰ)(?:\s+(?:ji|ਜੀ))?\s+(?:salok|slok|ਸਲੋਕ)\s*(\d{1,3})$/u);
 if(kabir) return node.compositionId==="composition.kabir-saloks" && node.salokPosition===Number(kabir[1]);
 const asa=q.match(/^(?:asa (?:di|ki) va{1,2}r|ਆਸਾ (?:ਦੀ|ਕੀ) ਵਾਰ)\s+(?:pauri|ਪਉੜੀ)\s*(\d{1,3})\s+(?:salok|slok|ਸਲੋਕ)\s*(\d{1,3})$/u);
 return !!asa && node.compositionId==="composition.asa-di-vaar" && node.pauriNumber===Number(asa[1]) && node.salokPosition===Number(asa[2]);
}
const relationReasons={
 discusses:"Related topic",written_by:"Author",contains:"Composition",attested_in:"Word in this passage",in_raag:"Raag"
};
export function search(index,query,{mode="auto",author="",type="",collection=""}={}) {
 const q=normalize(query);
 if(!q || [...q].length>240 || !modes.has(mode) || /(?:^|\s)[+−-]\s*\d/u.test(digits(q))) return [];
 const {labels,passages}=retrieveIndex(index), matches=new Map();
 const allowed=node => (!type || node.type===type) && (!author || node.type==="passage" && node.authorId===author) &&
  (!collection || node.type==="passage" && node.collectionId===collection);
 const add=(node,score,reason,occurrenceIds=[]) => {
  const prior=matches.get(node.id);
  if(prior && prior.score>score) return;
  const ids=prior?.score===score ? [...new Set([...prior.occurrenceIds,...occurrenceIds])] : occurrenceIds;
  matches.set(node.id,{id:node.id,type:node.type,title:node.title,score,reason,occurrenceIds:ids});
 };
 const ang=digits(q).match(/^(?:(?:ang|ank|ਅੰਗ|page|ਪੰਨਾ|p\.)\s*:?\s*)?(\d{1,4})$/u);
 if(ang) {
  const value=Number(ang[1]);
  if(value<1 || value>1430) return [];
  for(const {node} of passages) if(value>=node.angStart && value<=node.angEnd) add(node,120,"Ang "+value);
 } else {
  if(mode==="auto") {
   const exact=labelWords(q),framed=aliasQuery(q);
   for(const {node,labels:names} of labels) {
    if(names.includes(exact)) add(node,100,"Exact name or indexed alias");
    else if(framed!==exact && names.includes(framed)) add(node,90,"Indexed name in question");
   }
   for(const {node} of passages) if(referenceMatches(node,labelWords(roman(q).replace(/(?:\u0027|\u2019)s\b/gu,"")))) add(node,125,"Composition reference");
  }
  const needle=words(q);
  // Bare signs/numerals and one-letter snippets are not word/phrase queries.
  const hasPhrase=needle.some(token => [...token].some(scriptLetter)) && [...needle.join("")].length>=2;
  let hasText=false;
  if((mode==="auto" || mode==="phrase") && hasPhrase) {
   for(const {node,lines} of passages) {
    const found=lines.filter(line => phraseAt(line.tokens,needle)).map(line => line.occurrence.id);
    if(found.length) {add(node,115,"Complete words in the original text",found);if(allowed(node))hasText=true;}
   }
  }
  const initial=initialsQuery(q);
  if(initial && (mode==="first-letter" || mode==="first-letter-anywhere" || mode==="auto" && !hasText)) {
   const anywhere=mode==="first-letter-anywhere";
   for(const {node,lines} of passages) {
    const found=lines.filter(line => anywhere?phraseAt(line.initials,initial):initial.length<=line.initials.length && initial.every((unit,i)=>unit===line.initials[i])).map(line => line.occurrence.id);
    if(found.length) add(node,110,anywhere?"First letters within a line":"First letters at the start of a line",found);
   }
  }
  if(mode==="auto") {
   for(const hit of [...matches.values()]) {
    if(hit.type==="passage") continue;
    for(const edge of index.graph.edges) {
     if(!relationReasons[edge.type] || edge.to!==hit.id && edge.from!==hit.id) continue;
     const other=index.nodes.get(edge.from===hit.id?edge.to:edge.from);
     if(other?.type==="passage") add(other,Math.max(35,hit.score-20),relationReasons[edge.type]+" · "+hit.title);
    }
   }
  }
 }
 return [...matches.values()].filter(hit=>allowed(index.nodes.get(hit.id))).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
