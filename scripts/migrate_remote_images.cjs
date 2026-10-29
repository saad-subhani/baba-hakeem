// Migrates remote (supabase) product images into public/products and updates the DB.
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  const p = await mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'babahakeem' });
  const [rows] = await p.query("SELECT id,name,image FROM products WHERE image LIKE 'http%'");
  for (const row of rows) {
    const url = row.image;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) { console.log('FAILED', res.status, url); continue; }
      const ext = path.extname(new URL(url).pathname).replace(/[^a-z0-9.]/gi, '') || '.png';
      const safeName = String(row.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + ext;
      const dest = path.join(process.cwd(), 'public', 'products', 'hair-oil-migrated' + ext);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      const localPath = '/products/hair-oil-migrated' + ext;
      await p.query('UPDATE products SET image=? WHERE id=?', [localPath, row.id]);
      console.log('MIGRATED', row.name, '->', localPath, '(' + Math.round(buffer.length / 1024) + ' KB)');
    } catch (e) {
      console.log('ERROR', row.name, e.message);
    }
  }
  await p.end();
})().catch(e => console.error(e.message));
