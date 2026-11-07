# Habit-Baukasten (Vorlage)

Test-Version von „Janas Woche“ als Vorlage für jeden. Janas Seite (`janas-woche/`) bleibt davon unberührt.

- Beim ersten Öffnen führt ein Einrichtungs-Assistent durch Name, Farbe, Fellfarbe und Name des Hundes,
  Gewohnheiten, Geburtstag, Jahrestag (optional) und Wohnort für das Wetter.
- Alles lässt sich später über ⚙️ Einstellungen ändern.
- Haustier wählbar: Hund (mit Hütte), Katze (mit Katzenhaus) oder Kaninchen (mit Stall).
- Optionaler Bereich „🎓 Uni“: Lern-Timer (25/5, lange Pause nach 4 Runden), Fächer mit Lernzeit,
  Abgaben & Deadlines, Lernziele pro Woche.
- Kein eigener Server nötig: Das Wetter kommt direkt von Open-Meteo, Daten liegen im Browser
  (Speicher-Präfix `habit-baukasten.`).

Vorschau erzeugen:
`python3 janas-woche/tools/make-preview.py vorschau.html habit-baukasten/index.html`
(startet mit dem Assistenten; der Knopf „🧪 Demo“ schaltet auf Beispieldaten mit Tour um).
