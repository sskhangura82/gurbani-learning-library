import json, sys
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
with sync_playwright() as p:
    s = Session(p); pg = s.page
    def open_bani(comp):
        pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle')
        pg.click(f'button[data-open="{comp}"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.5)
    def show(line_id, name, block='center'):
        pg.evaluate('''([id,block]) => document.querySelector(`[data-line-id="${id}"]`).scrollIntoView({block})''', [line_id, block]); time.sleep(0.4); s.shot(name)
    open_bani('anand'); show('anand24.line03', '20_anand24_kachi')
    open_bani('jaap'); show('jaap097.line01', '21_jaap096_098_chatr'); show('jaap179.line04', '22_jaap179')
    open_bani('rehras'); pg.evaluate('window.scrollTo(0, 560)'); time.sleep(0.3); s.shot('23_rehras_sodar_top'); show('rehras.sggs02.line01', '24_rehras_sggs02', 'start'); show('rehras.savaiya01.line01','25_rehras_savaiya','start')
    open_bani('savaiye'); pg.evaluate('window.scrollTo(0, 560)'); time.sleep(0.3); s.shot('26_savaiye_preface')
    open_bani('chaupai'); pg.evaluate('window.scrollTo(0, 560)'); time.sleep(0.3); s.shot('27_chaupai_preface')
    s.close()
