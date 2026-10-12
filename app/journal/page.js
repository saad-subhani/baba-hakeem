import PremiumPageShell,{styles} from '../../components/PremiumPageShell';

export const metadata={title:'Journal | Baba Hakeem'};

const posts=[
 ['01 / RITUAL','Why simple routines often work better','A considered routine does not need to be complicated. Start with fewer steps, clearer purpose and better consistency.'],
 ['02 / INGREDIENTS','Reading a herbal product label with confidence','Know where to look for directions, ingredients, storage advice and the information that matters most.'],
 ['03 / CARE','Building a calmer hair-care routine','Create a repeatable rhythm around oiling, washing and everyday handling instead of constantly changing products.'],
 ['04 / BRAND','Why Baba Hakeem is moving toward a cleaner visual identity','The new visual system keeps traditional herbal care at the center while removing unnecessary design noise.'],
 ['05 / STORAGE','How to store oils and herbal products well','Light, heat, moisture and loose caps can affect product quality. Better storage starts with a few simple habits.'],
 ['06 / PROCESS','From familiar herbs to modern presentation','A look at how traditional references can be communicated through a more premium, useful digital experience.']
];

export default function JournalPage(){
 return <PremiumPageShell eyebrow="08 / JOURNAL" title="NOTES ON HERBS, RITUALS & CARE." intro="Short, useful reading around everyday herbal care, ingredients, routines and the evolving Baba Hakeem brand.">
  <section className={styles.section} data-reveal>
   <div className={styles.sectionHead}><span className={styles.kicker}>LATEST NOTES</span><div><h2>USEFUL READING. NO FILLER.</h2><p>A growing editorial space designed for educational content, product guidance and brand storytelling.</p></div></div>
   <div className={styles.grid3}>{posts.map(([tag,title,copy])=><article className={styles.card} data-reveal key={title}><small>{tag}</small><h3>{title}</h3><p>{copy}</p></article>)}</div>
  </section>
 </PremiumPageShell>;
}