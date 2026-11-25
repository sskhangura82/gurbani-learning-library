"""D-01..D-08 adversarial saved-learning tests on the Nitnem reader. Synthetic data only."""
import json, sys, os, tempfile
sys.path.insert(0, '/home/claude/work/tools')
from pw_common import *
R = {}
KEY_PREFIX = 'glp001.nitnem.PRIVATE-SOURCE-REVIEW.v1.'
def open_bani(pg, comp='sohila'):
    pg.goto(BASE + 'nitnem/index.html', wait_until='networkidle')
    pg.click(f'button[data-open="{comp}"]'); pg.wait_for_load_state('networkidle'); time.sleep(0.6)
def store(pg): return pg.evaluate('Object.fromEntries(Object.entries(localStorage))')
def rec(pg, comp='sohila'):
    st = store(pg); ks = [k for k in st if k.startswith(KEY_PREFIX + comp + '.')]
    return (ks[0], json.loads(st[ks[0]])) if ks else (None, None)
def write_note(pg, text):
    pg.click('#reading-tools'); time.sleep(0.4)
    pg.fill('#note', text); pg.click('#save-note'); time.sleep(0.6)
    status = pg.inner_text('#save-status'); pg.keyboard.press('Escape'); time.sleep(0.2); return status
def toasts(pg): return pg.evaluate('[...document.querySelectorAll("[role=status],[role=alert],.review-mode,#learning-status")].map(e=>e.innerText.trim()).filter(Boolean)')
with sync_playwright() as p:
    s = Session(p); pg = s.page
    # D-01 persistence: bookmark + note, reload, navigate away and back
    open_bani(pg)
    pg.click('#reading-tools'); time.sleep(0.3); pg.click('#bookmark'); time.sleep(0.4); bm_label = pg.inner_text('#bookmark'); pg.keyboard.press('Escape')
    st = write_note(pg, 'SYNTHETIC-NOTE-A ਸਿੰਥੈਟਿਕ ਨੋਟ <b>bold?</b>')
    k, r = rec(pg); R['D-01'] = dict(save_status=st, bookmark_button_after=bm_label, record_key=k, record=r)
    pg.reload(wait_until='networkidle'); time.sleep(1.0); k2, r2 = rec(pg)
    pg.goto(BASE + 'index.html'); pg.goto(BASE + 'full-japji.html', wait_until='networkidle'); open_bani(pg); k3, r3 = rec(pg)
    R['D-01']['survives_reload'] = r2['payload']['notes'] == r['payload']['notes'] and r2['payload']['bookmarks'] == r['payload']['bookmarks']
    R['D-01']['survives_navigation'] = r3['payload']['notes'] == r['payload']['notes']
    pg.click('#reading-tools'); time.sleep(0.4); pg.click('#saved-lines summary'); time.sleep(0.3)
    R['D-01']['saved_list_text'] = pg.inner_text('#saved-list')[:300]
    R['D-01']['note_rendered_as_html'] = pg.evaluate('!!document.querySelector("#saved-list b, #note b")')
    s.shot('50_saved_list'); pg.keyboard.press('Escape')
    print('D-01', json.dumps(R['D-01'], ensure_ascii=False)[:900])
    # D-07 export -> wipe -> import round trip
    pg.click('#reading-tools'); time.sleep(0.3)
    with pg.expect_download() as dl: pg.click('#export-learning')
    path = os.path.join(tempfile.mkdtemp(), dl.value.suggested_filename); dl.value.save_as(path)
    exported = open(path, encoding='utf-8').read(); R['D-07'] = dict(filename=dl.value.suggested_filename, bytes=len(exported), export=json.loads(exported))
    pg.keyboard.press('Escape'); pg.evaluate('localStorage.clear()'); open_bani(pg)
    pg.click('#reading-tools'); time.sleep(0.3); pg.set_input_files('#import-learning', path); time.sleep(1.0)
    k4, r4 = rec(pg); R['D-07']['import_status'] = toasts(pg)[:4]
    R['D-07']['lossless_notes_bookmarks'] = bool(r4) and r4['payload']['notes'] == r['payload']['notes'] and sorted(r4['payload']['bookmarks']) == sorted(r['payload']['bookmarks'])
    R['D-07']['position_restored'] = bool(r4) and r4['payload']['lineId'] == r['payload']['lineId']
    print('D-07', json.dumps({k: v for k, v in R['D-07'].items() if k != 'export'}, ensure_ascii=False), '| export keys', list(R['D-07']['export'].keys()))
    pg.keyboard.press('Escape')
    # D-04 import merge: same line, different note; re-import same file twice
    exp = json.loads(exported); line = list(exp['state']['notes'].keys())[0]
    exp2 = json.loads(exported); exp2['state']['notes'][line] = 'SYNTHETIC-NOTE-B different text'
    p2 = os.path.join(tempfile.mkdtemp(), 'b.json'); open(p2, 'w', encoding='utf-8').write(json.dumps(exp2, ensure_ascii=False))
    pg.click('#reading-tools'); time.sleep(0.3); pg.set_input_files('#import-learning', p2); time.sleep(0.8); pg.set_input_files('#import-learning', p2); time.sleep(0.8)
    k5, r5 = rec(pg); R['D-04'] = dict(note_after_two_imports=r5['payload']['notes'][line], both_kept='SYNTHETIC-NOTE-A' in r5['payload']['notes'][line] and 'SYNTHETIC-NOTE-B' in r5['payload']['notes'][line], duplicated=r5['payload']['notes'][line].count('SYNTHETIC-NOTE-B') > 1)
    print('D-04', json.dumps(R['D-04'], ensure_ascii=False))
    pg.keyboard.press('Escape')
    # D-03 hostile imports
    base_before = json.dumps(rec(pg)[1]['payload'], sort_keys=True, ensure_ascii=False)
    hostile = {
      'not_json': 'this is not json',
      'wrong_bani': json.dumps({**exp, 'compositionId': 'jaap'}),
      'script_note': json.dumps({**exp, 'state': {**exp['state'], 'notes': {line: '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>'}}}),
      'proto_key': '{"project":"GLP-001-NITNEM","schema":1,"compositionId":"sohila","editionId":"%s","state":{"__proto__":{"polluted":true},"notes":{},"bookmarks":[]}}' % exp['editionId'],
      'unknown_field': json.dumps({**exp, 'state': {**exp['state'], 'streak': 99}}),
      'bad_line_id': json.dumps({**exp, 'state': {**exp['state'], 'notes': {'sohila99.line99': 'x'}}}),
      'wrong_types': json.dumps({**exp, 'state': {**exp['state'], 'bookmarks': 'all', 'size': '99'}}),
      'huge': json.dumps({**exp, 'state': {**exp['state'], 'notes': {line: 'A' * 3000000}}}),
      'too_long_note': json.dumps({**exp, 'state': {**exp['state'], 'notes': {line: 'B' * 12001}}}),
      'array_root': '[1,2,3]',
      'empty_file': '',
    }
    R['D-03'] = {}
    for name, body in hostile.items():
        hp = os.path.join(tempfile.mkdtemp(), name + '.json'); open(hp, 'w', encoding='utf-8').write(body)
        if not pg.evaluate('document.querySelector("#tools-dialog").open'): pg.click('#reading-tools'); time.sleep(0.3)
        n_err = len(s.errors)
        pg.set_input_files('#import-learning', hp); time.sleep(0.9)
        after = json.dumps(rec(pg)[1]['payload'], sort_keys=True, ensure_ascii=False)
        msg = [t for t in toasts(pg)][:3]
        changed = after != base_before
        if name == 'script_note' and changed: base_before = after
        R['D-03'][name] = dict(data_changed=changed, page_errors=s.errors[n_err:], xss_flag=pg.evaluate('window.__xss||null'), polluted=pg.evaluate('({}).polluted||null'), message=msg)
        print('D-03', name, json.dumps(R['D-03'][name], ensure_ascii=False)[:420])
    pg.click('#saved-lines summary') if not pg.evaluate('document.querySelector("#saved-lines").open') else None; time.sleep(0.3)
    R['D-03']['_after_script_note'] = dict(xss_flag=pg.evaluate('window.__xss||null'), img_or_script_elements_in_tools=pg.evaluate('document.querySelectorAll("#tools-dialog img, #tools-dialog script").length'), saved_list=pg.inner_text('#saved-list')[:200])
    print('D-03 render check', R['D-03']['_after_script_note'])
    s.close()
json.dump(R, open('/home/claude/work/d_tests_nitnem.json', 'w'), ensure_ascii=False, indent=1)
