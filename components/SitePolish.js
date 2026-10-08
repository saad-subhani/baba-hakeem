'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './SitePolish.module.css';

const chapters=[
  {label:'Home',selector:'.ref-hero',href:'#'},
  {label:'Products',selector:'.ref-catalogue',href:'#reel-products'},
  {label:'Featured',selector:'.ref-feature',href:'#featured-product'},
  {label:'Signature',selector:'#best-product',href:'#best-product'}
];

export default function SitePolish(){
  const glowRef=useRef(null);
  const progressRef=useRef(null);
  const pointerFrame=useRef(0);
  const scrollFrame=useRef(0);
  const [enabled,setEnabled]=useState(false);
  const [active,setActive]=useState(0);
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

    const updateProgress=()=>{
      scrollFrame.current=0;
      if(!progressRef.current||!site) return;
      const rect=site.getBoundingClientRect();
      const distance=Math.max(1,rect.height-window.innerHeight);
      const value=Math.min(1,Math.max(0,-rect.top/distance));
      progressRef.current.style.transform=`scaleX(${value})`;
    };
    const onScroll=()=>{
      if(!scrollFrame.current) scrollFrame.current=requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',onScroll,{passive:true});

    let onPointer;
    if(!coarse&&!reduced){
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

    const sectionNodes=chapters.map(item=>document.querySelector(item.selector));
    const chapterObserver=new IntersectionObserver(entries=>{
      const visible=entries
        .filter(entry=>entry.isIntersecting)
        .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(!visible) return;
      const index=sectionNodes.indexOf(visible.target);
      if(index>=0) setActive(index);
    },{threshold:[.18,.35,.55],rootMargin:'-18% 0px -28%'});
    sectionNodes.forEach(node=>node&&chapterObserver.observe(node));

    const signature=document.querySelector('#best-product');
    const quietObserver=signature?new IntersectionObserver(entries=>{
      setQuiet(entries[0]?.isIntersecting??false);
    },{threshold:.05}):null;
    if(signature&&quietObserver) quietObserver.observe(signature);

    return()=>{
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('resize',onScroll);
      if(onPointer) window.removeEventListener('pointermove',onPointer);
      if(pointerFrame.current) cancelAnimationFrame(pointerFrame.current);
      if(scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
      chapterObserver.disconnect();
      quietObserver?.disconnect();
    };
  },[]);

  if(!enabled) return null;

  return <>
    <div className={`${styles.effects} ${quiet?styles.quiet:''} ${lite?styles.lite:''}`} aria-hidden="true">
      <div className={styles.progressTrack}><span ref={progressRef}/></div>
      <div ref={glowRef} className={styles.cursorGlow}/>
      <div className={styles.grain}/>
      <div className={styles.edgeGlowLeft}/>
      <div className={styles.edgeGlowRight}/>
      <div className={styles.specks}>
        <i/><i/><i/><i/><i/>
      </div>
    </div>
    <nav className={styles.chapterRail} aria-label="Page sections">
      {chapters.map((chapter,index)=><a
        key={chapter.label}
        href={chapter.href}
        className={index===active?styles.active:''}
        aria-label={`Go to ${chapter.label}`}
      ><span/>{chapter.label}</a>)}
    </nav>
  </>;
}
