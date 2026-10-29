import { NextResponse } from 'next/server';
import pool from '../../../../lib/mysql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const slug = String(params.slug || '').slice(0, 260);
  if (!slug) return NextResponse.json({ error: 'Blog URL is required.' }, { status: 400 });
  try {
    const [[blog]] = await pool.query("SELECT id,title,slug,category,excerpt,content,featured_image,meta_title,meta_description,published_at,created_at FROM blogs WHERE slug=? AND status='Published' LIMIT 1", [slug]);
    if (!blog) return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
    return NextResponse.json({ blog }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
  } catch (error) {
    console.error('Public blog read failed:', error.message);
    return NextResponse.json({ error: 'Blog post is temporarily unavailable.' }, { status: 503 });
  }
}
