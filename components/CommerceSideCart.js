'use client';

import Link from 'next/link';
import useStoreContactSettings, { buildWhatsAppUrl } from './useStoreContactSettings';
import { ArrowRightIcon, CartIcon, CloseIcon, TrashIcon, WhatsAppIcon } from './Icons';

const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

export default function CommerceSideCart({ open, onClose, items, setItems }) {
  const contact = useStoreContactSettings();
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const message = [
    'Salam Baba Hakeem, I would like to place this order:',
    ...items.map((item, index) => `${index + 1}. ${item.name} | Qty: ${item.quantity} | ${money(Number(item.price) * item.quantity)}`),
    `Total: ${money(total)}`,
    'Payment method: Cash on Delivery. Please confirm my order.',
  ].join('\n');

  const changeQuantity = (id, delta) => setItems((current) => current
    .map((item) => item.id === id ? { ...item, quantity: Number(item.quantity || 0) + delta } : item)
    .filter((item) => item.quantity > 0));

  return <>
    <button type="button" className={`bh-cart-overlay${open ? ' open' : ''}`} onClick={onClose} aria-label="Close cart" tabIndex={open ? 0 : -1} />
    <aside className={`bh-cart-drawer${open ? ' open' : ''}`} aria-label="Shopping cart" aria-modal={open ? 'true' : undefined} role={open ? 'dialog' : undefined}>
      <div className="bh-cart-header">
        <div className="bh-cart-heading"><h3>Your Cart</h3><span>{count}</span></div>
        <button className="bh-cart-close" type="button" onClick={onClose} aria-label="Close cart"><CloseIcon size={20} /></button>
      </div>
      <div className="bh-cart-items-list">
        {!items.length ? <div className="bh-cart-empty">
          <div><CartIcon size={38} color="#9aa595" /></div>
          <p>Your cart is empty.</p>
          <button className="bh-cart-continue" type="button" onClick={onClose}>Explore Products</button>
        </div> : items.map((item) => <div key={item.id} className="bh-cart-item">
          <img src={item.image || '/joint-oil-4k.png'} alt={item.name} className="bh-cart-item__image" />
          <div className="bh-cart-item__details">
            <h4>{item.name}</h4>
            <div className="bh-cart-item__meta">
              <span>{money(item.price)}</span>
              <div className="bh-cart-quantity" aria-label={`Quantity ${item.quantity}`}>
                <button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Decrease ${item.name} quantity`}>−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= 99}>+</button>
              </div>
            </div>
          </div>
          <button className="bh-cart-remove" type="button" onClick={() => changeQuantity(item.id, -Number(item.quantity || 0))} aria-label={`Remove ${item.name} from cart`} title="Remove item"><TrashIcon size={18} color="#e53e3e" /></button>
        </div>)}
      </div>
      {items.length > 0 && <div className="bh-cart-footer">
        <div className="bh-cart-subtotal"><span>Subtotal:</span><span>{money(total)}</span></div>
        {contact.whatsapp_number && <a href={buildWhatsAppUrl(contact.whatsapp_number, message)} target="_blank" rel="noreferrer" className="bh-cart-whatsapp-btn">Order on WhatsApp (Fast Checkout) <WhatsAppIcon size={18} color="#ffffff" /></a>}
        <Link className="bh-cart-cod-btn" href="/checkout" onClick={onClose}>Cash on Delivery Checkout <ArrowRightIcon size={16} /></Link>
        <Link href="/cart" className="bh-cart-view-page" onClick={onClose}>View full cart</Link>
      </div>}
    </aside>
  </>;
}
