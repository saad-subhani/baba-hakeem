'use client';

import {useEffect,useRef} from 'react';
import {usePathname} from 'next/navigation';
import {gsap} from 'gsap';
import styles from './HomeSequentialPages.module.css';
import footerStyles from './FooterRefine.module.css';

const JOINT='/products/30ml%20mockup.png';
const HERBAL='/products/phakii.png';
const ZAFRAN_ALT='/products/zafran/IMG_20241002_133606.webp';
const HANDS='/care-guide/care-guide-ritual.webp.png';
const CONTACT='/contact/let_s_talk_premium_contact_section.png.png';

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
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if(reduce) return;

  const timelines=new Set();
  const sections=[...root.current.querySelectorAll('[data-seq-section]')];
  const played=new WeakSet();
  const playReveal=(section)=>{
   if(played.has(section)) return;
   played.add(section);
   const index=section.firstElementChild;
   const head=section.querySelector('[data-seq-head]');
   const lead=section.querySelector('[data-seq-lead]');
   const line=section.querySelector('[data-seq-line]');
   const regular=[...section.querySelectorAll('[data-seq-card]:not([data-seq-visual])')];
   const visuals=[...section.querySelectorAll('[data-seq-visual]')];
   const tl=gsap.timeline({defaults:{ease:'power3.out'},onComplete:()=>timelines.delete(tl)});
   timelines.add(tl);
   if(index) tl.from(index,{x:-12,opacity:0,duration:.34,immediateRender:false,force3D:true},0);
   if(head) tl.from(head,{y:46,opacity:0,scale:.995,duration:.64,immediateRender:false,force3D:true},.02);
   if(lead) tl.from(lead,{y:22,opacity:0,duration:.46,immediateRender:false,force3D:true},.08);
   if(regular.length) tl.from(regular,{y:28,scale:.985,opacity:0,duration:.52,stagger:.055,immediateRender:false,force3D:true},.1);
   if(visuals.length) tl.from(visuals,{y:30,scale:.975,opacity:0,duration:.58,stagger:.065,immediateRender:false,force3D:true},.1);
   if(line) tl.fromTo(line,{scaleX:0,opacity:.35},{scaleX:1,opacity:1,duration:.55,immediateRender:false,force3D:true},.12);
  };

  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    playReveal(entry.target);
   });
  },{root:null,rootMargin:'0px 0px -8% 0px',threshold:.01});

  sections.forEach(section=>observer.observe(section));
  return()=>{
   observer.disconnect();
   timelines.forEach(tl=>tl.kill());
   timelines.clear();
  };
 },[pathname]);
 if(pathname!=='/') return null;
 return <div ref={root} className={styles.sequence}>
  <section className={styles.section} data-seq-section>
   <div className={styles.index}>10 / About Baba Hakeem</div>
   <h2 className={styles.title} data-seq-head>ROOTED IN HERBAL TRADITION.</h2>
   <p className={styles.lead} data-seq-lead>Baba Hakeem brings traditional herbal care into a cleaner, calmer and more considered modern experience — without losing the character that makes the brand familiar.</p>
   <div className={styles.grid}>{cards([['Heritage','A product world shaped by traditional herbal formats and everyday care.'],['Clarity','A simplified visual language that makes every product family easier to understand.'],['Consistency','One black-and-gray brand system across oils, blends, saffron and future launches.']])}</div>
  </section>

  <section className={`${styles.section} ${styles.dark}`} data-seq-section>
   <div className={styles.index}>11 / Care Guide</div>
   <div className={styles.split}><div><h2 className={styles.title} data-seq-head>A CALMER DAILY RITUAL.</h2><p className={styles.lead} data-seq-lead>Simple guidance, thoughtful routines and product-first care designed to feel easy to follow.</p><div className={styles.singleVisual} data-seq-visual><img src={HANDS} alt="Premium herbal self-care ritual with botanical oil" loading="lazy" decoding="async" fetchPriority="low"/></div></div><div className={styles.steps}>{[['01','Choose','Start with the product that matches the ritual you want to build.'],['02','Use','Follow the format and directions provided with the product.'],['03','Repeat','Keep routines simple and consistent rather than overcomplicating them.']].map(x=><div className={styles.step} data-seq-card key={x[0]}><b>{x[0]}</b><div><h3>{x[1]}</h3><p>{x[2]}</p></div></div>)}</div></div>
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

  <footer className={`${styles.footer} ${footerStyles.footer}`} data-seq-section>
   <div className={styles.footerTop} data-seq-card>
    <span>BABA HAKEEM HERBAL PRODUCTS</span>
    <span>TRADITIONAL CARE / MODERN RITUAL</span>
   </div>

   <div className={`${styles.footerHero} ${footerStyles.hero}`}>
    <div>
     <p className={styles.footerEyebrow}>THE HOUSE OF BABA HAKEEM</p>
     <h2 data-seq-head>HERBAL CARE,<br/>REFINED.</h2>
    </div>
    <div className={`${styles.footerIntro} ${footerStyles.intro}`} data-seq-lead>
     <p>A considered herbal product world shaped by familiar traditions, clearer presentation and everyday rituals.</p>
     <a href="/contact">Start a conversation <span>↗</span></a>
    </div>
   </div>

   <div className={styles.footerDivider} data-seq-line/>

   <div className={`${styles.footerLinks} ${footerStyles.links}`} data-seq-card>
    <div className={`${styles.footerBrandBlock} ${footerStyles.brand}`}>
     <strong>Baba Hakeem</strong>
     <p>Herbal products presented through one calm, monochrome and consistent brand system.</p>
    </div>
    <nav aria-label="Footer explore navigation">
     <small>EXPLORE</small>
     <a href="/about">About</a>
     <a href="/care-guide">Care Guide</a>
     <a href="/process">Our Process</a>
    </nav>
    <nav aria-label="Footer support navigation">
     <small>SUPPORT</small>
     <a href="/faq">FAQ</a>
     <a href="/contact">Contact</a>
     <a href="https://www.instagram.com/babahakeem_786/" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
     <a href="/shipping-returns">Shipping & Returns</a>
    </nav>
    <nav aria-label="Footer legal navigation">
     <small>LEGAL</small>
     <a href="/privacy">Privacy</a>
     <a href="/terms">Terms</a>
     <a href="#top">Back to top ↑</a>
    </nav>
   </div>

   <div className={`${styles.footerBottom} ${footerStyles.bottom}`} data-seq-card>
    <span>© 2026 BABA HAKEEM HERBAL PRODUCTS</span>
    <span>PAKISTAN</span>
    <span>HERBAL TRADITION / MODERN PRESENTATION</span>
   </div>
   <div className={`${styles.footerWordmark} ${footerStyles.wordmark}`} aria-hidden="true">BABA HAKEEM</div>
  </footer>
 </div>;
}
