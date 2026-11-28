"""Static server whose document root can be switched at run time: GET /__switch?root=v2"""
import http.server, socketserver, os, sys, urllib.parse
BASE = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/work/upd2'; state = {'root': 'v1'}
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = urllib.parse.urlparse(path).path
        return os.path.join(BASE, state['root'], *[x for x in urllib.parse.unquote(p).split('/') if x and x not in ('.', '..')])
    def do_GET(self):
        # never answer "not changed" by file date: versions are swapped under the same address, and a by-date answer would leave the browser with a mixture
        for h in ('If-Modified-Since', 'If-None-Match'):
            if h in self.headers: del self.headers[h]
        u = urllib.parse.urlparse(self.path)
        if u.path == '/__switch':
            state['root'] = urllib.parse.parse_qs(u.query)['root'][0]; self.send_response(200); self.end_headers(); self.wfile.write(state['root'].encode()); return
        if os.path.isdir(self.translate_path(self.path)) and not u.path.endswith('/'):
            self.send_response(301); self.send_header('Location', u.path + '/'); self.end_headers(); return
        super().do_GET()
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache'); super().end_headers()
    def log_message(self, *a): pass
socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('127.0.0.1', 8090), H) as httpd: httpd.serve_forever()
