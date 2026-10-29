#!/usr/bin/env node
const base = 'http://localhost:3002';
const url = '/products/stomach%20phakki-03.png';
for (const attempt of ['encodeURI', 'raw', 'repeat']) {
  const full = attempt === 'raw' ? base + url : base + url;
  const r = await fetch(full);
  console.log(attempt, r.status, full);
}
// also with & without headers
const r2 = await fetch(base + url, { headers: { Accept: 'image/*' } });
console.log('with accept header', r2.status);
const body = await (await fetch(base + url)).text();
console.log('body type', body.slice(0, 40).replace(/\n/g, ' '));
