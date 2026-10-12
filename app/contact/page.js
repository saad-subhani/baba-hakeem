import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Contact | Baba Hakeem'};

export default function ContactPage(){
 return <PremiumPageShell eyebrow="03 / CONTACT" title="LET’S TALK." intro="Product questions, order support, retail enquiries or collaboration — choose the route that fits best.">
  <section className={styles.section} data-reveal>
   <div className={styles.contactGrid}>
    <div className={styles.contactPanel} data-reveal><small className={styles.kicker}>BABA HAKEEM SUPPORT</small><h2>ONE CLEAR PLACE TO REACH US.</h2><p>This page is ready for the brand’s official WhatsApp, email, Instagram and business-location details. The visual system is already built; contact channels can be connected without changing the design.</p></div>
    <div className={styles.grid2}>
     <article className={styles.card} data-reveal><small>01 / PRODUCT HELP</small><h3>Product guidance</h3><p>Questions about a product, its place in a routine, packaging or usage information.</p></article>
     <article className={styles.card} data-reveal><small>02 / ORDER SUPPORT</small><h3>Order assistance</h3><p>Delivery updates, damaged parcels, order corrections and purchase-related support.</p></article>
     <article className={styles.card} data-reveal><small>03 / RETAIL</small><h3>Stockist enquiries</h3><p>For retail partners, stores and businesses interested in carrying Baba Hakeem products.</p></article>
     <article className={styles.card} data-reveal><small>04 / COLLABORATION</small><h3>Creative & brand</h3><p>Campaigns, content collaborations, packaging, design and partnership conversations.</p></article>
    </div>
   </div>
  </section>
 </PremiumPageShell>;
}