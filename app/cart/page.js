'use client';

import Link from 'next/link';
import useCart from '../../components/useCart';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';
import { TrashIcon } from '../../components/Icons';

const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;

export default function CartPage() {
  const [items, setItems, cartReady] = useCart();
  const count = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const changeQuantity = (id, delta) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));

  return <main className="bh-commerce-page"><CommerceHeader />
    <section className="bh-commerce-hero">
      <div className="bh-commerce-wrap">
        <nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Cart</span></nav>
        <p className="bh-commerce-eyebrow">YOUR SELECTION</p><h1>Your Cart</h1>
        <p>Review your herbal care essentials before checkout.</p>
      </div>
    </section>
    <section className="bh-commerce-wrap bh-cart-page-content">
      {!cartReady ? <div className="bh-commerce-loading" role="status"><span className="bh-loading-spinner" /><p>Loading your cart</p></div> : items.length === 0 ? <div className="bh-commerce-empty"><h2>Your cart is empty</h2><p>Explore our products and find the right care for you.</p><Link className="bh-commerce-primary" href="/">Shop Products</Link></div> : <div className="bh-commerce-layout">
        <div className="bh-commerce-card bh-cart-page-items">
          <div className="bh-cart-page-title">Your items <span>{count}</span></div>
          <div className="bh-cart-table-wrap"><table className="bh-cart-table"><thead><tr><th scope="col">Product</th><th scope="col">Price</th><th scope="col">Quantity</th><th scope="col">Total</th><th scope="col"><span className="bh-visually-hidden">Remove</span></th></tr></thead><tbody>
            {items.map((item) => <tr key={item.id}>
              <td data-label="Product"><div className="bh-cart-table-product"><img src={item.image || '/joint-oil-4k.png'} alt="" /><Link href={`/products/${item.slug || item.id}`}>{item.name}</Link></div></td>
              <td className="bh-cart-table-price" data-label="Price">{money(item.price)}</td>
              <td data-label="Quantity"><div className="bh-cart-page-qty"><button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Decrease ${item.name}`}>&minus;</button><span>{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Increase ${item.name}`} disabled={item.quantity >= 99}>+</button></div></td>
              <td data-label="Total" className="bh-cart-table-total">{money(Number(item.price) * item.quantity)}</td>
              <td data-label=""><button className="bh-cart-page-remove" type="button" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))} aria-label={`Remove ${item.name} from cart`} title="Remove item"><TrashIcon size={18} color="currentColor" /></button></td>
            </tr>)}
          </tbody></table></div>
          <Link href="/" className="bh-commerce-back">Continue shopping</Link>
        </div>
        <aside className="bh-commerce-card bh-cart-summary"><h2>Order summary</h2><div><span>Subtotal ({count} items)</span><strong>{money(total)}</strong></div><p>Shipping and delivery details are confirmed at checkout.</p><Link href="/checkout" className="bh-commerce-primary">Proceed to checkout</Link><small>Secure checkout &middot; Cash on delivery available</small></aside>
      </div>}
    </section>
    <CommerceFooter />
  </main>;
}
