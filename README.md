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

# NextUp – Filme und Serien

(Arbeitstitel war „Kino & Serien“; der Ordner `kino-serien/` heißt weiter so.)

Zeigt, was für den deutschen Markt gerade neu ist und bald kommt: Kinofilme sowie Serien und neue Staffeln, jeweils mit Cover.
Dazu eine eigene Liste, in der man Filme und Serien nach Staffeln und Folgen abhakt.
Gestaltet nach den Apple-Designrichtlinien (SF-Schrift, Segmentsteuerung, durchscheinende Leisten, Sheets, heller und dunkler Modus).
Alles liegt im Ordner `kino-serien/`, die Seite selbst in `public/index.html`.
Live unter https://nextup-filme-serien.netlify.app (Netlify-Projekt `nextup-filme-serien`, Umgebungsvariablen `TMDB_KEY` und `AUTH_SECRET` sind gesetzt).

- **Filme:** „Jetzt im Kino“ und „Demnächst im Kino“ (nach Monaten, mit Countdown). Nur Filme mit Kinostart im gewählten Land
  (Deutschland, Österreich, Schweiz), mit dem dortigen Starttermin und der FSK.
- **Serien:** „Neue Serien und Staffeln“ (Staffelstart in den letzten 60 Tagen) und „Demnächst“ (nächste 12 Monate).
  Nur was im gewählten Land per Abo, kostenlos oder mit Werbung streambar ist; bei ganz neuen Serien ohne eingetragenen Anbieter
  nur deutsch- und englischsprachige. Nachrichten, Reality-TV, Talkshows und Seifenopern sind ausgeblendet.
  Der Schalter „Auch internationale Titel“ in den Einstellungen hebt die Eingrenzung auf.
- **Filter:** nach Genre (Filme und Serien) und nach Streaming-Dienst (Serien).
- **Suche** über ganz TMDB, um auch ältere Titel in die eigene Liste zu holen.
- **Meine Liste:** Filme merken und als gesehen markieren; Serien Staffel für Staffel und Folge für Folge abhaken.
  Bereiche „Als Nächstes“ (nächste Folge ohne Haken, mit Schnell-Haken auf dem Cover), „Bald neue Folgen“, „Merkliste“ und „Gesehen“.
- **Details** per Tipp aufs Cover: Handlung, Trailer, Staffeln und Folgen, Besetzung, Sender, nächste Folge, Streaming-Anbieter.

## Daten (TMDB)
Daten und Cover kommen von [TMDB](https://www.themoviedb.org). Dafür braucht man einen kostenlosen Schlüssel
(Konto anlegen, dann unter *Einstellungen → API* beantragen). Es gibt zwei Wege:

1. **Im Browser:** Seite öffnen und den Schlüssel einfügen. Er bleibt nur im `localStorage` dieses Browsers.
2. **Auf Netlify:** Umgebungsvariable `TMDB_KEY` setzen. Die Edge-Funktion `netlify/edge-functions/tmdb.ts` reicht die Anfragen
   dann unter `/api/tmdb/*` weiter (nur die benötigten Pfade, höchstens 600 Anfragen pro Minute und IP).

Listen werden im Browser drei Stunden zwischengespeichert, Staffel-Stände zwölf Stunden. Der erste Aufruf des Serien-Tabs braucht
rund 100 Anfragen, weil für jede Serie der Staffelstart nachgeschlagen wird.
Hinweis: TMDB führt bei Serien die Termine der Erstausstrahlung, nicht eigene deutsche Starttermine.

## Konto und Abgleich zwischen Geräten
Ohne Konto liegt „Meine Liste“ nur im Browser (`localStorage`, Schlüssel `ks.lib`). Auf der veröffentlichten Seite kann man sich
unter ⚙️ ein Konto anlegen, dann ist die Liste auf allen Geräten gleich. Aufbau wie bei „Mein Wochenplaner“:

- `netlify/functions/auth.mts`: `/api/register`, `/api/login`, `/api/logout`, `/api/me`. Passwörter als PBKDF2-Hash,
  Anmeldung per HttpOnly-Cookie `ks_session`, signiert mit der Netlify-Umgebungsvariable **`AUTH_SECRET`** (muss gesetzt sein).
- `netlify/functions/data.mts`: `/api/data`, je Konto ein JSON-Dokument mit Versionszähler (Netlify Blobs, Stores
  `kino-serien-users` und `kino-serien-data`).
- Jeder Haken trägt einen Zeitstempel (negativ = Haken entfernt). Haben zwei Geräte gleichzeitig geändert, führt die Seite
  beide Stände zusammen; der jeweils neuere Haken gewinnt. Beim Abmelden wird die Liste auf dem Gerät entfernt.
- Ein vergessenes Passwort lässt sich noch nicht zurücksetzen.
- Abhängigkeit `@netlify/blobs` (Version 10) in `package.json`, Node 22 in `netlify.toml`.
- App-Icon mit Filmklappe: `public/icon.svg` ist die Vorlage, daraus sind `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`
  und `favicon.png` erzeugt. Mit `manifest.webmanifest` lässt sich die Seite auf den Home-Bildschirm legen.
- Beim ersten Öffnen erklärt eine Einführung die Funktionen (Merker `ks.intro` im Browser); unter ⚙️ → „Einführung zeigen“ lässt sie sich wieder aufrufen.
