"""Serve a disposable, static QA directory on loopback. No production writes or browser control.
Switch `current` atomically between prepared release directories from a separate shell.
Create `origin-unavailable` to fail static origin requests while checking installed cache fallback.
"""
import argparse, http.server
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('fixture_root');p.add_argument('--port',type=int,default=8766);a=p.parse_args();root=Path(a.fixture_root).resolve()
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root/'current'),**kwargs)
 def do_GET(self):
  if (root/'origin-unavailable').exists() and not self.path.startswith('/tests/'):
   self.send_error(503,'QA origin temporarily unavailable');return
  super().do_GET()
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
 def log_message(self,*args):pass
 def list_directory(self,path):self.send_error(403,'Directory listing disabled');return None
print('QA server bound to loopback, static fixture only',flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
