'use strict';

/**
 * Apopka Seniors for Good Governance — training site server.
 *
 * Serves a real login page (not a browser Basic Auth popup), checks a shared
 * password, and sets a signed session cookie. No dependencies — Node built-ins
 * only, so there is nothing to keep patched.
 *
 * Environment variables:
 *   SITE_PASSWORD    the shared password volunteers type in     (required)
 *   SESSION_SECRET   random string used to sign the cookie      (required)
 *   SESSION_DAYS     how long a login lasts, default 30
 *   PORT             default 3000
 */

const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const PASSWORD = process.env.SITE_PASSWORD || '';
const SECRET = process.env.SESSION_SECRET || '';
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30);
const SITE_DIR = path.join(__dirname, 'site');

if (!PASSWORD || !SECRET) {
  console.error('SITE_PASSWORD and SESSION_SECRET must both be set. Refusing to start.');
  process.exit(1);
}

/* ---------- session cookie ---------- */

function sign(value) {
  return crypto.createHmac('sha256', SECRET).update(value).digest('base64url');
}

function makeToken() {
  const expires = Date.now() + SESSION_DAYS * 864e5;
  const payload = String(expires);
  return `${payload}.${sign(payload)}`;
}

function validToken(token) {
  if (!token || !token.includes('.')) return false;
  const idx = token.lastIndexOf('.');
  const payload = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = sign(payload);
  if (mac.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  const expires = Number(payload);
  return Number.isFinite(expires) && Date.now() < expires;
}

function readCookie(req, name) {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function isSecure(req) {
  return (req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https';
}

/* ---------- password check ---------- */

function passwordMatches(given) {
  const a = Buffer.from(String(given));
  const b = Buffer.from(PASSWORD);
  // Hash both first so timingSafeEqual never sees mismatched lengths.
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/* ---------- throttling ---------- */

const attempts = new Map(); // ip -> { count, until }
const MAX_ATTEMPTS = 8;
const LOCKOUT_MS = 10 * 60 * 1000;

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function lockedOut(ip) {
  const rec = attempts.get(ip);
  if (!rec) return false;
  if (Date.now() > rec.until) { attempts.delete(ip); return false; }
  return rec.count >= MAX_ATTEMPTS;
}

function noteFailure(ip) {
  const rec = attempts.get(ip) || { count: 0, until: 0 };
  rec.count += 1;
  rec.until = Date.now() + LOCKOUT_MS;
  attempts.set(ip, rec);
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of attempts) if (now > rec.until) attempts.delete(ip);
}, 5 * 60 * 1000).unref();

/* ---------- login page ---------- */

function loginPage({ error = '', next = '/' } = {}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in — Apopka Seniors for Good Governance</title>
<style>
:root{
  --bg:#eff2ed; --surface:#fff; --ink:#16221c; --muted:#55655c;
  --green:#2f5d45; --green-dark:#21422f; --green-soft:#e2ece5;
  --brass:#8a6a1f; --alert:#8c3a2b; --alert-soft:#fbeae6;
  --rule:#d2dacd; --r:4px;
}
*{box-sizing:border-box}
body{
  margin:0;min-height:100vh;display:grid;place-items:center;padding:2rem 1.25rem;
  background:var(--bg);color:var(--ink);
  font-family:"Seravek","Gill Sans Nova",Ubuntu,Calibri,"DejaVu Sans",source-sans-pro,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-size:1.125rem;line-height:1.6;-webkit-font-smoothing:antialiased;
}
.box{
  width:100%;max-width:30rem;background:var(--surface);
  border:1px solid var(--rule);border-top:6px solid var(--green);
  border-radius:var(--r);padding:2.25rem 2rem;
}
h1{font-size:1.75rem;line-height:1.2;letter-spacing:-.02em;font-weight:600;margin:0 0 .4rem}
.sub{color:var(--muted);margin:0 0 1.75rem}
label{display:block;font-weight:600;margin-bottom:.4rem}
input[type=password],input[type=text]#password{
  width:100%;font:inherit;padding:.8rem .9rem;min-height:52px;
  border:2px solid var(--rule);border-radius:var(--r);background:#fff;color:var(--ink);
}
#password:focus{border-color:var(--green);outline:3px solid var(--brass);outline-offset:2px}
button{
  width:100%;margin-top:1.25rem;font:inherit;font-weight:600;
  background:var(--green);color:#fff;border:1px solid var(--green);
  border-radius:var(--r);padding:.85rem 1.4rem;min-height:52px;cursor:pointer;
}
button:hover{background:var(--green-dark)}
button:focus-visible{outline:3px solid var(--brass);outline-offset:2px}
.err{
  background:var(--alert-soft);border-left:5px solid var(--alert);
  border-radius:var(--r);padding:.9rem 1.1rem;margin:0 0 1.4rem;
}
.note{margin:1.75rem 0 0;color:var(--muted);font-size:1rem}
.show{display:flex;align-items:center;gap:.5rem;margin-top:.75rem;font-size:1rem;color:var(--muted)}
.show input{width:1.15rem;height:1.15rem}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<main class="box">
  <h1>Apopka Seniors for Good Governance</h1>
  <p class="sub">Volunteer training. Enter the group password to continue.</p>

  ${error ? `<div class="err" role="alert">${error}</div>` : ''}

  <form method="POST" action="/login">
    <input type="hidden" name="next" value="${next.replace(/"/g, '&quot;')}">
    <label for="password">Password</label>
    <input type="password" id="password" name="password" autocomplete="current-password" autofocus required>
    <div class="show">
      <input type="checkbox" id="show" onchange="document.getElementById('password').type = this.checked ? 'text' : 'password'">
      <label for="show" style="font-weight:400;margin:0">Show password</label>
    </div>
    <button type="submit">Sign in</button>
  </form>

  <p class="note">Your Team Lead has the password. It is the same one for everyone in the group.</p>
</main>
</body>
</html>`;
}

/* ---------- static files ---------- */

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel.endsWith('/')) rel += 'index.html';
  const full = path.normalize(path.join(SITE_DIR, rel));

  if (!full.startsWith(SITE_DIR)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<p style="font:1.1rem system-ui;padding:2rem">Page not found. <a href="/">Back to the training hub</a>.</p>');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
    });
    res.end(data);
  });
}

/* ---------- request handling ---------- */

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e4) { req.destroy(); resolve(''); }
    });
    req.on('end', () => resolve(raw));
  });
}

function safeNext(value) {
  // Only allow same-site paths — never an absolute URL.
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  if (p === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('ok');
    return;
  }

  if (p === '/logout') {
    res.writeHead(302, {
      'Set-Cookie': 'asgg_session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax',
      Location: '/login',
    }).end();
    return;
  }

  if (p === '/login' && req.method === 'GET') {
    if (validToken(readCookie(req, 'asgg_session'))) {
      res.writeHead(302, { Location: '/' }).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(loginPage({ next: safeNext(url.searchParams.get('next')) }));
    return;
  }

  if (p === '/login' && req.method === 'POST') {
    const ip = clientIp(req);

    if (lockedOut(ip)) {
      res.writeHead(429, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(loginPage({ error: 'Too many attempts. Wait ten minutes and try again.' }));
      return;
    }

    const body = new URLSearchParams(await readBody(req));
    const next = safeNext(body.get('next'));

    if (passwordMatches(body.get('password') || '')) {
      attempts.delete(ip);
      const cookie = [
        `asgg_session=${makeToken()}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${SESSION_DAYS * 86400}`,
        isSecure(req) ? 'Secure' : '',
      ].filter(Boolean).join('; ');
      res.writeHead(302, { 'Set-Cookie': cookie, Location: next }).end();
      return;
    }

    noteFailure(ip);
    res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(loginPage({ error: 'That password is not right. Check with your Team Lead.', next }));
    return;
  }

  if (!validToken(readCookie(req, 'asgg_session'))) {
    const dest = p === '/' ? '/login' : `/login?next=${encodeURIComponent(p)}`;
    res.writeHead(302, { Location: dest }).end();
    return;
  }

  serveStatic(req, res, p);
});

server.listen(PORT, () => {
  console.log(`Training site listening on ${PORT}`);
});
