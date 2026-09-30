'use client';
import {useEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import Lenis from '@studio-freight/lenis';

const IMG={
 face:'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1600&q=90',
 face2:'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1400&q=90',
 serum:'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1200&q=90',
 flat:'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1400&q=90',
 amber:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=90',
 hoverFace:'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1600&q=90',
 hoverFlat:'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1400&q=90',
 hoverSerum:'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1400&q=90',
 ritual:'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1400&q=90'
};
const products=[['NEEM CLOUD','Cleanser',3200,IMG.flat],['TURMERIC GLOW','Face Oil',4700,IMG.serum],['ALOE WATER','Gel',2800,IMG.amber]];
export default function Home(){
 const root=useRef(null);const [loading,setLoading]=useState(true),[n,setN]=useState(0),[bag,setBag]=useState(0);
 useEffect(()=>{let r;const a=performance.now();const go=t=>{const p=Math.min(1,(t-a)/1800);setN(Math.round((1-Math.pow(1-p,3))*100));p<1?r=requestAnimationFrame(go):setTimeout(()=>setLoading(false),120)};r=requestAnimationFrame(go);return()=>cancelAnimationFrame(r)},[]);
 useEffect(()=>{if(loading)return;let ctx,lenis,tick,dead=false;(async()=>{const {ScrollTrigger}=await import('gsap/ScrollTrigger');if(dead)return;gsap.registerPlugin(ScrollTrigger);lenis=new Lenis({duration:1.15,smoothWheel:true});lenis.on('scroll',ScrollTrigger.update);tick=t=>lenis.raf(t*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
 ctx=gsap.context(()=>{
  gsap.from('.hero-title span',{yPercent:120,stagger:.08,duration:1.15,ease:'power4.out'});
  gsap.to('.hero-bg',{scale:1.14,yPercent:9,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  document.querySelectorAll('.orbit').forEach(scene=>{
   const main=scene.querySelector('.orbit-main');
   const cards=[...scene.querySelectorAll('.orbit-card')];
   const mainBase=Number(main?.dataset.base||0);
   gsap.set(main,{y:mainBase});
   cards.forEach(el=>gsap.set(el,{y:Number(el.dataset.base||0),rotation:0}));
   ScrollTrigger.create({
    trigger:scene,start:'top 85%',end:'bottom top',invalidateOnRefresh:true,
    onUpdate:self=>{
     const p=self.progress;
     if(main) gsap.set(main,{y:mainBase-(p*120)});
     cards.forEach((el,i)=>{
      const base=Number(el.dataset.base||0);
      const travel=[330,500,650][i]||400;
      gsap.set(el,{y:base-(p*travel),rotation:(p*(i-1)*3)});
     });
    }
   });
  });
  document.querySelectorAll('.drift').forEach((el,i)=>gsap.fromTo(el,{y:90+i*20},{y:-100-i*25,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
  document.querySelectorAll('.reveal').forEach(el=>gsap.from(el,{y:70,opacity:0,duration:1,scrollTrigger:{trigger:el,start:'top 86%'}}));
  gsap.to('.marquee-inner',{xPercent:-35,ease:'none',scrollTrigger:{trigger:'.marquee',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.to('.trans-word',{xPercent:-8,ease:'none',scrollTrigger:{trigger:'.transparency',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.to('.paint.one',{y:-170,rotate:12,ease:'none',scrollTrigger:{trigger:'.transparency',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.to('.paint.two',{y:-260,rotate:-9,ease:'none',scrollTrigger:{trigger:'.transparency',start:'top bottom',end:'bottom top',scrub:true}});
  document.querySelectorAll('.hover-lift').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();gsap.to(el,{rotationY:(e.clientX-r.left-r.width/2)/r.width*7,rotationX:-(e.clientY-r.top-r.height/2)/r.height*7,y:-8,duration:.35,transformPerspective:900});});el.addEventListener('mouseleave',()=>gsap.to(el,{rotationX:0,rotationY:0,y:0,duration:.55,ease:'power3.out'}));});
  document.querySelectorAll('.swap-img').forEach(w=>{const a=w.querySelector('.swap-a'),b=w.querySelector('.swap-b');w.addEventListener('mouseenter',()=>{gsap.to(a,{opacity:0,scale:1.07,duration:.45});gsap.to(b,{opacity:1,scale:1,duration:.45});});w.addEventListener('mouseleave',()=>{gsap.to(a,{opacity:1,scale:1,duration:.45});gsap.to(b,{opacity:0,scale:1.07,duration:.45});});});
 },root);ScrollTrigger.refresh()})();return()=>{dead=true;if(ctx)ctx.revert();if(tick)gsap.ticker.remove(tick);if(lenis)lenis.destroy()}},[loading]);
 return <main ref={root}>
 <div className={'loader '+(loading?'':'gone')}><b>VERDURA°</b><div>{String(n).padStart(3,'0')}<sup>%</sup></div><i style={{width:n+'%'}}/></div>
 <header><b>verdura.</b><nav><a href="#shop">SHOP</a><a href="#ethos">PHILOSOPHY</a><a href="#journal">JOURNAL</a></nav><button onClick={()=>alert('Demo bag: '+bag)}>BAG {bag}</button></header>
 <section className="hero"><div className="hero-bg"/><div className="hero-title"><small>BOTANICAL CARE / DIGITAL RITUAL</small><h1><span>NATURE</span><span><i>REIMAGINED.</i></span></h1><p>Plant-led rituals, expressive textures and a cleaner way to meet your skin.</p><a href="#shop">EXPLORE PRODUCTS ↘</a></div><div className="hero-bottle"><span>VERDURA</span><b>ALOE<br/>WATER</b><small>HYDRATING GEL</small></div></section>
 <div className="marquee"><div className="marquee-inner">NEEM ✦ TURMERIC ✦ ALOE ✦ AMLA ✦ TULSI ✦ ROSE ✦ NEEM ✦ TURMERIC ✦ ALOE ✦ AMLA ✦</div></div>

 <section className="orbit">
  <div className="orbit-heading"><small>01 / OUR STANDARD</small><h2>CLEAN, CONSCIOUS,<br/><i>PERFORMANCE.</i></h2></div>
  <div className="orbit-main swap-img" data-base="150"><img className="swap-a" src={IMG.face}/><img className="swap-b" src={IMG.hoverFace}/></div>
  <article className="orbit-card hover-lift oc1" data-base="170"><span>✧</span><h3>Clean, Beyond<br/>Reproach</h3><p>Clear botanical storytelling with thoughtful formulas and no visual noise.</p></article>
  <article className="orbit-card hover-lift oc2" data-base="260"><span>♡</span><h3>Conscious &<br/>Responsible</h3><p>Designed around intentional choices, useful rituals and considered presentation.</p></article>
  <article className="orbit-card hover-lift oc3" data-base="330"><span>♧</span><h3>Potent & Multi<br/>Tasking</h3><p>Focused products made to earn their place in a simple daily ritual.</p></article>
 </section>

 <section className="explore" id="shop"><div className="section-title reveal"><small>02 / EXPLORE</small><h2>PURE <i>POTENCY.</i></h2></div>
  <div className="editorial row1"><div className="big-photo drift swap-img hover-lift"><img className="swap-a" src={IMG.face2}/><img className="swap-b" src={IMG.hoverFace}/></div><div className="product-side"><h3>Pure<br/><i>Brilliance</i></h3><div className="product-grid">{products.slice(0,2).map((p,i)=><article className="hover-lift" key={p[0]}><img src={p[3]}/><small>{p[1]}</small><b>{p[0]}</b><button onClick={()=>setBag(x=>x+1)}>ADD +</button></article>)}</div></div></div>
  <div className="editorial row2"><div className="product-side"><h3>Verdura<br/><i>Blends</i></h3><div className="product-grid">{products.slice(1).map(p=><article className="hover-lift" key={p[0]}><img src={p[3]}/><small>{p[1]}</small><b>{p[0]}</b><button onClick={()=>setBag(x=>x+1)}>ADD +</button></article>)}</div></div><div className="big-photo drift swap-img hover-lift"><img className="swap-a" src={IMG.face}/><img className="swap-b" src={IMG.hoverFace}/></div></div>
 </section>

 <section className="transparency" id="ethos"><small>03 / OUR ETHOS</small><div className="trans-word">RADICAL<br/>TRANSPARENCY.<br/><i>HIDE</i><br/>NOTHING.</div><div className="paint one"/><div className="paint two"/><div className="truth"><b>WHAT'S INSIDE<br/><i>STAYS VISIBLE.</i></b><p>We make the ingredient story part of the experience — clear, direct and easy to explore.</p></div></section>

 <section className="offer"><div className="offer-mini drift"><img src={IMG.serum}/><p>Only proven rituals,<br/>clearly presented.</p></div><div className="offer-main drift swap-img hover-lift"><div className="swap-media"><img className="swap-a" src={IMG.amber}/><img className="swap-b" src={IMG.hoverSerum}/></div><div><small>VERDURA EDIT</small><h2>EXCITING<br/><i>RITUALS await.</i></h2><a href="#shop">DISCOVER ↗</a></div></div></section>

 <section className="journal" id="journal"><div className="journal-lead drift swap-img hover-lift"><div className="swap-media"><img className="swap-a" src={IMG.ritual}/><img className="swap-b" src={IMG.hoverFlat}/></div><h3>Plant rituals that turn everyday care into a sensory moment.</h3></div><div className="journal-title"><small>04 / STORIES</small><h2><i>clean</i><br/>JOURNAL</h2><p>BOTANY / SKIN / CULTURE</p></div><div className="journal-cards"><article><img src={IMG.face2}/><b>The art of a slower skincare ritual</b></article><article><img src={IMG.flat}/><b>Why botanical texture matters</b></article></div></section>

 <section className="social"><div className="social-title reveal"><small>CONNECT</small><h2>WITH US<br/><i>on instagram</i></h2></div><div className="social-collage"><img className="s1 drift" src={IMG.face}/><img className="s2 drift" src={IMG.flat}/><img className="s3 drift" src={IMG.serum}/></div></section>
 <section className="newsletter"><div className="news-image"><img src={IMG.amber}/></div><div className="news-box"><h2>HEAR MORE<br/>FROM US</h2><p>Botanical notes, new rituals and studio stories.</p><input placeholder="YOUR EMAIL"/><button>SUBSCRIBE ↗</button></div></section>
 <section className="end"><small>VERDURA BOTANICS</small><h2>FEEL GOOD<br/><i>IN YOUR SKIN.</i></h2><a href="#">BACK TO TOP ↑</a></section>
 <footer><b>verdura.</b><span>IMMERSIVE BOTANICAL COMMERCE CONCEPT</span><span>© 2026</span></footer>
 </main>
}