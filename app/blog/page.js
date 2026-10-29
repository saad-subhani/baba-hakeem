import Link from 'next/link';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';
import pool from '../../lib/mysql';
import './blog.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Wellness Journal | Baba Hakeem', description: 'Herbal care guides, daily rituals and wellness articles from Baba Hakeem.' };

export default async function BlogIndexPage({ searchParams }) {
  const page = Math.max(1, Number.parseInt(searchParams?.page || '1', 10) || 1);
  const limit = 9;
  const offset = (page - 1) * limit;
  let blogs = [];
  let total = 0;
  try {
    const [[count]] = await pool.query("SELECT COUNT(*) AS total FROM blogs WHERE status='Published'");
    total = Number(count.total || 0);
    [blogs] = await pool.query("SELECT title,slug,category,excerpt,featured_image,published_at,created_at FROM blogs WHERE status='Published' ORDER BY COALESCE(published_at,created_at) DESC LIMIT ? OFFSET ?", [limit, offset]);
  } catch (error) { console.error('Blog listing could not load:', error.message); }
  const totalPages = Math.ceil(total / limit);

  return <main className="blog-public">
    <CommerceHeader />
    <section className="blog-public__hero"><p>HERBAL CARE / WELLNESS / DAILY RITUALS</p><h1>The Wellness Journal</h1><span>Stories, practical guides, and thoughtful ways to make herbal care part of everyday life.</span></section>
    <section className="blog-public__listing" aria-label="Published articles">
      {blogs.length ? <div className="blog-public__grid">{blogs.map((blog) => <article className="blog-public-card" key={blog.slug}>
        <Link href={`/blog/${blog.slug}`} className="blog-public-card__image"><img src={blog.featured_image} alt={blog.title} loading="lazy" decoding="async" /></Link>
        <div className="blog-public-card__body"><div><span>{blog.category}</span><time dateTime={blog.published_at || blog.created_at}>{new Date(blog.published_at || blog.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</time></div><h2><Link href={`/blog/${blog.slug}`}>{blog.title}</Link></h2><p>{blog.excerpt}</p><Link className="blog-public-card__read" href={`/blog/${blog.slug}`}>Read article <span aria-hidden="true">→</span></Link></div>
      </article>)}</div> : <div className="blog-public__empty"><h2>New stories are on the way</h2><p>Check back soon for articles from the Baba Hakeem journal.</p></div>}
      {totalPages > 1 && <nav className="blog-public__pagination" aria-label="Blog pages">{page > 1 && <Link href={`/blog?page=${page - 1}`}>← Previous</Link>}<span>Page {page} of {totalPages}</span>{page < totalPages && <Link href={`/blog?page=${page + 1}`}>Next →</Link>}</nav>}
    </section>
    <CommerceFooter />
  </main>;
}
