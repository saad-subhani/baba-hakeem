'use client';

import { useEffect, useState } from 'react';
import { StarRating } from './Icons';
import './ProductReviews.css';

export default function ProductReviews({ slug, productName }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [sort, setSort] = useState('recent');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [form, setForm] = useState({ name: '', rating: 5, title: '', body: '' });

  useEffect(() => {
    if (!photo) { setPhotoPreview(''); return undefined; }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  useEffect(() => {
    if (!formOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => { if (event.key === 'Escape') setFormOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [formOpen]);

  useEffect(() => {
    if (!slug) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    const query = new URLSearchParams({ slug, page: String(page), pageSize: String(pageSize), sort });
    fetch(`/api/reviews?${query}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Reviews are temporarily unavailable.');
        return result;
      })
      .then((result) => setData(result))
      .catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message || 'Reviews are temporarily unavailable.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug, page, pageSize, sort]);

  const choosePhoto = (event) => {
    const selected = event.target.files?.[0] || null;
    if (selected && (!['image/png', 'image/jpeg', 'image/webp'].includes(selected.type) || selected.size > 4 * 1024 * 1024)) {
      setFormError('Choose a PNG, JPG, or WEBP photo smaller than 4 MB.');
      event.target.value = '';
      return;
    }
    setFormError('');
    setPhoto(selected);
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setSubmitting(true); setFormError(''); setNotice('');
    const payload = new FormData();
    payload.set('slug', slug);
    payload.set('name', form.name);
    payload.set('rating', String(form.rating));
    payload.set('title', form.title);
    payload.set('body', form.body);
    payload.set('website', '');
    if (photo) payload.set('photo', photo);
    try {
      const response = await fetch('/api/reviews', { method: 'POST', body: payload, credentials: 'same-origin' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit your review.');
      setNotice(result.message || 'Thanks. Your review was submitted for approval.');
      setForm({ name: '', rating: 5, title: '', body: '' });
      setPhoto(null);
      setFormOpen(false);
    } catch (reason) { setFormError(reason.message || 'Could not submit your review.'); }
    finally { setSubmitting(false); }
  };

  const totalPages = data?.totalPages || 0;
  const distribution = data?.distribution || {};

  return (
    <section className="product-reviews" aria-labelledby="product-reviews-title">
      <div className="product-reviews__inner">
        <header className="product-reviews__heading">
          <div>
            <p className="product-reviews__eyebrow">CUSTOMER FEEDBACK</p>
            <h2 id="product-reviews-title">Reviews</h2>
            <p className="product-reviews__product-name">{productName}</p>
          </div>
          <button className="product-reviews__write-button" type="button" onClick={() => { setFormOpen(true); setFormError(''); }}>
            Write a review
          </button>
        </header>

        {notice && <p className="product-reviews__success" role="status">{notice}</p>}
        <div className="product-reviews__layout">
          <aside className="product-reviews__sidebar" aria-label="Rating summary">
            <div className="product-reviews__score-card">
              <span className="product-reviews__score-star" aria-hidden="true">★</span>
              <strong>{data?.average ?? '—'}</strong>
              <span className="product-reviews__score-divider" />
              <span className="product-reviews__total">{data?.total || 0}<br />reviews</span>
            </div>
            <div className="product-reviews__distribution">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = Number(distribution[rating] || 0);
                const percent = data?.total ? (count / data.total) * 100 : 0;
                return <div className="product-reviews__bar-row" key={rating}><span>{rating} ★</span><span className="product-reviews__bar"><i style={{ width: `${percent}%` }} /></span><span>{count}</span></div>;
              })}
            </div>
          </aside>

          <div className="product-reviews__main">
            <div className="product-reviews__toolbar">
              <label className="product-reviews__select"><span className="sr-only">Sort reviews</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="recent">Recent</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option></select></label>
              <label className="product-reviews__select"><span className="sr-only">Reviews per page</span><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={5}>5</option><option value={10}>10</option></select></label>
              <nav className="product-reviews__pagination" aria-label="Review pages"><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>‹</button><span>Page {page}</span><button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>›</button></nav>
            </div>

            {loading ? <div className="product-reviews__empty" aria-live="polite">Loading reviews…</div> : error ? <div className="product-reviews__empty" role="status">{error}</div> : data?.items?.length ? (
              <div className="product-reviews__list" aria-live="polite">
                {data.items.map((review) => (
                  <article className="product-review-card" key={review.id}>
                    <div className="product-review-card__top">
                      <span className="product-review-card__avatar" aria-hidden="true">{String(review.reviewer_name || '?').trim().charAt(0).toUpperCase()}</span>
                      <strong dir="auto">{review.reviewer_name}</strong>
                      <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</time>
                    </div>
                    <StarRating rating={Number(review.rating)} size={21} />
                    <h3 dir="auto">{review.title}</h3>
                    <p className="product-review-card__body" dir="auto">{review.body}</p>
                    {review.image_url && <button className="product-review-card__photo" type="button" onClick={() => setLightbox(review.image_url)} aria-label="Enlarge review photo"><img src={review.image_url} alt="Customer review photo" loading="lazy" decoding="async" /></button>}
                  </article>
                ))}
              </div>
            ) : <div className="product-reviews__empty">No reviews yet. Be the first to share your experience.</div>}
          </div>
        </div>
      </div>
      {lightbox && <div className="product-reviews__lightbox" role="presentation" onClick={() => setLightbox(null)}><button type="button" aria-label="Close review photo" onClick={() => setLightbox(null)}>×</button><img src={lightbox} alt="Enlarged customer review photo" onClick={(event) => event.stopPropagation()} /></div>}
      {formOpen && <div className="review-modal__backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
        <section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
          <header className="review-modal__header"><h2 id="review-modal-title">Tell us about your experience</h2><button type="button" aria-label="Close review form" onClick={() => setFormOpen(false)}>×</button></header>
          <p className="review-modal__product">{productName}</p>
          <form className="review-submission" onSubmit={submitReview}>
            <div className="review-submission__fields">
              <label className="review-submission__wide">Your name<input dir="auto" required maxLength="120" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <fieldset className="review-submission__rating review-submission__wide"><legend>Your rating</legend><div>{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" className={rating <= form.rating ? 'selected' : ''} aria-label={`${rating} stars`} aria-pressed={form.rating === rating} onClick={() => setForm({ ...form, rating })}>★</button>)}</div></fieldset>
              <label className="review-submission__wide">Review title<input dir="auto" required minLength="3" maxLength="180" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label className="review-submission__wide">Your review<textarea dir="auto" required minLength="8" maxLength="3000" rows="4" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} /></label>
              <label className="review-submission__photo review-submission__wide">Add a photo <span>Optional - PNG, JPG or WEBP - max 4 MB</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={choosePhoto} />{photoPreview && <img src={photoPreview} alt="Selected review photo preview" />}</label>
            </div>
            <p className="review-modal__moderation">Reviews are published after our team approves them.</p>
            {formError && <p className="review-submission__error" role="alert">{formError}</p>}
            <button className="review-modal__submit" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit review'}</button>
          </form>
        </section>
      </div>}
    </section>
  );
}


