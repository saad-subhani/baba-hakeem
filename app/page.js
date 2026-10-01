'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lenis from '@studio-freight/lenis';

const ALOE='/aloe-hero.png.png';
const BOTTLE='/aloe-bottle.png.png';
const ALOE_ING='/aloe.png.png';
const NEEM='/neem.png.png';
const TURMERIC='/turmeric.png.png';

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
    gsap.from('.hero-photo',{scale:1.06,opacity:0,duration:1.7,ease:'power3.out'});
    const tl=gsap.timeline({scrollTrigger:{trigger:'.film',start:'top top',end:'bottom bottom',scrub:1,pin:'.screen',anticipatePin:1}});
    tl.to('.intro-title',{opacity:0,y:-90,duration:.7},0)
      .to('.hero-bg-photo',{scale:1.3,filter:'brightness(.78) saturate(1.12)',duration:1.75},0).to('.hero-aloe',{scale:1.38,yPercent:2,duration:1.75},0)
      .to('.cut-left',{xPercent:-55,rotation:-5,duration:1.2},.8)
      .to('.cut-right',{xPercent:55,rotation:5,duration:1.2},.8)
      .to('.gel-core',{opacity:1,scale:1,duration:.8},1)
      .to('.drop',{opacity:1,scale:1,stagger:.035,duration:.55},.65)
      .to('.drop',{x:(i)=>(i-6)*38,y:(i)=>170+(i%4)*78,rotation:(i)=>i*31,scale:(i)=>.65+(i%3)*.22,duration:1.65,ease:'power1.in'},.9)
      .to('.cut-left',{xPercent:-125,opacity:0,duration:1.2},2)
      .to('.cut-right',{xPercent:125,opacity:0,duration:1.2},2)
      .to('.hero-bg-photo',{scale:1.48,filter:'brightness(.62) saturate(1.18)',duration:1.15},1.8).to('.hero-aloe',{scale:1.72,yPercent:5,duration:1.15},1.8)
      .fromTo('.hero-bottle',{opacity:0,y:115,scale:.64,rotation:10},{opacity:1,y:0,scale:1,rotation:7,duration:1.25,ease:'power2.out'},2.12)
      .to('.halo',{opacity:1,scale:1,duration:1.2},2.2)
      .to('.product-copy',{opacity:1,y:0,duration:1},2.65)
      .to('.drop',{x:(i)=>(i-6)*76,y:(i)=>260+(i%5)*75,opacity:.15,scale:(i)=>.45+(i%3)*.2,duration:1.2},2.65)
      .to('.hero-bottle',{left:'61%',top:'49%',rotation:0,scale:1.02,duration:1.35,ease:'none'},2.75)
      .to('.screen',{backgroundColor:'#eee9dc',color:'#173226',duration:1.05},3.65)
      .to('.hero-photo',{opacity:0,duration:.75},3.65)
      .to('.night',{opacity:0,duration:.75},3.65)
      .to('.day',{opacity:1,duration:.8},3.82)
      .to('.hero-bottle',{left:'67%',top:'50%',xPercent:0,yPercent:0,rotation:0,scale:.76,duration:1.1},3.72)
      .to('.product-copy',{xPercent:-12,duration:1.2},3.7);
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
   <div className="hero-photo night"><img className="hero-bg-photo" src={ALOE} alt=""/><img className="hero-aloe" src={ALOE_ING} alt="Fresh aloe vera"/></div>
   <div className="photo-shade night"/>
   <div className="cut-left night"><img src={ALOE_ING} alt=""/></div><div className="cut-right night"><img src={ALOE_ING} alt=""/></div>
   <div className="gel-core night"><span/><span/></div>
   <div className="particles night">{Array.from({length:13}).map((_,i)=><i className={'drop p'+i} key={i}/>)}</div>
   <div className="intro-title intro-ui night"><small>PURE BOTANICAL CARE — 01</small><h1>FROM<br/><em>NATURE.</em></h1><aside><span>POTENT PLANTS.<br/>PURER RITUALS.</span><h2>MADE<br/>FOR <em>SKIN.</em></h2></aside></div>
   <div className="halo night"/>
   <img className="hero-bottle" src={BOTTLE} alt="Verdura Aloe Vera bottle"/>
   <div className="product-copy"><small>01 / BOTANICAL HYDRATION</small><h2>ALOE,<br/><em>REIMAGINED.</em></h2><p>Plant becomes texture. Texture becomes ritual. A botanical story revealed by your scroll.</p><a href="#collection">DISCOVER THE RITUAL →</a></div>
   <div className="scroll intro-ui night">SCROLL TO TRANSFORM <b>↓</b></div><div className="day chapter">THE PLANT / THE FORMULA / THE RITUAL</div>
  </div></section>
  <section className="collection" id="collection"><div><small>02 / THE COLLECTION</small><h2>THE STORY BECOMES<br/><em>something you can hold.</em></h2></div><div className="ingredient-row" id="ingredients"><article className="ingredient-card aloe-card"><div className="ingredient-visual"><img className="ingredient-art" src={ALOE_ING} alt="Aloe Vera"/></div><b>01</b><h3>ALOE VERA</h3><p>HYDRATE / SOOTHE / RESET</p></article><article className="ingredient-card neem-card"><div className="ingredient-visual"><img className="ingredient-art" src={NEEM} alt="Neem leaves"/></div><b>02</b><h3>NEEM</h3><p>CLARIFY / BALANCE / CARE</p></article><article className="ingredient-card turmeric-card"><div className="ingredient-visual"><img className="ingredient-art" src={TURMERIC} alt="Turmeric"/></div><b>03</b><h3>TURMERIC</h3><p>GLOW / REVIVE / RITUAL</p></article></div></section>
 </main>
}
