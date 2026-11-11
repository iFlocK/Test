// Gemeinsame Bausteine für Konten und Abgleich von „Kino & Serien“ (wie bei „Mein Wochenplaner“).
// Passwörter: PBKDF2-SHA256 (150 000 Runden) mit Zufallswert, nie im Klartext.
// Anmeldung: Cookie mit Benutzer, Ablaufdatum und Kennung des Passworts, signiert mit AUTH_SECRET (Netlify-Umgebungsvariable).
import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export const users = () => getStore({ name: "kino-serien-users", consistency: "strong" });
export const datas = () => getStore({ name: "kino-serien-data", consistency: "strong" });

export const COOKIE = "ks_session";
const MAX_AGE = 60 * 60 * 24 * 365;   // ein Jahr angemeldet bleiben
export const USER_RE = /^[a-z0-9äöüß._-]{3,20}$/;

const enc = new TextEncoder();
const b64 = (buf: ArrayBuffer | Uint8Array) => Buffer.from(buf as ArrayBuffer).toString("base64");

export async function hashPw(pw: string, saltB64: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: Buffer.from(saltB64, "base64"), iterations: 150000, hash: "SHA-256" }, key, 256);
  return b64(bits);
}
export const newSalt = () => b64(crypto.getRandomValues(new Uint8Array(16)));

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
async function sign(msg: string): Promise<string> {
  const secret = Netlify.env.get("AUTH_SECRET");
  if (!secret) throw new Error("AUTH_SECRET fehlt");
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return Buffer.from(await crypto.subtle.sign("HMAC", key, enc.encode(msg))).toString("hex");
}
const tagOf = (hash: string) => hash.slice(0, 10);   // ändert sich mit dem Passwort → alte Anmeldungen werden ungültig

export type UserRec = { salt: string; hash: string; created: number };
export async function getUser(u: string): Promise<UserRec | null> {
  return (await users().get("u/" + u, { type: "json" })) as UserRec | null;
}
export async function sessionCookie(u: string, rec: UserRec): Promise<string> {
  const payload = `${encodeURIComponent(u)}.${Date.now() + MAX_AGE * 1000}.${tagOf(rec.hash)}`;
  return cookie(`${payload}.${await sign(payload)}`, MAX_AGE);
}
export const cookie = (value: string, maxAge: number) => `${COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;

// Wer ist angemeldet? null, wenn kein gültiges Cookie
export async function currentUser(context: Context): Promise<string | null> {
  const raw = context.cookies.get(COOKIE);
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  if (i < 0) return null;
  const payload = raw.slice(0, i), sig = raw.slice(i + 1);
  if (!safeEqual(sig, await sign(payload))) return null;
  const [uEnc, exp, tag] = payload.split(".");
  if (!uEnc || !(+exp > Date.now())) return null;
  const u = decodeURIComponent(uEnc), rec = await getUser(u);
  if (!rec || tagOf(rec.hash) !== tag) return null;
  return u;
}

export function json(data: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra } });
}
export async function readJson(req: Request, max = 4 * 1024 * 1024): Promise<any> {
  const text = await req.text();
  if (text.length > max) throw Object.assign(new Error("zu groß"), { status: 413 });
  try { return JSON.parse(text); } catch { throw Object.assign(new Error("kein JSON"), { status: 400 }); }
}
