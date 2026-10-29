const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'babahakeem' });
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS store_bank_details (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      account_title VARCHAR(160) NOT NULL DEFAULT '',
      bank_name VARCHAR(120) NOT NULL DEFAULT '',
      logo_url VARCHAR(700) NOT NULL DEFAULT '',
      iban VARCHAR(80) NOT NULL DEFAULT '',
      account_number VARCHAR(80) NOT NULL DEFAULT '',
      enabled TINYINT(1) NOT NULL DEFAULT 0,
      updated_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    try {
      await pool.query("ALTER TABLE orders ADD COLUMN transaction_id VARCHAR(120) DEFAULT '' AFTER payment_method");
      console.log('orders: added transaction_id');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME' && error.errno !== 1060) throw error;
    }
    await pool.query("INSERT IGNORE INTO store_bank_details (id,enabled) VALUES (1,0)");
    console.log('Bank transfer settings are ready.');
  } finally { await pool.end(); }
})().catch((error) => { console.error('Could not migrate bank transfer settings:', error.message); process.exitCode = 1; });
