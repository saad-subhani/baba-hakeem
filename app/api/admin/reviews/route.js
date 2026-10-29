import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { currentAdmin } from '../../../../lib/store';
import pool from '../../../../lib/mysql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const reply = (data, status = 200) => NextResponse.json(data, {
  status,
  headers: { 'Cache-Control': 'private, no-store' },
});

async function authorized() {
  try { return !!(await currentAdmin()); } catch { return false; }
}

export async function GET(request) {
  if (!await authorized()) return reply({ error: 'Admin sign-in required.' }, 401);
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
  const pageSize = Math.min(50, Math.max(1, Number.parseInt(params.get('pageSize') || '20', 10) || 20));
  const productId = String(params.get('productId') || 'all').slice(0, 36);
  const status = String(params.get('status') || 'all');
  const search = String(params.get('search') || '').trim().slice(0, 100);
  const where = [];
  const values = [];
  if (productId !== 'all') { where.push('r.product_id=?'); values.push(productId); }
  if (['Published', 'Pending', 'Hidden'].includes(status)) { where.push('r.status=?'); values.push(status); }
  if (search) {
    where.push('(LOCATE(LOWER(?),LOWER(r.reviewer_name))>0 OR LOCATE(LOWER(?),LOWER(r.title))>0 OR LOCATE(LOWER(?),LOWER(r.body))>0 OR LOCATE(LOWER(?),LOWER(p.name))>0)');
    values.push(search, search, search, search);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM product_reviews r JOIN products p ON p.id=r.product_id ${clause}`,
      values
    );
    const [items] = await pool.query(
      `SELECT r.id,r.product_id,p.name AS product_name,r.reviewer_name,r.rating,r.title,r.body,
        r.image_url,r.status,r.is_sample,r.created_at
       FROM product_reviews r JOIN products p ON p.id=r.product_id ${clause}
       ORDER BY r.created_at DESC,r.id DESC LIMIT ? OFFSET ?`,
      [...values, pageSize, (page - 1) * pageSize]
    );
    const [products] = await pool.query('SELECT id,name FROM products ORDER BY name ASC');
    return reply({ items, products, total: Number(total), page, pageSize, totalPages: Math.ceil(Number(total) / pageSize) });
  } catch (error) {
    console.error('Admin reviews query failed:', error.message);
    return reply({ error: 'Could not load review records. Run the product reviews migration first.' }, 503);
  }
}

export async function POST(request) {
  if (!await authorized()) return reply({ error: 'Admin sign-in required.' }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request.' }, 400); }

  const productId = String(body.product_id || '').slice(0, 36);
  const reviewerName = String(body.reviewer_name || '').trim().slice(0, 120);
  const title = String(body.title || '').trim().slice(0, 180);
  const text = String(body.body || '').trim().slice(0, 3000);
  const rating = Number(body.rating);
  const imageUrl = body.image_url ? String(body.image_url).slice(0, 500) : null;
  const status = ['Published', 'Pending', 'Hidden'].includes(body.status) ? body.status : 'Published';
  const isSample = body.is_sample === true;

  if (!productId || !reviewerName || !title || !text || !Number.isInteger(rating) || rating < 1 || rating > 5)
    return reply({ error: 'Add a product, reviewer, title, comment, and rating from 1 to 5.' }, 400);
  if (imageUrl && !/^\/uploads\/[a-zA-Z0-9._-]+$/.test(imageUrl))
    return reply({ error: 'Review photos must be uploaded through the admin image uploader.' }, 400);

  try {
    const [[product]] = await pool.query('SELECT id FROM products WHERE id=? LIMIT 1', [productId]);
    if (!product) return reply({ error: 'Product not found.' }, 404);
    const id = crypto.randomUUID();
    await pool.query(
      `INSERT INTO product_reviews (id,product_id,reviewer_name,rating,title,body,image_url,status,is_sample,created_at)
       VALUES (?,?,?,?,?,?,?,?,?,NOW())`,
      [id, product.id, reviewerName, rating, title, text, imageUrl, status, isSample ? 1 : 0]
    );
    return reply({ id }, 201);
  } catch (error) {
    console.error('Admin review insert failed:', error.message);
    return reply({ error: 'Could not save this review.' }, 503);
  }
}
