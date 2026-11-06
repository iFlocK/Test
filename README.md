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
