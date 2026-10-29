'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import useCart, { mergeCartItem, persistCartItems } from '../components/useCart';
import ProductCategorySection from '../components/ProductCategorySection';
import useReviewSummaries from '../components/useReviewSummaries';
import CommerceHeader from '../components/CommerceHeader';
import CommerceFooter from '../components/CommerceFooter';
import useStoreContactSettings, { buildWhatsAppUrl } from '../components/useStoreContactSettings';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import {
  WhatsAppIcon,
  CartIcon,
  TrashIcon,
  CloseIcon,
  StarRating,
  StarIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  SproutIcon,
  ApothecaryIcon,
  CheckIcon,
  FacebookIcon,
  InstagramIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon
} from '../components/Icons';

// ==========================================
// HERO SLIDER DATA (Baba Hakeem Banners 1 & 2)
// ==========================================
const HERO_SLIDES = [
  {
    id: 1,
    image: '/babahakeem-banner-1.png',
    mobileImage: '/mobile/mobile-banner-1.webp',
    alt: "Baba Hakeem Men's Vitality Oil",
    reviewSlug: 'men-s-oil-79456908',
    titlePre: 'A Traditional Ritual for',
    titleHighlight: "Men's Vitality",
    titlePost: 'Botanical Care, Made Simple',
    desc: "Discover Baba Hakeem Men's Vitality Oil, a traditional external-use blend made with saffron, nutmeg, and cold-pressed oils. Explore the product and its directions for use.",
    btnPrimaryText: "Shop Men's Oil",
    btnPrimaryHref: '/products/mens-oil',
    btnSecondaryText: 'Explore Products',
    btnSecondaryHref: '/shop'
  },
  {
    id: 2,
    image: '/babahakeem-banner-2.png',
    mobileImage: '/mobile/mobile-banner-2.webp',
    alt: 'Baba Hakeem Herbal Phakki',
    reviewSlug: 'herbal-phakki-8c2b96f2',
    titlePre: 'A Traditional Blend for',
    titleHighlight: 'Everyday Digestion',
    titlePost: 'Herbal Phakki by Baba Hakeem',
    desc: 'A traditional blend featuring ajwain, fennel, and other familiar herbs. Explore the ingredients and directions for use on the Herbal Phakki product page.',
    btnPrimaryText: 'Shop Herbal Phakki',
    btnPrimaryHref: '/products/herbal-phakki',
    btnSecondaryText: 'Explore Products',
    btnSecondaryHref: '/shop'
  }
];

// ==========================================
// USER PRODUCTS DATA (From user's local assets)
// ==========================================
const SIGNATURE_PRODUCTS = [
  {
    id: 'hair-oil',
    reviewSlug: 'hair-oil-e978fe07',
    name: 'Baba Hakeem Herbal Hair Oil',
    tag: 'Best Seller',
    rating: 0,
    reviews: 0,
    price: 2000,
    oldPrice: 2500,
    image: '/products/hair oil mockup png.png',
    description: 'Infused with amla, shikakai, and cold-pressed botanical oils to reverse hair thinning and restore shine.'
  },
  {
    id: 'joint-oil',
    reviewSlug: 'joint-oil-f188e5c3',
    name: 'Baba Hakeem Joint Oil',
    tag: '100% Herbal',
    rating: 0,
    reviews: 0,
    price: 1250,
    oldPrice: 1600,
    image: '/joint-oil-4k.png',
    description: 'Traditional deep-penetrating herbal massage oil for joint stiffness, knee discomfort, and muscles.'
  },
  {
    id: 'mens-oil',
    reviewSlug: 'men-s-oil-79456908',
    name: "Baba Hakeem Men's Vitality Oil",
    tag: 'Popular',
    rating: 0,
    reviews: 0,
    price: 1400,
    oldPrice: 1800,
    image: '/products/mens-oil-new.png',
    description: 'Pure cold-pressed vitality formulation prepared with classic eastern herbal extracts.'
  },
  {
    id: 'herbal-phakki',
    reviewSlug: 'herbal-phakki-8c2b96f2',
    name: 'Baba Hakeem Herbal Phakki',
    tag: 'Original Recipe',
    rating: 0,
    reviews: 0,
    price: 1350,
    oldPrice: 1700,
    image: '/products/phakii.png',
    description: 'Handcrafted digestive powder with ajwain, fennel, and black seed for daily gastrointestinal comfort.'
  },
  {
    id: 'wedding-course',
    reviewSlug: 'wedding-course-e0778723',
    name: 'Baba Hakeem Wedding Course',
    tag: 'Royal Regimen',
    rating: 0,
    reviews: 0,
    price: 1500,
    oldPrice: 2000,
    image: '/products/wedding-course.webp.png',
    description: 'A comprehensive rejuvenating herbal package for overall vigor, wellness, and radiance.'
  }
];

const FAQS = [
  {
    q: 'Are all Baba Hakeem products 100% natural and safe?',
    a: 'Yes, every Baba Hakeem formulation is prepared using pure botanical ingredients, wildcrafted mountain herbs, and unrefined cold-pressed seed oils. We strictly avoid steroids, artificial colors, synthetic fragrances, and harmful chemicals.'
  },
  {
    q: 'How do I choose the right product for my condition?',
    a: 'You can browse our product collection or message our herbal consultant on WhatsApp for personalized guidance.'
  },
  {
    q: 'How long does delivery take across Pakistan?',
    a: 'We deliver all over Pakistan within 2 to 4 business days. Major cities like Karachi, Lahore, and Islamabad often receive parcels within 48 hours with door-to-door tracking.'
  },
  {
    q: 'What payment options do you support?',
    a: 'We offer Cash on Delivery (COD) everywhere in Pakistan. We also accept instant bank transfers, JazzCash, and EasyPaisa for prepaid orders.'
  },
  {
    q: 'What is your satisfaction or return policy?',
    a: 'We stand behind the purity of our herbs. If you receive a damaged bottle or have an issue with your parcel, contact our support within 7 days for an immediate replacement or full refund.'
  }
];

function AutoCarousel({ items, renderItem, label, interval = 5000, desktopPerView = 3 }) {
  const [perView, setPerView] = useState(3);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const updatePerView = () => {
      const width = window.innerWidth;
      setPerView(width < 640 ? 1 : width < 1024 ? 2 : desktopPerView);
      setIndex(0);
    };
    updatePerView();
    window.addEventListener('resize', updatePerView);
    return () => window.removeEventListener('resize', updatePerView);
  }, [desktopPerView]);

  const visibleCount = Math.min(perView, items.length);
  const lastIndex = Math.max(0, items.length - visibleCount);

  useEffect(() => {
    if (lastIndex === 0) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => current >= lastIndex ? 0 : current + 1);
    }, interval);
    return () => window.clearInterval(timer);
  }, [interval, lastIndex]);

  if (!items.length) return null;

  const goTo = (nextIndex) => setIndex(Math.max(0, Math.min(lastIndex, nextIndex)));

  return (
    <div className="bh-carousel">
      <div className="bh-carousel-viewport" aria-label={label}>
        <div
          className="bh-carousel-track"
          style={{
            width: `${items.length * 100 / visibleCount}%`,
            transform: `translateX(-${index * 100 / items.length}%)`,
            '--carousel-count': items.length,
          }}
        >
          {items.map((item, itemIndex) => (
            <div className="bh-carousel-slide" key={item.id || item.slug || itemIndex}>
              {renderItem(item, itemIndex)}
            </div>
          ))}
        </div>
      </div>
      {lastIndex > 0 && (
        <div className="bh-carousel-controls" aria-label={`${label} navigation`}>
          <button type="button" onClick={() => goTo(index <= 0 ? lastIndex : index - 1)} aria-label={`Previous ${label}`}>
            <ArrowRightIcon size={16} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span>{String(index + 1).padStart(2, '0')} <i /> {String(lastIndex + 1).padStart(2, '0')}</span>
          <button type="button" onClick={() => goTo(index >= lastIndex ? 0 : index + 1)} aria-label={`Next ${label}`}>
            <ArrowRightIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const reviewSummaries = useReviewSummaries();
  const contact = useStoreContactSettings();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useCart();
  const [openFaq, setOpenFaq] = useState(0);

  // Featured products from the database (admin "FEATURE THIS PRODUCT" flag)
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredPerView, setFeaturedPerView] = useState(3);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [customerReels, setCustomerReels] = useState([]);
  const [latestReviews, setLatestReviews] = useState([]);
  const [activeReel, setActiveReel] = useState(null);

  useEffect(() => {
    let live = true;
    fetch('/api/reviews/latest')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => { if (live && result?.items) setLatestReviews(result.items); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    let live = true;
    fetch('/api/blogs?limit=6')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => { if (live && result?.blogs) setLatestBlogs(result.blogs); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!activeReel) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setActiveReel(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [activeReel]);

  useEffect(() => {
    let live = true;
    fetch('/api/testimonials')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => { if (live && result?.testimonials) setCustomerReels(result.testimonials); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id,slug,name,image,price,regular_price,sell_price,featured,stock_status')
          .eq('status', 'Published')
          .eq('featured', true)
          .order('sort_order', { ascending: true });
        if (!mounted || error || !data?.length) return;
        setFeaturedProducts(data.map((p) => ({
          id: p.slug || p.id,
          reviewSlug: p.slug || p.id,
          name: p.name,
          image: p.image,
          tag: 'Featured',
          rating: 0,
          reviews: 0,
          price: Number(p.sell_price) > 0 ? Number(p.sell_price) : Number(String(p.price || '').replace(/[^0-9.]/g, '')) || 0,
          oldPrice: Number(p.regular_price) > 0 ? Number(p.regular_price) : null,
        })));
      } catch { /* keep fallback */ }
    };
    loadFeatured();
    return () => { mounted = false; };
  }, []);

  // Responsive cards-per-view for the featured slider
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setFeaturedPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const featured = featuredProducts.length ? featuredProducts : SIGNATURE_PRODUCTS.slice(0, 3);
  const featuredMaxIndex = Math.max(0, featured.length - featuredPerView);
  const featuredClamped = Math.min(featuredIndex, featuredMaxIndex);
  const featuredShowArrows = featured.length > featuredPerView;

  const featuredPrev = useCallback(() => setFeaturedIndex(i => Math.max(0, Math.min(i, featuredMaxIndex) - 1)), [featuredMaxIndex]);
  const featuredNext = useCallback(() => setFeaturedIndex(i => Math.min(Math.max(0, Math.min(i, featuredMaxIndex)) + 1, featuredMaxIndex)), [featuredMaxIndex]);


  // Hero banner slider state & auto-advance timer
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isSliderPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000); // 6 seconds auto-transition, resets on manual change
    return () => clearInterval(timer);
  }, [isSliderPaused, currentSlide]);

  // Cart operations
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const buyNow = (product) => {
    const nextItems = mergeCartItem(cartItems, product);
    persistCartItems(nextItems);
    setCartItems(nextItems);
    document.dispatchEvent(new Event('bh-route-start'));
    router.push('/checkout');
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartWhatsAppMessage = [
    'Salam Baba Hakeem, I would like to place this order:',
    ...cartItems.map((item, index) => `${index + 1}. ${item.name} | Qty: ${item.quantity} | Rs. ${item.price * item.quantity}`),
    `Total: Rs. ${cartTotal}`,
    'Payment method: Cash on Delivery. Please confirm my order.',
  ].join('\n');

  return (
    <main>
      <CommerceHeader onCartClick={() => setCartOpen(true)} />

      {/* ----------------------------------------------------
          HERO BANNER SLIDER (Exact clone + Timer + Animations)
          Supports Slide 1 ("babahakeem-banner-1.png") & Slide 2 ("babahakeem-banner-2.png")
          ---------------------------------------------------- */}
      <section
        className="bh-hero"
        data-current-slide={currentSlide}
        aria-label="Hero Banner Slider"
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
      >
        {/* Render both background slide images with smooth crossfade & gentle Ken Burns effect */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`bh-hero-slide-bg ${index === currentSlide ? 'is-active' : ''}`}
            aria-hidden={index !== currentSlide}
          >
            <picture className="bh-hero-picture">
              <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority
                sizes="100vw"
                className="bh-hero-bg-media"
              />
            </picture>
          </div>
        ))}

        {/* Ambient Dark Green Scrim Gradient for Crystal-Clear Text Contrast */}
        <div className="bh-hero-scrim" />

        {/* Main Banner Content (Re-triggers staggered smooth animations on slide switch) */}
        <div className="bh-hero-container">
          <div key={currentSlide} className="bh-hero-inner bh-hero-animated">
            {/* 5-Star Social Proof Rating */}
            {Number(reviewSummaries[HERO_SLIDES[currentSlide].reviewSlug]?.total || 0) > 0 && <div className="bh-hero-rating-wrap">
              <div className="bh-hero-rating-stars"><StarRating rating={reviewSummaries[HERO_SLIDES[currentSlide].reviewSlug].average} size={19} color="#f59e0b" /></div>
              <p className="bh-hero-rating-text">{reviewSummaries[HERO_SLIDES[currentSlide].reviewSlug].average}/5 based on {reviewSummaries[HERO_SLIDES[currentSlide].reviewSlug].total} reviews</p>
            </div>}

            {/* Exact Headline matching Reference Image */}
            <h1 className="bh-hero-title">
              {HERO_SLIDES[currentSlide].titlePre} <br />
              <span className="bh-hero-title-highlight">{HERO_SLIDES[currentSlide].titleHighlight}</span> <br />
              {HERO_SLIDES[currentSlide].titlePost}
            </h1>

            {/* Exact Subtitle matching Reference Image */}
            <p className="bh-hero-desc">
              {HERO_SLIDES[currentSlide].desc}
            </p>

            {/* Exact Dual Pill CTA Buttons matching Reference Image */}
            <div className="bh-hero-cta-group">
              <a href={HERO_SLIDES[currentSlide].btnPrimaryHref} className="bh-btn-shop-now">
                {HERO_SLIDES[currentSlide].btnPrimaryText}
              </a>
              <a href={HERO_SLIDES[currentSlide].btnSecondaryHref} className="bh-btn-shop-bundles">
                {HERO_SLIDES[currentSlide].btnSecondaryText}
              </a>
            </div>
          </div>
        </div>

        {/* Slider Navigation Arrow Left (Prev) - positioned on top with type="button" */}
        <button
          type="button"
          className="bh-hero-slider-arrow bh-hero-slider-arrow-prev"
          aria-label="Previous Slide"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Slider Navigation Arrow Right (Next) - positioned on top with type="button" */}
        <button
          type="button"
          className="bh-hero-slider-arrow bh-hero-slider-arrow-next"
          aria-label="Next Slide"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* Elegant Slider Pagination with Timer Progress Bar */}
        <div className="bh-hero-pagination" aria-label="Slider Pagination">
          {HERO_SLIDES.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              className={`bh-hero-dot ${index === currentSlide ? 'is-active' : ''}`}
              aria-label={`Go to slide ${index + 1}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentSlide(index);
              }}
            >
              <span className="bh-hero-dot-bar">
                {index === currentSlide && (
                  <span key={`progress-${currentSlide}-${isSliderPaused}`} className="bh-hero-dot-fill" />
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------
          SLIDER / MARQUEE UNDER HERO SECTION (User exact fonts)
          ---------------------------------------------------- */}
      <section className="bh-marquee-bar" aria-label="Brand Features Marquee">
        <div className="bh-marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {[
                '100% Pure Organic & Herbal',
                'Cash on Delivery All Over Pakistan',
                'Pure Cold-Pressed Botanical Extracts',
                '15,000+ Satisfied Customers',
                '100% Money Back Satisfaction Guarantee',
              ].map((text, i) => (
                <span key={i} className="bh-marquee-item">
                  <span className="bh-marquee-check">
                    <CheckIcon size={11} color="#ffffff" />
                  </span>
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------
          FEATURED PRODUCTS SLIDER (admin "featured" flag)
          ---------------------------------------------------- */}
      <section id="featured" className="bh-section bh-featured-section" style={{ backgroundColor: '#F9F6F1' }}>
        <div className="bh-container">
          <div className="bh-section-header">
            <span className="bh-eyebrow">Featured</span>
            <h2 className="bh-heading">Featured Products</h2>
          </div>

          <div className="bh-featured-slider">
            {featuredShowArrows && (
              <>
                <button
                  className={`bh-featured-arrow bh-featured-prev ${featuredClamped === 0 ? 'is-disabled' : ''}`}
                  onClick={featuredPrev}
                  disabled={featuredClamped === 0}
                  aria-label="Previous products"
                >
                  <ArrowRightIcon size={16} style={{ transform: 'rotate(180deg)' }} />
                </button>
                <button
                  className={`bh-featured-arrow bh-featured-next ${featuredClamped >= featuredMaxIndex ? 'is-disabled' : ''}`}
                  onClick={featuredNext}
                  disabled={featuredClamped >= featuredMaxIndex}
                  aria-label="Next products"
                >
                  <ArrowRightIcon size={16} />
                </button>
              </>
            )}
            <div className="bh-featured-viewport">
              <div
                className="bh-featured-track"
                style={{
                  transform: `translateX(-${featuredClamped * (100 / featuredPerView)}%)`,
                  '--bh-featured-per-view': featuredPerView,
                }}
              >
                {featured.map((prod) => (
                  <div key={prod.id} className="bh-featured-slide">
                    <div className="bh-product-card">
                      <div className="bh-card-image-box">
                        {prod.oldPrice && prod.oldPrice > prod.price && (
                          <span className="bh-card-discount">-{Math.round((1 - prod.price / prod.oldPrice) * 100)}%</span>
                        )}
                        <span className={`bh-card-tag${prod.oldPrice && prod.oldPrice > prod.price ? ' bh-card-tag-shifted' : ''}`}>Featured</span>
                        <Link href={`/products/${prod.id}`} style={{ display: 'block' }}>
                          <img src={prod.image} alt={prod.name} className="bh-card-img" />
                        </Link>
                      </div>
                      <div className="bh-card-body">
                        <div className="bh-card-rating">
                          {Number(reviewSummaries[prod.reviewSlug || prod.id]?.total || 0) > 0 && <>
                            <StarRating rating={reviewSummaries[prod.reviewSlug || prod.id].average} size={13} color="#7ed957" />
                            <span className="bh-card-rating-num">({reviewSummaries[prod.reviewSlug || prod.id].total})</span>
                          </>}
                        </div>
                        <h3 className="bh-card-title">
                          <Link href={`/products/${prod.id}`}>{prod.name}</Link>
                        </h3>
                        <div className="bh-card-price-row">
                          <span className="bh-pricing">Rs. {prod.price.toLocaleString()}</span>
                          {prod.oldPrice && prod.oldPrice > prod.price && (
                            <span className="bh-pricing-old">Rs. {prod.oldPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="bh-card-actions">
                          <button type="button" onClick={() => buyNow(prod)} className="btn-buy-now">Buy Now</button>
                          <button className="btn-add-cart" onClick={() => addToCart(prod)}>Add To Cart</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductCategorySection />

      {/* ----------------------------------------------------
          SECTION 1: OUR SIGNATURE COLLECTION
          ---------------------------------------------------- */}
      <section id="signature" className="bh-section">
        <div className="bh-container">
          <div className="bh-section-header">
            <span className="bh-eyebrow">All Products</span>
            <h2 className="bh-heading">Discover All Products</h2>
          </div>

          <div className="bh-products-grid">
            {SIGNATURE_PRODUCTS.map((prod) => (
              <div key={prod.id} className="bh-product-card">
                {/* Image & Badges */}
                <div className="bh-card-image-box">
                  {prod.oldPrice && prod.oldPrice > prod.price && (
                    <span className="bh-card-discount">-{Math.round((1 - prod.price / prod.oldPrice) * 100)}%</span>
                  )}
                  {prod.tag && <span className={`bh-card-tag${prod.oldPrice && prod.oldPrice > prod.price ? ' bh-card-tag-shifted' : ''}`}>{prod.tag}</span>}
                  <Link href={`/products/${prod.id}`} style={{ display: 'block' }}>
                    <img src={prod.image} alt={prod.name} className="bh-card-img" />
                  </Link>
                </div>

                {/* Card Content */}
                <div className="bh-card-body">
                  <div className="bh-card-rating">
                    {Number(reviewSummaries[prod.reviewSlug]?.total || 0) > 0 && <>
                      <StarRating rating={reviewSummaries[prod.reviewSlug].average} size={13} color="#7ed957" />
                      <span className="bh-card-rating-num">({reviewSummaries[prod.reviewSlug].total})</span>
                    </>}
                  </div>

                  <h3 className="bh-card-title">
                    <Link href={`/products/${prod.id}`}>{prod.name}</Link>
                  </h3>

                  <div className="bh-card-price-row">
                    <span className="bh-pricing">Rs. {prod.price.toLocaleString()}</span>
                    {prod.oldPrice && (
                      <span className="bh-pricing-old">Rs. {prod.oldPrice.toLocaleString()}</span>
                    )}
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="bh-card-actions">
                    <button type="button" onClick={() => buyNow(prod)} className="btn-buy-now">
                      Buy Now
                    </button>
                    <button
                      className="btn-add-cart"
                      onClick={() => addToCart(prod)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <a href="#signature" className="btn-view-all">
              View All Products
            </a>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          OUR MISSION
          ---------------------------------------------------- */}
      <section id="mission" className="bh-section bh-mission-section">
        <div className="bh-container bh-mission-grid">
          <div className="bh-mission-copy">
            <span className="bh-eyebrow">What Guides Us</span>
            <h2 className="bh-heading">Our Mission</h2>
            <p className="bh-mission-lead">
              To make thoughtful herbal care part of everyday life.
            </p>
            <p className="bh-normal-text">
              Baba Hakeem brings time-honored botanical traditions into clear, considered formulas
              for modern routines. We believe care should begin with respect for nature, honest
              ingredients, and guidance people can understand.
            </p>
            <div className="bh-mission-values">
              <div><span>01</span><p><strong>Rooted in tradition</strong>Inspired by generations of herbal knowledge.</p></div>
              <div><span>02</span><p><strong>Made with care</strong>Thoughtful blends for simple daily rituals.</p></div>
              <div><span>03</span><p><strong>Clear by nature</strong>Honest information to help you choose well.</p></div>
            </div>
          </div>
          <div className="bh-mission-visual" aria-label="Herbal care and botanical ingredients">
            <img className="bh-mission-image-main" src="/mission/mission-range.webp" alt="Baba Hakeem herbal products presented with natural ingredients" />
            <img className="bh-mission-image-detail" src="/mission/mission-products.webp" alt="Baba Hakeem herbal oils and botanical ingredients" />
            <div className="bh-mission-caption"><span>Nature, tradition, and everyday care</span></div>
          </div>
        </div>
      </section>

      {/* Customer video testimonials */}
      {customerReels.length > 0 && <section id="video-testimonials" className="bh-section bh-video-testimonials">
        <div className="bh-container">
          <div className="bh-section-header">
            <span className="bh-eyebrow">Real Results</span>
            <h2 className="bh-heading">Trusted By Real Customers</h2>
          </div>

          <div className="bh-reels-grid">
            {customerReels.map((reel) => (
              <button key={reel.id} type="button" className="bh-reel-card" onClick={() => setActiveReel(reel)} aria-label={`Play video testimonial from ${reel.customer_name}`}>
                <video className="bh-reel-video" src={reel.video_url} poster={reel.poster_url || undefined} autoPlay muted loop playsInline preload="metadata" aria-label={`Video testimonial from ${reel.customer_name}`} />
                <div className="bh-reel-overlay">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        background: 'rgba(7,42,6,0.8)',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        color: '#7ed957'
                      }}
                    >
                      Customer video
                    </span>
                    {reel.product_name && <span style={{ fontSize: '11px', opacity: 0.9 }}>{reel.product_name}</span>}
                  </div>

                  <div className="bh-play-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PlayIcon size={18} color="#ffffff" />
                  </div>

                  <div className="bh-reel-info">
                    <div className="bh-reel-author">
                      <span>{reel.customer_name}{reel.location ? ` (${reel.location})` : ''}</span>
                    </div>
                    <p className="bh-reel-quote">{reel.quote}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>}

      {/* ----------------------------------------------------
          ABOUT US
          ---------------------------------------------------- */}
      <section id="story" className="bh-section bh-story-section">
        <div className="bh-container bh-story-grid">
          <div>
            <span className="bh-eyebrow">About Us</span>
            <h2 className="bh-story-heading">Story Behind Baba Hakeem</h2>
            <p className="bh-normal-text" style={{ marginBottom: '16px' }}>
              At Baba Hakeem, we believe in the timeless restorative power of pure organic nature.
              Rooted in centuries-old eastern herbal wisdom, our formulations are handcrafted from
              wildcrafted seeds, roots, and pure botanical essences harvested across Pakistan.
            </p>
            <p className="bh-normal-text">
              We reject modern shortcuts. You will never find cheap fillers, steroids, mineral oils,
              or artificial perfumes in any Baba Hakeem bottle. Every blend is cold-pressed to preserve
              maximum active biological potency so that your body experiences genuine, enduring vitality.
            </p>
          </div>
          <div className="bh-story-image-wrap">
            <img src="/about-us.webp" alt="Baba Hakeem herbal products displayed with botanical ingredients" />
          </div>
        </div>
      </section>

      {activeReel && (
        <div className="bh-reel-modal" role="presentation" onClick={() => setActiveReel(null)}>
          <div className="bh-reel-modal-panel" role="dialog" aria-modal="true" aria-label={`Video testimonial from ${activeReel.customer_name}`} onClick={(event) => event.stopPropagation()}>
            <button className="bh-reel-modal-close" type="button" onClick={() => setActiveReel(null)} aria-label="Close video">
              <CloseIcon size={22} />
            </button>
            <video
              key={activeReel.id}
              className="bh-reel-modal-video"
              src={activeReel.video_url}
              poster={activeReel.poster_url || undefined}
              autoPlay
              controls
              playsInline
              preload="auto"
              aria-label={`Video testimonial from ${activeReel.customer_name}`}
            />
            <div className="bh-reel-modal-caption">
              <strong>{activeReel.customer_name}{activeReel.location ? ` · ${activeReel.location}` : ''}</strong>
              {activeReel.product_name && <span>{activeReel.product_name}</span>}
              {activeReel.quote && <p>{activeReel.quote}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          SECTION 6: WHAT OUR CLIENTS SAY (REVIEWS)
          ---------------------------------------------------- */}
      {latestReviews.length > 0 && <section id="reviews" className="bh-section" style={{ backgroundColor: '#F9F6F1' }}>
        <div className="bh-container">
          <div className="bh-section-header">
            <span className="bh-eyebrow">Client Feedback</span>
            <h2 className="bh-heading">What Our Clients Say</h2>
          </div>

          <AutoCarousel
            items={latestReviews}
            label="Customer reviews"
            interval={4500}
            desktopPerView={2}
            renderItem={(rev) => (
              <div className="bh-review-card">
                <div className="bh-review-stars">
                  <StarRating rating={Number(rev.rating)} size={15} color="#7ed957" />
                </div>
                {rev.title && <h4 className="bh-review-title">{rev.title}</h4>}
                <p className="bh-review-text">“{rev.body}”</p>
                <div className="bh-review-author-row">
                  <div className="bh-review-avatar">{String(rev.reviewer_name || '?')[0]}</div>
                  <div>
                    <strong style={{ fontSize: '14px', display: 'block', color: '#072a06' }}>
                      {rev.reviewer_name}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#535050' }}>{rev.product_name}</span>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </section>}

      {/* ----------------------------------------------------
          FROM OUR BLOGS
          ---------------------------------------------------- */}
      <section id="blogs" className="bh-section" style={{ backgroundColor: '#F9F6F1' }}>
        <div className="bh-container">
          <div className="bh-section-header">
            <span className="bh-eyebrow">Wellness Journal</span>
            <h2 className="bh-heading">From Our Blogs</h2>
          </div>

          <AutoCarousel
            items={latestBlogs.slice(0, 6)}
            label="Latest blog articles"
            interval={5500}
            renderItem={(blog) => (
              <article key={blog.slug} className="bh-blog-card">
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="bh-blog-image"
                />
                <div className="bh-blog-body">
                  <span className="bh-blog-tag">{blog.category}</span>
                  <span style={{ fontSize: '12px', color: '#535050', float: 'right' }}>
                    {new Date(blog.published_at || blog.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <h3 className="bh-blog-title">{blog.title}</h3>
                  <p className="bh-blog-excerpt">{blog.excerpt}</p>
                  <Link href={`/blog/${blog.slug}`} className="bh-blog-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Read Article <ArrowRightIcon size={14} />
                  </Link>
                </div>
              </article>
            )}
          />
          {!latestBlogs.length && <p className="bh-blog-excerpt">New articles are coming soon. <Link href="/blog">Visit the wellness journal.</Link></p>}
          <div className="bh-blog-all-link">
            <Link href="/blog" className="btn-view-all">View All Blogs <ArrowRightIcon size={15} /></Link>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
          FREQUENTLY ASKED QUESTIONS — LAST HOMEPAGE SECTION
          ---------------------------------------------------- */}
      <section id="faqs" className="bh-section">
        <div className="bh-container bh-faq-grid">
          <div className="bh-faq-image-box">
            <img src="/faqs.webp" alt="A customer exploring Baba Hakeem herbal products and asking questions" />
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', background: 'rgba(7,42,6,0.92)', backdropFilter: 'blur(8px)', padding: '20px', borderRadius: '16px', color: '#ffffff' }}>
              <h4 className="bh-h3" style={{ color: '#ffffff', fontSize: '20px', marginBottom: '6px' }}>Need Help?</h4>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '12px' }}>
                Get in touch with us for help with products, orders, or general questions.
              </p>
              {contact.whatsapp_number && <a href={buildWhatsAppUrl(contact.whatsapp_number)} target="_blank" rel="noreferrer" style={{ color: '#7ed957', fontWeight: 600, fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                Contact us on WhatsApp <ArrowRightIcon size={14} />
              </a>}
            </div>
          </div>

          <div>
            <span className="bh-eyebrow">Have Questions?</span>
            <h2 className="bh-heading" style={{ marginBottom: '28px' }}>Frequently Asked Questions</h2>
            {FAQS.map((faq, i) => (
              <div key={i} className="bh-accordion-item">
                <button className="bh-accordion-header" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span>{faq.q}</span>
                  <span>{openFaq === i ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}</span>
                </button>
                {openFaq === i && <div className="bh-accordion-body">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CommerceFooter />

      {/* ----------------------------------------------------
          INTERACTIVE SLIDE-IN CART DRAWER
          ---------------------------------------------------- */}
      <div
        className={`bh-cart-overlay ${cartOpen ? 'open' : ''}`}
        onClick={() => setCartOpen(false)}
      />
      <aside className={`bh-cart-drawer ${cartOpen ? 'open' : ''}`} aria-label="Shopping Cart">
        <div className="bh-cart-header">
          <div className="bh-cart-heading"><h3>Your Cart</h3><span>{cartCount}</span></div>
          <button
            className="bh-cart-close"
            onClick={() => setCartOpen(false)}
            style={{ fontSize: '18px', color: '#072a06', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Close Cart"
          >
            <CloseIcon size={20} color="#072a06" />
          </button>
        </div>

        <div className="bh-cart-items-list">
          {cartItems.length === 0 ? (
            <div className="bh-cart-empty">
              <div><CartIcon size={38} color="#9aa595" /></div>
              <p>Your cart is empty.</p>
              <button
                className="bh-cart-continue"
                onClick={() => setCartOpen(false)}
              >
                Explore Products
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bh-cart-item">
                <img
                  src={item.image}
                  alt={item.name}
                  className="bh-cart-item__image"
                />
                <div className="bh-cart-item__details">
                  <h4>{item.name}</h4>
                  <div className="bh-cart-item__meta">
                    <span>Rs. {Number(item.price).toLocaleString()}</span>
                    <div className="bh-cart-quantity" aria-label={`Quantity ${item.quantity}`}>
                      <button type="button" onClick={() => updateQuantity(item.id, -1)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)} aria-label={`Increase ${item.name} quantity`}>+</button>
                    </div>
                  </div>
                </div>
                <button
                  className="bh-cart-remove"
                  onClick={() => updateQuantity(item.id, -item.quantity)}
                  title="Remove item"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <TrashIcon size={18} color="#e53e3e" />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="bh-cart-footer">
            <div className="bh-cart-subtotal">
              <span>Subtotal:</span>
              <span>
                Rs. {cartTotal.toLocaleString()}
              </span>
            </div>

            {contact.whatsapp_number && <a
              href={buildWhatsAppUrl(contact.whatsapp_number, cartWhatsAppMessage)}
              target="_blank"
              rel="noreferrer"
              className="bh-cart-whatsapp-btn"
            >
              Order on WhatsApp (Fast Checkout) <WhatsAppIcon size={18} color="#ffffff" />
            </a>}

            <button
              className="bh-cart-cod-btn"
              onClick={() => {
                setCartOpen(false);
                document.dispatchEvent(new Event('bh-route-start'));
                router.push('/checkout');
              }}
            >
              Cash on Delivery Checkout <ArrowRightIcon size={16} />
            </button>
            <Link href="/cart" className="bh-cart-view-page">View full cart</Link>
          </div>
        )}
      </aside>
    </main>
  );
}

