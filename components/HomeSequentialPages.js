'use client';

import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import styles from './HomeSequentialPages.module.css';

const ALOE='/aloe.png.png';
const NEEM='/neem.png-removebg-preview.png';
const TURMERIC='/turmeric.png-removebg-preview.png';
const JOINT='/products/30ml%20mockup.png';
const HERBAL='/products/phakii.png';
const ZAFRAN='/products/zafran/IMG_20241002_133345.webp';
const ZAFRAN_ALT='/products/zafran/IMG_20241002_133606.webp';
const HANDS='/hands-removebg-preview.png';
const CONTACT='/contact-premium.webp';

const cards=(items)=>items.map((item,i)=><article className={styles.card} data-seq-card key={item[0]}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{item[0]}</h3><p>{item[1]}</p></div></article>);

const VisualCard=({src,alt,kicker,title,copy,contain=false})=><article className={styles.visualCard} data-seq-card data-seq-visual>
 <div className={`${styles.visualMedia} ${contain?styles.contain:''}`}><img src={src} alt={alt} loading="lazy" decoding="async" fetchPriority="low"/></div>
 <div className={styles.visualCopy}>{kicker&&<small>{kicker}</small>}<h3>{title}</h3>{copy&&<p>{copy}</p>}</div>
</article>;

export default function HomeSequentialPages(){
 const pathname=usePathname();
 const root=useRef(null);
 useEffect(()=>{
  if(pathname!=='/'||typeof window==='undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if(reduce) return;

  let initFrame=0;
  const triggers=[];
  const ctx=gsap.context(()=>{
   initFrame=requestAnimationFrame(()=>{
    gsap.utils.toArray('[data-seq-section]').forEach((section)=>{
     const head=section.querySelector('[data-seq-head]');
     const lead=section.querySelector('[data-seq-lead]');
     const line=section.querySelector('[data-seq-line]');
     const regular=[...section.querySelectorAll('[data-seq-card]:not([data-seq-visual])')];
     const visuals=[...section.querySelectorAll('[data-seq-visual]')];

     const playReveal=()=>{
      const tl=gsap.timeline({defaults:{ease:'power3.out'}});
      if(head) tl.from(head,{y:34,opacity:0,duration:.62,immediateRender:false},0);
      if(lead) tl.from(lead,{y:16,opacity:0,duration:.48,immediateRender:false},.04);
      if(regular.length) tl.from(regular,{y:20,opacity:0,duration:.48,stagger:.04,immediateRender:false},.08);
      if(visuals.length) tl.from(visuals,{y:18,scale:.985,opacity:0,duration:.56,stagger:.045,immediateRender:false},.07);
      if(line) tl.fromTo(line,{scaleX:0},{scaleX:1,duration:.52,immediateRender:false},.1);
     };

     triggers.push(ScrollTrigger.create({
      trigger:section,
      start:'top 88%',
      once:true,
      onEnter:playReveal
     }));
    });
    ScrollTrigger.refresh();
   });
  },root);

  return()=>{
   if(initFrame) cancelAnimationFrame(initFrame);
   triggers.forEach(trigger=>trigger.kill());
   ctx.revert();
  };
 },[pathname]);
 if(pathname!=='/') return null;
 return <div ref={root} className={styles.sequence}>
  <section className={styles.section} data-seq-section>
   <div className={styles.index}>10 / About Baba Hakeem</div>
   <div className={styles.heroVisualSplit}>
    <div><h2 className={styles.title} data-seq-head>ROOTED IN HERBAL TRADITION.</h2><p className={styles.lead} data-seq-lead>Baba Hakeem brings traditional herbal care into a cleaner, calmer and more considered modern experience — without losing the character that makes the brand familiar.</p></div>
    <div className={styles.heroVisual} data-seq-visual><img src={ZAFRAN} alt="Baba Hakeem premium product presentation" loading="lazy" decoding="async" fetchPriority="low"/></div>
   </div>
   <div className={styles.grid}>{cards([['Heritage','A product world shaped by traditional herbal formats and everyday care.'],['Clarity','A simplified visual language that makes every product family easier to understand.'],['Consistency','One black-and-gray brand system across oils, blends, saffron and future launches.']])}</div>
  </section>

  <section className={`${styles.section} ${styles.dark}`} data-seq-section>
   <div className={styles.index}>11 / Care Guide</div>
   <div className={styles.split}><div><h2 className={styles.title} data-seq-head>A CALMER DAILY RITUAL.</h2><p className={styles.lead} data-seq-lead>Simple guidance, thoughtful routines and product-first care designed to feel easy to follow.</p><div className={styles.singleVisual} data-seq-visual><img src={HANDS} alt="Hands presenting a simple herbal care ritual" loading="lazy" decoding="async" fetchPriority="low"/></div></div><div className={styles.steps}>{[['01','Choose','Start with the product that matches the ritual you want to build.'],['02','Use','Follow the format and directions provided with the product.'],['03','Repeat','Keep routines simple and consistent rather than overcomplicating them.']].map(x=><div className={styles.step} data-seq-card key={x[0]}><b>{x[0]}</b><div><h3>{x[1]}</h3><p>{x[2]}</p></div></div>)}</div></div>
  </section>

  <section className={styles.section} data-seq-section>
   <div className={styles.index}>12 / Ingredients</div><h2 className={styles.title} data-seq-head>FAMILIAR BOTANICALS. CLEAR PURPOSE.</h2><p className={styles.lead} data-seq-lead>Explore the ingredient language behind the collection and how familiar herbal references shape the identity of the range.</p>
   <div className={styles.visualGrid}>
    <VisualCard src={ALOE} alt="Aloe vera botanical" kicker="01 / BOTANICAL" title="Aloe Vera" copy="A familiar botanical associated with soothing and hydration-led rituals." contain/>
    <VisualCard src={NEEM} alt="Neem botanical" kicker="02 / BOTANICAL" title="Neem" copy="A traditional herbal reference frequently connected with balancing care." contain/>
    <VisualCard src={TURMERIC} alt="Turmeric botanical" kicker="03 / BOTANICAL" title="Turmeric" copy="A widely recognised botanical with a strong place in traditional self-care." contain/>
   </div>
  </section>

  <section className={`${styles.section} ${styles.dark}`} data-seq-section>
   <div className={styles.index}>13 / Our Process</div><h2 className={styles.title} data-seq-head>FROM IDEA TO EVERYDAY RITUAL.</h2><p className={styles.lead} data-seq-lead>Every product is presented through one deliberate sequence — product, purpose, packaging and a clear place inside the wider Baba Hakeem world.</p>
   <div className={styles.visualGrid}>
    <VisualCard src={HERBAL} alt="Traditional Baba Hakeem herbal blend" kicker="01 / SELECT" title="Choose the form" copy="Start with recognisable herbal formats and familiar everyday rituals." contain/>
    <VisualCard src={JOINT} alt="Baba Hakeem Joint Oil packaging" kicker="02 / REFINE" title="Refine the presentation" copy="Give every product a cleaner, premium and more consistent visual system." contain/>
    <VisualCard src={ZAFRAN_ALT} alt="Baba Hakeem premium saffron packaging" kicker="03 / PRESENT" title="Build the experience" copy="Connect product, packaging and story through one considered digital journey."/>
   </div>
  </section>

  <section className={styles.section} data-seq-section>
   <div className={styles.index}>14 / FAQ</div><h2 className={styles.title} data-seq-head>COMMON QUESTIONS. CLEAR ANSWERS.</h2>
   <div className={styles.faq}>{[['What kind of products does Baba Hakeem offer?','The range currently includes herbal oils, traditional powdered blends and premium saffron, with room for future additions.'],['Where can I learn how to use a product?','Product-specific guidance can be shown alongside each product and inside the care guide section.'],['Where can I ask a product question?','Use the contact section below for general product, order or business enquiries.']].map(x=><article data-seq-card key={x[0]}><h3>{x[0]}</h3><p>{x[1]}</p></article>)}</div>
  </section>

  <section className={`${styles.section} ${styles.dark}`} data-seq-section>
   <div className={styles.index}>15 / Contact Us</div><h2 className={styles.title} data-seq-head>LET’S TALK.</h2><p className={styles.lead} data-seq-lead>Questions about products, availability, orders or partnerships can all begin here.</p>
   <div className={styles.contactVisualLayout}><div className={styles.contactBox}><div data-seq-card><small>GENERAL ENQUIRIES</small><h3>PRODUCTS & SUPPORT</h3><p>Use this space for customer questions, product information and order-related communication.</p></div><div data-seq-card><small>BUSINESS ENQUIRIES</small><h3>BUSINESS & PARTNERSHIPS</h3><p>Use this space for collaboration requests and commercial conversations.</p></div></div><div className={`${styles.heroVisual} ${styles.darkVisual}`} data-seq-visual><img src={CONTACT} alt="Premium contact, phone, email and chat artwork" loading="lazy" decoding="async" fetchPriority="low"/></div></div>
  </section>

  <section className={`${styles.section} ${styles.legal}`} data-seq-section>
   <div className={styles.index}>16 / Shipping & Returns</div><h2 className={styles.title} data-seq-head>DELIVERY, MADE CLEAR.</h2><div className={styles.grid}>{cards([['Shipping','Delivery timing, service areas and dispatch information can be kept transparent here.'],['Returns','Return eligibility and product-condition requirements can be explained in one place.'],['Support','Order issues can be directed to the same contact channel for a cleaner experience.']])}</div>
  </section>

  <section className={`${styles.section} ${styles.dark} ${styles.legal}`} data-seq-section>
   <div className={styles.index}>17 / Privacy</div><h2 className={styles.title} data-seq-head>YOUR DATA, TREATED WITH CARE.</h2><p className={styles.lead} data-seq-lead>A clear privacy area for explaining what information the website collects, why it is used and how customer information is handled.</p><div className={styles.line} data-seq-line/></section>

  <section className={`${styles.section} ${styles.legal}`} data-seq-section>
   <div className={styles.index}>18 / Terms</div><h2 className={styles.title} data-seq-head>THE DETAILS THAT KEEP THINGS CLEAR.</h2><p className={styles.lead} data-seq-lead>Terms for website use, product information, orders, availability, intellectual property and future commerce can live here in a readable format.</p><div className={styles.line} data-seq-line/></section>

  <section className={`${styles.section} ${styles.dark} ${styles.closing}`} data-seq-section>
   <div className={styles.index}>Baba Hakeem Herbal Products</div><h2 className={styles.title} data-seq-head>ONE WEBSITE. ONE CONTINUOUS BRAND STORY.</h2><p className={styles.lead} data-seq-lead>From the opening hero to products, best product reveal, brand story, care, support and essential information — everything continues in one scroll.</p><div className={styles.line} data-seq-line/></section>
 </div>;
}
