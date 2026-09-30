'use client';
import {useEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import Lenis from '@studio-freight/lenis';

const products=[
{name:'Neem Cloud Cleanser',price:3200,tag:'PURIFY',image:'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=88'},
{name:'Turmeric Glow Oil',price:4700,tag:'ILLUMINATE',image:'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1200&q=88'},
{name:'Aloe Water Gel',price:2800,tag:'SOOTHE',image:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=88'}
];
const scenes=[
['NEEM','PURIFY','A botanical cleansing ritual for a fresh, balanced skin feel.','#d9e6bf'],
['TURMERIC','GLOW','A warm golden ritual inspired by traditional botanical care.','#e4b650'],
['ALOE','HYDRATE','Cooling hydration with a soft, weightless finish.','#b9ddd0'],
['AMLA','NOURISH','A rich herbal ritual inspired by South Asian hair traditions.','#b7c58c']
];
export default function Home(){
 const root=useRef(null),journey=useRef(null); const [active,setActive]=useState(0),[cart,setCart]=useState([]),[loading,setLoading]=useState(true),[count,setCount]=useState(0);
 useEffect(()=>{let raf;const started=performance.now(),duration=2300;const run=t=>{const p=Math.min(1,(t-started)/duration);const eased=1-Math.pow(1-p,3);setCount(Math.round(eased*100));if(p<1)raf=requestAnimationFrame(run);else setTimeout(()=>setLoading(false),180)};raf=requestAnimationFrame(run);return()=>cancelAnimationFrame(raf)},[]);
 useEffect(()=>{if(loading)return;let ctx,lenis,tick,cancel=false;(async()=>{
  const {ScrollTrigger}=await import('gsap/ScrollTrigger'); if(cancel)return; gsap.registerPlugin(ScrollTrigger);
  lenis=new Lenis({duration:1.05,smoothWheel:true}); lenis.on('scroll',ScrollTrigger.update); tick=t=>lenis.raf(t*1000); gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
  ctx=gsap.context(()=>{
   gsap.from('.intro-line span',{yPercent:110,stagger:.08,duration:1.1,ease:'power4.out'});
   gsap.to('.hero-pack',{yPercent:45,rotate:10,scale:.82,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
   gsap.to('.hero-art',{scale:1.18,yPercent:10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
   gsap.utils.toArray('.fadeup').forEach(el=>gsap.from(el,{opacity:0,y:80,duration:1,scrollTrigger:{trigger:el,start:'top 85%'}}));
   gsap.utils.toArray('.scene').forEach((el,i)=>ScrollTrigger.create({trigger:el,start:'top center',end:'bottom center',onEnter:()=>setActive(i),onEnterBack:()=>setActive(i)}));
   gsap.to('.journey-pack',{rotate:18,y:80,ease:'none',scrollTrigger:{trigger:journey.current,start:'top top',end:'bottom bottom',scrub:1}});
   const dot=document.querySelector('.cursor-dot'),ring=document.querySelector('.cursor-ring');const move=e=>{gsap.to(dot,{x:e.clientX,y:e.clientY,duration:.08});gsap.to(ring,{x:e.clientX,y:e.clientY,duration:.38,ease:'power3.out'})};window.addEventListener('mousemove',move);ctx.add(()=>window.removeEventListener('mousemove',move));
   gsap.utils.toArray('.card,.tile,.split-img').forEach(el=>{gsap.to(el,{y:-28,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1.2}})});
   gsap.to('.round-word',{rotate:28,scale:1.12,ease:'none',scrollTrigger:{trigger:'.collage',start:'top bottom',end:'bottom top',scrub:1}});
   gsap.to('.ticker-inner',{xPercent:-35,ease:'none',scrollTrigger:{trigger:'.ticker',start:'top bottom',end:'bottom top',scrub:1}});
   gsap.to('.principles-track',{x:()=>-(document.querySelector('.principles-track').scrollWidth-window.innerWidth+80),ease:'none',scrollTrigger:{trigger:'.principles-wrap',start:'top top',end:'+=2600',scrub:1,pin:true,invalidateOnRefresh:true}});
   gsap.fromTo('.ethos-word',{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',ease:'none',scrollTrigger:{trigger:'.ethos',start:'top 75%',end:'top 25%',scrub:1}});
   gsap.utils.toArray('.reveal-img').forEach(el=>gsap.fromTo(el,{clipPath:'inset(100% 0 0 0)',scale:1.12},{clipPath:'inset(0% 0 0 0)',scale:1,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%',end:'top 35%',scrub:1}}));
   gsap.utils.toArray('.float-scene').forEach(scene=>{
    ScrollTrigger.create({trigger:scene,start:'top bottom',end:'bottom top',onUpdate:self=>{
      const p=self.progress;
      const hero=scene.querySelector('.float-hero');
      if(hero) gsap.set(hero,{y:(.5-p)*150,rotation:(p-.5)*2});
      scene.querySelectorAll('.float-card').forEach((card,i)=>{
        const speed=[430,600,760][i]||500;
        gsap.set(card,{y:(.5-p)*speed,rotation:(p-.5)*(i%2?5:-4)});
      });
    }});
   });
   gsap.utils.toArray('.motion-band').forEach((el,i)=>gsap.fromTo(el,{xPercent:i%2?-10:10},{xPercent:i%2?12:-12,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:true}}));
   /* legacy float tweens disabled in favor of explicit progress mapping */
   gsap.utils.toArray('.float-scene-disabled').forEach(scene=>{
    const hero=scene.querySelector('.float-hero');
    gsap.to(hero,{y:-90,ease:'none',scrollTrigger:{trigger:scene,start:'top bottom',end:'bottom top',scrub:true}});
    scene.querySelectorAll('.float-card').forEach((card,i)=>{
      const speed=Number(card.dataset.speed||1);
      gsap.to(card,{y:-(260*speed),ease:'none',scrollTrigger:{trigger:scene,start:'top bottom',end:'bottom top',scrub:true}});
    });
   });
   gsap.utils.toArray('.tk-window').forEach(section=>{
    const media=section.querySelector('.tk-window-media'),img=section.querySelector('.tk-window-media img');
    const tl=gsap.timeline({scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:true,invalidateOnRefresh:true}});
    tl.fromTo(media,{clipPath:'inset(12% 26% 12% 26%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1,ease:'none'})
      .to(media,{clipPath:'inset(15% 20% 15% 20%)',duration:1,ease:'none'});
    tl.fromTo(img,{scale:1.32,yPercent:-7},{scale:1.02,yPercent:7,duration:2,ease:'none'},0);
   });
   gsap.utils.toArray('.crop-story').forEach(section=>{
    const frame=section.querySelector('.crop-frame'),img=section.querySelector('.crop-media img'),copy=section.querySelector('.crop-copy');
    const tl=gsap.timeline({scrollTrigger:{trigger:section,start:'top top',end:'bottom bottom',scrub:true,invalidateOnRefresh:true}});
    tl.fromTo(frame,{clipPath:'inset(18% 12% 18% 12%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1,ease:'none'})
      .to(frame,{clipPath:'inset(28% 18% 28% 18%)',duration:1,ease:'none'});
    tl.fromTo(img,{scale:1.38,yPercent:-8},{scale:1.02,yPercent:8,duration:2,ease:'none'},0);
    tl.fromTo(copy,{y:110,opacity:.25},{y:-70,opacity:1,duration:2,ease:'none'},0);
   });
  },root); ScrollTrigger.refresh();
 })();return()=>{cancel=true;if(ctx)ctx.revert();if(tick)gsap.ticker.remove(tick);if(lenis)lenis.destroy()}},[loading]);
 return <main ref={root}>
  <div className={`loader ${loading?'show':'hide'}`} aria-hidden={!loading}><div className="loader-top"><b>VERDURA°</b><span>BOTANICAL / DIGITAL</span></div><div className="loader-center"><span className="loader-leaf">✤</span><small>ROOTED IN RITUAL</small></div><div className="loader-count">{String(count).padStart(3,'0')}<sup>%</sup></div><div className="loader-line"><i style={{width:count+'%'}}/></div></div>
  <div className="cursor-dot"/><div className="cursor-ring"/>
  <header><a href="#top" className="logo">VERDURA°</a><nav><a href="#shop">SHOP</a><a href="#story">STORY</a><a href="#ritual">RITUAL</a></nav><button onClick={()=>alert(cart.length?cart.length+' demo item(s) in bag':'Your demo bag is empty')}>BAG {cart.length}</button></header>
  <section className="hero" id="top"><div className="hero-art"/><div className="orb o1"/><div className="orb o2"/>
   <div className="hero-copy"><small>HERBAL SKIN + HAIR RITUALS / 2026</small><h1><span className="intro-line"><span>NATURE,</span></span><span className="intro-line italic"><span>REIMAGINED.</span></span></h1><p>Herbal traditions translated into a playful, modern ritual — designed to move with you.</p><a href="#shop">DISCOVER THE COLLECTION ↘</a></div>
   <div className="hero-pack"><div className="cap"/><div className="pack-label"><small>VERDURA</small><b>TURMERIC<br/>GLOW</b><span>BOTANICAL FACE OIL · 30ML</span></div></div>
   <div className="scroll">SCROLL TO EXPLORE ↓</div>
  </section>
  <section className="ticker"><div className="ticker-inner">NEEM ✦ TURMERIC ✦ ALOE ✦ AMLA ✦ TULSI ✦ ROSE ✦ NEEM ✦ TURMERIC ✦ ALOE ✦ AMLA ✦ TULSI ✦ ROSE ✦</div></section>
  <section className="float-scene">
   <div className="float-hero"><img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1700&q=90"/></div>
   <article className="float-card fc1" data-speed="1.35"><div className="float-icon">♧</div><h3>Clean, Beyond<br/>Reproach</h3><p>Focused botanical rituals with a clear and considered ingredient story.</p></article>
   <article className="float-card fc2" data-speed="1.7"><div className="float-icon">♡</div><h3>Conscious &<br/>Responsible</h3><p>Thoughtful presentation inspired by lower-impact, responsible choices.</p></article>
   <article className="float-card fc3" data-speed="2.05"><div className="float-icon">♙</div><h3>Potent & Multi<br/>Tasking</h3><p>Simple rituals designed to feel useful, tactile and easy to understand.</p></article>
  </section>
  <section className="tk-window"><div className="tk-window-copy"><small>SKIN / BOTANY / RITUAL</small><h2>HEALTHY SKIN<br/><i>WITHOUT THE NOISE.</i></h2><p>Botanical care presented with clarity, movement and intention.</p></div><div className="tk-window-media"><img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=2000&q=90"/></div></section>
  <section className="statement" id="story"><p className="kicker fadeup">01 / OUR WORLD</p><h2 className="fadeup">PLANTS HAVE<br/><i>PERSONALITIES.</i></h2><div className="statement-grid fadeup"><p>We built Verdura as an immersive herbal commerce concept: expressive typography, tactile movement, oversized products and a story that changes as you scroll.</p><div><b>ROOTED</b><span>in botanical ritual</span></div><div><b>PLAYFUL</b><span>in digital form</span></div></div></section>
  <section className="principles-wrap">
   <div className="principles-track">
    <article className="principle intro-panel"><small>02 / OUR PRINCIPLES</small><h2>CLEAN.<br/><i>CONSCIOUS.</i><br/>EXPRESSIVE.</h2><p>Four ideas shape every Verdura ritual.</p></article>
    <article className="principle p-photo"><img className="reveal-img" src="https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1400&q=88"/><span>01</span><h3>BOTANICAL<br/>CLARITY</h3><p>Focused rituals with ingredients placed front and center.</p></article>
    <article className="principle lime"><span>02</span><div className="symbol">✤</div><h3>RADICAL<br/><i>SIMPLICITY</i></h3><p>Nothing hidden behind noise. A clear story from plant to ritual.</p></article>
    <article className="principle p-photo"><img className="reveal-img" src="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1400&q=88"/><span>03</span><h3>RITUAL<br/>FIRST</h3><p>Products designed as sensory moments, not just objects.</p></article>
    <article className="principle cream"><span>04</span><div className="symbol">◎</div><h3>LOWER<br/><i>IMPACT</i></h3><p>A concept built around thoughtful, responsible presentation.</p></article>
   </div>
  </section>
  <section className="collage">
   <div className="tile t1 fadeup"><img src="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1300&q=88"/><span>BOTANICAL OBJECTS / 01</span></div>
   <div className="round-word">HERBAL<br/><i>RITUAL</i></div>
   <div className="tile t2 fadeup"><img src="https://images.unsplash.com/photo-1601049676869-702ea24cfd58?auto=format&fit=crop&w=1200&q=88"/><span>TEXTURE / 02</span></div>
  </section>
  <section className="crop-story crop-a"><div className="crop-frame"><div className="crop-copy"><small>SKIN / BOTANY / RITUAL</small><h2>HEALTHY SKIN<br/><i>WITHOUT THE NOISE.</i></h2><p>Scroll slowly. The frame itself opens, breathes and crops around the image.</p></div><div className="crop-media"><img src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1800&q=90"/></div></div></section>
  <section className="crop-story crop-b"><div className="crop-frame reverse"><div className="crop-copy"><small>PLANT / FORMULA / FEEL</small><h2>WHAT'S INSIDE<br/><i>STAYS VISIBLE.</i></h2><p>A scroll-linked mask transforms the composition in both directions.</p></div><div className="crop-media"><img src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1800&q=90"/></div></div></section>
  <section className="ethos"><small>OUR ETHOS / 03</small><div className="ethos-word">HIDE<br/><i>NOTHING.</i></div><div className="ethos-copy"><span>TRANSPARENCY AS A DESIGN LANGUAGE</span><p>Big type, visible ingredients, honest hierarchy and tactile motion. Scroll becomes part of the product story.</p></div></section>
  <section className="shop" id="shop"><div className="shop-head fadeup"><small>04 / SHOP THE RITUAL</small><h2>GOOD SKIN.<br/><i>GOOD MOOD.</i></h2></div><div className="cards">{products.map((p,i)=><article className="card fadeup" key={p.name}><div className="pic"><img src={p.image}/><span>0{i+1}</span><button onClick={()=>setCart(x=>[...x,p])}>ADD +</button></div><div className="meta"><div><small>{p.tag}</small><h3>{p.name}</h3></div><b>PKR {p.price.toLocaleString()}</b></div></article>)}</div></section>
  <section className="journey" id="ritual" ref={journey} style={{'--scene':scenes[active][3]}}>
   <div className="journey-sticky"><div className="journey-title"><small>05 / INGREDIENT JOURNEY</small><h2>MEET YOUR<br/><i>BOTANICALS.</i></h2></div><div className="journey-stage"><div className="sun"/><div className="journey-pack"><div className="cap"/><div className="pack-label"><small>VERDURA</small><b>{scenes[active][0]}</b><span>{scenes[active][1]} RITUAL</span></div></div><div className="giant">{scenes[active][0]}</div></div></div>
   <div className="scenes">{scenes.map((s,i)=><article className="scene" key={s[0]}><span>0{i+1}</span><div><small>{s[1]}</small><h3>{s[0]}</h3><p>{s[2]}</p></div></article>)}</div>
  </section>
  <section className="split"><div className="split-img"/><div className="split-copy fadeup"><small>06 / FROM ROOT TO RITUAL</small><h2>LESS NOISE.<br/><i>MORE NATURE.</i></h2><p>A visual demo for a future herbal e-commerce brand — combining product discovery with cinematic scrolling and playful interaction.</p><a href="#shop">SHOP BOTANICALS ↗</a></div></section>
  <section className="final"><div className="flower f1">✤</div><div className="flower f2">✤</div><small>VERDURA BOTANICS</small><h2 className="fadeup">FEEL GOOD<br/><i>IN YOUR SKIN.</i></h2><a href="#top">BACK TO TOP ↑</a></section>
  <footer><b>VERDURA°</b><span>IMMERSIVE HERBAL E-COMMERCE DEMO</span><span>© 2026</span></footer>
 </main>
}