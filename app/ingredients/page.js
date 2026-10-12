import PremiumPageShell from '../../components/PremiumPageShell';
import styles from '../../components/PremiumPage.module.css';

export const metadata={title:'Ingredients | Baba Hakeem'};

export default function IngredientsPage(){
 return <PremiumPageShell eyebrow="04 / INGREDIENTS" title="WHAT GOES INTO THE RITUAL." intro="A focused ingredient story built around familiar herbal references and clear product communication.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>KEY BOTANICALS</span><div><h2>FAMILIAR PLANTS. PURPOSEFUL PRESENCE.</h2><p>The website highlights key botanicals used across the visual identity. Final formulas and exact ingredient lists should always follow the product label and approved packaging.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / ALOE VERA</small><h3>Aloe Vera</h3><p>A familiar botanical associated with soothing, cooling and hydration-focused care.</p></article>
    <article className={styles.card} data-reveal><small>02 / NEEM</small><h3>Neem</h3><p>A traditional herbal ingredient frequently used in cleansing and balancing care rituals.</p></article>
    <article className={styles.card} data-reveal><small>03 / TURMERIC</small><h3>Turmeric</h3><p>A widely recognized botanical used across traditional beauty and wellness routines.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>TRANSPARENCY</span><div><h2>THE LABEL IS THE FINAL SOURCE.</h2><p>Because formulas can vary by product, pack size and future revisions, the ingredient panel on the final product packaging remains the authoritative source for exact composition.</p></div></div>
   <div className={styles.line} data-line/>
  </section>
 </PremiumPageShell>;
}