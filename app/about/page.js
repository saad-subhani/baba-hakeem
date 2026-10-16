import PremiumPageShell from '../../components/PremiumPageShell';
import styles from '../../components/PremiumPage.module.css';

export const metadata={title:'About | Baba Hakeem'};

export default function AboutPage(){
 return <PremiumPageShell eyebrow="01 / OUR STORY" title="HERBAL CARE, MADE CONSIDERED." intro="A quieter approach to traditional herbal care — familiar rituals, thoughtful presentation and a modern Baba Hakeem identity.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>ROOTED IN TRADITION</span><div><h2>OLD WISDOM. CLEANER EXPRESSION.</h2><p>Baba Hakeem brings traditional herbal products into a more refined everyday experience without losing the familiarity at the heart of the brand.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / ROOTS</small><h3>Traditional</h3><p>Inspired by herbal routines that have remained part of everyday care across generations.</p></article>
    <article className={styles.card} data-reveal><small>02 / APPROACH</small><h3>Considered</h3><p>Focused products, restrained design and a clearer way to explore the collection.</p></article>
    <article className={styles.card} data-reveal><small>03 / FUTURE</small><h3>Modern</h3><p>A digital-first presentation built to make the brand feel premium, useful and memorable.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>THE PRODUCT WORLD</span><div><h2>DIFFERENT FORMATS. ONE BABA HAKEEM SYSTEM.</h2><p>Oils, traditional blends, saffron and future categories can feel connected without being identical. The goal is a product family that stays easy to recognize and easy to navigate.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / OILS</small><h3>Focused routines</h3><p>Hair, topical and personal-care oils are presented around clear categories, practical information and product-first imagery.</p></article>
    <article className={styles.card} data-reveal><small>02 / BLENDS</small><h3>Familiar formats</h3><p>Traditional powdered products keep their recognizable character while gaining clearer naming, presentation and supporting information.</p></article>
    <article className={styles.card} data-reveal><small>03 / PREMIUM</small><h3>Elevated presentation</h3><p>Saffron, gifting and future premium products can use the same brand language with a more elevated presentation where appropriate.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>THE PRINCIPLE</span><div><h2>LESS NOISE. MORE INTENT.</h2><p>The visual language stays deliberately simple: concrete gray, deep black, strong typography and product-first storytelling.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / CLARITY</small><h3>Easy to understand</h3><p>Product names, categories and supporting information should help customers understand the range without unnecessary complexity.</p></article>
    <article className={styles.card} data-reveal><small>02 / CONSISTENCY</small><h3>Recognizable everywhere</h3><p>Packaging, product imagery and digital pages should feel like parts of one system rather than separate experiences.</p></article>
    <article className={styles.card} data-reveal><small>03 / FLEXIBILITY</small><h3>Built to grow</h3><p>The system should support future launches and new formats without requiring the brand to reinvent itself every time.</p></article>
   </div>
  </section>
 </PremiumPageShell>;
}