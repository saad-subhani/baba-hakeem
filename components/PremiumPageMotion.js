'use client';

import {useEffect} from 'react';
import {gsap} from 'gsap';

export default function PremiumPageMotion(){
  useEffect(()=>{
    if(typeof window==='undefined') return;
    const root=document.querySelector('[data-premium-page]');
    if(!root) return;

    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches??false;
    if(reduced) return;

    const coarse=window.matchMedia?.('(pointer: coarse)')?.matches??false;
    const cores=navigator.hardwareConcurrency||8;
    const memory=navigator.deviceMemory||8;
    const lite=coarse||cores<=6||memory<=4;

    const active=new Set();
    const animate=(target,vars)=>{
      const tween=gsap.fromTo(target,vars.from,{...vars.to,onComplete:()=>active.delete(tween)});
      active.add(tween);
      return tween;
    };

    let scrollTimer=0;
    let scrolling=false;
    const setScrollState=(value)=>{
      scrolling=value;
      root.classList.toggle('is-performance-scrolling',value);
      document.documentElement.classList.toggle('is-performance-scrolling',value);
      document.body.classList.toggle('is-performance-scrolling',value);
    };
    const onScroll=()=>{
      if(!scrolling) setScrollState(true);
      if(scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer=window.setTimeout(()=>setScrollState(false),110);
    };
    window.addEventListener('scroll',onScroll,{passive:true});

    const nav=root.querySelector('[data-premium-nav]');
    const hero=root.querySelector('[data-premium-hero]');

    if(nav){
      animate(nav,{from:{opacity:0,y:lite?-10:-20},to:{opacity:1,y:0,duration:lite?.45:.72,ease:'power3.out',force3D:true}});
    }

    if(hero){
      const heroPieces=[...hero.children];
      const tween=gsap.fromTo(heroPieces,{opacity:0,y:lite?18:34,scale:lite?1:.992},{opacity:1,y:0,scale:1,duration:lite?.56:.82,stagger:lite?.035:.075,ease:'power3.out',force3D:true,onComplete:()=>active.delete(tween)});
      active.add(tween);
    }

    const seen=new WeakSet();
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting||seen.has(entry.target)) return;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        const el=entry.target;
        const isLine=el.hasAttribute('data-line');
        if(isLine){
          animate(el,{from:{scaleX:0,opacity:.4},to:{scaleX:1,opacity:1,duration:lite?.46:.72,ease:'power3.out',transformOrigin:'left center',force3D:true}});
          return;
        }
        const isCard=el.matches('article,details');
        animate(el,{from:{opacity:0,y:lite?(isCard?16:22):(isCard?34:46),scale:lite?1:(isCard?.985:.992)},to:{opacity:1,y:0,scale:1,duration:lite?.48:(isCard?.68:.82),ease:'power3.out',force3D:true}});
      });
    },{root:null,rootMargin:'0px 0px -7% 0px',threshold:.01});

    root.querySelectorAll('[data-reveal],[data-line]').forEach(el=>observer.observe(el));

    return()=>{
      observer.disconnect();
      active.forEach(tween=>tween.kill());
      active.clear();
      window.removeEventListener('scroll',onScroll);
      if(scrollTimer) window.clearTimeout(scrollTimer);
      setScrollState(false);
    };
  },[]);

  return null;
}
