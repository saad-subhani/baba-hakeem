'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './BestProductReveal.module.css';

export default function BestProductReveal({
  image='/products/mens-oil-new.png',
  name="Men's Oil",
  subtitle='Baba Hakeem Herbal Products'
}){
  const sectionRef=useRef(null);
  const [visible,setVisible]=useState(false);
  const [opened,setOpened]=useState(false);

  useEffect(()=>{
    const node=sectionRef.current;
    if(!node) return;
    const observer=new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting){
        setVisible(true);
        observer.disconnect();
      }
    },{threshold:.24});
    observer.observe(node);
    return()=>observer.disconnect();
  },[]);

  const reveal=()=>{
    if(opened) return;
    setOpened(true);
  };

  return (
    <section
      ref={sectionRef}
      className={[
        styles.section,
        visible ? styles.visible : '',
        opened ? styles.opened : ''
      ].join(' ')}
      id="best-product"
      aria-labelledby="best-product-title"
    >
      <div className={styles.ambient} aria-hidden="true"/>
      <div className={styles.headingWrap}>
        <span>THE SIGNATURE REVEAL</span>
        <h2 id="best-product-title">OUR BEST PRODUCT</h2>
        <p>One product. One reveal. Click the chest to discover what sits at the heart of the collection.</p>
      </div>

      <div className={styles.stage}>
        <div className={styles.spotlight} aria-hidden="true"/>
        <div className={styles.glow} aria-hidden="true"/>

        <div className={styles.productReveal} aria-hidden={!opened}>
          <div className={styles.productHalo}/>
          <img src={image} alt={name}/>
          <div className={styles.productCopy}>
            <small>BEST SELLER</small>
            <strong>{name}</strong>
            <span>{subtitle}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.chestButton}
          onClick={reveal}
          aria-label={opened ? name+' revealed' : 'Reveal '+name}
          aria-expanded={opened}
        >
          <div className={styles.chest}>
            <div className={styles.lid}>
              <div className={styles.lidFace}>
                <i className={styles.metalCorner+' '+styles.tl}/>
                <i className={styles.metalCorner+' '+styles.tr}/>
                <i className={styles.lidBand}/>
                <span className={styles.woodGrain}/>
              </div>
            </div>

            <div className={styles.body}>
              <span className={styles.woodGrain}/>
              <i className={styles.metalCorner+' '+styles.bl}/>
              <i className={styles.metalCorner+' '+styles.br}/>
              <i className={styles.bandLeft}/>
              <i className={styles.bandRight}/>
              <div className={styles.latch}><span/></div>
            </div>

            <div className={styles.baseShadow}/>
          </div>
        </button>

        <div className={styles.particles} aria-hidden="true">
          {Array.from({length:12}).map((_,i)=><i key={i}/>)}
        </div>

        <div className={styles.hint}>
          <span>{opened ? 'REVEALED' : 'CLICK TO REVEAL'}</span>
          <i/>
        </div>
      </div>
    </section>
  );
}
