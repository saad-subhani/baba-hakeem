import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import pool from './mysql';

const localVideo = (value) => /^\/uploads\/videos\/[a-zA-Z0-9._-]+\.(mp4|webm|mov)$/i.test(String(value || ''));
const localPoster = (value) => !value || /^\/uploads\/[a-zA-Z0-9._-]+\.(png|jpe?g|webp|gif)$/i.test(String(value));

export async function removeTestimonialMedia(url) {
  const value = String(url || '');
  let target;
  if (/^\/uploads\/videos\/[a-zA-Z0-9._-]+\.(mp4|webm|mov)$/i.test(value)) {
    target = path.join(process.cwd(), 'public', 'uploads', 'videos', path.basename(value));
  } else if (/^\/uploads\/[a-zA-Z0-9._-]+\.(png|jpe?g|webp|gif)$/i.test(value)) {
    target = path.join(process.cwd(), 'public', 'uploads', path.basename(value));
  }
  if (target) await fs.unlink(target).catch(() => {});
}

export function normalizeTestimonial(input = {}) {
  return {
    customer_name: String(input.customer_name || '').trim().slice(0, 160),
    location: String(input.location || '').trim().slice(0, 120),
    product_name: String(input.product_name || '').trim().slice(0, 180),
    quote: String(input.quote || '').trim().slice(0, 600),
    video_url: String(input.video_url || '').trim().slice(0, 700),
    poster_url: String(input.poster_url || '').trim().slice(0, 700),
    status: input.status === 'Published' ? 'Published' : 'Draft',
    sort_order: Math.max(0, Math.min(9999, Number.parseInt(input.sort_order, 10) || 0)),
  };
}

export async function saveTestimonial(input, id = null) {
  const item = normalizeTestimonial(input);
  if (item.customer_name.length < 2) return { error: 'Enter the customer name shown with this video.' };
  if (!localVideo(item.video_url)) return { error: 'Upload an MP4, WEBM, or MOV video before saving.' };
  if (!localPoster(item.poster_url)) return { error: 'Upload a valid image for the optional poster.' };
  if (id) {
    const [[existing]] = await pool.query('SELECT video_url,poster_url FROM video_testimonials WHERE id=? LIMIT 1', [id]);
    if (!existing) return { error: 'Video testimonial not found.' };
    await pool.query(`UPDATE video_testimonials SET customer_name=?,location=?,product_name=?,quote=?,video_url=?,poster_url=?,status=?,sort_order=?,updated_at=NOW() WHERE id=?`,
      [item.customer_name,item.location,item.product_name,item.quote,item.video_url,item.poster_url,item.status,item.sort_order,id]);
    if (existing.video_url !== item.video_url) await removeTestimonialMedia(existing.video_url);
    if (existing.poster_url && existing.poster_url !== item.poster_url) await removeTestimonialMedia(existing.poster_url);
    return { id, ...item };
  }
  const newId = crypto.randomUUID();
  await pool.query(`INSERT INTO video_testimonials (id,customer_name,location,product_name,quote,video_url,poster_url,status,sort_order,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,NOW(),NOW())`, [newId,item.customer_name,item.location,item.product_name,item.quote,item.video_url,item.poster_url,item.status,item.sort_order]);
  return { id: newId, ...item };
}
