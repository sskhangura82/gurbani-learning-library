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
approved_extra = {
    'css/nitnem-today.css',
    'js/nitnem-today.js',
    'nitnem-anand-202/continuous-core.js',
    'nitnem-anand-202/data/anand.json',
    'nitnem-anand-202/data/chaupai.json',
    'nitnem-anand-202/data/jaap.json',
    'nitnem-anand-202/data/library.json',
    'nitnem-anand-202/data/rehras.json',
    'nitnem-anand-202/data/savaiye.json',
    'nitnem-anand-202/data/sohila.json',
    'nitnem-anand-202/index.html',
    'nitnem-anand-202/japji-assets/css/japji-full.css',
    'nitnem-anand-202/japji-assets/css/reader-serenity.css',
    'nitnem-anand-202/japji-assets/icon-180.png',
    'nitnem-anand-202/japji-assets/js/content.js',
    'nitnem-anand-202/japji-assets/js/continuous-core.js',
    'nitnem-anand-202/japji-assets/js/gurdwaras.js',
    'nitnem-anand-202/japji-assets/js/japji-full-data.js',
    'nitnem-anand-202/japji-assets/js/japji-full.js',
    'nitnem-anand-202/japji-assets/js/japji-lessons.js',
    'nitnem-anand-202/japji-assets/js/learning.js',
    'nitnem-anand-202/japji-assets/js/line-meanings.js',
    'nitnem-anand-202/japji-assets/js/shared-learning.js',
    'nitnem-anand-202/japji.html',
    'nitnem-anand-202/learning/course.v1.json',
    'nitnem-anand-202/learning/course.v2.json',
    'nitnem-anand-202/learning/course.v3.json',
    'nitnem-anand-202/learning/course.v4.json',
    'nitnem-anand-202/learning/course.v5.json',
    'nitnem-anand-202/learning/course.v6.json',
    'nitnem-anand-202/learning/course.v7.json',
    'nitnem-anand-202/learning/course.v8.json',
    'nitnem-anand-202/learning/learning-ui.js',
    'nitnem-anand-202/reader.css',
    'nitnem-anand-202/reader.js',
    'nitnem-anand-202/sw.js',
    'nitnem-anand-202/trust/corrections.html',
    'nitnem-anand-202/trust/index.html',
    'nitnem-anand-202/trust/trust.css',
    'nitnem-anand-p21-30/continuous-core.js',
    'nitnem-anand-p21-30/data/anand.json',
    'nitnem-anand-p21-30/data/chaupai.json',
    'nitnem-anand-p21-30/data/jaap.json',
    'nitnem-anand-p21-30/data/library.json',
    'nitnem-anand-p21-30/data/rehras.json',
    'nitnem-anand-p21-30/data/savaiye.json',
    'nitnem-anand-p21-30/data/sohila.json',
    'nitnem-anand-p21-30/index.html',
    'nitnem-anand-p21-30/japji-assets/css/japji-full.css',
    'nitnem-anand-p21-30/japji-assets/css/reader-serenity.css',
    'nitnem-anand-p21-30/japji-assets/icon-180.png',
    'nitnem-anand-p21-30/japji-assets/js/content.js',
    'nitnem-anand-p21-30/japji-assets/js/continuous-core.js',
    'nitnem-anand-p21-30/japji-assets/js/gurdwaras.js',
    'nitnem-anand-p21-30/japji-assets/js/japji-full-data.js',
    'nitnem-anand-p21-30/japji-assets/js/japji-full.js',
    'nitnem-anand-p21-30/japji-assets/js/japji-lessons.js',
    'nitnem-anand-p21-30/japji-assets/js/learning.js',
    'nitnem-anand-p21-30/japji-assets/js/line-meanings.js',
    'nitnem-anand-p21-30/japji-assets/js/shared-learning.js',
    'nitnem-anand-p21-30/japji.html',
    'nitnem-anand-p21-30/learning/course.v1.json',
    'nitnem-anand-p21-30/learning/course.v2.json',
    'nitnem-anand-p21-30/learning/course.v3.json',
    'nitnem-anand-p21-30/learning/course.v4.json',
    'nitnem-anand-p21-30/learning/course.v5.json',
    'nitnem-anand-p21-30/learning/course.v6.json',
    'nitnem-anand-p21-30/learning/learning-ui.js',
    'nitnem-anand-p21-30/reader.css',
    'nitnem-anand-p21-30/reader.js',
    'nitnem-anand-p21-30/sw.js',
    'nitnem-anand-p21-30/trust/corrections.html',
    'nitnem-anand-p21-30/trust/index.html',
    'nitnem-anand-p21-30/trust/trust.css',
    'nitnem-anand-p31-40/continuous-core.js',
    'nitnem-anand-p31-40/data/anand.json',
    'nitnem-anand-p31-40/data/chaupai.json',
    'nitnem-anand-p31-40/data/jaap.json',
    'nitnem-anand-p31-40/data/library.json',
    'nitnem-anand-p31-40/data/rehras.json',
    'nitnem-anand-p31-40/data/savaiye.json',
    'nitnem-anand-p31-40/data/sohila.json',
    'nitnem-anand-p31-40/index.html',
    'nitnem-anand-p31-40/japji-assets/css/japji-full.css',
    'nitnem-anand-p31-40/japji-assets/css/reader-serenity.css',
    'nitnem-anand-p31-40/japji-assets/icon-180.png',
    'nitnem-anand-p31-40/japji-assets/js/content.js',
    'nitnem-anand-p31-40/japji-assets/js/continuous-core.js',
    'nitnem-anand-p31-40/japji-assets/js/gurdwaras.js',
    'nitnem-anand-p31-40/japji-assets/js/japji-full-data.js',
    'nitnem-anand-p31-40/japji-assets/js/japji-full.js',
    'nitnem-anand-p31-40/japji-assets/js/japji-lessons.js',
    'nitnem-anand-p31-40/japji-assets/js/learning.js',
    'nitnem-anand-p31-40/japji-assets/js/line-meanings.js',
    'nitnem-anand-p31-40/japji-assets/js/shared-learning.js',
    'nitnem-anand-p31-40/japji.html',
    'nitnem-anand-p31-40/learning/course.v1.json',
    'nitnem-anand-p31-40/learning/course.v2.json',
    'nitnem-anand-p31-40/learning/course.v3.json',
    'nitnem-anand-p31-40/learning/course.v4.json',
    'nitnem-anand-p31-40/learning/course.v5.json',
    'nitnem-anand-p31-40/learning/course.v6.json',
    'nitnem-anand-p31-40/learning/course.v7.json',
    'nitnem-anand-p31-40/learning/learning-ui.js',
    'nitnem-anand-p31-40/reader.css',
    'nitnem-anand-p31-40/reader.js',
    'nitnem-anand-p31-40/sw.js',
    'nitnem-anand-p31-40/trust/corrections.html',
    'nitnem-anand-p31-40/trust/index.html',
    'nitnem-anand-p31-40/trust/trust.css',
    'nitnem-anand/continuous-core.js',
    'nitnem-anand/data/anand.json',
    'nitnem-anand/data/chaupai.json',
    'nitnem-anand/data/jaap.json',
    'nitnem-anand/data/library.json',
    'nitnem-anand/data/rehras.json',
    'nitnem-anand/data/savaiye.json',
    'nitnem-anand/data/sohila.json',
    'nitnem-anand/index.html',
    'nitnem-anand/japji-assets/css/japji-full.css',
    'nitnem-anand/japji-assets/css/reader-serenity.css',
    'nitnem-anand/japji-assets/icon-180.png',
    'nitnem-anand/japji-assets/js/content.js',
    'nitnem-anand/japji-assets/js/continuous-core.js',
    'nitnem-anand/japji-assets/js/gurdwaras.js',
    'nitnem-anand/japji-assets/js/japji-full-data.js',
    'nitnem-anand/japji-assets/js/japji-full.js',
    'nitnem-anand/japji-assets/js/japji-lessons.js',
    'nitnem-anand/japji-assets/js/learning.js',
    'nitnem-anand/japji-assets/js/line-meanings.js',
    'nitnem-anand/japji-assets/js/shared-learning.js',
    'nitnem-anand/japji.html',
    'nitnem-anand/learning/course.v1.json',
    'nitnem-anand/learning/course.v2.json',
    'nitnem-anand/learning/course.v3.json',
    'nitnem-anand/learning/course.v4.json',
    'nitnem-anand/learning/course.v5.json',
    'nitnem-anand/learning/learning-ui.js',
    'nitnem-anand/reader.css',
    'nitnem-anand/reader.js',
    'nitnem-anand/sw.js',
    'nitnem-anand/trust/corrections.html',
    'nitnem-anand/trust/index.html',
    'nitnem-anand/trust/trust.css',
    'nitnem-chaupai/continuous-core.js',
    'nitnem-chaupai/data/anand.json',
    'nitnem-chaupai/data/chaupai.json',
    'nitnem-chaupai/data/jaap.json',
    'nitnem-chaupai/data/library.json',
    'nitnem-chaupai/data/rehras.json',
    'nitnem-chaupai/data/savaiye.json',
    'nitnem-chaupai/data/sohila.json',
    'nitnem-chaupai/index.html',
    'nitnem-chaupai/japji-assets/css/japji-full.css',
    'nitnem-chaupai/japji-assets/css/reader-serenity.css',
    'nitnem-chaupai/japji-assets/icon-180.png',
    'nitnem-chaupai/japji-assets/js/content.js',
    'nitnem-chaupai/japji-assets/js/continuous-core.js',
    'nitnem-chaupai/japji-assets/js/gurdwaras.js',
    'nitnem-chaupai/japji-assets/js/japji-full-data.js',
    'nitnem-chaupai/japji-assets/js/japji-full.js',
    'nitnem-chaupai/japji-assets/js/japji-lessons.js',
    'nitnem-chaupai/japji-assets/js/learning.js',
    'nitnem-chaupai/japji-assets/js/line-meanings.js',
    'nitnem-chaupai/japji-assets/js/shared-learning.js',
    'nitnem-chaupai/japji.html',
    'nitnem-chaupai/learning/course.v1.json',
    'nitnem-chaupai/learning/course.v2.json',
    'nitnem-chaupai/learning/course.v3.json',
    'nitnem-chaupai/learning/course.v4.json',
    'nitnem-chaupai/learning/learning-ui.js',
    'nitnem-chaupai/reader.css',
    'nitnem-chaupai/reader.js',
    'nitnem-chaupai/sw.js',
    'nitnem-chaupai/trust/corrections.html',
    'nitnem-chaupai/trust/index.html',
    'nitnem-chaupai/trust/trust.css',
    'nitnem-continuous/continuous-core.js',
    'nitnem-continuous/data/anand.json',
    'nitnem-continuous/data/chaupai.json',
    'nitnem-continuous/data/jaap.json',
    'nitnem-continuous/data/library.json',
    'nitnem-continuous/data/rehras.json',
    'nitnem-continuous/data/savaiye.json',
    'nitnem-continuous/data/sohila.json',
    'nitnem-continuous/index.html',
    'nitnem-continuous/reader.css',
    'nitnem-continuous/reader.js',
    'nitnem-continuous/sw.js',
    'nitnem-learning-v10/continuous-core.js',
    'nitnem-learning-v10/data/anand.json',
    'nitnem-learning-v10/data/chaupai.json',
    'nitnem-learning-v10/data/jaap.json',
    'nitnem-learning-v10/data/library.json',
    'nitnem-learning-v10/data/rehras.json',
    'nitnem-learning-v10/data/savaiye.json',
    'nitnem-learning-v10/data/sohila.json',
    'nitnem-learning-v10/index.html',
    'nitnem-learning-v10/japji-assets/css/japji-full.css',
    'nitnem-learning-v10/japji-assets/css/reader-serenity.css',
    'nitnem-learning-v10/japji-assets/icon-180.png',
    'nitnem-learning-v10/japji-assets/js/content.js',
    'nitnem-learning-v10/japji-assets/js/continuous-core.js',
    'nitnem-learning-v10/japji-assets/js/gurdwaras.js',
    'nitnem-learning-v10/japji-assets/js/japji-full-data.js',
    'nitnem-learning-v10/japji-assets/js/japji-full.js',
    'nitnem-learning-v10/japji-assets/js/japji-lessons.js',
    'nitnem-learning-v10/japji-assets/js/learning.js',
    'nitnem-learning-v10/japji-assets/js/line-meanings.js',
    'nitnem-learning-v10/japji-assets/js/shared-learning.js',
    'nitnem-learning-v10/japji.html',
    'nitnem-learning-v10/learning/course.v1.json',
    'nitnem-learning-v10/learning/course.v10.json',
    'nitnem-learning-v10/learning/course.v2.json',
    'nitnem-learning-v10/learning/course.v3.json',
    'nitnem-learning-v10/learning/course.v4.json',
    'nitnem-learning-v10/learning/course.v5.json',
    'nitnem-learning-v10/learning/course.v6.json',
    'nitnem-learning-v10/learning/course.v7.json',
    'nitnem-learning-v10/learning/course.v8.json',
    'nitnem-learning-v10/learning/course.v9.json',
    'nitnem-learning-v10/learning/learning-ui.js',
    'nitnem-learning-v10/reader.css',
    'nitnem-learning-v10/reader.js',
    'nitnem-learning-v10/sw.js',
    'nitnem-learning-v10/trust/corrections.html',
    'nitnem-learning-v10/trust/index.html',
    'nitnem-learning-v10/trust/trust.css',
    'nitnem-learning-v9/continuous-core.js',
    'nitnem-learning-v9/data/anand.json',
    'nitnem-learning-v9/data/chaupai.json',
    'nitnem-learning-v9/data/jaap.json',
    'nitnem-learning-v9/data/library.json',
    'nitnem-learning-v9/data/rehras.json',
    'nitnem-learning-v9/data/savaiye.json',
    'nitnem-learning-v9/data/sohila.json',
    'nitnem-learning-v9/index.html',
    'nitnem-learning-v9/japji-assets/css/japji-full.css',
    'nitnem-learning-v9/japji-assets/css/reader-serenity.css',
    'nitnem-learning-v9/japji-assets/icon-180.png',
    'nitnem-learning-v9/japji-assets/js/content.js',
    'nitnem-learning-v9/japji-assets/js/continuous-core.js',
    'nitnem-learning-v9/japji-assets/js/gurdwaras.js',
    'nitnem-learning-v9/japji-assets/js/japji-full-data.js',
    'nitnem-learning-v9/japji-assets/js/japji-full.js',
    'nitnem-learning-v9/japji-assets/js/japji-lessons.js',
    'nitnem-learning-v9/japji-assets/js/learning.js',
    'nitnem-learning-v9/japji-assets/js/line-meanings.js',
    'nitnem-learning-v9/japji-assets/js/shared-learning.js',
    'nitnem-learning-v9/japji.html',
    'nitnem-learning-v9/learning/course.v1.json',
    'nitnem-learning-v9/learning/course.v2.json',
    'nitnem-learning-v9/learning/course.v3.json',
    'nitnem-learning-v9/learning/course.v4.json',
    'nitnem-learning-v9/learning/course.v5.json',
    'nitnem-learning-v9/learning/course.v6.json',
    'nitnem-learning-v9/learning/course.v7.json',
    'nitnem-learning-v9/learning/course.v8.json',
    'nitnem-learning-v9/learning/course.v9.json',
    'nitnem-learning-v9/learning/learning-ui.js',
    'nitnem-learning-v9/reader.css',
    'nitnem-learning-v9/reader.js',
    'nitnem-learning-v9/sw.js',
    'nitnem-learning-v9/trust/corrections.html',
    'nitnem-learning-v9/trust/index.html',
    'nitnem-learning-v9/trust/trust.css',
    'nitnem-learning/continuous-core.js',
    'nitnem-learning/data/anand.json',
    'nitnem-learning/data/chaupai.json',
    'nitnem-learning/data/jaap.json',
    'nitnem-learning/data/library.json',
    'nitnem-learning/data/rehras.json',
    'nitnem-learning/data/savaiye.json',
    'nitnem-learning/data/sohila.json',
    'nitnem-learning/index.html',
    'nitnem-learning/learning/course.v1.json',
    'nitnem-learning/learning/learning-ui.js',
    'nitnem-learning/reader.css',
    'nitnem-learning/reader.js',
    'nitnem-learning/sw.js',
    'nitnem-parity/continuous-core.js',
    'nitnem-parity/data/anand.json',
    'nitnem-parity/data/chaupai.json',
    'nitnem-parity/data/jaap.json',
    'nitnem-parity/data/library.json',
    'nitnem-parity/data/rehras.json',
    'nitnem-parity/data/savaiye.json',
    'nitnem-parity/data/sohila.json',
    'nitnem-parity/index.html',
    'nitnem-parity/japji-assets/css/japji-full.css',
    'nitnem-parity/japji-assets/css/reader-serenity.css',
    'nitnem-parity/japji-assets/icon-180.png',
    'nitnem-parity/japji-assets/js/content.js',
    'nitnem-parity/japji-assets/js/continuous-core.js',
    'nitnem-parity/japji-assets/js/gurdwaras.js',
    'nitnem-parity/japji-assets/js/japji-full-data.js',
    'nitnem-parity/japji-assets/js/japji-full.js',
    'nitnem-parity/japji-assets/js/japji-lessons.js',
    'nitnem-parity/japji-assets/js/learning.js',
    'nitnem-parity/japji-assets/js/line-meanings.js',
    'nitnem-parity/japji-assets/js/shared-learning.js',
    'nitnem-parity/japji.html',
    'nitnem-parity/learning/course.v1.json',
    'nitnem-parity/learning/learning-ui.js',
    'nitnem-parity/reader.css',
    'nitnem-parity/reader.js',
    'nitnem-parity/sw.js',
    'nitnem-parity/trust/corrections.html',
    'nitnem-parity/trust/index.html',
    'nitnem-parity/trust/trust.css',
    'nitnem-savaiye/continuous-core.js',
    'nitnem-savaiye/data/anand.json',
    'nitnem-savaiye/data/chaupai.json',
    'nitnem-savaiye/data/jaap.json',
    'nitnem-savaiye/data/library.json',
    'nitnem-savaiye/data/rehras.json',
    'nitnem-savaiye/data/savaiye.json',
    'nitnem-savaiye/data/sohila.json',
    'nitnem-savaiye/index.html',
    'nitnem-savaiye/japji-assets/css/japji-full.css',
    'nitnem-savaiye/japji-assets/css/reader-serenity.css',
    'nitnem-savaiye/japji-assets/icon-180.png',
    'nitnem-savaiye/japji-assets/js/content.js',
    'nitnem-savaiye/japji-assets/js/continuous-core.js',
    'nitnem-savaiye/japji-assets/js/gurdwaras.js',
    'nitnem-savaiye/japji-assets/js/japji-full-data.js',
    'nitnem-savaiye/japji-assets/js/japji-full.js',
    'nitnem-savaiye/japji-assets/js/japji-lessons.js',
    'nitnem-savaiye/japji-assets/js/learning.js',
    'nitnem-savaiye/japji-assets/js/line-meanings.js',
    'nitnem-savaiye/japji-assets/js/shared-learning.js',
    'nitnem-savaiye/japji.html',
    'nitnem-savaiye/learning/course.v1.json',
    'nitnem-savaiye/learning/course.v2.json',
    'nitnem-savaiye/learning/course.v3.json',
    'nitnem-savaiye/learning/learning-ui.js',
    'nitnem-savaiye/reader.css',
    'nitnem-savaiye/reader.js',
    'nitnem-savaiye/sw.js',
    'nitnem-savaiye/trust/corrections.html',
    'nitnem-savaiye/trust/index.html',
    'nitnem-savaiye/trust/trust.css',
    'nitnem-sohila/continuous-core.js',
    'nitnem-sohila/data/anand.json',
    'nitnem-sohila/data/chaupai.json',
    'nitnem-sohila/data/jaap.json',
    'nitnem-sohila/data/library.json',
    'nitnem-sohila/data/rehras.json',
    'nitnem-sohila/data/savaiye.json',
    'nitnem-sohila/data/sohila.json',
    'nitnem-sohila/index.html',
    'nitnem-sohila/japji-assets/css/japji-full.css',
    'nitnem-sohila/japji-assets/css/reader-serenity.css',
    'nitnem-sohila/japji-assets/icon-180.png',
    'nitnem-sohila/japji-assets/js/content.js',
    'nitnem-sohila/japji-assets/js/continuous-core.js',
    'nitnem-sohila/japji-assets/js/gurdwaras.js',
    'nitnem-sohila/japji-assets/js/japji-full-data.js',
    'nitnem-sohila/japji-assets/js/japji-full.js',
    'nitnem-sohila/japji-assets/js/japji-lessons.js',
    'nitnem-sohila/japji-assets/js/learning.js',
    'nitnem-sohila/japji-assets/js/line-meanings.js',
    'nitnem-sohila/japji-assets/js/shared-learning.js',
    'nitnem-sohila/japji.html',
    'nitnem-sohila/learning/course.v1.json',
    'nitnem-sohila/learning/course.v2.json',
    'nitnem-sohila/learning/learning-ui.js',
    'nitnem-sohila/reader.css',
    'nitnem-sohila/reader.js',
    'nitnem-sohila/sw.js',
    'nitnem-sohila/trust/corrections.html',
    'nitnem-sohila/trust/index.html',
    'nitnem-sohila/trust/trust.css',
    'nitnem-today.html',
    'nitnem-trust/continuous-core.js',
    'nitnem-trust/data/anand.json',
    'nitnem-trust/data/chaupai.json',
    'nitnem-trust/data/jaap.json',
    'nitnem-trust/data/library.json',
    'nitnem-trust/data/rehras.json',
    'nitnem-trust/data/savaiye.json',
    'nitnem-trust/data/sohila.json',
    'nitnem-trust/index.html',
    'nitnem-trust/learning/course.v1.json',
    'nitnem-trust/learning/learning-ui.js',
    'nitnem-trust/reader.css',
    'nitnem-trust/reader.js',
    'nitnem-trust/sw.js',
    'nitnem-trust/trust/corrections.html',
    'nitnem-trust/trust/index.html',
    'nitnem-trust/trust/trust.css',
    'nitnem/continuous-core.js',
    'nitnem/data/anand.json',
    'nitnem/data/chaupai.json',
    'nitnem/data/jaap.json',
    'nitnem/data/library.json',
    'nitnem/data/rehras.json',
    'nitnem/data/savaiye.json',
    'nitnem/data/sohila.json',
    'nitnem/index.html',
    'nitnem/reader.css',
    'nitnem/reader.js',
    'nitnem/sw.js',
}
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
            self.send_header("Location", "/nitnem-learning-v10/index.html")
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
