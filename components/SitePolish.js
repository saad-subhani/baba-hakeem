'use client';

import { useEffect, useRef, useState } from 'react';
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
    const cores=navigator.hardwareConcurrency||8;
    const memory=navigator.deviceMemory||8;
    const dpr=window.devicePixelRatio||1;
    const denseDesktop=window.innerWidth>=1100&&dpr>1.15;
    const lowPower=cores<=6||memory<=4||denseDesktop;
    setLite(reduced||lowPower);

    // Keep native browser scrolling. A permanent Lenis RAF was competing with
    // GSAP + WebGL on lower-power laptops and made the whole page feel heavier.
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

    let signatureQuiet=false;
    let onPointer;
    if(!coarse&&!reduced&&!lowPower){
      onPointer=(event)=>{
        if(signatureQuiet||document.hidden||pointerFrame.current) return;
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
      const next=entries[0]?.isIntersecting??false;
      signatureQuiet=next;
      setQuiet(next);
    },{threshold:.04}):null;
    if(signature&&quietObserver) quietObserver.observe(signature);

    return()=>{
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('resize',onResize);
      if(onPointer) window.removeEventListener('pointermove',onPointer);
      if(pointerFrame.current) cancelAnimationFrame(pointerFrame.current);
      if(scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
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
