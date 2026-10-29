const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'babahakeem',
  });

  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS product_reviews (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      product_id VARCHAR(36) NOT NULL,
      reviewer_name VARCHAR(120) NOT NULL,
      rating TINYINT UNSIGNED NOT NULL,
      title VARCHAR(180) NOT NULL,
      body TEXT NOT NULL,
      image_url VARCHAR(500) NULL,
      status ENUM('Published','Pending','Hidden') NOT NULL DEFAULT 'Published',
      is_sample TINYINT(1) NOT NULL DEFAULT 0,
      source_key VARCHAR(96) NULL UNIQUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL,
      INDEX idx_product_reviews_public (product_id, status, created_at, id),
      INDEX idx_product_reviews_admin (status, created_at, id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('Product reviews schema is ready.');
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error('Could not create product_reviews:', error.code || '', error.message || error.syscall || 'Database connection failed.');
  process.exitCode = 1;
});
