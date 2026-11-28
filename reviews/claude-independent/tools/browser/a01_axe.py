import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
AXE = open('/home/claude/refs/axe/package/axe.min.js', encoding='utf-8').read()
results = {}
def run_axe(pg, name):
    pg.evaluate(AXE)
    r = pg.evaluate('''async () => { const r = await axe.run(document, {runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}, resultTypes:['violations','incomplete']}); return {violations: r.violations.map(v => ({id:v.id, impact:v.impact, help:v.help, tags:v.tags.filter(t=>t.startsWith('wcag')), nodes:v.nodes.length, sample:v.nodes.slice(0,3).map(n => ({target:n.target.join(' '), html:n.html.slice(0,160), summary:(n.failureSummary||'').slice(0,220)}))})), incomplete: r.incomplete.map(v => ({id:v.id, impact:v.impact, nodes:v.nodes.length}))} }''')
    results[name] = r
    print(f'--- {name}: violations={len(r["violations"])}', [(v['id'], v['impact'], v['nodes']) for v in r['violations']], '| incomplete:', [(v['id'], v['nodes']) for v in r['incomplete']])
with sync_playwright() as p:
    s = Session(p); pg = s.page
    pg.goto(BASE + 'index.html', wait_until='networkidle'); run_axe(pg, 'home:light')
    pg.click('#home-theme'); time.sleep(0.3); run_axe(pg, 'home:amrit')
    pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle'); run_axe(pg, 'nitnem-collection:light')
    pg.click('button[data-appearance="amrit"]'); time.sleep(0.3); run_axe(pg, 'nitnem-collection:dark')
    pg.click('button[data-appearance="day"]'); time.sleep(0.2)
    pg.click('button[data-open="sohila"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.5); run_axe(pg, 'nitnem-reader-sohila:read:light')
    pg.click('button[data-mode="meaning"]'); time.sleep(1.5); run_axe(pg, 'nitnem-reader-sohila:meaning:light')
    pg.click('button[data-mode="study"]'); time.sleep(1.5); run_axe(pg, 'nitnem-reader-sohila:study:light')
    pg.click('button[data-appearance="amrit"]'); time.sleep(0.3); run_axe(pg, 'nitnem-reader-sohila:study:dark')
    pg.click('#reading-tools'); time.sleep(0.4); run_axe(pg, 'nitnem-tools-dialog:dark'); pg.keyboard.press('Escape')
    pg.click('button[data-appearance="day"]'); time.sleep(0.2); pg.click('#reading-tools'); time.sleep(0.4); run_axe(pg, 'nitnem-tools-dialog:light'); pg.keyboard.press('Escape')
    pg.click('#jump'); time.sleep(0.4); run_axe(pg, 'nitnem-jump-dialog:light'); pg.keyboard.press('Escape')
    pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); time.sleep(0.6); run_axe(pg, 'japji:read')
    pg.click('.modes button[data-depth="understand"]'); time.sleep(1.0); run_axe(pg, 'japji:meaning')
    pg.click('.modes button[data-depth="study"]'); time.sleep(1.0); run_axe(pg, 'japji:study')
    pg.click('#tools-open'); time.sleep(0.5); run_axe(pg, 'japji:tools'); 
    print('JAPJI TOOLS TEXT:', pg.inner_text('#reader-dialog')[:1800].replace('\n', ' | '))
    s.shot('40_japji_tools')
    pg.keyboard.press('Escape')
    pg.goto(BASE + 'sukhmani.html', wait_until='networkidle'); time.sleep(1.0); run_axe(pg, 'sukhmani:read')
    pg.click('.modes button[data-depth="understand"]'); time.sleep(1.2); run_axe(pg, 'sukhmani:meaning')
    for u in ['simran.html', 'gurdwaras.html', 'gurdwara.html', 'pauri-2-lesson.html']:
        pg.goto(BASE + u, wait_until='networkidle'); time.sleep(0.5); run_axe(pg, u)
    s.close()
json.dump(results, open('/home/claude/work/a01_axe.json', 'w'), ensure_ascii=False, indent=1)
