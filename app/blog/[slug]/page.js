import Link from 'next/link';
import CommerceHeader from '../../../components/CommerceHeader';
import CommerceFooter from '../../../components/CommerceFooter';
import { notFound } from 'next/navigation';
import pool from '../../../lib/mysql';
import { sanitizeBlogHtml } from '../../../lib/blogs';
import '../blog.css';

export const dynamic = 'force-dynamic';

async function getPost(slug) {
  const [[post]] = await pool.query("SELECT title,slug,category,excerpt,content,featured_image,meta_title,meta_description,published_at,created_at FROM blogs WHERE slug=? AND status='Published' LIMIT 1", [slug]);
  return post || null;
}

export async function generateMetadata({ params }) {
  try {
    const post = await getPost(String(params.slug || '').slice(0, 260));
    if (!post) return { title: 'Article not found | Baba Hakeem' };
    return {
      title: post.meta_title || `${post.title} | Baba Hakeem`,
      description: post.meta_description || post.excerpt,
      openGraph: { title: post.meta_title || post.title, description: post.meta_description || post.excerpt, images: post.featured_image ? [post.featured_image] : [] },
    };
  } catch { return { title: 'Wellness Journal | Baba Hakeem' }; }
}

export default async function BlogPostPage({ params }) {
  let post;
  try { post = await getPost(String(params.slug || '').slice(0, 260)); }
  catch (error) { console.error('Blog article could not load:', error.message); notFound(); }
  if (!post) notFound();
  const publishedDate = post.published_at || post.created_at;

  return <main className="blog-public blog-article">
    <CommerceHeader />
    <article>
      <div className="blog-article__intro"><Link className="blog-article__back" href="/blog">← Wellness Journal</Link><p>{post.category}</p><h1>{post.title}</h1><time dateTime={publishedDate}>{new Date(publishedDate).toLocaleDateString('en-PK',{day:'numeric',month:'long',year:'numeric'})}</time>{post.excerpt && <div className="blog-article__excerpt">{post.excerpt}</div>}</div>
      {post.featured_image && <img className="blog-article__hero-image" src={post.featured_image} alt={post.title} />}
      <div className="blog-article__content" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content) }} />
    </article>
    <CommerceFooter />
  </main>;
}
