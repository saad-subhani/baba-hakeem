const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'babahakeem' });
  try {
    try {
      await pool.query('ALTER TABLE products ADD COLUMN faqs JSON NULL');
      console.log('Added product FAQ data column.');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME' && error.errno !== 1060) throw error;
      console.log('Product FAQ data column already exists.');
    }
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error('Could not migrate product FAQs:', error.message);
  process.exitCode = 1;
});
