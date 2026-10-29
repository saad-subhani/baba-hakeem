import { NextResponse } from 'next/server';
import pool from '../../../../lib/mysql';
import { currentAdmin } from '../../../../lib/store';
import { saveBlog } from '../../../../lib/blogs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
async function authorized() { try { return !!(await currentAdmin()); } catch { return false; } }

export async function GET() {
  if (!await authorized()) return reply({ error: 'Admin sign-in required.' }, 401);
  try {
    const [blogs] = await pool.query(`SELECT id,title,slug,category,excerpt,featured_image,meta_title,meta_description,status,published_at,created_at,updated_at
      FROM blogs ORDER BY updated_at DESC,created_at DESC`);
    return reply({ blogs });
  } catch (error) {
    console.error('Admin blog list failed:', error.message);
    return reply({ error: 'Could not load blog posts.' }, 503);
  }
}

export async function POST(request) {
  if (!await authorized()) return reply({ error: 'Admin sign-in required.' }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request.' }, 400); }
  try {
    const result = await saveBlog(body);
    return result.error ? reply({ error: result.error }, 400) : reply({ success: true, ...result }, 201);
  } catch (error) {
    console.error('Admin blog create failed:', error.message);
    return reply({ error: 'Could not save this blog post.' }, 503);
  }
}
