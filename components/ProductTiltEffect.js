'use client';

import { useEffect } from 'react';

const CARD_SELECTOR='.static-reference-site #reel-products .ref-product-grid>article:not(.ref-mens-source)';
const GRID_SELECTOR='.static-reference-site #reel-products .ref-product-grid';
const MAX_TILT=11.5;
const RESET_MS=180;

const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export default function ProductTiltEffect(){
  useEffect(()=>{
    if(typeof window==='undefined')return;
    if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;

    const bindings=new Map();
    const activeCards=new Set();
    let observer=null;
    let resetFrame=0;

    const clearInline=card=>{
      activeCards.delete(card);
      const binding=bindings.get(card);
      if(binding)binding.rect=null;
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
      binding.rect=null;

      if(!animate){clearInline(card);return;}

      card.style.setProperty('transition',`transform ${RESET_MS}ms cubic-bezier(.2,.8,.2,1)`,'important');
      card.style.setProperty('transform','perspective(1400px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg)','important');
      binding.resetTimer=window.setTimeout(()=>{
        binding.resetTimer=0;
        clearInline(card);
      },RESET_MS);
    };

    const resetActive=()=>{
      if(resetFrame)return;
      resetFrame=requestAnimationFrame(()=>{
        resetFrame=0;
        [...activeCards].forEach(card=>resetCard(card,false));
      });
    };

    const bindCard=card=>{
      if(bindings.has(card))return;
      const binding={frame:0,resetTimer:0,x:0,y:0,rect:null,onEnter:null,onMove:null,onLeave:null};

      binding.onEnter=()=>{
        binding.rect=card.getBoundingClientRect();
      };

      binding.onMove=event=>{
        if(event.pointerType&&event.pointerType!=='mouse')return;
        binding.x=event.clientX;
        binding.y=event.clientY;
        if(!binding.rect)binding.rect=card.getBoundingClientRect();
        if(binding.resetTimer){window.clearTimeout(binding.resetTimer);binding.resetTimer=0;}
        if(binding.frame)return;

        binding.frame=requestAnimationFrame(()=>{
          binding.frame=0;
          const rect=binding.rect;
          if(!rect||!rect.width||!rect.height)return;

          const nx=clamp(((binding.x-rect.left)/rect.width)*2-1,-1,1);
          const ny=clamp(((binding.y-rect.top)/rect.height)*2-1,-1,1);
          const rotateX=(-ny*MAX_TILT).toFixed(3);
          const rotateY=(nx*MAX_TILT).toFixed(3);

          activeCards.add(card);
          card.setAttribute('data-product-tilt-active','true');
          card.style.setProperty('transform-origin','50% 50%','important');
          card.style.setProperty('transform-style','preserve-3d','important');
          card.style.setProperty('will-change','transform','important');
          card.style.setProperty('transition','transform 70ms linear','important');
          card.style.setProperty(
            'transform',
            `perspective(1400px) translate3d(0,-6px,0) scale(1.01) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            'important'
          );
        });
      };

      binding.onLeave=()=>resetCard(card,true);
      card.addEventListener('pointerenter',binding.onEnter,{passive:true});
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

    window.addEventListener('wheel',resetActive,{passive:true,capture:true});
    window.addEventListener('scroll',resetActive,{passive:true});
    window.addEventListener('resize',resetActive,{passive:true});

    return()=>{
      observer?.disconnect();
      window.removeEventListener('wheel',resetActive,true);
      window.removeEventListener('scroll',resetActive);
      window.removeEventListener('resize',resetActive);
      if(resetFrame)cancelAnimationFrame(resetFrame);
      bindings.forEach((binding,card)=>{
        if(binding.frame)cancelAnimationFrame(binding.frame);
        if(binding.resetTimer)window.clearTimeout(binding.resetTimer);
        card.removeEventListener('pointerenter',binding.onEnter);
        card.removeEventListener('pointermove',binding.onMove);
        card.removeEventListener('pointerleave',binding.onLeave);
        clearInline(card);
      });
      activeCards.clear();
      bindings.clear();
    };
  },[]);

  return null;
}
