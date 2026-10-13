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

    const active=new Set();
    const animate=(target,vars)=>{
      const tween=gsap.fromTo(target,vars.from,{...vars.to,onComplete:()=>active.delete(tween)});
      active.add(tween);
      return tween;
    };

    const nav=root.querySelector('[data-premium-nav]');
    const hero=root.querySelector('[data-premium-hero]');

    if(nav){
      animate(nav,{from:{opacity:0,y:-20},to:{opacity:1,y:0,duration:.72,ease:'power3.out',force3D:true}});
    }

    if(hero){
      const heroPieces=[...hero.children];
      const tween=gsap.fromTo(heroPieces,{opacity:0,y:34,scale:.992},{opacity:1,y:0,scale:1,duration:.82,stagger:.075,ease:'power3.out',force3D:true,onComplete:()=>active.delete(tween)});
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
          animate(el,{from:{scaleX:0,opacity:.4},to:{scaleX:1,opacity:1,duration:.72,ease:'power3.out',transformOrigin:'left center',force3D:true}});
          return;
        }
        const isCard=el.matches('article,details');
        animate(el,{from:{opacity:0,y:isCard?34:46,scale:isCard?0.985:0.992},to:{opacity:1,y:0,scale:1,duration:isCard?0.68:0.82,ease:'power3.out',force3D:true}});
      });
    },{root:null,rootMargin:'0px 0px -9% 0px',threshold:.01});

    root.querySelectorAll('[data-reveal],[data-line]').forEach(el=>observer.observe(el));

    return()=>{
      observer.disconnect();
      active.forEach(tween=>tween.kill());
      active.clear();
    };
  },[]);

  return null;
}
