import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Care Guide | Baba Hakeem'};

export default function CareGuidePage(){
 return <PremiumPageShell eyebrow="07 / CARE GUIDE" title="BUILD A BETTER DAILY RITUAL." intro="A simple, product-first guide to using Baba Hakeem products with more clarity and consistency.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>START SIMPLE</span><div><h2>CHOOSE THE RITUAL BEFORE THE PRODUCT.</h2><p>Think in routines: hair care, topical oil, traditional herbal blends or premium saffron. Start with one clear purpose, then build from there.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / HAIR</small><h3>Hair ritual</h3><p>Use the product directions on the label and build a consistent routine around timing, quantity and wash days.</p></article>
    <article className={styles.card} data-reveal><small>02 / TOPICAL</small><h3>Body ritual</h3><p>Keep application focused and consistent. Follow the product packaging for exact usage and safety guidance.</p></article>
    <article className={styles.card} data-reveal><small>03 / HERBAL</small><h3>Traditional blends</h3><p>For powdered or edible products, rely on the approved label for serving, preparation and storage guidance.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>CONSISTENCY</span><div><h2>SMALL STEPS. REPEATED WELL.</h2><p>The strongest routine is the one that stays easy enough to repeat. Keep products organized, stored correctly and used as directed.</p></div></div>
   <div className={styles.line} data-line/>
  </section>
 </PremiumPageShell>;
}