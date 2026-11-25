#!/usr/bin/python3.12
"""RT-001: the repaired readers in the WebKit engine (the engine family Safari is built on).
WebKitGTK 2.52 on Linux under a virtual display. This is NOT Safari, NOT iOS and NOT a device: it answers one narrow question —
does WebKit's own handling of the file-integrity tag, WebCrypto and the offline worker let the genuine text through and stop altered text?
Run: xvfb-run -a /usr/bin/python3.12 -I rt6_webkit_engine.py <out.json>"""
import gi, json, sys, time, tempfile, urllib.request
gi.require_version('Gtk', '3.0'); gi.require_version('WebKit2', '4.1')
from gi.repository import Gtk, WebKit2, GLib
OUT = sys.argv[1]; S = 'http://127.0.0.1:8090/gurbani-learning-library/'
def switch(v): return urllib.request.urlopen('http://127.0.0.1:8090/__switch?root=' + v).read().decode()
state = {}
def fresh_profile():
    """a brand-new browser profile: no saved files, no offline worker"""
    if state.get('win'): state['win'].destroy()
    d = tempfile.mkdtemp(prefix='wk-'); mgr = WebKit2.WebsiteDataManager(base_data_directory=d + '/data', base_cache_directory=d + '/cache')
    ctx = WebKit2.WebContext.new_with_website_data_manager(mgr); v = WebKit2.WebView.new_with_context(ctx)
    w = Gtk.OffscreenWindow(); w.set_default_size(390, 664); w.add(v); w.show_all(); state['win'] = w; state['view'] = v
loop = GLib.MainLoop()
def spin(seconds):
    GLib.timeout_add(int(seconds * 1000), lambda: (loop.quit(), False)[1]); loop.run()
def load(url, settle):
    done = {'ok': False}
    def on(v, ev):
        if ev == WebKit2.LoadEvent.FINISHED: done['ok'] = True
    view = state['view']; h = view.connect('load-changed', on); view.load_uri(url); t0 = time.time()
    while not done['ok'] and time.time() - t0 < 25: spin(0.2)
    view.disconnect(h); spin(settle)
def js(body):
    """run an async function body in the page and return its JSON result"""
    box = {}
    def cb(v, res, _):
        try: box['v'] = v.call_async_javascript_function_finish(res).to_string()
        except Exception as e: box['v'] = json.dumps({'error': str(e)[:200]})
        loop.quit()
    state['view'].call_async_javascript_function(body, -1, None, None, None, None, cb, None); loop.run()
    try: return json.loads(box['v'])
    except Exception: return box.get('v')
PROBE = '''const pick = (root, lines, t) => { const el = document.querySelector(root); const x = document.querySelector(t);
  return {check: el ? (el.dataset.sourceIntegrity || null) : null, lines: document.querySelectorAll(lines).length, targetLine: x ? x.textContent : null, message: el ? el.innerText.replace(/\\s+/g, ' ').trim().slice(0, 110) : null}; };
  const j = document.querySelector('#continuous-reader') ? pick('#continuous-reader', '#continuous-reader article.scripture-line', '[data-occurrence="pauri01.line06"] .tuk') : pick('#sukhmani-text', '#sukhmani-text [data-line-id]', '[data-line-id="sukhmani.a01.p01.l02"] .tuk');
  j.secureContext = isSecureContext; j.webCrypto = !!(self.crypto && crypto.subtle); j.offlineWorkerInControl = !!(navigator.serviceWorker && navigator.serviceWorker.controller); return JSON.stringify(j);'''
R = {'engine': 'WebKitGTK %d.%d.%d (Linux, virtual display)' % (WebKit2.get_major_version(), WebKit2.get_minor_version(), WebKit2.get_micro_version()), 'userAgent': None}
def both(key, settle_j=3.0, settle_s=5.0):
    R[key] = {}
    for name, page, settle in (('japji', 'full-japji.html', settle_j), ('sukhmani', 'sukhmani.html', settle_s)):
        load(S + page, settle); R[key][name] = js(PROBE)
        if isinstance(R[key][name], dict):
            R[key][name]['alteredTextDisplayed'] = bool(R[key][name].get('targetLine') and ('ਹੁਕਮ ਰਜਾਈ' in R[key][name]['targetLine'] or 'ਦੁਖੁ ਪਾਵਉ' in R[key][name]['targetLine']))
    print(key, json.dumps(R[key], ensure_ascii=False)[:900], flush=True)
# A and B: altered files, each in a brand-new profile so that no offline worker can answer in place of the server
fresh_profile(); switch('v8'); both('A_one_word_changed_page_tags_as_published')
fresh_profile(); switch('v9'); both('B_one_word_changed_and_page_tags_changed_to_match')
# C: genuine files, brand-new profile
fresh_profile(); switch('v5'); load(S + 'full-japji.html', 0.5); R['userAgent'] = js('return JSON.stringify(navigator.userAgent)'); both('C_genuine_files_online')
# D: offline worker installed on the genuine build, then the server answers "not found" for everything and the readers are re-opened
load(S + 'nitnem/index.html', 2.0); n = 0
for _ in range(80):
    n = js('let t = 0; for (const k of await caches.keys()) t += (await (await caches.open(k)).keys()).length; return JSON.stringify(t);')
    if isinstance(n, int) and n >= 57: break
    spin(0.5)
R['D_offline_copy_files'] = n; load(S + 'nitnem/index.html', 1.5)
R['D_worker_state'] = js("const r = await navigator.serviceWorker.getRegistration(); return JSON.stringify({registered: !!r, active: r && r.active ? r.active.state : null, inControl: !!navigator.serviceWorker.controller});")
switch('vEMPTY'); both('D_server_answers_not_found_for_everything')
switch('v1'); json.dump(R, open(OUT, 'w'), ensure_ascii=False, indent=1); print('files in offline copy:', n, '| worker:', R['D_worker_state'], '|', R['engine'], '|', R['userAgent'])
