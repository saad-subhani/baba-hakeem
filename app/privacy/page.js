import PremiumPageShell from '../../components/PremiumPageShell';
import styles from '../../components/PremiumPage.module.css';

export const metadata={title:'Privacy | Baba Hakeem'};

export default function PrivacyPage(){
 return <PremiumPageShell eyebrow="06 / PRIVACY" title="CLEAR, RESPECTFUL, MINIMAL." intro="A simple privacy framework for the website, ready to be finalized around the exact analytics, forms and commerce tools the business chooses to use.">
  <section className={styles.section} data-reveal>
   <div className={styles.grid2}>
    <article className={styles.card} data-reveal><small>01 / INFORMATION</small><h3>What may be collected</h3><p>Information a visitor chooses to provide through contact, order or account features, plus basic technical data needed to operate and protect the site.</p></article>
    <article className={styles.card} data-reveal><small>02 / PURPOSE</small><h3>Why it is used</h3><p>To provide requested services, support orders, respond to enquiries, improve the website and maintain security.</p></article>
    <article className={styles.card} data-reveal><small>03 / THIRD PARTIES</small><h3>Service providers</h3><p>Hosting, payment, delivery or analytics providers may process limited information when those services are connected.</p></article>
    <article className={styles.card} data-reveal><small>04 / CONTROL</small><h3>Your choices</h3><p>Visitors should be able to ask questions about their information and use available browser or platform controls for cookies and tracking.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>FINAL POLICY</span><div><h2>READY FOR LEGAL DETAILS.</h2><p>Before public launch, this page should be updated with the business’s official contact identity, retention terms, cookie tools and any ecommerce processors actually in use.</p></div></div>
  </section>
 </PremiumPageShell>;
}