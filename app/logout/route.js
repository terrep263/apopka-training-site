import { NextResponse } from 'next/server';
import { COOKIE } from '@/lib/auth';

export async function GET(request) {
  const h = request.headers;
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = (h.get('x-forwarded-proto') || 'http').split(',')[0].trim();
  const origin = host ? `${proto}://${host}` : new URL(request.url).origin;

  const res = NextResponse.redirect(new URL('/', origin));
  res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
