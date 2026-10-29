'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './blogs.css';

const emptyBlog = { title: '', slug: '', category: 'Wellness', excerpt: '', content: '', featured_image: '', meta_title: '', meta_description: '', status: 'Draft' };
const slugify = (value) => String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const dateLabel = (value) => value ? new Date(value).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not published';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState(emptyBlog);
  const [editingId, setEditingId] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const editorRef = useRef(null);
  const featuredInputRef = useRef(null);
  const inlineInputRef = useRef(null);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/blogs', { credentials: 'same-origin', cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load blog posts.');
      setBlogs(result.blogs || []);
      setError('');
    } catch (reason) { setError(reason.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadBlogs(); }, []);

  const setField = (key, value) => setBlog((previous) => ({
    ...previous,
    [key]: value,
    ...(key === 'title' && !slugTouched ? { slug: slugify(value) } : {}),
  }));

  const uploadImage = async (file) => {
    if (!file) return null;
    if (!file.type.startsWith('image/') || file.size > 4 * 1024 * 1024) throw new Error('Choose an image smaller than 4 MB.');
    const formData = new FormData();
    formData.set('file', file);
    const response = await fetch('/api/local/upload', { method: 'POST', body: formData, credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok || !result.url) throw new Error(result?.error?.message || 'Image upload failed.');
    return result.url;
  };

  const handleFeaturedImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true); setError('');
    try { setField('featured_image', await uploadImage(file)); }
    catch (reason) { setError(reason.message); }
    finally { setUploading(false); }
  };

  const handleInlineImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true); setError('');
    try {
      const url = await uploadImage(file);
      editorRef.current?.focus();
      document.execCommand('insertImage', false, url);
      setBlog((previous) => ({ ...previous, content: editorRef.current?.innerHTML || previous.content }));
    } catch (reason) { setError(reason.message); }
    finally { setUploading(false); }
  };

  const format = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setBlog((previous) => ({ ...previous, content: editorRef.current?.innerHTML || '' }));
  };

  const editBlog = async (item) => {
    setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/blogs/${item.id}`, { credentials: 'same-origin', cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not open this post.');
      const entry = result.blog;
      setBlog({ title: entry.title || '', slug: entry.slug || '', category: entry.category || 'Wellness', excerpt: entry.excerpt || '', content: entry.content || '', featured_image: entry.featured_image || '', meta_title: entry.meta_title || '', meta_description: entry.meta_description || '', status: entry.status || 'Draft' });
      setEditingId(entry.id); setSlugTouched(true);
      if (editorRef.current) editorRef.current.innerHTML = entry.content || '';
      document.getElementById('blog-editor')?.scrollIntoView({ behavior: 'smooth' });
    } catch (reason) { setError(reason.message); }
  };

  const resetForm = () => {
    setBlog(emptyBlog); setEditingId(null); setSlugTouched(false); setError(''); setNotice('');
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const save = async (event) => {
    event.preventDefault();
    if (saving) return;
    const content = editorRef.current?.innerHTML || blog.content;
    setSaving(true); setError(''); setNotice('');
    try {
      const response = await fetch(editingId ? `/api/admin/blogs/${editingId}` : '/api/admin/blogs', {
        method: editingId ? 'PATCH' : 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...blog, content, slug: slugTouched ? blog.slug : slugify(blog.title) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save this post.');
      setNotice(blog.status === 'Published' ? 'Blog post published.' : 'Draft saved.');
      resetForm();
      await loadBlogs();
      document.getElementById('blog-list')?.scrollIntoView({ behavior: 'smooth' });
    } catch (reason) { setError(reason.message); }
    finally { setSaving(false); }
  };

  const deleteBlog = async (item) => {
    if (!confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    setError(''); setNotice('');
    try {
      const response = await fetch(`/api/admin/blogs/${item.id}`, { method: 'DELETE', credentials: 'same-origin' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not delete this post.');
      setNotice('Blog post deleted.');
      await loadBlogs();
    } catch (reason) { setError(reason.message); }
  };

  return <main className="admin-main blog-admin">
    <header className="admin-top"><div><small>ADMIN / CONTENT MANAGEMENT</small><h2>Blog Posts</h2><p>Create articles, upload images in the editor, and manage search metadata.</p></div><span>{blogs.length} posts</span></header>
    {(error || notice) && <p className={`admin-notice ${error ? 'is-error' : ''}`} role="status">{error || notice}</p>}

    <section className="admin-panel" id="blog-editor">
      <div className="panel-heading"><div><small>{editingId ? 'BLOG / EDIT' : 'BLOG / CREATE'}</small><h3>{editingId ? 'Edit article' : 'New article'}</h3><p>Save a draft or publish the article to the public blog.</p></div>{editingId && <button type="button" onClick={resetForm}>Cancel edit</button>}</div>
      <form className="blog-form" onSubmit={save}>
        <div className="blog-form__main">
          <label>Title<input required minLength="3" maxLength="240" value={blog.title} onChange={(event) => setField('title', event.target.value)} placeholder="Article title" /></label>
          <label>URL slug<div className="blog-form__slug"><span>/blog/</span><input required value={blog.slug} onChange={(event) => { setSlugTouched(true); setField('slug', slugify(event.target.value)); }} placeholder="article-url" /></div></label>
          <div className="blog-form__row">
            <label>Category<input maxLength="100" value={blog.category} onChange={(event) => setField('category', event.target.value)} placeholder="Wellness" /></label>
            <label>Status<select value={blog.status} onChange={(event) => setField('status', event.target.value)}><option>Draft</option><option>Published</option></select></label>
          </div>
          <label>Excerpt<textarea rows="3" maxLength="500" value={blog.excerpt} onChange={(event) => setField('excerpt', event.target.value)} placeholder="A short summary shown on blog cards and search results" /></label>
          <div className="blog-editor-field">
            <span className="blog-editor-field__label">ARTICLE CONTENT</span>
            <div className="blog-toolbar" role="toolbar" aria-label="Article formatting">
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format('bold')}><b>B</b></button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format('italic')}><i>I</i></button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format('formatBlock', '<h2>')}>H2</button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format('formatBlock', '<h3>')}>H3</button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => format('insertUnorderedList')}>Bullets</button>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { const url = prompt('Enter the link URL'); if (url) format('createLink', url); }}>Link</button>
              <button type="button" disabled={uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => inlineInputRef.current?.click()}>{uploading ? 'Uploading...' : 'Insert image'}</button>
              <input ref={inlineInputRef} type="file" accept="image/*" hidden onChange={handleInlineImage} />
            </div>
            <div ref={editorRef} className="blog-rich-editor" contentEditable suppressContentEditableWarning role="textbox" aria-label="Article content editor" aria-multiline="true" data-placeholder="Write your article here. Use the toolbar to format text and upload images." onInput={(event) => setField('content', event.currentTarget.innerHTML)} />
            <small>Images inserted here are uploaded to the site. PNG, JPG and WEBP up to 4 MB.</small>
          </div>
        </div>
        <aside className="blog-form__side">
          <label className="blog-featured-upload">
            <span>FEATURED IMAGE</span>
            {blog.featured_image ? <img src={blog.featured_image} alt="Featured image preview" /> : <b>{uploading ? 'Uploading image...' : 'Choose featured image'}</b>}
            <input ref={featuredInputRef} type="file" accept="image/*" onChange={handleFeaturedImage} />
          </label>
          <p className="blog-form__hint">A landscape image works best for the blog listing and article header.</p>
          <label>Meta title<input maxLength="200" value={blog.meta_title} onChange={(event) => setField('meta_title', event.target.value)} placeholder="Defaults to the article title" /></label>
          <label>Meta description<textarea rows="4" maxLength="320" value={blog.meta_description} onChange={(event) => setField('meta_description', event.target.value)} placeholder="Search result description (up to 320 characters)" /></label>
          <button className="blog-save" type="submit" disabled={saving || uploading}>{saving ? 'Saving...' : blog.status === 'Published' ? 'Publish article' : 'Save draft'}</button>
        </aside>
      </form>
    </section>

    <section className="admin-panel" id="blog-list">
      <div className="panel-heading"><div><small>CONTENT LIBRARY</small><h3>All articles</h3><p>Manage drafts and published blog posts.</p></div><span>{blogs.length} total</span></div>
      {loading ? <p className="blog-admin__empty">Loading articles...</p> : blogs.length ? <div className="blog-admin-list">{blogs.map((item) => <article key={item.id}>
        <img src={item.featured_image} alt="" loading="lazy" />
        <div><small>{item.category} · {item.status} · {dateLabel(item.published_at || item.created_at)}</small><h4>{item.title}</h4><p>{item.excerpt}</p><span>/blog/{item.slug}</span></div>
        <div className="blog-admin-list__actions"><button type="button" onClick={() => editBlog(item)}>Edit</button>{item.status === 'Published' && <Link href={`/blog/${item.slug}`} target="_blank">View</Link>}<button type="button" className="is-delete" onClick={() => deleteBlog(item)}>Delete</button></div>
      </article>)}</div> : <p className="blog-admin__empty">No blog posts yet. Create your first article above.</p>}
    </section>
  </main>;
}
