'use client';

import {useEffect} from 'react';

export default function PerformanceScrollGuard(){
  useEffect(()=>{
    const site=document.querySelector('.static-reference-site');
    if(!site) return;

    let idleTimer=0;
    let active=false;
    const begin=()=>{
      if(!active){
        active=true;
        site.classList.add('is-performance-scrolling');
      }
      if(idleTimer) window.clearTimeout(idleTimer);
      idleTimer=window.setTimeout(()=>{
        active=false;
        site.classList.remove('is-performance-scrolling');
      },140);
    };

    window.addEventListener('scroll',begin,{passive:true});
    window.addEventListener('touchmove',begin,{passive:true});
    return()=>{
      window.removeEventListener('scroll',begin);
      window.removeEventListener('touchmove',begin);
      if(idleTimer) window.clearTimeout(idleTimer);
      site.classList.remove('is-performance-scrolling');
    };
  },[]);

  return null;
}
