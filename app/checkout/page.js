'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCart from '../../components/useCart';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;

export default function CheckoutPage() {
  const [items, setItems, cartReady] = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', address: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [transactionId, setTransactionId] = useState('');
  const [bankDetails, setBankDetails] = useState(null);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState(null);
  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  useEffect(() => {
    fetch('/api/bank-details').then((response) => response.ok ? response.json() : null)
      .then((result) => { if (result?.bankDetails?.enabled) setBankDetails(result.bankDetails); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!guidanceOpen) return;
    const onKeyDown = (event) => { if (event.key === 'Escape') setGuidanceOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [guidanceOpen]);

  const placeOrder = async (event) => {
    event.preventDefault();
    setError('');
    if (!items.length) { setError('Your cart is empty. Add a product to continue.'); return; }
    if (paymentMethod === 'Bank Transfer' && transactionId.trim().length < 3) { setError('Enter your bank transaction ID or reference to continue.'); return; }
    setBusy(true);
    try {
      const customer = { ...form, payment_method: paymentMethod, transaction_id: paymentMethod === 'Bank Transfer' ? transactionId.trim() : '' };
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer, items: items.map(({ id, name, quantity }) => ({ id, name, quantity })) }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'We could not place your order. Please try again.');
      try { window.sessionStorage.setItem('bh_last_order_phone', form.phone); } catch {}
      setItems([]);
      router.push(`/thank-you?order=${encodeURIComponent(result.order_number)}`);
    } catch (issue) {
      setError(issue.message || 'Checkout is temporarily unavailable. Please try again.');
    } finally { setBusy(false); }
  };

  if (order) return <main className="bh-commerce-page"><CommerceHeader /><section className="bh-commerce-hero"><div className="bh-commerce-wrap"><nav className="bh-commerce-breadcrumb"><Link href="/">Home</Link><span>/</span><span>Order confirmed</span></nav><p className="bh-commerce-eyebrow">THANK YOU</p><h1>Order confirmed</h1><p>Your order has been received.</p></div></section><section className="bh-commerce-wrap"><div className="bh-commerce-empty bh-order-success"><div className="bh-order-check">✓</div><h2>Thank you for your order</h2><p>Order number <strong>{order.order_number}</strong></p><p>Total: <strong>{money(order.total_amount)}</strong> · Cash on Delivery</p><Link className="bh-commerce-primary" href="/">Continue shopping</Link></div></section><CommerceFooter /></main>;

  return <main className="bh-commerce-page"><CommerceHeader />
    <section className="bh-commerce-hero"><div className="bh-commerce-wrap"><nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/cart">Cart</Link><span>/</span><span>Checkout</span></nav><p className="bh-commerce-eyebrow">ALMOST YOURS</p><h1>Checkout</h1><p>Enter your delivery details to place your order.</p></div></section>
    <section className="bh-commerce-wrap bh-checkout-content">
      {!cartReady ? <div className="bh-commerce-loading" role="status"><span className="bh-loading-spinner" /><p>Preparing checkout</p></div> : items.length === 0 ? <div className="bh-commerce-empty"><h2>Your cart is empty</h2><p>Add products before continuing to checkout.</p><Link className="bh-commerce-primary" href="/">Shop Products</Link></div> : <div className="bh-commerce-layout bh-checkout-layout">
        <form className="bh-commerce-card bh-checkout-form" onSubmit={placeOrder}>
          <h2>Delivery information</h2><p className="bh-checkout-intro">We deliver across Pakistan. Fields marked * are required.</p>
          <div className="bh-checkout-fields">
            <label>Full name *<input name="name" autoComplete="name" required minLength={2} maxLength={120} value={form.name} onChange={update} /></label>
            <label>Phone number *<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={24} placeholder="03XX XXXXXXX" value={form.phone} onChange={update} /></label>
            <label>Email address *<input name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={update} /></label>
            <label>City *<input name="city" autoComplete="address-level2" required minLength={2} maxLength={120} value={form.city} onChange={update} /></label>
            <label className="bh-checkout-wide">Complete delivery address *<textarea name="address" autoComplete="street-address" required minLength={8} maxLength={500} rows={3} value={form.address} onChange={update} /></label>
            <label className="bh-checkout-wide">Order notes <textarea name="notes" maxLength={1000} rows={2} placeholder="Landmark or delivery instructions (optional)" value={form.notes} onChange={update} /></label>
          </div>
          <fieldset className="bh-payment-options"><legend>Payment method</legend>
            <label><input type="radio" name="payment-method" checked={paymentMethod === 'Cash on Delivery'} onChange={() => setPaymentMethod('Cash on Delivery')} /><span><strong>Cash on Delivery</strong><small>Pay the courier when your parcel arrives.</small></span></label>
            {bankDetails && <label><input type="radio" name="payment-method" checked={paymentMethod === 'Bank Transfer'} onChange={() => setPaymentMethod('Bank Transfer')} /><span><strong>Bank Transfer</strong><small>Pay through your bank, then provide the transaction ID.</small></span></label>}
          </fieldset>
          {paymentMethod === 'Bank Transfer' && bankDetails && <div className="bh-bank-transfer-box">
            <div className="bh-bank-transfer-heading">{bankDetails.logo_url ? <img src={bankDetails.logo_url} alt={`${bankDetails.bank_name} logo`} /> : <span className="bh-bank-mark">{bankDetails.bank_name?.slice(0, 2)?.toUpperCase() || 'BK'}</span>}<div><strong>{bankDetails.bank_name}</strong><small>Account title: {bankDetails.account_title}</small></div></div>
            <div className="bh-bank-detail"><span>IBAN</span><strong>{bankDetails.iban}</strong></div>
            <div className="bh-bank-detail"><span>Account number</span><strong>{bankDetails.account_number}</strong></div>
            <label className="bh-transaction-field">Bank transaction ID / reference *<span className="bh-transaction-input"><input value={transactionId} onChange={(event) => setTransactionId(event.target.value)} required minLength={3} maxLength={120} placeholder="Enter transaction ID" /><button type="button" onClick={() => setGuidanceOpen(true)} aria-label="How to find your transaction ID" title="How to find your transaction ID"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></svg></button></span></label>
            <p>Include the transfer reference so we can verify your payment.</p>
          </div>}
          {error && <div className="bh-checkout-error" role="alert">{error}</div>}
          <button className="bh-commerce-primary bh-checkout-submit" type="submit" disabled={busy || !items.length}>{busy ? <><span className="bh-button-spinner" aria-hidden="true" /> Placing order...</> : <>Place order &middot; {paymentMethod}</>}</button>
          <p className="bh-checkout-terms">By placing your order, you agree that our team may contact you to confirm delivery details.</p>
        </form>
        <aside className="bh-commerce-card bh-cart-summary"><h2>Your order</h2><div className="bh-order-table-wrap"><table className="bh-order-table"><thead><tr><th scope="col">Product</th><th scope="col">Qty</th><th scope="col">Total</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="bh-order-product"><img src={item.image || '/joint-oil-4k.png'} alt="" /><span>{item.name}</span></div></td><td>{item.quantity}</td><td>{money(Number(item.price) * item.quantity)}</td></tr>)}</tbody></table></div><div className="bh-checkout-total"><span>Total</span><strong>{money(total)}</strong></div><p>Payment method</p><div className="bh-checkout-payment">{paymentMethod}</div><Link className="bh-commerce-back" href="/cart">Edit cart</Link></aside>
      </div>}
    </section>
    {guidanceOpen && <div className="bh-guidance-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGuidanceOpen(false); }}><section className="bh-guidance-modal" role="dialog" aria-modal="true" aria-labelledby="bh-guidance-title"><button type="button" className="bh-guidance-close" onClick={() => setGuidanceOpen(false)} aria-label="Close guidance">×</button><span className="bh-guidance-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></svg></span><p className="bh-commerce-eyebrow">BANK PAYMENT HELP</p><h2 id="bh-guidance-title">Where to find your transaction ID</h2><ol><li>Complete the transfer to the account shown at checkout.</li><li>Open your bank app or transfer receipt and find the transaction ID, reference number, or trace number.</li><li>Enter that reference here so our team can match your payment to this order.</li></ol><p className="bh-guidance-reminder">Please keep your transaction receipt until we verify the transfer. Your order remains subject to payment verification.</p><button className="bh-commerce-primary" type="button" onClick={() => setGuidanceOpen(false)}>Got it</button></section></div>}
    <CommerceFooter />
  </main>;
}
