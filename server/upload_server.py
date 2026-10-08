#!/usr/bin/env python3
"""Kleiner Upload-Dienst für die Präsentations-Website.

Läuft nur auf 127.0.0.1 hinter nginx. nginx liefert die Präsentationen
selbst aus; dieser Dienst nimmt nur Uploads und Löschungen an und pflegt
die Liste (list.json).

Endpunkte (alle unter /api/):
  POST   /api/upload?title=<Titel>   Body = HTML-Datei, Header X-Password
  DELETE /api/delete?id=<id>         Header X-Password

Konfiguration über Umgebungsvariablen:
  PRAES_DIR       Ordner mit den Präsentationen (Standard /var/www/praesentationen/p)
  PRAES_PASSWORD  Upload-Passwort (Pflicht)
  PRAES_PORT      Port (Standard 8090)
  PRAES_MAX_MB    maximale Dateigröße in MB (Standard 60)
"""
import hmac
import json
import os
import re
import sys
import tempfile
import time
import unicodedata
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

DIR = os.environ.get("PRAES_DIR", "/var/www/praesentationen/p")
PASSWORD = os.environ.get("PRAES_PASSWORD", "")
PORT = int(os.environ.get("PRAES_PORT", "8090"))
MAX_BYTES = int(os.environ.get("PRAES_MAX_MB", "60")) * 1024 * 1024
LIST = os.path.join(DIR, "list.json")
ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,79}$")


def slugify(text):
    text = text.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    text = text.replace("Ä", "Ae").replace("Ö", "Oe").replace("Ü", "Ue")
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text[:60] or "praesentation"


def read_list():
    try:
        with open(LIST, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def write_atomic(path, data):
    fd, tmp = tempfile.mkstemp(dir=DIR, prefix=".tmp-")
    with os.fdopen(fd, "wb") as f:
        f.write(data)
    os.chmod(tmp, 0o644)
    os.replace(tmp, path)


def write_list(items):
    write_atomic(LIST, json.dumps(items, ensure_ascii=False, indent=1).encode("utf-8"))


def title_from_html(data):
    m = re.search(rb"<title>(.*?)</title>", data[:20000], re.I | re.S)
    return m.group(1).decode("utf-8", "ignore").strip() if m else ""


class Handler(BaseHTTPRequestHandler):
    server_version = "praes/1"

    def url(self):
        # http.server liest die Anfragezeile als Latin-1; Rohbytes wieder als UTF-8 deuten
        return urlparse(self.path.encode("latin-1", "ignore").decode("utf-8", "replace"))

    def reply(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def authorized(self):
        given = self.headers.get("X-Password", "")
        return bool(PASSWORD) and hmac.compare_digest(given.encode(), PASSWORD.encode())

    def do_POST(self):
        url = self.url()
        if url.path != "/api/upload":
            return self.reply(404, {"error": "Nicht gefunden"})
        if not self.authorized():
            time.sleep(1)
            return self.reply(403, {"error": "Falsches Passwort"})
        length = int(self.headers.get("Content-Length") or 0)
        if length <= 0:
            return self.reply(400, {"error": "Leere Datei"})
        if length > MAX_BYTES:
            return self.reply(413, {"error": "Datei zu groß"})
        data = self.rfile.read(length)
        head = data[:4096].lstrip().lower()
        if not (head.startswith(b"<!doctype html") or head.startswith(b"<html")):
            return self.reply(400, {"error": "Das ist keine HTML-Präsentation (.html)"})

        q = parse_qs(url.query)
        title = (q.get("title", [""])[0].strip() or title_from_html(data) or "Präsentation")[:120]
        items = read_list()
        taken = {i["id"] for i in items}
        base = slugify(title)
        pid, n = base, 2
        while pid in taken:
            pid, n = f"{base}-{n}", n + 1

        write_atomic(os.path.join(DIR, pid + ".html"), data)
        items.insert(0, {"id": pid, "title": title, "date": time.strftime("%Y-%m-%d %H:%M"), "size": length})
        write_list(items)
        return self.reply(200, {"ok": True, "id": pid, "url": f"/p/{pid}.html"})

    def do_DELETE(self):
        url = self.url()
        if url.path != "/api/delete":
            return self.reply(404, {"error": "Nicht gefunden"})
        if not self.authorized():
            time.sleep(1)
            return self.reply(403, {"error": "Falsches Passwort"})
        pid = parse_qs(url.query).get("id", [""])[0]
        if not ID_RE.match(pid):
            return self.reply(400, {"error": "Ungültige ID"})
        items = read_list()
        if pid not in {i["id"] for i in items}:
            return self.reply(404, {"error": "Nicht gefunden"})
        try:
            os.remove(os.path.join(DIR, pid + ".html"))
        except FileNotFoundError:
            pass
        write_list([i for i in items if i["id"] != pid])
        return self.reply(200, {"ok": True})

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.headers.get("X-Real-IP", "-"), fmt % args))


def main():
    if not PASSWORD:
        sys.exit("PRAES_PASSWORD ist nicht gesetzt")
    os.makedirs(DIR, exist_ok=True)
    if not os.path.exists(LIST):
        write_list([])
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
