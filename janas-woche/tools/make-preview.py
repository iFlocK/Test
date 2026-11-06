#!/usr/bin/env python3
"""Erzeugt aus public/index.html eine Test-Vorschau für ein Claude-Artifact.

Die Vorschau läuft ohne Netlify (kein Login, keine Wetter-Schnittstelle) im
Gastmodus mit Beispieldaten und der automatischen Tour. So lassen sich
Änderungen ansehen, ohne Netlify-Guthaben zu verbrauchen.

Aufruf:  python3 tools/make-preview.py <zieldatei.html>
"""
import re
import sys
from pathlib import Path

src = Path(__file__).resolve().parent.parent / "public" / "index.html"
html = src.read_text(encoding="utf-8")

# Dokument-Gerüst entfernen: das Artifact bringt doctype, html, head und body selbst mit.
start = html.index("<title>")
html = html[start:]
html = html.replace("</head>\n<body>\n", "", 1).replace("</body>\n</html>\n", "")
# Verweise auf Dateien, die es im Artifact nicht gibt (Manifest, Icons).
html = re.sub(r'<link rel="(manifest|apple-touch-icon|icon)"[^>]*>\n', "", html)
html = html.replace("<title>Janas Woche</title>", '<title>Janas Woche Vorschau</title>\n<meta name="claude:viewport-fit-sides" content="cover">', 1)
# Vorschau-Modus einschalten, bevor die Skripte laufen.
html = html.replace("<script>", "<script>window.JANA_GUEST = true; window.JANA_PREVIEW = true;</script>\n<script>", 1)

for bad in ("<!doctype", "<html", "<body", "</head>"):
    assert bad not in html.lower(), bad
out = Path(sys.argv[1] if len(sys.argv) > 1 else "janas-woche-vorschau.html")
out.write_text(html, encoding="utf-8")
print(f"Vorschau geschrieben: {out} ({len(html) // 1024} KB)")
