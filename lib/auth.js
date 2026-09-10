import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'asc_session';
const SECRET = process.env.SESSION_SECRET || '';
const PASSWORD = process.env.SITE_PASSWORD || '';
export const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30);

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('base64url');
}

export function makeToken() {
  const payload = String(Date.now() + SESSION_DAYS * 864e5);
  return `${payload}.${sign(payload)}`;
}

export function validToken(token) {
  if (!SECRET || !token || !token.includes('.')) return false;
  const i = token.lastIndexOf('.');
  const payload = token.slice(0, i);
  const mac = token.slice(i + 1);
  const expected = sign(payload);
  if (mac.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && Date.now() < exp;
}

export function passwordMatches(given) {
  if (!PASSWORD) return false;
  const a = crypto.createHash('sha256').update(String(given)).digest();
  const b = crypto.createHash('sha256').update(PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

export function isSignedIn() {
  return validToken(cookies().get(COOKIE)?.value);
}
