// ---------- ☁️ Abgleich zwischen Janas Geräten (nur Janas Seite) ----------
// Die Seite speichert wie immer im Browser (localStorage). Dieses Skript lädt Änderungen zusätzlich
// nach /api/data hoch (Netlify Blobs hinter Janas Login) und holt beim Öffnen, beim Zurückkehren in die App
// und alle 30 Sekunden den neuesten Stand. Haben zwei Geräte gleichzeitig etwas geändert, werden die
// Einträge zusammengeführt (nichts wird überschrieben).
(() => {
  if (window.JANA_PREVIEW || window.JANA_GUEST || !window.fetch) return;
  const KEY = 'janas-woche.v2', META = 'janas-woche.sync';
  const rawSet = Storage.prototype.setItem;
  let meta = { rev: 0, dirty: false, at: 0 };
  try { meta = { ...meta, ...JSON.parse(localStorage.getItem(META) || '{}') }; } catch {}
  const saveMeta = () => { try { rawSet.call(localStorage, META, JSON.stringify(meta)); } catch {} };
  const local = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
  const hasData = (s) => !!s && (Object.values(s.weeks || {}).some((w) => (w.days || []).some((d) => d.length)) || (s.todos || []).length > 0
    || (s.uni?.deadlines || []).length > 0 || (s.books || []).length > 0 || Object.keys(s.mood || {}).length > 0);

  // Zusammenführen: Listen mit IDs werden vereinigt, Tabellen (Wochen, Wasser, Stimmung …) schlüsselweise, sonst gewinnt b.
  function merge(a, b) {
    if (b === undefined) return a;
    if (a === undefined || a === null) return b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if ([...a, ...b].every((x) => x && typeof x === 'object' && !Array.isArray(x) && 'id' in x)) {
        const out = a.map((x) => ({ ...x })), idx = new Map(out.map((x, i) => [x.id, i]));
        for (const y of b) if (idx.has(y.id)) out[idx.get(y.id)] = merge(out[idx.get(y.id)], y); else { idx.set(y.id, out.length); out.push(y); }
        return out;
      }
      if ([...a, ...b].every(Array.isArray)) return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => merge(a[i], b[i]));
      if ([...a, ...b].every((x) => typeof x === 'number')) return b.length >= a.length ? b : a;   // z. B. Wasser-Gläser eines Tages
      return b;
    }
    if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
      const out = { ...a };
      for (const k of Object.keys(b)) out[k] = merge(a[k], b[k]);
      return out;
    }
    return b;
  }

  // Statusanzeige im 💾-Fenster
  const line = document.createElement('p');
  line.className = 'muted'; line.id = 'syncLine';
  document.getElementById('backupLast')?.after(line);
  const fmt = (ts) => new Date(ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const show = (t) => { line.textContent = t; };
  const okLine = () => show(`☁️ Auf allen deinen Geräten gleich · zuletzt abgeglichen ${fmt(meta.at || Date.now())} Uhr`);

  const api = async (method, body) => {
    const r = await fetch('/api/data', { method, credentials: 'same-origin', cache: 'no-store',
      headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined });
    let data = null; try { data = await r.json(); } catch {}
    return { status: r.status, data };
  };
  // Nur übernehmen, wenn gerade nichts eingetippt wird und kein Fenster offen ist (sonst später)
  const idle = () => !document.activeElement?.matches?.('input, textarea, select') && !document.querySelector('.overlay:not([hidden])');
  let busy = false, pushTimer = null, applying = false;

  function writeLocal(state) { applying = true; try { rawSet.call(localStorage, KEY, JSON.stringify(state)); } finally { applying = false; } }

  async function push() {
    if (busy) { schedulePush(); return; }
    if (!meta.dirty) return;
    busy = true;
    try {
      const st = local();
      if (!st || (meta.rev === 0 && !hasData(st))) { meta.dirty = false; saveMeta(); return; }   // leerer neuer Browser: nichts hochladen
      const r = await api('PUT', { baseRev: meta.rev, state: st });
      if (r.status === 200) { meta = { rev: r.data.rev, at: r.data.at || Date.now(), dirty: false }; saveMeta(); okLine(); return; }
      if (r.status === 409) { busy = false; await reconcile(r.data); return; }
      show(r.status === 401 ? '☁️ Abgleich pausiert: bitte neu anmelden.' : '☁️ Abgleich gerade nicht möglich, ich versuche es gleich wieder.');
    } catch { show('☁️ Offline: Änderungen werden abgeglichen, sobald du wieder Internet hast.'); }
    finally { busy = false; }
  }
  function schedulePush() { clearTimeout(pushTimer); pushTimer = setTimeout(push, 1500); }

  // Server ist weiter als dieses Gerät: übernehmen oder (bei eigenen Änderungen) zusammenführen
  async function reconcile(srv) {
    if (!srv || !srv.rev) return;
    if (!idle()) { setTimeout(pull, 3000); return; }
    const st = local();
    if ((meta.dirty || meta.rev === 0) && hasData(st)) {
      writeLocal(merge(srv.state, st));
      meta = { rev: srv.rev, at: srv.at, dirty: true }; saveMeta();
      await push();
    } else {
      writeLocal(srv.state);
      meta = { rev: srv.rev, at: srv.at || Date.now(), dirty: false }; saveMeta();
    }
    location.reload();
  }

  async function pull() {
    if (busy) return;
    busy = true;
    let srv = null;
    try {
      const r = await api('GET');
      if (r.status !== 200) { show(r.status === 401 ? '☁️ Abgleich pausiert: bitte neu anmelden.' : '☁️ Abgleich gerade nicht möglich.'); return; }
      srv = r.data;
    } catch { show('☁️ Offline: Änderungen werden abgeglichen, sobald du wieder Internet hast.'); return; }
    finally { busy = false; }
    if (!srv.rev) {   // noch nichts online: erstes Gerät lädt seine Einträge hoch
      if (hasData(local())) { meta.dirty = true; saveMeta(); await push(); } else show('☁️ Abgleich bereit.');
      return;
    }
    if (srv.rev === meta.rev) { if (meta.dirty) await push(); else { meta.at = Date.now(); saveMeta(); okLine(); } return; }
    await reconcile(srv);
  }

  // Jede Änderung der Seite an ihren Einträgen löst einen Upload aus
  Storage.prototype.setItem = function (k, v) {
    rawSet.call(this, k, v);
    if (this === localStorage && k === KEY && !applying) { meta.dirty = true; saveMeta(); schedulePush(); }
  };
  setTimeout(pull, 400);
  setInterval(() => { if (!document.hidden) pull(); }, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pull(); });
  addEventListener('focus', () => pull());
  addEventListener('online', () => pull());
  document.addEventListener('focusout', () => setTimeout(() => { if (idle() && meta.dirty) push(); }, 300));
  window.janaSync = { pull, push, merge, meta: () => ({ ...meta }) };
})();
