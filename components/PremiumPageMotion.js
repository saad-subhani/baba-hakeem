'use client';

import {useEffect} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

export default function PremiumPageMotion(){
  useEffect(()=>{
    if(typeof window==='undefined') return;
    const root=document.querySelector('[data-premium-page]');
    if(!root) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx=gsap.context(()=>{
      gsap.from('[data-premium-hero]',{opacity:0,y:42,duration:1.05,ease:'power3.out'});
      gsap.from('[data-premium-nav]',{opacity:0,y:-18,duration:.8,ease:'power2.out'});
      gsap.utils.toArray('[data-reveal]').forEach((el)=>{
        gsap.fromTo(el,{opacity:0,y:42},{opacity:1,y:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
      });
      gsap.utils.toArray('[data-line]').forEach((el)=>{
        gsap.fromTo(el,{scaleX:0},{scaleX:1,duration:1,ease:'power3.out',transformOrigin:'left center',scrollTrigger:{trigger:el,start:'top 92%',once:true}});
      });
    },root);

    return()=>ctx.revert();
  },[]);

  return null;
}
