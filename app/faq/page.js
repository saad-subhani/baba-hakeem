import PremiumPageShell from '../../components/PremiumPageShell';
import styles from '../../components/PremiumPage.module.css';

export const metadata={title:'FAQ | Baba Hakeem'};

const faqs=[
 ['What kind of products does Baba Hakeem offer?','The collection includes herbal oils, traditional powdered blends and premium saffron, presented as a focused everyday-care range.'],
 ['How should I choose the right product?','Start with the product category and intended routine shown on each product page. If you are unsure, use the Contact page and share what you are looking for.'],
 ['Where should I read the final usage directions?','Use the final product label and approved packaging as the main reference for exact directions, preparation, storage and any product-specific cautions.'],
 ['How should the products be stored?','Keep products tightly closed, away from unnecessary direct sunlight, excessive heat and moisture. Follow any storage instructions printed on the final packaging.'],
 ['Can I use more than one product in the same routine?','Different products can belong to different routines. Always follow the directions on the individual product and avoid combining products in ways not described on the packaging.'],
 ['Where can I learn about ingredients?','Visit the Ingredients page for the brand’s ingredient philosophy and the key botanicals highlighted across the collection.'],
 ['How do I ask about product availability?','Use the Contact page and include the exact product name. Availability can change, so a product-specific enquiry is the clearest route.'],
 ['What information should I include for order support?','Share your order reference, the product involved and a short description of the issue. For parcel damage, keep the packaging and include clear photos.'],
 ['What if I receive a damaged order?','Keep the packaging and contact the brand with your order details and clear photos. The Shipping & Returns page explains the basic process.'],
 ['Where can I find shipping and return information?','Use the Shipping & Returns page for the current framework around dispatch, delivery, parcel issues and return eligibility.'],
 ['Can retailers or stockists contact Baba Hakeem?','Yes. Use the business-enquiry route on the Contact page and include your store or business details plus the nature of your enquiry.'],
 ['Where should collaboration or partnership requests go?','Use the business and partnerships route on the Contact page with a short proposal, relevant links and preferred contact details.']
];

export default function FaqPage(){
 return <PremiumPageShell eyebrow="02 / SUPPORT" title="QUESTIONS, ANSWERED." intro="Clear information without clutter. The essentials about products, routines, availability, orders and support in one place.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>COMMON QUESTIONS</span><div><h2>START HERE.</h2><p>Tap any question to open it. The page is designed to stay quick, readable and easy to scan on both desktop and mobile.</p></div></div>
   <div>{faqs.map(([q,a])=><details className={styles.faqItem} key={q} data-reveal><summary>{q}</summary><p>{a}</p></details>)}</div>
  </section>
 </PremiumPageShell>;
}