import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Care Guide | Baba Hakeem'};

export default function CareGuidePage(){
 return <PremiumPageShell eyebrow="07 / CARE GUIDE" title="BUILD A BETTER DAILY RITUAL." intro="A simple, product-first guide to using Baba Hakeem products with more clarity, consistency and better day-to-day organization.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>START SIMPLE</span><div><h2>CHOOSE THE RITUAL BEFORE THE PRODUCT.</h2><p>Think in routines: hair care, topical oil, traditional herbal blends or premium saffron. Start with one clear purpose, then build from there.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / HAIR</small><h3>Hair ritual</h3><p>Use the product directions on the label and build a consistent routine around timing, quantity and wash days.</p></article>
    <article className={styles.card} data-reveal><small>02 / TOPICAL</small><h3>Body ritual</h3><p>Keep application focused and consistent. Follow the product packaging for exact usage and safety guidance.</p></article>
    <article className={styles.card} data-reveal><small>03 / HERBAL</small><h3>Traditional blends</h3><p>For powdered or edible products, rely on the approved label for serving, preparation and storage guidance.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>BEFORE YOU USE</span><div><h2>READ FIRST. THEN BUILD THE ROUTINE.</h2><p>A calmer routine starts with the information already provided with the product. Keep the label, packaging and storage notes as the first point of reference.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / LABEL</small><h3>Check directions</h3><p>Read the product-specific directions before first use instead of relying on a routine from another product.</p></article>
    <article className={styles.card} data-reveal><small>02 / ROUTINE</small><h3>Keep it simple</h3><p>Introduce one clear step at a time so the routine stays easy to understand and repeat.</p></article>
    <article className={styles.card} data-reveal><small>03 / STORAGE</small><h3>Protect the product</h3><p>Close packaging properly and follow the final storage guidance, avoiding unnecessary heat, moisture and direct sunlight.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>CONSISTENCY</span><div><h2>SMALL STEPS. REPEATED WELL.</h2><p>The strongest routine is the one that stays easy enough to repeat. Keep products organized, stored correctly and used as directed.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / ORGANIZE</small><h3>One place</h3><p>Keep the products used in the same routine together so the sequence feels natural and easy to remember.</p></article>
    <article className={styles.card} data-reveal><small>02 / FOLLOW</small><h3>Use as directed</h3><p>Product packaging remains the reference for quantity, frequency, preparation and any product-specific cautions.</p></article>
    <article className={styles.card} data-reveal><small>03 / REVIEW</small><h3>Ask when unsure</h3><p>If the packaging does not answer a product question, use the Contact page and mention the exact product name.</p></article>
   </div>
  </section>
 </PremiumPageShell>;
}