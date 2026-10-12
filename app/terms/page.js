import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Terms | Baba Hakeem'};

export default function TermsPage(){
 return <PremiumPageShell eyebrow="13 / TERMS" title="CLEAR TERMS. CLEANER EXPERIENCE." intro="A simple framework for website use, product information, orders and brand content, ready for the business’s final legal review.">
  <section className={styles.section} data-reveal>
   <div className={styles.grid2}>
    <article className={styles.card} data-reveal><small>01 / WEBSITE USE</small><h3>Use of content</h3><p>Brand text, imagery, graphics and other website materials are intended for browsing and purchasing through approved Baba Hakeem channels.</p></article>
    <article className={styles.card} data-reveal><small>02 / PRODUCT INFO</small><h3>Packaging comes first</h3><p>Final labels, approved packaging and official product directions remain the authoritative source for exact usage and product information.</p></article>
    <article className={styles.card} data-reveal><small>03 / ORDERS</small><h3>Commercial terms</h3><p>Pricing, availability, delivery and return terms should follow the official policies in force at the time of purchase.</p></article>
    <article className={styles.card} data-reveal><small>04 / OWNERSHIP</small><h3>Brand assets</h3><p>Baba Hakeem names, artwork and original brand materials should not be copied or reused without permission.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>LEGAL REVIEW</span><div><h2>READY FOR FINAL BUSINESS TERMS.</h2><p>Before public launch, replace this framework with the business’s approved legal wording, jurisdiction details, official contact identity and final ecommerce terms.</p></div></div>
  </section>
 </PremiumPageShell>;
}