'use client';
import {useEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import Lenis from '@studio-freight/lenis';

const IMG={
 face:'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=1600&q=90',
 face2:'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1400&q=90',
 hoverFace:'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1600&q=90',
 serum:'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1200&q=90',
 flat:'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1400&q=90',
 amber:'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1200&q=90',
 ritual:'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1400&q=90'
};
const products=[['NEEM CLOUD','Cleanser',IMG.flat],['TURMERIC GLOW','Face Oil',IMG.serum],['ALOE WATER','Gel',IMG.amber]];

export default function Home(){
 const root=useRef(null),[loading,setLoading]=useState(true),[n,setN]=useState(0),[bag,setBag]=useState(0);
 useEffect(()=>{let r;const st=performance.now();const go=t=>{const p=Math.min(1,(t-st)/1500);setN(Math.round((1-Math.pow(1-p,3))*100));p<1?r=requestAnimationFrame(go):setTimeout(()=>setLoading(false),100)};r=requestAnimationFrame(go);return()=>cancelAnimationFrame(r)},[]);
 useEffect(()=>{if(loading)return;let ctx,lenis,raf,dead=false;(async()=>{const {ScrollTrigger}=await import('gsap/ScrollTrigger');if(dead)return;gsap.registerPlugin(ScrollTrigger);
 lenis=new Lenis({duration:1.05,smoothWheel:true});lenis.on('scroll',ScrollTrigger.update);raf=t=>lenis.raf(t*1000);gsap.ticker.add(raf);gsap.ticker.lagSmoothing(0);
 ctx=gsap.context(()=>{
   gsap.from('.hero-title span',{yPercent:120,stagger:.08,duration:1.1,ease:'power4.out'});
   gsap.to('.hero-bg',{scale:1.12,yPercent:8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
   const scene=document.querySelector('.principles');
   if(scene){
    const portrait=scene.querySelector('.principle-portrait'),heading=scene.querySelector('.principle-heading');
    const cards=[...scene.querySelectorAll('.principle-card')];
    gsap.set([portrait,heading,...cards],{clearProps:'transform'});
    const speeds=[1.45,1.85,2.15,2.5];
    ScrollTrigger.create({trigger:scene,start:'top bottom',end:'bottom top',scrub:true,onUpdate:self=>{
      const travel=self.progress*window.innerHeight*1.7;
      gsap.set(portrait,{y:-travel*.42});
      gsap.set(heading,{y:-travel*.72});
      cards.forEach((el,i)=>gsap.set(el,{y:-travel*speeds[i]}));
      gsap.set('.principle-leaf',{y:-travel*1.5,x:-self.progress*90,rotation:self.progress*95});
      gsap.set('.principle-ribbon',{y:-travel*1.9,x:self.progress*70,rotation:70+self.progress*120});
    }});
   }
   gsap.utils.toArray('.drift').forEach((el,i)=>gsap.fromTo(el,{y:80+i*12},{y:-90-i*18,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
   gsap.to('.trans-copy',{xPercent:-7,ease:'none',scrollTrigger:{trigger:'.transparency',start:'top bottom',end:'bottom top',scrub:true}});
   document.querySelectorAll('.principle-card,.product-grid article,.journal-cards article,.offer-small,.offer-big').forEach(el=>{
      el.addEventListener('mouseenter',()=>gsap.to(el,{y:'-=10',scale:1.025,duration:.25,ease:'power2.out'}));
      el.addEventListener('mouseleave',()=>gsap.to(el,{y:'+=10',scale:1,duration:.3,ease:'power2.out'}));
    });
 },root);ScrollTrigger.refresh();setTimeout(()=>ScrollTrigger.refresh(),300)})();return()=>{dead=true;if(ctx)ctx.revert();if(raf)gsap.ticker.remove(raf);if(lenis)lenis.destroy()}},[loading]);
 return <main ref={root}>
  <div className={'loader '+(loading?'':'gone')}><b>VERDURA°</b><div>{String(n).padStart(3,'0')}<sup>%</sup></div><i style={{width:n+'%'}}/></div>
  <header><b>verdura.</b><nav><a href="#shop">SHOP</a><a href="#ethos">PHILOSOPHY</a><a href="#journal">JOURNAL</a></nav><button onClick={()=>alert('Demo bag: '+bag)}>BAG {bag}</button></header>
  <section className="hero"><div className="hero-bg"/><div className="hero-title"><small>BOTANICAL CARE / DIGITAL RITUAL</small><h1><span>NATURE</span><span><i>REIMAGINED.</i></span></h1><p>Plant-led rituals, expressive textures and a cleaner way to meet your skin.</p><a href="#shop">EXPLORE PRODUCTS ↘</a></div><div className="hero-bottle"><span>VERDURA</span><b>ALOE<br/>WATER</b><small>HYDRATING GEL</small></div></section>

  <section className="principles">
   <div className="principle-heading"><small>01 / OUR STANDARD</small><h2>CLEAN, CONSCIOUS,<br/>PERFORMANCE</h2><p>Clear botanical care, thoughtful rituals and nothing hidden behind noise.</p><em>skincare.</em></div>
   <div className="principle-portrait swap"><img className="a" src={IMG.face}/><img className="b" src={IMG.hoverFace}/></div>
   <article className="principle-card pc1"><span>⌕</span><h3>Radical<br/>Transparency</h3><p>Clear ingredient storytelling, with no black boxes and no visual noise.</p></article>
   <article className="principle-card pc2"><span>♧</span><h3>Clean, Beyond<br/>Reproach</h3><p>Focused botanical formulas presented with clarity and intention.</p></article>
   <article className="principle-card pc3"><span>♡</span><h3>Conscious &<br/>Responsible</h3><p>Useful rituals and considered presentation designed with care.</p></article>
   <article className="principle-card pc4"><span>♙</span><h3>Potent & Multi<br/>Tasking</h3><p>Simple products made to earn their place in an everyday ritual.</p></article>
   <div className="principle-leaf">❧</div><div className="principle-ribbon">〰</div>
  </section>

  <section className="explore-intro"><h2>EXPLORE<br/><i>pure potency</i></h2><span>↘</span></section>
  <section className="explore" id="shop">
   <div className="editorial"><div className="big-photo drift swap"><img className="a" src={IMG.face2}/><img className="b" src={IMG.hoverFace}/></div><div className="product-side"><h3>Pure<br/><i>Brilliance</i></h3><div className="product-grid">{products.slice(0,2).map(p=><article key={p[0]}><img src={p[2]}/><small>{p[1]}</small><b>{p[0]}</b><button onClick={()=>setBag(x=>x+1)}>+</button></article>)}</div></div></div>
   <div className="editorial second"><div className="product-side"><h3>Verdura<br/><i>Blends</i></h3><div className="product-grid">{products.slice(1).map(p=><article key={p[0]}><img src={p[2]}/><small>{p[1]}</small><b>{p[0]}</b><button onClick={()=>setBag(x=>x+1)}>+</button></article>)}</div></div><div className="big-photo drift"><img src={IMG.face}/></div></div>
  </section>
  <section className="transparency" id="ethos"><div className="trans-copy">RADICAL<br/>TRANSPARENCY.<br/><i>HIDE</i> NOTHING.</div><div className="swatch red"/><div className="swatch tan"/><div className="truth"><b>WHAT'S INSIDE<br/><i>STAYS VISIBLE.</i></b><p>The ingredient story stays visible, direct and easy to explore.</p></div></section>
  <section className="offer"><div className="offer-small drift"><img src={IMG.serum}/><p>Only proven rituals,<br/>clearly presented.</p></div><div className="offer-big drift"><img src={IMG.amber}/><div><small>VERDURA EDIT</small><h2>EXCITING<br/><i>RITUALS await.</i></h2></div></div></section>
  <section className="journal" id="journal"><div className="journal-lead drift"><img src={IMG.ritual}/><b>Plant rituals that turn everyday care into a sensory moment.</b></div><div className="journal-title"><small>04 / STORIES</small><h2><i>clean</i><br/>JOURNAL</h2></div><div className="journal-cards"><article><img src={IMG.face2}/><b>The art of a slower ritual</b></article><article><img src={IMG.flat}/><b>Why botanical texture matters</b></article></div></section>
  <section className="social"><h2>CONNECT<br/>WITH US <i>on instagram</i></h2><div className="social-grid"><img className="drift" src={IMG.serum}/><img className="drift" src={IMG.face}/><img className="drift" src={IMG.flat}/></div></section>
  <section className="newsletter"><div><img src={IMG.amber}/></div><aside><h2>HEAR MORE<br/>FROM US</h2><p>Botanical notes, new rituals and studio stories.</p><input placeholder="YOUR EMAIL"/><button>SUBSCRIBE ↗</button></aside></section>
  <section className="end"><small>VERDURA BOTANICS</small><h2>FEEL GOOD<br/><i>IN YOUR SKIN.</i></h2></section>
  <footer><b>verdura.</b><span>IMMERSIVE BOTANICAL COMMERCE CONCEPT</span><span>© 2026</span></footer>
 </main>
}