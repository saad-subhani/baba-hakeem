// Smoke-tests the running app pages and reports failures.
const base = process.env.BASE || 'http://localhost:3002';
async function check(path) {
  try {
    const r = await fetch(base + path, { redirect: 'manual' });
    const text = await r.text().catch(() => '');
    const badFlags = ['Internal Server Error', 'error' === r.status, 'Application error'];
    const looksOk = r.status < 500 && !text.includes('Internal Server Error') && !text.includes('Application error:');
    console.log((looksOk ? 'OK  ' : 'FAIL') + ' ' + r.status + '  ' + path + (looksOk ? '' : '  ' + text.slice(0, 200).replace(/\s+/g, ' ')));
    return { status: r.status, text };
  } catch (e) {
    console.log('FAIL ERR ' + path + '  ' + e.message);
    return null;
  }
}
const home = await check('/');
const prod = await check('/products/hair-oil-e978fe07');
await check('/cart');
await check('/checkout');
await check('/contact');
await check('/admin');
await check('/sitemap.xml');
// product API
const api = await check('/api/products');
if (api) {
  console.log('api/products:', api.text.slice(0, 120));
}
