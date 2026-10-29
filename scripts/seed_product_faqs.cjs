const mysql = require('mysql2/promise');

const common = (name) => [
  { question: `How should I use ${name}?`, answer: 'Follow the directions printed on the product packaging. If the label gives a specific amount or routine, use that guidance and do not exceed it.' },
  { question: 'How often should I use it?', answer: 'Use it only as directed on the package. If you are unsure whether it is suitable for your routine, ask a qualified healthcare professional before use.' },
  { question: 'Can I use it if I have sensitive skin or a health condition?', answer: 'Check the complete ingredient list first. For topical products, test a small area of skin before regular use. If you have a health condition, take medication, are pregnant, or are breastfeeding, consult a qualified healthcare professional.' },
  { question: 'How should I store this product?', answer: 'Keep the container closed and store it in a cool, dry place away from direct sunlight. Keep it out of reach of children.' },
];

const productFaqs = (name) => {
  const lower = String(name || '').toLowerCase();
  if (/phakki|powder|digest|stomach/.test(lower)) return [
    { question: `How do I take ${name}?`, answer: 'Follow the serving size and directions on the package. Measure the stated amount and take it only as directed; do not exceed the recommended serving.' },
    { question: 'Can I mix it with water?', answer: 'Use the drink or method specified on the product label. If no mixing instructions are provided, check with the seller or a qualified healthcare professional before use.' },
    ...common(name).slice(1),
  ];
  if (/hair|serum|face|skin/.test(lower)) return [
    { question: `How should I apply ${name}?`, answer: 'Apply it only as described on the label. For a new topical product, test a small area first and stop using it if irritation occurs.' },
    { question: 'How often should I apply it?', answer: 'Follow the frequency stated on the product packaging. Using more than directed is not recommended.' },
    ...common(name).slice(2),
  ];
  if (/oil|joint|massage|vitality/.test(lower)) return [
    { question: `How do I use ${name}?`, answer: 'For external-use products, apply only as directed on the label and avoid contact with eyes, broken skin, and sensitive areas. Wash hands after application.' },
    { question: 'Can I use it every day?', answer: 'Use it at the frequency listed on the product packaging. If discomfort or irritation occurs, discontinue use and seek professional advice.' },
    ...common(name).slice(2),
  ];
  return common(name);
};

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'babahakeem' });
  try {
    const [products] = await pool.query('SELECT id,name,faqs FROM products');
    let updated = 0;
    for (const product of products) {
      let current = product.faqs;
      if (typeof current === 'string') { try { current = JSON.parse(current); } catch { current = null; } }
      if (Array.isArray(current) && current.length) continue;
      await pool.query('UPDATE products SET faqs=? WHERE id=?', [JSON.stringify(productFaqs(product.name)), product.id]);
      updated += 1;
    }
    console.log(`Seeded product-specific starter FAQs for ${updated} products.`);
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error('Could not seed product FAQs:', error.message);
  process.exitCode = 1;
});
