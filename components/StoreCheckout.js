'use client';

import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../lib/supabase';
import styles from './StoreCheckout.module.css';
import flow from './CommerceJourney.module.css';

const STORAGE_KEY='baba-hakeem-cart-v1';
const RECEIPT_KEY='baba-hakeem-last-order';
const money=n=>'Rs. '+Number(n||0).toLocaleString('en-PK',{maximumFractionDigits:2});

// Product prices and availability are authoritative only once published by admin.
const verifiedPrice=value=>{
  const normalized=String(value||'').toLowerCase().replace(/rs\.?|pkr|,|\s/g,'');
  return /^[0-9]+(\.[0-9]{1,2})?$/.test(normalized)&&Number(normalized)>0?Number(normalized):null;
};

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
  const [catalogue,setCatalogue]=useState(null);
  const [catalogueError,setCatalogueError]=useState('');
  useEffect(()=>{
    let alive=true;
    supabase.from('products').select('id,name,price,stock_quantity,stock_status,image')
      .eq('status','Published').order('created_at',{ascending:false}).then(({data,error})=>{
        if(!alive)return;
        if(error)setCatalogueError('Product availability could not be verified.');
        setCatalogue(error?[]:data||[]);
      });
    return()=>{alive=false;};
  },[]);
  const verifiedItems=useMemo(()=>items.map(item=>{
    const actual=catalogue?.find(p=>p.id===item.id||p.name.trim().toLowerCase()===item.name.trim().toLowerCase());
    const price=actual?verifiedPrice(actual.price):null;
    const available=!!actual&&price!==null&&actual.stock_status!=='Out of Stock'
      &&Number(actual.stock_quantity)>=item.quantity;
    return {...item,price,available,image:actual?.image||item.image};
  }),[items,catalogue]);
  const subtotal=useMemo(()=>verifiedItems.reduce((sum,i)=>sum+Number(i.price||0)*i.quantity,0),[verifiedItems]);
  const catalogueReady=catalogue!==null;
  const canCheckout=catalogueReady&&verifiedItems.length>0&&verifiedItems.every(i=>i.available);
  return {items:verifiedItems,ready,change,remove,subtotal,catalogueReady,catalogueError,canCheckout};
}

function CommerceProgress({step}){
  const steps=[{name:'Cart',detail:'Your selection'},{name:'Delivery & COD',detail:'Shipping details'},{name:'Order received',detail:'After submission'}];
  return <nav className={flow.progress} aria-label="Checkout progress">
    <span className={flow.progressLabel}>SECURE SHOPPING JOURNEY</span>
    <ol className={flow.progressSteps}>
      {steps.map((item,index)=>{
        const number=index+1;
        const active=number===step;
        const complete=number<step;
        return <li key={item.name} className={active?flow.activeStep:complete?flow.completeStep:flow.pendingStep}
          aria-current={active?'step':undefined}>
          <span className={flow.progressNumber}>{complete?'✓':String(number).padStart(2,'0')}</span>
          <span className={flow.progressCopy}><strong>{item.name}</strong><small>{item.detail}</small></span>
          {number!==steps.length&&<span className={flow.progressConnector} aria-hidden="true"/>}
        </li>;
      })}
    </ol>
    <span className={flow.secureFlag}><span aria-hidden="true">◇</span> SECURE COD CHECKOUT</span>
  </nav>;
}

function TrustStrip(){
  return <div className={flow.trustStrip} aria-label="Shopping assurances">
    <span><b aria-hidden="true">✓</b> Secure order request</span>
    <span><b aria-hidden="true">✦</b> Carefully prepared</span>
    <span><b aria-hidden="true">↗</b> WhatsApp assistance</span>
  </div>;
}

function SiteFrame({number,title,description,children,variant}){
  return <main className={variant==='thank-you'?`${styles.screen} ${styles.thankYouScreen}`:variant==='cart'||variant==='checkout'?`${styles.screen} ${flow.commerceScreen}`:styles.screen}>
    <div className={variant==='cart'||variant==='checkout'?`${styles.wrap} ${flow.commerceWrap}`:styles.wrap}>
      <header className={variant==='cart'||variant==='checkout'?`${styles.header} ${flow.commerceHeader}`:styles.header}><Link href="/" className={styles.logo}>BABA HAKEEM <small>HERBAL PRODUCTS</small></Link><Link href="/#reel-products" className={styles.return}>← CONTINUE SHOPPING</Link></header>
      {(variant==='cart'||variant==='checkout')&&<CommerceProgress step={variant==='cart'?1:2}/>}
      <div className={variant==='cart'||variant==='checkout'?`${styles.eyebrow} ${flow.commerceEyebrow}`:styles.eyebrow}>{number} / BABA HAKEEM SHOP</div>
      <h1 className={variant==='cart'||variant==='checkout'?`${styles.title} ${flow.commerceTitle}`:styles.title}>{title}</h1>
      <p className={variant==='cart'||variant==='checkout'?`${styles.description} ${flow.commerceDescription}`:styles.description}>{description}</p>
      {children}
      <footer className={styles.footer}>BABA HAKEEM HERBAL PRODUCTS <span>SECURE ORDER REQUEST / PAKISTAN</span></footer>
    </div>
  </main>;
}
function LineItems({items,change,remove,editable=false,modern=false}){
  return <div className={modern?`${styles.lines} ${flow.modernLines}`:styles.lines}>{items.map(item=>
    <article key={item.id} className={modern?`${styles.line} ${flow.modernLine}`:styles.line}>
      <div className={modern?`${styles.thumb} ${flow.productThumb}`:styles.thumb}>{item.image?<img src={item.image} alt={item.name} loading="lazy" decoding="async"/>:<span>BH</span>}</div>
      <div className={modern?`${styles.lineInfo} ${flow.productInfo}`:styles.lineInfo}><h3>{item.name}</h3><small>{item.price?money(item.price):'Price to be confirmed'}</small>{!item.available&&<p>Not yet available for online checkout</p>}
        {editable?<div className={styles.quantity}>
          <button type="button" onClick={()=>change(item.id,-1)} aria-label={'Decrease '+item.name}>−</button>
          <span>{item.quantity}</span>
          <button type="button" onClick={()=>change(item.id,1)} aria-label={'Increase '+item.name}>+</button>
        </div>:<p>Quantity: {item.quantity}</p>}
      </div>
      <div className={modern?`${styles.lineEnd} ${flow.productEnd}`:styles.lineEnd}><strong>{item.price?money(Number(item.price)*item.quantity):'On request'}</strong>
        {editable&&<button className={styles.remove} type="button" onClick={()=>remove(item.id)}>REMOVE</button>}
      </div>
    </article>
  )}</div>;
}

export function CartPage(){
  const {items,ready,change,remove,subtotal,catalogueReady,catalogueError,canCheckout}=useCart();
  return <SiteFrame variant="cart" number="01" title={<>YOUR <em>CART.</em></>} description="Your favourites, all in one place. Review your selection before we arrange delivery.">
    {!ready||!catalogueReady?<p className={styles.notice}>Verifying product availability…</p>:items.length===0?
      <section className={styles.empty}><h2>Your cart is empty.</h2><p>Explore the Baba Hakeem collection to get started.</p><Link className={styles.primary} href="/#reel-products">EXPLORE PRODUCTS →</Link></section>
      :<div className={`${styles.columns} ${flow.commerceColumns}`}>
        <section className={`${styles.panel} ${flow.mainPanel}`}>
          <div className={flow.sectionHeading}>
            <div><span className={flow.sectionOverline}>01 / YOUR SELECTION</span><h2>Shopping bag <small>({items.reduce((n,item)=>n+item.quantity,0)} items)</small></h2></div>
            <Link className={flow.continueLink} href="/#reel-products">KEEP SHOPPING ↗</Link>
          </div>
          <LineItems items={items} change={change} remove={remove} editable modern/>
          <div className={flow.cartNote}><span aria-hidden="true">✧</span><p>Every Baba Hakeem order is carefully reviewed before dispatch. You can update your quantities here.</p></div>
        </section>
        <aside className={`${styles.panel} ${flow.summaryPanel}`}>
          <span className={flow.sectionOverline}>02 / YOUR TOTAL</span>
          <h2>Order summary</h2>
          <div className={flow.summaryProducts}>
            {items.map(item=><div key={item.id}><span>{item.name} <small>× {item.quantity}</small></span><strong>{item.price?money(item.price*item.quantity):'On request'}</strong></div>)}
          </div>
          <div className={styles.summaryRow}><span>Product subtotal</span><b>{canCheckout?money(subtotal):'Price pending'}</b></div>
          <div className={flow.codBox}><span className={flow.codIcon} aria-hidden="true">✓</span><div><strong>Cash on Delivery</strong><p>Pay cash when your order arrives. No card details or advance payment required.</p></div></div>
          <p className={styles.muted}>Prices and available stock are verified from the approved catalogue. Any delivery charges will be confirmed before dispatch.</p>
          {catalogueError&&<p className={styles.muted}>{catalogueError}</p>}
          {canCheckout?<Link href="/checkout" className={styles.primary}>CONTINUE TO CHECKOUT <span aria-hidden="true">→</span></Link>:
            <p className={styles.muted}>Online ordering for this selection is not available yet. Please contact the store to confirm price and stock.</p>}
          {!canCheckout&&<a className={styles.primary} href="https://wa.me/923239992203" target="_blank" rel="noopener noreferrer">ASK ON WHATSAPP ↗</a>}
          <Link href="/#reel-products" className={styles.secondary}>CONTINUE SHOPPING</Link>
          <TrustStrip/>
        </aside>
      </div>}
  </SiteFrame>;
}

export function CheckoutPage(){
  const {items,ready,subtotal,catalogueReady,canCheckout}=useCart();
  const [customer,setCustomer]=useState({name:'',email:'',phone:'',city:'',address:'',notes:''});
  const [sending,setSending]=useState(false);
  const [error,setError]=useState('');
  const set=(key,value)=>setCustomer(prev=>({...prev,[key]:value}));
  const submit=async e=>{
    e.preventDefault();
    if(sending||!canCheckout)return;
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
  return <SiteFrame variant="checkout" number="02" title={<>DELIVERY <em>DETAILS.</em></>} description="Just a few details between you and your order. Checkout is secure and payment is Cash on Delivery.">
    {!ready||!catalogueReady?<p className={styles.notice}>Verifying checkout…</p>:items.length===0?
      <section className={styles.empty}><h2>Nothing to check out yet.</h2><Link href="/cart" className={styles.primary}>BACK TO CART →</Link></section>:!canCheckout?
      <section className={styles.empty}><h2>Online checkout isn't ready for these products.</h2><p>Please confirm prices and stock with the store. No order has been placed.</p><Link href="/cart" className={styles.primary}>REVIEW YOUR CART →</Link></section>:
      <div className={`${styles.columns} ${flow.commerceColumns}`}>
        <section className={`${styles.panel} ${flow.mainPanel}`}>
          <div className={flow.sectionHeading}><div><span className={flow.sectionOverline}>01 / SHIPPING INFORMATION</span><h2>Delivery information</h2><p>Where should we send your Baba Hakeem order?</p></div></div>
          <form className={`${styles.form} ${flow.deliveryForm}`} onSubmit={submit}>
            <label>FULL NAME *<input autoComplete="name" required minLength={2} maxLength={120} value={customer.name} onChange={e=>set('name',e.target.value)}/></label>
            <label>EMAIL (FOR ORDER UPDATES)<input type="email" autoComplete="email" maxLength={254} value={customer.email} onChange={e=>set('email',e.target.value)}/></label>
            <div className={styles.formRow}>
              <label>PHONE NUMBER *<input autoComplete="tel" inputMode="tel" required minLength={7} maxLength={24} value={customer.phone} onChange={e=>set('phone',e.target.value)}/></label>
              <label>CITY *<input autoComplete="address-level2" required minLength={2} maxLength={120} value={customer.city} onChange={e=>set('city',e.target.value)}/></label>
            </div>
            <label>COMPLETE DELIVERY ADDRESS *<textarea autoComplete="street-address" required minLength={8} maxLength={500} rows={3} value={customer.address} onChange={e=>set('address',e.target.value)}/></label>
            <label>ORDER NOTES (OPTIONAL)<textarea maxLength={1000} rows={2} value={customer.notes} onChange={e=>set('notes',e.target.value)}/></label>
            <div className={flow.formSubheading}><span className={flow.sectionOverline}>02 / PAYMENT OPTION</span><h3>How you'll pay</h3></div>
            <div className={`${styles.payment} ${flow.paymentChoice}`}>
              <span className={flow.paymentCheck} aria-hidden="true">✓</span>
              <div><strong>Cash on Delivery (COD)</strong><p>Pay in cash when your order is delivered. Your request is reviewed by Baba Hakeem before dispatch. Any delivery charges will be confirmed by the store beforehand; no online payment is collected.</p></div>
              <span className={flow.paymentTag}>SELECTED</span>
            </div>
            {error&&<div className={styles.error} role="alert">{error} <Link href="/cart">Review cart</Link></div>}
            <button className={styles.primary} disabled={sending} type="submit">{sending?'PLACING ORDER…' :'PLACE COD ORDER →'}</button>
            <p className={flow.formDisclaimer}>By placing the order you submit a COD order request. The store will confirm delivery and any charges before dispatch.</p>
          </form>
        </section>
        <aside className={`${styles.panel} ${flow.summaryPanel}`}>
          <span className={flow.sectionOverline}>03 / REVIEW YOUR ORDER</span>
          <h2>Your order</h2>
          <LineItems items={items} modern/>
          <div className={styles.summaryRow}><span>Product subtotal</span><b>{money(subtotal)}</b></div>
          <div className={flow.codBox}><span className={flow.codIcon} aria-hidden="true">✓</span><div><strong>Cash on Delivery</strong><p>Pay when your parcel reaches you. Delivery charges, if any, are confirmed before dispatch.</p></div></div>
          <Link className={styles.secondary} href="/cart">← EDIT CART</Link>
          <TrustStrip/>
        </aside>
      </div>}
  </SiteFrame>;
}

export function ThankYouPage(){
  const [receipt,setReceipt]=useState(null);
  const [checked,setChecked]=useState(false);
  const [copyState,setCopyState]=useState('idle');

  useEffect(()=>{
    try{
      const order=new URLSearchParams(window.location.search).get('order');
      const saved=JSON.parse(sessionStorage.getItem(RECEIPT_KEY)||'null');
      if(saved?.order_number&&saved.order_number===order)setReceipt(saved);
    }catch{}
    finally{setChecked(true);}
  },[]);

  const copyReference=async()=>{
    if(!receipt?.order_number)return;
    try{
      await navigator.clipboard.writeText(receipt.order_number);
      setCopyState('copied');
    }catch{
      setCopyState('unavailable');
    }
  };

  return <SiteFrame variant="thank-you" number="03"
    title={<>THANK <em>YOU.</em></>}
    description="A little care goes a long way. Thank you for choosing Baba Hakeem.">
    {!checked?<section className={styles.receiptLoading} aria-live="polite">Preparing your confirmation…</section>:
    receipt?<div className={styles.thankYouGrid}>
      <section className={styles.receiptCard} aria-labelledby="order-received-heading">
        <div className={styles.receiptTop}>
          <span className={styles.receiptBrand}>BH <span>BABA HAKEEM <small>HERBAL PRODUCTS</small></span></span>
          <span className={styles.receiptStatus}><span className={styles.statusDot}/> REQUEST RECEIVED</span>
        </div>
        <div className={styles.successVisual} aria-hidden="true">
          <span className={styles.successHalo}/>
          <span className={styles.successOrbit}/>
          <span className={styles.successSeal}>
            <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path d="M15 33L27 45L49 20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span className={styles.successSparkOne}/>
          <span className={styles.successSparkTwo}/>
        </div>
        <p className={styles.receiptKicker}>01 / ORDER REQUEST SAVED</p>
        <h2 id="order-received-heading" className={styles.receiptHeading}>Your order is in <em>good hands.</em></h2>
        <p className={styles.receiptIntro}>We've received your Cash on Delivery order request. Our team will review the details and confirm availability and delivery before dispatch.</p>
        <div className={styles.orderReference}>
          <span>YOUR ORDER REFERENCE</span>
          <div>
            <strong>{receipt.order_number}</strong>
            <button type="button" onClick={copyReference} className={styles.copyReference}
              aria-label="Copy order reference" title="Copy order reference">
              {copyState==='copied'?'COPIED ✓':copyState==='unavailable'?'COPY UNAVAILABLE':'COPY ↗'}
            </button>
          </div>
          <small role="status" aria-live="polite">
            {copyState==='copied'?'Reference copied to clipboard.':copyState==='unavailable'?'Please select and copy the reference above.':'Keep this number for order-related enquiries.'}
          </small>
        </div>
        <div className={styles.receiptDetails}>
          <div><span>PRODUCT SUBTOTAL</span><strong>{money(receipt.total_amount)}</strong></div>
          <div><span>PAYMENT METHOD</span><strong>Cash on Delivery</strong></div>
          {Number(receipt.item_count)>0&&<div><span>ITEMS ORDERED</span><strong>{receipt.item_count}</strong></div>}
        </div>
        <div className={styles.paymentReminder}>
          <span aria-hidden="true">✓</span>
          <p><b>No payment taken online.</b> Pay cash on delivery. Any delivery charges will be confirmed by the store before dispatch.</p>
        </div>
      </section>
      <aside className={styles.nextStepsCard} aria-label="What happens next">
        <div className={styles.nextStepsHead}><span>THE NEXT CHAPTER</span><span>03 / 03</span></div>
        <h3>From our store <em>to your door.</em></h3>
        <p className={styles.nextStepsIntro}>Your request is on its way through our order process. Here is what comes next.</p>
        <ol className={styles.orderJourney}>
          <li className={styles.journeyDone}>
            <span className={styles.journeyNumber}>01</span>
            <div><strong>Request received</strong><p>Saved securely with your order reference.</p><small>COMPLETED ✓</small></div>
          </li>
          <li>
            <span className={styles.journeyNumber}>02</span>
            <div><strong>Store confirmation</strong><p>Our team reviews your details, stock and delivery.</p><small>AWAITING CONFIRMATION</small></div>
          </li>
          <li>
            <span className={styles.journeyNumber}>03</span>
            <div><strong>Delivery &amp; payment</strong><p>Pay cash when your parcel arrives.</p><small>UPCOMING</small></div>
          </li>
        </ol>
        <div className={styles.thankYouActions}>
          <Link href="/#reel-products" className={styles.exploreAgain}>CONTINUE EXPLORING <span aria-hidden="true">↗</span></Link>
          <a href="https://wa.me/923239992203" target="_blank" rel="noopener noreferrer"
            className={styles.supportLink}>NEED HELP? WHATSAPP <span aria-hidden="true">↗</span></a>
        </div>
      </aside>
    </div>:
    <section className={styles.receiptMissing}>
      <span className={styles.receiptMissingIcon} aria-hidden="true">BH</span>
      <p className={styles.receiptKicker}>ORDER LOOKUP</p>
      <h2>Looking for an order?</h2>
      <p>A confirmation appears here after checkout on this device. If you have an order reference, keep it ready when contacting the store.</p>
      <div className={styles.missingActions}>
        <Link className={styles.exploreAgain} href="/#reel-products">BROWSE PRODUCTS <span aria-hidden="true">↗</span></Link>
        <a className={styles.supportLink} href="https://wa.me/923239992203" target="_blank" rel="noopener noreferrer">CONTACT ON WHATSAPP ↗</a>
      </div>
    </section>}
  </SiteFrame>;
}
