// Konten: registrieren, anmelden, abmelden, „wer bin ich“ und Kontenverwaltung für den Admin.
import type { Config, Context } from "@netlify/functions";
import { users, datas, USER_RE, ADMIN, hashPw, newSalt, getUser, sessionCookie, cookie, currentUser, json, readJson } from "../lib/auth.mts";

export default async (req: Request, context: Context) => {
  const path = new URL(req.url).pathname;
  try {
    if (path === "/api/me") {
      const u = await currentUser(context);
      return u ? json({ user: u }) : json({ error: "Nicht angemeldet" }, 401);
    }
    if (path === "/api/logout") return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    if (req.method !== "POST") return json({ error: "Methode nicht erlaubt" }, 405);

    if (path === "/api/register" || path === "/api/login") {
      const body = await readJson(req, 10000);
      const u = String(body.user ?? "").trim().toLowerCase(), pw = String(body.password ?? "");
      if (path === "/api/register") {
        if (u === "admin") return json({ error: "Der Benutzername „admin“ ist reserviert." }, 400);
        if (!USER_RE.test(u)) return json({ error: "Der Benutzername braucht 3 bis 20 Zeichen (Buchstaben, Zahlen, Punkt, Strich)." }, 400);
        if (pw.length < 6) return json({ error: "Das Passwort braucht mindestens 6 Zeichen." }, 400);
        const salt = newSalt(), rec = { salt, hash: await hashPw(pw, salt), created: Date.now() };
        const res = await users().setJSON("u/" + u, rec, { onlyIfNew: true });
        if (!res.modified) return json({ error: "Diesen Benutzernamen gibt es schon." }, 409);
        return json({ user: u }, 200, { "Set-Cookie": await sessionCookie(u, rec) });
      }
      const rec = await getUser(u);
      if (!rec) return json({ error: "Benutzername oder Passwort stimmt nicht.", unknown: true }, 404);
      if ((await hashPw(pw, rec.salt)) !== rec.hash) return json({ error: "Benutzername oder Passwort stimmt nicht." }, 401);
      return json({ user: u }, 200, { "Set-Cookie": await sessionCookie(u, rec) });
    }

    // ---------- Kontenverwaltung (nur admin) ----------
    if (path.startsWith("/api/admin/")) {
      if ((await currentUser(context)) !== "admin") return json({ error: "Nur für den Admin" }, 403);
      const body = await readJson(req, 10000).catch(() => ({}));
      if (path === "/api/admin/users") {
        const { blobs } = await users().list({ prefix: "u/" });
        const list = await Promise.all(blobs.map(async ({ key }) => {
          const name = key.slice(2), rec = (await users().get(key, { type: "json" })) as { created?: number } | null;
          const meta = await datas().getMetadata(name);
          const m = (meta?.metadata ?? {}) as { at?: number; rev?: number };
          return { user: name, created: rec?.created ?? 0, lastSync: m.at ?? 0, rev: m.rev ?? 0 };
        }));
        return json({ users: list.sort((a, b) => a.user.localeCompare(b.user)) });
      }
      const u = String(body.user ?? "").trim().toLowerCase();
      if (!USER_RE.test(u) || u === "admin") return json({ error: "Unbekanntes Konto" }, 400);
      if (path === "/api/admin/reset") {
        const pw = String(body.password ?? "");
        if (pw.length < 6) return json({ error: "Das neue Passwort braucht mindestens 6 Zeichen." }, 400);
        const rec = (await users().get("u/" + u, { type: "json" })) as { created?: number } | null;
        if (!rec) return json({ error: "Unbekanntes Konto" }, 404);
        const salt = newSalt();
        await users().setJSON("u/" + u, { ...rec, salt, hash: await hashPw(pw, salt) });   // alte Anmeldungen werden dadurch ungültig
        return json({ ok: true });
      }
      if (path === "/api/admin/delete") {
        await users().delete("u/" + u);
        await datas().delete(u);
        return json({ ok: true });
      }
    }
    return json({ error: "Nicht gefunden" }, 404);
  } catch (e: any) {
    if (e?.status) return json({ error: e.message }, e.status);
    console.error("Konten-Fehler", e);
    return json({ error: "Server gerade nicht erreichbar" }, 503);
  }
};

export const config: Config = {
  path: ["/api/register", "/api/login", "/api/logout", "/api/me", "/api/admin/*"],
  // Bremst wiederholtes Passwort-Raten: höchstens 30 Anfragen pro Minute und IP
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
