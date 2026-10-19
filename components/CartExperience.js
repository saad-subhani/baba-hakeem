'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './CartExperience.module.css';
import quick from './ProductQuickView.module.css';
import {supabase} from '../lib/supabase';
import {publishedProductByName,verifiedProductPrice,productStock,productCanOrder} from '../lib/storefrontCatalogue.mjs';

const STORAGE_KEY='baba-hakeem-cart-v1';
const WHATSAPP='923239992203';
const money=value=>value==null?'Price on request':`Rs. ${Number(value).toLocaleString('en-PK')}`;
const slug=value=>String(value||'product').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const catalogueInfo={
  'Hair Oil':{kicker:'Hair Care',desc:'Herbal hair care for a considered everyday routine.'},
  'Joint Oil':{kicker:'Topical Care',desc:'Focused massage oil for a simple everyday care ritual.',image:'/joint-oil-4k.png'},
  'Stomach Phakki':{kicker:'Traditional Blend',desc:'A traditional herbal blend presented for familiar daily use.'},
  'Herbal Phakki':{kicker:'Herbal Wellness',desc:'A familiar herbal blend from the Baba Hakeem collection.'},
  "Men's Oil":{kicker:"Men's Care",desc:'Personal care oil presented with a simple daily ritual.'},
  'Zafran':{price:null,kicker:'Premium Saffron',desc:'Premium saffron selected as part of the Baba Hakeem collection.'},
  'Wedding Course':{kicker:'Premium Personal Care',desc:'A premium personal care collection prepared as a considered gifting and daily-care set.',image:'/products/wedding-course.webp.png'}
};

export default function CartExperience(){
  const [items,setItems]=useState([]);
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState(null);
  const [hydrated,setHydrated]=useState(false);
  const [flash,setFlash]=useState(false);
  const [publishedProducts,setPublishedProducts]=useState(null);

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

  // Keep the existing floating cart in sync with the new cart/checkout routes.
  useEffect(()=>{
    const sync=()=>{
      try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');if(Array.isArray(saved))setItems(saved.filter(item=>item&&item.name&&item.quantity>0));}catch{}
    };
    window.addEventListener('baba-cart-sync',sync);
    window.addEventListener('storage',sync);
    return()=>{window.removeEventListener('baba-cart-sync',sync);window.removeEventListener('storage',sync);};
  },[]);

  // Refresh the published catalogue after page load and whenever a shopper
  // returns to the tab. No placeholder price is treated as an approved price.
  useEffect(()=>{
    let active=true;
    let latestRequest=0;
    const load=async()=>{
      const request=++latestRequest;
      try{
        const {data,error}=await supabase.from('products')
          .select('id,name,price,image,category,description,stock_quantity,stock_status,status,created_at')
          .eq('status','Published').order('created_at',{ascending:false});
        if(active&&request===latestRequest)setPublishedProducts(error?[]:(data||[]));
      }catch{if(active&&request===latestRequest)setPublishedProducts([]);}
    };
    load();
    const onVisible=()=>{if(document.visibilityState==='visible')load();};
    window.addEventListener('focus',load);
    document.addEventListener('visibilitychange',onVisible);
    return()=>{
      active=false;
      window.removeEventListener('focus',load);
      document.removeEventListener('visibilitychange',onVisible);
    };
  },[]);

  // Preserve the original six card nodes (including the hero bottle target and
  // Men's Oil GSAP image); only their commerce content follows Admin-published data.
  useEffect(()=>{
    const catalogue=document.querySelector('.static-reference-site .ref-product-grid');
    if(!catalogue)return;
    const enhance=()=>{
      let addedCard=false;
      catalogue.querySelectorAll(':scope > article').forEach(article=>{
        const name=article.querySelector('h3')?.textContent?.trim();
        const visual=article.querySelector(':scope > div:first-child')||article.querySelector(':scope > a > div:first-child');
        if(!name||!visual)return;
        const original=catalogueInfo[name]||{kicker:'Baba Hakeem Collection',desc:'Explore this product from the Baba Hakeem herbal collection.'};
        const live=publishedProductByName(publishedProducts,name);
        const verified=live?verifiedProductPrice(live.price):null;
        const stock=productStock(live);
        const available=productCanOrder(live);
        const imageTag=visual.querySelector('img');
        // Never replace or reposition these two animation anchors.
        const animated=!!(visual.classList.contains('ref-joint-target')||imageTag?.classList.contains('ref-mens-moving'));
        if(imageTag&&!animated){
          if(!imageTag.dataset.originalCatalogueSrc)
            imageTag.dataset.originalCatalogueSrc=imageTag.getAttribute('src')||'';
          const desired=live?.image||imageTag.dataset.originalCatalogueSrc;
          if(desired&&imageTag.getAttribute('src')!==desired)imageTag.setAttribute('src',desired);
        }
        const image=live?.image||imageTag?.getAttribute('src')||original.image||'';
        const id=slug(name); // Keep existing saved cart IDs working across updates.
        article.dataset.productCard=id;
        article.style.cursor='pointer';

        let meta=article.querySelector(':scope > .ref-commerce-meta');
        if(!meta){
          addedCard=true;
          meta=document.createElement('div');
          meta.className='ref-commerce-meta';
          const kicker=document.createElement('p');kicker.className='ref-commerce-kicker';
          const desc=document.createElement('p');desc.className='ref-commerce-desc';
          const bottom=document.createElement('div');bottom.className='ref-commerce-bottom';
          const price=document.createElement('div');price.className='ref-commerce-price';
          const label=document.createElement('small'),value=document.createElement('strong');
          price.append(label,value);
          const actions=document.createElement('div');actions.className='ref-commerce-actions';
          const whatsapp=document.createElement('a');whatsapp.className='ref-card-whatsapp';
          whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';whatsapp.textContent='↗';
          actions.append(whatsapp);bottom.append(price,actions);
          meta.append(kicker,desc,bottom);article.appendChild(meta);
        }
        const kickerText=live?.category||original.kicker;
        const description=live?.description||original.desc;
        meta.dataset.cartId=id;
        meta.dataset.cartName=live?.name||name;
        meta.dataset.cartImage=image;
        meta.dataset.cartKicker=kickerText;
        meta.dataset.cartDesc=description;
        meta.dataset.cartAvailable=String(available);
        meta.dataset.cartPublished=String(!!live);
        meta.dataset.cartStock=String(stock);
        if(verified!==null)meta.dataset.cartPrice=String(verified);
        else delete meta.dataset.cartPrice;
        meta.querySelector('.ref-commerce-kicker').textContent=kickerText;
        meta.querySelector('.ref-commerce-desc').textContent=description;
        meta.querySelector('.ref-commerce-price small').textContent=
          live?(stock>0?'Price · '+stock+' in stock':'Price · Out of stock'):'Price · Ask on WhatsApp';
        meta.querySelector('.ref-commerce-price strong').textContent=money(verified);
        const whatsapp=meta.querySelector('.ref-card-whatsapp');
        whatsapp.href='https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent('Assalam-o-Alaikum Baba Hakeem, I want to ask about '+name+'.');
        whatsapp.setAttribute('aria-label','Ask about '+name+' on WhatsApp');
      });
      if(addedCard)window.dispatchEvent(new Event('baba-catalogue-cards-changed'));
    };
    enhance();
    let frame=0;
    const onMutation=()=>{
      if(frame)return;
      frame=requestAnimationFrame(()=>{frame=0;enhance();});
    };
    const observer=new MutationObserver(onMutation);
    observer.observe(catalogue,{childList:true,subtree:false});
    return()=>{observer.disconnect();if(frame)cancelAnimationFrame(frame);};
  },[publishedProducts]);

  useEffect(()=>{
    const updateControls=()=>document.querySelectorAll('.ref-commerce-meta').forEach(meta=>{
      const id=meta.dataset.cartId;
      const actions=meta.querySelector('.ref-commerce-actions');
      if(!id||!actions)return;
      const whatsapp=actions.querySelector('.ref-card-whatsapp');
      actions.querySelectorAll('.ref-cart-add,.ref-card-stepper').forEach(node=>node.remove());
      const item=items.find(entry=>entry.id===id);
      const live=publishedProductByName(publishedProducts,meta.dataset.cartName);
      const maximum=productStock(live);
      const canAdd=productCanOrder(live);
      if(item){
        const stepper=document.createElement('div');
        stepper.className='ref-card-stepper';
        const minus=document.createElement('button');
        minus.type='button';minus.dataset.cartAction='decrease';minus.dataset.cartId=id;minus.setAttribute('aria-label','Decrease '+item.name);minus.textContent='−';
        const qty=document.createElement('span');qty.textContent=String(item.quantity);
        const plus=document.createElement('button');
        plus.type='button';plus.dataset.cartAction='increase';plus.dataset.cartId=id;plus.setAttribute('aria-label','Increase '+item.name);plus.textContent='+';
        plus.disabled=!canAdd||item.quantity>=maximum;
        stepper.append(minus,qty,plus);
        actions.insertBefore(stepper,whatsapp||null);
      }else{
        const add=document.createElement('button');
        add.type='button';add.className='ref-cart-add';add.dataset.cartId=id;
        add.textContent=canAdd?'Add to cart':live?'Out of stock':'Enquire only';
        add.disabled=!canAdd;
        if(canAdd)add.dataset.cartAction='add';
        add.setAttribute('aria-label',canAdd?'Add '+meta.dataset.cartName+' to cart':'Unavailable for online checkout: '+meta.dataset.cartName);
        actions.insertBefore(add,whatsapp||null);
      }
    });
    updateControls();
    window.addEventListener('baba-catalogue-cards-changed',updateControls);
    return()=>window.removeEventListener('baba-catalogue-cards-changed',updateControls);
  },[items,publishedProducts]);

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
            if(delta>0&&!productCanOrder(publishedProductByName(publishedProducts,item.name),quantity))return [item];
            return quantity>0?[{...item,quantity:Math.min(99,quantity)}]:[];
          }));
          return;
        }
        if(action!=='add')return;
        const meta=control.closest('.ref-commerce-meta');
        if(!meta||meta.dataset.cartAvailable!=='true')return;
        const name=meta.dataset.cartName||'Baba Hakeem Product';
        const price=verifiedProductPrice(meta.dataset.cartPrice);
        const image=meta.dataset.cartImage||'';
        setItems(current=>{
          const existing=current.find(item=>item.id===id);
          if(existing)return current.map(item=>item.id===id?{...item,quantity:productCanOrder(publishedProductByName(publishedProducts,name),item.quantity+1)?item.quantity+1:item.quantity,name,price,image}:item);
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
      const price=verifiedProductPrice(meta.dataset.cartPrice);
      setSelected({
        id:meta.dataset.cartId,
        name:meta.dataset.cartName||'Baba Hakeem Product',
        image:meta.dataset.cartImage||'',
        kicker:meta.dataset.cartKicker||'Baba Hakeem Collection',
        desc:meta.dataset.cartDesc||'Explore this product from the Baba Hakeem herbal collection.',
        price,
        available:meta.dataset.cartAvailable==='true',
        stock:Number(meta.dataset.cartStock)||0,
        published:meta.dataset.cartPublished==='true'
      });
    };
    document.addEventListener('click',onClick);
    return()=>document.removeEventListener('click',onClick);
  },[publishedProducts]);

  useEffect(()=>{
    if(!open&&!selected)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const onKey=event=>{if(event.key==='Escape'){if(selected)setSelected(null);else setOpen(false);}};
    window.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey);};
  },[open,selected]);

  const liveSelected=selected?publishedProductByName(publishedProducts,selected.name):null;
  const selectedView=selected?{
    ...selected,
    image:liveSelected?.image||selected.image,
    price:liveSelected?verifiedProductPrice(liveSelected.price):null,
    stock:productStock(liveSelected),
    available:productCanOrder(liveSelected),
    published:!!liveSelected,
    desc:liveSelected?.description||selected.desc
  }:null;
  const viewItems=useMemo(()=>items.map(item=>{
    const live=publishedProductByName(publishedProducts,item.name);
    return {...item,price:live?verifiedProductPrice(live.price):null,
      image:live?.image||item.image,available:productCanOrder(live,item.quantity),
      stock:productStock(live)};
  }),[items,publishedProducts]);
  const count=useMemo(()=>items.reduce((sum,item)=>sum+item.quantity,0),[items]);
  const subtotal=useMemo(()=>viewItems.reduce((sum,item)=>sum+(item.price||0)*item.quantity,0),[viewItems]);
  const hasUnpriced=viewItems.some(item=>item.price==null);
  const selectedCartItem=selected?items.find(item=>item.id===selected.id):null;

  const change=(id,delta)=>setItems(current=>current.flatMap(item=>{
    if(item.id!==id)return [item];
    const quantity=item.quantity+delta;
    if(delta>0&&!productCanOrder(publishedProductByName(publishedProducts,item.name),quantity))return [item];
    return quantity>0?[{...item,quantity:Math.min(99,quantity)}]:[];
  }));
  const remove=id=>setItems(current=>current.filter(item=>item.id!==id));
  const addProduct=product=>{
    if(!product||!productCanOrder(publishedProductByName(publishedProducts,product.name)))return;
    setItems(current=>{
      const existing=current.find(item=>item.id===product.id);
      if(existing)return current.map(item=>item.id===product.id?{...item,quantity:productCanOrder(publishedProductByName(publishedProducts,product.name),item.quantity+1)?item.quantity+1:item.quantity,name:product.name,price:product.price,image:product.image}:item);
      return [...current,{id:product.id,name:product.name,price:product.price,image:product.image,quantity:1}];
    });
    setFlash(true);
    window.setTimeout(()=>setFlash(false),420);
  };

  const orderWhatsApp=()=>{
    if(!items.length)return;
    const lines=['Assalam-o-Alaikum Baba Hakeem, I would like to order:',''];
    viewItems.forEach(item=>lines.push(`• ${item.name} × ${item.quantity}${item.price?` — ${money(item.price*item.quantity)}`:''}${!item.available?' (availability to confirm)':''}`));
    lines.push('');
    if(viewItems.length&&viewItems.every(item=>item.price!==null))lines.push(`Product subtotal: ${money(subtotal)}`);
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
      {selected&&<section className={quick.modal} role="dialog" aria-modal="true" aria-label={`${selectedView.name} product details`}>
        <button className={quick.close} type="button" onClick={()=>setSelected(null)} aria-label="Close product details">×</button>
        <div className={quick.head}><p className={quick.eyebrow}>{selectedView.kicker}</p><h2>{selectedView.name}</h2><p>Premium Baba Hakeem product</p></div>
        <div className={quick.visual}>{selectedView.image?<img src={selectedView.image} alt={selectedView.name} decoding="async"/>:<span>BH</span>}</div>
        <div className={quick.body}>
          <p className={quick.description}>{selectedView.desc}</p>
          <div className={quick.priceRow}><div><small>Price</small><strong>{money(selectedView.price)}</strong></div><a className={quick.whatsapp} href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Assalam-o-Alaikum Baba Hakeem, I want to ask about ${selectedView.name}.`)}`} target="_blank" rel="noopener noreferrer">Ask on WhatsApp ↗</a></div>
          <div className={quick.actions}>{selectedCartItem?<div className={quick.stepper}><button type="button" onClick={()=>change(selectedView.id,-1)} aria-label={`Decrease ${selectedView.name}`}>−</button><span>{selectedCartItem.quantity}</span><button type="button" onClick={()=>change(selectedView.id,1)} disabled={!selectedView.available||selectedCartItem.quantity>=selectedView.stock} aria-label={`Increase ${selectedView.name}`}>+</button></div>:<button className={quick.add} type="button" onClick={()=>addProduct(selectedView)} disabled={!selectedView.available}>{selectedView.available?'Add to cart':selectedView.published?'Out of stock':'Enquire on WhatsApp'}</button>}</div>
          <small className={quick.note}>{selectedView.available?`${selectedView.stock} in stock · Cash on Delivery`:selectedView.published?'Currently out of stock — ask on WhatsApp':'Not published for online orders — ask on WhatsApp'}</small>
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
          viewItems.map(item=><article className={styles.item} key={item.id}>
            <div className={styles.thumb}>{item.image?<img src={item.image} alt="" loading="lazy" decoding="async"/>:<span>BH</span>}</div>
            <div className={styles.itemInfo}><h3>{item.name}</h3><p>{money(item.price)} · {item.available?'Available':'Not available for checkout'}</p><div className={styles.stepper}><button onClick={()=>change(item.id,-1)} aria-label={`Decrease ${item.name}`}>−</button><span>{item.quantity}</span><button onClick={()=>change(item.id,1)} disabled={!productCanOrder(publishedProductByName(publishedProducts,item.name),item.quantity+1)} aria-label={`Increase ${item.name}`}>+</button></div></div>
            <div className={styles.itemSide}><strong>{item.price?money(item.price*item.quantity):'On request'}</strong><button onClick={()=>remove(item.id)}>REMOVE</button></div>
          </article>)}
        </div>

        {!!items.length&&<footer className={styles.footer}>
          <div className={styles.subtotal}><span>SUBTOTAL</span><strong>{viewItems.every(item=>item.price!==null)?money(subtotal):'Price to be confirmed'}</strong></div>
          {hasUnpriced&&<p>Final total will be confirmed for products without a listed price.</p>}
          <a className={styles.checkout} style={{textDecoration:'none',marginBottom:10}} href="/cart" onClick={()=>setOpen(false)}>VIEW CART & CHECKOUT <span>→</span></a>
          <button className={styles.checkout} onClick={orderWhatsApp}>ORDER ON WHATSAPP <span>↗</span></button>
          <small>Cash on Delivery • Pakistan delivery • Final availability confirmed on WhatsApp</small>
        </footer>}
      </aside>
    </div>
  </>;
}
