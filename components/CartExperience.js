'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './CartExperience.module.css';

const STORAGE_KEY='baba-hakeem-cart-v1';
const money=value=>value==null?'Price on request':`Rs. ${Number(value).toLocaleString('en-PK')}`;
const slug=value=>String(value||'product').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function CartExperience(){
  const [items,setItems]=useState([]);
  const [open,setOpen]=useState(false);
  const [hydrated,setHydrated]=useState(false);
  const [flash,setFlash]=useState(false);

  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
      if(Array.isArray(saved))setItems(saved.filter(item=>item&&item.name&&item.quantity>0));
    }catch{}
    setHydrated(true);
  },[]);

  useEffect(()=>{
    if(!hydrated)return;
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items));}catch{}
  },[items,hydrated]);

  useEffect(()=>{
    const catalogue=document.querySelector('.static-reference-site .ref-product-grid');
    if(!catalogue)return;
    const knownPrices={
      'Hair Oil':1200,
      'Joint Oil':1800,
      'Stomach Phakki':1250,
      'Herbal Phakki':1450,
      "Men's Oil":2200
    };
    const enhance=()=>{
      catalogue.querySelectorAll(':scope > article').forEach(article=>{
        if(article.querySelector('[data-cart-add]'))return;
        const name=article.querySelector('h3')?.textContent?.trim();
        const visual=article.querySelector(':scope > div:first-child');
        if(!name||!visual)return;
        const image=article.querySelector('img')?.getAttribute('src')||'';
        const button=document.createElement('button');
        button.type='button';
        button.className='ref-cart-add';
        button.dataset.cartAdd='true';
        button.dataset.cartId=slug(name);
        button.dataset.cartName=name;
        button.dataset.cartImage=image;
        if(knownPrices[name])button.dataset.cartPrice=String(knownPrices[name]);
        button.setAttribute('aria-label',`Add ${name} to cart`);
        button.textContent='Add';
        visual.appendChild(button);
      });
    };
    enhance();
    const observer=new MutationObserver(()=>requestAnimationFrame(enhance));
    observer.observe(catalogue,{childList:true});
    const stop=window.setTimeout(()=>observer.disconnect(),6000);
    return()=>{window.clearTimeout(stop);observer.disconnect();};
  },[]);

  useEffect(()=>{
    const onClick=event=>{
      const button=event.target.closest?.('[data-cart-add]');
      if(!button)return;
      event.preventDefault();
      event.stopPropagation();
      const name=button.dataset.cartName||'Baba Hakeem Product';
      const rawPrice=Number(button.dataset.cartPrice);
      const price=Number.isFinite(rawPrice)&&rawPrice>0?rawPrice:null;
      const image=button.dataset.cartImage||'';
      const id=button.dataset.cartId||slug(name);
      setItems(current=>{
        const existing=current.find(item=>item.id===id);
        if(existing)return current.map(item=>item.id===id?{...item,quantity:Math.min(99,item.quantity+1),name,price,image}:item);
        return [...current,{id,name,price,image,quantity:1}];
      });
      setFlash(true);
      window.setTimeout(()=>setFlash(false),420);
      button.classList.add('is-added');
      window.setTimeout(()=>button.classList.remove('is-added'),520);
    };
    document.addEventListener('click',onClick);
    return()=>document.removeEventListener('click',onClick);
  },[]);

  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=event=>{if(event.key==='Escape')setOpen(false);};
    window.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey);};
  },[open]);

  const count=useMemo(()=>items.reduce((sum,item)=>sum+item.quantity,0),[items]);
  const subtotal=useMemo(()=>items.reduce((sum,item)=>sum+(item.price||0)*item.quantity,0),[items]);
  const hasUnpriced=items.some(item=>item.price==null);

  const change=(id,delta)=>setItems(current=>current.flatMap(item=>{
    if(item.id!==id)return [item];
    const quantity=item.quantity+delta;
    return quantity>0?[{...item,quantity:Math.min(99,quantity)}]:[];
  }));
  const remove=id=>setItems(current=>current.filter(item=>item.id!==id));

  const orderWhatsApp=()=>{
    if(!items.length)return;
    const lines=['Assalam-o-Alaikum Baba Hakeem, I would like to order:',''];
    items.forEach(item=>lines.push(`• ${item.name} × ${item.quantity}${item.price?` — ${money(item.price*item.quantity)}`:''}`));
    lines.push('');
    if(subtotal)lines.push(`Subtotal: ${money(subtotal)}`);
    if(hasUnpriced)lines.push('Please confirm the final price for the item(s) marked price on request.');
    lines.push('Please confirm availability and Cash on Delivery details.');
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(lines.join('\n'))}`,'_blank','noopener,noreferrer');
  };

  return <>
    <button className={`${styles.floatingCart} ${flash?styles.flash:''}`} type="button" onClick={()=>setOpen(true)} aria-label={`Open cart with ${count} items`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.25h11l-.8 11H7.3l-.8-11Z"/><path d="M9 9V6.5a3 3 0 0 1 6 0V9"/></svg>
      <span>Cart</span><b>{count}</b>
    </button>

    <div className={`${styles.backdrop} ${open?styles.backdropOpen:''}`} onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}} aria-hidden={!open}>
      <aside className={`${styles.drawer} ${open?styles.drawerOpen:''}`} role="dialog" aria-modal="true" aria-label="Shopping cart">
        <header className={styles.header}>
          <div><small>YOUR SELECTION</small><h2>Cart <span>{count}</span></h2></div>
          <button type="button" onClick={()=>setOpen(false)} aria-label="Close cart">×</button>
        </header>

        <div className={styles.items}>
          {!items.length?<div className={styles.empty}><span>01 / CART</span><h3>Your cart is empty.</h3><p>Add products from the collection and they will appear here without leaving the page.</p><button onClick={()=>{setOpen(false);document.querySelector('#reel-products')?.scrollIntoView({behavior:'smooth'});}}>EXPLORE PRODUCTS</button></div>:
          items.map(item=><article className={styles.item} key={item.id}>
            <div className={styles.thumb}>{item.image?<img src={item.image} alt="" loading="lazy" decoding="async"/>:<span>BH</span>}</div>
            <div className={styles.itemInfo}><h3>{item.name}</h3><p>{money(item.price)}</p><div className={styles.stepper}><button onClick={()=>change(item.id,-1)} aria-label={`Decrease ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={()=>change(item.id,1)} aria-label={`Increase ${item.name}`}>+</button></div></div>
            <div className={styles.itemSide}><strong>{item.price?money(item.price*item.quantity):'On request'}</strong><button onClick={()=>remove(item.id)}>REMOVE</button></div>
          </article>)}
        </div>

        {!!items.length&&<footer className={styles.footer}>
          <div className={styles.subtotal}><span>SUBTOTAL</span><strong>{subtotal?money(subtotal):'Confirm on WhatsApp'}</strong></div>
          {hasUnpriced&&<p>Final total will be confirmed for products without a listed price.</p>}
          <button className={styles.checkout} onClick={orderWhatsApp}>ORDER ON WHATSAPP <span>↗</span></button>
          <small>Cash on Delivery • Pakistan delivery • Final availability confirmed on WhatsApp</small>
        </footer>}
      </aside>
    </div>
  </>;
}
