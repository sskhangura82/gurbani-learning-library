"""QA-only gated static reader served on loopback behind HTTPS (e.g. Cloudflare Tunnel).
A long random invite is exchanged for a signed Secure/HttpOnly first-party cookie.
No GitHub release, upload, private notes, analytics or account identity is involved.
Do not describe the invite URL as named-user authentication: it is a bearer capability.
"""
import argparse
import base64
import hashlib
import hmac
import http.server
import json
import mimetypes
import os
import re
import secrets
import stat
import time
from http.cookies import SimpleCookie
from pathlib import Path
from urllib.parse import unquote, urlsplit

p = argparse.ArgumentParser()
p.add_argument("--snapshot", type=Path, required=True)
p.add_argument("--config", type=Path, required=True)
p.add_argument("--port", type=int, default=8908)
p.add_argument("--extra-manifest", type=Path, required=True)
a = p.parse_args()
if a.port < 1024 or a.port > 65535:
    p.error("A valid unprivileged port is required")
root = a.snapshot.resolve(strict=True)
config_path = a.config.resolve(strict=True)
if config_path.stat().st_mode & (stat.S_IRWXG | stat.S_IRWXO):
    p.error("Private invitation config must be owner-only (0600)")
config = json.loads(config_path.read_text())
secret = base64.urlsafe_b64decode(config["cookie_key"] + "===")
invite_sha = config["invitation_sha256"]
invite_exp = int(config["invitation_expires_unix"])
if len(secret) < 32 or len(invite_sha) != 64 or invite_exp <= time.time():
    p.error("Invalid or expired access configuration")
sw = (root / "sw.js").read_text()
manifest_match = re.search(r"^const EXPECTED=(\{[^\n]+\});", sw, re.M)
if not manifest_match:
    p.error("Generated worker manifest missing")
manifest = json.loads(manifest_match.group(1))
routes = {"/sw.js": "sw.js", "/": "index.html"}
for item, digest in manifest.items():
    if not item.startswith("./") or not re.fullmatch(r"[a-f0-9]{64}", digest):
        p.error("Malformed worker allowlist entry")
    rel = item[2:] or "index.html"
    if ".." in Path(rel).parts or rel.startswith("/") or "\\" in rel:
        p.error("Unsafe route")
    full = root / rel
    if full.is_symlink() or not full.is_file():
        p.error("Missing or linked asset: " + rel)
    if hashlib.sha256(full.read_bytes()).hexdigest() != digest:
        p.error("SHA-256 mismatch: " + rel)
    routes["/" + rel] = rel
extra = json.loads(a.extra_manifest.resolve(strict=True).read_text())
approved_extra = {'nitnem-trust/index.html', 'nitnem/data/sohila.json', 'nitnem-trust/data/jaap.json', 'nitnem-continuous/data/jaap.json', 'nitnem/data/jaap.json', 'nitnem-parity/data/jaap.json', 'nitnem-sohila/japji-assets/js/gurdwaras.js', 'nitnem-savaiye/data/jaap.json', 'nitnem-sohila/japji-assets/css/japji-full.css', 'nitnem-sohila/index.html', 'nitnem-trust/data/savaiye.json', 'nitnem-savaiye/reader.css', 'nitnem-parity/japji-assets/js/japji-full.js', 'nitnem-savaiye/japji-assets/js/japji-lessons.js', 'nitnem-savaiye/data/rehras.json', 'nitnem-parity/japji-assets/js/shared-learning.js', 'nitnem-learning/data/rehras.json', 'nitnem-savaiye/japji-assets/js/japji-full.js', 'nitnem-savaiye/japji.html', 'nitnem-parity/japji-assets/js/line-meanings.js', 'nitnem-savaiye/trust/corrections.html', 'nitnem-parity/trust/corrections.html', 'nitnem-savaiye/trust/index.html', 'nitnem-savaiye/japji-assets/js/content.js', 'nitnem-savaiye/learning/course.v1.json', 'nitnem-trust/data/sohila.json', 'nitnem-trust/trust/corrections.html', 'nitnem-savaiye/japji-assets/js/shared-learning.js', 'nitnem-savaiye/japji-assets/js/learning.js', 'nitnem/continuous-core.js', 'nitnem-parity/japji.html', 'nitnem-savaiye/data/chaupai.json', 'nitnem-sohila/japji-assets/js/continuous-core.js', 'nitnem-savaiye/sw.js', 'nitnem-parity/data/chaupai.json', 'nitnem-learning/continuous-core.js', 'nitnem/data/savaiye.json', 'nitnem-sohila/japji-assets/js/learning.js', 'nitnem-continuous/data/rehras.json', 'nitnem-trust/continuous-core.js', 'nitnem-trust/learning/course.v1.json', 'nitnem-continuous/data/savaiye.json', 'nitnem-parity/japji-assets/icon-180.png', 'nitnem-parity/japji-assets/js/content.js', 'nitnem-sohila/japji.html', 'nitnem-savaiye/data/anand.json', 'nitnem-learning/data/library.json', 'nitnem/data/chaupai.json', 'nitnem-trust/trust/index.html', 'nitnem-parity/sw.js', 'nitnem/sw.js', 'nitnem-savaiye/learning/learning-ui.js', 'nitnem-parity/data/rehras.json', 'nitnem-savaiye/japji-assets/js/japji-full-data.js', 'nitnem-sohila/trust/trust.css', 'nitnem-sohila/sw.js', 'nitnem-savaiye/continuous-core.js', 'nitnem-continuous/data/anand.json', 'nitnem-parity/data/library.json', 'nitnem-sohila/reader.css', 'nitnem-savaiye/trust/trust.css', 'nitnem-savaiye/index.html', 'nitnem-learning/reader.js', 'nitnem-sohila/continuous-core.js', 'nitnem-trust/data/chaupai.json', 'nitnem-sohila/trust/index.html', 'nitnem-savaiye/japji-assets/icon-180.png', 'nitnem-trust/data/anand.json', 'nitnem-trust/reader.css', 'js/nitnem-today.js', 'nitnem-parity/trust/trust.css', 'nitnem-learning/index.html', 'nitnem-sohila/learning/learning-ui.js', 'nitnem-sohila/japji-assets/js/content.js', 'nitnem-parity/japji-assets/js/learning.js', 'nitnem-trust/reader.js', 'nitnem-savaiye/data/savaiye.json', 'nitnem/reader.js', 'nitnem-parity/japji-assets/css/japji-full.css', 'nitnem-learning/learning/course.v1.json', 'nitnem-sohila/japji-assets/js/line-meanings.js', 'nitnem-sohila/japji-assets/js/shared-learning.js', 'nitnem-sohila/data/sohila.json', 'nitnem/index.html', 'nitnem-trust/learning/learning-ui.js', 'nitnem-savaiye/data/library.json', 'nitnem-trust/data/library.json', 'nitnem-learning/learning/learning-ui.js', 'nitnem-savaiye/japji-assets/js/continuous-core.js', 'nitnem/data/rehras.json', 'nitnem-parity/data/sohila.json', 'nitnem-parity/reader.css', 'nitnem-parity/continuous-core.js', 'nitnem-parity/japji-assets/js/japji-full-data.js', 'nitnem-learning/sw.js', 'nitnem-parity/learning/learning-ui.js', 'nitnem-trust/data/rehras.json', 'nitnem-learning/data/chaupai.json', 'nitnem-sohila/data/jaap.json', 'nitnem-savaiye/japji-assets/css/japji-full.css', 'nitnem-savaiye/japji-assets/css/reader-serenity.css', 'nitnem-continuous/continuous-core.js', 'nitnem/data/anand.json', 'nitnem-savaiye/japji-assets/js/gurdwaras.js', 'nitnem-parity/data/anand.json', 'nitnem-continuous/sw.js', 'nitnem-sohila/japji-assets/js/japji-full-data.js', 'nitnem-learning/data/savaiye.json', 'nitnem-continuous/reader.js', 'nitnem-sohila/data/chaupai.json', 'nitnem-parity/japji-assets/js/japji-lessons.js', 'nitnem-savaiye/data/sohila.json', 'nitnem-sohila/learning/course.v1.json', 'nitnem-parity/japji-assets/js/continuous-core.js', 'nitnem-savaiye/japji-assets/js/line-meanings.js', 'nitnem-savaiye/learning/course.v3.json', 'nitnem-sohila/data/anand.json', 'nitnem-trust/trust/trust.css', 'nitnem/reader.css', 'css/nitnem-today.css', 'nitnem-sohila/data/savaiye.json', 'nitnem-today.html', 'nitnem-sohila/reader.js', 'nitnem-sohila/trust/corrections.html', 'nitnem-parity/index.html', 'nitnem-sohila/japji-assets/js/japji-lessons.js', 'nitnem-sohila/data/rehras.json', 'nitnem-sohila/data/library.json', 'nitnem-parity/trust/index.html', 'nitnem-continuous/data/chaupai.json', 'nitnem-savaiye/learning/course.v2.json', 'nitnem-sohila/japji-assets/css/reader-serenity.css', 'nitnem-savaiye/reader.js', 'nitnem-parity/learning/course.v1.json', 'nitnem-learning/data/jaap.json', 'nitnem-sohila/japji-assets/icon-180.png', 'nitnem-continuous/data/sohila.json', 'nitnem-continuous/reader.css', 'nitnem/data/library.json', 'nitnem-learning/data/anand.json', 'nitnem-parity/japji-assets/js/gurdwaras.js', 'nitnem-sohila/learning/course.v2.json', 'nitnem-learning/data/sohila.json', 'nitnem-sohila/japji-assets/js/japji-full.js', 'nitnem-parity/japji-assets/css/reader-serenity.css', 'nitnem-parity/data/savaiye.json', 'nitnem-parity/reader.js', 'nitnem-learning/reader.css', 'nitnem-trust/sw.js', 'nitnem-continuous/data/library.json', 'nitnem-continuous/index.html'}
if set(extra) != approved_extra:
    p.error("Only exact approved internal Nitnem preview assets may be exposed")
for relative, expected_hash in extra.items():
    if not re.fullmatch(r"[a-f0-9]{64}", expected_hash):
        p.error("Invalid Full Nitnem hub hash")
    file = root / relative
    if not file.is_file() or file.is_symlink():
        p.error("Missing/linked Full Nitnem route")
    if hashlib.sha256(file.read_bytes()).hexdigest() != expected_hash:
        p.error("Full Nitnem hub source hash mismatch")
    routes["/" + relative] = relative
SESSION_SECONDS = 7 * 24 * 3600
COOKIE_NAME = "glp_qa_access"

def session_value():
    expiry = min(int(time.time()) + SESSION_SECONDS, invite_exp)
    nonce = secrets.token_urlsafe(16)
    body = f"{expiry}.{nonce}"
    signature = hmac.new(secret, body.encode(), hashlib.sha256).hexdigest()
    return f"{body}.{signature}", max(0, expiry - int(time.time()))

def authenticated(cookie_header):
    jar = SimpleCookie()
    try:
        jar.load(cookie_header or "")
    except Exception:
        return False
    if COOKIE_NAME not in jar:
        return False
    value = jar[COOKIE_NAME].value
    bits = value.split(".")
    if len(bits) != 3 or not bits[0].isdigit():
        return False
    expiry = int(bits[0])
    if expiry < time.time() or expiry > invite_exp or expiry > time.time() + SESSION_SECONDS:
        return False
    body = ".".join(bits[:2])
    expected = hmac.new(secret, body.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(bits[2], expected)

class Handler(http.server.BaseHTTPRequestHandler):
    server_version = "GLP-QA"
    sys_version = ""

    def log_message(self, *args):
        # Never log the bearer invitation, cookies, reading URLs or other identifiers.
        pass

    def send_safe_headers(self, *, cache="no-store"):
        self.send_header("Cache-Control", cache)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Robots-Tag", "noindex, nofollow, noarchive")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Cross-Origin-Resource-Policy", "same-origin")

    def send_empty(self, status, message="", extra_headers=()):
        payload = (message or "Not available").encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.send_safe_headers()
        for key, value in extra_headers:
            self.send_header(key, value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(payload)

    def do_POST(self):
        self.send_empty(405, "This reader is read-only", [("Allow", "GET, HEAD")])

    def do_GET(self):
        self.serve_request()

    def do_HEAD(self):
        self.serve_request()

    def serve_request(self):
        path = unquote(urlsplit(self.path).path)
        if path.startswith("/access/"):
            supplied = path[len("/access/"):]
            valid = re.fullmatch(r"[A-Za-z0-9_-]{25,128}", supplied) is not None
            digest = hashlib.sha256(supplied.encode()).hexdigest() if valid else ""
            if not valid or not hmac.compare_digest(digest, invite_sha) or time.time() >= invite_exp:
                self.send_empty(403, "This preview invitation is not valid")
                return
            signed, max_age = session_value()
            self.send_response(303)
            self.send_header("Location", "/nitnem-savaiye/index.html")
            self.send_header("Set-Cookie", f"{COOKIE_NAME}={signed}; Path=/; Max-Age={max_age}; Secure; HttpOnly; SameSite=Lax")
            self.send_header("Content-Length", "0")
            self.send_safe_headers()
            self.end_headers()
            return
        if not authenticated(self.headers.get("Cookie")):
            self.send_empty(401, "Private preview: use the invitation link")
            return
        rel = routes.get(path)
        if not rel:
            self.send_empty(404, "File not included in the reviewed preview")
            return
        full = root / rel
        if full.is_symlink() or not full.is_file():
            self.send_empty(503, "Reviewed file unavailable")
            return
        data = full.read_bytes()
        expected_sha = manifest.get("./" + ("" if path == "/" else rel)) or extra.get(rel)
        if expected_sha and hashlib.sha256(data).hexdigest() != expected_sha:
            self.send_empty(503, "Reviewed file hash mismatch")
            return
        mime, _ = mimetypes.guess_type(str(full))
        if rel.endswith(".js"):
            mime = "text/javascript"
        if rel.endswith(".webmanifest"):
            mime = "application/manifest+json"
        self.send_response(200)
        self.send_header("Content-Type", mime or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        if rel == "sw.js":
            self.send_header("Service-Worker-Allowed", "/")
        self.send_safe_headers()
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

print("GLP gated reviewed reader: loopback port", a.port, "allowlisted routes", len(routes), "no user data processing", flush=True)
http.server.ThreadingHTTPServer(("127.0.0.1", a.port), Handler).serve_forever()
