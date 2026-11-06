// Login vor Janas Woche: prüft jede Anfrage auf dem Netlify-Server.
// Zugangsdaten kommen aus den Netlify-Umgebungsvariablen JANA_USER, JANA_PASS und AUTH_SECRET
// (Scope "Functions"), nicht aus dem Code.
import type { Config, Context } from "@netlify/edge-functions";

const COOKIE = "jw_session";
const MAX_AGE = 60 * 60 * 24 * 365; // ein Jahr angemeldet bleiben

const enc = new TextEncoder();

async function sign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function cookieHeader(value: string, maxAge: number): string {
  return `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function redirect(location: string, setCookie?: string): Response {
  const headers = new Headers({ Location: location, "Cache-Control": "no-store" });
  if (setCookie) headers.append("Set-Cookie", setCookie);
  return new Response(null, { status: 303, headers });
}

export default async (req: Request, context: Context) => {
  const user = Netlify.env.get("JANA_USER");
  const pass = Netlify.env.get("JANA_PASS");
  const secret = Netlify.env.get("AUTH_SECRET");
  // Ohne Zugangsdaten bleibt die Seite zu, statt offen zu sein.
  if (!user || !pass || !secret) {
    return new Response("Der Login ist noch nicht eingerichtet.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  const url = new URL(req.url);
  // Ändert sich das Passwort, werden alte Anmeldungen ungültig.
  const token = await sign(secret, `janas-woche:${user}:${pass}`);
  const loggedIn = safeEqual(context.cookies.get(COOKIE) ?? "", token);

  if (url.pathname === "/logout") return redirect("/", cookieHeader("", 0));

  if (url.pathname === "/login") {
    if (req.method === "POST") {
      const form = await req.formData();
      const u = String(form.get("username") ?? "").trim().toLowerCase();
      const p = String(form.get("password") ?? "");
      if (safeEqual(u, user.trim().toLowerCase()) && safeEqual(p, pass)) {
        return redirect("/", cookieHeader(token, MAX_AGE));
      }
      return loginPage(true);
    }
    return loggedIn ? redirect("/") : loginPage(false);
  }

  if (loggedIn) return; // weiter zur eigentlichen Seite
  return loginPage(false);
};

export const config: Config = {
  path: "/*",
  // App-Icon und Manifest bleiben offen, damit "Zum Home-Bildschirm" das Icon findet.
  excludedPath: ["/apple-touch-icon.png", "/icon-192.png", "/icon-512.png", "/favicon.png", "/manifest.webmanifest"],
};

function loginPage(error: boolean): Response {
  const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Janas Woche">
<meta name="theme-color" content="#fdf6fa" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1f1a24" media="(prefers-color-scheme: dark)">
<meta name="robots" content="noindex">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" href="/favicon.png">
<title>Janas Woche</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Nunito:wght@400;700;800&display=swap" rel="stylesheet">
<style>
  :root { --bg: #fdf6fa; --card: #ffffff; --text: #4a3f55; --muted: #85798f; --border: #f0e3ef; --accent: #f2a9c8; --on-accent: #4a2340; --err: #b8557f; --soft: #fbeaf2; color-scheme: light; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #1f1a24; --card: #2a2431; --text: #f3ecf7; --muted: #ab9fb8; --border: #3b3245; --accent: #f0b3cf; --on-accent: #3a2233; --err: #f0b3cf; --soft: #362c3d; color-scheme: dark; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; min-height: 100dvh; display: grid; place-items: center; background: var(--bg); color: var(--text);
    font: 16px/1.5 Nunito, system-ui, sans-serif; padding: max(24px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left)); }
  main { width: 100%; max-width: 360px; background: var(--card); border: 1px solid var(--border); border-radius: 22px; padding: 28px 22px; display: grid; gap: 16px; text-align: center; }
  img { width: 96px; height: 96px; margin: 0 auto; border-radius: 22px; image-rendering: pixelated; }
  h1 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 1.8rem; margin: 0; line-height: 1.1; }
  p { margin: 0; color: var(--muted); }
  form { display: grid; gap: 10px; text-align: left; }
  label { font-size: .85rem; font-weight: 800; color: var(--muted); }
  input { font: inherit; color: var(--text); background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; width: 100%; }
  input:focus-visible, button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  button { font: inherit; font-weight: 800; border: none; border-radius: 999px; padding: 11px 16px; background: var(--accent); color: var(--on-accent); cursor: pointer; margin-top: 6px; }
  .error { background: var(--soft); color: var(--err); border-radius: 12px; padding: 8px 12px; font-weight: 700; font-size: .9rem; }
</style>
</head>
<body>
<main>
  <img src="/apple-touch-icon.png" alt="Pixel-Labrador">
  <h1>Janas Woche</h1>
  <p>Wuff! Schön, dass du da bist. Bitte melde dich an.</p>
  ${error ? '<div class="error" role="alert">Benutzername oder Passwort stimmt nicht. Versuch es noch einmal.</div>' : ""}
  <form method="post" action="/login">
    <label for="username">Benutzername</label>
    <input id="username" name="username" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" required>
    <label for="password">Passwort</label>
    <input id="password" name="password" type="password" autocomplete="current-password" required>
    <button type="submit">Einloggen</button>
  </form>
</main>
</body>
</html>`;
  return new Response(html, {
    status: error ? 401 : 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}
