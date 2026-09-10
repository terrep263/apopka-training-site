import { NextResponse } from 'next/server';
import { COOKIE, makeToken, passwordMatches, SESSION_DAYS } from '@/lib/auth';

const attempts = new Map();
const MAX = 8;
const LOCK_MS = 10 * 60 * 1000;

function baseUrl(request) {
  const h = request.headers;
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = (h.get('x-forwarded-proto') || 'http').split(',')[0].trim();
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

function ip(request) {
  const fwd = request.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : 'local';
}

function lockedOut(key) {
  const rec = attempts.get(key);
  if (!rec) return false;
  if (Date.now() > rec.until) { attempts.delete(key); return false; }
  return rec.count >= MAX;
}

function fail(key) {
  const rec = attempts.get(key) || { count: 0, until: 0 };
  rec.count += 1;
  rec.until = Date.now() + LOCK_MS;
  attempts.set(key, rec);
}

export async function POST(request) {
  const form = await request.formData();
  const password = String(form.get('password') || '');
  const raw = String(form.get('next') || '/hub');
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/hub';
  const key = ip(request);

  const origin = baseUrl(request);
  const back = (query) => NextResponse.redirect(new URL(query, origin), 303);

  if (lockedOut(key)) return back('/?e=locked');
  if (!password) return back('/?e=empty');

  if (!passwordMatches(password)) {
    fail(key);
    return back('/?e=bad');
  }

  attempts.delete(key);
  const res = NextResponse.redirect(new URL(next, origin), 303);
  res.cookies.set(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  });
  return res;
}
