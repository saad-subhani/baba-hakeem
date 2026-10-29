const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'babahakeem' });
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS store_contact_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      whatsapp_number VARCHAR(40) NOT NULL DEFAULT '',
      phone_number VARCHAR(40) NOT NULL DEFAULT '',
      email VARCHAR(254) NOT NULL DEFAULT '',
      address VARCHAR(600) NOT NULL DEFAULT '',
      facebook_url VARCHAR(700) NOT NULL DEFAULT '',
      instagram_url VARCHAR(700) NOT NULL DEFAULT '',
      tiktok_url VARCHAR(700) NOT NULL DEFAULT '',
      youtube_url VARCHAR(700) NOT NULL DEFAULT '',
      updated_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('Store contact settings table is ready.');
  } finally { await pool.end(); }
})().catch((error) => { console.error('Could not migrate store contact settings:', error.message); process.exitCode = 1; });
