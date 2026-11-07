# Mein Wochenplaner

Die allgemeine Version von „Janas Woche“ für alle (Ordner `habit-baukasten/`). Janas Seite (`janas-woche/`) bleibt davon unberührt.
Live und öffentlich unter https://mein-wochenplaner.netlify.app (Netlify-Projekt `mein-wochenplaner`).
Die Seite liegt in `public/` (mit Icons und App-Manifest); zum Veröffentlichen aus dem Ordner `habit-baukasten/` hochladen.

- Beim ersten Öffnen führt ein Einrichtungs-Assistent durch Name, Farbe, Fellfarbe und Name des Hundes,
  Gewohnheiten, Geburtstag, Jahrestag (optional) und Wohnort für das Wetter.
- Alles lässt sich später über ⚙️ Einstellungen ändern. Dort sind die Bereiche Tabs, die man direkt anwählen kann.
- Haustier wählbar: Hund (mit Hütte), Katze (mit Katzenhaus) oder Kaninchen (mit Stall).
- Optionaler Bereich „🎓 Uni“: Lern-Timer (25/5, lange Pause nach 4 Runden), Fächer mit Lernzeit,
  Abgaben & Deadlines, Lernziele pro Woche.
- „📖 Gelesene Bücher“: Titel, Autor:in, Genre (feste Farbe je Genre, Regal danach sortiert, mit Legende), 0,5–5 Sterne (halbe Sterne: links auf einen Stern) und Datum.
  Beim Darüberfahren oder Antippen eines Buchrückens erscheint das Cover (Apple-Books-Suche, sonst Open Library; die Adresse wird beim Buch gespeichert).
- „🐷 Sparziele“: Ziel mit Betrag und optionalem Datum, Einzahlen/Abheben, Pixel-Sparschwein füllt sich, Sparplan pro Monat.
- „🌸 Zyklus“ (optional, im Assistenten wählbar): Periode starten/beenden, aktuelle Zyklusphase mit Farbstreifen, Schätzung der nächsten Periode und fruchtbaren Tage (lernt aus den Einträgen), Befinden-Chips, 🩸 in den Tageskarten. Bleibt nur auf dem Gerät; Schätzungen, nicht zur Verhütung.
- Kein eigener Server nötig: Das Wetter kommt direkt von Open-Meteo, Daten liegen im Browser
  (Speicher-Präfix `habit-baukasten.`).

Vorschau erzeugen:
`python3 janas-woche/tools/make-preview.py vorschau.html habit-baukasten/public/index.html`
(startet mit dem Assistenten; der Knopf „🧪 Demo“ schaltet auf Beispieldaten mit Tour um).

## Konten, Mann/Frau und Lieblingsverein (Vorschau)
- „👤 Konto“: Jede Person legt sich Benutzername und Passwort selbst an. Passwörter werden nur als PBKDF2-Hash gespeichert.
  Konten und Einträge liegen bisher nur im Browser des Geräts (localStorage, je Konto ein eigener Schlüssel `habit-baukasten.v2:<name>`).
  Für eine echte Online-Version mit Anmeldung von überall braucht es noch einen Server (z. B. Netlify-Funktion mit Speicher).
- Admin-Zugang: Benutzer `admin`. Das Passwort kennt nur der Inhaber; im Code steht es nur als PBKDF2-Hash (Konstante `ADMIN`).
  Der Admin sieht unter „🛠️ Konten verwalten“ die Konten auf dem Gerät, kann Passwörter zurücksetzen und Konten löschen. Einträge bleiben privat.
- Im Assistenten „Über dich“: Frau oder Mann. Den Zyklus-Tracker gibt es nur für Frauen.
- „⚽ Lieblingsverein“: Bundesliga-Verein wählen (oder „Anderer Verein“). Countdown zum nächsten Spiel, automatisch aus OpenLigaDB
  (api.openligadb.de, kostenlos, ohne Schlüssel, Abruf direkt aus dem Browser erlaubt):
  Bundesliga `bl1`, DFB-Pokal `dfb`, Champions League `ucl` (falls das Kürzel wechselt, wird es in `getavailableleagues` gesucht).
  Die Vereinsliste kommt aus `getavailableteams/bl1/<Saison>` und passt sich Auf- und Absteigern an.
  Spielplan höchstens alle 6 Stunden, während eines Spiels alle 5 Minuten (Spielstand). Spiele lassen sich auch selbst eintragen.
  Claude-Vorschauen dürfen keine fremden Seiten abrufen. Für die Vorschau den Spielplan deshalb mit einbetten:
  `python3 janas-woche/tools/make-preview.py vorschau.html habit-baukasten/public/index.html && python3 habit-baukasten/tools/fixture-snapshot.py vorschau.html`
- Dazu alle Funktionen von Janas Seite: Easter Eggs, Patch Notes mit Feuerwerk, einklappbare Tabs, Discord-Lerngruppe, Ton immer an.
- „💾 Datensicherung“ (Knopf unten rechts): alle Einträge als JSON-Datei speichern (auf dem iPhone über „Teilen“) und wiederherstellen.
  Ein roter Punkt erinnert, wenn die letzte Sicherung älter als 14 Tage ist.
