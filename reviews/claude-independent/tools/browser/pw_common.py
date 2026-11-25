import json, os, time, pathlib
from playwright.sync_api import sync_playwright
BASE = 'http://127.0.0.1:8080/gurbani-learning-library/'
SHOTS = pathlib.Path('/home/claude/work/shots')

class Session:
    def __init__(self, p, device='iPhone 14', color_scheme='light', reduced_motion=None, offline=False, viewport=None, storage_state=None):
        self.browser = p.chromium.launch()
        d = dict(p.devices[device]) if device else {}
        if viewport: d['viewport'] = viewport
        if reduced_motion: d['reduced_motion'] = reduced_motion
        d['color_scheme'] = color_scheme
        if storage_state: d['storage_state'] = storage_state
        self.ctx = self.browser.new_context(**d)
        self.page = self.ctx.new_page()
        self.console = []; self.errors = []; self.requests = []; self.failed = []
        self.attach(self.page)
    def attach(self, page):
        page.on('console', lambda m: self.console.append((m.type, m.text)))
        page.on('pageerror', lambda e: self.errors.append(str(e)))
        page.on('request', lambda r: self.requests.append((r.method, r.url, r.resource_type)))
        page.on('requestfailed', lambda r: self.failed.append((r.url, r.failure)))
    def shot(self, name, full=False):
        path = SHOTS / f'{name}.png'
        self.page.screenshot(path=str(path), full_page=full)
        return str(path)
    def close(self):
        self.ctx.close(); self.browser.close()
