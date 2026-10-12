import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Testimonials | Baba Hakeem'};

const notes=[
 ['01 / PRODUCT EXPERIENCE','“The presentation feels much more premium and the product range is easier to understand at a glance.”'],
 ['02 / BRAND EXPERIENCE','“The simpler black-and-gray identity makes the brand feel more focused and memorable.”'],
 ['03 / DIGITAL EXPERIENCE','“The website feels less like a catalogue and more like a proper brand experience.”'],
 ['04 / ROUTINE','“Clearer product categories make it easier to know where each item fits into a routine.”'],
 ['05 / PACKAGING','“The cleaner packaging direction makes the products feel more giftable and considered.”'],
 ['06 / TRUST','“I like that the design is premium without trying to overwhelm the product itself.”']
];

export default function TestimonialsPage(){
 return <PremiumPageShell eyebrow="09 / TESTIMONIALS" title="WHAT PEOPLE NOTICE FIRST." intro="A dedicated space for verified customer feedback, retail impressions and product experiences as the brand grows.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>VOICE OF THE CUSTOMER</span><div><h2>REAL EXPERIENCES BELONG HERE.</h2><p>The current cards are presentation placeholders. They are ready to be replaced with approved, verified reviews without redesigning the page.</p></div></div>
   <div className={styles.grid3}>{notes.map(([tag,quote])=><article className={styles.card} data-reveal key={tag}><small>{tag}</small><h3>{quote}</h3><p>Verified name, product and purchase context can be added when customer review data is ready.</p></article>)}</div>
  </section>
 </PremiumPageShell>;
}