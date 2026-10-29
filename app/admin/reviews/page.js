'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { StarRating } from '../../../components/Icons';
import './reviews.css';

const PAGE_SIZE = 20;
const EMPTY_FORM = { product_id: '', reviewer_name: '', rating: '5', title: '', body: '', status: 'Published', is_sample: false };

export default function AdminReviewsPage() {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    if (!file) { setPhotoUrl(''); return undefined; }
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE), productId, status, search: search.trim() });
    try {
      const response = await fetch('/api/admin/reviews?' + params, { signal, cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not load reviews.');
      setItems(result.items || []);
      setProducts(result.products || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 0);
      setForm((previous) => ({ ...previous, product_id: previous.product_id || result.products?.[0]?.id || '' }));
    } catch (reason) {
      if (reason.name !== 'AbortError') setError(reason.message || 'Could not load reviews.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, productId, status, search]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => load(controller.signal), search ? 220 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [load, search]);

  const uploadImage = async () => {
    if (!file) return '';
    const payload = new FormData();
    payload.append('file', file);
    payload.append('path', 'reviews');
    const response = await fetch('/api/local/upload', { method: 'POST', body: payload, credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok || result.error) throw new Error(result.error?.message || 'Could not upload the review photo.');
    return result.url;
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true); setNotice(''); setError('');
    try {
      const image_url = await uploadImage();
      const response = await fetch('/api/admin/reviews', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image_url }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not create review.');
      setForm({ ...EMPTY_FORM, product_id: form.product_id }); setFile(null);
      setNotice('Review added.');
      setPage(1);
      await load();
    } catch (reason) { setError(reason.message); }
    finally { setSaving(false); }
  };

  const remove = async (review) => {
    if (!window.confirm(`Delete this review by ${review.reviewer_name}? This cannot be undone.`)) return;
    const response = await fetch('/api/admin/reviews/' + encodeURIComponent(review.id), { method: 'DELETE', credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok) { setError(result.error || 'Could not delete review.'); return; }
    setNotice('Review deleted.');
    await load();
  };

  const setReviewStatus = async (review, nextStatus) => {
    const response = await fetch('/api/admin/reviews/' + encodeURIComponent(review.id), {
      method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    const result = await response.json();
    if (!response.ok) { setError(result.error || 'Could not update review.'); return; }
    await load();
  };

  const range = useMemo(() => total ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}` : '0 reviews', [page, total]);

  return (
    <main className="admin-main admin-reviews-page">
      <header className="admin-top"><div><small>ADMIN CONSOLE / CUSTOMER FEEDBACK</small><h2>Product Reviews</h2><p>Moderate sample and customer reviews, add review photos, and control what appears on storefronts.</p></div><div className="top-actions"><Link href="/admin">Dashboard ↗</Link></div></header>

      {error && <div className="review-admin-alert review-admin-alert--error" role="alert">{error}</div>}
      {notice && <div className="review-admin-alert" role="status">{notice}</div>}

      <section className="review-admin-panel">
        <div className="review-admin-panel__heading"><div><small>REVIEW / CREATE</small><h3>Add a product review</h3><p>Attach an optional image. Mark placeholder entries as sample data so they are clearly identified on the storefront.</p></div></div>
        <form className="review-admin-form" onSubmit={submit}>
          <label>PRODUCT<select required value={form.product_id} onChange={(event) => setForm({ ...form, product_id: event.target.value })}><option value="">Choose product</option>{products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select></label>
          <label>REVIEWER NAME<input required maxLength="120" value={form.reviewer_name} onChange={(event) => setForm({ ...form, reviewer_name: event.target.value })} /></label>
          <label>RATING<select value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></label>
          <label>VISIBILITY<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Published</option><option>Pending</option><option>Hidden</option></select></label>
          <label className="review-admin-form__wide">TITLE<input required maxLength="180" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
          <label className="review-admin-form__wide">REVIEW<textarea required maxLength="3000" rows="4" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></label>
          <label className="review-admin-upload">REVIEW PHOTO <span>Optional · PNG, JPG or WEBP · max 4 MB</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const selected = event.target.files?.[0] || null; if (selected && (!['image/png', 'image/jpeg', 'image/webp'].includes(selected.type) || selected.size > 4 * 1024 * 1024)) { setError('Choose a PNG, JPG, or WEBP image smaller than 4 MB.'); event.target.value = ''; return; } setFile(selected); setError(''); }} />{photoUrl && <img className="review-admin-upload__preview" src={photoUrl} alt="Selected review preview" />}</label>
          <label className="review-admin-sample"><input type="checkbox" checked={form.is_sample} onChange={(event) => setForm({ ...form, is_sample: event.target.checked })} /><span>Mark this as sample / placeholder content</span></label>
          <div className="review-admin-form__actions"><button className="review-admin-primary" type="submit" disabled={saving}>{saving ? 'SAVING…' : 'ADD REVIEW'}</button>{notice && <span>{notice}</span>}</div>
        </form>
      </section>

      <section className="review-admin-panel">
        <div className="review-admin-panel__heading"><div><small>REVIEW / MODERATE</small><h3>Review library</h3><p>{range} · loaded {items.length} at a time</p></div></div>
        <div className="review-admin-toolbar">
          <input type="search" placeholder="Search reviewer, product or comment" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          <select value={productId} onChange={(event) => { setProductId(event.target.value); setPage(1); }}><option value="all">All products</option>{products.map((product) => <option value={product.id} key={product.id}>{product.name}</option>)}</select>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option><option>Published</option><option>Pending</option><option>Hidden</option></select>
        </div>
        {loading ? <p className="review-admin-empty">Loading reviews…</p> : items.length === 0 ? <p className="review-admin-empty">No reviews match these filters.</p> : (
          <div className="review-admin-list">{items.map((review) => (
            <article key={review.id}>
              {review.image_url && <img className="review-admin-list__photo" src={review.image_url} alt="" loading="lazy" />}
              <div className="review-admin-list__copy"><div><b>{review.title}</b>{review.is_sample ? <span className="review-admin-sample-tag">SAMPLE</span> : null}</div><span>{review.product_name} · {review.reviewer_name} · {new Date(review.created_at).toLocaleDateString()}</span><StarRating rating={Number(review.rating)} size={13} /><p>{review.body}</p></div>
              <div className="review-admin-list__actions"><select aria-label="Review visibility" value={review.status} onChange={(event) => setReviewStatus(review, event.target.value)}><option>Published</option><option>Pending</option><option>Hidden</option></select><button type="button" onClick={() => remove(review)}>Delete</button></div>
            </article>
          ))}</div>
        )}
        {totalPages > 1 && <nav className="review-admin-pagination" aria-label="Review library pages"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></nav>}
      </section>
    </main>
  );
}
