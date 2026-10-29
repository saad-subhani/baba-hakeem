const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'babahakeem',
    waitForConnections: true,
    connectionLimit: 2,
  });

  try {
    const [result] = await pool.query(
      "DELETE FROM product_reviews WHERE is_sample=1 AND source_key LIKE 'sample-%'"
    );
    console.log(`Removed ${result.affectedRows} generated sample reviews.`);
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error('Could not remove generated review samples:', error.message);
  process.exitCode = 1;
});
