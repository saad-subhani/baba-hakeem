import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import pool from '../../../lib/mysql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const submitWindows = new Map();
const SUBMIT_WINDOW_MS = 60 * 60 * 1000;
const SUBMIT_LIMIT = 3;

const reply = (payload, status = 200) => NextResponse.json(payload, {
  status,
  headers: { 'Cache-Control': 'public, max-age=0, s-maxage=10, stale-while-revalidate=30' },
});

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const slug = String(params.get('slug') || '').slice(0, 100);
  if (!slug) return reply({ error: 'Product is required.' }, 400);
  const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
  const requestedSize = Number.parseInt(params.get('pageSize') || '5', 10) || 5;
  const pageSize = requestedSize <= 5 ? 5 : 10;
  const sort = ['recent', 'highest', 'lowest'].includes(params.get('sort')) ? params.get('sort') : 'recent';
  const ordering = sort === 'highest' ? 'rating DESC, created_at DESC, id DESC'
    : sort === 'lowest' ? 'rating ASC, created_at DESC, id DESC'
      : 'created_at DESC, id DESC';

  try {
    const [[product]] = await pool.query(
      'SELECT id FROM products WHERE status=? AND (slug=? OR id=?) LIMIT 1', ['Published', slug, slug]
    );
    if (!product) return reply({ items: [], total: 0, average: null, distribution: {}, page, pageSize, totalPages: 0 });

    const [[summary]] = await pool.query(
      `SELECT COUNT(*) AS total, AVG(rating) AS average
       FROM product_reviews WHERE product_id=? AND status='Published' AND is_sample=0`, [product.id]
    );
    const [distributionRows] = await pool.query(
      `SELECT rating, COUNT(*) AS count FROM product_reviews
       WHERE product_id=? AND status='Published' AND is_sample=0 GROUP BY rating`, [product.id]
    );
    const [items] = await pool.query(
      `SELECT id, reviewer_name, rating, title, body, image_url, is_sample, created_at
       FROM product_reviews WHERE product_id=? AND status='Published' AND is_sample=0
       ORDER BY ${ordering} LIMIT ? OFFSET ?`,
      [product.id, pageSize, (page - 1) * pageSize]
    );
    const total = Number(summary.total || 0);
    return reply({
      items,
      total,
      average: summary.average == null ? null : Number(Number(summary.average).toFixed(1)),
      distribution: Object.fromEntries(distributionRows.map((row) => [row.rating, Number(row.count)])),
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Product reviews query failed:', error.message);
    return reply({ error: 'Could not load reviews.' }, 503);
  }
}

function getRateLimitKey(request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

function withinRateLimit(request) {
  const now = Date.now();
  const key = getRateLimitKey(request);
  const entry = submitWindows.get(key);
  if (!entry || now - entry.start >= SUBMIT_WINDOW_MS) {
    submitWindows.set(key, { start: now, count: 1 });
    if (submitWindows.size > 10000) {
      for (const [ip, value] of submitWindows) if (now - value.start >= SUBMIT_WINDOW_MS) submitWindows.delete(ip);
    }
    return true;
  }
  if (entry.count >= SUBMIT_LIMIT) return false;
  entry.count += 1;
  return true;
}

async function saveReviewPhoto(file) {
  if (!file || typeof file === 'string' || !file.size) return null;
  if (file.size > 4 * 1024 * 1024) throw new Error('Please use a review photo smaller than 4 MB.');

  const buffer = Buffer.from(await file.arrayBuffer());
  let ext;
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) ext = 'png';
  else if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) ext = 'jpg';
  else if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') ext = 'webp';
  else throw new Error('Use a valid PNG, JPG, or WEBP review photo.');

  const filename = `${crypto.randomUUID()}.${ext}`;
  const directory = path.join(process.cwd(), 'public', 'uploads', 'reviews');
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), buffer, { flag: 'wx' });
  return `/uploads/reviews/${filename}`;
}

export async function POST(request) {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return NextResponse.json({ error: 'Review submission must come from this store.' }, { status: 403 });
    } catch { return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 }); }
  }
  if (!withinRateLimit(request)) return NextResponse.json({ error: 'You have sent several reviews recently. Please try again later.' }, { status: 429 });

  let form;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: 'Invalid review submission.' }, { status: 400 }); }
  if (String(form.get('website') || '').trim()) return NextResponse.json({ message: 'Thanks for sharing your review.' }, { status: 202 });

  const slug = String(form.get('slug') || '').trim().slice(0, 100);
  const name = String(form.get('name') || '').trim().slice(0, 120);
  const title = String(form.get('title') || '').trim().slice(0, 180);
  const body = String(form.get('body') || '').trim().slice(0, 3000);
  const rating = Number(form.get('rating'));
  if (!slug || !name || !title || !body || !Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: 'Please complete your name, rating, title, and review.' }, { status: 400 });
  if (name.length < 2 || title.length < 3 || body.length < 8)
    return NextResponse.json({ error: 'Please add a little more detail to your review.' }, { status: 400 });

  let imageUrl = null;
  try {
    const [[product]] = await pool.query(
      'SELECT id FROM products WHERE status=? AND (slug=? OR id=?) LIMIT 1', ['Published', slug, slug]
    );
    if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    imageUrl = await saveReviewPhoto(form.get('photo'));
    await pool.query(
      `INSERT INTO product_reviews
        (id,product_id,reviewer_name,rating,title,body,image_url,status,is_sample,created_at)
       VALUES (?,?,?,?,?,?,?,'Pending',0,NOW())`,
      [crypto.randomUUID(), product.id, name, rating, title, body, imageUrl]
    );
    return NextResponse.json({ message: 'Thank you. Your review has been sent for approval.' }, {
      status: 201, headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    if (imageUrl) await fs.unlink(path.join(process.cwd(), 'public', imageUrl.slice('/uploads/'.length))).catch(() => {});
    const status = error.message?.startsWith('Please use') || error.message?.startsWith('Use a valid') ? 400 : 503;
    return NextResponse.json({ error: status === 400 ? error.message : 'Could not submit your review right now.' }, {
      status, headers: { 'Cache-Control': 'no-store' },
    });
  }
}
