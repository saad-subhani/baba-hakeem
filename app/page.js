'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import BestProductReveal from '../components/BestProductReveal';

const HANDS='/hands-removebg-preview.png';
const HAIR_OIL='/products/hair%20oil%20mockup%20png.png';
const MENS_OIL='/products/mens-oil-new.png';
const HERBAL_PHAKKI='/products/phakii.png';
const STOMACH_PHAKKI='/products/stomach%20phakki-03.png';
const WEDDING_COURSE='/products/wedding-course.webp.png';

export default function Home(){
 const root=useRef(null);
 const heroBottleRef=useRef(null);
 const jointTargetRef=useRef(null);
 const mensOilRef=useRef(null);
 const mensHandsTargetRef=useRef(null);
 const [adminProducts,setAdminProducts]=useState([]);

 useEffect(()=>{
  let mounted=true;
  const load=async()=>{
   const {data,error}=await supabase.from('products').select('*').eq('status','Published').order('featured',{ascending:false}).order('sort_order',{ascending:true}).order('created_at',{ascending:false});
   if(mounted&&!error)setAdminProducts(data||[]);
  };
  load();
  return()=>{mounted=false};
 },[]);

 useEffect(()=>{
  const ctx=gsap.context(()=>{
   const tl=gsap.timeline({defaults:{ease:'power3.out'}});
   gsap.set('.ref-hero-copy',{opacity:0,y:52});
   gsap.set('.ref-hero-bottom',{opacity:0,x:-54});
   gsap.set('.ref-note',{opacity:0,x:54});
   gsap.set('.ref-hero-subline',{opacity:0,y:10});
   gsap.set('.ref-hero-bottle',{opacity:0,y:46});
   tl.to('.ref-hero-copy',{opacity:1,y:0,duration:1.75},.18)
     .to('.ref-hero-bottom',{opacity:1,x:0,duration:1.45},.72)
     .to('.ref-note',{opacity:1,x:0,duration:1.45},.72)
     .to('.ref-hero-subline',{opacity:1,y:0,duration:1.2},1.05)
     .to('.ref-hero-bottle',{opacity:1,y:0,duration:1.6,ease:'power3.out'},1.22);
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
  let resizeFrame=0;
  const buildMovement=()=>{
   if(tween){tween.scrollTrigger?.kill();tween.kill();}
   gsap.set(bottle,{clearProps:'x,y,scale,rotation'});

   const bottleRect=bottle.getBoundingClientRect();
   const targetRect=target.getBoundingClientRect();
   const targetScale=Math.min(
    (targetRect.width*.90)/bottleRect.width,
    (targetRect.height*.94)/bottleRect.height
   );
   const dx=(targetRect.left+targetRect.width/2)-(bottleRect.left+bottleRect.width/2);
   const dy=(targetRect.top+targetRect.height/2)-(bottleRect.top+bottleRect.height/2);

   tween=gsap.to(bottle,{
    x:dx,
    y:dy,
    scale:targetScale,
    rotation:0,
    force3D:true,
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
  const onResize=()=>{
   if(resizeFrame) return;
   resizeFrame=requestAnimationFrame(()=>{
    resizeFrame=0;
    buildMovement();
    ScrollTrigger.refresh();
   });
  };

  const delayed=window.setTimeout(()=>{buildMovement();ScrollTrigger.refresh();},80);
  window.addEventListener('resize',onResize,{passive:true});
  return()=>{
   window.clearTimeout(delayed);
   window.removeEventListener('resize',onResize);
   if(resizeFrame) cancelAnimationFrame(resizeFrame);
   if(tween){tween.scrollTrigger?.kill();tween.kill();}
  };
 },[]);

 useEffect(()=>{
  if(typeof window==='undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const mensBottle=mensOilRef.current;
  const target=mensHandsTargetRef.current;
  const sourceCard=mensBottle?.closest('article');
  if(!mensBottle||!target||!sourceCard) return;

  let tween;
  let resizeFrame=0;
  const buildMensMovement=()=>{
   if(tween){tween.scrollTrigger?.kill();tween.kill();}
   gsap.set(mensBottle,{clearProps:'x,y,scale,rotation'});

   const bottleRect=mensBottle.getBoundingClientRect();
   const targetRect=target.getBoundingClientRect();
   const dx=(targetRect.left+targetRect.width/2)-(bottleRect.left+bottleRect.width/2);
   const dy=(targetRect.top+targetRect.height/2)-(bottleRect.top+bottleRect.height/2);
   const targetScale=window.innerWidth<760?1.95:2.45;

   tween=gsap.to(mensBottle,{
    x:dx,
    y:dy,
    scale:targetScale,
    rotation:0,
    force3D:true,
    ease:'none',
    transformOrigin:'50% 50%',
    scrollTrigger:{
     trigger:sourceCard,
     start:'center 58%',
     endTrigger:'.ref-feature',
     end:'bottom bottom',
     scrub:1.2,
     invalidateOnRefresh:true
    }
   });
  };
  const onResize=()=>{
   if(resizeFrame) return;
   resizeFrame=requestAnimationFrame(()=>{
    resizeFrame=0;
    buildMensMovement();
    ScrollTrigger.refresh();
   });
  };

  const delayed=window.setTimeout(()=>{buildMensMovement();ScrollTrigger.refresh();},120);
  window.addEventListener('resize',onResize,{passive:true});
  return()=>{
   window.clearTimeout(delayed);
   window.removeEventListener('resize',onResize);
   if(resizeFrame) cancelAnimationFrame(resizeFrame);
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
    <img ref={heroBottleRef} className="ref-hero-bottle" src="/joint-oil-4k.png" alt="Baba Hakeem Herbal Products bottle" fetchPriority="high" decoding="async"/>
    <div className="ref-hero-bottom">
     <p>Discover a focused collection of herbal oils, traditional blends and premium saffron — thoughtfully selected for simple everyday care.<br/>Rooted in herbal tradition, refined for modern routines, and presented with a clean, considered approach.<br/>Explore the Baba Hakeem collection and find a ritual that fits naturally into your day.</p>
     <a href="#reel-products">Shop now</a>
    </div>
    <aside className="ref-note"><b>Pure Herbal Care</b><p>Rooted in herbal tradition and thoughtfully refined for modern everyday routines.<br/><br/>A focused collection created with simplicity, care and a timeless botanical approach.</p><span>Explore</span></aside>
   </section>

   <section className="ref-catalogue" id="reel-products">
    <h2>Our Products</h2>
    <div className="ref-product-grid">
     <article><div><img src={HAIR_OIL} alt="Hair Oil" loading="lazy" decoding="async"/></div><h3>Hair Oil</h3></article>
     <article><div ref={jointTargetRef} className="ref-joint-target">{/* Animated hero bottle destination — intentionally empty */}</div><h3>Joint Oil</h3></article>
     <article><div><img src={STOMACH_PHAKKI} alt="Stomach Phakki" loading="lazy" decoding="async"/></div><h3>Stomach Phakki</h3></article>
     <article><div><img src={HERBAL_PHAKKI} alt="Herbal Phakki" loading="lazy" decoding="async"/></div><h3>Herbal Phakki</h3></article>
     <article className="ref-mens-source"><div><img ref={mensOilRef} className="ref-mens-moving" src={MENS_OIL} alt="Men's Oil" decoding="async"/></div><h3>Men's Oil</h3></article>
     <article><div className="ref-cover"><img src={WEDDING_COURSE} alt="Wedding Course" loading="lazy" decoding="async"/></div><h3>Wedding Course</h3></article>
     {adminProducts.map(p=><article key={p.id}><Link href={'/products/'+p.slug}><div>{p.image_url&&<img src={p.image_url} alt={p.name} loading="lazy" decoding="async"/>}</div><h3>{p.name}</h3></Link></article>)}
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
     <span ref={mensHandsTargetRef} className="ref-mens-hands-target" aria-hidden="true"/>
     <img className="ref-feature-hands" src={HANDS} alt="Hands presenting Baba Hakeem product" decoding="async"/>
    </div>
   </section>
   <BestProductReveal/>
  </div>
 </main>;
}
