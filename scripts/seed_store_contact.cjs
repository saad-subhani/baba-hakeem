const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'babahakeem' });
  try {
    await pool.query(`INSERT IGNORE INTO store_contact_settings
      (id,whatsapp_number,phone_number,email,address,facebook_url,instagram_url,tiktok_url,youtube_url,updated_at)
      VALUES (1,'+92 323 9992203','+92 323 9992203','care@babahakeem.pk','','','','','',NOW())`);
    console.log('Initial WhatsApp number and support email are seeded. Add social URLs in Admin → Social & Contact.');
  } finally { await pool.end(); }
})().catch((error) => { console.error('Could not seed store contact settings:', error.message); process.exitCode = 1; });
