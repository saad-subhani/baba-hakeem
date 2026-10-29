const crypto = require('crypto');
const mysql = require('mysql2/promise');

const PRODUCTS = [
  { id: 'e978fe07-f215-415b-a49d-02af598e3ff0', slug: 'hair-oil-e978fe07', name: 'Herbal Hair Oil',
    titles: ['A hair care routine', 'Oil application', 'About the texture', 'Following the label'],
    copy: [
      'Sample placeholder about applying Herbal Hair Oil to the scalp and following the product label. Replace with real customer feedback.',
      'Sample placeholder about the oil texture and hair care routine. This is example content, not a customer statement.',
      'Sample placeholder for a note about using the oil as directed. Replace this with an approved customer review.',
    ] },
  { id: 'f188e5c3-46ea-4347-9ba1-56ee336f9e6f', slug: 'joint-oil-f188e5c3', name: 'Joint Oil',
    titles: ['External massage routine', 'Applying the oil', 'About the massage oil', 'Following the directions'],
    copy: [
      'Sample placeholder about external application and gentle massage with Joint Oil. Replace with real customer feedback.',
      'Sample placeholder for a note about the oil and its label directions. This is example content, not a customer statement.',
      'Sample placeholder about including Joint Oil in an external massage routine. Replace this with an approved customer review.',
    ] },
  { id: '79456908-92d0-42e3-8ef7-55e73d2c05ab', slug: 'men-s-oil-79456908', name: "Men's Oil",
    titles: ['A personal care routine', 'External application', 'About the product', 'Using it as directed'],
    copy: [
      "Sample placeholder about external application of Men's Oil as directed on its label. Replace with real customer feedback.",
      "Sample placeholder for a note about the oil's texture and personal care routine. This is example content, not a customer statement.",
      "Sample placeholder about reading the directions before using Men's Oil. Replace this with an approved customer review.",
    ] },
  { id: '8c2b96f2-3d8c-4aaf-b77c-7f4679ac0e81', slug: 'herbal-phakki-8c2b96f2', name: 'Herbal Phakki',
    titles: ['Taking it as directed', 'A simple daily ritual', 'Mixing with a drink', 'About the instructions'],
    copy: [
      'Sample placeholder about taking Herbal Phakki with water or green tea as directed. Replace with real customer feedback.',
      'Sample placeholder for a note about the serving directions and daily routine. This is example content, not a customer statement.',
      'Sample placeholder about checking the Herbal Phakki label before use. Replace this with an approved customer review.',
    ] },
  { id: 'e0778723-8235-45b0-b5af-317ff7273941', slug: 'wedding-course-e0778723', name: 'Wedding Course',
    titles: ['Using the included guide', 'Following the booklet', 'About the instructions', 'A guided routine'],
    copy: [
      'Sample placeholder about following the instructions included with Wedding Course. Replace with real customer feedback.',
      'Sample placeholder for a note about checking the booklet and serving directions. This is example content, not a customer statement.',
      'Sample placeholder about using each item according to its included guidance. Replace this with an approved customer review.',
    ] },
];

const FIRST_NAMES = [
  'Ayesha', 'Fatima', 'Maryam', 'Zainab', 'Hira', 'Sana', 'Iqra', 'Maham', 'Amna', 'Noor',
  'Hafsa', 'Mariam', 'Laiba', 'Sadia', 'Mehwish', 'Sidra', 'Eman', 'Anum', 'Rabia', 'Komal',
  'Muhammad', 'Ahmed', 'Ali', 'Hassan', 'Usman', 'Bilal', 'Hamza', 'Abdullah', 'Saad', 'Omar',
  'Tariq', 'Imran', 'Fahad', 'Salman', 'Farhan', 'Adeel', 'Danish', 'Zeeshan', 'Adnan', 'Asad',
];
const LAST_NAMES = [
  'Khan', 'Ahmed', 'Malik', 'Sheikh', 'Raza', 'Iqbal', 'Hussain', 'Ali', 'Siddiqui', 'Butt',
  'Chaudhry', 'Shah', 'Qureshi', 'Javed', 'Farooq', 'Akhtar', 'Mirza', 'Abbasi', 'Rashid', 'Nawaz',
];

function hashSeed(value) {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function randomFor(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function makeUniqueNames(seed) {
  const names = FIRST_NAMES.flatMap((first) => LAST_NAMES.map((last) => `${first} ${last}`));
  const random = randomFor(seed);
  for (let index = names.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [names[index], names[swapIndex]] = [names[swapIndex], names[index]];
  }
  return names;
}

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'babahakeem',
    connectionLimit: 3,
  });

  try {
    for (const config of PRODUCTS) {
      const [[product]] = await pool.query(
        'SELECT id,name FROM products WHERE id=? OR slug=? LIMIT 1', [config.id, config.slug]
      );
      if (!product) {
        console.warn(`Skipped ${config.name}: product is not in this database.`);
        continue;
      }

      const random = randomFor(hashSeed(config.slug));
      const count = 60 + Math.floor(random() * 11);
      const names = makeUniqueNames(hashSeed(`${config.slug}:names`));
      const start = Date.UTC(2023, 0, 1);
      const end = Date.now();
      let inserted = 0;

      for (let index = 1; index <= count; index += 1) {
        const rowRandom = randomFor(hashSeed(`${config.slug}:${index}`));
        const reviewer = names[index - 1];
        const rating = [5, 4, 5, 3, 5, 4, 5][Math.floor(rowRandom() * 7)];
        const title = config.titles[Math.floor(rowRandom() * config.titles.length)];
        const body = config.copy[Math.floor(rowRandom() * config.copy.length)];
        const createdAt = new Date(start + Math.floor(rowRandom() * (end - start)));
        const sourceKey = `sample-${config.slug}-${String(index).padStart(2, '0')}`;
        const [result] = await pool.query(
          `INSERT INTO product_reviews
            (id,product_id,reviewer_name,rating,title,body,status,is_sample,source_key,created_at)
           VALUES (?,?,?,?,?,?,'Published',1,?,?)
           ON DUPLICATE KEY UPDATE reviewer_name=VALUES(reviewer_name),rating=VALUES(rating),
             title=VALUES(title),body=VALUES(body),created_at=VALUES(created_at)`,
          [crypto.randomUUID(), product.id, reviewer, rating, title, body, sourceKey, createdAt]
        );
        inserted += result.affectedRows > 0 ? 1 : 0;
      }

      // Remove only surplus generated rows from an earlier seed count; preserve admin-created reviews.
      const lastKey = `sample-${config.slug}-${String(count).padStart(2, '0')}`;
      const [removed] = await pool.query(
        'DELETE FROM product_reviews WHERE product_id=? AND source_key LIKE ? AND source_key>?',
        [product.id, `sample-${config.slug}-%`, lastKey]
      );
      console.log(`${product.name}: ${count} varied sample reviews ready (${inserted} inserted/updated, ${removed.affectedRows} surplus removed).`);
    }
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error('Could not seed product reviews:', error.code || '', error.message || error.syscall || 'Database connection failed.');
  process.exitCode = 1;
});
