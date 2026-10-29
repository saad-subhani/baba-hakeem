// Manual end-to-end checker for the local MySQL conversion.
import crypto from 'crypto';

const base = process.env.BASE || 'http://localhost:3003';

async function j(url, opts = {}) {
  const r = await fetch(base + url, opts);
  let body = null;
  try { body = await r.json(); } catch {}
  return { status: r.status, body };
}
const cookieOf = (res) => res.headers ? res.headers.getSetCookie() : [];

const pid = 'e978fe07-f215-415b-a49d-02af598e3ff0';

// 1. login ------------------------------------------------------------
const loginRes = await fetch(base + '/api/local/auth', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'login', email: 'admin@baba-hakeem.com', password: 'admin123' })
});
const cookie = loginRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
console.log('login:', loginRes.status, cookie.length > 10 ? 'cookie ✓' : 'NO COOKIE');

// 2. owner status -----------------------------------------------------
const owner = await j('/api/local/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
  body: JSON.stringify({ name: 'admin_owner_status' }) });
console.log('owner:', owner.status, JSON.stringify(owner.body));

// 3. place order ------------------------------------------------------
const order = await j('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: { name: 'Test Buyer', email: 'buyer@test.com', phone: '03001234567', city: 'Lahore', address: '12 Test Street, Gulberg', notes: '' },
    items: [{ id: pid, name: 'Herbal Hair Oil', quantity: 2 }]
  }) });
console.log('order:', order.status, JSON.stringify(order.body));
const orderNumber = order.body?.order_number;

// 4. contact enquiry --------------------------------------------------
const contact = await j('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Test Person', email: 'c@test.com', phone: '', category: 'Product question', reference: '', message: 'Hello this is a test enquiry message long enough.' }) });
console.log('contact:', contact.status, JSON.stringify(contact.body));

// 5. private reads with session ---------------------------------------
for (const table of ['contact_inquiries', 'orders', 'order_items', 'order_email_outbox']) {
  const r = await j('/api/local/query', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ table, select: table === 'order_items' ? 'order_id,product_name,quantity,line_total' : '*', order: { column: 'created_at', ascending: false }, limit: 3 }) });
  console.log(table + ':', r.status, (r.body?.data || []).length, 'rows', r.body?.error?.message || '');
}

// 6. owner-only read blocked without session ---------------------------
const anon = await j('/api/local/query', { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ table: 'orders', select: '*', limit: 1 }) });
console.log('anonymous orders read blocked:', anon.status, anon.body?.error?.message);

// 7. order status transition -------------------------------------------
if (orderNumber) {
  const idRes = await j('/api/local/query', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ table: 'orders', select: 'id', filters: [{ column: 'order_number', value: orderNumber }] }) });
  const orderId = idRes.body?.data?.[0]?.id;
  const st = await j('/api/local/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ name: 'admin_set_order_status', args: { p_order_id: orderId, p_status: 'Confirmed', p_note: null } }) });
  console.log('order status -> Confirmed:', st.status, JSON.stringify(st.body));
  const stock = await j('/api/local/rpc', { method: 'POST', headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ name: 'admin_adjust_stock', args: { p_product_id: pid, p_delta: 1, p_reason: 'test recount' } }) });
  console.log('stock adjust:', stock.status, JSON.stringify(stock.body));
}
