import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
JS = r'''(selectors) => {
 function parse(c){ const m=c.match(/rgba?\(([^)]+)\)/); if(!m) return null; const p=m[1].split(',').map(x=>parseFloat(x)); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; }
 function lum(c){ const f=v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b); }
 function over(fg,bg){ const a=fg.a; return {r:fg.r*a+bg.r*(1-a), g:fg.g*a+bg.g*(1-a), b:fg.b*a+bg.b*(1-a), a:1}; }
 function bgOf(el){ let layers=[]; let e=el; while(e){ const c=parse(getComputedStyle(e).backgroundColor); if(c&&c.a>0){ layers.push(c); if(c.a>=1) break; } e=e.parentElement; } let base={r:255,g:255,b:255,a:1}; for(let i=layers.length-1;i>=0;i--) base=over(layers[i],base); return base; }
 const out=[];
 for(const [name,sel] of selectors){ const el=document.querySelector(sel); if(!el){ out.push({name,sel,missing:true}); continue; }
   const cs=getComputedStyle(el); const bg=bgOf(el); let fg=parse(cs.color); const op=parseFloat(cs.opacity); if(fg.a<1||op<1){ fg=over({...fg,a:fg.a*op},bg); }
   const L1=lum(fg), L2=lum(bg); const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
   out.push({name, sel, size:cs.fontSize, weight:cs.fontWeight, ratio:Math.round(ratio*100)/100, fg:cs.color, bg:`rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`, text:(el.innerText||'').trim().slice(0,30)}); }
 return out; }'''
TARGETS_JS = r'''() => { const els=[...document.querySelectorAll('a,button,input,select,textarea,summary,[role=button],[tabindex]')].filter(e=>{const r=e.getBoundingClientRect(); const cs=getComputedStyle(e); return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&!e.closest('[hidden]')&&!(e.className||'').toString().includes('skip')&&!(e.className||'').toString().includes('sr-only')});
  const small24=[], small44=[]; for(const e of els){ const r=e.getBoundingClientRect(); const lab=(e.id?('#'+e.id+' '):'')+(e.innerText||e.getAttribute('aria-label')||e.tagName).replace(/\s+/g,' ').trim().slice(0,40)+` ${Math.round(r.width)}x${Math.round(r.height)}`; if(r.width<24||r.height<24) small24.push(lab); else if(r.width<44||r.height<44) small44.push(lab); }
  return {total:els.length, under24:small24.length, under24_samples:[...new Set(small24)].slice(0,12), between24and44:small44.length, b_samples:[...new Set(small44)].slice(0,12)} }'''
out = {}
with sync_playwright() as p:
    s = Session(p); pg = s.page
    def run(name, sels):
        r = pg.evaluate(JS, sels); out[name] = r
        for x in r:
            if x.get('missing'): print(f'  {name:26s} {x["name"]:34s} MISSING {x["sel"]}'); continue
            big = float(x['size'].replace('px', '')) >= 24 or (float(x['size'].replace('px', '')) >= 18.66 and int(x['weight']) >= 700)
            need = 3.0 if big else 4.5
            print(f'  {name:26s} {x["name"]:34s} {x["ratio"]:5.2f} need {need} {"PASS" if x["ratio"]>=need else "FAIL"}  {x["size"]:>7s} {x["fg"]} on {x["bg"]} "{x["text"]}"')
    def targets(name):
        t = pg.evaluate(TARGETS_JS); out[name + ':targets'] = t
        print(f'  {name:26s} TARGETS total {t["total"]} | under 24px: {t["under24"]} {t["under24_samples"][:6]} | 24–43px: {t["between24and44"]} {t["b_samples"][:6]}')
    pg.goto(BASE + 'index.html', wait_until='networkidle')
    home = [['hero copy', '.hero-copy'], ['smallline', '.smallline'], ['card kicker', '.section-kicker'], ['card paragraph', '.nitnem-card p'], ['card foot', '.card-foot'], ['footer p', '.footer p'], ['footer small', '.footer .small'], ['japji link', '#japji-action'], ['coming', '.coming']]
    run('home:day', home); targets('home:day'); pg.click('#home-theme'); time.sleep(0.3); run('home:amrit', home)
    pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle')
    col = [['eyebrow', '.eyebrow'], ['lede', '.lede'], ['bani number', '.bani-card .num'], ['bani small', '.bani-card small'], ['footer p', '.collection-footer p'], ['group heading span', '.group-heading span'], ['summary', '.about-reading summary']]
    run('nitnem-collection:light', col); targets('nitnem-collection:light'); pg.click('button[data-appearance="amrit"]'); time.sleep(0.3); run('nitnem-collection:dark', col); pg.click('button[data-appearance="day"]')
    pg.click('button[data-open="anand"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.5); pg.click('button[data-mode="study"]'); time.sleep(1.5)
    rd = [['Gurbani tuk', '.scripture-line .tuk'], ['meaning English', '.simple-meaning .english'], ['meaning Punjabi', '.simple-meaning .punjabi'], ['tap hint', '.simple-meaning .expand-hint'], ['reader subtitle', '#bani-subtitle'], ['variant/caveat', '#bani-variant'], ['editorial note', '.editorial-note'], ['view help', '#view-help'], ['draft label', '.unit-lesson .draft-label'], ['lesson paragraph', '.unit-lesson p[lang=en]'], ['lesson punjabi', '.unit-lesson .punjabi-text'], ['dock position small', '#position-detail'], ['dock mode inactive', '.modes button[aria-pressed=false]'], ['dock mode active', '.modes button[aria-pressed=true]'], ['source hash', '.source-hash'], ['preface', '.original-preface']]
    run('nitnem-reader:light', rd); targets('nitnem-reader-study:light'); pg.click('button[data-appearance="amrit"]'); time.sleep(0.3); run('nitnem-reader:dark', rd)
    pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(0.6); pg.click('.modes button[data-depth="study"]'); time.sleep(1.0)
    jp = [['Gurbani tuk', '.scripture-line .tuk'], ['active word', '.g-word[data-active=true]'], ['meaning English', '.simple-meaning .english, .simple-meaning span'], ['intro p', '.intro p'], ['eyebrow', '.intro .eyebrow'], ['dock inactive mode', '.modes button[aria-pressed=false]'], ['pace small', '#pace-shortcut small'], ['dock small', '#dock-position small'], ['section caption', '.section-caption h2'], ['deep study p', '.deep-study p'], ['draft label', '.draft-label'], ['version', '.version']]
    run('japji:day', jp); targets('japji-study:day')
    pg.goto(BASE + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.0); pg.click('.modes button[data-depth="understand"]'); time.sleep(1.0)
    sk = [['Gurbani tuk', '.sk-line .tuk'], ['current line tuk', '.sk-line[data-current=true] .tuk'], ['meaning English', '.simple-meaning .english'], ['meaning Punjabi', '.simple-meaning .punjabi'], ['transliteration', '.transliteration'], ['Ang label', '.ang-label'], ['scope', '#sk-scope'], ['dock small', '#sk-position small'], ['dock inactive', '.modes button[aria-pressed=false]']]
    run('sukhmani:day', sk); targets('sukhmani-meaning:day')
    s.close()
json.dump(out, open('/home/claude/work/a02_contrast_targets.json', 'w'), ensure_ascii=False, indent=1)
