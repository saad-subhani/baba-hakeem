import PremiumPageShell from '../../components/PremiumPageShell';
import styles from '../../components/PremiumPage.module.css';

export const metadata={title:'Contact | Baba Hakeem'};

export default function ContactPage(){
 return <PremiumPageShell eyebrow="03 / CONTACT" title="LET’S TALK." intro="Product questions, order support, retail enquiries or collaboration — choose the route that fits best and include enough context for a useful reply.">
  <section className={styles.section} data-reveal>
   <div className={styles.contactGrid}>
    <div className={styles.contactPanel} data-reveal><small className={styles.kicker}>BABA HAKEEM SUPPORT</small><h2>ONE CLEAR PLACE TO REACH US.</h2><p>This page is ready for the brand’s official WhatsApp, email, Instagram and business-location details. The visual system is already built; contact channels can be connected without changing the design.</p></div>
    <div className={styles.grid2}>
     <article className={styles.card} data-reveal><small>01 / PRODUCT HELP</small><h3>Product guidance</h3><p>Questions about a product, its place in a routine, packaging, directions or availability. Mention the exact product name so the enquiry is easier to route.</p></article>
     <article className={styles.card} data-reveal><small>02 / ORDER SUPPORT</small><h3>Order assistance</h3><p>Delivery updates, damaged parcels, order corrections and purchase-related support. Include the order reference and a short description of the issue.</p></article>
     <article className={styles.card} data-reveal><small>03 / RETAIL</small><h3>Stockist enquiries</h3><p>For retail partners, stores and businesses interested in carrying Baba Hakeem products. Include your store name, location and the categories you are interested in.</p></article>
     <article className={styles.card} data-reveal><small>04 / COLLABORATION</small><h3>Creative & brand</h3><p>Campaigns, content collaborations, packaging, design and partnership conversations. Include a short proposal plus any relevant links.</p></article>
    </div>
   </div>
  </section>
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>HELP US HELP FASTER</span><div><h2>ADD THE DETAILS THAT MATTER.</h2><p>A clear first message reduces back-and-forth. The exact information depends on the kind of enquiry.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / PRODUCT</small><h3>Name the product</h3><p>Include the exact product name and the specific information you need, such as availability, packaging or routine guidance.</p></article>
    <article className={styles.card} data-reveal><small>02 / ORDER</small><h3>Keep the reference</h3><p>For delivery or parcel issues, include the order reference and keep the packaging. Photos are useful when reporting visible damage.</p></article>
    <article className={styles.card} data-reveal><small>03 / BUSINESS</small><h3>Introduce the enquiry</h3><p>Share your business or project name, the type of partnership you have in mind and the best way to continue the conversation.</p></article>
   </div>
  </section>
 </PremiumPageShell>;
}