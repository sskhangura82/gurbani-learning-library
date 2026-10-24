(()=>{'use strict';
const api=window.GLP_NITNEM_REGISTRY,root=document.getElementById('nitnem-groups');
if(!api||!root)return;
const categories=[['morning','Amrit Vela · Morning','ਅੰਮ੍ਰਿਤ ਵੇਲਾ'],['evening','Evening · Sodar Rehras','ਸ਼ਾਮ'],['night','Night · Kirtan Sohila','ਰਾਤ']];
const el=(name,cl,text)=>{const node=document.createElement(name);if(cl)node.className=cl;if(text!==undefined)node.textContent=text;return node;};
for(const [time,title,punjabi] of categories){
 const section=el('section','bani-group');section.dataset.time=time;
 const h=el('h3','group-title',title);const label=el('span','group-gurmukhi',punjabi);label.lang='pa';h.append(label);section.append(h);
 for(const bani of api.records.filter(x=>x.time===time)){
  const card=el('article','bani-item');card.dataset.id=bani.id;
  const left=el('div','bani-text');
  const punjabi=el('p','bani-punjabi',bani.gurmukhi);punjabi.lang='pa';left.append(punjabi,el('h4','bani-name',bani.name),el('p','bani-source',bani.sourceWork+(bani.sourceAng?' · Ang '+bani.sourceAng:'')),el('p','bani-description',bani.sourceDetail));
  const right=el('div','bani-action');
  if(bani.reader){
   const a=el('a','open-reader','Open reader ↗');a.href=bani.reader;
   right.append(a,el('small','availability','Full original Gurmukhi · educational drafts'));
  }else{
   right.append(el('span','pending','Text review underway'),el('small','availability','Not yet available in this reader'));
  }
  card.append(left,right);section.append(card);
 }
 root.append(section);
}
const ardas=api.extra.find(x=>x.id==='ardas');
if(ardas){
 const note=el('div','ardas-note');const title=el('h3','',ardas.name+' · '+ardas.gurmukhi);note.append(title,el('p','',ardas.sourceDetail));root.append(note);
}
})();
