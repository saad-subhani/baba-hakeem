import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

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
   <div className={styles.sectionHead}><span className={styles.kicker}>THE PRINCIPLE</span><div><h2>LESS NOISE. MORE INTENT.</h2><p>The visual language stays deliberately simple: concrete gray, deep black, strong typography and product-first storytelling.</p></div></div>
   <div className={styles.line} data-line/>
  </section>
 </PremiumPageShell>;
}