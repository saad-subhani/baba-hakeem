import Link from 'next/link';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';
import StoreContactDetails from '../../components/StoreContactDetails';

export const metadata = {
  title: 'Privacy Policy | Baba Hakeem',
  description: 'Learn how Baba Hakeem collects, uses, and protects information when you shop, contact us, or submit a product review.',
};

const sections = [
  {
    title: 'Information you provide',
    paragraphs: [
      'When you place an order, we collect the details needed to process and deliver it, such as your name, phone number, city, delivery address, and any order notes. You may also provide an email address.',
      'If you contact us, we receive the contact details and message you choose to send. If you submit a product review, we collect your name, rating, review text, and any photo you attach. Reviews are shown publicly on the relevant product page after approval.',
    ],
  },
  {
    title: 'How we use information',
    paragraphs: [
      'We use order information to confirm and fulfill purchases, arrange delivery, respond to questions, send order related messages, and maintain store and order records. We use enquiry and review information to respond to you, moderate reviews, and improve our products and service.',
      'The cart is saved in your browser storage so your selected products remain available as you move between pages. This cart data is stored on your device and is not a submitted order until you complete checkout.',
    ],
  },
  {
    title: 'Sharing and service providers',
    paragraphs: [
      'We may share the information needed to complete your request with service providers that support store operations, order processing, delivery, database hosting, or order communications. We do not sell personal information for advertising.',
      'We may also disclose information when needed to protect the store and its customers, respond to a valid legal request, or meet applicable legal obligations.',
    ],
  },
  {
    title: 'Payments and delivery',
    paragraphs: [
      'Cash on Delivery is available at checkout. If another payment option is offered for a purchase, payment details are handled by the relevant payment provider; do not send card or account passwords to us by email or message.',
      'Your delivery address and phone number are used to coordinate delivery and may be provided to the delivery service handling your parcel.',
    ],
  },
  {
    title: 'Reviews and uploaded photos',
    paragraphs: [
      'A review and its attached photo may be displayed publicly after moderation. Please avoid including private information in a review or photo. You can contact us to request a correction or removal of your review.',
    ],
  },
  {
    title: 'Storage, security, and retention',
    paragraphs: [
      'We use administrative and technical measures intended to protect information. No website or data transmission can be guaranteed to be completely secure.',
      'We keep information for as long as needed to handle orders and enquiries, maintain business records, resolve disputes, and meet applicable obligations. Browser cart data can be cleared through your browser settings.',
    ],
  },
  {
    title: 'Your choices and requests',
    paragraphs: [
      'You may ask us to access or correct the personal information you have provided, or request deletion where we are able to do so. Some order records may need to be retained for legitimate business or legal purposes. Contact us using the details below and include enough information for us to locate your request.',
    ],
  },
  {
    title: 'Changes to this policy',
    paragraphs: [
      'We may update this policy as our store and practices change. The latest version will be posted on this page with its updated date.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return <main className="bh-commerce-page bh-legal-page">
    <CommerceHeader />
    <section className="bh-commerce-hero">
      <div className="bh-commerce-wrap">
        <nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Privacy Policy</span></nav>
        <p className="bh-commerce-eyebrow">YOUR PRIVACY</p>
        <h1>Privacy Policy</h1>
        <p>How Baba Hakeem handles information when you use our store.</p>
      </div>
    </section>
    <section className="bh-commerce-wrap bh-privacy-content">
      <p className="bh-privacy-updated">Last updated: October 29, 2026</p>
      <p className="bh-privacy-intro">This policy describes the information we collect through the Baba Hakeem store, how we use it, and the choices available to you.</p>
      <div className="bh-privacy-sections">
        {sections.map((section, index) => <section className="bh-privacy-section" key={section.title}>
          <span className="bh-privacy-number">{String(index + 1).padStart(2, '0')}</span>
          <div><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>)}
        <section className="bh-privacy-contact">
          <h2>Contact us about privacy</h2>
          <p>For privacy questions or requests, contact Baba Hakeem:</p>
          <p><StoreContactDetails /></p>
        </section>
      </div>
    </section>
    <CommerceFooter />
  </main>;
}
