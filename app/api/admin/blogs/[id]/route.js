import { NextResponse } from 'next/server';
import pool from '../../../../../lib/mysql';
import { currentAdmin } from '../../../../../lib/store';
import { saveBlog } from '../../../../../lib/blogs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (body, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
async function authorized() { try { return !!(await currentAdmin()); } catch { return false; } }

export async function GET(_request, { params }) {
  if (!await authorized()) return reply({ error: 'Admin sign-in required.' }, 401);
  try {
    const [[blog]] = await pool.query('SELECT * FROM blogs WHERE id=? LIMIT 1', [String(params.id || '')]);
    return blog ? reply({ blog }) : reply({ error: 'Blog post not found.' }, 404);
  } catch (error) {
    console.error('Admin blog read failed:', error.message);
    return reply({ error: 'Could not load this blog post.' }, 503);
  }
}

export async function PATCH(request, { params }) {
  if (!await authorized()) return reply({ error: 'Admin sign-in required.' }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request.' }, 400); }
  try {
    const result = await saveBlog(body, String(params.id || ''));
    return result.error ? reply({ error: result.error }, result.error === 'Blog post not found.' ? 404 : 400) : reply({ success: true, ...result });
  } catch (error) {
    console.error('Admin blog update failed:', error.message);
    return reply({ error: 'Could not update this blog post.' }, 503);
  }
}

export async function DELETE(_request, { params }) {
  if (!await authorized()) return reply({ error: 'Admin sign-in required.' }, 401);
  try {
    const [result] = await pool.query('DELETE FROM blogs WHERE id=?', [String(params.id || '')]);
    return result.affectedRows ? reply({ success: true }) : reply({ error: 'Blog post not found.' }, 404);
  } catch (error) {
    console.error('Admin blog delete failed:', error.message);
    return reply({ error: 'Could not delete this blog post.' }, 503);
  }
}
