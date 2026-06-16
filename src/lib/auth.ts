// Cookie-сессия на HMAC через чистые Web API (работает и в edge-middleware, и в node).
// Для одного администратора этого достаточно. Под несколько ролей — заменить на Auth.js.
const enc = new TextEncoder();
const dec = new TextDecoder();

async function getKey() {
  const secret = process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function bytesToB64url(bytes: Uint8Array) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlToBytes(str: string) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function createSessionToken() {
  const payload = bytesToB64url(enc.encode(JSON.stringify({ admin: true, exp: Date.now() + 7 * 864e5 })));
  const sigBuf = await crypto.subtle.sign("HMAC", await getKey(), enc.encode(payload));
  const sig = bytesToB64url(new Uint8Array(sigBuf));
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token?: string) {
  if (!token || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  try {
    const ok = await crypto.subtle.verify("HMAC", await getKey(), b64urlToBytes(sig), enc.encode(payload));
    if (!ok) return false;
    const data = JSON.parse(dec.decode(b64urlToBytes(payload)));
    return data.admin === true && data.exp > Date.now();
  } catch {
    return false;
  }
}

export const SESSION_COOKIE = "lt_session";
