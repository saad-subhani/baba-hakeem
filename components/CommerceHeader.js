'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useCart from './useCart';
import BrandLogo from './BrandLogo';
import useStoreContactSettings, { buildWhatsAppUrl } from './useStoreContactSettings';
import CommerceSideCart from './CommerceSideCart';
import { CartIcon, ChevronDownIcon, CloseIcon, MenuIcon, WhatsAppIcon } from './Icons';

function MobileNavIcon({ name }) {
  const paths = {
    home: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'],
    about: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
    products: ['M5 4h14v16H5z', 'M8 8h8', 'M8 12h8', 'M8 16h5'],
    blog: ['M6 3h9l4 4v14H6z', 'M15 3v5h5', 'M9 12h7', 'M9 16h7'],
    contact: ['M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h.5a8.5 8.5 0 0 1 8 8z'],
  };

  return <svg className="bh-mobile-nav-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {(paths[name] || []).map((d) => <path key={d} d={d} />)}
  </svg>;
}

export default function CommerceHeader({ onCartClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [items, setItems] = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname() || '/';
  const contact = useStoreContactSettings();
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const openCart = () => {
    if (onCartClick) {
      onCartClick();
      return;
    }
    try {
      const saved = JSON.parse(window.localStorage.getItem('baba-hakeem-cart') || '[]');
      if (Array.isArray(saved)) setItems(saved.filter((item) => item && item.id && item.name && Number(item.quantity) > 0));
    } catch {}
    setCartOpen(true);
  };
  const closeMenu = () => {
    setMenuOpen(false);
    setProductsOpen(false);
  };
  const navClass = (active) => `bh-nav-link${active ? ' active' : ''}`;
  const isHome = pathname === '/';
  const isAbout = pathname === '/about';
  const isProducts = pathname === '/shop' || pathname.startsWith('/products/');
  const isBlog = pathname === '/blog' || pathname.startsWith('/blog/');
  const isContact = pathname === '/contact';

  const announcements = [
    'Free Delivery all over Pakistan on orders above Rs. 2,500',
    'Online Payment Options Available',
    '100% Pure Botanical Formulations',
    'This is our only official store. We are not affiliated with any other site or seller.',
    ...(contact.whatsapp_number ? [`WhatsApp: ${contact.whatsapp_number}`] : []),
  ];

  return <>
    <div className="bh-announcement-bar" aria-label="Store announcements">
      <div className="bh-announcement-track" aria-hidden="true">
        {[0, 1].map((copy) => <div key={copy} style={{ display: 'inline-flex' }}>
          {announcements.map((text, index) => <span key={`${copy}-${index}`} className="bh-announcement-item">{text}</span>)}
        </div>)}
      </div>
    </div>
    <header className="bh-header">
    <div className="bh-container bh-navbar-container">
      <Link href="/" className="bh-brand-logo" aria-label="Baba Hakeem home">
        <BrandLogo />
      </Link>
      {menuOpen && <button className="bh-nav-backdrop" type="button" aria-label="Close navigation menu" onClick={closeMenu} />}
      <nav className={`bh-nav-menu ${menuOpen ? 'mobile-open' : ''}`}>
        <div className="bh-mobile-nav-heading">
          <span>Baba Hakeem</span>
          <button type="button" aria-label="Close navigation menu" onClick={closeMenu}><CloseIcon size={20} /></button>
        </div>
        <Link href="/" className={navClass(isHome)} aria-current={isHome ? 'page' : undefined} onClick={closeMenu}><MobileNavIcon name="home" /><span>Home</span></Link>
        <Link href="/about" className={navClass(isAbout)} aria-current={isAbout ? 'page' : undefined} onClick={closeMenu}><MobileNavIcon name="about" /><span>About</span></Link>
        <div className={`bh-nav-products${isProducts ? ' is-active' : ''}${productsOpen ? ' products-open' : ''}`}>
          <Link href="/shop" className={navClass(isProducts)} aria-current={isProducts ? 'page' : undefined} onClick={closeMenu}><MobileNavIcon name="products" /><span>Products</span><ChevronDownIcon size={14} className="bh-nav-products-chevron bh-nav-products-desktop-chevron" /></Link>
          <button className="bh-nav-products-toggle" type="button" aria-label="Toggle product categories" aria-expanded={productsOpen} onClick={() => setProductsOpen((open) => !open)}>
            <ChevronDownIcon size={16} className="bh-nav-products-chevron" />
          </button>
          <div className="bh-nav-dropdown">
            <Link href="/shop" onClick={closeMenu}>All Products</Link>
            <Link href="/shop?category=Hair+Care" onClick={closeMenu}>Hair Care</Link>
            <Link href="/shop?category=Joint+Care" onClick={closeMenu}>Joint Care</Link>
            <Link href="/shop?category=Digestion" onClick={closeMenu}>Digestion</Link>
            <Link href="/shop?category=Men%27s+Wellness" onClick={closeMenu}>Men&apos;s Wellness</Link>
            <Link href="/shop?category=Wedding+Course" onClick={closeMenu}>Wedding Course</Link>
          </div>
        </div>
        <Link href="/blog" className={navClass(isBlog)} aria-current={isBlog ? 'page' : undefined} onClick={closeMenu}><MobileNavIcon name="blog" /><span>Blog</span></Link>
        <Link href="/contact" className={navClass(isContact)} aria-current={isContact ? 'page' : undefined} onClick={closeMenu}><MobileNavIcon name="contact" /><span>Contact</span></Link>
      </nav>
      <div className="bh-nav-actions">
        {contact.whatsapp_number && <a className="bh-icon-btn" href={buildWhatsAppUrl(contact.whatsapp_number)} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp"><WhatsAppIcon size={18} color="#25D366" /></a>}
        <button className="bh-icon-btn" type="button" onClick={openCart} aria-label={`Open cart, ${count} items`} title="Open Cart"><CartIcon size={20} />{count > 0 && <span className="bh-cart-count">{count}</span>}</button>
        <button className="bh-mobile-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
          {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>
    </div>
    </header>
    {!onCartClick && <CommerceSideCart open={cartOpen} onClose={() => setCartOpen(false)} items={items} setItems={setItems} />}
  </>;
}
