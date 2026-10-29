'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;

function ThankYouContent() {
  const params = useSearchParams();
  const orderNumber = params.get('order') || '';
  const [phone, setPhone] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    try {
      const savedPhone = window.sessionStorage.getItem('bh_last_order_phone') || '';
      if (savedPhone) { setPhone(savedPhone); setPhoneInput(savedPhone); }
      else setLoading(false);
    } catch { setLoading(false); }
  }, []);

  const loadOrder = useCallback(async (phoneToCheck) => {
    if (!orderNumber || !phoneToCheck) return;
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: phoneToCheck }), cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.order) throw new Error(result.error || 'Could not verify these order details.');
      setOrder(result.order);
      setPhone(phoneToCheck);
      try { window.sessionStorage.setItem('bh_last_order_phone', phoneToCheck); } catch {}
    } catch (issue) { setOrder(null); setError(issue.message || 'Could not load order details.'); }
    finally { setLoading(false); }
  }, [orderNumber]);

  useEffect(() => { if (phone) loadOrder(phone); }, [phone, loadOrder]);

  const downloadReceipt = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const green = [9, 47, 13];
      const bright = [126, 217, 87];
      const ink = [38, 48, 38];
      const muted = [101, 111, 99];
      const pageWidth = pdf.internal.pageSize.getWidth();
      const left = 18;
      const right = pageWidth - 18;

      pdf.setFillColor(...green); pdf.rect(0, 0, pageWidth, 48, 'F');
      pdf.setFillColor(...bright); pdf.circle(28, 24, 10, 'F');
      pdf.setDrawColor(...green); pdf.setLineWidth(.8); pdf.line(23, 28, 32, 19); pdf.ellipse(27.5, 23.5, 2.3, 4.6, 'S'); pdf.line(26, 25, 29, 22);
      pdf.setTextColor(255, 255, 255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(19); pdf.text('Baba Hakeem', 44, 23);
      pdf.setTextColor(210, 230, 203); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.text('HERBAL PRODUCTS', 44, 30);
      pdf.setTextColor(...bright); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(11); pdf.text('ORDER RECEIPT', right, 25, { align: 'right' });

      let y = 62;
      pdf.setTextColor(...ink); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(14); pdf.text('Order details', left, y);
      y += 9;
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(...muted);
      pdf.text(`Order number: ${order.order_number}`, left, y); pdf.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-PK')}`, right, y, { align: 'right' });
      y += 7; pdf.text(`Payment: ${order.payment_method || 'Cash on Delivery'}`, left, y);
      if (order.transaction_id) { y += 6; pdf.text(`Transaction ID: ${order.transaction_id}`, left, y); }

      y += 12; pdf.setTextColor(...ink); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.text('Customer and delivery', left, y);
      y += 8; pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(...muted);
      pdf.text(order.customer_name || '', left, y); y += 6;
      pdf.text(order.phone || '', left, y); if (order.customer_email) { pdf.text(order.customer_email, right, y, { align: 'right' }); } y += 6;
      const addressLines = pdf.splitTextToSize(`${order.address || ''}, ${order.city || ''}`, pageWidth - 36);
      pdf.text(addressLines, left, y); y += addressLines.length * 5 + 9;

      const colQty = right - 72; const colTotal = right;
      pdf.setFillColor(241, 246, 237); pdf.roundedRect(left, y - 5, pageWidth - 36, 10, 2, 2, 'F');
      pdf.setTextColor(...green); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9);
      pdf.text('PRODUCT', left + 3, y + 1); pdf.text('QTY', colQty, y + 1, { align: 'right' }); pdf.text('AMOUNT', colTotal - 3, y + 1, { align: 'right' });
      y += 12;
      for (const item of order.items || []) {
        const itemName = pdf.splitTextToSize(String(item.name || 'Product'), colQty - left - 20);
        const rowHeight = Math.max(8, itemName.length * 5 + 3);
        if (y + rowHeight > 266) { pdf.addPage(); y = 22; }
        pdf.setDrawColor(229, 235, 225); pdf.line(left, y + rowHeight - 1, right, y + rowHeight - 1);
        pdf.setTextColor(...ink); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.text(itemName, left + 2, y + 4);
        pdf.text(String(item.quantity), colQty, y + 4, { align: 'right' }); pdf.text(money(item.line_total), right, y + 4, { align: 'right' });
        y += rowHeight;
      }
      y += 10;
      pdf.setTextColor(...green); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.text('TOTAL', colQty, y, { align: 'right' }); pdf.text(money(order.total_amount), right, y, { align: 'right' });
      y += 16; pdf.setDrawColor(...bright); pdf.setLineWidth(.7); pdf.line(left, y, right, y);
      y += 9; pdf.setTextColor(...muted); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.text('Thank you for choosing Baba Hakeem.', pageWidth / 2, y, { align: 'center' });
      const safeNumber = String(order.order_number).replace(/[^a-z0-9-]/gi, '-');
      pdf.save(`Baba-Hakeem-Receipt-${safeNumber}.pdf`);
    } catch {
      setError('The receipt could not be downloaded. Please try again.');
    } finally { setDownloading(false); }
  };

  return <main className="bh-commerce-page"><CommerceHeader />
    <section className="bh-commerce-hero"><div className="bh-commerce-wrap"><nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Order confirmation</span></nav><p className="bh-commerce-eyebrow">THANK YOU</p><h1>Order confirmation</h1><p>Your Baba Hakeem order details and receipt.</p></div></section>
    <section className="bh-commerce-wrap bh-thankyou-content">
      {loading ? <div className="bh-commerce-empty"><p>Loading your order details...</p></div> : !order ? <div className="bh-commerce-empty"><h2>Verify your order</h2><p>Enter the phone number used at checkout to view order details and download your receipt.</p><form className="bh-order-verify" onSubmit={(event) => { event.preventDefault(); loadOrder(phoneInput); }}><label>Checkout phone number<input type="tel" required value={phoneInput} onChange={(event) => setPhoneInput(event.target.value)} placeholder="03XX XXXXXXX" /></label><button type="submit" className="bh-commerce-primary">View order</button></form>{error && <p className="bh-thankyou-error" role="alert">{error}</p>}<Link href="/" className="bh-commerce-back">Continue shopping</Link></div> : <div className="bh-thankyou-card">
        <div className="bh-thankyou-success"><span>✓</span><div><p className="bh-commerce-eyebrow">ORDER RECEIVED</p><h2>Thank you, {order.customer_name}</h2><p>Your order has been received. We will contact you if we need to confirm delivery details.</p></div></div>
        <div className="bh-thankyou-meta"><div><small>ORDER NUMBER</small><strong>{order.order_number}</strong></div><div><small>ORDER STATUS</small><strong>{order.status}</strong></div><div><small>PAYMENT METHOD</small><strong>{order.payment_method || 'Cash on Delivery'}</strong></div></div>
        {order.transaction_id && <p className="bh-thankyou-transaction">Payment reference received: <strong>{order.transaction_id}</strong>. Our team will verify the transfer.</p>}
        <h3>Order items</h3><div className="bh-thankyou-items">{order.items.map((item, index) => <div className="bh-thankyou-item" key={`${item.product_id}-${index}`}><img src={item.image || '/joint-oil-4k.png'} alt="" /><span>{item.name}<small>Quantity: {item.quantity}</small></span><strong>{money(item.line_total)}</strong></div>)}</div>
        <div className="bh-thankyou-delivery"><div><small>DELIVERY TO</small><p>{order.customer_name}<br />{order.phone}<br />{order.address}, {order.city}</p></div><div><small>ORDER TOTAL</small><strong>{money(order.total_amount)}</strong></div></div>
        {error && <p className="bh-thankyou-error" role="alert">{error}</p>}
        <div className="bh-thankyou-actions"><button type="button" className="bh-commerce-primary" onClick={downloadReceipt} disabled={downloading}>{downloading ? 'Preparing receipt...' : 'Download receipt PDF'}</button><Link href="/" className="bh-commerce-back">Continue shopping</Link></div>
      </div>}
    </section>
    <CommerceFooter />
  </main>;
}

export default function ThankYouPage() {
  return <Suspense fallback={<main className="bh-commerce-page"><CommerceHeader /><div className="bh-commerce-empty">Loading order confirmation...</div><CommerceFooter /></main>}><ThankYouContent /></Suspense>;
}
