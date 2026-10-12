'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PremiumPage.module.css';

export default function PremiumPageShell({eyebrow,title,intro,children}){
  const root=useRef(null);

  useEffect(()=>{
    if(typeof window==='undefined') return;
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

  return <main ref={root} className={styles.page}>
    <header className={styles.nav} data-premium-nav>
      <Link className={styles.logo} href="/">Baba Hakeem</Link>
      <nav>
        <Link href="/about">About</Link>
        <Link href="/care-guide">Care Guide</Link>
        <Link href="/journal">Journal</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <Link className={styles.home} href="/">Home <span>↗</span></Link>
    </header>

    <section className={styles.hero} data-premium-hero>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h1>{title}</h1>
      <p>{intro}</p>
      <div className={styles.scrollCue}>SCROLL TO EXPLORE <span>↓</span></div>
    </section>

    <div className={styles.content}>{children}</div>

    <footer className={styles.footer} data-reveal>
      <div><strong>Baba Hakeem</strong><span>Traditional herbal care, refined for modern routines.</span></div>
      <nav>
        <Link href="/about">About</Link>
        <Link href="/care-guide">Care Guide</Link>
        <Link href="/journal">Journal</Link>
        <Link href="/ingredients">Ingredients</Link>
        <Link href="/testimonials">Testimonials</Link>
        <Link href="/stockists">Stockists</Link>
        <Link href="/process">Our Process</Link>
        <Link href="/wholesale">Wholesale</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/shipping-returns">Shipping & Returns</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </footer>
  </main>;
}

export {styles};