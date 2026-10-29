import crypto from 'crypto';
import pool from './mysql';

const slugify = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 240);

const allowedTags = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption', 'hr']);
const voidTags = new Set(['br', 'img', 'hr']);

export function sanitizeBlogHtml(value) {
  let html = String(value || '').slice(0, 2_000_000)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|style|iframe|object|embed|svg|math|template)\b[^>]*\/?>/gi, '');

  html = html.replace(/<\/?([a-z][a-z0-9-]*)\b([^>]*)>/gi, (whole, rawName, rawAttributes) => {
    const name = String(rawName).toLowerCase();
    if (name === 'div') return /^\s*\//.test(whole.slice(1)) ? '</p>' : '<p>';
    if (name === 'span') return '';
    if (!allowedTags.has(name)) return '';
    const closing = /^\s*\//.test(whole.slice(1));
    if (closing) return voidTags.has(name) ? '' : `</${name}>`;
    let attributes = '';
    if (name === 'a') {
      const href = rawAttributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
      if (/^(https?:\/\/|mailto:|tel:|#|\/(?!\/))/i.test(href)) {
        attributes = ` href="${href.replace(/["<>]/g, '')}"`;
        if (/^https?:\/\//i.test(href)) attributes += ' target="_blank" rel="noopener noreferrer"';
      }
    }
    if (name === 'img') {
      const src = rawAttributes.match(/\bsrc\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
      const alt = rawAttributes.match(/\balt\s*=\s*(["'])(.*?)\1/i)?.[2] || '';
      if (!/^https:\/\/|^\/(?!\/)/i.test(src)) return '';
      attributes = ` src="${src.replace(/["<>]/g, '')}" alt="${alt.replace(/["<>]/g, '').slice(0, 300)}" loading="lazy" decoding="async"`;
    }
    return `<${name}${attributes}>`;
  });
  return html;
}

export function normalizeBlogInput(input = {}) {
  const title = String(input.title || '').trim().slice(0, 240);
  const slug = slugify(input.slug || title);
  const category = String(input.category || 'Wellness').trim().slice(0, 100) || 'Wellness';
  const excerpt = String(input.excerpt || '').trim().slice(0, 500);
  const content = sanitizeBlogHtml(input.content);
  const featuredImage = String(input.featured_image || '').trim().slice(0, 700);
  const metaTitle = String(input.meta_title || '').trim().slice(0, 200);
  const metaDescription = String(input.meta_description || '').trim().slice(0, 320);
  const status = input.status === 'Published' ? 'Published' : 'Draft';
  return { title, slug, category, excerpt, content, featuredImage, metaTitle, metaDescription, status };
}

export async function saveBlog(input, id = null) {
  const blog = normalizeBlogInput(input);
  if (blog.title.length < 3) return { error: 'Enter a blog title with at least 3 characters.' };
  if (!blog.slug) return { error: 'Enter a valid URL slug.' };
  if (!blog.featuredImage) return { error: 'Upload a featured image.' };
  if (blog.content.replace(/<[^>]*>/g, '').trim().length < 30) return { error: 'Add more content to the blog article.' };

  const [duplicates] = await pool.query('SELECT id FROM blogs WHERE slug=? AND (? IS NULL OR id<>?) LIMIT 1', [blog.slug, id, id]);
  if (duplicates.length) return { error: 'That URL slug is already in use.' };
  const metaTitle = blog.metaTitle || `${blog.title} | Baba Hakeem`;
  const metaDescription = blog.metaDescription || blog.excerpt.slice(0, 160);

  if (id) {
    const [result] = await pool.query(
      `UPDATE blogs SET title=?,slug=?,category=?,excerpt=?,content=?,featured_image=?,meta_title=?,meta_description=?,status=?,
       published_at=CASE WHEN ?='Published' THEN COALESCE(published_at,NOW()) ELSE NULL END,updated_at=NOW() WHERE id=?`,
      [blog.title, blog.slug, blog.category, blog.excerpt, blog.content, blog.featuredImage, metaTitle, metaDescription, blog.status, blog.status, id]
    );
    return result.affectedRows ? { id, slug: blog.slug } : { error: 'Blog post not found.' };
  }

  const newId = crypto.randomUUID();
  await pool.query(
    `INSERT INTO blogs (id,title,slug,category,excerpt,content,featured_image,meta_title,meta_description,status,published_at,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,IF(?='Published',NOW(),NULL),NOW(),NOW())`,
    [newId, blog.title, blog.slug, blog.category, blog.excerpt, blog.content, blog.featuredImage, metaTitle, metaDescription, blog.status, blog.status]
  );
  return { id: newId, slug: blog.slug };
}
