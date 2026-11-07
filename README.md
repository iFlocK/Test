# Haushaltsbuch

Eine schlanke Web-App, mit der du Einnahmen und Ausgaben erfasst und auswertest. Sie besteht aus einer einzigen Datei und braucht keine Installation und keinen Server.

## Funktionen

- Einnahmen und Ausgaben mit Datum, Beschreibung, Kategorie und Betrag erfassen
- Monatsübersicht mit Einnahmen, Ausgaben und Saldo
- Ausgaben nach Kategorie als Balkendiagramm mit Prozentanteilen
- Suche in Beschreibung und Kategorie
- CSV-Export und -Import (Semikolon-getrennt, deutsches Zahlenformat, öffnet sich direkt in Excel oder LibreOffice)
- Heller und dunkler Modus, passend zur Systemeinstellung
- Funktioniert auch auf dem Handy

## Benutzung

1. `index.html` im Browser öffnen (Doppelklick genügt).
2. Einträge hinzufügen. Beträge gehen als `12,50` oder `12.50`.
3. Über ◀ ▶ oder die Auswahlliste zwischen den Monaten wechseln.

## Daten

Die Daten werden nur im `localStorage` deines Browsers gespeichert und verlassen deinen Rechner nicht. Wenn du die Browserdaten löschst, sind sie weg. Exportiere deshalb regelmäßig eine CSV-Datei als Sicherung.

CSV-Format:

```
Datum;Typ;Beschreibung;Kategorie;Betrag
2026-11-01;Einnahme;Gehalt;Gehalt;2500,00
2026-11-03;Ausgabe;Wocheneinkauf;Lebensmittel;87,45
```

# Janas Woche

Wochenplaner mit Gewohnheits-Tags, langfristigen To-dos und Pixel-Labrador.
Live unter https://janas-woche.netlify.app

Die veröffentlichte Version liegt im Ordner `janas-woche/`: die Seite mit App-Icons und Manifest in `public/`,
der Login als Edge-Funktion in `netlify/edge-functions/login.ts`.
Benutzername, Passwort und Geheimschlüssel stehen nicht im Code, sondern als Netlify-Umgebungsvariablen
`JANA_USER`, `JANA_PASS` und `AUTH_SECRET`. Nach einer Änderung dort neu deployen.
Einträge werden nur im Browser des jeweiligen Geräts gespeichert (localStorage, Schlüssel `janas-woche.v2`).
Bei Änderungen das Speicherformat beibehalten, damit vorhandene Einträge erhalten bleiben.

Weitere Bereiche: 🎓 Uni (Lern-Timer, Fächer & Lernzeit, Abgaben, Lernziele pro Woche, Link zur Discord-Lerngruppe)
und 📖 Gelesene Bücher (Regal, Autor:in, Sterne).
Unter ⚙️ Einstellungen lässt sich das Haustier wählen (Hund, Katze oder Kaninchen, je mit eigenem Häuschen) und die Fellfarbe ändern.
Uni, Lern-Timer, Gewohnheiten, Wochen-Notiz und To-dos sind ein- und ausklappbar.

Versteckte Überraschungen: Mond 3× antippen (Werwolf), Sternschnuppe nachts antippen, 5× auf „Janas Woche“ (Disco),
Hund 10× schnell antippen (Kunststück), Ball antippen (apportieren), leeren Napf antippen, 11:11 und 22:22,
Freitag der 13. (schwarze Katze), Regenbogen nach Regen, „Ich liebe dich“ als Gewohnheit oder To-do (Herzregen),
nachts 3× auf die Hütte (Hund singt). Jede gibt einen geheimen Erfolg.

**Abgleich zwischen Janas Geräten (ab 0.10.1):** Die Login-Funktion (`netlify/edge-functions/login.ts`) bietet hinter dem Login
`/api/data` an: ein JSON-Dokument mit allen Einträgen in Netlify Blobs (Store `janas-woche`, Schlüssel `state`, mit Versionszähler).
`janas-woche/tools/sync.js` wird beim Bauen in Janas Seite eingefügt: Änderungen werden hochgeladen, beim Öffnen und alle 30 Sekunden
wird abgeglichen, bei gleichzeitigen Änderungen werden die Einträge zusammengeführt. `?test=1` nutzt einen Test-Schlüssel.
Die Abhängigkeit `@netlify/blobs` (Version 10, läuft ab Node 16; Version 11 braucht Node 22.12 und ließ den Build scheitern) steht in `janas-woche/package.json` mit `package-lock.json`.

**Seit Version 0.10.0 wird Janas Seite aus der allgemeinen Version gebaut** (`habit-baukasten/public/index.html`):
`python3 janas-woche/tools/build-from-template.py` erzeugt `janas-woche/public/index.html` mit Janas festem Profil
(ohne Mann/Frau-Frage, ohne eigene Konten, ohne Sparziele, Wetter ohne Ort über `/api/weather`), ihren Speicher-Schlüsseln `janas-woche.*`
und ihren eigenen Patch Notes. Alle Jana-Anpassungen stehen nur im Skript, die öffentliche Version enthält davon nichts. Änderungen also in der allgemeinen Version machen und danach bauen.

## Änderungen testen, ohne Netlify-Guthaben zu verbrauchen
1. Änderungen in `janas-woche/public/index.html` machen.
2. Vorschau erzeugen: `python3 janas-woche/tools/make-preview.py vorschau.html` und als Claude-Artifact ansehen.
   Die Vorschau läuft im Gastmodus mit Beispieldaten (ohne Login und Wetter-Schnittstelle).
3. Erst wenn ein Paket fertig ist, **einmal** zu Netlify hochladen. Jedes Veröffentlichen kostet Guthaben.
4. Vor jedem Upload die Version erhöhen: in `index.html` oben in `CHANGELOG` einen neuen Eintrag mit Versionsnummer und Patch Notes ergänzen.
   Beim nächsten Öffnen zeigt die Seite dann einmal das Fenster „Was ist neu?“. Geheimnisse dort nur andeuten, nicht verraten.
