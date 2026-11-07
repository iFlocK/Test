"""Spielplan-Schnappschuss für die Claude-Vorschau.

Claude-Vorschauen dürfen keine fremden Webseiten abrufen. Dieses Skript lädt den aktuellen
Spielplan (Bundesliga, DFB-Pokal, Champions League) und die Vereinsliste bei OpenLigaDB und
schreibt ihn als window.HB_FIXTURE_SNAPSHOT in eine fertige Vorschau-Datei.

  python3 habit-baukasten/tools/fixture-snapshot.py <vorschau.html>
"""
import json, sys, urllib.request, datetime

API = 'https://api.openligadb.de/'
def get(path):
    with urllib.request.urlopen(urllib.request.Request(API + path, headers={'Accept': 'application/json'}), timeout=60) as r:
        return json.load(r)

now = datetime.datetime.now()
season = now.year if now.month >= 7 else now.year - 1
comps = {}
for comp, sc in [('Bundesliga', 'bl1'), ('DFB-Pokal', 'dfb'), ('Champions League', 'ucl')]:
    rows = []
    for m in get(f'getmatchdata/{sc}/{season}'):
        rs = m.get('matchResults') or []
        res = next((x for x in rs if x.get('resultTypeID') == 2), rs[-1] if rs else None)
        rows.append([m['matchID'], m.get('matchDateTimeUTC') or m.get('matchDateTime'), m['team1']['teamName'], m['team2']['teamName'],
                     (m.get('group') or {}).get('groupName', ''), bool(m.get('matchIsFinished')),
                     res['pointsTeam1'] if res else None, res['pointsTeam2'] if res else None])
    comps[comp] = rows
teams = [[t['teamName'], t.get('shortName') or t['teamName']] for t in get(f'getavailableteams/bl1/{season}')]
snap = {'at': int(now.timestamp() * 1000), 'season': season, 'comps': comps, 'teams': teams}

path = sys.argv[1]
html = open(path, encoding='utf-8').read()
tag = '<script>window.HB_FIXTURE_SNAPSHOT = ' + json.dumps(snap, ensure_ascii=False, separators=(',', ':')) + ';</script>\n'
html = html.replace('<script>', tag + '<script>', 1)
open(path, 'w', encoding='utf-8').write(html)
print(f'Spielplan eingebettet: {sum(len(v) for v in comps.values())} Spiele, {len(teams)} Vereine, Saison {season}/{season + 1}, {len(tag) // 1024} KB')
