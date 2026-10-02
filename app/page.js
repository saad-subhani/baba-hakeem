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
      .to('.hero-bottle',{left:'76%',top:'67%',y:0,rotation:-9,scale:.60,duration:1.05,ease:'power1.inOut'},4.08)
      .to('.hands-stage',{scale:1.02,duration:.55,ease:'none'},4.78)
      .to('.hero-bottle',{top:'67%',left:'76%',y:0,rotation:-9,scale:.60,duration:.85,ease:'none'},5.35)
      .to('.hands-stage',{opacity:1,yPercent:0,scale:1.02,duration:.85,ease:'none'},5.35)
      .to('.hero-bg-photo',{filter:'brightness(.52) saturate(.95)',duration:.85,ease:'none'},5.35);
    gsap.utils.toArray('.ingredient-card').forEach((card,i)=>{
 const visual=card.querySelector('.ingredient-visual');
 const art=card.querySelector('.ingredient-art');
 gsap.fromTo(visual,{y:110,scale:.78,rotation:i===1?-7:7},{y:0,scale:1,rotation:0,ease:'none',scrollTrigger:{trigger:card,start:'top 98%',end:'center 58%',scrub:1}});
 gsap.fromTo(art,{scale:1.18,yPercent:10},{scale:1,yPercent:-4,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom 35%',scrub:1}});
 gsap.from(card.querySelectorAll('b,h3,p'),{opacity:0,y:35,stagger:.08,scrollTrigger:{trigger:card,start:'top 82%',end:'center 62%',scrub:1}});
});

    /* Continue the SAME product story after the approved handoff.
       A fixed duplicate leaves the hands, follows scroll, then hands off invisibly
       to the bottle already living inside THE HERBAL METHOD. */
    const journey=document.querySelector('.bottle-journey');
    const journeyArt=journey?.querySelector('img');
    const destination=document.querySelector('.ritual-destination-bottle');
    const benefit=document.querySelector('.benefit-strip');
    if(journey && journeyArt && destination && benefit){
      gsap.set(journey,{autoAlpha:0});
      gsap.set(destination,{opacity:1});

      const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
      const lerp=(a,b,t)=>a+(b-a)*t;

      ScrollTrigger.create({
        trigger:benefit,
        start:'top bottom',
        endTrigger:destination,
        end:'center center',
        scrub:.65,
        invalidateOnRefresh:true,
        onUpdate:self=>{
          const p=clamp(self.progress,0,1);
          const rect=destination.getBoundingClientRect();

          /* Keep the travelling product elegant and out of the content:
             it follows a slim right-side rail, then only approaches/grows
             into the Herbal Method orbit near the end. */
          const approach=clamp((p-.72)/.28,0,1);
          const ease=approach*approach*(3-2*approach);

          const railW=window.innerWidth<760 ? 82 : 118;
          const railH=railW*2.05;
          const railX=window.innerWidth-(window.innerWidth<760 ? 102 : 165);
          const railY=window.innerHeight*.34;

          const targetX=rect.left;
          const targetY=rect.top;
          const targetW=rect.width;
          const targetH=rect.height;

          const x=lerp(railX,targetX,ease);
          const y=lerp(railY,targetY,ease);
          const w=lerp(railW,targetW,ease);
          const h=lerp(railH,targetH,ease);

          gsap.set('.hero-bottle',{autoAlpha:p>.02?0:1});
          gsap.set(journey,{
            autoAlpha:(p>.02 && p<.965)?1:0,
            left:x,
            top:y,
            width:w,
            height:h,
            rotation:lerp(-4,0,ease)
          });
          gsap.set(journeyArt,{rotation:lerp(-10,0,ease)});

          /* Handoff before the section is fully centered, preventing the
             oversized/cropped travelling bottle seen in the recording. */
          const handoff=clamp((p-.88)/.08,0,1);
          gsap.set(journey,{opacity:(p<.88?1:1-handoff)});
          gsap.set(destination,{opacity:handoff});
        },
        onLeave:()=>{gsap.set('.hero-bottle',{autoAlpha:0});gsap.set(journey,{autoAlpha:0});gsap.set(destination,{opacity:1});},
        onLeaveBack:()=>{gsap.set('.hero-bottle',{autoAlpha:1});gsap.set(journey,{autoAlpha:0});gsap.set(destination,{opacity:1});}
      });;
    }
    ScrollTrigger.refresh();
   },root);
  })();
  return()=>{dead=true;if(ctx)ctx.revert();if(raf)gsap.ticker.remove(raf);if(lenis)lenis.destroy()};
 },[]);
 return <main ref={root}>
  <section className="film"><div className="screen">
   <header className="intro-ui"><a href="#" className="logo">HERBAL<span>BOTANICS</span></a><nav><a href="#collection">PRODUCTS</a><a href="#story">OUR STORY</a><a href="#ingredients">INGREDIENTS</a></nav><button>MENU <i/><i/></button></header>
   <div className="night cinematic-bg"/>
   <div className="hero-photo night"><img className="hero-bg-photo" src={ALOE} alt=""/><img className="hero-aloe" src={ALOE_ING} alt="Fresh aloe vera"/><img className="reveal-leaf" src={REVEAL} alt="Aloe vera leaf opening"/></div>
   <div className="photo-shade night"/>
   <div className="gel-core night"><span/><span/></div>
   <div className="particles night">{Array.from({length:20}).map((_,i)=><img className={'drop p'+(i%13)} src={DROP} alt="" key={i}/>)}</div>
   <div className="intro-title intro-ui night"><small>PURE BOTANICAL CARE — 01</small><h1>FROM<br/><em>NATURE.</em></h1><aside><span>POTENT PLANTS.<br/>PURER RITUALS.</span><h2>MADE<br/>FOR <em>SKIN.</em></h2></aside></div>
   <div className="halo night"/>
   <img className="hands-stage night" src={HANDS} alt="Hands receiving Herbal bottle"/>
   <div className="hero-bottle"><img className="hero-bottle-art" src={BOTTLE} alt="Herbal Aloe Vera bottle"/></div>
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
    <div className="ritual-visual"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><img className="ritual-destination-bottle" src={BOTTLE} alt="Herbal botanical skincare"/><span className="float-note n1">ALOE<br/>HYDRATE</span><span className="float-note n2">NEEM<br/>BALANCE</span><span className="float-note n3">TURMERIC<br/>GLOW</span></div>
   </div>
  </section>
  <section className="promise-section" id="story"><small>04 / OUR APPROACH</small><h2>LESS NOISE.<br/>MORE <em>BOTANICAL INTENT.</em></h2><div className="promise-grid"><article><b>01</b><h3>PLANT-LED</h3><p>Familiar botanicals become the visual and sensory heart of every Herbal ritual.</p></article><article><b>02</b><h3>RITUAL-FIRST</h3><p>A calmer, more deliberate approach to the way skincare fits into everyday life.</p></article><article><b>03</b><h3>CONSIDERED</h3><p>Focused presentation, purposeful ingredients and a premium experience without unnecessary clutter.</p></article></div></section>
  <section className="shop-section" id="shop">
   <div className="shop-head"><div><small>05 / SHOP HERBAL</small><h2>BUILD YOUR<br/><em>BOTANICAL ROUTINE.</em></h2></div><p>Explore everyday botanical care by ritual, ingredient and skin goal.</p></div>
   <div className="category-tabs"><button className="active">ALL PRODUCTS</button><button>HYDRATION</button><button>CLARIFY</button><button>GLOW</button><button>ESSENTIALS</button></div>
   <div className="product-grid">
    <article className="shop-card featured"><div className="badge">BESTSELLER</div><div className="shop-art aloe-tone"><img src={BOTTLE} alt="Aloe Vera botanical serum"/></div><div className="shop-info"><div><small>HYDRATION / 30 ML</small><h3>ALOE VERA SERUM</h3><p>Daily botanical hydration ritual.</p></div><button aria-label="Add Aloe Vera Serum">ADD <span>＋</span></button></div></article>
    <article className="shop-card"><div className="badge">BOTANICAL</div><div className="shop-art neem-tone"><img src={BOTTLE} alt="Neem botanical concentrate"/><img className="botanical-accent neem-accent" src={NEEM} alt=""/></div><div className="shop-info"><div><small>CLARIFY / 30 ML</small><h3>NEEM CONCENTRATE</h3><p>A balancing botanical ritual.</p></div><button aria-label="Add Neem Concentrate">ADD <span>＋</span></button></div></article>
    <article className="shop-card"><div className="badge">GLOW RITUAL</div><div className="shop-art turmeric-tone"><img src={BOTTLE} alt="Turmeric glow elixir"/><img className="botanical-accent turmeric-accent" src={TURMERIC} alt=""/></div><div className="shop-info"><div><small>GLOW / 30 ML</small><h3>TURMERIC ELIXIR</h3><p>A radiance-focused botanical ritual.</p></div><button aria-label="Add Turmeric Elixir">ADD <span>＋</span></button></div></article>
    <article className="shop-card"><div className="badge">ROUTINE</div><div className="shop-art trio-tone"><img className="trio t1" src={BOTTLE} alt="Herbal botanical routine"/><img className="trio t2" src={BOTTLE} alt=""/><img className="trio t3" src={BOTTLE} alt=""/></div><div className="shop-info"><div><small>COMPLETE RITUAL</small><h3>BOTANICAL TRIO</h3><p>Three-step Herbal discovery set.</p></div><button aria-label="Add Botanical Trio">ADD <span>＋</span></button></div></article>
   </div>
  </section>
  <section className="shop-by">
   <div className="shop-by-head"><small>06 / FIND YOUR RITUAL</small><h2>SHOP BY<br/><em>what your skin needs.</em></h2></div>
   <div className="need-grid"><a href="#shop"><span>01</span><h3>HYDRATE</h3><p>ALOE VERA</p><b>↗</b></a><a href="#shop"><span>02</span><h3>BALANCE</h3><p>NEEM</p><b>↗</b></a><a href="#shop"><span>03</span><h3>GLOW</h3><p>TURMERIC</p><b>↗</b></a><a href="#shop"><span>04</span><h3>DISCOVER</h3><p>THE FULL ROUTINE</p><b>↗</b></a></div>
  </section>
  <section className="commerce-confidence"><div><b>01</b><h3>BOTANICAL FOCUS</h3><p>Ingredient-led routines with a clear purpose.</p></div><div><b>02</b><h3>CURATED ROUTINES</h3><p>Simple categories make product discovery easier.</p></div><div><b>03</b><h3>PREMIUM EXPERIENCE</h3><p>From first scroll to product selection, every detail feels considered.</p></div></section>
  <section className="editorial-break">
   <div className="editorial-number">07</div><div className="editorial-copy"><small>BOTANICAL INTELLIGENCE / DAILY RITUAL</small><h2>YOUR SKIN.<br/><em>YOUR RITUAL.</em></h2><p>Build a simple routine around the botanical experience that feels right for you.</p><a href="#shop">SHOP THE COLLECTION <span>↗</span></a></div>
   <div className="editorial-art"><span className="plant-word">ALOE</span><img src={BOTTLE} alt="Herbal Botanics Aloe Vera serum"/><i className="ring r1"/><i className="ring r2"/></div>
  </section>
  <section className="routine-builder">
   <div className="routine-title"><small>08 / THREE STEPS</small><h2>A BETTER ROUTINE,<br/><em>made simple.</em></h2></div>
   <div className="routine-steps"><article><b>01</b><span>AM / PM</span><h3>PREPARE</h3><p>Begin with clean skin and make space for a focused botanical ritual.</p></article><article><b>02</b><span>2–3 DROPS</span><h3>TREAT</h3><p>Choose your botanical focus and press the formula gently into the skin.</p></article><article><b>03</b><span>DAILY</span><h3>REPEAT</h3><p>Keep the ritual consistent, uncomplicated and easy to return to.</p></article></div>
  </section>
  <section className="journal-section">
   <div className="journal-head"><div><small>09 / BOTANICAL JOURNAL</small><h2>READ THE<br/><em>ingredient story.</em></h2></div><a href="#ingredients">EXPLORE ALL <span>→</span></a></div>
   <div className="journal-grid"><article><div className="journal-visual j-aloe"><img src={ALOE_ING} alt="Aloe Vera"/></div><small>INGREDIENT 01</small><h3>WHY ALOE BELONGS IN A DAILY RITUAL</h3><a href="#ingredients">DISCOVER ALOE ↗</a></article><article><div className="journal-visual j-neem"><img src={NEEM} alt="Neem"/></div><small>INGREDIENT 02</small><h3>THE BOTANICAL CHARACTER OF NEEM</h3><a href="#ingredients">DISCOVER NEEM ↗</a></article><article><div className="journal-visual j-turmeric"><img src={TURMERIC} alt="Turmeric"/></div><small>INGREDIENT 03</small><h3>TURMERIC, COLOUR AND THE GLOW RITUAL</h3><a href="#ingredients">DISCOVER TURMERIC ↗</a></article></div>
  </section>
  <section className="newsletter-section"><small>THE HERBAL LETTER</small><h2>BOTANICAL NOTES,<br/><em>occasionally.</em></h2><p>New rituals, ingredient stories and collection updates.</p><form onSubmit={(e)=>e.preventDefault()}><input type="email" aria-label="Email address" placeholder="YOUR EMAIL ADDRESS" required/><button type="submit">JOIN <span>→</span></button></form><div className="newsletter-meta"><span>HERBAL BOTANICS © 2026</span><span>BOTANICAL SKINCARE / CONSIDERED RITUALS</span></div></section>
  <section className="final-cta"><small>HERBAL BOTANICS</small><h2>RETURN TO<br/><em>NATURE.</em></h2><a href="#collection">DISCOVER THE COLLECTION <span>→</span></a></section>
 </main>
}
