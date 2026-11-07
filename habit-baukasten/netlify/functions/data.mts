// Abgleich der Einträge zwischen den Geräten eines Kontos (wie bei Janas Seite, aber je Konto ein eigenes Fach).
// Ein Gerät darf nur speichern, wenn es den aktuellen Stand kennt (baseRev = rev), sonst 409 mit dem neuen Stand.
import type { Config, Context } from "@netlify/functions";
import { datas, currentUser, json, readJson } from "../lib/auth.mts";

export default async (req: Request, context: Context) => {
  try {
    const u = await currentUser(context);
    if (!u) return json({ error: "Nicht angemeldet" }, 401);
    const store = datas();
    const current = async () => {
      const entry = await store.getWithMetadata(u, { type: "json", consistency: "strong" });
      if (entry === null) return { rev: 0, at: 0, state: null, etag: null as string | null };
      const m = (entry.metadata ?? {}) as { rev?: number; at?: number };
      return { rev: m.rev ?? 0, at: m.at ?? 0, state: entry.data, etag: entry.etag ?? null };
    };
    if (req.method === "GET") { const c = await current(); return json({ rev: c.rev, at: c.at, state: c.state }); }
    if (req.method === "PUT") {
      const body = await readJson(req);
      const st = body.state;
      if (!st || typeof st !== "object" || !Array.isArray(st.tags) || typeof st.weeks !== "object") return json({ error: "Ungültige Daten" }, 400);
      const c = await current();
      if (body.baseRev !== c.rev) return json({ conflict: true, rev: c.rev, at: c.at, state: c.state }, 409);
      const rev = c.rev + 1, at = Date.now();
      const res = await store.setJSON(u, st, { metadata: { rev, at }, ...(c.etag ? { onlyIfMatch: c.etag } : { onlyIfNew: true }) });
      if (!res.modified) { const n = await current(); return json({ conflict: true, rev: n.rev, at: n.at, state: n.state }, 409); }
      return json({ rev, at });
    }
    return json({ error: "Methode nicht erlaubt" }, 405);
  } catch (e: any) {
    if (e?.status) return json({ error: e.message }, e.status);
    console.error("Abgleich-Fehler", e);
    return json({ error: "Speicher gerade nicht erreichbar" }, 503);
  }
};

export const config: Config = { path: "/api/data" };
