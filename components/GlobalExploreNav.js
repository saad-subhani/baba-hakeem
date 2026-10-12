'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import styles from './GlobalExploreNav.module.css';

const pages=[
  ['About','/about','The Baba Hakeem story'],
  ['Care Guide','/care-guide','Everyday product rituals'],
  ['Journal','/journal','Stories, ingredients and craft'],
  ['Ingredients','/ingredients','What goes into the range'],
  ['Testimonials','/testimonials','Customer experiences'],
  ['Stockists','/stockists','Where to find Baba Hakeem'],
  ['Our Process','/process','From tradition to finished product'],
  ['Wholesale','/wholesale','Business and stockist enquiries'],
  ['FAQ','/faq','Common questions answered'],
  ['Contact','/contact','Talk to Baba Hakeem'],
  ['Shipping & Returns','/shipping-returns','Delivery and returns'],
  ['Privacy','/privacy','Privacy information'],
  ['Terms','/terms','Website terms']
];

export default function GlobalExploreNav(){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const panel=useRef(null);
  const backdrop=useRef(null);

  useEffect(()=>{ setOpen(false); },[pathname]);

  useEffect(()=>{
    if(!open) return;
    const ctx=gsap.context(()=>{
      gsap.fromTo(backdrop.current,{opacity:0},{opacity:1,duration:.28,ease:'power2.out'});
      gsap.fromTo(panel.current,{opacity:0,y:28,scale:.985},{opacity:1,y:0,scale:1,duration:.58,ease:'power3.out'});
      gsap.fromTo('[data-explore-link]',{opacity:0,y:18},{opacity:1,y:0,duration:.48,stagger:.035,ease:'power3.out',delay:.08});
    },panel);
    return()=>ctx.revert();
  },[open]);

  return <>
    <button className={styles.trigger} onClick={()=>setOpen(true)} aria-label="Explore Baba Hakeem pages">
      <span>Explore pages</span><b>+</b>
    </button>
    {open&&<div ref={backdrop} className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Explore Baba Hakeem">
      <div ref={panel} className={styles.panel}>
        <div className={styles.topline}>
          <Link href="/" className={styles.brand}>Baba Hakeem</Link>
          <button className={styles.close} onClick={()=>setOpen(false)} aria-label="Close explore menu">Close <span>×</span></button>
        </div>
        <div className={styles.heading}>
          <small>EXPLORE BABA HAKEEM</small>
          <h2>More than<br/>a product page.</h2>
          <p>Discover the story, care guidance, ingredients, journal and everything around the Baba Hakeem collection.</p>
        </div>
        <nav className={styles.grid}>
          {pages.map(([label,href,desc],i)=><Link data-explore-link href={href} key={href} className={styles.card}>
            <span className={styles.index}>{String(i+1).padStart(2,'0')}</span>
            <div><strong>{label}</strong><em>{desc}</em></div>
            <b>↗</b>
          </Link>)}
        </nav>
      </div>
    </div>}
  </>;
}
