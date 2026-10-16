'use client';

import { useEffect } from 'react';

const CARD_SELECTOR='.static-reference-site #reel-products .ref-product-grid>article';
const GRID_SELECTOR='.static-reference-site #reel-products .ref-product-grid';
const MAX_TILT=1.6;
const SCROLL_KEYS=new Set(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ']);

const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export default function ProductTiltEffect(){
  useEffect(()=>{
    const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
    const reducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)');
    if(!finePointer.matches||reducedMotion.matches)return;

    const bindings=new Map();
    let observer=null;

    const resetCard=card=>{
      const binding=bindings.get(card);
      if(binding?.frame){
        cancelAnimationFrame(binding.frame);
        binding.frame=0;
      }
      card.removeAttribute('data-product-tilt-active');
      card.style.removeProperty('--product-tilt-x');
      card.style.removeProperty('--product-tilt-y');
    };

    const resetAll=()=>{
      bindings.forEach((_,card)=>resetCard(card));
    };

    const bindCard=card=>{
      if(bindings.has(card))return;

      const binding={frame:0,x:0,y:0,onMove:null,onLeave:null};

      binding.onMove=event=>{
        binding.x=event.clientX;
        binding.y=event.clientY;
        if(binding.frame)return;

        binding.frame=requestAnimationFrame(()=>{
          binding.frame=0;
          const rect=card.getBoundingClientRect();
          if(!rect.width||!rect.height)return;

          const nx=clamp(((binding.x-rect.left)/rect.width)*2-1,-1,1);
          const ny=clamp(((binding.y-rect.top)/rect.height)*2-1,-1,1);

          // Cursor side gently recedes; the opposite side comes toward the viewer.
          const rotateX=(-ny*MAX_TILT).toFixed(2);
          const rotateY=(nx*MAX_TILT).toFixed(2);

          card.style.setProperty('--product-tilt-x',`${rotateX}deg`);
          card.style.setProperty('--product-tilt-y',`${rotateY}deg`);
          card.setAttribute('data-product-tilt-active','true');
        });
      };

      binding.onLeave=()=>resetCard(card);

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

    const onKeyDown=event=>{
      if(SCROLL_KEYS.has(event.key))resetAll();
    };

    // Clear tilt before/while scrolling so every locked GSAP bottle path stays untouched.
    window.addEventListener('wheel',resetAll,{passive:true,capture:true});
    window.addEventListener('scroll',resetAll,{passive:true});
    window.addEventListener('resize',resetAll,{passive:true});
    document.addEventListener('keydown',onKeyDown,true);

    return()=>{
      observer?.disconnect();
      window.removeEventListener('wheel',resetAll,true);
      window.removeEventListener('scroll',resetAll);
      window.removeEventListener('resize',resetAll);
      document.removeEventListener('keydown',onKeyDown,true);
      bindings.forEach((binding,card)=>{
        if(binding.frame)cancelAnimationFrame(binding.frame);
        card.removeEventListener('pointermove',binding.onMove);
        card.removeEventListener('pointerleave',binding.onLeave);
        card.removeAttribute('data-product-tilt-active');
        card.style.removeProperty('--product-tilt-x');
        card.style.removeProperty('--product-tilt-y');
      });
      bindings.clear();
    };
  },[]);

  return null;
}
