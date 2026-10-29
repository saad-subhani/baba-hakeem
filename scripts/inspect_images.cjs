const mysql = require('mysql2/promise');
(async () => {
  const p = await mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'babahakeem' });
  const [rows] = await p.query("SELECT id,name,image,HEX(image) AS heximage FROM products WHERE image LIKE '%stomach%' OR image LIKE '%supabase%'");
  for (const r of rows) {
    console.log(r.name, '|', JSON.stringify(r.image), '| hex:', String(r.heximage).slice(0, 80));
  }
  const [all] = await p.query('SELECT name,image FROM products');
  console.log(JSON.stringify(all, null, 1));
  await p.end();
})().catch(e => console.error(e.message));
