import { NextResponse } from 'next/server';
import pool from '../../../../lib/mysql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [products] = await pool.query("SELECT id, slug FROM products WHERE status='Published'");
    const [rows] = await pool.query(
      `SELECT product_id, COUNT(*) AS total, AVG(rating) AS average
       FROM product_reviews
       WHERE status='Published' AND is_sample=0
       GROUP BY product_id`
    );
    const byId = new Map(rows.map((row) => [String(row.product_id), {
      total: Number(row.total),
      average: Number(Number(row.average).toFixed(1)),
    }]));
    const summaries = {};
    for (const product of products) {
      const summary = byId.get(String(product.id)) || { total: 0, average: null };
      if (product.slug) summaries[product.slug] = summary;
      summaries[String(product.id)] = summary;
    }
    return NextResponse.json(summaries, {
      headers: { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    console.error('Product review summaries query failed:', error.message);
    return NextResponse.json({ error: 'Could not load review summaries.' }, { status: 503 });
  }
}
