import json, time, sys
from playwright.sync_api import sync_playwright
B = sys.argv[1]; SH = '/home/claude/work/shots/'
with sync_playwright() as p:
    b = p.chromium.launch(); d = dict(p.devices['iPhone 14']); d['service_workers'] = 'block'; d['device_scale_factor'] = 3
    c = b.new_context(**d); pg = c.new_page(); pg.goto(B + 'full-japji.html', wait_until='networkidle'); time.sleep(1.5)
    out = {}
    for i in (1, 2):
        pg.click('#tools-open'); time.sleep(0.3); pg.locator('#reader-dialog [data-action="reader-explore"]').click(); time.sleep(0.3)
        pg.locator('#reader-dialog [data-action="related"]').click(); time.sleep(0.4); pg.locator(f'#reader-dialog [data-action="context"][data-index="{i}"]').click(); time.sleep(0.6)
        el = pg.locator('#reader-dialog .context-gurmukhi').nth(4); el.scroll_into_view_if_needed(); time.sleep(0.3)
        el.screenshot(path=f'{SH}sA1_doubled_ha_related{i}_line.png'); out[i] = dict(text=el.text_content(), font=pg.evaluate("(e) => getComputedStyle(e).fontFamily", el.element_handle()))
        pg.screenshot(path=f'{SH}sA1_doubled_ha_related{i}_dialog.png'); pg.keyboard.press('Escape'); time.sleep(0.4)
    # the same word written with the proper sign, in the same font, for comparison
    pg.evaluate("""() => { const p = document.createElement('p'); p.id = 'cmp'; p.lang = 'pa'; p.className = 'context-gurmukhi'; p.style.cssText = 'font-size:30px;padding:10px;background:#fff'; p.textContent = 'ਜਿਨੑੀ  ਤਿਨੑਾ  ਸਮੑਾਲੇ   |   ਜਿਨ੍ਹ੍ਹੀ  ਤਿਨ੍ਹ੍ਹਾ  ਸਮ੍ਹ੍ਹਾਲੇ   |   ਜਿਨ੍ਹੀ  ਤਿਨ੍ਹਾ  ਸਮ੍ਹਾਲੇ'; document.body.prepend(p); window.scrollTo(0,0); }""")
    time.sleep(0.4); pg.locator('#cmp').screenshot(path=f'{SH}sA1_doubled_ha_comparison.png'); print(json.dumps(out, ensure_ascii=False)); b.close()
