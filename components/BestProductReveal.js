'use client';

import styles from './BestProductReveal.module.css';

export default function BestProductReveal(){
  return (
    <section className={styles.section} id="best-product" aria-labelledby="best-product-title">
      <div className={styles.vignette} aria-hidden="true"/>
      <div className={styles.warmGlow} aria-hidden="true"/>
      <div className={styles.botanicalLeft} aria-hidden="true"/>
      <div className={styles.botanicalRight} aria-hidden="true"/>

      <div className={styles.heading}>
        <div className={styles.kicker}>
          <span/>
          THE SIGNATURE REVEAL
          <span/>
        </div>

        <h2 id="best-product-title">
          OUR <em>BEST</em> PRODUCT
        </h2>

        <p>
          One product. One reveal. Click the chest to discover
          what sits at the heart of the collection.
        </p>
      </div>

      <div className={styles.stage}>
        <div className={styles.pedestal}>
          <div className={styles.chestFrame}>
            <img
              src="/best-product-chest.jpg"
              alt="Ornate handcrafted wooden chest"
              className={styles.chestImage}
            />
          </div>
        </div>

        <button type="button" className={styles.revealButton}>
          <span className={styles.lockIcon}>⌾</span>
          <span>CLICK TO REVEAL</span>
          <b>→</b>
        </button>
      </div>

      <div className={styles.trustRow}>
        <div>
          <i>✧</i>
          <strong>100% NATURAL</strong>
          <span>Pure herbal care</span>
        </div>
        <div>
          <i>◌</i>
          <strong>TRADITIONAL CARE</strong>
          <span>Rooted in heritage</span>
        </div>
        <div>
          <i>♧</i>
          <strong>HERBAL FORMULA</strong>
          <span>Thoughtfully selected</span>
        </div>
        <div>
          <i>◇</i>
          <strong>TRUSTED QUALITY</strong>
          <span>Baba Hakeem standard</span>
        </div>
      </div>
    </section>
  );
}
