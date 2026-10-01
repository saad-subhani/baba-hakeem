'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lenis from '@studio-freight/lenis';

const ALOE='https://images.squarespace-cdn.com/content/v1/5b1684bd9772aeb3c1aca850/1528203143729-S6WBUGD1X0V80D7VF5K9/1080x1080_aloe.jpg?format=1000w';

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
    gsap.from('.macro',{scale:1.15,opacity:0,duration:1.7,ease:'power3.out'});
    const tl=gsap.timeline({scrollTrigger:{trigger:'.film',start:'top top',end:'bottom bottom',scrub:1,pin:'.screen',anticipatePin:1}});
    tl.to('.intro-title',{opacity:0,y:-90,duration:.7},0)
      .to('.macro',{scale:1.7,yPercent:7,filter:'brightness(.55)',duration:1.4},0)
      .to('.cut-left',{xPercent:-47,rotation:-5,duration:1.2},.8)
      .to('.cut-right',{xPercent:47,rotation:5,duration:1.2},.8)
      .to('.gel-core',{opacity:1,scale:1,duration:.8},1)
      .to('.drop',{opacity:1,scale:1,stagger:.035,duration:.65},1.15)
      .to('.drop',{x:(i)=>(i%2?1:-1)*(45+i*17),y:(i)=>-90-(i%4)*55,rotation:(i)=>i*31,duration:1.4},1.7)
      .to('.cut-left',{xPercent:-115,opacity:0,duration:1.2},2)
      .to('.cut-right',{xPercent:115,opacity:0,duration:1.2},2)
      .to('.macro',{opacity:0,scale:2.05,duration:1},2.1)
      .to('.product',{opacity:1,scale:1,y:0,duration:1.35},2.15)
      .to('.halo',{opacity:1,scale:1,duration:1.2},2.2)
      .to('.product-copy',{opacity:1,y:0,duration:1},2.65)
      .to('.drop',{x:(i)=>(i-6)*70,y:(i)=>-210+(i%5)*75,scale:(i)=>.55+(i%3)*.25,duration:1.3},2.65)
      .to('.screen',{backgroundColor:'#eee9dc',color:'#173226',duration:1.25},3.55)
      .to('.night',{opacity:0,duration:.8},3.55)
      .to('.day',{opacity:1,duration:.9},3.75)
      .to('.product',{xPercent:95,scale:.78,duration:1.2},3.7)
      .to('.product-copy',{xPercent:-12,duration:1.2},3.7);
    ScrollTrigger.refresh();
   },root);
  })();
  return()=>{dead=true;if(ctx)ctx.revert();if(raf)gsap.ticker.remove(raf);if(lenis)lenis.destroy()};
 },[]);
 return <main ref={root}>
  <section className="film"><div className="screen">
   <header className="intro-ui"><a href="#" className="logo">VERDURA<span>BOTANICS</span></a><nav><a href="#collection">PRODUCTS</a><a href="#story">OUR STORY</a><a href="#ingredients">INGREDIENTS</a></nav><button>MENU <i/><i/></button></header>
   <div className="night cinematic-bg"/>
   <img className="macro night" src={ALOE} alt="Fresh aloe vera with water droplets"/>
   <div className="cut-left night"><img src={ALOE} alt=""/></div><div className="cut-right night"><img src={ALOE} alt=""/></div>
   <div className="gel-core night"><span/><span/></div>
   <div className="particles night">{Array.from({length:13}).map((_,i)=><i className={'drop p'+i} key={i}/>)}</div>
   <div className="intro-title intro-ui night"><small>PURE BOTANICAL CARE — 01</small><h1>FROM<br/><em>NATURE.</em></h1><aside><span>POTENT PLANTS.<br/>PURER RITUALS.</span><h2>MADE<br/>FOR <em>SKIN.</em></h2></aside></div>
   <div className="halo night"/>
   <div className="product"><div className="pipette"/><div className="bottle"><small>VERDURA</small><b>ALOE<br/>VERA</b><span>BOTANICAL CONCENTRATE<br/>30 ML</span></div></div>
   <div className="product-copy"><small>01 / BOTANICAL HYDRATION</small><h2>ALOE,<br/><em>REIMAGINED.</em></h2><p>Plant becomes texture. Texture becomes ritual. A botanical story revealed by your scroll.</p><a href="#collection">DISCOVER THE RITUAL →</a></div>
   <div className="scroll intro-ui night">SCROLL TO TRANSFORM <b>↓</b></div><div className="day chapter">THE PLANT / THE FORMULA / THE RITUAL</div>
  </div></section>
  <section className="collection" id="collection"><div><small>02 / THE COLLECTION</small><h2>THE STORY BECOMES<br/><em>something you can hold.</em></h2></div><div className="ingredient-row" id="ingredients"><article><b>01</b><h3>ALOE VERA</h3><p>HYDRATE / SOOTHE / RESET</p></article><article><b>02</b><h3>NEEM</h3><p>CLARIFY / BALANCE / CARE</p></article><article><b>03</b><h3>TURMERIC</h3><p>GLOW / REVIVE / RITUAL</p></article></div></section>
 </main>
}
