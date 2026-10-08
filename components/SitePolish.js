'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import styles from './SitePolish.module.css';

export default function SitePolish(){
  const glowRef=useRef(null);
  const progressRef=useRef(null);
  const pointerFrame=useRef(0);
  const scrollFrame=useRef(0);
  const [enabled,setEnabled]=useState(false);
  const [quiet,setQuiet]=useState(false);
  const [lite,setLite]=useState(false);

  useEffect(()=>{
    const site=document.querySelector('.static-reference-site');
    if(!site) return;
    setEnabled(true);

    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches??false;
    const coarse=window.matchMedia?.('(pointer: coarse)')?.matches??false;
    const lowPower=(navigator.hardwareConcurrency||4)<=4||(navigator.deviceMemory||4)<=4;
    setLite(reduced||lowPower);

    let lenis=null;
    let lenisFrame=0;
    let lenisRunning=false;
    const runLenis=time=>{
      if(!lenisRunning||document.hidden) return;
      lenis?.raf(time);
      lenisFrame=requestAnimationFrame(runLenis);
    };
    const startLenis=()=>{
      if(!lenis||lenisRunning||document.hidden) return;
      lenisRunning=true;
      lenisFrame=requestAnimationFrame(runLenis);
    };
    const stopLenis=()=>{
      lenisRunning=false;
      if(lenisFrame){cancelAnimationFrame(lenisFrame);lenisFrame=0;}
    };

    if(!reduced&&!coarse){
      lenis=new Lenis({
        duration:lowPower?1.02:1.12,
        easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),
        orientation:'vertical',
        gestureOrientation:'vertical',
        smoothWheel:true,
        smoothTouch:false,
        wheelMultiplier:lowPower?.94:.9,
        touchMultiplier:1,
        infinite:false
      });
      startLenis();
    }

    let siteTop=0;
    let scrollDistance=1;
    const measure=()=>{
      const rect=site.getBoundingClientRect();
      siteTop=window.scrollY+rect.top;
      scrollDistance=Math.max(1,site.offsetHeight-window.innerHeight);
    };
    const updateProgress=()=>{
      scrollFrame.current=0;
      if(!progressRef.current) return;
      const value=Math.min(1,Math.max(0,(window.scrollY-siteTop)/scrollDistance));
      progressRef.current.style.transform=`scaleX(${value})`;
    };
    const onScroll=()=>{
      if(!scrollFrame.current) scrollFrame.current=requestAnimationFrame(updateProgress);
    };
    const onResize=()=>{
      measure();
      onScroll();
    };
    measure();
    updateProgress();
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onResize,{passive:true});

    let onPointer;
    if(!coarse&&!reduced&&!lowPower){
      onPointer=(event)=>{
        if(pointerFrame.current) return;
        const x=event.clientX;
        const y=event.clientY;
        pointerFrame.current=requestAnimationFrame(()=>{
          pointerFrame.current=0;
          if(glowRef.current) glowRef.current.style.transform=`translate3d(${x}px,${y}px,0)`;
        });
      };
      window.addEventListener('pointermove',onPointer,{passive:true});
    }

    const signature=document.querySelector('#best-product');
    const quietObserver=signature?new IntersectionObserver(entries=>{
      setQuiet(entries[0]?.isIntersecting??false);
    },{threshold:.04}):null;
    if(signature&&quietObserver) quietObserver.observe(signature);

    const onVisibility=()=>{
      if(document.hidden) stopLenis();
      else startLenis();
    };
    document.addEventListener('visibilitychange',onVisibility);

    return()=>{
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('resize',onResize);
      if(onPointer) window.removeEventListener('pointermove',onPointer);
      document.removeEventListener('visibilitychange',onVisibility);
      if(pointerFrame.current) cancelAnimationFrame(pointerFrame.current);
      if(scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
      stopLenis();
      lenis?.destroy();
      quietObserver?.disconnect();
    };
  },[]);

  if(!enabled) return null;

  return <div className={`${styles.effects} ${quiet?styles.quiet:''} ${lite?styles.lite:''}`} aria-hidden="true">
    <div className={styles.progressTrack}><span ref={progressRef}/></div>
    <div ref={glowRef} className={styles.cursorGlow}/>
    <div className={styles.grain}/>
    <div className={styles.edgeGlowLeft}/>
    <div className={styles.edgeGlowRight}/>
    <div className={styles.specks}>
      <i/><i/><i/><i/><i/>
    </div>
  </div>;
}
