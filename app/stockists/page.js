import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Stockists | Baba Hakeem'};

export default function StockistsPage(){
 return <PremiumPageShell eyebrow="10 / STOCKISTS" title="FIND BABA HAKEEM NEAR YOU." intro="A future-ready retail directory for approved stores, pharmacies and stockists carrying the Baba Hakeem range.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>RETAIL NETWORK</span><div><h2>ONLY APPROVED SELLERS.</h2><p>This page is ready to list official stockists by city once the business confirms the retail network and store details.</p></div></div>
   <div className={styles.grid3}>
    <article className={styles.card} data-reveal><small>01 / FAISALABAD</small><h3>Retail partners</h3><p>Approved stores, address, phone number and opening information can be added here.</p></article>
    <article className={styles.card} data-reveal><small>02 / LAHORE</small><h3>Retail partners</h3><p>Reserved for verified Lahore stockists and official points of sale.</p></article>
    <article className={styles.card} data-reveal><small>03 / ONLINE</small><h3>Official channels</h3><p>Official ecommerce and social purchasing channels can be listed separately for easy verification.</p></article>
   </div>
  </section>
 </PremiumPageShell>;
}