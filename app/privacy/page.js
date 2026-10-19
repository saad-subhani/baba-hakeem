import PremiumPageShell from '../../components/PremiumPageShell';
import styles from '../../components/PremiumPage.module.css';

export const metadata={robots:{index:false,follow:false},title:'Privacy | Baba Hakeem'};

export default function PrivacyPage(){
 return <PremiumPageShell eyebrow="06 / PRIVACY" title="CLEAR, RESPECTFUL, MINIMAL." intro="A simple privacy framework for the website, ready to be finalized around the exact analytics, forms and commerce tools the business chooses to use.">
  <section className={styles.section} data-reveal>
   <div className={styles.grid2}>
    <article className={styles.card} data-reveal><small>01 / INFORMATION</small><h3>What may be collected</h3><p>The enquiry form accepts a name, email or phone, enquiry type, message and optional order reference. Checkout collects delivery and order details. Information is stored to handle requests and protect the site.</p></article>
    <article className={styles.card} data-reveal><small>02 / PURPOSE</small><h3>Why it is used</h3><p>To provide requested services, support orders, respond to enquiries, improve the website and maintain security.</p></article>
    <article className={styles.card} data-reveal><small>03 / THIRD PARTIES</small><h3>Service providers</h3><p>Hosting, payment, delivery or analytics providers may process limited information when those services are connected.</p></article>
    <article className={styles.card} data-reveal><small>04 / CONTROL</small><h3>Your choices</h3><p>Visitors should be able to ask questions about their information and use available browser or platform controls for cookies and tracking.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>MORE DETAIL</span><div><h2>MAKE EACH DATA FLOW EASY TO EXPLAIN.</h2><p>Before the policy is finalized, each connected service should have a clear purpose, a reason for the data it handles and a straightforward explanation for visitors.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / COOKIES</small><h3>Browser storage</h3><p>If cookies or similar technologies are used, the final policy should explain their purpose and any controls available to visitors.</p></article>
    <article className={styles.card} data-reveal><small>02 / RETENTION</small><h3>How long data stays</h3><p>The finished policy should describe retention periods or the criteria used to decide how long different information is kept.</p></article>
    <article className={styles.card} data-reveal><small>03 / SECURITY</small><h3>Reasonable safeguards</h3><p>The site should use appropriate operational and technical measures for the services actually connected to it.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>FINAL POLICY</span><div><h2>READY FOR LEGAL DETAILS.</h2><p>Before public launch, this page should be updated with the business’s official contact identity, retention terms, cookie tools and any ecommerce processors actually in use.</p></div></div>
  </section>
 </PremiumPageShell>;
}