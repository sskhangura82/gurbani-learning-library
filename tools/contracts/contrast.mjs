/** GLP-001 WCAG 2.x relative luminance helper; opaque sRGB hex only. */
export function luminance(hex){
 if(typeof hex!=='string'||!/^#[0-9a-f]{6}$/i.test(hex))throw Error('Opaque six-digit hex required');
 const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);
 return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
}
export function contrastRatio(a,b){
 const x=luminance(a),y=luminance(b);
 return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
export function assertReadableInk({ink,ground,minimum=4.5,role}){
 const ratio=contrastRatio(ink,ground);
 if(ratio<minimum)throw Error('Insufficient contrast '+(role||'text')+': '+ratio.toFixed(2));
 return {ratio:Math.round(ratio*100)/100,role:role||'text'};
}
