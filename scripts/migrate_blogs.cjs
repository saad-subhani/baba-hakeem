const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'babahakeem' });
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS blogs (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(240) NOT NULL,
      slug VARCHAR(260) NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'Wellness',
      excerpt VARCHAR(500) NOT NULL DEFAULT '',
      content MEDIUMTEXT NOT NULL,
      featured_image VARCHAR(700) NOT NULL DEFAULT '',
      meta_title VARCHAR(200) NOT NULL DEFAULT '',
      meta_description VARCHAR(320) NOT NULL DEFAULT '',
      status ENUM('Draft','Published') NOT NULL DEFAULT 'Draft',
      published_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NULL,
      UNIQUE KEY uniq_blog_slug (slug),
      KEY idx_blog_public (status,published_at,created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    console.log('Blog table is ready.');
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error('Could not migrate blogs:', error.message);
  process.exitCode = 1;
});
