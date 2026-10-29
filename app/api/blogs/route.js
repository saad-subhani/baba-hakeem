import { NextResponse } from 'next/server';
import pool from '../../../lib/mysql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const limit = Math.min(24, Math.max(1, Number.parseInt(params.get('limit') || '9', 10) || 9));
  const page = Math.max(1, Number.parseInt(params.get('page') || '1', 10) || 1);
  const offset = (page - 1) * limit;
  try {
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM blogs WHERE status='Published'");
    const [blogs] = await pool.query(
      `SELECT id,title,slug,category,excerpt,featured_image,meta_title,meta_description,published_at,created_at
       FROM blogs WHERE status='Published' ORDER BY COALESCE(published_at,created_at) DESC LIMIT ? OFFSET ?`, [limit, offset]
    );
    return NextResponse.json({ blogs, page, limit, total: Number(total), totalPages: Math.ceil(Number(total) / limit) }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('Public blog list failed:', error.message);
    return NextResponse.json({ error: 'Blog posts are temporarily unavailable.' }, { status: 503 });
  }
}
