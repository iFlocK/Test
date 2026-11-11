// Leitet Anfragen von /api/tmdb/* an die TMDB-Schnittstelle weiter.
// Der Schlüssel steht nicht im Code, sondern in der Netlify-Umgebungsvariable TMDB_KEY
// (API-Schlüssel v3 oder Lese-Zugriffstoken v4). Ohne Variable antwortet die Funktion mit 501,
// dann fragt die Seite selbst nach einem Schlüssel.
import type { Config } from "@netlify/edge-functions";

const ALLOWED = /^\/(configuration|genre\/(movie|tv)\/list|movie\/(now_playing|\d+(\/release_dates)?)|discover\/(movie|tv)|tv\/\d+)$/;

export default async (req: Request) => {
  const key = Netlify.env.get("TMDB_KEY");
  const json = { "content-type": "application/json; charset=utf-8" };
  if (!key) return new Response(JSON.stringify({ error: "no-key" }), { status: 501, headers: json });

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/tmdb/, "");
  if (req.method !== "GET" || !ALLOWED.test(path)) {
    return new Response(JSON.stringify({ error: "not-allowed" }), { status: 400, headers: json });
  }

  const target = new URL("https://api.themoviedb.org/3" + path + url.search);
  target.searchParams.delete("api_key");
  const headers: Record<string, string> = { accept: "application/json" };
  if (key.startsWith("eyJ")) headers.authorization = "Bearer " + key;
  else target.searchParams.set("api_key", key);

  const res = await fetch(target, { headers });
  return new Response(res.body, {
    status: res.status,
    headers: { ...json, "cache-control": res.ok ? "public, max-age=1800" : "no-store" },
  });
};

export const config: Config = { path: "/api/tmdb/*" };
