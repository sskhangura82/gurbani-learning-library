"""Offline CI contract for the invitation-gated GLP reader preview.
Generates fresh throwaway secrets, uses loopback only, then destroys the server.
No GitHub secrets, personal learning, account access or third-party requests.
"""
import base64
import hashlib
import json
import os
import secrets
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

root = Path(__file__).resolve().parent.parent
if len(sys.argv) != 2:
    raise SystemExit("Usage: python3 tests/gated-preview-contract.py /path/to/immutable-preview")
snapshot = Path(sys.argv[1]).resolve(strict=True)
assert (snapshot / "sw.js").is_file()
host = "http://127.0.0.1:8909"

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None

opener = urllib.request.build_opener(NoRedirect)
def fetch(url_path, *, method="GET", headers=None):
    req = urllib.request.Request(host + url_path, headers=headers or {}, method=method)
    try:
        with opener.open(req, timeout=6) as response:
            return response.status, dict(response.headers), response.read()
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers), error.read()

with tempfile.TemporaryDirectory(prefix="glp-gated-ci-") as dirname:
    private = Path(dirname)
    invite = secrets.token_urlsafe(32)
    signing_key = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode().rstrip("=")
    private_config = private / "auth.json"
    config = {
        "cookie_key": signing_key,
        "invitation_sha256": hashlib.sha256(invite.encode()).hexdigest(),
        "invitation_expires_unix": int(time.time()) + 3600,
        "status": "TEST_ONLY"
    }
    private_config.write_text(json.dumps(config))
    os.chmod(private_config, 0o600)
    cmd = [sys.executable, str(root / "tests/serve-gated-phone-preview.py"),
           "--snapshot", str(snapshot), "--config", str(private_config), "--port", "8909"]
    server = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    checks = []
    def require(condition, title):
        assert condition, title
        checks.append(title)

    try:
        online = False
        for _ in range(80):
            if server.poll() is not None:
                raise AssertionError("Gated QA server did not start")
            try:
                if fetch("/full-japji.html")[0] == 401:
                    online = True
                    break
            except Exception:
                time.sleep(0.1)
        require(online, "Loopback QA gate starts and rejects anonymous requests")
        require(fetch("/sw.js")[0] == 401, "Worker refused to anonymous browser")
        require(fetch("/access/definitely-invalid")[0] == 403, "Invalid invitation refused")
        response = fetch("/access/" + invite)
        require(response[0] == 303 and response[1].get("Location") == "/full-japji.html",
                "Valid invitation redirects to reader, not an exposed token URL")
        cookie_string = response[1].get("Set-Cookie", "")
        require(all(k in cookie_string for k in ["Secure", "HttpOnly", "SameSite=Lax", "Max-Age="]),
                "Signed cookie is Secure, HttpOnly, SameSite and expires")
        cookie = cookie_string.split(";")[0]
        authorized = {"Cookie": cookie}
        require(fetch("/full-japji.html", headers=authorized)[0] == 200,
                "Authorized reader is accessible")
        require(fetch("/", headers=authorized)[0] == 200,
                "Authorized Home page is accessible")
        require(fetch("/sw.js", headers=authorized)[0] == 200,
                "Authorized service worker is accessible")
        require(fetch("/css/reader-serenity.css", headers=authorized)[0] == 200,
                "Authorized Serenity styling is accessible")
        require(fetch("/js/japji-full-data.js", headers=authorized)[0] == 200,
                "Authorized immutable scripture data is accessible")
        require(fetch("/full-japji.html", method="HEAD", headers=authorized)[0] == 200,
                "Authorized HEAD works")
        require(fetch("/full-japji.html", headers={"Cookie": "glp_qa_access=123.forged.invalid"})[0] == 401,
                "Forged signed session refused")
        require(fetch("/full-japji.html?glp_release=versioned", headers=authorized)[0] == 200,
                "Versioned service-worker static asset query works")
        for forbidden in ["/.git/config", "/tests/gated-preview-contract.py",
                          "/docs/SERENITY_PRIVATE_IPHONE_PREVIEW_20261024.md", "/%2e%2e/sw.js"]:
            require(fetch(forbidden, headers=authorized)[0] == 404,
                    "No private source access: " + forbidden)
        require(fetch("/full-japji.html", method="POST", headers=authorized)[0] == 405,
                "No server-side writes allowed")
        safe_headers = fetch("/full-japji.html", headers=authorized)[1]
        require(safe_headers.get("Referrer-Policy") == "no-referrer",
                "Invitation not forwarded through referrer policy")
        require(safe_headers.get("Cache-Control") == "no-store",
                "Gateway cache is explicitly disabled")
        require("noindex" in safe_headers.get("X-Robots-Tag", ""),
                "Crawler indexing disallowed")
        print(json.dumps({"status": "PASS", "checks": len(checks),
                          "scope": "Loopback bearer-invitation gate + immutable asset allowlist",
                          "requires_physical_iphone_test": True}))
    finally:
        server.terminate()
        try:
            server.wait(timeout=4)
        except subprocess.TimeoutExpired:
            server.kill()
            server.wait(timeout=4)
