import Link from 'next/link';
import styles from './PremiumPage.module.css';
import PremiumPageMotion from './PremiumPageMotion';

export default function PremiumPageShell({eyebrow,title,intro,children}){
  return <main className={styles.page} data-premium-page>
    <PremiumPageMotion/>

    <header className={styles.nav} data-premium-nav>
      <Link className={styles.logo} href="/">Baba Hakeem</Link>
      <nav>
        <Link href="/about">About</Link>
        <Link href="/care-guide">Care Guide</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <Link className={styles.home} href="/">Home <span>↗</span></Link>
    </header>

    <section className={styles.hero} data-premium-hero>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <h1>{title}</h1>
      <p>{intro}</p>
      <div className={styles.scrollCue}>SCROLL TO EXPLORE <span>↓</span></div>
    </section>

    <div className={styles.content}>{children}</div>
  </main>;
}

export {styles};
