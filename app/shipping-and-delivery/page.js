import Link from 'next/link';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';
import StoreContactDetails from '../../components/StoreContactDetails';

export const metadata = {
  title: 'Shipping and Delivery | Baba Hakeem',
  description: 'Find delivery coverage, estimated shipping times, payment on delivery, and parcel support information for Baba Hakeem orders.',
};

const details = [
  { title: 'Delivery coverage', text: 'We deliver across Pakistan through registered courier services. Please provide a complete address, city, and reachable phone number when you place your order.' },
  { title: 'Estimated delivery time', text: 'Orders for Karachi, Lahore, and Islamabad are typically delivered within 24 to 48 hours. Delivery to other cities generally takes 2 to 4 business days. These are estimates and may vary with courier operations, weather, public holidays, or access to your area.' },
  { title: 'Order processing', text: 'After checkout, our team may contact you to confirm your order and delivery details before dispatch. Keep your phone available so the courier can coordinate delivery.' },
  { title: 'Delivery charges', text: 'Any applicable delivery charge or offer will be confirmed with your order. If you are unsure about the delivery cost for your address, contact us before placing the order.' },
  { title: 'Payment on delivery', text: 'Cash on Delivery is available for eligible orders. Please pay the courier when your parcel is physically delivered. If another payment method is offered, its availability will be confirmed when you place the order.' },
  { title: 'If there is a delivery issue', text: 'If your parcel is delayed, you cannot be reached by the courier, or it arrives damaged or incomplete, contact us with your order number and phone number. For damaged, incorrect, or incomplete orders, please get in touch within 7 days of delivery.' },
];

export default function ShippingAndDeliveryPage() {
  return <main className="bh-commerce-page bh-legal-page">
    <CommerceHeader />
    <section className="bh-commerce-hero">
      <div className="bh-commerce-wrap">
        <nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shipping and Delivery</span></nav>
        <p className="bh-commerce-eyebrow">FROM OUR DOOR TO YOURS</p>
        <h1>Shipping and Delivery</h1>
        <p>Delivery details for Baba Hakeem orders across Pakistan.</p>
      </div>
    </section>
    <section className="bh-commerce-wrap bh-privacy-content bh-shipping-content">
      <p className="bh-privacy-intro">We work with registered courier services to deliver your order to your doorstep. Delivery times below are estimates and can change due to local courier conditions.</p>
      <div className="bh-privacy-sections">
        {details.map((detail, index) => <section className="bh-privacy-section" key={detail.title}>
          <span className="bh-privacy-number">{String(index + 1).padStart(2, '0')}</span>
          <div><h2>{detail.title}</h2><p>{detail.text}</p></div>
        </section>)}
        <section className="bh-privacy-contact">
          <h2>Need help with a delivery?</h2>
          <p>Share your order number with our support team and we will help you check the next steps.</p>
          <p><StoreContactDetails /></p>
          <p>See our <Link href="/returns-and-refunds">Returns and Refunds</Link> page for damaged, incorrect, or incomplete orders.</p>
        </section>
      </div>
    </section>
    <CommerceFooter />
  </main>;
}
