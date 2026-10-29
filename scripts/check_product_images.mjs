#!/usr/bin/env node
// Checks every product image URL from the products table against the server.
const base = process.env.BASE || 'http://localhost:3002';
const login = await fetch(base + '/api/local/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'login', email: 'admin@baba-hakeem.com', password: 'admin123' }) });
const cookie = login.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
const r = await fetch(base + '/api/local/query', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
  body: JSON.stringify({ table: 'products', select: 'id,name,image,status' }) });
const { data } = await r.json();
for (const p of data || []) {
  const url = p.image || '';
  if (!url) { console.log('NO IMAGE  ', p.name); continue; }
  if (url.startsWith('http')) { console.log('EXTERNAL  ', p.name, url.slice(0, 80)); continue; }
  const full = base + encodeURI(url).replace(/%2F/g, '/');
  let res = await fetch(full).catch(() => null);
  if (!res || !res.ok) {
    const retry = await fetch(full).catch(() => null);
    console.log('first attempt', res ? res.status : 'ERR', '| retry', retry && retry.status);
    res = retry;
  }
  console.log(res && res.ok ? ('OK        ' + url) : ('BROKEN ' + (res ? res.status : 'ERR') + '  ' + url + '  [' + p.name + ']'));
}
