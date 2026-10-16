import PremiumPageShell from '../../components/PremiumPageShell';
import styles from '../../components/PremiumPage.module.css';

export const metadata={title:'Shipping & Returns | Baba Hakeem'};

export default function ShippingReturnsPage(){
 return <PremiumPageShell eyebrow="05 / ORDERS" title="DELIVERY, WITHOUT THE CONFUSION." intro="A simple place for shipping, damaged parcel and return guidance. Exact commercial terms can be finalized here once the brand confirms them.">
  <section className={styles.section} data-reveal>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / CONFIRMATION</small><h3>Order details</h3><p>Keep the order reference and check the submitted delivery information so support has a clear starting point if anything needs attention.</p></article>
    <article className={styles.card} data-reveal><small>02 / DISPATCH</small><h3>Order processing</h3><p>Orders should be checked, packed securely and prepared for dispatch with tracking details shared where available.</p></article>
    <article className={styles.card} data-reveal><small>03 / DELIVERY</small><h3>In transit</h3><p>Delivery timing depends on destination and courier service. Customers should keep their order reference until the parcel arrives.</p></article>
    <article className={styles.card} data-reveal><small>04 / PACKAGING</small><h3>Protected in transit</h3><p>Bottles, jars and premium items should be packed securely enough for normal courier handling and kept together with any order documentation.</p></article>
    <article className={styles.card} data-reveal><small>05 / DAMAGE</small><h3>Parcel issues</h3><p>If an order arrives damaged, keep the parcel and product packaging and take clear photos before contacting support.</p></article>
    <article className={styles.card} data-reveal><small>06 / SUPPORT</small><h3>What to send</h3><p>Include the order reference, affected product and a short explanation. Photos help when the issue is visible on the parcel or product packaging.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>RETURNS</span><div><h2>KEEP THE PROCESS CLEAR.</h2><p>Final return windows, eligibility, courier responsibility and refund rules should be inserted once the business approves its official policy. This page structure is already ready for those exact terms.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / ELIGIBILITY</small><h3>Check the condition</h3><p>Return eligibility should be based on the final published policy, including any requirements around opening, use, damage or packaging condition.</p></article>
    <article className={styles.card} data-reveal><small>02 / REQUEST</small><h3>Contact support first</h3><p>Start the return conversation through the approved support route and include the order reference plus the reason for the request.</p></article>
    <article className={styles.card} data-reveal><small>03 / RESOLUTION</small><h3>Follow the approved terms</h3><p>Any replacement, return or refund should follow the official policy in force for the order rather than assumptions made from another purchase.</p></article>
   </div>
  </section>
 </PremiumPageShell>;
}