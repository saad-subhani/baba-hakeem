import PremiumPageShell from '../../components/PremiumPageShell';
import styles from '../../components/PremiumPage.module.css';

export const metadata={title:'FAQ | Baba Hakeem'};

const faqs=[
 ['What kind of products does Baba Hakeem offer?','The collection includes herbal oils, traditional powdered blends and premium saffron, presented as a focused everyday-care range.'],
 ['How should I choose the right product?','Start with the product category and intended routine shown on each product page. If you are unsure, use the Contact page and share what you are looking for.'],
 ['How should the products be stored?','Keep products tightly closed, away from direct sunlight, excessive heat and moisture. Follow any storage instructions printed on the final packaging.'],
 ['Can I use more than one product in the same routine?','Different products can belong to different routines. Always follow the directions on the individual product and avoid combining products in ways not described on the packaging.'],
 ['Where can I learn about ingredients?','Visit the Ingredients page for the brand’s ingredient philosophy and the key botanicals highlighted across the collection.'],
 ['What if I receive a damaged order?','Keep the packaging and contact the brand with your order details and clear photos. The Shipping & Returns page explains the basic process.']
];

export default function FaqPage(){
 return <PremiumPageShell eyebrow="02 / SUPPORT" title="QUESTIONS, ANSWERED." intro="Clear information without clutter. The essentials about products, routines, orders and care in one place.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>COMMON QUESTIONS</span><div><h2>START HERE.</h2><p>Tap any question to open it. The page is designed to stay quick, readable and easy to scan on both desktop and mobile.</p></div></div>
   <div>{faqs.map(([q,a])=><details className={styles.faqItem} key={q} data-reveal><summary>{q}</summary><p>{a}</p></details>)}</div>
  </section>
 </PremiumPageShell>;
}