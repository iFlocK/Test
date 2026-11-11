// Konten: registrieren, anmelden, abmelden und „wer bin ich“.
import type { Config, Context } from "@netlify/functions";
import { users, USER_RE, hashPw, newSalt, getUser, safeEqual, sessionCookie, cookie, currentUser, json, readJson } from "../lib/auth.mts";

export default async (req: Request, context: Context) => {
  const path = new URL(req.url).pathname;
  try {
    if (path === "/api/me") {
      const u = await currentUser(context);
      return u ? json({ user: u }) : json({ error: "Nicht angemeldet" }, 401);
    }
    if (path === "/api/logout") return json({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    if (req.method !== "POST") return json({ error: "Methode nicht erlaubt" }, 405);

    const body = await readJson(req, 10000);
    const u = String(body.user ?? "").trim().toLowerCase(), pw = String(body.password ?? "");
    if (path === "/api/register") {
      if (!USER_RE.test(u)) return json({ error: "Der Benutzername braucht 3 bis 20 Zeichen (Buchstaben, Zahlen, Punkt, Strich)." }, 400);
      if (pw.length < 6) return json({ error: "Das Passwort braucht mindestens 6 Zeichen." }, 400);
      const salt = newSalt(), rec = { salt, hash: await hashPw(pw, salt), created: Date.now() };
      const res = await users().setJSON("u/" + u, rec, { onlyIfNew: true });
      if (!res.modified) return json({ error: "Diesen Benutzernamen gibt es schon." }, 409);
      return json({ user: u }, 200, { "Set-Cookie": await sessionCookie(u, rec) });
    }
    if (path === "/api/login") {
      const rec = USER_RE.test(u) ? await getUser(u) : null;
      if (!rec || !safeEqual(await hashPw(pw, rec.salt), rec.hash)) return json({ error: "Benutzername oder Passwort stimmt nicht." }, 401);
      return json({ user: u }, 200, { "Set-Cookie": await sessionCookie(u, rec) });
    }
    return json({ error: "Nicht gefunden" }, 404);
  } catch (e: any) {
    if (e?.status) return json({ error: e.message }, e.status);
    console.error("Konten-Fehler", e);
    return json({ error: "Server gerade nicht erreichbar" }, 503);
  }
};

export const config: Config = {
  path: ["/api/register", "/api/login", "/api/logout", "/api/me"],
  // Bremst wiederholtes Passwort-Raten: höchstens 30 Anfragen pro Minute und IP
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
