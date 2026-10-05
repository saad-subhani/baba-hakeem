'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
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
 const [adminProducts,setAdminProducts]=useState([]);
 useEffect(()=>{
  let mounted=true;
  const load=async()=>{const {data,error}=await supabase.from('products').select('*').eq('status','Published').order('featured',{ascending:false}).order('sort_order',{ascending:true}).order('created_at',{ascending:false});if(mounted&&!error)setAdminProducts(data||[]);};
  load();
  return()=>{mounted=false};
 },[]);
 useEffect(()=>{
  let ctx,lenis,raf,dead=false;
  if('scrollRestoration' in history) history.scrollRestoration='manual';
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
    const mobileHero=window.matchMedia('(max-width: 760px)').matches;
    const eggBottleLeft=mobileHero?'47%':'47%';
    const handBottleLeft=mobileHero?'70.5%':'72.8%';
    const handBottleTop=mobileHero?'88%':'64.5%';
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
      .fromTo('.hero-bottle',{opacity:0,left:eggBottleLeft,top:'50%',y:85,scale:.55,rotation:4},{opacity:1,left:eggBottleLeft,top:'50%',y:0,scale:.82,rotation:2,duration:.85,ease:'power2.out'},1.55)
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
      .to('.hero-bottle',{left:handBottleLeft,top:handBottleTop,y:0,rotation:0,scale:0.78,duration:1.05,ease:'power1.inOut'},4.08)
      .to('.hands-stage',{scale:1.02,duration:.55,ease:'none'},4.78)
      .to('.hero-bottle',{top:handBottleTop,left:handBottleLeft,y:0,rotation:0,scale:0.78,duration:.85,ease:'none'},5.35)
      .to('.hands-stage',{opacity:1,yPercent:0,scale:1.02,duration:.85,ease:'none'},5.35)
      .to('.hero-bg-photo',{filter:'brightness(.52) saturate(.95)',duration:.85,ease:'none'},5.35);
    gsap.utils.toArray('.ingredient-card').forEach((card,i)=>{
 const visual=card.querySelector('.ingredient-visual');
 const art=card.querySelector('.ingredient-art');
 gsap.fromTo(visual,{y:110,scale:.78,rotation:i===1?-7:7},{y:0,scale:1,rotation:0,ease:'none',scrollTrigger:{trigger:card,start:'top 98%',end:'center 58%',scrub:1}});
 gsap.fromTo(art,{scale:1.18,yPercent:10},{scale:1,yPercent:-4,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom 35%',scrub:1}});
 gsap.from(card.querySelectorAll('b,h3,p'),{opacity:0,y:35,stagger:.08,scrollTrigger:{trigger:card,start:'top 82%',end:'center 62%',scrub:1}});
});


    /* Premium lower-page scroll choreography.
       IMPORTANT: intentionally starts AFTER the locked cinematic system and never
       targets film, bottle, hands, gel, journey or ritual-destination elements. */
    const reveal=(target,trigger=target,vars={})=>{
      gsap.from(target,{
        opacity:0,y:58,duration:1.05,ease:'power3.out',
        ...vars,
        scrollTrigger:{trigger,start:'top 84%',toggleActions:'play none none reverse'}
      });
    };

    /* Editorial headings open like printed spreads. */
    [
      '.promise-section > h2',
      '.shop-head h2',
      '.range-heading h2',
      '.zafran-copy h2',
      '.brand-manifesto .manifesto-kicker',
      '.journal-head h2',
      '.newsletter-section h2',
      '.final-cta h2'
    ].forEach(sel=>{
      const el=document.querySelector(sel);
      if(el) gsap.from(el,{
        opacity:0,y:52,clipPath:'inset(0 0 100% 0)',duration:1.15,ease:'power4.out',
        scrollTrigger:{trigger:el,start:'top 88%',toggleActions:'play none none reverse'}
      });
    });

    /* Approach principles arrive in a measured sequence. */
    gsap.from('.promise-grid article',{
      opacity:0,y:52,stagger:.13,duration:.9,ease:'power3.out',
      scrollTrigger:{trigger:'.promise-grid',start:'top 84%',toggleActions:'play none none reverse'}
    });

    /* Product collection opens as a staggered luxury catalogue. */
    gsap.from('.category-tabs button',{
      opacity:0,y:18,stagger:.07,duration:.55,ease:'power2.out',
      scrollTrigger:{trigger:'.category-tabs',start:'top 88%',toggleActions:'play none none reverse'}
    });
    gsap.from('.real-product-grid .shop-card',{
      opacity:0,y:72,scale:.965,stagger:.09,duration:1,ease:'power3.out',
      scrollTrigger:{trigger:'.real-product-grid',start:'top 86%',toggleActions:'play none none reverse'}
    });

    /* Dark range section: copy and product panels enter from opposite directions. */
    reveal('.range-heading','.range-section',{x:-42,y:0});
    gsap.from('.range-panels article',{
      opacity:0,x:64,stagger:.16,duration:1.05,ease:'power3.out',
      scrollTrigger:{trigger:'.range-panels',start:'top 84%',toggleActions:'play none none reverse'}
    });

    /* Zafran feature behaves like a cinematic split-screen reveal. */
    gsap.from('.zafran-photo',{
      opacity:0,x:-70,clipPath:'inset(0 100% 0 0)',duration:1.2,ease:'power4.out',
      scrollTrigger:{trigger:'.zafran-feature',start:'top 82%',toggleActions:'play none none reverse'}
    });
    gsap.from('.zafran-copy > *',{
      opacity:0,x:42,stagger:.09,duration:.8,ease:'power3.out',
      scrollTrigger:{trigger:'.zafran-feature',start:'top 78%',toggleActions:'play none none reverse'}
    });

    /* Manifesto lines and journal stories unfold instead of simply appearing. */
    gsap.from('.manifesto-grid > *',{
      opacity:0,y:42,stagger:.11,duration:.85,ease:'power3.out',
      scrollTrigger:{trigger:'.manifesto-grid',start:'top 84%',toggleActions:'play none none reverse'}
    });
    gsap.from('.journal-grid article',{
      opacity:0,y:68,stagger:.13,duration:1,ease:'power3.out',
      scrollTrigger:{trigger:'.journal-grid',start:'top 84%',toggleActions:'play none none reverse'}
    });

    /* Gentle image parallax adds motion without changing layout or product sizing. */
    gsap.utils.toArray('.range-panels img,.zafran-photo img,.journal-visual img').forEach(img=>{
      gsap.fromTo(img,{yPercent:-4},{yPercent:4,ease:'none',
        scrollTrigger:{trigger:img,start:'top bottom',end:'bottom top',scrub:.8}
      });
    });

    /* Closing sections finish with a restrained upward reveal. */
    gsap.from('.newsletter-section > small,.newsletter-section > p,.newsletter-section form,.newsletter-meta',{
      opacity:0,y:34,stagger:.09,duration:.8,ease:'power3.out',
      scrollTrigger:{trigger:'.newsletter-section',start:'top 82%',toggleActions:'play none none reverse'}
    });
    gsap.from('.final-cta > small,.final-cta > a',{
      opacity:0,y:28,stagger:.12,duration:.8,ease:'power3.out',
      scrollTrigger:{trigger:'.final-cta',start:'top 82%',toggleActions:'play none none reverse'}
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
      gsap.set(destination,{opacity:0});

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
          const approach=clamp((p-.88)/.12,0,1);
          const ease=approach*approach*(3-2*approach);

          /* Stable visible size while travelling. The PNG itself has transparent
             padding, so this wrapper is intentionally generous and stays constant
             until the final orbit approach. */
          const railW=window.innerWidth<760 ? 180 : 270;
          const railH=window.innerWidth<760 ? 320 : 480;
          const railX=window.innerWidth-(window.innerWidth<760 ? 218 : 330);
          const railY=window.innerHeight*.30;

          /* Match the new transparent bottle to its actual visual footprint.
             Start from the exact rendered hero bottle rectangle so there is no
             size jump when the fixed travelling copy takes over. */
          const depart=clamp(p/.22,0,1);
          const departEase=depart*depart*(3-2*depart);
          const handW=window.innerWidth<760 ? 155 : 220;
          const handH=window.innerWidth<760 ? 280 : 390;
          const handX=window.innerWidth*.752-handW/2;
          const handY=window.innerHeight*.645-handH/2;

          const travelX=lerp(handX,railX,departEase);
          const travelY=lerp(handY,railY,departEase);
          const travelW=lerp(handW,railW,departEase);
          const travelH=lerp(handH,railH,departEase);

          const targetW=window.innerWidth<760 ? 150 : 220;
          const targetH=window.innerWidth<760 ? 270 : 390;
          const targetX=rect.left+(rect.width-targetW)/2;
          const targetY=rect.top+(rect.height-targetH)/2;

          const x=lerp(travelX,targetX,ease);
          const y=lerp(travelY,targetY,ease);
          const w=lerp(travelW,targetW,ease);
          const h=lerp(travelH,targetH,ease);

          gsap.set('.hero-bottle',{autoAlpha:p>.02?0:1});
          gsap.set(journey,{
            autoAlpha:(p>.02 && p<.995)?1:0,
            left:x,
            top:y,
            width:w,
            height:h,
            rotation:lerp(-4,0,ease)
          });

          /* Handoff before the section is fully centered, preventing the
             oversized/cropped travelling bottle seen in the recording. */
          const handoff=clamp((p-.965)/.03,0,1);
          gsap.set(journey,{opacity:1-handoff});
          gsap.set(destination,{opacity:handoff});
        },
        onLeave:()=>{gsap.set('.hero-bottle',{autoAlpha:0});gsap.set(journey,{autoAlpha:0});gsap.set(destination,{opacity:1});},
        onLeaveBack:()=>{gsap.set('.hero-bottle',{autoAlpha:1});gsap.set(journey,{autoAlpha:0});gsap.set(destination,{opacity:0});}
      });;
    }
    ScrollTrigger.refresh();
    requestAnimationFrame(()=>{ScrollTrigger.refresh();window.scrollTo(0,0);lenis?.scrollTo(0,{immediate:true});});
   },root);
  })();
  return()=>{dead=true;if(ctx)ctx.revert();if(raf)gsap.ticker.remove(raf);if(lenis)lenis.destroy()};
 },[]);
 return <main ref={root}>
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
