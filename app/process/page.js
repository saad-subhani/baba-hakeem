import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Our Process | Baba Hakeem'};

export default function ProcessPage(){
 return <PremiumPageShell eyebrow="11 / OUR PROCESS" title="FROM IDEA TO EVERYDAY RITUAL." intro="A clearer look at how product, packaging, presentation and customer experience come together under one Baba Hakeem system.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>THE FLOW</span><div><h2>FOUR STEPS. ONE CONSISTENT STANDARD.</h2><p>The process is designed to keep the product at the center while making every customer touchpoint more considered.</p></div></div>
   <div className={styles.grid2}>
    <article className={styles.card} data-reveal><small>01 / SELECT</small><h3>Product focus</h3><p>Define the product, its format, intended routine and the information customers need most.</p></article>
    <article className={styles.card} data-reveal><small>02 / DESIGN</small><h3>Visual system</h3><p>Build packaging, imagery and digital presentation around one disciplined black-and-gray identity.</p></article>
    <article className={styles.card} data-reveal><small>03 / PRESENT</small><h3>Digital experience</h3><p>Use motion, hierarchy and product storytelling to make browsing feel premium without becoming heavy or confusing.</p></article>
    <article className={styles.card} data-reveal><small>04 / SUPPORT</small><h3>After purchase</h3><p>Keep care guidance, FAQs, contact routes and order support easy to find.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>WHAT STAYS CONSISTENT</span><div><h2>CLARITY AT EVERY STAGE.</h2><p>As the collection grows, the system can expand without losing the things that make it easy to understand: clear categories, recognizable packaging and a consistent tone.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / INFORMATION</small><h3>Clear product details</h3><p>Names, categories, descriptions and directions should stay structured so customers can compare products without unnecessary confusion.</p></article>
    <article className={styles.card} data-reveal><small>02 / PRESENTATION</small><h3>One visual language</h3><p>Photography, packaging and interface details should feel connected even when individual products have different formats.</p></article>
    <article className={styles.card} data-reveal><small>03 / EXPERIENCE</small><h3>Useful support</h3><p>Care guidance, FAQs and contact routes should remain part of the product experience rather than an afterthought.</p></article>
   </div>
  </section>
 </PremiumPageShell>;
}