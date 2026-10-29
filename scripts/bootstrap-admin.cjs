const crypto = require('node:crypto');
const mysql = require('mysql2/promise');

async function main() {
  const initialEmail = String(process.env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
  const initialPassword = String(process.env.INITIAL_ADMIN_PASSWORD || '');
  const production = process.env.NODE_ENV === 'production' || Boolean(process.env.PORT);

  const sessionSecret = String(process.env.ADMIN_SESSION_SECRET || '');
  if (production && (sessionSecret.length < 32 || /replace-with|change-me|example/i.test(sessionSecret) || sessionSecret === 'baba-hakeem-local-session-secret')) {
    throw new Error('Set a unique ADMIN_SESSION_SECRET in the hosting environment.');
  }
  if (production && (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME)) {
    throw new Error('Set DB_USER, DB_PASSWORD, and DB_NAME in the hosting environment.');
  }
  if (!initialEmail && !initialPassword) return;
  if (!initialEmail || initialPassword.length < 12) {
    throw new Error('For first deployment, set INITIAL_ADMIN_EMAIL and an INITIAL_ADMIN_PASSWORD of at least 12 characters.');
  }

  const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'babahakeem',
    charset: 'utf8mb4',
    connectionLimit: 1,
  });
  try {
    const [[row]] = await db.query('SELECT COUNT(*) AS total FROM admins');
    if (Number(row.total) > 0) {
      console.log('Admin bootstrap skipped: an admin account already exists.');
      return;
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(initialPassword, salt, 64).toString('hex');
    await db.query('INSERT INTO admins (email,password,created_at) VALUES (?,?,NOW())', [initialEmail, `scrypt$${salt}$${hash}`]);
    console.log('Initial admin account created. Remove INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD from hosting variables now.');
  } finally {
    await db.end();
  }
}

main().catch((error) => {
  console.error('Hostinger startup setup failed:', error.code || error.message);
  process.exit(1);
});
