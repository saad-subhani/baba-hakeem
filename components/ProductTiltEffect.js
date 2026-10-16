'use client';

import { useEffect } from 'react';

const CARD_SELECTOR='.static-reference-site #reel-products .ref-product-grid>article';
const GRID_SELECTOR='.static-reference-site #reel-products .ref-product-grid';
const MAX_TILT=3.5;
const RESET_MS=180;

const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export default function ProductTiltEffect(){
  useEffect(()=>{
    if(typeof window==='undefined')return;
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;

    const bindings=new Map();
    let observer=null;

    const clearInline=card=>{
      card.removeAttribute('data-product-tilt-active');
      card.style.removeProperty('transform');
      card.style.removeProperty('transform-origin');
      card.style.removeProperty('transform-style');
      card.style.removeProperty('will-change');
      card.style.removeProperty('transition');
    };

    const resetCard=(card,animate=true)=>{
      const binding=bindings.get(card);
      if(!binding)return;
      if(binding.frame){cancelAnimationFrame(binding.frame);binding.frame=0;}
      if(binding.resetTimer){window.clearTimeout(binding.resetTimer);binding.resetTimer=0;}

      if(!animate){clearInline(card);return;}

      card.style.setProperty('transition',`transform ${RESET_MS}ms cubic-bezier(.2,.8,.2,1)`,'important');
      card.style.setProperty('transform','perspective(1400px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg)','important');
      binding.resetTimer=window.setTimeout(()=>{
        binding.resetTimer=0;
        clearInline(card);
      },RESET_MS);
    };

    const resetAll=()=>bindings.forEach((_,card)=>resetCard(card,false));

    const bindCard=card=>{
      if(bindings.has(card))return;
      const binding={frame:0,resetTimer:0,x:0,y:0,onMove:null,onLeave:null};

      binding.onMove=event=>{
        if(event.pointerType&&event.pointerType!=='mouse')return;
        binding.x=event.clientX;
        binding.y=event.clientY;
        if(binding.resetTimer){window.clearTimeout(binding.resetTimer);binding.resetTimer=0;}
        if(binding.frame)return;

        binding.frame=requestAnimationFrame(()=>{
          binding.frame=0;
          const rect=card.getBoundingClientRect();
          if(!rect.width||!rect.height)return;

          const nx=clamp(((binding.x-rect.left)/rect.width)*2-1,-1,1);
          const ny=clamp(((binding.y-rect.top)/rect.height)*2-1,-1,1);
          const rotateX=(-ny*MAX_TILT).toFixed(3);
          const rotateY=(nx*MAX_TILT).toFixed(3);

          card.setAttribute('data-product-tilt-active','true');
          card.style.setProperty('transform-origin','50% 50%','important');
          card.style.setProperty('transform-style','preserve-3d','important');
          card.style.setProperty('will-change','transform','important');
          card.style.setProperty('transition','transform 70ms linear','important');
          card.style.setProperty(
            'transform',
            `perspective(1400px) translate3d(0,-4px,0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            'important'
          );
        });
      };

      binding.onLeave=()=>resetCard(card,true);
      card.addEventListener('pointermove',binding.onMove,{passive:true});
      card.addEventListener('pointerleave',binding.onLeave,{passive:true});
      bindings.set(card,binding);
    };

    const bindAll=()=>document.querySelectorAll(CARD_SELECTOR).forEach(bindCard);
    bindAll();

    const grid=document.querySelector(GRID_SELECTOR);
    if(grid){
      observer=new MutationObserver(bindAll);
      observer.observe(grid,{childList:true});
    }

    window.addEventListener('wheel',resetAll,{passive:true,capture:true});
    window.addEventListener('scroll',resetAll,{passive:true});
    window.addEventListener('resize',resetAll,{passive:true});

    return()=>{
      observer?.disconnect();
      window.removeEventListener('wheel',resetAll,true);
      window.removeEventListener('scroll',resetAll);
      window.removeEventListener('resize',resetAll);
      bindings.forEach((binding,card)=>{
        if(binding.frame)cancelAnimationFrame(binding.frame);
        if(binding.resetTimer)window.clearTimeout(binding.resetTimer);
        card.removeEventListener('pointermove',binding.onMove);
        card.removeEventListener('pointerleave',binding.onLeave);
        clearInline(card);
      });
      bindings.clear();
    };
  },[]);

  return null;
}
