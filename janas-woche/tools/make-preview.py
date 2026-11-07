#!/usr/bin/env python3
"""Erzeugt aus public/index.html eine Test-Vorschau für ein Claude-Artifact.

Die Vorschau läuft ohne Netlify (kein Login, keine Wetter-Schnittstelle) im
Gastmodus mit Beispieldaten und der automatischen Tour. So lassen sich
Änderungen ansehen, ohne Netlify-Guthaben zu verbrauchen.

Aufruf:  python3 tools/make-preview.py <zieldatei.html> [quelldatei.html]
"""
import re
import sys
from pathlib import Path

src = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).resolve().parent.parent / "public" / "index.html"
html = src.read_text(encoding="utf-8")

# Dokument-Gerüst entfernen: das Artifact bringt doctype, html, head und body selbst mit.
start = html.index("<title>")
html = html[start:]
html = html.replace("</head>\n<body>\n", "", 1).replace("</body>\n</html>\n", "")
# Verweise auf Dateien, die es im Artifact nicht gibt (Manifest, Icons).
html = re.sub(r'<link rel="(manifest|apple-touch-icon|icon)"[^>]*>\n', "", html)
html = re.sub(r"<title>(.*?)</title>", lambda m: f'<title>{m.group(1)} Vorschau</title>\n<meta name="claude:viewport-fit-sides" content="cover">', html, count=1)
prefix = re.search(r"const KEY = '([\w-]+)\.", html).group(1)   # Speicher-Präfix der jeweiligen Seite
# Vorschau-Modus einschalten, bevor die Skripte laufen.
# Demo an (Standard) oder aus: der Schalter in der Vorschau merkt sich die Wahl im Browser.
# Vorlage mit Einrichtungs-Assistent startet echt (Assistent zuerst), Janas Seite startet in der Demo.
start_real = 'id="setupOverlay"' in html
cond = f"localStorage.getItem('{prefix}.previewMode') === 'demo'" if start_real else f"localStorage.getItem('{prefix}.previewMode') !== 'echt'"
html = html.replace("<script>", "<script>window.JANA_PREVIEW = true; try { window.JANA_GUEST = " + cond + "; } catch { window.JANA_GUEST = " + ("false" if start_real else "true") + "; }</script>\n<script>", 1)

for bad in ("<!doctype", "<html", "<body", "</head>"):
    assert bad not in html.lower(), bad
out = Path(sys.argv[1] if len(sys.argv) > 1 else "janas-woche-vorschau.html")
out.write_text(html, encoding="utf-8")
print(f"Vorschau geschrieben: {out} ({len(html) // 1024} KB)")
