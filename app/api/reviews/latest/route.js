import { NextResponse } from 'next/server';
import pool from '../../../../lib/mysql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [products] = await pool.query("SELECT id, name, slug FROM products WHERE status='Published'");
    const productById = new Map(products.map((product) => [String(product.id), product]));
    const [reviews] = await pool.query(
      `SELECT id, product_id, reviewer_name, rating, title, body, created_at
       FROM product_reviews
       WHERE status='Published' AND is_sample=0
       ORDER BY created_at DESC, id DESC LIMIT 6`
    );
    const items = reviews.map((review) => ({
      ...review,
      product_name: productById.get(String(review.product_id))?.name || '',
      product_slug: productById.get(String(review.product_id))?.slug || '',
    }));
    return NextResponse.json({ items }, {
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('Latest product reviews query failed:', error.message);
    return NextResponse.json({ error: 'Could not load reviews.' }, { status: 503 });
  }
}
