"""Baut Janas Seite aus der allgemeinen Version („Mein Wochenplaner“).

Janas Seite hat dieselben Funktionen und Einstellungen, aber:
- kein eigenes Konto (Login über Netlify, siehe netlify/edge-functions/login.ts),
- keine Frage nach Mann/Frau, festes Profil (Name, Geburtstag, Jahrestag),
- Wetter ohne Ortsangabe über /api/weather,
- eigene Speicher-Schlüssel (janas-woche.*) und eigene Patch Notes.

  python3 janas-woche/tools/build-from-template.py
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
src = (ROOT / 'habit-baukasten/public/index.html').read_text(encoding='utf-8')
out_path = ROOT / 'janas-woche/public/index.html'

CONFIG = {
    'single': True, 'noGender': True, 'serverWeather': True,
    'preset': {'name': 'Jana', 'gender': 'w', 'palette': 'rosa', 'animal': 'dog', 'fur': 'golden', 'pet': '', 'uni': True, 'cycle': False,
               'club': '', 'clubName': '', 'clubShort': '', 'birthday': '2000-08-25', 'together': {'date': '2025-09-18', 'partner': ''}, 'city': ''},
    'changelog': [
        {'v': '0.10.1', 'title': 'Überall gleich und schönere Bücher', 'notes': [
            ['⭐', 'Halbe Sterne', 'Bücher kannst du jetzt auch mit halben Sternen bewerten: links auf einen Stern tippen.'],
            ['📚', 'Genres und Cover', 'Jedes Buch bekommt ein Genre mit eigener Farbe, das Regal ist danach sortiert. Fahr mit der Maus über einen Buchrücken oder tipp ihn an, dann siehst du das Cover.'],
            ['☁️', 'MacBook und iPhone', 'Was du am MacBook einträgst, ist auch auf dem iPhone da, und umgekehrt. Der Abgleich passiert automatisch beim Öffnen und nach jeder Änderung.'],
            ['💾', 'Datensicherung', 'Unten rechts gibt es jetzt den 💾-Knopf: Speichere deine Einträge (Deadlines, Gewohnheiten, Bücher …) als Datei, zum Beispiel über „In Dateien sichern“, und stelle sie bei Bedarf wieder her. Ein roter Punkt erinnert dich, wenn die letzte Sicherung länger als zwei Wochen her ist.'],
        ]},
        {'v': '0.10.0', 'title': 'Deine eigenen Einstellungen', 'notes': [
            ['⚙️', 'Einstellungen mit Tabs', 'Oben unter ⚙️ Einstellungen findest du alles als Tabs: Name, Farbe, Haustier, Gewohnheiten, Uni, Zyklus, Verein, besondere Tage und Wetter.'],
            ['🐾', 'Katze oder Kaninchen', 'Statt des Hundes kannst du auch eine Katze oder ein Kaninchen haben, jeweils mit eigenem Häuschen und eigener Fellfarbe.'],
            ['🎨', 'Farben', 'Such dir eine von fünf Pastellfarben für die ganze Seite aus.'],
            ['🌸', 'Zyklus-Tracker', 'Wenn du möchtest: Periode eintragen, aktuelle Zyklusphase sehen und eine Schätzung für die nächste Periode. Bleibt nur auf deinem Handy.'],
            ['⚽', 'Lieblingsverein', 'Wähle einen Verein und sieh den Countdown zum nächsten Spiel, mit Bundesliga, DFB-Pokal und Champions League.'],
            ['🗂️', 'Ein- und ausklappen', 'Tippe auf eine Überschrift, um einen Bereich zuzuklappen. Die Seite merkt sich das.'],
        ]},
        {'v': '0.9.0', 'title': 'Das große Herbst-Update', 'notes': [
            ['🎓', 'Uni-Bereich', 'Lern-Timer, Fächer mit Lernzeit, Abgaben und Deadlines und Lernziele für jede Woche. Beim Lernen ist der Hund ganz leise.'],
            ['💬', 'Discord-Lerngruppe', 'Speichere den Einladungslink im Uni-Bereich und öffne deine Gruppe mit einem Tipp.'],
            ['📖', 'Gelesene Bücher', 'Dein eigenes Bücherregal mit Titel, Autor:in und Sternen.'],
            ['😊', 'Stimmungsbarometer', 'Trag jeden Tag ein, wie es dir geht. Der Hund reagiert darauf.'],
            ['🔊', 'Ton immer an', 'Der Ton-Knopf ist weg: Der Hund bellt jetzt immer, sobald du einmal auf die Seite getippt hast.'],
            ['🤫', 'Geheimnisse', 'Im Garten und am Himmel verstecken sich viele neue Überraschungen. Mehr wird nicht verraten!'],
        ]},
    ],
}

# Code-Änderungen nur für Janas Seite (die öffentliche Version bleibt unverändert)
JANA_PATCHES = [
 [
  "  window.HB_USER = window.JANA_GUEST ? null : hbUser;\n  window.HB_LOCKED = !window.JANA_GUEST && !hbUser;",
  "  const CFG = window.HB_CONFIG || {};   // Janas Seite: { single, noGender, serverWeather, preset, changelog }\n  window.HB_USER = window.JANA_GUEST || CFG.single ? null : hbUser;\n  window.HB_LOCKED = !window.JANA_GUEST && !CFG.single && !hbUser;\n  if (CFG.single) window.HB_ADMIN = false;"
 ],
 [
  "  if (GUEST) state = demoState();",
  "  if (GUEST) state = demoState();\n  if (CFG.preset && GUEST) state.profile = { ...state.profile, ...CFG.preset };\n  if (CFG.preset && !GUEST && !state.profile) state.profile = { ...CFG.preset, animal: state.pet?.animal || CFG.preset.animal || 'dog', fur: state.pet?.fur || CFG.preset.fur || 'golden' };   // bestehende Daten übernehmen"
 ],
 [
  "  const steps = () => STEP_ORDER.filter((k) => k !== 'cycle' || draft?.gender === 'w');",
  "  const steps = () => STEP_ORDER.filter((k) => (k !== 'cycle' || draft?.gender === 'w') && !(k === 'gender' && CFG.noGender));"
 ],
 [
  "  const CHANGELOG = [",
  "  const CHANGELOG = CFG.changelog || ["
 ],
 [
  "    if (ok && !seen) { try { localStorage.setItem(SEEN_KEY, APP_VERSION); } catch {} }   // neue Konten: Begrüßung kommt nach der Einrichtung",
  "    if (ok && !seen && !CFG.single) { try { localStorage.setItem(SEEN_KEY, APP_VERSION); } catch {} }   // neue Konten: Begrüßung kommt nach der Einrichtung"
 ],
 [
  "    } else throw new Error('kein Ort');",
  "    } else if (window.HB_CONFIG?.serverWeather) {\n      const r = await fetch('/api/weather' + qs, { credentials: 'same-origin', cache: 'no-store' });\n      if (!r.ok) throw new Error(r.status);\n      return r.json();\n    } else throw new Error('kein Ort');"
 ]
]
# Sparziele gibt es bei Jana nicht
JANA_PATCHES += [
    ['  <section class="card savings" id="saveCard">', '  <section class="card savings" id="saveCard" hidden>'],
    ["    ['save10', '🐷', 'Sparschwein', '10-mal etwas aufs Sparziel gelegt', (s) => s.deposits >= 10],\n", ''],
    ["    ['savegoal', '🦊', 'Sparfuchs', 'Das erste Sparziel erreicht', (s) => s.savedGoals >= 1],\n", ''],
]

s = src
for a, rep in JANA_PATCHES:
    assert s.count(a) == 1, ('Stelle nicht gefunden', a[:80])
    s = s.replace(a, rep)
# Tour-Szene zu den Sparzielen entfernen
import re as _re
s, n = _re.subn(r"    \{ label: '🐷 Sparziele[^\n]*\n", '', s)
assert n == 1
s = s.replace('habit-baukasten.', 'janas-woche.')
for a, b in [('<title>Mein Wochenplaner</title>', '<title>Janas Woche</title>'),
             ('<meta name="apple-mobile-web-app-title" content="Wochenplaner">', '<meta name="apple-mobile-web-app-title" content="Janas Woche">'),
             ('<h1 id="pageTitle">Mein Wochenplaner</h1>', '<h1 id="pageTitle">Janas Woche</h1>')]:
    assert s.count(a) == 1, a
    s = s.replace(a, b)
assert "const KEY = 'janas-woche.v2'" in s
# Geräte-Abgleich (nur Janas Seite)
sync_js = (ROOT / 'janas-woche/tools/sync.js').read_text(encoding='utf-8')
assert s.endswith('</script>\n</body>\n</html>\n')
s = s[:-len('</body>\n</html>\n')] + '<script>\n' + sync_js + '</script>\n</body>\n</html>\n'
cfg = '<script>window.HB_CONFIG = ' + json.dumps(CONFIG, ensure_ascii=False) + ';</script>\n'
s = s.replace('<script>', cfg + '<script>', 1)
out_path.write_text(s, encoding='utf-8')
print(f'Janas Seite gebaut: {out_path.relative_to(ROOT)} ({len(s) // 1024} KB), Version {CONFIG["changelog"][0]["v"]}')
