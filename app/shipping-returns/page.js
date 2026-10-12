import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Shipping & Returns | Baba Hakeem'};

export default function ShippingReturnsPage(){
 return <PremiumPageShell eyebrow="05 / ORDERS" title="DELIVERY, WITHOUT THE CONFUSION." intro="A simple place for shipping, damaged parcel and return guidance. Exact commercial terms can be finalized here once the brand confirms them.">
  <section className={styles.section} data-reveal>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / DISPATCH</small><h3>Order processing</h3><p>Orders should be checked, packed securely and prepared for dispatch with tracking details shared where available.</p></article>
    <article className={styles.card} data-reveal><small>02 / DELIVERY</small><h3>In transit</h3><p>Delivery timing depends on destination and courier service. Customers should keep their order reference until the parcel arrives.</p></article>
    <article className={styles.card} data-reveal><small>03 / DAMAGE</small><h3>Parcel issues</h3><p>If an order arrives damaged, keep the parcel and product packaging and take clear photos before contacting support.</p></article>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>RETURNS</span><div><h2>KEEP THE PROCESS CLEAR.</h2><p>Final return windows, eligibility, courier responsibility and refund rules should be inserted once the business approves its official policy. This page structure is already ready for those exact terms.</p></div></div>
   <div className={styles.line} data-line/>
  </section>
 </PremiumPageShell>;
}