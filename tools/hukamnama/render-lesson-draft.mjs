// Makes the reading copy of a DRAFT lesson for human reviewers. The Gurmukhi of the Shabad is drawn from the checked source file,
// never from the lesson file. Run: node tools/hukamnama/render-lesson-draft.mjs
import fs from "node:fs";
const root=new URL("../../",import.meta.url),read=p=>fs.readFileSync(new URL(p,root),"utf8");
const base="drafts/hukamnama-lessons/sggs.gujri.m1.ang504.shabad04.lesson.draft";
const L=JSON.parse(read(base+".json")),F=JSON.parse(read("hukamnama/fixture.json"));
const occ=new Map(F.canonical.occurrences.map(o=>[o.id.split(".").pop(),o])),refs=new Map(L.deep.gurbaniReferences.map(g=>[g.id,g]));
const out=[];const w=(...a)=>out.push(...a,"");
w("# Draft lesson — Gujri Mahalla 1, Ang 504–505","**"+L.status.replaceAll("_"," ")+"**","Written by "+L.writtenBy+" "+L.written+". For cross-review by "+L.forCrossReviewBy+".",
  "> This reading copy is made by a script from `"+base+".json`. The Gurmukhi of the Shabad is drawn from `hukamnama/fixture.json` when the copy is made. If the two ever differ, the source file governs.",
  "Layers are kept apart and labelled: **scripture · literal meaning · teaching · comparison · human sciences · reflection.** "+L.rules.notTreatment);
w("---","## The Shabad","*Scripture, from the checked source file. "+L.shabad.author+" · Raag "+L.shabad.raag+" · Ang "+L.shabad.ang+".*");
for(const o of F.canonical.occurrences)out.push("> "+o.text+(o.kind==="rahao"?"  ← *Rahao*":"")+"  ");
w("",L.shabad.placeInTheGranth);
w("---","## Level 1 — Simple","*"+L.simple.intendedReadingMinutes+"*","### English",...L.simple.en.flatMap(p=>[p,""]),"*Reflection.* "+L.simple.reflection.en,"### ਪੰਜਾਬੀ",...L.simple.pa.flatMap(p=>[p,""]),"*ਵਿਚਾਰ।* "+L.simple.reflection.pa);
w("---","## Level 2 — Detailed","*"+L.detailed.intendedReadingMinutes+"*");
for(const u of L.detailed.units){
 w("### "+u.label.en+" · "+u.label.pa);
 for(const l of u.lines){const o=occ.get(l.occ);
  w("> **"+o.text+"**  ","> *Scripture · Ang "+o.ang+" · line "+o.printedLine+" · `"+l.occ+"`*");
  w("**Literal meaning.** "+l.en+"  ","**ਅੱਖਰੀ ਅਰਥ।** "+l.pa);
  out.push("| Word | Roman (approximate) | English | ਪੰਜਾਬੀ |","|---|---|---|---|",...l.words.map(x=>"| "+x.g+" | "+x.roman+" | "+x.en+" | "+x.pa+" |"),"");
  if(l.note)w("*Note on the reading.* "+l.note.en+"  ","*ਪਾਠ ਬਾਰੇ ਨੋਟ।* "+l.note.pa);}
 w("**Teaching.** "+u.teaching.en,"**ਵਿਚਾਰ।** "+u.teaching.pa);
}
w("---","## Level 3 — Deep study","*"+L.deep.intendedReadingMinutes+"*");
for(const s of L.deep.sections){w("### "+s.title.en+" · "+s.title.pa,s.en,s.pa);
 if(s.gurbani)w(...s.gurbani.map(id=>{const g=refs.get(id);return "> "+g.text+"  \n> *Scripture · Ang "+g.ang+" · "+g.by+"*";}));}
w("*"+L.deep.gurbaniReferencesNote+"*");
w("### Comparison with other traditions · ਹੋਰ ਪਰੰਪਰਾਵਾਂ ਨਾਲ ਤੁਲਨਾ",L.deep.comparisons.howToRead.en,L.deep.comparisons.howToRead.pa);
for(const c of L.deep.comparisons.items)w("#### "+c.tradition.en+" · "+c.tradition.pa,"*Source: "+c.citation+" · beside lines "+c.relatesTo.map(x=>"`"+x+"`").join(", ")+"*",
 "**Resemblance.** "+c.resemblance.en+"  ","**Difference.** "+c.difference.en,"**ਸਾਂਝ।** "+c.resemblance.pa+"  ","**ਫ਼ਰਕ।** "+c.difference.pa);
w("### Human sciences · ਮਨੁੱਖੀ ਵਿਗਿਆਨ",L.deep.humanSciences.en,L.deep.humanSciences.pa,...L.deep.humanSciences.sources.map(s=>"- "+s));
w("### Reflection · ਵਿਚਾਰ",...L.deep.reflection.map((r,i)=>(i+1)+". "+r.en+"  \n   "+r.pa));
w("---","## Points the writer is unsure of — for qualified reviewers",...L.openQuestionsForQualifiedReviewers.map(q=>"- `"+q.occ+"` "+q.question));
fs.writeFileSync(new URL(base+".md",root),out.join("\n"));console.log("written "+base+".md, "+out.length+" lines");
