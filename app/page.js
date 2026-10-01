'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lenis from '@studio-freight/lenis';

const ALOE='/aloe-hero.png.png';
const BOTTLE='/aloe-bottle.png.png';
const ALOE_ING='/aloe.png.png';
const NEEM='/neem.png-removebg-preview.png';
const TURMERIC='/turmeric.png-removebg-preview.png';
const DROP='/Drop.png-removebg-preview.png';
const REVEAL='/alovera_reveal-removebg-preview.png';
const HANDS='/hands-removebg-preview.png';

export default function Home(){
 const root=useRef(null);
 useEffect(()=>{
  let ctx,lenis,raf,dead=false;
  (async()=>{
   const {ScrollTrigger}=await import('gsap/ScrollTrigger'); if(dead)return;
   gsap.registerPlugin(ScrollTrigger);
   lenis=new Lenis({duration:1.08,smoothWheel:true}); lenis.on('scroll',ScrollTrigger.update);
   raf=t=>lenis.raf(t*1000); gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
   ctx=gsap.context(()=>{
    gsap.from('.intro-ui',{opacity:0,y:18,stagger:.08,duration:1,ease:'power3.out'});
    gsap.set('.hero-photo',{opacity:1});
    gsap.set('.hero-bottle',{xPercent:-50,yPercent:-50,rotation:7,transformOrigin:'50% 50%'});
    gsap.set('.hero-bg-photo',{opacity:1});
    gsap.set('.hero-aloe',{opacity:1});
    gsap.set('.hands-stage',{opacity:0,yPercent:18,scale:.86});
    gsap.from('.hero-photo',{scale:1.025,duration:1.35,ease:'power3.out'});
    const tl=gsap.timeline({scrollTrigger:{trigger:'.film',start:'top top',end:'bottom bottom',scrub:.75,pin:'.screen',anticipatePin:1,invalidateOnRefresh:true}});
    tl.to('.intro-title',{opacity:0,y:-80,duration:.55},0)
      .to('.hero-bg-photo',{scale:1.2,filter:'brightness(.68) saturate(1.12)',duration:1.4},0)
      .to('.hero-aloe',{scale:1.18,opacity:.18,duration:.75},.12)
      .fromTo('.reveal-leaf',{opacity:0,scale:.78,yPercent:8},{opacity:1,scale:1.08,yPercent:0,duration:1.25,ease:'power1.out'},.18)
      .to('.reveal-leaf',{scale:1.28,yPercent:2,duration:1.15,ease:'none'},1.15)
      .to('.drop',{opacity:(i)=>.34+(i%4)*.13,scale:(i)=>.42+(i%5)*.12,stagger:.018,duration:.42},.45)
      .to('.drop',{x:(i)=>(i-9.5)*44,y:(i)=>150+(i%5)*68,rotation:(i)=>(i%2?1:-1)*(10+i*5),duration:1.45,ease:'power1.in'},.7)
      .to('.gel-core',{opacity:1,scale:1,duration:.7},1.15)
      .to('.reveal-leaf',{opacity:.38,scale:1.42,duration:.8},1.7)
      .fromTo('.hero-bottle',{opacity:0,left:'50%',top:'50%',y:85,scale:.55,rotation:7},{opacity:1,left:'50%',top:'50%',y:0,scale:.82,rotation:5,duration:.85,ease:'power2.out'},1.55)
      .to('.halo',{opacity:.75,scale:.82,duration:.7},1.55)
      .to('.hero-bottle',{rotation:2,scale:.88,duration:.65,ease:'none'},2.18)
      .to('.hero-bottle',{rotation:-1,scale:.92,duration:.65,ease:'none'},2.78)
      .to('.hero-bottle',{rotation:-9,scale:.94,duration:.8,ease:'none'},3.38)
      .to('.drop',{y:(i)=>310+(i%5)*76,opacity:0,duration:.9},2.45)
      .to('.product-copy',{opacity:1,y:0,duration:.7},2.55)
      .to('.gel-core',{opacity:.35,scale:1.12,duration:.65},3.35)
      .to('.product-copy',{opacity:0,y:-30,duration:.45},3.75)
      .to('.reveal-leaf',{opacity:0,scale:1.5,duration:.65},3.72)
      .to('.hero-aloe',{opacity:0,duration:.5},3.72)
      .to('.hero-bg-photo',{filter:'brightness(.52) saturate(.95)',scale:1.28,duration:.75},3.72)
      .to('.gel-core',{opacity:0,duration:.45},3.82)
      .to('.hands-stage',{opacity:1,yPercent:0,scale:1,duration:.72,ease:'power2.out'},4.05)
      .to('.hero-bottle',{left:'76%',top:'64%',y:0,rotation:-9,scale:.62,duration:1.05,ease:'power1.inOut'},4.08)
      .to('.hands-stage',{scale:1.02,duration:.55,ease:'none'},4.78)
      .to('.hero-bottle',{top:'64%',left:'76%',y:0,rotation:-9,scale:.62,duration:.85,ease:'none'},5.35)
      .to('.hands-stage',{opacity:1,yPercent:0,scale:1.02,duration:.85,ease:'none'},5.35)
      .to('.hero-bg-photo',{filter:'brightness(.52) saturate(.95)',duration:.85,ease:'none'},5.35);
    gsap.utils.toArray('.ingredient-card').forEach((card,i)=>{
 const visual=card.querySelector('.ingredient-visual');
 const art=card.querySelector('.ingredient-art');
 gsap.fromTo(visual,{y:110,scale:.78,rotation:i===1?-7:7},{y:0,scale:1,rotation:0,ease:'none',scrollTrigger:{trigger:card,start:'top 98%',end:'center 58%',scrub:1}});
 gsap.fromTo(art,{scale:1.18,yPercent:10},{scale:1,yPercent:-4,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom 35%',scrub:1}});
 gsap.from(card.querySelectorAll('b,h3,p'),{opacity:0,y:35,stagger:.08,scrollTrigger:{trigger:card,start:'top 82%',end:'center 62%',scrub:1}});
}); ScrollTrigger.refresh();
   },root);
  })();
  return()=>{dead=true;if(ctx)ctx.revert();if(raf)gsap.ticker.remove(raf);if(lenis)lenis.destroy()};
 },[]);
 return <main ref={root}>
  <section className="film"><div className="screen">
   <header className="intro-ui"><a href="#" className="logo">VERDURA<span>BOTANICS</span></a><nav><a href="#collection">PRODUCTS</a><a href="#story">OUR STORY</a><a href="#ingredients">INGREDIENTS</a></nav><button>MENU <i/><i/></button></header>
   <div className="night cinematic-bg"/>
   <div className="hero-photo night"><img className="hero-bg-photo" src={ALOE} alt=""/><img className="hero-aloe" src={ALOE_ING} alt="Fresh aloe vera"/><img className="reveal-leaf" src={REVEAL} alt="Aloe vera leaf opening"/></div>
   <div className="photo-shade night"/>
   <div className="gel-core night"><span/><span/></div>
   <div className="particles night">{Array.from({length:20}).map((_,i)=><img className={'drop p'+(i%13)} src={DROP} alt="" key={i}/>)}</div>
   <div className="intro-title intro-ui night"><small>PURE BOTANICAL CARE — 01</small><h1>FROM<br/><em>NATURE.</em></h1><aside><span>POTENT PLANTS.<br/>PURER RITUALS.</span><h2>MADE<br/>FOR <em>SKIN.</em></h2></aside></div>
   <div className="halo night"/>
   <img className="hands-stage night" src={HANDS} alt="Hands receiving Verdura bottle"/>
   <div className="hero-bottle"><img className="hero-bottle-art" src={BOTTLE} alt="Verdura Aloe Vera bottle"/></div>
   <div className="product-copy"><small>01 / BOTANICAL HYDRATION</small><h2>ALOE,<br/><em>REIMAGINED.</em></h2><p>Plant becomes texture. Texture becomes ritual. A botanical story revealed by your scroll.</p><a href="#collection">DISCOVER THE RITUAL →</a></div>
   <div className="scroll intro-ui night">SCROLL TO TRANSFORM <b>↓</b></div><div className="day chapter">THE PLANT / THE FORMULA / THE RITUAL</div>
  </div></section>
  <section className="benefit-strip" aria-label="Verdura principles"><span>BOTANICAL ACTIVES</span><i/> <span>MINDFUL FORMULAS</span><i/> <span>SKIN-FIRST RITUALS</span><i/> <span>NATURE, REFINED</span></section>
  <section className="collection" id="collection"><div><small>02 / THE COLLECTION</small><h2>THE STORY BECOMES<br/><em>something you can hold.</em></h2></div><div className="ingredient-row" id="ingredients"><article className="ingredient-card aloe-card"><div className="ingredient-visual"><img className="ingredient-art" src={ALOE_ING} alt="Aloe Vera"/></div><b>01</b><h3>ALOE VERA</h3><p>HYDRATE / SOOTHE / RESET</p></article><article className="ingredient-card neem-card"><div className="ingredient-visual"><img className="ingredient-art" src={NEEM} alt="Neem leaves"/></div><b>02</b><h3>NEEM</h3><p>CLARIFY / BALANCE / CARE</p></article><article className="ingredient-card turmeric-card"><div className="ingredient-visual"><img className="ingredient-art" src={TURMERIC} alt="Turmeric"/></div><b>03</b><h3>TURMERIC</h3><p>GLOW / REVIVE / RITUAL</p></article></div>
   <div className="collection-actions"><a className="primary-cta" href="#ritual">EXPLORE THE RITUAL <span>↗</span></a><p>Three botanicals. One considered approach to everyday skin care.</p></div>
  </section>
  <section className="ritual-section" id="ritual">
   <div className="ritual-kicker"><small>03 / THE VERDURA METHOD</small><span>PLANT → FORMULA → RITUAL</span></div>
   <div className="ritual-grid">
    <div className="ritual-copy"><h2>SKINCARE,<br/><em>rooted in plants.</em></h2><p>A focused botanical ritual designed around ingredients people already know — presented with a cleaner, more considered experience.</p><a href="#ingredients">VIEW INGREDIENTS <b>→</b></a></div>
    <div className="ritual-visual"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><img src={BOTTLE} alt="Verdura botanical skincare"/><span className="float-note n1">ALOE<br/>HYDRATE</span><span className="float-note n2">NEEM<br/>BALANCE</span><span className="float-note n3">TURMERIC<br/>GLOW</span></div>
   </div>
  </section>
  <section className="promise-section" id="story"><small>04 / OUR APPROACH</small><h2>LESS NOISE.<br/>MORE <em>BOTANICAL INTENT.</em></h2><div className="promise-grid"><article><b>01</b><h3>PLANT-LED</h3><p>Familiar botanicals become the visual and sensory heart of every Verdura ritual.</p></article><article><b>02</b><h3>RITUAL-FIRST</h3><p>A calmer, more deliberate approach to the way skincare fits into everyday life.</p></article><article><b>03</b><h3>CONSIDERED</h3><p>Focused presentation, purposeful ingredients and a premium experience without unnecessary clutter.</p></article></div></section>
  <section className="final-cta"><small>VERDURA BOTANICS</small><h2>RETURN TO<br/><em>NATURE.</em></h2><a href="#collection">DISCOVER THE COLLECTION <span>→</span></a></section>
 </main>
}
