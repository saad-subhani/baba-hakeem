'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

const ALOE='/aloe-hero.png.png';
const BOTTLE='/products/hero-premium-bottle.png.png';
const ALOE_ING='/aloe.png.png';
const NEEM='/neem.png-removebg-preview.png';
const TURMERIC='/turmeric.png-removebg-preview.png';
const DROP='/Drop.png-removebg-preview.png';
const REVEAL='/alovera_reveal-removebg-preview.png';
const HANDS='/hands-removebg-preview.png';

/* Real Baba Hakeem Herbal Products catalogue assets — hero/cinematic assets above stay untouched. */
const HAIR_OIL='/products/hair%20oil%20mockup%20png.png';
const JOINT_OIL='/products/30ml%20mockup.png';
const MENS_OIL="/products/men's%20oil%2010%20ml%20label%20M%20png.png";
const HERBAL_PHAKKI='/products/phakii.png';
const STOMACH_PHAKKI='/products/stomach%20phakki-03.png';
const ZAFRAN='/products/zafran/IMG_20241002_133345.webp';

export default function Home(){
 const root=useRef(null);
 const heroBottleRef=useRef(null);
 const jointTargetRef=useRef(null);
 const [adminProducts,setAdminProducts]=useState([]);
 useEffect(()=>{
  let mounted=true;
  const load=async()=>{const {data,error}=await supabase.from('products').select('*').eq('status','Published').order('featured',{ascending:false}).order('sort_order',{ascending:true}).order('created_at',{ascending:false});if(mounted&&!error)setAdminProducts(data||[]);};
  load();
  return()=>{mounted=false};
 },[]);
 useEffect(()=>{
  // Opening choreography only. Scroll/product-to-hand motion remains intentionally deferred.
  const ctx=gsap.context(()=>{
   const tl=gsap.timeline({defaults:{ease:'power3.out'}});
   gsap.set('.ref-hero-copy',{opacity:0,y:52});
   gsap.set('.ref-hero-bottom',{opacity:0,x:-54});
   gsap.set('.ref-note',{opacity:0,x:54});
   gsap.set('.ref-hero-subline',{opacity:0,y:10});
   gsap.set('.ref-hero-bottle',{opacity:0,y:26,scale:.94});
   tl.to('.ref-hero-copy',{opacity:1,y:0,duration:1.75},.18)
     .to('.ref-hero-bottom',{opacity:1,x:0,duration:1.45},.72)
     .to('.ref-note',{opacity:1,x:0,duration:1.45},.72)
     .to('.ref-hero-subline',{opacity:1,y:0,duration:1.2},1.05)
     .to('.ref-hero-bottle',{opacity:1,y:0,scale:1,duration:1.35},1.22);
  },root);
  return()=>ctx.revert();
 },[]);

 useEffect(()=>{
  if(typeof window==='undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const bottle=heroBottleRef.current;
  const target=jointTargetRef.current;
  const hero=root.current?.querySelector('.ref-hero');
  if(!bottle||!target||!hero) return;

  let tween;
  const buildMovement=()=>{
   if(tween){tween.scrollTrigger?.kill();tween.kill();}
   gsap.set(bottle,{clearProps:'x,y,scale,rotation'});

   const bottleRect=bottle.getBoundingClientRect();
   const targetRect=target.getBoundingClientRect();
   const targetScale=Math.min(
    (targetRect.width*.72)/bottleRect.width,
    (targetRect.height*.78)/bottleRect.height
   );

   const dx=(targetRect.left+targetRect.width/2)-(bottleRect.left+bottleRect.width/2);
   const dy=(targetRect.top+targetRect.height/2)-(bottleRect.top+bottleRect.height/2);

   tween=gsap.to(bottle,{
    x:dx,
    y:dy,
    scale:targetScale,
    rotation:0,
    ease:'none',
    scrollTrigger:{
     trigger:hero,
     start:'bottom bottom',
     endTrigger:target,
     end:'center center',
     scrub:1.15,
     invalidateOnRefresh:true
    }
   });
  };

  const delayed=window.setTimeout(()=>{buildMovement();ScrollTrigger.refresh();},80);
  window.addEventListener('resize',buildMovement);
  return()=>{
   window.clearTimeout(delayed);
   window.removeEventListener('resize',buildMovement);
   if(tween){tween.scrollTrigger?.kill();tween.kill();}
  };
 },[]);

 return <main ref={root}>
  <div className="reel-site static-reference-site">
   <header className="ref-nav">
    <a className="ref-logo" href="#">Baba Hakeem</a>
    <nav><a href="#">Home</a><a href="#reel-products">Products</a><a href="#featured-product">Contact</a></nav>
    <a className="ref-shop" href="#reel-products">Shop <span>↗</span></a>
   </header>

   <section className="ref-hero">
    <div className="ref-hero-copy">
     <h1>Baba Hakeem</h1>
     <p className="ref-hero-subline">Traditional herbal care, refined into a clean and considered everyday ritual.</p>
    </div>
    <img ref={heroBottleRef} className="ref-hero-bottle" src="/joint-oil-4k.png" alt="Baba Hakeem Herbal Products bottle"/>
    <div className="ref-hero-bottom">
     <p>Discover a focused collection of herbal oils, traditional blends and premium saffron — thoughtfully selected for simple everyday care.<br/>Rooted in herbal tradition, refined for modern routines, and presented with a clean, considered approach.<br/>Explore the Baba Hakeem collection and find a ritual that fits naturally into your day.</p>
     <a href="#reel-products">Shop now</a>
    </div>
    <aside className="ref-note"><b>Pure Herbal Care</b><p>Rooted in herbal tradition and thoughtfully refined for modern everyday routines.<br/><br/>A focused collection created with simplicity, care and a timeless botanical approach.</p><span>Explore</span></aside>
   </section>

   <section className="ref-catalogue" id="reel-products">
    <h2>Our Products</h2>
    <div className="ref-product-grid">
     <article><div><img src={HAIR_OIL} alt="Hair Oil"/></div><h3>Hair Oil</h3></article>
     <article><div ref={jointTargetRef} className="ref-joint-target">{/* Animated hero bottle destination — intentionally empty */}</div><h3>Joint Oil</h3></article>
     <article><div><img src={MENS_OIL} alt="Men's Oil"/></div><h3>Men's Oil</h3></article>
     <article><div><img src={HERBAL_PHAKKI} alt="Herbal Phakki"/></div><h3>Herbal Phakki</h3></article>
     <article><div><img src={STOMACH_PHAKKI} alt="Stomach Phakki"/></div><h3>Stomach Phakki</h3></article>
     <article><div className="ref-cover"><img src={ZAFRAN} alt="Zafran"/></div><h3>Zafran</h3></article>
     {adminProducts.map(p=><article key={p.id}><Link href={'/products/'+p.slug}><div>{p.image_url&&<img src={p.image_url} alt={p.name}/>}</div><h3>{p.name}</h3></Link></article>)}
    </div>
   </section>

   <section className="ref-feature" id="featured-product">
    <div className="ref-feature-copy">
     <small>FEATURED PRODUCT</small>
     <h2>Hair Oil</h2>
     <p>A considered herbal oil from the Baba Hakeem collection, presented as a simple everyday ritual.</p>
     <a href="#reel-products">Shop now</a>
    </div>
    <div className="ref-feature-visual">
     <img className="ref-feature-hands" src={HANDS} alt="Hands presenting Baba Hakeem product"/>
     <img className="ref-feature-product" src={HAIR_OIL} alt="Baba Hakeem Hair Oil"/>
    </div>
   </section>
  </div>
  <section className="film"><div className="screen">
   <header className="intro-ui"><a href="#" className="logo">BABA HAKEEM<span>HERBAL PRODUCTS</span></a><nav><a href="#collection">PRODUCTS</a><a href="#story">OUR STORY</a><a href="#ingredients">INGREDIENTS</a></nav><button>MENU <i/><i/></button></header>
   <div className="night cinematic-bg"/>
   <div className="hero-photo night"><img className="hero-bg-photo" src={ALOE} alt=""/><img className="hero-aloe" src={ALOE_ING} alt="Fresh aloe vera"/><img className="reveal-leaf" src={REVEAL} alt="Aloe vera leaf opening"/></div>
   <div className="photo-shade night"/>
   <div className="gel-core night"><span/><span/></div>
   <div className="particles night">{Array.from({length:20}).map((_,i)=><img className={'drop p'+(i%13)} src={DROP} alt="" key={i}/>)}</div>
   <div className="intro-title intro-ui night"><small>PURE BOTANICAL CARE — 01</small><h1>FROM<br/><em>NATURE.</em></h1><aside><span>POTENT PLANTS.<br/>PURER RITUALS.</span><h2>MADE<br/>FOR <em>SKIN.</em></h2></aside></div>
   <div className="halo night"/>
   <img className="hands-stage night" src={HANDS} alt="Hands receiving Herbal bottle"/>
   <div className="hero-bottle"><img className="hero-bottle-art" src={BOTTLE} alt="Baba Hakeem Herbal Products premium oil bottle"/></div>
   <div className="product-copy"><small>01 / BOTANICAL HYDRATION</small><h2>ALOE,<br/><em>REIMAGINED.</em></h2><p>Plant becomes texture. Texture becomes ritual. A botanical story revealed by your scroll.</p><a href="#collection">DISCOVER THE RITUAL →</a></div>
   <div className="scroll intro-ui night">SCROLL TO TRANSFORM <b>↓</b></div><div className="day chapter">THE PLANT / THE FORMULA / THE RITUAL</div>
  </div></section>
  <div className="bottle-journey" aria-hidden="true"><img src={BOTTLE} alt=""/></div>
  <section className="benefit-strip" aria-label="Herbal principles"><span>BOTANICAL ACTIVES</span><i/> <span>MINDFUL FORMULAS</span><i/> <span>SKIN-FIRST RITUALS</span><i/> <span>NATURE, REFINED</span></section>
  <section className="collection" id="collection"><div><small>02 / THE COLLECTION</small><h2>THE STORY BECOMES<br/><em>something you can hold.</em></h2></div><div className="ingredient-row" id="ingredients"><article className="ingredient-card aloe-card"><div className="ingredient-visual"><img className="ingredient-art" src={ALOE_ING} alt="Aloe Vera"/></div><b>01</b><h3>ALOE VERA</h3><p>HYDRATE / SOOTHE / RESET</p></article><article className="ingredient-card neem-card"><div className="ingredient-visual"><img className="ingredient-art" src={NEEM} alt="Neem leaves"/></div><b>02</b><h3>NEEM</h3><p>CLARIFY / BALANCE / CARE</p></article><article className="ingredient-card turmeric-card"><div className="ingredient-visual"><img className="ingredient-art" src={TURMERIC} alt="Turmeric"/></div><b>03</b><h3>TURMERIC</h3><p>GLOW / REVIVE / RITUAL</p></article></div>
   <div className="collection-actions"><a className="primary-cta" href="#ritual">EXPLORE THE RITUAL <span>↗</span></a><p>Three botanicals. One considered approach to everyday skin care.</p></div>
  </section>
  <section className="ritual-section" id="ritual">
   <div className="ritual-kicker"><small>03 / THE HERBAL METHOD</small><span>PLANT → FORMULA → RITUAL</span></div>
   <div className="ritual-grid">
    <div className="ritual-copy"><h2>SKINCARE,<br/><em>rooted in plants.</em></h2><p>A focused botanical ritual designed around ingredients people already know — presented with a cleaner, more considered experience.</p><a href="#ingredients">VIEW INGREDIENTS <b>→</b></a></div>
    <div className="ritual-visual"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><img className="ritual-destination-bottle" src={BOTTLE} alt="Baba Hakeem Herbal Products premium oil bottle"/><span className="float-note n1">ALOE<br/>HYDRATE</span><span className="float-note n2">NEEM<br/>BALANCE</span><span className="float-note n3">TURMERIC<br/>GLOW</span></div>
   </div>
  </section>
  <section className="promise-section" id="story"><small>04 / OUR APPROACH</small><h2>LESS NOISE.<br/>MORE <em>BOTANICAL INTENT.</em></h2><div className="promise-grid"><article><b>01</b><h3>PLANT-LED</h3><p>Familiar botanicals become the visual and sensory heart of every Herbal ritual.</p></article><article><b>02</b><h3>RITUAL-FIRST</h3><p>A calmer, more deliberate approach to the way skincare fits into everyday life.</p></article><article><b>03</b><h3>CONSIDERED</h3><p>Focused presentation, purposeful ingredients and a premium experience without unnecessary clutter.</p></article></div></section>
  <section className="shop-section" id="shop">
   <div className="shop-head"><div><small>05 / THE COLLECTION</small><h2>HERBAL CARE,<br/><em>made tangible.</em></h2></div><p>Six distinct products, presented as one considered collection — oils, traditional herbal blends and premium saffron.</p></div>
   <div className="category-tabs"><button className="active">ALL PRODUCTS</button><button>OILS</button><button>HERBAL BLENDS</button><button>SAFFRON</button></div>
   <div className="product-grid real-product-grid">
    <article className="shop-card featured"><div className="badge">01 / HAIR CARE</div><div className="shop-art real-product-art hair-product"><span className="art-index">01</span><img src={HAIR_OIL} alt="Baba Hakeem Herbal Products Hair Oil"/></div><div className="shop-info"><div><small>BABA HAKEEM HERBAL PRODUCTS / OIL</small><h3>HAIR OIL</h3><p>A dedicated oil in the Baba Hakeem Herbal Products care collection.</p></div><a className="product-arrow" href="#collection-focus" aria-label="Explore Hair Oil">↗</a></div></article>
    <article className="shop-card"><div className="badge">02 / BODY CARE</div><div className="shop-art real-product-art joint-product"><span className="art-index">02</span><img src={JOINT_OIL} alt="Baba Hakeem Herbal Products Joint Oil"/></div><div className="shop-info"><div><small>BABA HAKEEM HERBAL PRODUCTS / OIL</small><h3>JOINT OIL</h3><p>A topical oil presented within the Baba Hakeem Herbal Products range.</p></div><a className="product-arrow" href="#collection-focus" aria-label="Explore Joint Oil">↗</a></div></article>
    <article className="shop-card"><div className="badge">03 / MEN'S CARE</div><div className="shop-art real-product-art mens-product"><span className="art-index">03</span><img src={MENS_OIL} alt="Baba Hakeem Herbal Products Men's Oil"/></div><div className="shop-info"><div><small>BABA HAKEEM HERBAL PRODUCTS / 10 ML</small><h3>MEN'S OIL</h3><p>A compact oil format from the Baba Hakeem Herbal Products collection.</p></div><a className="product-arrow" href="#collection-focus" aria-label="Explore Men's Oil">↗</a></div></article>
    <article className="shop-card"><div className="badge">04 / HERBAL BLEND</div><div className="shop-art real-product-art phakki-product"><span className="art-index">04</span><img src={HERBAL_PHAKKI} alt="Baba Hakeem Herbal Products Herbal Phakki"/></div><div className="shop-info"><div><small>TRADITIONAL HERBAL BLEND</small><h3>HERBAL PHAKKI</h3><p>A traditional powdered blend in the Baba Hakeem Herbal Products range.</p></div><a className="product-arrow" href="#collection-focus" aria-label="Explore Herbal Phakki">↗</a></div></article>
    <article className="shop-card"><div className="badge">05 / HERBAL BLEND</div><div className="shop-art real-product-art stomach-product"><span className="art-index">05</span><img src={STOMACH_PHAKKI} alt="Baba Hakeem Herbal Products Stomach Phakki"/></div><div className="shop-info"><div><small>BABA HAKEEM HERBAL PRODUCTS / POWDER</small><h3>STOMACH PHAKKI</h3><p>A traditional herbal powder presentation.</p></div><a className="product-arrow" href="#collection-focus" aria-label="Explore Stomach Phakki">↗</a></div></article>
    <article className="shop-card zafran-card"><div className="badge">06 / PREMIUM SAFFRON</div><div className="shop-art real-product-art zafran-product"><span className="art-index">06</span><img src={ZAFRAN} alt="Baba Hakeem Herbal Products Zafran saffron"/></div><div className="shop-info"><div><small>BABA HAKEEM HERBAL PRODUCTS / SAFFRON</small><h3>ZAFRAN</h3><p>Premium saffron presented in Baba Hakeem Herbal Products packaging.</p></div><a className="product-arrow" href="#zafran-story" aria-label="Explore Zafran">↗</a></div></article>
   </div>
   {adminProducts.length>0&&<div className="product-grid real-product-grid admin-added-grid">{adminProducts.map((p,i)=><article className="shop-card admin-added-card" key={p.id}><div className="badge">{String(i+7).padStart(2,'0')} / {p.category.toUpperCase()}</div><div className="shop-art real-product-art"><span className="art-index">{String(i+7).padStart(2,'0')}</span><img src={p.image} alt={p.name}/></div><div className="shop-info"><div><small>BABA HAKEEM HERBAL PRODUCTS / {p.type||'PRODUCT'}</small><h3>{p.name.toUpperCase()}</h3><p>{p.description||'A product from the Baba Hakeem Herbal Products collection.'}</p>{p.price&&<b className="admin-card-price">{p.price}</b>}</div><Link className="product-arrow" href={'/products/'+p.slug} aria-label={'Explore '+p.name}>↗</Link></div></article>)}</div>}
  </section>

  <section className="range-section" id="collection-focus">
   <div className="range-heading"><small>06 / ONE BRAND, DISTINCT FORMS</small><h2>FROM OILS TO<br/><em>traditional blends.</em></h2><p>The collection moves beyond a single skincare ritual. Baba Hakeem Herbal Products brings together different product forms under one visual language.</p></div>
   <div className="range-panels">
    <article><span>01</span><div><small>CARE OILS</small><h3>POURED WITH<br/>PURPOSE.</h3><p>Hair Oil, Joint Oil and Men’s Oil form the oil side of the collection.</p></div><img src={HAIR_OIL} alt="Baba Hakeem Herbal Products Hair Oil"/></article>
    <article><span>02</span><div><small>HERBAL BLENDS</small><h3>ROOTED IN<br/>TRADITION.</h3><p>Herbal Phakki and Stomach Phakki bring traditional powdered formats into the range.</p></div><img src={HERBAL_PHAKKI} alt="Baba Hakeem Herbal Products Herbal Phakki"/></article>
   </div>
  </section>

  <section className="zafran-feature" id="zafran-story">
   <div className="zafran-photo"><img src={ZAFRAN} alt="Baba Hakeem Herbal Products Zafran"/></div>
   <div className="zafran-copy"><small>07 / A PRECIOUS BOTANICAL</small><h2>ZAFRAN,<br/><em>in focus.</em></h2><p>A premium saffron presentation photographed for Baba Hakeem Herbal Products. The product takes centre stage with the original designer imagery preserved at high quality.</p><div className="zafran-meta"><span>SAFFRON</span><span>BABA HAKEEM HERBAL PRODUCTS</span><span>PREMIUM PRESENTATION</span></div><a href="#shop">VIEW THE COLLECTION <b>↗</b></a></div>
  </section>

  <section className="brand-manifesto">
   <div className="manifesto-kicker"><small>08 / THE HERBAL WORLD</small><span>BOTANICALS / OILS / BLENDS / SAFFRON</span></div>
   <h2>NOT ONE RITUAL.<br/><em>A WHOLE HERBAL WORLD.</em></h2>
   <div className="manifesto-grid"><p>Baba Hakeem Herbal Products is presented as a broader collection rather than a single skincare story — giving every product family room to feel distinct while still belonging to the same brand.</p><div><span>01</span><b>BOTANICAL IDENTITY</b></div><div><span>02</span><b>CONSIDERED PACKAGING</b></div><div><span>03</span><b>DISTINCT PRODUCT FAMILIES</b></div></div>
  </section>

  <section className="journal-section product-journal">
   <div className="journal-head"><div><small>09 / EXPLORE THE COLLECTION</small><h2>THREE SIDES OF<br/><em>Baba Hakeem Herbal Products.</em></h2></div><a href="#shop">VIEW ALL <span>→</span></a></div>
   <div className="journal-grid"><article><div className="journal-visual product-story-visual"><img src={JOINT_OIL} alt="Baba Hakeem Herbal Products oils"/></div><small>THE OIL COLLECTION</small><h3>THREE FORMATS, ONE HERBAL DESIGN LANGUAGE</h3><a href="#shop">EXPLORE OILS ↗</a></article><article><div className="journal-visual product-story-visual"><img src={STOMACH_PHAKKI} alt="Baba Hakeem Herbal Products herbal blends"/></div><small>TRADITIONAL BLENDS</small><h3>HERBAL POWDERS, PRESENTED WITH CLARITY</h3><a href="#shop">EXPLORE BLENDS ↗</a></article><article><div className="journal-visual zafran-story-visual"><img src="/products/zafran/IMG_20241002_133606.webp" alt="Baba Hakeem Herbal Products Zafran"/></div><small>PREMIUM SAFFRON</small><h3>ZAFRAN THROUGH THE DESIGNER'S LENS</h3><a href="#zafran-story">DISCOVER ZAFRAN ↗</a></article></div>
  </section>

  <section className="newsletter-section"><small>THE HERBAL LETTER</small><h2>FROM THE WORLD<br/>OF <em>BABA HAKEEM HERBAL PRODUCTS.</em></h2><p>Product stories, collection updates and new additions — occasionally.</p><form onSubmit={(e)=>e.preventDefault()}><input type="email" aria-label="Email address" placeholder="YOUR EMAIL ADDRESS" required/><button type="submit">JOIN <span>→</span></button></form><div className="newsletter-meta"><span>BABA HAKEEM HERBAL PRODUCTS © 2026</span><span>OILS / HERBAL BLENDS / SAFFRON</span></div></section>
  <section className="final-cta"><small>BABA HAKEEM HERBAL PRODUCTS</small><h2>ROOTED IN<br/><em>NATURE.</em></h2><a href="#shop">EXPLORE THE COLLECTION <span>→</span></a></section>
 </main>
}
