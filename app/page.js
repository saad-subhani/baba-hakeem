'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import Lenis from '@studio-freight/lenis';

export default function Home() {
  const root = useRef(null);

  useEffect(() => {
    let ctx;
    let lenis;
    let raf;
    let dead = false;

    (async () => {
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (dead) return;
      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ duration: 1.05, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      raf = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      ctx = gsap.context(() => {
        gsap.from('.brand, .menu, .eyebrow, .hero-copy, .scroll-note', {
          opacity: 0,
          y: 22,
          duration: 1.1,
          stagger: 0.08,
          ease: 'power3.out'
        });

        gsap.from('.aloe', {
          opacity: 0,
          scale: 1.12,
          duration: 1.8,
          ease: 'power3.out'
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.story',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            pin: '.stage'
          }
        });

        tl.to('.hero-copy', { opacity: 0, y: -90, duration: 1 }, 0)
          .to('.aloe', { scale: 1.32, yPercent: -4, duration: 2 }, 0)
          .to('.gel-cut', { opacity: 1, y: 0, rotate: -8, duration: 1.3 }, 0.8)
          .to('.droplet', { opacity: 1, scale: 1, stagger: 0.08, duration: 1 }, 1.1)
          .to('.aloe', { opacity: 0.22, scale: 1.55, filter: 'blur(8px)', duration: 1.2 }, 2.2)
          .to('.gel-cut', { opacity: 0, y: -120, duration: 0.8 }, 2.2)
          .to('.droplet', { x: (i) => (i - 4) * 34, y: (i) => -160 - (i % 3) * 70, duration: 1.4 }, 2.2)
          .to('.bottle', { opacity: 1, scale: 1, y: 0, duration: 1.5 }, 2.4)
          .to('.reveal-copy', { opacity: 1, y: 0, duration: 1.2 }, 3.1)
          .to('.stage', { backgroundColor: '#ece9dd', color: '#173226', duration: 1.5 }, 4.1)
          .to('.dark-only', { opacity: 0, duration: 0.8 }, 4.1)
          .to('.light-only', { opacity: 1, duration: 1 }, 4.35);

        ScrollTrigger.refresh();
      }, root);
    })();

    return () => {
      dead = true;
      if (ctx) ctx.revert();
      if (raf) gsap.ticker.remove(raf);
      if (lenis) lenis.destroy();
    };
  }, []);

  return (
    <main ref={root}>
      <section className="story">
        <div className="stage">
          <header>
            <a className="brand" href="#">VERDURA <span>BOTANICS</span></a>
            <button className="menu" aria-label="Open menu">MENU <i /><i /></button>
          </header>

          <div className="ambient ambient-one dark-only" />
          <div className="ambient ambient-two dark-only" />

          <div className="aloe dark-only" aria-hidden="true">
            <span className="leaf l1" />
            <span className="leaf l2" />
            <span className="leaf l3" />
            <span className="leaf l4" />
            <span className="leaf l5" />
            <span className="leaf l6" />
            <span className="leaf l7" />
          </div>

          <div className="gel-cut dark-only"><span /></div>

          <div className="drops dark-only" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => <i className={'droplet d' + (i + 1)} key={i} />)}
          </div>

          <div className="hero-copy">
            <p className="eyebrow">PURE BOTANICAL CARE — 01</p>
            <h1>FROM<br /><em>NATURE.</em></h1>
            <div className="right-copy">
              <small>POTENT PLANTS.<br />PURER RITUALS.</small>
              <h2>MADE<br />FOR <em>SKIN.</em></h2>
            </div>
          </div>

          <div className="bottle" aria-label="Verdura Aloe Water product concept">
            <div className="cap" />
            <div className="glass">
              <span>VERDURA</span>
              <b>ALOE<br />WATER</b>
              <small>BOTANICAL HYDRATION<br />01 / 100 ML</small>
            </div>
          </div>

          <div className="reveal-copy">
            <small>THE RITUAL BEGINS WITH THE PLANT</small>
            <h2>ALOE,<br /><em>REIMAGINED.</em></h2>
            <p>A cinematic introduction to Verdura's botanical world. Scroll becomes the director: plant, texture, transformation, product.</p>
          </div>

          <p className="scroll-note dark-only">SCROLL TO BEGIN <span>↓</span></p>
          <p className="chapter light-only">01 — BOTANICAL HYDRATION</p>
        </div>
      </section>

      <section className="commerce">
        <p>VERDURA BOTANICS / THE COLLECTION</p>
        <h2>THE STORY BECOMES<br /><em>something you can hold.</em></h2>
        <div className="coming">
          <span>ALOE</span><span>NEEM</span><span>TURMERIC</span>
        </div>
      </section>
    </main>
  );
}
