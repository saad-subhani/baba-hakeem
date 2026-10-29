'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCart, { mergeCartItem, persistCartItems } from './useCart';
import useReviewSummaries from './useReviewSummaries';
import { StarRating } from './Icons';
import './ShopCatalog.css';

const FALLBACK = [
  { id:'hair-oil-e978fe07', slug:'hair-oil-e978fe07', name:'Baba Hakeem Herbal Hair Oil', category:'Hair Care', image:'/products/hair oil mockup png.png', price:2000, oldPrice:2500, tag:'Best Seller', reviews:0, rating:0 },
  { id:'joint-oil-f188e5c3', slug:'joint-oil-f188e5c3', name:'Baba Hakeem Joint Oil', category:'Joint Care', image:'/joint-oil-4k.png', price:1250, oldPrice:1600, tag:'100% Herbal', reviews:0, rating:0 },
  { id:'men-s-oil-79456908', slug:'men-s-oil-79456908', name:"Baba Hakeem Men's Vitality Oil", category:"Men's Wellness", image:'/products/mens-oil-new.png', price:1400, oldPrice:1800, tag:'Popular', reviews:0, rating:0 },
  { id:'herbal-phakki-8c2b96f2', slug:'herbal-phakki-8c2b96f2', name:'Baba Hakeem Herbal Phakki', category:'Digestion', image:'/products/phakii.png', price:1350, oldPrice:1700, tag:'Original Recipe', reviews:0, rating:0 },
  { id:'wedding-course-e0778723', slug:'wedding-course-e0778723', name:'Baba Hakeem Royal Wedding Course', category:'Wedding Course', image:'/products/wedding-course.webp.png', price:1500, oldPrice:2000, tag:'Royal Regimen', reviews:0, rating:0 },
];
const CATEGORIES = ['All Products', 'Hair Care', 'Joint Care', 'Digestion', "Men's Wellness", 'Wedding Course'];
const categoryFor = (product) => {
  const text = `${product.slug || ''} ${product.name || ''}`.toLowerCase();
  if (text.includes('hair')) return 'Hair Care';
  if (text.includes('joint')) return 'Joint Care';
  if (text.includes('men')) return "Men's Wellness";
  if (text.includes('wedding')) return 'Wedding Course';
  if (text.includes('phakki') || text.includes('phak')) return 'Digestion';
  return product.category || 'All Products';
};

export default function ShopCatalog() {
  const router = useRouter();
  const reviewSummaries = useReviewSummaries();
  const [products, setProducts] = useState(FALLBACK);
  const [category, setCategory] = useState('All Products');
  const [cartItems, setCartItems] = useCart();
  const addToCart = (product) => setCartItems((items) => {
    const existing = items.find((item) => item.id === product.id);
    return existing ? items.map((item) => item.id === product.id ? { ...item, quantity: Number(item.quantity || 0) + 1 } : item) : [...items, { ...product, quantity: 1 }];
  });
  const buyNow = (product) => {
    const nextItems = mergeCartItem(cartItems, product);
    persistCartItems(nextItems);
    setCartItems(nextItems);
    document.dispatchEvent(new Event('bh-route-start'));
    router.push('/checkout');
  };

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('category');
    if (CATEGORIES.includes(requested)) setCategory(requested);
    let active = true;
    fetch('/api/products').then((response) => response.ok ? response.json() : []).then((rows) => {
      if (!active || !Array.isArray(rows) || !rows.length) return;
      const mapped = rows.map((row) => {
        const fallback = FALLBACK.find((item) => item.id === row.id || item.slug === row.slug || item.name.toLowerCase() === String(row.name || '').toLowerCase());
        return {
          ...fallback,
          ...row,
          id: row.id || fallback?.id,
          slug: row.slug || fallback?.slug || row.id,
          name: row.name || fallback?.name || 'Herbal Product',
          image: row.image || row.image_url || fallback?.image || '/joint-oil-4k.png',
          price: Number(row.price ?? fallback?.price ?? 0),
          oldPrice: Number(row.old_price ?? row.compare_at_price ?? fallback?.oldPrice ?? 0),
          category: categoryFor({ ...row, category: fallback?.category }),
          tag: row.tag || fallback?.tag || 'Herbal Care',
          reviewSlug: row.slug || fallback?.slug || row.id,
          reviews: Number(reviewSummaries[row.slug || fallback?.slug || row.id]?.total || 0),
          rating: Number(reviewSummaries[row.slug || fallback?.slug || row.id]?.average || 0),
        };
      });
      if (mapped.length) setProducts(mapped);
    }).catch(() => {});
    return () => { active = false; };
  }, [reviewSummaries]);

  const visible = useMemo(() => category === 'All Products' ? products : products.filter((product) => categoryFor(product) === category), [category, products]);
  return <section className="bh-shop-catalog">
    <div className="bh-shop-tabs" role="tablist" aria-label="Filter products by category">
      {CATEGORIES.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
    </div>
    {visible.length ? <div className="bh-products-grid">{visible.map((product) => <article className="bh-product-card" key={product.id || product.slug}>
      <div className="bh-card-image-box">
        {product.oldPrice > product.price && <span className="bh-card-discount">-{Math.round((1 - product.price / product.oldPrice) * 100)}%</span>}
        {product.tag && <span className={`bh-card-tag${product.oldPrice > product.price ? ' bh-card-tag-shifted' : ''}`}>{product.tag}</span>}
        <Link href={`/products/${product.slug || product.id}`} style={{ display: 'block' }}><img src={product.image} alt={product.name} className="bh-card-img" loading="lazy" /></Link>
      </div>
      <div className="bh-card-body">
        {product.reviews > 0 && <div className="bh-card-rating"><StarRating rating={product.rating} size={13} color="#7ed957" /><span className="bh-card-rating-num">({product.reviews})</span></div>}
        <h3 className="bh-card-title"><Link href={`/products/${product.slug || product.id}`}>{product.name}</Link></h3>
        <div className="bh-card-price-row"><span className="bh-pricing">Rs. {Number(product.price || 0).toLocaleString('en-PK')}</span>{product.oldPrice > product.price && <span className="bh-pricing-old">Rs. {Number(product.oldPrice).toLocaleString('en-PK')}</span>}</div>
        <div className="bh-card-actions"><button type="button" className="btn-buy-now" onClick={() => buyNow(product)}>Buy Now</button><button type="button" className="btn-add-cart" onClick={() => addToCart(product)}>Add to Cart</button></div>
      </div>
    </article>)}</div> : <div className="bh-shop-empty"><h2>No products in this category yet</h2><button type="button" onClick={() => setCategory('All Products')}>View all products</button></div>}
  </section>;
}
