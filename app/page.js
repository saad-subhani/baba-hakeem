'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lenis from '@studio-freight/lenis';

const ALOE='/verdura-reference.webp.png';
const BOTTLE='/verdura-reference.webp.png';

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
    gsap.from('.hero-photo',{scale:1.04,opacity:0,duration:1.7,ease:'power3.out'});
    const tl=gsap.timeline({scrollTrigger:{trigger:'.film',start:'top top',end:'bottom bottom',scrub:1,pin:'.screen',anticipatePin:1}});
    tl.to('.intro-title',{opacity:0,y:-90,duration:.7},0)
      .to('.hero-photo',{scale:1.13,filter:'brightness(.58) saturate(1.08)',duration:1.45},0)
      .to('.cut-left',{xPercent:-55,rotation:-5,duration:1.2},.8)
      .to('.cut-right',{xPercent:55,rotation:5,duration:1.2},.8)
      .to('.gel-core',{opacity:1,scale:1,duration:.8},1)
      .to('.drop',{opacity:1,scale:1,stagger:.035,duration:.65},1.15)
      .to('.drop',{x:(i)=>(i%2?1:-1)*(45+i*17),y:(i)=>-90-(i%4)*55,rotation:(i)=>i*31,duration:1.4},1.7)
      .to('.cut-left',{xPercent:-125,opacity:0,duration:1.2},2)
      .to('.cut-right',{xPercent:125,opacity:0,duration:1.2},2)
      .to('.hero-photo',{opacity:0,scale:1.45,duration:1},2.1)
      .to('.real-product',{opacity:1,scale:1,y:0,rotation:7,duration:1.35},2.15)
      .to('.halo',{opacity:1,scale:1,duration:1.2},2.2)
      .to('.product-copy',{opacity:1,y:0,duration:1},2.65)
      .to('.drop',{x:(i)=>(i-6)*70,y:(i)=>-210+(i%5)*75,scale:(i)=>.55+(i%3)*.25,duration:1.3},2.65)
      .to('.screen',{backgroundColor:'#eee9dc',color:'#173226',duration:1.25},3.55)
      .to('.night',{opacity:0,duration:.8},3.55)
      .to('.day',{opacity:1,duration:.9},3.75)
      .to('.real-product',{xPercent:72,yPercent:3,rotation:7,scale:.86,duration:1.2},3.7)
      .to('.product-copy',{xPercent:-12,duration:1.2},3.7);
    gsap.utils.toArray('.ingredient-card').forEach((card,i)=>{gsap.fromTo(card.querySelector('.ingredient-visual'),{y:90,scale:.82,rotation:i===1?-5:5},{y:0,scale:1,rotation:0,ease:'none',scrollTrigger:{trigger:card,start:'top 95%',end:'center 55%',scrub:1}});gsap.from(card.querySelectorAll('b,h3,p'),{opacity:0,y:35,stagger:.08,scrollTrigger:{trigger:card,start:'top 80%',end:'center 60%',scrub:1}})}); ScrollTrigger.refresh();
   },root);
  })();
  return()=>{dead=true;if(ctx)ctx.revert();if(raf)gsap.ticker.remove(raf);if(lenis)lenis.destroy()};
 },[]);
 return <main ref={root}>
  <section className="film"><div className="screen">
   <header className="intro-ui"><a href="#" className="logo">VERDURA<span>BOTANICS</span></a><nav><a href="#collection">PRODUCTS</a><a href="#story">OUR STORY</a><a href="#ingredients">INGREDIENTS</a></nav><button>MENU <i/><i/></button></header>
   <div className="night cinematic-bg"/>
   <img className="hero-photo night" src={ALOE} alt="Verdura Botanics aloe hero composition" onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1775204059233-c59e8599ebe3?auto=format&fit=crop&fm=jpg&q=90&w=2400'}}/>
   <div className="photo-shade night"/>
   <div className="cut-left night"><img src={ALOE} alt=""/></div><div className="cut-right night"><img src={ALOE} alt=""/></div>
   <div className="gel-core night"><span/><span/></div>
   <div className="particles night">{Array.from({length:13}).map((_,i)=><i className={'drop p'+i} key={i}/>)}</div>
   <div className="intro-title intro-ui night"><small>PURE BOTANICAL CARE — 01</small><h1>FROM<br/><em>NATURE.</em></h1><aside><span>POTENT PLANTS.<br/>PURER RITUALS.</span><h2>MADE<br/>FOR <em>SKIN.</em></h2></aside></div>
   <div className="halo night"/>
   <div className="real-product"><img src={BOTTLE} alt="Verdura Aloe Vera bottle" onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1764656424627-1fa7e5e7c2ed?auto=format&fit=crop&fm=jpg&q=90&w=1600'}}/></div>
   <div className="product-copy"><small>01 / BOTANICAL HYDRATION</small><h2>ALOE,<br/><em>REIMAGINED.</em></h2><p>Plant becomes texture. Texture becomes ritual. A botanical story revealed by your scroll.</p><a href="#collection">DISCOVER THE RITUAL →</a></div>
   <div className="scroll intro-ui night">SCROLL TO TRANSFORM <b>↓</b></div><div className="day chapter">THE PLANT / THE FORMULA / THE RITUAL</div>
  </div></section>
  <section className="collection" id="collection"><div><small>02 / THE COLLECTION</small><h2>THE STORY BECOMES<br/><em>something you can hold.</em></h2></div><div className="ingredient-row" id="ingredients"><article className="ingredient-card aloe-card"><div className="ingredient-visual"/><b>01</b><h3>ALOE VERA</h3><p>HYDRATE / SOOTHE / RESET</p></article><article className="ingredient-card neem-card"><div className="ingredient-visual"/><b>02</b><h3>NEEM</h3><p>CLARIFY / BALANCE / CARE</p></article><article className="ingredient-card turmeric-card"><div className="ingredient-visual"/><b>03</b><h3>TURMERIC</h3><p>GLOW / REVIVE / RITUAL</p></article></div></section>
 </main>
}
