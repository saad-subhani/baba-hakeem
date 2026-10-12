import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Wholesale | Baba Hakeem'};

export default function WholesalePage(){
 return <PremiumPageShell eyebrow="12 / WHOLESALE" title="BUILT FOR BETTER RETAIL PARTNERSHIPS." intro="A dedicated trade page for stores, pharmacies and distributors interested in carrying Baba Hakeem products.">
  <section className={styles.section} data-reveal>
   <div className={styles.contactGrid}>
    <div className={styles.contactPanel} data-reveal><small className={styles.kicker}>TRADE ENQUIRIES</small><h2>LET’S GROW THE RANGE RESPONSIBLY.</h2><p>This page is ready for official wholesale contact details, minimum order quantities, territory notes and partner onboarding once the business approves them.</p></div>
    <div className={styles.grid2}>
     <article className={styles.card} data-reveal><small>01 / RETAIL</small><h3>Stores & pharmacies</h3><p>For approved physical retailers interested in stocking selected Baba Hakeem products.</p></article>
     <article className={styles.card} data-reveal><small>02 / DISTRIBUTION</small><h3>Regional partners</h3><p>For distribution conversations, territory coverage and larger-volume requirements.</p></article>
     <article className={styles.card} data-reveal><small>03 / DISPLAY</small><h3>Brand presentation</h3><p>Retail partners can receive consistent product imagery, display guidance and approved brand assets.</p></article>
     <article className={styles.card} data-reveal><small>04 / SUPPORT</small><h3>Partner assistance</h3><p>Product information, order support and retail communication can be centralized through one channel.</p></article>
    </div>
   </div>
  </section>
 </PremiumPageShell>;
}