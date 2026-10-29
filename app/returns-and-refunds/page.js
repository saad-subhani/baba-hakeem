import Link from 'next/link';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';
import { StoreEmailLink, StoreWhatsAppLink } from '../../components/StoreContactDetails';

export const metadata = {
  title: 'Returns and Refunds | Baba Hakeem',
  description: 'Learn how to contact Baba Hakeem about damaged, incorrect, or incomplete orders and request help.',
};

const steps = [
  { title: 'Contact us within 7 days', text: 'If your parcel arrives damaged, contains the wrong item, or has a missing product, contact our support team within 7 days of delivery so we can review the issue.' },
  { title: 'Share the order details', text: 'Include your order number, name, phone number, and a short description of what happened. Photos of the parcel and product help us assess damage or an incorrect item.' },
  { title: 'We will review your request', text: 'Our team will review the information and contact you about the next steps. Where an item is confirmed damaged or incorrect, we will work with you on an appropriate replacement or refund.' },
];

export default function ReturnsAndRefundsPage() {
  return <main className="bh-commerce-page bh-legal-page">
    <CommerceHeader />
    <section className="bh-commerce-hero">
      <div className="bh-commerce-wrap">
        <nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Returns and Refunds</span></nav>
        <p className="bh-commerce-eyebrow">HERE TO HELP</p>
        <h1>Returns and Refunds</h1>
        <p>We will help resolve problems with an order as quickly as we can.</p>
      </div>
    </section>
    <section className="bh-commerce-wrap bh-returns-content">
      <div className="bh-returns-intro">
        <p className="bh-privacy-updated">Last updated: October 29, 2026</p>
        <p>If an order arrives damaged, incorrect, or incomplete, please let us know within 7 days of delivery. We will review the details and guide you through the available resolution.</p>
      </div>
      <div className="bh-returns-steps">
        {steps.map((step, index) => <article className="bh-returns-step" key={step.title}>
          <span>{String(index + 1).padStart(2, '0')}</span><div><h2>{step.title}</h2><p>{step.text}</p></div>
        </article>)}
      </div>
      <div className="bh-returns-note"><h2>Need help with a different return?</h2><p>Contact us with your order number and reason for the request. We will review it and explain what options are available. Refund or replacement eligibility depends on the details of the order and issue.</p><div className="bh-returns-actions"><StoreWhatsAppLink className="bh-commerce-primary">Message us on WhatsApp</StoreWhatsAppLink><StoreEmailLink className="bh-returns-email" /></div></div>
      <p className="bh-returns-policy-links">See also: <Link href="/terms-and-conditions">Terms and Conditions</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.</p>
    </section>
    <CommerceFooter />
  </main>;
}
