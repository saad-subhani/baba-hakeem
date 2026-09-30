'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    id: 1,
    name: 'Neem Purifying Cleanser',
    type: 'Clarifying Ritual',
    price: 3200,
    tone: '#6c7f47',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85',
    copy: 'Neem, tulsi and aloe in a gentle daily cleanse for clearer-looking skin.'
  },
  {
    id: 2,
    name: 'Turmeric Radiance Serum',
    type: 'Glow Concentrate',
    price: 4700,
    tone: '#c8882f',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1200&q=85',
    copy: 'Turmeric and rosehip meet a lightweight botanical oil base for luminous skin.'
  },
  {
    id: 3,
    name: 'Aloe Recovery Gel',
    type: 'Hydration Ritual',
    price: 2800,
    tone: '#78a87b',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=85',
    copy: 'Cooling aloe and cucumber support calm, fresh hydration after long days.'
  },
  {
    id: 4,
    name: 'Amla Hair Elixir',
    type: 'Scalp & Hair Oil',
    price: 3900,
    tone: '#4d6041',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=85',
    copy: 'Amla, bhringraj and botanical oils in a rich pre-wash scalp ritual.'
  }
];

const ingredients = [
  ['NEEM', 'Purify', 'Traditionally used in botanical skin rituals for a fresh, clean feel.'],
  ['TURMERIC', 'Illuminate', 'A heritage ingredient associated with bright, radiant-looking skin.'],
  ['ALOE', 'Soothe', 'Cooling hydration for a softer and more comfortable skin feel.'],
  ['AMLA', 'Strengthen', 'A classic herbal haircare ingredient used in nourishing scalp rituals.']
];

export default function Home() {
  const root = useRef(null);
  const hero = useRef(null);
  const ritual = useRef(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeIngredient, setActiveIngredient] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9 });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      gsap.from('.hero-word span', {
        yPercent: 115,
        duration: 1.1,
        stagger: 0.08,
        ease: 'power4.out'
      });
      gsap.from('.hero-copy, .hero-actions, .hero-badge', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.12,
        delay: 0.4
      });

      gsap.to('.hero-product', {
        y: 150,
        rotate: 7,
        scale: 0.92,
        ease: 'none',
        scrollTrigger: {
          trigger: hero.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });

      gsap.to('.hero-leaf-a', {
        y: -160,
        x: 80,
        rotate: 25,
        ease: 'none',
        scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: 1 }
      });
      gsap.to('.hero-leaf-b', {
        y: 120,
        x: -70,
        rotate: -22,
        ease: 'none',
        scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: 1 }
      });

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 70,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 84%' }
        });
      });

      gsap.utils.toArray('.product-card').forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 70,
          rotate: 1.5,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%' }
        });
      });

      const panels = gsap.utils.toArray('.ingredient-panel');
      panels.forEach((panel, i) => {
        ScrollTrigger.create({
          trigger: panel,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveIngredient(i),
          onEnterBack: () => setActiveIngredient(i)
        });
      });

      gsap.to('.ritual-bottle', {
        rotate: 8,
        y: 20,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: {
          trigger: ritual.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1
        }
      });

      gsap.to('.marquee-track', {
        xPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: '.marquee',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    }, root);

    return () => {
      ctx.revert();
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  const add = (product) => {
    setCart((prev) => [...prev, product]);
    setCartOpen(true);
  };

  const subtotal = cart.reduce((sum, p) => sum + p.price, 0);

  return (
    <main ref={root}>
      <div className="noise" />

      <header className="nav">
        <a className="brand" href="#top">VERDURA<span>BOTANICS</span></a>
        <nav>
          <a href="#shop">Shop</a>
          <a href="#ritual">Ritual</a>
          <a href="#ingredients">Ingredients</a>
          <a href="#story">Story</a>
        </nav>
        <button className="cart-btn" onClick={() => setCartOpen(true)}>Bag ({cart.length})</button>
      </header>

      <section className="hero" id="top" ref={hero}>
        <div className="hero-glow" />
        <div className="hero-leaf hero-leaf-a">☘</div>
        <div className="hero-leaf hero-leaf-b">❧</div>

        <div className="hero-content">
          <div className="hero-badge">BOTANICAL RITUALS · MODERN PERFORMANCE</div>
          <h1>
            <span className="hero-word"><span>ROOTED</span></span>
            <span className="hero-word"><span>IN NATURE.</span></span>
            <span className="hero-word accent"><span>MADE TO MOVE.</span></span>
          </h1>
          <p className="hero-copy">A premium herbal skincare concept blending South Asian botanical rituals with immersive digital storytelling.</p>
          <div className="hero-actions">
            <a className="btn primary" href="#shop">Shop the ritual</a>
            <a className="btn ghost" href="#story">Discover Verdura</a>
          </div>
        </div>

        <div className="hero-product">
          <div className="bottle bottle-large">
            <div className="dropper" />
            <div className="bottle-label">
              <small>VERDURA BOTANICS</small>
              <strong>TURMERIC<br/>RADIANCE</strong>
              <span>BOTANICAL SERUM · 30ML</span>
            </div>
          </div>
          <span className="product-orbit orbit-one">TURMERIC</span>
          <span className="product-orbit orbit-two">ROSEHIP</span>
        </div>

        <div className="scroll-cue">SCROLL TO BEGIN <span>↓</span></div>
      </section>

      <section className="manifesto reveal" id="story">
        <span className="eyebrow">01 — OUR PHILOSOPHY</span>
        <h2>HERBAL KNOWLEDGE.<br/><em>CONTEMPORARY FORM.</em></h2>
        <div className="manifesto-grid">
          <p>Verdura Botanics is a fictional demo brand created to showcase a premium herbal e-commerce experience. The visual language is inspired by nature, ritual, material and movement.</p>
          <div className="manifesto-stats">
            <div><b>04</b><span>Hero botanicals</span></div>
            <div><b>100%</b><span>Demo commerce flow</span></div>
            <div><b>60fps</b><span>Motion-first target</span></div>
          </div>
        </div>
      </section>

      <section className="marquee">
        <div className="marquee-track">
          <span>NEEM ✦ TURMERIC ✦ ALOE ✦ AMLA ✦ ROSE ✦ TULSI ✦</span>
          <span>NEEM ✦ TURMERIC ✦ ALOE ✦ AMLA ✦ ROSE ✦ TULSI ✦</span>
        </div>
      </section>

      <section className="shop" id="shop">
        <header className="section-head reveal">
          <span className="eyebrow">02 — THE COLLECTION</span>
          <h2>DAILY RITUALS,<br/><em>BOTANICALLY LED.</em></h2>
          <p>Demo products created for presentation purposes.</p>
        </header>
        <div className="product-grid">
          {products.map((p, i) => (
            <article className="product-card" key={p.id}>
              <div className="product-image" style={{'--tone': p.tone}}>
                <img src={p.image} alt="" />
                <span className="product-index">{String(i+1).padStart(2,'0')}</span>
                <button className="quick-add" onClick={() => add(p)}>ADD +</button>
              </div>
              <div className="product-meta">
                <div>
                  <span>{p.type}</span>
                  <h3>{p.name}</h3>
                </div>
                <b>PKR {p.price.toLocaleString()}</b>
              </div>
              <p>{p.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ritual" id="ritual" ref={ritual}>
        <div className="ritual-sticky">
          <div className="ritual-copy">
            <span className="eyebrow">03 — A SCROLLING RITUAL</span>
            <h2>ONE BOTTLE.<br/>FOUR <em>BOTANICAL STORIES.</em></h2>
            <p>As you move through the ingredients, the composition remains anchored while the narrative changes around it.</p>
          </div>
          <div className="ritual-visual">
            <div className="ritual-halo" />
            <div className="bottle ritual-bottle">
              <div className="dropper" />
              <div className="bottle-label">
                <small>VERDURA BOTANICS</small>
                <strong>{ingredients[activeIngredient][0]}</strong>
                <span>{ingredients[activeIngredient][1].toUpperCase()} RITUAL</span>
              </div>
            </div>
            <div className="ingredient-name">{ingredients[activeIngredient][0]}</div>
          </div>
        </div>

        <div className="ingredient-scroll" id="ingredients">
          {ingredients.map((item, i) => (
            <article className="ingredient-panel" key={item[0]}>
              <span>{String(i+1).padStart(2,'0')}</span>
              <div>
                <small>{item[1]}</small>
                <h3>{item[0]}</h3>
                <p>{item[2]}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="editorial">
        <div className="editorial-card editorial-one reveal">
          <div className="editorial-photo photo-a" />
          <div className="editorial-caption"><span>RITUAL 01</span><h3>Slow beauty, intentionally made.</h3></div>
        </div>
        <div className="editorial-card editorial-two reveal">
          <div className="editorial-photo photo-b" />
          <div className="editorial-caption"><span>RITUAL 02</span><h3>Botanical ingredients. Sensory routines.</h3></div>
        </div>
      </section>

      <section className="quote reveal">
        <p>“A herbal e-commerce demo should feel like a world you enter — not a catalogue you scroll past.”</p>
        <span>VERDURA DESIGN PRINCIPLE</span>
      </section>

      <section className="final-cta">
        <div className="final-orb" />
        <span className="eyebrow">04 — BEGIN THE RITUAL</span>
        <h2>YOUR DAILY<br/><em>BOTANICAL RESET.</em></h2>
        <a className="btn primary" href="#shop">Explore the collection</a>
      </section>

      <footer>
        <div className="footer-brand">VERDURA<br/>BOTANICS</div>
        <div className="footer-columns">
          <div><b>SHOP</b><a href="#shop">Skincare</a><a href="#shop">Haircare</a><a href="#shop">Ritual Sets</a></div>
          <div><b>DISCOVER</b><a href="#ingredients">Ingredients</a><a href="#story">Our Story</a><a href="#ritual">Rituals</a></div>
          <div><b>DEMO</b><span>Concept e-commerce experience</span><span>Built for presentation</span></div>
        </div>
        <div className="footer-bottom">© 2026 VERDURA BOTANICS — DEMO STORE</div>
      </footer>

      <aside className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="cart-top">
          <div><span>YOUR BAG</span><b>{cart.length} ITEM{cart.length === 1 ? '' : 'S'}</b></div>
          <button onClick={() => setCartOpen(false)}>×</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 && <p className="empty">Your ritual bag is empty.</p>}
          {cart.map((p, i) => (
            <div className="cart-item" key={i}>
              <div className="mini-product" style={{background:p.tone}} />
              <div><span>{p.type}</span><b>{p.name}</b><small>PKR {p.price.toLocaleString()}</small></div>
              <button onClick={() => setCart(cart.filter((_, x) => x !== i))}>×</button>
            </div>
          ))}
        </div>
        <div className="cart-bottom">
          <div><span>SUBTOTAL</span><b>PKR {subtotal.toLocaleString()}</b></div>
          <button className="checkout" disabled={!cart.length}>DEMO CHECKOUT →</button>
          <small>Presentation demo — no payment will be processed.</small>
        </div>
      </aside>
      {cartOpen && <button className="cart-overlay" onClick={() => setCartOpen(false)} aria-label="Close cart" />}
    </main>
  );
}