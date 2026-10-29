import Link from 'next/link';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';
import './about.css';

export const metadata = { title: 'About Baba Hakeem | Herbal Products', description: 'Learn about Baba Hakeem and our approach to traditional herbal care, carefully prepared in Pakistan.' };

export default function AboutPage() {
  return <main className="bh-commerce-page"><CommerceHeader />
    <section className="bh-commerce-hero"><div className="bh-commerce-wrap"><nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>About</span></nav><p className="bh-commerce-eyebrow">OUR STORY</p><h1>About Baba Hakeem</h1><p>Traditional herbal care, thoughtfully brought into everyday life.</p></div></section>
    <section className="bh-about-content">
      <div className="bh-about-copy"><p className="bh-commerce-eyebrow">ROOTED IN HERBAL WISDOM</p><h2>Care inspired by nature and tradition</h2><p>Baba Hakeem is a Pakistan-based herbal care brand shaped by traditional knowledge and a respect for botanical ingredients. We bring together familiar herbs, oils, and time-honoured routines in products made for everyday personal care.</p><p>Our collection includes hair and scalp care, massage oils, digestive blends, and wellness courses. Each product comes with directions and ingredient information to help you understand how it fits into your routine.</p><Link href="/shop" className="bh-about-button">Explore our products</Link></div>
      <div className="bh-about-image"><img src="/verdura-reference.webp.png" alt="Botanical ingredients that inspire Baba Hakeem products" /></div>
    </section>
    <section className="bh-about-values"><p className="bh-commerce-eyebrow">OUR APPROACH</p><h2>Herbal care with clarity</h2><div><article><span>01</span><h3>Thoughtful ingredients</h3><p>We highlight the ingredients and directions for each product so you can make an informed choice.</p></article><article><span>02</span><h3>Made for daily rituals</h3><p>We create familiar, practical formats that can fit naturally into a personal care routine.</p></article><article><span>03</span><h3>Here to help</h3><p>Our team can help with product questions, orders, and delivery support across Pakistan.</p></article></div></section>
    <CommerceFooter />
  </main>;
}
