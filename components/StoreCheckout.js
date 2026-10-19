'use client';

import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import styles from './StoreCheckout.module.css';

const STORAGE_KEY='baba-hakeem-cart-v1';
const RECEIPT_KEY='baba-hakeem-last-order';
const money=n=>'Rs. '+Number(n||0).toLocaleString('en-PK',{maximumFractionDigits:2});

function readCart(){
  if(typeof window==='undefined')return [];
  try{
    const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    return Array.isArray(raw)?raw.filter(i=>i&&i.id&&i.name&&Number(i.quantity)>0)
      .map(i=>({...i,quantity:Math.min(99,Math.max(1,Math.trunc(Number(i.quantity)||1)))})):[];
  }catch{return [];}
}
function writeCart(items){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items));}catch{}
  window.dispatchEvent(new Event('baba-cart-sync'));
}
function useCart(){
  const [items,setItems]=useState([]);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    const sync=()=>setItems(readCart());
    sync();setReady(true);
    window.addEventListener('baba-cart-sync',sync);
    window.addEventListener('storage',sync);
    return()=>{
      window.removeEventListener('baba-cart-sync',sync);
      window.removeEventListener('storage',sync);
    };
  },[]);
  const change=(id,delta)=>{
    const latest=readCart();
    writeCart(latest.flatMap(item=>{
      if(item.id!==id)return [item];
      const quantity=item.quantity+delta;
      return quantity>0?[{...item,quantity:Math.min(99,quantity)}]:[];
    }));
  };
  const remove=id=>writeCart(readCart().filter(item=>item.id!==id));
  const subtotal=useMemo(()=>items.reduce((sum,i)=>sum+Number(i.price||0)*i.quantity,0),[items]);
  return {items,ready,change,remove,subtotal};
}

function SiteFrame({number,title,description,children}){
  return <main className={styles.screen}>
    <div className={styles.wrap}>
      <header className={styles.header}><Link href="/" className={styles.logo}>BABA HAKEEM <small>HERBAL PRODUCTS</small></Link><Link href="/#reel-products" className={styles.return}>← CONTINUE SHOPPING</Link></header>
      <div className={styles.eyebrow}>{number} / BABA HAKEEM SHOP</div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      {children}
      <footer className={styles.footer}>BABA HAKEEM HERBAL PRODUCTS <span>SECURE ORDER REQUEST / PAKISTAN</span></footer>
    </div>
  </main>;
}
function LineItems({items,change,remove,editable=false}){
  return <div className={styles.lines}>{items.map(item=>
    <article key={item.id} className={styles.line}>
      <div className={styles.thumb}>{item.image?<img src={item.image} alt={item.name} loading="lazy" decoding="async"/>:<span>BH</span>}</div>
      <div className={styles.lineInfo}><h3>{item.name}</h3><small>{item.price?money(item.price):'Price to be confirmed'}</small>
        {editable?<div className={styles.quantity}>
          <button type="button" onClick={()=>change(item.id,-1)} aria-label={'Decrease '+item.name}>−</button>
          <span>{item.quantity}</span>
          <button type="button" onClick={()=>change(item.id,1)} aria-label={'Increase '+item.name}>+</button>
        </div>:<p>Quantity: {item.quantity}</p>}
      </div>
      <div className={styles.lineEnd}><strong>{item.price?money(Number(item.price)*item.quantity):'On request'}</strong>
        {editable&&<button className={styles.remove} type="button" onClick={()=>remove(item.id)}>REMOVE</button>}
      </div>
    </article>
  )}</div>;
}

export function CartPage(){
  const {items,ready,change,remove,subtotal}=useCart();
  return <SiteFrame number="01" title="YOUR CART." description="Review your selection before entering your delivery details.">
    {!ready?<p className={styles.notice}>Loading cart…</p>:items.length===0?
      <section className={styles.empty}><h2>Your cart is empty.</h2><p>Explore the Baba Hakeem collection to get started.</p><Link className={styles.primary} href="/#reel-products">EXPLORE PRODUCTS →</Link></section>
      :<div className={styles.columns}><section className={styles.panel}><h2>Selected products</h2><LineItems items={items} change={change} remove={remove} editable/></section><aside className={styles.panel}>
        <h2>Order summary</h2><div className={styles.summaryRow}><span>Estimated subtotal</span><b>{money(subtotal)}</b></div>
        <p className={styles.muted}>Final prices and availability are verified against the live product catalogue during checkout. Delivery and payment details are confirmed by the store.</p>
        <Link href="/checkout" className={styles.primary}>CONTINUE TO CHECKOUT →</Link>
        <Link href="/#reel-products" className={styles.secondary}>CONTINUE SHOPPING</Link>
      </aside></div>}
  </SiteFrame>;
}

export function CheckoutPage(){
  const {items,ready,subtotal}=useCart();
  const [customer,setCustomer]=useState({name:'',email:'',phone:'',city:'',address:'',notes:''});
  const [sending,setSending]=useState(false);
  const [error,setError]=useState('');
  const set=(key,value)=>setCustomer(prev=>({...prev,[key]:value}));
  const submit=async e=>{
    e.preventDefault();
    if(sending||!items.length)return;
    setSending(true);setError('');
    try{
      const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({customer,items:items.map(i=>({id:i.id,name:i.name,quantity:i.quantity}))})});
      const result=await response.json();
      if(!response.ok||!result.success)throw new Error(result.error||'Could not place order.');
      sessionStorage.setItem(RECEIPT_KEY,JSON.stringify({
        order_number:result.order_number,total_amount:result.total_amount,
        item_count:items.reduce((sum,i)=>sum+i.quantity,0)
      }));
      writeCart([]);
      window.location.assign('/thank-you?order='+encodeURIComponent(result.order_number));
    }catch(err){
      setError(err?.message||'Checkout is unavailable. Please try again.');
      setSending(false);
    }
  };
  return <SiteFrame number="02" title="CHECKOUT." description="Share your delivery details to request an order. No online payment will be collected.">
    {!ready?<p className={styles.notice}>Loading checkout…</p>:items.length===0?
      <section className={styles.empty}><h2>Nothing to check out yet.</h2><Link href="/cart" className={styles.primary}>BACK TO CART →</Link></section>:
      <div className={styles.columns}><section className={styles.panel}>
        <h2>Delivery information</h2>
        <form className={styles.form} onSubmit={submit}>
          <label>FULL NAME *<input autoComplete="name" required minLength={2} maxLength={120} value={customer.name} onChange={e=>set('name',e.target.value)}/></label>
          <label>EMAIL (FOR ORDER UPDATES)<input type="email" autoComplete="email" maxLength={254} value={customer.email} onChange={e=>set('email',e.target.value)}/></label>
          <div className={styles.formRow}>
            <label>PHONE NUMBER *<input autoComplete="tel" inputMode="tel" required minLength={7} maxLength={24} value={customer.phone} onChange={e=>set('phone',e.target.value)}/></label>
            <label>CITY *<input autoComplete="address-level2" required minLength={2} maxLength={120} value={customer.city} onChange={e=>set('city',e.target.value)}/></label>
          </div>
          <label>COMPLETE DELIVERY ADDRESS *<textarea autoComplete="street-address" required minLength={8} maxLength={500} rows={3} value={customer.address} onChange={e=>set('address',e.target.value)}/></label>
          <label>ORDER NOTES (OPTIONAL)<textarea maxLength={1000} rows={2} value={customer.notes} onChange={e=>set('notes',e.target.value)}/></label>
          <div className={styles.payment}><strong>Payment method</strong><p>To be confirmed by Baba Hakeem before fulfillment. Cash on Delivery or online payment has not yet been finalized.</p></div>
          {error&&<div className={styles.error} role="alert">{error} <Link href="/cart">Review cart</Link></div>}
          <button className={styles.primary} disabled={sending} type="submit">{sending?'PLACING ORDER…':'PLACE ORDER REQUEST →'}</button>
        </form>
      </section><aside className={styles.panel}><h2>Your order</h2><LineItems items={items}/><div className={styles.summaryRow}><span>Estimated subtotal</span><b>{money(subtotal)}</b></div>
        <p className={styles.muted}>Official prices, stock and final total are validated by the database before an order is accepted.</p><Link className={styles.secondary} href="/cart">← EDIT CART</Link>
      </aside></div>}
  </SiteFrame>;
}

export function ThankYouPage(){
  const [receipt,setReceipt]=useState(null);
  useEffect(()=>{
    try{
      const order=new URLSearchParams(window.location.search).get('order');
      const saved=JSON.parse(sessionStorage.getItem(RECEIPT_KEY)||'null');
      if(saved?.order_number&&saved.order_number===order)setReceipt(saved);
    }catch{}
  },[]);
  return <SiteFrame number="03" title="THANK YOU." description="Baba Hakeem Herbal Products">
    <section className={styles.empty}>
      {receipt?<><div className={styles.successMark}>✓</div><h2>Your order request was received.</h2>
        <p>Your reference number is <b>{receipt.order_number}</b>. Keep this number for order-related enquiries.</p>
        <div className={styles.summaryRow}><span>Confirmed product subtotal</span><b>{money(receipt.total_amount)}</b></div>
        <p className={styles.muted}>Payment and delivery will be confirmed by the store. Email notifications are not active yet.</p>
      </>:<><h2>Looking for an order?</h2><p>Order confirmation is shown here after a successful checkout on this device. Check your saved order reference or contact the store.</p></>}
      <Link className={styles.primary} href="/">RETURN TO HOME →</Link>
    </section>
  </SiteFrame>;
}
