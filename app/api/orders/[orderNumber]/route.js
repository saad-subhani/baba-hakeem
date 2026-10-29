import { NextResponse } from 'next/server';
import pool from '../../../../lib/mysql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const phoneDigits = (value) => String(value || '').replace(/\D/g, '');

export async function POST(request, { params }) {
  const orderNumber = String(params?.orderNumber || '').slice(0, 50);
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Order number and checkout phone are required.' }, 400); }
  const phone = phoneDigits(body?.phone);
  if (!orderNumber || phone.length < 7) return reply({ error: 'Order number and checkout phone are required.' }, 400);
  try {
    const [[order]] = await pool.query(`SELECT id,order_number,product_id,product_name,unit_price,quantity,customer_name,phone,customer_email,city,address,notes,status,created_at,total_amount,payment_method,transaction_id
      FROM orders WHERE order_number=? LIMIT 1`, [orderNumber]);
    if (!order || phoneDigits(order.phone) !== phone) return reply({ error: 'Order details could not be verified.' }, 404);
    const [items] = await pool.query(`SELECT i.product_id,i.product_name AS name,i.unit_price,i.quantity,i.line_total,p.image
      FROM order_items i LEFT JOIN products p ON p.id=i.product_id WHERE i.order_id=? ORDER BY i.product_name`, [order.id]);
    const lines = items.length ? items : [{ product_id: order.product_id, name: order.product_name, unit_price: order.unit_price, quantity: order.quantity, line_total: order.total_amount, image: '' }];
    return reply({ order: { order_number: order.order_number, customer_name: order.customer_name, phone: order.phone, customer_email: order.customer_email, city: order.city, address: order.address, notes: order.notes, status: order.status, created_at: order.created_at, total_amount: Number(order.total_amount || 0), payment_method: order.payment_method || 'Cash on Delivery', transaction_id: order.transaction_id || '', items: lines.map((item) => ({ ...item, unit_price: Number(item.unit_price || 0), quantity: Number(item.quantity || 0), line_total: Number(item.line_total || 0) })) } });
  } catch (error) {
    console.error('Order confirmation lookup failed:', error.message);
    return reply({ error: 'Order details are temporarily unavailable.' }, 503);
  }
}
