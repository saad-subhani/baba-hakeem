import Link from 'next/link';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';
import StoreContactDetails from '../../components/StoreContactDetails';

export const metadata = {
  title: 'Terms and Conditions | Baba Hakeem',
  description: 'Read the terms that apply when browsing and ordering from the Baba Hakeem online store.',
};

const sections = [
  {
    title: 'Using this store',
    paragraphs: [
      'By accessing or using the Baba Hakeem online store, you agree to these Terms and Conditions. If you do not agree, please do not use the store. You must provide accurate information when placing an order or contacting us.',
      'We may update these terms as our store and services change. The version published on this page applies to your use of the store from its posted date.',
    ],
  },
  {
    title: 'Products and availability',
    paragraphs: [
      'We make reasonable efforts to describe and display products accurately. Product images are illustrative; packaging, appearance, or presentation may vary. Product availability can change, and an item may become unavailable before an order is confirmed.',
      'Product information is provided for general informational purposes. Herbal products are not a substitute for professional medical advice, diagnosis, or treatment. Check the ingredients and directions before use, and consult a qualified healthcare professional if you have a medical condition, are pregnant or nursing, or are unsure whether a product is suitable for you.',
    ],
  },
  {
    title: 'Prices and orders',
    paragraphs: [
      'Prices are shown in Pakistani Rupees unless stated otherwise. The price and availability are checked when an order is submitted. We may correct an obvious pricing or listing error and will contact you if it affects your order.',
      'Submitting checkout details is an order request. We may contact you to confirm the order and delivery details. An order is subject to product availability and confirmation by Baba Hakeem. We may decline or cancel an order where information is incomplete, a product is unavailable, or we cannot reasonably fulfill the request.',
      'Do not place duplicate orders while an order is being submitted. If the checkout shows an error or you are unsure whether an order was received, contact us before placing it again.',
    ],
  },
  {
    title: 'Payment and delivery',
    paragraphs: [
      'Cash on Delivery is available through checkout where offered. Any other payment option shown for a purchase is subject to the relevant payment provider and its terms. Payment and delivery options may change.',
      'Delivery availability, charges, and timing depend on the destination and delivery service. Any delivery estimate is an estimate, not a guaranteed date. Please provide a complete address and a reachable phone number so delivery can be arranged.',
    ],
  },
  {
    title: 'Returns, damaged items, and support',
    paragraphs: [
      'If your parcel arrives damaged, an item is missing, or you have a concern about an order, contact us with your order details so we can review it. Any return, replacement, or refund request will be considered in line with the applicable store policy and requirements.',
    ],
  },
  {
    title: 'Reviews and user submissions',
    paragraphs: [
      'You are responsible for the text and photos you submit with a review or enquiry. Do not submit unlawful, misleading, abusive, or private information belonging to another person. Reviews may be moderated before they appear publicly, and we may remove content that violates these terms or is otherwise inappropriate.',
    ],
  },
  {
    title: 'Intellectual property and acceptable use',
    paragraphs: [
      'Store content, including text, branding, graphics, and product photography, is owned by Baba Hakeem or used with permission. Do not copy, publish, or commercially use this content without prior permission.',
      'Do not interfere with the store, attempt unauthorized access, introduce malicious code, or use the store in a way that disrupts service or violates another person\'s rights.',
    ],
  },
  {
    title: 'Limitation and applicable requirements',
    paragraphs: [
      'To the extent permitted by applicable law, Baba Hakeem is not responsible for indirect losses arising from your use of the store or delays caused by events outside our reasonable control. Nothing in these terms limits rights or responsibilities that cannot be limited under applicable law.',
      'These terms are subject to applicable laws and requirements. Any dispute should first be raised with our customer support so we can try to resolve it.',
    ],
  },
];

export default function TermsAndConditionsPage() {
  return <main className="bh-commerce-page bh-legal-page">
    <CommerceHeader />
    <section className="bh-commerce-hero">
      <div className="bh-commerce-wrap">
        <nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Terms and Conditions</span></nav>
        <p className="bh-commerce-eyebrow">PLEASE READ</p>
        <h1>Terms and Conditions</h1>
        <p>The terms for browsing and placing orders with Baba Hakeem.</p>
      </div>
    </section>
    <section className="bh-commerce-wrap bh-privacy-content">
      <p className="bh-privacy-updated">Last updated: October 29, 2026</p>
      <p className="bh-privacy-intro">These terms apply to your access to and use of the Baba Hakeem online store, including product pages, checkout, and customer submissions.</p>
      <div className="bh-privacy-sections">
        {sections.map((section, index) => <section className="bh-privacy-section" key={section.title}>
          <span className="bh-privacy-number">{String(index + 1).padStart(2, '0')}</span>
          <div><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>)}
        <section className="bh-privacy-contact">
          <h2>Questions about these terms?</h2>
          <p>Contact Baba Hakeem customer support:</p>
          <p><StoreContactDetails /><Link href="/privacy-policy">Read our Privacy Policy</Link></p>
        </section>
      </div>
    </section>
    <CommerceFooter />
  </main>;
}
