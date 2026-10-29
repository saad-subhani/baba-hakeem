import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { currentAdmin } from '../../../../../lib/store';
import pool from '../../../../../lib/mysql';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const reply = (body, status = 200) => NextResponse.json(body, {
  status,
  headers: { 'Cache-Control': 'private, no-store' },
});

async function authorized() {
  try { return !!(await currentAdmin()); } catch { return false; }
}

export async function PATCH(request, { params }) {
  if (!await authorized()) return reply({ error: 'Admin sign-in required.' }, 401);
  let body;
  try { body = await request.json(); } catch { return reply({ error: 'Invalid request.' }, 400); }
  if (!['Published', 'Pending', 'Hidden'].includes(body.status)) return reply({ error: 'Invalid review status.' }, 400);
  try {
    const [result] = await pool.query(
      'UPDATE product_reviews SET status=?,updated_at=NOW() WHERE id=?', [body.status, String(params.id || '')]
    );
    return result.affectedRows ? reply({ success: true }) : reply({ error: 'Review not found.' }, 404);
  } catch (error) {
    console.error('Admin review update failed:', error.message);
    return reply({ error: 'Could not update this review.' }, 503);
  }
}

export async function DELETE(_request, { params }) {
  if (!await authorized()) return reply({ error: 'Admin sign-in required.' }, 401);
  const id = String(params.id || '').slice(0, 36);
  try {
    const [[review]] = await pool.query('SELECT image_url FROM product_reviews WHERE id=? LIMIT 1', [id]);
    if (!review) return reply({ error: 'Review not found.' }, 404);
    await pool.query('DELETE FROM product_reviews WHERE id=?', [id]);
    const match = String(review.image_url || '').match(/^\/uploads\/(reviews\/)?([a-zA-Z0-9._-]+)$/);
    if (match) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', match[1] ? 'reviews' : '');
      await fs.unlink(path.join(uploadDir, match[2])).catch(() => {});
    }
    return reply({ success: true });
  } catch (error) {
    console.error('Admin review delete failed:', error.message);
    return reply({ error: 'Could not delete this review.' }, 503);
  }
}
