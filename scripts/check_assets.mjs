#!/usr/bin/env node
// Loads a page, then checks every asset it references.
const base = process.env.BASE || 'http://localhost:3002';
const path = process.argv[2] || '/admin';
const r = await fetch(base + path);
const html = await r.text();
console.log('page', path, r.status);
const refs = new Set();
for (const m of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)) {
  const u = m[1];
  if (u.startsWith('/_next/static/chunks') || u.startsWith('/_next/static/css') || u.startsWith('/_next/static/development')) refs.add(u);
  else if (!u.startsWith('/_next')) refs.add(u);
}
for (const u of refs) {
  const res = await fetch(base + u, { method: 'GET' }).catch(e => null);
  if (!res) { console.log('FETCH-FAIL', u); continue; }
  if (res.status >= 400) console.log('BROKEN', res.status, u);
}
console.log('checked', refs.size, 'referenced assets');
