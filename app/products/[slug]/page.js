'use client';

import { useState, useEffect, useRef } from 'react';
import useCart, { mergeCartItem, persistCartItems } from '../../../components/useCart';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getDeliveryTimeline } from '../../../lib/deliveryTimeline.mjs';
import ProductWellnessJourney from '../../../components/ProductWellnessJourney';
import ProductHowToUse from '../../../components/ProductHowToUse';
import ProductReviews from '../../../components/ProductReviews';
import useReviewSummaries from '../../../components/useReviewSummaries';
import ProductFaqs from '../../../components/ProductFaqs';
import CommerceHeader from '../../../components/CommerceHeader';
import CommerceFooter from '../../../components/CommerceFooter';
import useStoreContactSettings, { buildWhatsAppUrl } from '../../../components/useStoreContactSettings';
import {
  LeafIcon,
  WhatsAppIcon,
  CartIcon,
  TrashIcon,
  CloseIcon,
  StarRating,
  StarIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  BoxIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '../../../components/Icons';

// ==========================================
// MASTER PRODUCTS CATALOGUE (From User Assets & DB)
// ==========================================
const ALL_PRODUCTS = [
  {
    id: 'hair-oil-e978fe07',
    slug: 'hair-oil-e978fe07',
    shortSlug: 'hair-oil',
    name: 'Baba Hakeem Herbal Hair Oil',
    tag: 'Best Seller',
    rating: 0,
    reviews: 0,
    price: 2000,
    oldPrice: 2500,
    image: '/products/hair oil mockup png.png',
    secondaryImages: [
      '/products/hair oil mockup png.png',
      '/products/hair-oil-migrated.png',
      '/products/hair oil mockupM.jpg'
    ],
    shortDesc: 'A powerful restorative cold-pressed herbal blend infused with pure amla, shikakai, bhringraj, and unrefined sweet almond oil to reverse hair fall, nourish deep roots, and stimulate rapid healthy hair regrowth.',
    overview: 'Baba Hakeem Herbal Hair Oil is prepared according to traditional eastern apothecary formulations. We steep medicinal herbs in cold-pressed base oils without artificial heat to retain bioactive micronutrients. It cools the scalp, relieves stress-induced shedding, and strengthens hair strands from the cuticle outwards.',
    usage: 'Warm a generous amount between your palms and gently massage into the scalp using circular motions for 5 to 10 minutes. Leave it on for at least 2 hours or overnight before rinsing with a mild sulfate-free shampoo. Use 3 to 4 times weekly for optimal results.',
    ingredients: 'Pure Cold-Pressed Almond Oil, Sesame Seed Oil, Amla (Indian Gooseberry), Reetha, Shikakai, Bhringraj, Fenugreek Seed Extract, Rosemary Essence, Black Seed Oil (Kalonji).',
    howToUse: [
      { title: 'Prepare your scalp', description: 'Start with a dry scalp and section the hair for easy application.' },
      { title: 'Warm the oil', description: 'Warm a generous amount between your palms before applying.' },
      { title: 'Massage gently', description: 'Massage into the scalp in circular motions for 5 to 10 minutes.' },
      { title: 'Leave, then rinse', description: 'Leave for at least 2 hours or overnight, then wash with a mild shampoo. Use 3 to 4 times a week.' },
    ],

  },
  {
    id: 'joint-oil-f188e5c3',
    slug: 'joint-oil-f188e5c3',
    shortSlug: 'joint-oil',
    name: 'Baba Hakeem Joint Oil',
    tag: '100% Herbal',
    rating: 0,
    reviews: 0,
    price: 1250,
    oldPrice: 1600,
    image: '/joint-oil-4k.png',
    secondaryImages: [
      '/joint-oil-4k.png',
      '/products/joint oil mockupM.jpg',
      '/products/joint oil png.jpg'
    ],
    shortDesc: 'Handcrafted fast-penetrating herbal massage oil formulated with wintergreen, natural camphor, and Himalayan herbs to soothe acute knee aches, joint stiffness, arthritis discomfort, and muscular tension.',
    overview: 'Formulated specifically for elders and active adults experiencing restricted movement or chronic joint pain. Baba Hakeem Joint Oil stimulates localized microcirculation, warms stiff ligaments, and assists natural joint lubrication without greasy synthetic residues.',
    usage: 'Apply 8 to 10 drops directly onto the affected joint or muscular area. Massage gently in clockwise circular strokes until completely absorbed. Cover with a warm flannel cloth for enhanced penetration. Use twice daily, morning and bedtime.',
    ingredients: 'Wintergreen Oil (Gaultheria), Natural Camphor, Nilgiri (Eucalyptus), Clove Bud Oil, Pure Mustard Seed Extract, Himalayan Cedarwood Oil, Garlic Seed Extract.',
    howToUse: [
      { title: 'Choose the area', description: 'Apply only to the external skin over the area you want to massage.' },
      { title: 'Measure a few drops', description: 'Apply 8 to 10 drops directly to the skin.' },
      { title: 'Massage lightly', description: 'Massage gently in circular motions until the oil is absorbed.' },
      { title: 'Repeat your routine', description: 'For the warm-cloth ritual, cover the area with a warm flannel. Use twice daily as directed.' },
    ],

  },
  {
    id: 'men-s-oil-79456908',
    slug: 'men-s-oil-79456908',
    shortSlug: 'mens-oil',
    name: "Baba Hakeem Men's Vitality Oil",
    tag: 'Popular',
    rating: 0,
    reviews: 0,
    price: 1400,
    oldPrice: 1800,
    image: '/products/mens-oil-new.png',
    secondaryImages: [
      '/products/mens-oil-new.png',
      "/products/men's oil 10 ml label M png.png",
      "/products/men's oil 10 ml label MM.jpg"
    ],
    shortDesc: 'A revered eastern botanical personal care formulation prepared with saffron, nutmeg, and potent cold-pressed seeds to invigorate daily vigor, stamina, and healthy natural circulation.',
    overview: "Crafted strictly from unadulterated botanical essences. Baba Hakeem Men's Oil is free of chemical accelerants, hormones, or synthetic fragrances, providing wholesome revitalizing nourishment through regular therapeutic massage.",
    usage: 'Dispense 5 to 7 drops into clean palms. Massage gently into target areas for 3 to 5 minutes until fully absorbed. Best applied in the evening before sleeping.',
    ingredients: 'Zafran (Pure Saffron), Jaiphal (Nutmeg), Javitri, Sesame Seed Oil, Ashwagandha Root Extract, Pure Kalonji Oil.',
    howToUse: [
      { title: 'Prepare', description: 'Clean and dry the area before applying.' },
      { title: 'Use a few drops', description: 'Dispense 5 to 7 drops into clean palms.' },
      { title: 'Massage gently', description: 'Apply externally and massage for 3 to 5 minutes.' },
      { title: 'Make it a ritual', description: 'Use in the evening as directed on the product label.' },
    ],

  },
  {
    id: 'herbal-phakki-8c2b96f2',
    slug: 'herbal-phakki-8c2b96f2',
    shortSlug: 'herbal-phakki',
    name: 'Baba Hakeem Herbal Phakki',
    tag: 'Original Recipe',
    rating: 0,
    reviews: 0,
    price: 1350,
    oldPrice: 1700,
    image: '/products/phakii.png',
    secondaryImages: [
      '/products/phakii.png',
      '/products/phakkkki.png',
      '/products/phakki-07.jpg'
    ],
    shortDesc: 'Traditional blended herbal powder combining ajwain, fennel, black salt, and digestive carminatives to eliminate persistent bloating, indigestion, acid reflux, and heavy stomach discomfort.',
    overview: 'A time-tested home staple across Pakistan. Prepared by traditional sun-drying and fine stone-grinding of digestive seeds, this phakki stimulates healthy gastric enzyme secretion without irritating stomach lining or causing habituation.',
    usage: 'Take half a teaspoon (approx. 2g) with lukewarm water or green tea after meals. For severe gas or heaviness, can be taken immediately for fast relief.',
    ingredients: 'Ajwain (Carom Seeds), Saunf (Fennel Seeds), Kala Namak (Black Himalayan Salt), Sonth (Dry Ginger), Zeera (Cumin), Podina (Mint Leaf Extract).',
    howToUse: [
      { title: 'Check the label', description: 'Review the packaging directions and ingredients before use.' },
      { title: 'Measure a serving', description: 'Use half a teaspoon, following the product directions.' },
      { title: 'Mix and take', description: 'Take with lukewarm water or green tea after a meal.' },
      { title: 'Keep a steady routine', description: 'Use as directed on the package. Do not exceed the recommended serving.' },
    ],

  },
  {
    id: 'wedding-course-e0778723',
    slug: 'wedding-course-e0778723',
    shortSlug: 'wedding-course',
    name: 'Baba Hakeem Royal Wedding Course',
    tag: 'Royal Regimen',
    rating: 0,
    reviews: 0,
    price: 1500,
    oldPrice: 2000,
    image: '/products/wedding-course.webp.png',
    secondaryImages: [
      '/products/wedding-course.webp.png',
      '/products/package design.jpg',
      '/verdura-reference.webp.png'
    ],
    shortDesc: 'A premier handcrafted royal herbal collection prepared for comprehensive whole-body revitalization, internal vigor, mental clarity, and youthful natural radiance.',
    overview: 'The Wedding Course is Baba Hakeem’s flagship traditional gift regimen. Blending precious adaptogens, rare roots, and unrefined cold-pressed oils, it restores exhausted energy reserves and supports total physical vitality.',
    usage: 'Includes detailed instruction booklet inside the pack. Consume recommended morning herbal blend with warm milk or honey water as indicated.',
    ingredients: 'Salajit (Purified Shilajit), Safed Musli, Ashwagandha, Salab Misri, Zafran, Pure Floral Honey, Cold-Pressed Almond Oil.',
    howToUse: [
      { title: 'Read the booklet', description: 'Review the instructions included with the course before beginning.' },
      { title: 'Check the serving', description: 'Use the serving size specified in the included instructions.' },
      { title: 'Follow the method', description: 'Prepare and take each item as described in its instructions.' },
      { title: 'Stay with the guidance', description: 'Follow the included schedule and do not exceed the stated serving.' },
    ],

  }
];

// Journey content is keyed by immutable product IDs so product title edits do not detach it.
const PRODUCT_JOURNEYS = {
  'hair-oil-e978fe07': {
      eyebrow: '4-WEEK HAIR CARE JOURNEY',
      title: 'Your Journey with Baba Hakeem Herbal Hair Oil',
      variant: 'hair',
      milestones: [
        { label: 'Start', art: 'hairBottle', text: 'A nourishing herbal oil crafted for scalp and hair care.' },
        { label: '1st Week', art: 'hairScalp', text: 'Helps moisturize the scalp and ease dryness with regular use.' },
        { label: '2nd Week', art: 'hairRoots', text: 'Supports stronger-looking roots and a healthy hair appearance.' },
        { label: '3rd Week', art: 'hairShine', text: 'Hair can feel smoother, shinier, and naturally revitalized.' },
      ],
      closingTitle: 'A Natural Herbal Hair Care Companion',
      closingText: 'A traditional herbal hair oil made to nourish the scalp and support a healthy-looking hair care routine. Use regularly as directed on the product label.',
    
  },
  'joint-oil-f188e5c3': {
      eyebrow: '4-WEEK WELLNESS JOURNEY',
      title: 'Your Journey with Baba Hakeem Joint Oil',
      variant: 'joint',
      milestones: [
        { label: 'Start', art: 'jointBottle', text: 'A herbal massage oil made with wintergreen, camphor, and Himalayan herbs.' },
        { label: '1st Week', art: 'jointMassage', text: 'Build an easy application routine with a gentle massage.' },
        { label: '2nd Week', art: 'jointSupport', text: 'Regular massage can support a comfortable-feeling joint routine.' },
        { label: '3rd Week', art: 'jointMovement', text: 'Keep moving at a pace that feels comfortable for you.' },
      ],
      closingTitle: 'A Natural Herbal Wellness Companion',
      closingText: 'A handcrafted herbal massage oil with wintergreen, natural camphor, and Himalayan herbs. For external use only; follow the product label.',
    
  },
  'men-s-oil-79456908': {
      eyebrow: '4-WEEK WELLNESS JOURNEY',
      title: "Your Journey with Baba Hakeem Men's Vitality Oil",
      variant: 'mens',
      milestones: [
        { label: 'Start', art: 'jointBottle', text: 'A botanical blend prepared with saffron, nutmeg, and cold-pressed oils.' },
        { label: '1st Week', art: 'jointMassage', text: 'Add a gentle external massage to your personal care routine.' },
        { label: '2nd Week', art: 'jointSupport', text: 'Keep a consistent routine and follow the product directions.' },
        { label: '3rd Week', art: 'jointMovement', text: 'Continue with a comfortable, regular self-care ritual.' },
      ],
      closingTitle: 'A Traditional Botanical Self-Care Ritual',
      closingText: 'A traditional external-use oil made with botanical ingredients. Follow the product label and consult a healthcare professional with questions about personal use.',
    
  },
  'herbal-phakki-8c2b96f2': {
      title: 'Your Journey with Herbal Phakki',
      closingTitle: 'A familiar herbal wellness companion',
      milestones: [
        { label: 'Start', art: 'ingredients', text: 'A traditional herbal blend from the Baba Hakeem collection.' },
        { label: '1st Week', art: 'ritual', text: 'Add the label-recommended serving to your everyday routine.' },
        { label: '2nd Week', art: 'comfort', text: 'Make a simple herbal ritual part of your regular routine.' },
        { label: '3rd Week', art: 'wellbeing', text: 'Keep a steady habit that feels comfortable for you.' },
      ],
      closingText: 'A traditional herbal phakki for a simple daily ritual. Follow the product label and check the ingredients before use.',
    
  },
  'wedding-course-e0778723': {
      eyebrow: '4-WEEK WELLNESS JOURNEY',
      title: 'Your Journey with Baba Hakeem Royal Wedding Course',
      variant: 'wedding',
      milestones: [
        { label: 'Start', art: 'ingredients', text: 'A traditional herbal course with a selection of botanical ingredients.' },
        { label: '1st Week', art: 'ritual', text: 'Read the included guide and follow the course directions.' },
        { label: '2nd Week', art: 'wellbeing', text: 'Continue the routine at the recommended serving and schedule.' },
        { label: '3rd Week', art: 'comfort', text: 'Keep your personal wellness routine steady and well paced.' },
      ],
      closingTitle: 'A Traditional Herbal Wellness Course',
      closingText: 'A curated herbal course with instructions included in the pack. Follow the booklet and product labels; seek professional advice if you have health concerns.',
    
  },
};


export default function SingleProductPage() {
  const reviewSummaries = useReviewSummaries();
  const router = useRouter();
  const contact = useStoreContactSettings();
  const params = useParams();
  const slugParam = params?.slug ? String(params.slug) : '';

  // Match product by exact slug, shortSlug, or id
  const product =
    ALL_PRODUCTS.find(
      (p) =>
        p.slug === slugParam ||
        p.shortSlug === slugParam ||
        p.id === slugParam ||
        slugParam.includes(p.shortSlug)
    ) || ALL_PRODUCTS[0];

  const [activeImage, setActiveImage] = useState(product.image);
  const imageRequest = useRef(0);
  const [quantity, setQuantity] = useState(1);
  const [openTab, setOpenTab] = useState('overview');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useCart();

  // Live product content (overview & usage) fetched from the database
  const [dbProduct, setDbProduct] = useState(null);
  useEffect(() => {
    if (!slugParam) return;
    let cancelled = false;
    fetch('/api/products/' + encodeURIComponent(slugParam))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (!cancelled && data && !data.error) setDbProduct(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slugParam]);

  const overview = dbProduct?.overview || product.overview;
  const usage = dbProduct?.usage || product.usage;

  // Update active image if product changes
  useEffect(() => {
    imageRequest.current += 1;
    setActiveImage(product.image);
    setQuantity(1);
    return () => { imageRequest.current += 1; };
  }, [product]);

  const selectGalleryImage = async (src) => {
    const request = ++imageRequest.current;
    if (src === activeImage) return;
    const image = new window.Image();
    image.src = src;
    try {
      // Keep the current photo visible until the next one is ready to fade in.
      await image.decode();
      if (request === imageRequest.current) setActiveImage(src);
    } catch {
      // Retain the current photo if the selected asset cannot be loaded.
    }
  };

  // Dynamic delivery dates calculated relative to current date
  const [timeline, setTimeline] = useState(null);
  useEffect(() => {
    const refresh = () => setTimeline(getDeliveryTimeline());
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, []);
  const { purchasedText, processingText, deliveredText } = timeline || {};

  const galleryImages = [...new Set([product.image, ...(product.secondaryImages || [])])];
  const journey = PRODUCT_JOURNEYS[product.id] || null;
  const howToUse = product.howToUse;

  // Related products (all other products excluding current)
  const relatedProducts = ALL_PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);
  const reviewSummary = reviewSummaries[dbProduct?.slug || product.slug] || { average: null, total: 0 };

  // Cart Handlers
  const handleAddToCart = () => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    const nextItems = mergeCartItem(cartItems, product, quantity);
    persistCartItems(nextItems);
    setCartItems(nextItems);
    document.dispatchEvent(new Event('bh-route-start'));
    router.push('/checkout');
  };

  const buyRelatedNow = (relatedProduct) => {
    const nextItems = mergeCartItem(cartItems, relatedProduct);
    persistCartItems(nextItems);
    setCartItems(nextItems);
    document.dispatchEvent(new Event('bh-route-start'));
    router.push('/checkout');
  };

  const updateQuantityInCart = (id, delta) => {
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

  const whatsappMessage =
    `Salam Baba Hakeem, I would like to order:\n` +
      `Product: ${product.name}\n` +
      `Quantity: ${quantity}\n` +
      `Price: Rs. ${product.price * quantity}\n` +
      `Payment: Cash on Delivery`;

  return (
    <main className="pdp-page">
      <CommerceHeader onCartClick={() => setCartOpen(true)} />

      {/* ----------------------------------------------------
          SINGLE PRODUCT SECTION (Exact specifications)
          ---------------------------------------------------- */}
      <section className="pdp-section">
        <div className="bh-container">
          {/* Breadcrumbs */}
          <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span className="pdp-bc-sep">/</span>
            <Link href="/#signature">Products</Link>
            <span className="pdp-bc-sep">/</span>
            <span style={{ color: '#000000', fontWeight: 500 }}>{product.name}</span>
          </nav>

          <div className="pdp-grid">
            {/* Left Column: Product Gallery */}
            <div className="pdp-gallery">
              <div className="pdp-main-image-wrap" id="product-main-image">
                {galleryImages.map((image, index) => (
                  <img
                    key={image}
                    src={image}
                    alt={activeImage === image ? `${product.name}, image ${index + 1}` : ''}
                    aria-hidden={activeImage !== image}
                    className={`pdp-main-image ${activeImage === image ? 'is-active' : ''}`}
                    decoding="async"
                    draggable={false}
                  />
                ))}
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="pdp-thumbnails">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      className={`pdp-thumb-btn ${activeImage === img ? 'active' : ''}`}
                      onClick={() => selectGalleryImage(img)}
                      type="button"
                      aria-label={`View ${product.name}, image ${idx + 1}`}
                      aria-pressed={activeImage === img}
                      aria-controls="product-main-image"
                      title={`View image ${idx + 1}`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Details & Purchase Actions */}
            <div className="pdp-details">
              <div className="pdp-badge-row">
                <span className="pdp-tag">{product.tag}</span>
                <span className="pdp-stock-badge"><CheckIcon size={14} /> In Stock (Dispatches within 24 Hours)</span>
              </div>

              {/* Title */}
              <h1 className="pdp-title">{product.name}</h1>

              {/* Rating */}
              <div className="pdp-rating-row">
                {reviewSummary.total > 0 && <div className="pdp-stars"><StarRating rating={reviewSummary.average} size={18} /></div>}
                <span className="pdp-reviews-count">
                  {reviewSummary.total > 0
                    ? `${reviewSummary.average} / 5.0 (${reviewSummary.total} Customer Reviews)`
                    : 'No customer reviews yet'}
                </span>
              </div>

              {/* Pricing */}
              <div className="pdp-price-row">
                <span className="pdp-price-current">Rs. {product.price.toLocaleString()}</span>
                {product.oldPrice && (
                  <span className="pdp-price-original">Rs. {product.oldPrice.toLocaleString()}</span>
                )}
                {product.oldPrice && (
                  <span className="pdp-save-badge">
                    Save Rs. {(product.oldPrice - product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="pdp-short-desc">{product.shortDesc}</p>

              {/* Quantity Selector & Action Buttons */}
              <div className="pdp-actions-box">
                <div className="pdp-qty-row">
                  <span className="pdp-qty-label">Quantity:</span>
                  <div className="pdp-qty-control">
                    <button
                      className="pdp-qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      className="pdp-qty-val"
                      value={quantity}
                      readOnly
                      aria-label="Current quantity"
                    />
                    <button
                      className="pdp-qty-btn"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Primary Buttons */}
                <div className="pdp-btn-group">
                  <button className="pdp-btn-buy" onClick={handleBuyNow}>
                    Buy Now <ArrowRightIcon size={18} />
                  </button>
                  <button className="pdp-btn-cart" onClick={handleAddToCart}>
                    Add to Cart <CartIcon size={20} />
                  </button>
                </div>

                {/* WhatsApp Quick Order Button */}
                {contact.whatsapp_number && <a
                  href={buildWhatsAppUrl(contact.whatsapp_number, whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="pdp-whatsapp-btn"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.031 2C6.495 2 2 6.495 2 12.031a9.98 9.98 0 0 0 1.586 5.393L2 22l4.747-1.536a9.984 9.984 0 0 0 5.284 1.567h.004c5.534 0 10.029-4.495 10.029-10.031A10.035 10.035 0 0 0 12.031 2zm5.836 14.195c-.242.684-1.22 1.258-1.748 1.34-.48.075-1.096.108-3.238-.778-2.613-1.082-4.298-3.766-4.43-3.938-.13-.172-1.06-1.41-1.06-2.69 0-1.28.667-1.91.905-2.172.238-.263.52-.328.694-.328.173 0 .346.002.498.01.162.008.38-.061.593.453.221.534.757 1.848.824 1.983.067.135.112.295.02.47-.091.173-.137.282-.27.439-.133.157-.28.352-.399.473-.133.133-.272.278-.117.544.155.266.689 1.135 1.478 1.838 1.016.905 1.874 1.185 2.14 1.318.266.133.422.112.578-.067.156-.179.667-.777.844-1.044.178-.267.356-.222.593-.133.238.089 1.512.712 1.771.843.259.13.433.195.498.304.065.109.065.632-.177 1.316z" />
                  </svg>
                  <span>Order on WhatsApp (Cash on Delivery)</span>
                </a>}
              </div>

              {/* Estimated dates, matching the compact delivery strip. */}
              <div className="pdp-timeline-card" role="group" aria-label="Estimated order and delivery dates">
                <div className="pdp-timeline-track">
                  <div className="pdp-timeline-step">
                    <span className="pdp-timeline-icon-wrap">
                      <svg width="30" height="32" viewBox="0 0 32 34" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 10h20l2 22H4L6 10Z" />
                        <path d="M11 14V8a5 5 0 0 1 10 0v6" />
                      </svg>
                    </span>
                    <span className="pdp-timeline-date">{purchasedText || '\u00a0'}</span>
                    <span className="pdp-timeline-label">Purchased</span>
                  </div>
                  <span className="pdp-timeline-divider" aria-hidden="true" />
                  <div className="pdp-timeline-step">
                    <span className="pdp-timeline-icon-wrap"><TruckIcon size={32} /></span>
                    <span className="pdp-timeline-date">{processingText || '\u00a0'}</span>
                    <span className="pdp-timeline-label">Processing</span>
                  </div>
                  <span className="pdp-timeline-divider" aria-hidden="true" />
                  <div className="pdp-timeline-step">
                    <span className="pdp-timeline-icon-wrap">
                      <svg width="30" height="32" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 10c0 6-8 14-8 14S4 16 4 10a8 8 0 1 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <span className="pdp-timeline-date">{deliveredText || '\u00a0'}</span>
                    <span className="pdp-timeline-label">Delivered</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges Strip */}
              <div className="pdp-trust-strip">
                <div className="pdp-trust-item">
                  <span className="pdp-trust-icon"><TruckIcon size={18} /></span>
                  <span>Cash on Delivery across Pakistan</span>
                </div>
                <div className="pdp-trust-item">
                  <span className="pdp-trust-icon"><LeafIcon size={22} /></span>
                  <span>100% Pure Organic & Cold-Pressed</span>
                </div>
                <div className="pdp-trust-item">
                  <span className="pdp-trust-icon"><ShieldCheckIcon size={18} /></span>
                  <span>7-Day Return / Replacement Guarantee</span>
                </div>
                <div className="pdp-trust-item">
                  <span className="pdp-trust-icon"><BoxIcon size={18} /></span>
                  <span>Dispatches in Discreet Protective Box</span>
                </div>
              </div>

              {/* Accordion Tabs for Product Information */}
              <div className="pdp-accordion-group">
                <div className="bh-accordion-item">
                  <button
                    className="pdp-accordion-btn"
                    onClick={() => setOpenTab(openTab === 'overview' ? '' : 'overview')}
                  >
                    <span>Product Overview & Benefits</span>
                    {openTab === 'overview' ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
                  </button>
                  {openTab === 'overview' && (
                    <div className="pdp-accordion-content">{overview}</div>
                  )}
                </div>

                <div className="bh-accordion-item">
                  <button
                    className="pdp-accordion-btn"
                    onClick={() => setOpenTab(openTab === 'usage' ? '' : 'usage')}
                  >
                    <span>How to Use / Daily Ritual</span>
                    {openTab === 'usage' ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
                  </button>
                  {openTab === 'usage' && (
                    <div className="pdp-accordion-content">{usage}</div>
                  )}
                </div>

                <div className="bh-accordion-item">
                  <button
                    className="pdp-accordion-btn"
                    onClick={() => setOpenTab(openTab === 'ingredients' ? '' : 'ingredients')}
                  >
                    <span>100% Pure Botanical Ingredients</span>
                    {openTab === 'ingredients' ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
                  </button>
                  {openTab === 'ingredients' && (
                    <div className="pdp-accordion-content">{product.ingredients}</div>
                  )}
                </div>

                <div className="bh-accordion-item">
                  <button
                    className="pdp-accordion-btn"
                    onClick={() => setOpenTab(openTab === 'shipping' ? '' : 'shipping')}
                  >
                    <span>Shipping & Delivery Policy</span>
                    {openTab === 'shipping' ? <ChevronUpIcon size={18} /> : <ChevronDownIcon size={18} />}
                  </button>
                  {openTab === 'shipping' && (
                    <div className="pdp-accordion-content">
                      All orders are dispatched via registered courier services (Trax, Call Courier, Leopard).
                      Estimated transit times: 24 to 48 hours for Lahore, Islamabad, and Karachi; 2 to 4 business days for other cities. Pay cash only upon physical delivery to your doorstep.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {howToUse && (
          <ProductHowToUse
            title="How to Use"
            steps={howToUse}
          />
        )}
        {journey && (
          <ProductWellnessJourney
            eyebrow={journey.eyebrow}
            title={dbProduct?.name ? `Your Journey with ${dbProduct.name}` : journey.title}
            milestones={journey.milestones}
            closingTitle={journey.closingTitle}
            closingText={journey.closingText}
            variant={journey.variant}
          />
        )}
        <ProductFaqs
          productName={dbProduct?.name || product.name}
          image={dbProduct?.image || product.image}
          faqs={dbProduct?.faqs}
        />
        <ProductReviews slug={dbProduct?.slug || product.slug} productName={dbProduct?.name || product.name} />
      </section>

      {/* ----------------------------------------------------
          RELATED PRODUCTS SECTION (Uses EXACT same cards as home cards)
          ---------------------------------------------------- */}
      <section className="pdp-related-section">
        <div className="bh-container">
          <div className="bh-section-header">
            <span className="bh-eyebrow">Explore More</span>
            <h2 className="bh-heading">Related Herbal Products</h2>
          </div>

          <div className="bh-products-grid">
            {relatedProducts.map((rel) => (
              <div key={rel.id} className="bh-product-card">
                <div className="bh-card-image-box">
                  {rel.oldPrice && rel.oldPrice > rel.price && (
                    <span className="bh-card-discount">-{Math.round((1 - rel.price / rel.oldPrice) * 100)}%</span>
                  )}
                  {rel.tag && <span className={`bh-card-tag${rel.oldPrice && rel.oldPrice > rel.price ? ' bh-card-tag-shifted' : ''}`}>{rel.tag}</span>}
                  <Link href={`/products/${rel.slug}`} style={{ display: 'block' }}>
                    <img src={rel.image} alt={rel.name} className="bh-card-img" />
                  </Link>
                </div>

                <div className="bh-card-body">
                  <div className="bh-card-rating">
                    {Number(reviewSummaries[rel.slug]?.total || 0) > 0 && <>
                      <StarRating rating={reviewSummaries[rel.slug].average} size={14} />
                      <span className="bh-card-rating-num">({reviewSummaries[rel.slug].total})</span>
                    </>}
                  </div>

                  <h3 className="bh-card-title">
                    <Link href={`/products/${rel.slug}`}>{rel.name}</Link>
                  </h3>

                  <div className="bh-card-price-row">
                    <span className="bh-pricing">Rs. {rel.price.toLocaleString()}</span>
                    {rel.oldPrice && rel.oldPrice > rel.price && (
                      <span className="bh-pricing-old">Rs. {rel.oldPrice.toLocaleString()}</span>
                    )}
                  </div>

                  <div className="bh-card-actions">
                    <button type="button" onClick={() => buyRelatedNow(rel)} className="btn-buy-now">
                      Buy Now
                    </button>
                    <button
                      className="btn-add-cart"
                      onClick={() => {
                        setCartItems((prev) => {
                          const existing = prev.find((item) => item.id === rel.id);
                          if (existing) {
                            return prev.map((item) =>
                              item.id === rel.id ? { ...item, quantity: item.quantity + 1 } : item
                            );
                          }
                          return [...prev, { ...rel, quantity: 1 }];
                        });
                        setCartOpen(true);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
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
            aria-label="Close cart"
            style={{ fontSize: '20px', color: '#072a06', cursor: 'pointer' }}
          >
            <CloseIcon size={20} />
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
                Continue Shopping
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
                      <button type="button" onClick={() => updateQuantityInCart(item.id, -1)} aria-label={`Decrease ${item.name} quantity`}>&minus;</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantityInCart(item.id, 1)} aria-label={`Increase ${item.name} quantity`}>+</button>
                    </div>
                  </div>
                </div>
                <button
                  className="bh-cart-remove"
                  onClick={() => updateQuantityInCart(item.id, -item.quantity)}
                  title="Remove item"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <TrashIcon size={18} />
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
              Order on WhatsApp (Fast Checkout) <WhatsAppIcon size={20} />
            </a>}

            <button
              className="bh-cart-cod-btn"
              onClick={() => {
                  setCartOpen(false);
                  document.dispatchEvent(new Event('bh-route-start'));
                  router.push('/checkout');
              }}
            >
              Cash on Delivery Checkout <ArrowRightIcon size={18} />
            </button>
            <Link href="/cart" className="bh-cart-view-page">View full cart</Link>
          </div>
        )}
      </aside>
    </main>
  );
}

