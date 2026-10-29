import Link from 'next/link';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';
import ShopCatalog from '../../components/ShopCatalog';

export const metadata = { title: 'Shop Herbal Products | Baba Hakeem', description: 'Explore Baba Hakeem herbal hair care, joint care, digestion, men’s wellness, and wedding course products.' };

export default function ShopPage() {
  return <main className="bh-commerce-page"><CommerceHeader />
    <section className="bh-commerce-hero"><div className="bh-commerce-wrap"><nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Products</span></nav><p className="bh-commerce-eyebrow">THE BABA HAKEEM COLLECTION</p><h1>Shop All Products</h1><p>Explore herbal care for hair, joints, digestion, and everyday wellness.</p></div></section>
    <ShopCatalog />
    <CommerceFooter />
  </main>;
}
