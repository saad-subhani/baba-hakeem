'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './CartExperience.module.css';
import quick from './ProductQuickView.module.css';

const STORAGE_KEY='baba-hakeem-cart-v1';
const WHATSAPP='923239992203';
const money=value=>value==null?'Price on request':`Rs. ${Number(value).toLocaleString('en-PK')}`;
const slug=value=>String(value||'product').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const catalogueInfo={
  'Hair Oil':{price:1200,kicker:'Hair Care',desc:'Herbal hair care for a considered everyday routine.'},
  'Joint Oil':{price:1800,kicker:'Topical Care',desc:'Focused massage oil for a simple everyday care ritual.',image:'/joint-oil-4k.png'},
  'Stomach Phakki':{price:1250,kicker:'Traditional Blend',desc:'A traditional herbal blend presented for familiar daily use.'},
  'Herbal Phakki':{price:1450,kicker:'Herbal Wellness',desc:'A familiar herbal blend from the Baba Hakeem collection.'},
  "Men's Oil":{price:2200,kicker:"Men's Care",desc:'Personal care oil presented with a simple daily ritual.'},
  'Zafran':{price:null,kicker:'Premium Saffron',desc:'Premium saffron selected as part of the Baba Hakeem collection.'},
  'Wedding Course':{price:3500,kicker:'Premium Personal Care',desc:'A premium personal care collection prepared as a considered gifting and daily-care set.',image:'/products/wedding-course.webp.png'}
};

export default function CartExperience(){
  const [items,setItems]=useState([]);
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState(null);
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

    const enhance=()=>{
      catalogue.querySelectorAll(':scope > article').forEach(article=>{
        if(article.querySelector(':scope > .ref-commerce-meta'))return;
        const name=article.querySelector('h3')?.textContent?.trim();
        const visual=article.querySelector(':scope > div:first-child')||article.querySelector(':scope > a > div:first-child');
        if(!name||!visual)return;
        article.querySelectorAll('[data-cart-add]').forEach(node=>node.remove());
        const info=catalogueInfo[name]||{price:null,kicker:'Baba Hakeem Collection',desc:'Explore this product from the Baba Hakeem herbal collection.'};
        const image=article.querySelector('img')?.getAttribute('src')||info.image||'';
        const id=slug(name);
        article.dataset.productCard=id;
        article.style.cursor='pointer';

        const meta=document.createElement('div');
        meta.className='ref-commerce-meta';
        meta.dataset.cartId=id;
        meta.dataset.cartName=name;
        meta.dataset.cartImage=image;
        meta.dataset.cartKicker=info.kicker;
        meta.dataset.cartDesc=info.desc;
        if(info.price)meta.dataset.cartPrice=String(info.price);

        const kicker=document.createElement('p');
        kicker.className='ref-commerce-kicker';
        kicker.textContent=info.kicker;
        const desc=document.createElement('p');
        desc.className='ref-commerce-desc';
        desc.textContent=info.desc;
        const bottom=document.createElement('div');
        bottom.className='ref-commerce-bottom';
        const price=document.createElement('div');
        price.className='ref-commerce-price';
        const priceLabel=document.createElement('small');
        priceLabel.textContent='Price';
        const priceValue=document.createElement('strong');
        priceValue.textContent=money(info.price);
        price.append(priceLabel,priceValue);
        const actions=document.createElement('div');
        actions.className='ref-commerce-actions';
        actions.dataset.cartActions=id;
        const whatsapp=document.createElement('a');
        whatsapp.className='ref-card-whatsapp';
        whatsapp.href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Assalam-o-Alaikum Baba Hakeem, I want to ask about ${name}.`)}`;
        whatsapp.target='_blank';
        whatsapp.rel='noopener noreferrer';
        whatsapp.setAttribute('aria-label',`Ask about ${name} on WhatsApp`);
        whatsapp.textContent='↗';
        actions.appendChild(whatsapp);
        bottom.append(price,actions);
        meta.append(kicker,desc,bottom);
        article.appendChild(meta);
      });
    };

    enhance();
    let enhanceFrame=0;
    const scheduleEnhance=()=>{
      if(enhanceFrame)return;
      enhanceFrame=requestAnimationFrame(()=>{
        enhanceFrame=0;
        enhance();
      });
    };
    const observer=new MutationObserver(scheduleEnhance);
    observer.observe(catalogue,{childList:true,subtree:false});
    const stop=window.setTimeout(()=>observer.disconnect(),6000);
    return()=>{
      window.clearTimeout(stop);
      observer.disconnect();
      if(enhanceFrame)cancelAnimationFrame(enhanceFrame);
    };
  },[]);

  useEffect(()=>{
    document.querySelectorAll('.ref-commerce-meta').forEach(meta=>{
      const id=meta.dataset.cartId;
      const actions=meta.querySelector('.ref-commerce-actions');
      if(!id||!actions)return;
      const whatsapp=actions.querySelector('.ref-card-whatsapp');
      actions.querySelectorAll('.ref-cart-add,.ref-card-stepper').forEach(node=>node.remove());
      const item=items.find(entry=>entry.id===id);
      if(item){
        const stepper=document.createElement('div');
        stepper.className='ref-card-stepper';
        const minus=document.createElement('button');
        minus.type='button';minus.dataset.cartAction='decrease';minus.dataset.cartId=id;minus.setAttribute('aria-label',`Decrease ${item.name}`);minus.textContent='−';
        const qty=document.createElement('span');qty.textContent=String(item.quantity);
        const plus=document.createElement('button');
        plus.type='button';plus.dataset.cartAction='increase';plus.dataset.cartId=id;plus.setAttribute('aria-label',`Increase ${item.name}`);plus.textContent='+';
        stepper.append(minus,qty,plus);
        actions.insertBefore(stepper,whatsapp||null);
      }else{
        const add=document.createElement('button');
        add.type='button';add.className='ref-cart-add';add.dataset.cartAction='add';add.dataset.cartId=id;add.textContent='Add to cart';add.setAttribute('aria-label',`Add ${meta.dataset.cartName||'product'} to cart`);
        actions.insertBefore(add,whatsapp||null);
      }
    });
  },[items]);

  useEffect(()=>{
    const onClick=event=>{
      const control=event.target.closest?.('[data-cart-action]');
      if(control){
        event.preventDefault();
        event.stopPropagation();
        const id=control.dataset.cartId;
        const action=control.dataset.cartAction;
        if(!id)return;
        if(action==='increase'||action==='decrease'){
          const delta=action==='increase'?1:-1;
          setItems(current=>current.flatMap(item=>{
            if(item.id!==id)return [item];
            const quantity=item.quantity+delta;
            return quantity>0?[{...item,quantity:Math.min(99,quantity)}]:[];
          }));
          return;
        }
        if(action!=='add')return;
        const meta=control.closest('.ref-commerce-meta');
        if(!meta)return;
        const name=meta.dataset.cartName||'Baba Hakeem Product';
        const rawPrice=Number(meta.dataset.cartPrice);
        const price=Number.isFinite(rawPrice)&&rawPrice>0?rawPrice:null;
        const image=meta.dataset.cartImage||'';
        setItems(current=>{
          const existing=current.find(item=>item.id===id);
          if(existing)return current.map(item=>item.id===id?{...item,quantity:Math.min(99,item.quantity+1),name,price,image}:item);
          return [...current,{id,name,price,image,quantity:1}];
        });
        setFlash(true);
        window.setTimeout(()=>setFlash(false),420);
        return;
      }

      if(event.target.closest?.('.ref-card-whatsapp'))return;
      const article=event.target.closest?.('.static-reference-site .ref-product-grid>article');
      if(!article)return;
      const meta=article.querySelector('.ref-commerce-meta');
      if(!meta)return;
      if(event.target.closest('a'))event.preventDefault();
      const rawPrice=Number(meta.dataset.cartPrice);
      setSelected({
        id:meta.dataset.cartId,
        name:meta.dataset.cartName||'Baba Hakeem Product',
        image:meta.dataset.cartImage||'',
        kicker:meta.dataset.cartKicker||'Baba Hakeem Collection',
        desc:meta.dataset.cartDesc||'Explore this product from the Baba Hakeem herbal collection.',
        price:Number.isFinite(rawPrice)&&rawPrice>0?rawPrice:null
      });
    };
    document.addEventListener('click',onClick);
    return()=>document.removeEventListener('click',onClick);
  },[]);

  useEffect(()=>{
    if(!open&&!selected)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=event=>{if(event.key==='Escape'){if(selected)setSelected(null);else setOpen(false);}};
    window.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey);};
  },[open,selected]);

  const count=useMemo(()=>items.reduce((sum,item)=>sum+item.quantity,0),[items]);
  const subtotal=useMemo(()=>items.reduce((sum,item)=>sum+(item.price||0)*item.quantity,0),[items]);
  const hasUnpriced=items.some(item=>item.price==null);
  const selectedCartItem=selected?items.find(item=>item.id===selected.id):null;

  const change=(id,delta)=>setItems(current=>current.flatMap(item=>{
    if(item.id!==id)return [item];
    const quantity=item.quantity+delta;
    return quantity>0?[{...item,quantity:Math.min(99,quantity)}]:[];
  }));
  const remove=id=>setItems(current=>current.filter(item=>item.id!==id));
  const addProduct=product=>{
    if(!product)return;
    setItems(current=>{
      const existing=current.find(item=>item.id===product.id);
      if(existing)return current.map(item=>item.id===product.id?{...item,quantity:Math.min(99,item.quantity+1),name:product.name,price:product.price,image:product.image}:item);
      return [...current,{id:product.id,name:product.name,price:product.price,image:product.image,quantity:1}];
    });
    setFlash(true);
    window.setTimeout(()=>setFlash(false),420);
  };

  const orderWhatsApp=()=>{
    if(!items.length)return;
    const lines=['Assalam-o-Alaikum Baba Hakeem, I would like to order:',''];
    items.forEach(item=>lines.push(`• ${item.name} × ${item.quantity}${item.price?` — ${money(item.price*item.quantity)}`:''}`));
    lines.push('');
    if(subtotal)lines.push(`Subtotal: ${money(subtotal)}`);
    if(hasUnpriced)lines.push('Please confirm the final price for the item(s) marked price on request.');
    lines.push('Please confirm availability and Cash on Delivery details.');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`,'_blank','noopener,noreferrer');
  };

  return <>
    <button className={`${styles.floatingCart} ${flash?styles.flash:''}`} type="button" onClick={()=>setOpen(true)} aria-label={`Open cart with ${count} items`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.25h11l-.8 11H7.3l-.8-11Z"/><path d="M9 9V6.5a3 3 0 0 1 6 0V9"/></svg>
      <span>Cart</span><b>{count}</b>
    </button>

    <div className={`${quick.overlay} ${selected?quick.open:''}`} onMouseDown={event=>{if(event.target===event.currentTarget)setSelected(null)}} aria-hidden={!selected}>
      {selected&&<section className={quick.modal} role="dialog" aria-modal="true" aria-label={`${selected.name} product details`}>
        <button className={quick.close} type="button" onClick={()=>setSelected(null)} aria-label="Close product details">×</button>
        <div className={quick.head}><p className={quick.eyebrow}>{selected.kicker}</p><h2>{selected.name}</h2><p>Premium Baba Hakeem product</p></div>
        <div className={quick.visual}>{selected.image?<img src={selected.image} alt={selected.name} decoding="async"/>:<span>BH</span>}</div>
        <div className={quick.body}>
          <p className={quick.description}>{selected.desc}</p>
          <div className={quick.priceRow}><div><small>Price</small><strong>{money(selected.price)}</strong></div><a className={quick.whatsapp} href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Assalam-o-Alaikum Baba Hakeem, I want to ask about ${selected.name}.`)}`} target="_blank" rel="noopener noreferrer">Ask on WhatsApp ↗</a></div>
          <div className={quick.actions}>{selectedCartItem?<div className={quick.stepper}><button type="button" onClick={()=>change(selected.id,-1)} aria-label={`Decrease ${selected.name}`}>−</button><span>{selectedCartItem.quantity}</span><button type="button" onClick={()=>change(selected.id,1)} aria-label={`Increase ${selected.name}`}>+</button></div>:<button className={quick.add} type="button" onClick={()=>addProduct(selected)}>Add to cart</button>}</div>
          <small className={quick.note}>Cash on Delivery • Pakistan delivery • Availability confirmed on WhatsApp</small>
        </div>
      </section>}
    </div>

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
