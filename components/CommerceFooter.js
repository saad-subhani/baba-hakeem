'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandLogo from './BrandLogo';
import useStoreContactSettings, { buildWhatsAppUrl } from './useStoreContactSettings';
import {
  ChevronDownIcon,
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  TruckIcon,
  WhatsAppIcon,
} from './Icons';

function FooterPinIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>;
}

function FooterAccordion({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const syncViewport = () => {
      setIsMobile(media.matches);
      if (!media.matches) setIsOpen(false);
    };
    syncViewport();
    media.addEventListener('change', syncViewport);
    return () => media.removeEventListener('change', syncViewport);
  }, []);

  return (
    <div className={`bh-footer-accordion${isMobile ? ' is-mobile' : ''}${isOpen ? ' is-open' : ''}`}>
      <button className="bh-footer-accordion-toggle" type="button" aria-expanded={!isMobile || isOpen} onClick={() => { if (isMobile) setIsOpen((open) => !open); }}>
        <span>{title}</span>
        <ChevronDownIcon className="bh-footer-accordion-chevron" size={16} />
      </button>
      <div className={`bh-footer-accordion-panel${isMobile && !isOpen ? ' is-collapsed' : ''}`}>{children}</div>
    </div>
  );
}

function FooterContactItem({ href, icon, label, children, external = false }) {
  const content = <>
    <span className="bh-footer-contact-icon">{icon}</span>
    <span className="bh-footer-contact-copy"><small>{label}</small><strong>{children}</strong></span>
  </>;

  return href ? (
    <a className="bh-footer-contact-item" href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
      {content}
    </a>
  ) : (
    <div className="bh-footer-contact-item">{content}</div>
  );
}

export default function CommerceFooter() {
  const contact = useStoreContactSettings();
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp_number);

  return (
    <footer className="bh-footer">
      <div className="bh-container">
        <div className="bh-footer-grid">
          <div className="bh-footer-col bh-footer-brand-col">
            <Link href="/" className="bh-brand-logo bh-footer-brand-logo" aria-label="Baba Hakeem home">
              <BrandLogo />
            </Link>
            <p className="bh-footer-copy">
              Authentic, organic, and unadulterated herbal remedies handcrafted in Pakistan.
              Pure botanical nourishment passed down across generations.
            </p>
            {(whatsappUrl || contact.facebook_url || contact.instagram_url || contact.tiktok_url || contact.youtube_url) && (
              <div className="bh-footer-socials">
                {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp"><WhatsAppIcon size={18} /></a>}
                {contact.facebook_url && <a href={contact.facebook_url} target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon size={18} /></a>}
                {contact.instagram_url && <a href={contact.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={18} /></a>}
                {contact.tiktok_url && <a href={contact.tiktok_url} target="_blank" rel="noreferrer" aria-label="TikTok"><span>Tt</span></a>}
                {contact.youtube_url && <a href={contact.youtube_url} target="_blank" rel="noreferrer" aria-label="YouTube"><span>▶</span></a>}
              </div>
            )}
          </div>

          <div className="bh-footer-col">
            <FooterAccordion title="Quick Links">
              <ul className="bh-footer-links">
                <li><Link href="/" className="bh-footer-link">Home</Link></li>
                <li><Link href="/about" className="bh-footer-link">About Baba Hakeem</Link></li>
                <li><Link href="/shop" className="bh-footer-link">All Products</Link></li>
                <li><Link href="/blog" className="bh-footer-link">Blog</Link></li>
                <li><Link href="/contact" className="bh-footer-link">Contact</Link></li>
              </ul>
            </FooterAccordion>
          </div>

          <div className="bh-footer-col">
            <FooterAccordion title="Customer Care">
              <ul className="bh-footer-links">
                <li><Link href="/shipping-and-delivery" className="bh-footer-link">Shipping and Delivery</Link></li>
                <li><Link href="/returns-and-refunds" className="bh-footer-link">Returns and Refunds</Link></li>
                <li><Link href="/privacy-policy" className="bh-footer-link">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="bh-footer-link">Terms and Conditions</Link></li>
              </ul>
            </FooterAccordion>
          </div>

          <div className="bh-footer-col bh-footer-contact-col">
            <FooterAccordion title="Contact & Support">
              <div className="bh-footer-contact-list">
                {contact.phone_number && <FooterContactItem href={`tel:${contact.phone_number.replace(/[^+\d]/g, '')}`} label="Call us" icon={<PhoneIcon size={17} />}>{contact.phone_number}</FooterContactItem>}
                {contact.whatsapp_number && <FooterContactItem href={whatsappUrl} label="WhatsApp" external icon={<WhatsAppIcon size={17} />}>{contact.whatsapp_number}</FooterContactItem>}
                {contact.email && <FooterContactItem href={`mailto:${contact.email}`} label="Email" icon={<MailIcon size={17} />}>{contact.email}</FooterContactItem>}
                {contact.address && <FooterContactItem label="Address" icon={<FooterPinIcon />}>{contact.address}</FooterContactItem>}
                <FooterContactItem label="Delivery" icon={<TruckIcon size={17} />}>Nationwide across Pakistan</FooterContactItem>
              </div>
              <form className="bh-footer-newsletter" onSubmit={(event) => { event.preventDefault(); alert('Thank you for joining the Baba Hakeem newsletter.'); }}>
                <input type="email" placeholder="Enter your email" aria-label="Email address" required />
                <button type="submit">Join</button>
              </form>
            </FooterAccordion>
          </div>
        </div>

        <div className="bh-footer-bottom">
          <span>© 2026 Baba Hakeem Herbal Products. All Rights Reserved.</span>
          <span>Cash on Delivery (COD) | JazzCash | EasyPaisa | Bank Transfer</span>
        </div>
      </div>
    </footer>
  );
}
