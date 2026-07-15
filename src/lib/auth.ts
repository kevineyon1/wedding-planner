import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";

export const COOKIE_NAME = "wp_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 hari

function getSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) throw new Error("AUTH_SESSION_SECRET belum di-set di .env");
  return secret;
}

/** Buat hash "salt:hash" dari password (dipakai sekali saat setup akun). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const suppliedBuffer = scryptSync(password, salt, 64);
  if (hashBuffer.length !== suppliedBuffer.length) return false;
  return timingSafeEqual(hashBuffer, suppliedBuffer);
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.AUTH_USERNAME;
  const expectedHash = process.env.AUTH_PASSWORD_HASH;
  if (!expectedUsername || !expectedHash) return false;
  if (username !== expectedUsername) return false;
  return verifyPassword(password, expectedHash);
}

/** Token session yang ditandatangani (HMAC), bukan sekadar cookie polos. */
export function createSessionToken(username: string): string {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${username}.${exp}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [username, expStr, sig] = parts;
  const payload = `${username}.${expStr}`;
  const expectedSig = createHmac("sha256", getSecret()).update(payload).digest("hex");

  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expectedSig);
  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  const exp = Number(expStr);
  if (Number.isNaN(exp) || Date.now() > exp) return false;
  return true;
}
