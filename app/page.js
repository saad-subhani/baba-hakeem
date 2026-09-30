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
 const root=useRef(null),journey=useRef(null); const [active,setActive]=useState(0),[cart,setCart]=useState([]);
 useEffect(()=>{let ctx,lenis,tick,cancel=false;(async()=>{
  const {ScrollTrigger}=await import('gsap/ScrollTrigger'); if(cancel)return; gsap.registerPlugin(ScrollTrigger);
  lenis=new Lenis({duration:1.05,smoothWheel:true}); lenis.on('scroll',ScrollTrigger.update); tick=t=>lenis.raf(t*1000); gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
  ctx=gsap.context(()=>{
   gsap.from('.intro-line span',{yPercent:110,stagger:.08,duration:1.1,ease:'power4.out'});
   gsap.to('.hero-pack',{yPercent:45,rotate:10,scale:.82,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
   gsap.to('.hero-art',{scale:1.18,yPercent:10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
   gsap.utils.toArray('.fadeup').forEach(el=>gsap.from(el,{opacity:0,y:80,duration:1,scrollTrigger:{trigger:el,start:'top 85%'}}));
   gsap.utils.toArray('.scene').forEach((el,i)=>ScrollTrigger.create({trigger:el,start:'top center',end:'bottom center',onEnter:()=>setActive(i),onEnterBack:()=>setActive(i)}));
   gsap.to('.journey-pack',{rotate:18,y:80,ease:'none',scrollTrigger:{trigger:journey.current,start:'top top',end:'bottom bottom',scrub:1}});
   gsap.to('.ticker-inner',{xPercent:-35,ease:'none',scrollTrigger:{trigger:'.ticker',start:'top bottom',end:'bottom top',scrub:1}});
  },root); ScrollTrigger.refresh();
 })();return()=>{cancel=true;if(ctx)ctx.revert();if(tick)gsap.ticker.remove(tick);if(lenis)lenis.destroy()}},[]);
 return <main ref={root}>
  <header><a href="#top" className="logo">VERDURA°</a><nav><a href="#shop">SHOP</a><a href="#story">STORY</a><a href="#ritual">RITUAL</a></nav><button onClick={()=>alert(cart.length?cart.length+' demo item(s) in bag':'Your demo bag is empty')}>BAG {cart.length}</button></header>
  <section className="hero" id="top"><div className="hero-art"/><div className="orb o1"/><div className="orb o2"/>
   <div className="hero-copy"><small>HERBAL SKIN + HAIR RITUALS / 2026</small><h1><span className="intro-line"><span>NATURE,</span></span><span className="intro-line italic"><span>REIMAGINED.</span></span></h1><p>Herbal traditions translated into a playful, modern ritual — designed to move with you.</p><a href="#shop">DISCOVER THE COLLECTION ↘</a></div>
   <div className="hero-pack"><div className="cap"/><div className="pack-label"><small>VERDURA</small><b>TURMERIC<br/>GLOW</b><span>BOTANICAL FACE OIL · 30ML</span></div></div>
   <div className="scroll">SCROLL TO EXPLORE ↓</div>
  </section>
  <section className="ticker"><div className="ticker-inner">NEEM ✦ TURMERIC ✦ ALOE ✦ AMLA ✦ TULSI ✦ ROSE ✦ NEEM ✦ TURMERIC ✦ ALOE ✦ AMLA ✦ TULSI ✦ ROSE ✦</div></section>
  <section className="statement" id="story"><p className="kicker fadeup">01 / OUR WORLD</p><h2 className="fadeup">PLANTS HAVE<br/><i>PERSONALITIES.</i></h2><div className="statement-grid fadeup"><p>We built Verdura as an immersive herbal commerce concept: expressive typography, tactile movement, oversized products and a story that changes as you scroll.</p><div><b>ROOTED</b><span>in botanical ritual</span></div><div><b>PLAYFUL</b><span>in digital form</span></div></div></section>
  <section className="collage">
   <div className="tile t1 fadeup"><img src="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1300&q=88"/><span>BOTANICAL OBJECTS / 01</span></div>
   <div className="round-word">HERBAL<br/><i>RITUAL</i></div>
   <div className="tile t2 fadeup"><img src="https://images.unsplash.com/photo-1601049676869-702ea24cfd58?auto=format&fit=crop&w=1200&q=88"/><span>TEXTURE / 02</span></div>
  </section>
  <section className="shop" id="shop"><div className="shop-head fadeup"><small>02 / SHOP THE RITUAL</small><h2>GOOD SKIN.<br/><i>GOOD MOOD.</i></h2></div><div className="cards">{products.map((p,i)=><article className="card fadeup" key={p.name}><div className="pic"><img src={p.image}/><span>0{i+1}</span><button onClick={()=>setCart(x=>[...x,p])}>ADD +</button></div><div className="meta"><div><small>{p.tag}</small><h3>{p.name}</h3></div><b>PKR {p.price.toLocaleString()}</b></div></article>)}</div></section>
  <section className="journey" id="ritual" ref={journey} style={{'--scene':scenes[active][3]}}>
   <div className="journey-sticky"><div className="journey-title"><small>03 / INGREDIENT JOURNEY</small><h2>MEET YOUR<br/><i>BOTANICALS.</i></h2></div><div className="journey-stage"><div className="sun"/><div className="journey-pack"><div className="cap"/><div className="pack-label"><small>VERDURA</small><b>{scenes[active][0]}</b><span>{scenes[active][1]} RITUAL</span></div></div><div className="giant">{scenes[active][0]}</div></div></div>
   <div className="scenes">{scenes.map((s,i)=><article className="scene" key={s[0]}><span>0{i+1}</span><div><small>{s[1]}</small><h3>{s[0]}</h3><p>{s[2]}</p></div></article>)}</div>
  </section>
  <section className="split"><div className="split-img"/><div className="split-copy fadeup"><small>04 / FROM ROOT TO RITUAL</small><h2>LESS NOISE.<br/><i>MORE NATURE.</i></h2><p>A visual demo for a future herbal e-commerce brand — combining product discovery with cinematic scrolling and playful interaction.</p><a href="#shop">SHOP BOTANICALS ↗</a></div></section>
  <section className="final"><div className="flower f1">✤</div><div className="flower f2">✤</div><small>VERDURA BOTANICS</small><h2 className="fadeup">FEEL GOOD<br/><i>IN YOUR SKIN.</i></h2><a href="#top">BACK TO TOP ↑</a></section>
  <footer><b>VERDURA°</b><span>IMMERSIVE HERBAL E-COMMERCE DEMO</span><span>© 2026</span></footer>
 </main>
}