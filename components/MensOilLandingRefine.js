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
    if(!bottle||!sourceCard||!feature) return;

    const mobile=window.innerWidth<760;
    const finalScale=mobile?.90:.86;
    const finalLift=mobile?-12:-20;

    const apply=(progress)=>{
      const start=.68;
      const raw=Math.max(0,Math.min(1,(progress-start)/(1-start)));
      const eased=raw*raw*(3-2*raw);
      const scale=1+((finalScale-1)*eased);
      const lift=finalLift*eased;
      bottle.style.scale=String(scale);
      const finalX = 18;
      bottle.style.translate=`${finalX}px ${lift}px`;
    };

    const trigger=ScrollTrigger.create({
      trigger:sourceCard,
      start:'center 58%',
      endTrigger:feature,
      end:'bottom bottom',
      invalidateOnRefresh:true,
      onUpdate:self=>apply(self.progress),
      onRefresh:self=>apply(self.progress)
    });

    apply(trigger.progress||0);

    return()=>{
      trigger.kill();
      bottle.style.removeProperty('scale');
      bottle.style.removeProperty('translate');
    };
  },[]);

  return null;
}
