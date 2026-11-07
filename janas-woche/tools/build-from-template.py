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
        {'v': '0.10.0', 'title': 'Deine eigenen Einstellungen', 'notes': [
            ['⚙️', 'Einstellungen mit Tabs', 'Oben unter ⚙️ Einstellungen findest du alles als Tabs: Name, Farbe, Haustier, Gewohnheiten, Uni, Zyklus, Verein, besondere Tage und Wetter.'],
            ['🐾', 'Katze oder Kaninchen', 'Statt des Hundes kannst du auch eine Katze oder ein Kaninchen haben, jeweils mit eigenem Häuschen und eigener Fellfarbe.'],
            ['🎨', 'Farben', 'Such dir eine von fünf Pastellfarben für die ganze Seite aus.'],
            ['🌸', 'Zyklus-Tracker', 'Wenn du möchtest: Periode eintragen, aktuelle Zyklusphase sehen und eine Schätzung für die nächste Periode. Bleibt nur auf deinem Handy.'],
            ['⚽', 'Lieblingsverein', 'Wähle einen Verein und sieh den Countdown zum nächsten Spiel, mit Bundesliga, DFB-Pokal und Champions League.'],
            ['🐷', 'Sparziele', 'Spar auf etwas hin und sieh zu, wie sich das Pixel-Sparschwein füllt.'],
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

s = src.replace('habit-baukasten.', 'janas-woche.')
for a, b in [('<title>Mein Wochenplaner</title>', '<title>Janas Woche</title>'),
             ('<meta name="apple-mobile-web-app-title" content="Wochenplaner">', '<meta name="apple-mobile-web-app-title" content="Janas Woche">'),
             ('<h1 id="pageTitle">Mein Wochenplaner</h1>', '<h1 id="pageTitle">Janas Woche</h1>')]:
    assert s.count(a) == 1, a
    s = s.replace(a, b)
assert "const KEY = 'janas-woche.v2'" in s
cfg = '<script>window.HB_CONFIG = ' + json.dumps(CONFIG, ensure_ascii=False) + ';</script>\n'
s = s.replace('<script>', cfg + '<script>', 1)
out_path.write_text(s, encoding='utf-8')
print(f'Janas Seite gebaut: {out_path.relative_to(ROOT)} ({len(s) // 1024} KB), Version {CONFIG["changelog"][0]["v"]}')
