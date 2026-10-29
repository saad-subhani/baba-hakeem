#!/usr/bin/env node
// Dumps class names used by the SSR HTML of a page and checks them against admin.css.
import fs from 'fs';
const base = 'http://localhost:3002';
const page = process.argv[2] || '/admin/categories';
const r = await fetch(base + page);
const html = await r.text();
console.log('status', r.status);
const classes = new Set();
for (const m of html.matchAll(/class(?:Name)?="([^"]+)"/g)) {
  for (const c of m[1].split(/\s+/)) if (c && !c.startsWith('__')) classes.add(c);
}
const css = fs.readFileSync('app/admin/admin.css', 'utf8');
const missing = [...classes].filter(c => !css.includes('.' + c));
console.log('classes used:', classes.size);
console.log('NOT FOUND in admin.css:', missing.join(', ') || '(none)');
// show a snippet of the rendered body for eyeballing
const bodyStart = html.indexOf('<body');
console.log('\n--- body snippet ---');
console.log(html.slice(bodyStart, bodyStart + 1200).replace(/></g, '>\n<'));
