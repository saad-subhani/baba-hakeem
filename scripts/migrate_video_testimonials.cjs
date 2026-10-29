const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'babahakeem' });
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS video_testimonials (
      id VARCHAR(36) PRIMARY KEY,
      customer_name VARCHAR(160) NOT NULL,
      location VARCHAR(120) NOT NULL DEFAULT '',
      product_name VARCHAR(180) NOT NULL DEFAULT '',
      quote VARCHAR(600) NOT NULL DEFAULT '',
      video_url VARCHAR(700) NOT NULL,
      poster_url VARCHAR(700) NOT NULL DEFAULT '',
      status ENUM('Draft','Published') NOT NULL DEFAULT 'Draft',
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL,
      KEY idx_video_testimonials_public (status,sort_order,created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('Video testimonials table is ready.');
  } finally { await pool.end(); }
})().catch((error) => { console.error('Could not migrate video testimonials:', error.message); process.exitCode = 1; });
