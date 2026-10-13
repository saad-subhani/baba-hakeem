'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function MensOilLandingRefine(){
  useEffect(()=>{
    if(typeof window==='undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const bottle=document.querySelector('.static-reference-site .ref-mens-moving');
    const sourceCard=bottle?.closest('article');
    const feature=document.querySelector('.static-reference-site .ref-feature');
    const hands=document.querySelector('.static-reference-site .ref-feature-hands');
    const target=document.querySelector('.static-reference-site .ref-mens-hands-target');
    if(!bottle||!sourceCard||!feature||!hands||!target) return;

    const mobile=window.innerWidth<760;
    const finalScale=mobile?.90:.86;
    const finalLift=mobile?-12:-20;
    let finalX=0;

    const measureHorizontalCenter=()=>{
      const handsRect=hands.getBoundingClientRect();
      const targetRect=target.getBoundingClientRect();
      const handsCenter=handsRect.left+(handsRect.width/2);
      const targetCenter=targetRect.left+(targetRect.width/2);
      finalX=handsCenter-targetCenter;
    };

    const apply=(progress)=>{
      const start=.68;
      const raw=Math.max(0,Math.min(1,(progress-start)/(1-start)));
      const eased=raw*raw*(3-2*raw);
      const scale=1+((finalScale-1)*eased);
      const lift=finalLift*eased;
      const x=finalX*eased;
      bottle.style.scale=String(scale);
      bottle.style.translate=`${x}px ${lift}px`;
    };

    measureHorizontalCenter();

    const trigger=ScrollTrigger.create({
      trigger:sourceCard,
      start:'center 58%',
      endTrigger:feature,
      end:'bottom bottom',
      invalidateOnRefresh:true,
      onUpdate:self=>apply(self.progress),
      onRefresh:self=>{
        measureHorizontalCenter();
        apply(self.progress);
      }
    });

    const onResize=()=>{
      measureHorizontalCenter();
      apply(trigger.progress||0);
    };
    window.addEventListener('resize',onResize,{passive:true});

    apply(trigger.progress||0);

    return()=>{
      window.removeEventListener('resize',onResize);
      trigger.kill();
      bottle.style.removeProperty('scale');
      bottle.style.removeProperty('translate');
    };
  },[]);

  return null;
}
