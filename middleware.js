import { NextResponse } from 'next/server';

// Cheap presence check only — the real signature check happens in the
// route handlers and pages, which run on Node and can use crypto.
export function middleware(request) {
  const token = request.cookies.get('asc_session')?.value;
  if (!token || !token.includes('.')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/hub/:path*'] };
