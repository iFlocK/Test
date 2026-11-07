# Habit-Baukasten (Vorlage)

Test-Version von „Janas Woche“ als Vorlage für jeden. Janas Seite (`janas-woche/`) bleibt davon unberührt.

- Beim ersten Öffnen führt ein Einrichtungs-Assistent durch Name, Farbe, Fellfarbe und Name des Hundes,
  Gewohnheiten, Geburtstag, Jahrestag (optional) und Wohnort für das Wetter.
- Alles lässt sich später über ⚙️ Einstellungen ändern.
- Haustier wählbar: Hund (mit Hütte), Katze (mit Katzenhaus) oder Kaninchen (mit Stall).
- Optionaler Bereich „🎓 Uni“: Lern-Timer (25/5, lange Pause nach 4 Runden), Fächer mit Lernzeit,
  Abgaben & Deadlines, Lernziele pro Woche.
- „📖 Gelesene Bücher“: Titel, Autor:in, 1–5 Sterne und Datum, mit Pixel-Bücherregal und Jahresstatistik.
- „🐷 Sparziele“: Ziel mit Betrag und optionalem Datum, Einzahlen/Abheben, Pixel-Sparschwein füllt sich, Sparplan pro Monat.
- „🌸 Zyklus“ (optional, im Assistenten wählbar): Periode starten/beenden, aktuelle Zyklusphase mit Farbstreifen, Schätzung der nächsten Periode und fruchtbaren Tage (lernt aus den Einträgen), Befinden-Chips, 🩸 in den Tageskarten. Bleibt nur auf dem Gerät; Schätzungen, nicht zur Verhütung.
- Kein eigener Server nötig: Das Wetter kommt direkt von Open-Meteo, Daten liegen im Browser
  (Speicher-Präfix `habit-baukasten.`).

Vorschau erzeugen:
`python3 janas-woche/tools/make-preview.py vorschau.html habit-baukasten/index.html`
(startet mit dem Assistenten; der Knopf „🧪 Demo“ schaltet auf Beispieldaten mit Tour um).

## Konten, Mann/Frau und Lieblingsverein (Vorschau)
- „👤 Konto“: Jede Person legt sich Benutzername und Passwort selbst an. Passwörter werden nur als PBKDF2-Hash gespeichert.
  Konten und Einträge liegen bisher nur im Browser des Geräts (localStorage, je Konto ein eigener Schlüssel `habit-baukasten.v2:<name>`).
  Für eine echte Online-Version mit Anmeldung von überall braucht es noch einen Server (z. B. Netlify-Funktion mit Speicher).
- Im Assistenten „Über dich“: Frau oder Mann. Den Zyklus-Tracker gibt es nur für Frauen.
- „⚽ Lieblingsverein“: Bundesliga-Verein wählen (oder „Anderer Verein“). Countdown zum nächsten Spiel aus dem Spielplan von OpenLigaDB
  (Bundesliga, DFB-Pokal, Champions League), höchstens alle 6 Stunden geladen. Spiele lassen sich auch selbst eintragen.
- Dazu alle Funktionen von Janas Seite: Easter Eggs, Patch Notes mit Feuerwerk, einklappbare Tabs, Discord-Lerngruppe, Ton immer an.
