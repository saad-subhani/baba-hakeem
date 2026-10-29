'use client';
import { RefreshIcon } from './Icons';

import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../lib/supabase';
import styles from './AdminOperations.module.css';

const money=n=>'Rs. '+(Number(n)||0).toLocaleString('en-PK',{maximumFractionDigits:2});
const stamp=s=>s?new Date(s).toLocaleString('en-PK',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'}):'—';
const transitions={
  Pending:['Confirmed','Cancelled'],
  Confirmed:['Shipped','Cancelled'],
  Shipped:['Delivered'],
  Delivered:[],
  Cancelled:[]
};
async function readAll(table,columns,sort='created_at'){
  const all=[];
  for(let page=0;page<100;page++){
    const {data,error}=await supabase.from(table).select(columns).order(sort,{ascending:false}).range(page*500,page*500+499);
    if(error)throw new Error('Could not read '+table+': '+error.message);
    all.push(...(data||[]));
    if(!data||data.length<500)return all;
  }
  throw new Error('Too many records to display safely. An archive view is required.');
}
const initialAdjust={product:'',direction:'add',quantity:'',reason:''};

export default function AdminOperations(){
  const [access,setAccess]=useState('checking');
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState('');
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');
  const [revision,setRevision]=useState(0);
  const [orders,setOrders]=useState([]);
  const [lines,setLines]=useState([]);
  const [products,setProducts]=useState([]);
  const [stockEvents,setStockEvents]=useState([]);
  const [orderEvents,setOrderEvents]=useState([]);
  const [query,setQuery]=useState('');
  const [status,setStatus]=useState('All');
  const [expanded,setExpanded]=useState(null);
  const [note,setNote]=useState('');
  const [adjust,setAdjust]=useState(initialAdjust);

  useEffect(()=>{
    let live=true;
    (async()=>{
      setLoading(true);
      setError('');
      try{
        const {data:{user},error:authError}=await supabase.auth.getUser();
        if(authError||!user){if(live)setAccess('login');return;}
        const {data,error:checkError}=await supabase.rpc('admin_owner_status');
        if(checkError)throw new Error('Administrator identity could not be verified.');
        const owner=Array.isArray(data)?data[0]:data;
        if(!owner?.is_owner){if(live)setAccess('restricted');return;}
        if(live)setAccess('owner');
        const [o,l,p,s,h]=await Promise.all([
          readAll('orders','*'),
          readAll('order_items','*'),
          readAll('products','id,name,status,stock_quantity,stock_status,price,created_at'),
          readAll('inventory_movements','id,product_id,product_name,previous_quantity,new_quantity,quantity_change,reason,created_at,changed_by'),
          readAll('order_status_events','id,order_id,order_number,previous_status,new_status,note,created_at,changed_by')
        ]);
        if(live){setOrders(o);setLines(l);setProducts(p);setStockEvents(s);setOrderEvents(h);setExpanded(current=>current&&o.some(item=>item.id===current)?current:(o[0]?.id||null));}
      }catch(err){if(live){setError(err?.message||'Could not load operations.');setAccess(current=>current==='checking'?'error':current);}}
      finally{if(live)setLoading(false);}
    })();
    const {data:listener}=supabase.auth.onAuthStateChange(e=>{
      if(e==='SIGNED_OUT'&&live){setAccess('login');setOrders([]);setLines([]);}
    });
    return()=>{live=false;listener.subscription.unsubscribe();};
  },[revision]);

  const itemsByOrder=useMemo(()=>{
    const map=new Map();
    for(const item of lines){
      const current=map.get(item.order_id)||[];
      current.push(item);map.set(item.order_id,current);
    }
    return map;
  },[lines]);
  const visibleOrders=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return orders.filter(o=>{
      if(status!=='All'&&o.status!==status)return false;
      if(!q)return true;
      const productsForOrder=itemsByOrder.get(o.id)||[];
      return [o.order_number,o.customer_name,o.phone,o.city,o.product_name,...productsForOrder.map(i=>i.product_name)]
        .join(' ').toLowerCase().includes(q);
    });
  },[orders,status,query,itemsByOrder]);
  const counts=useMemo(()=>({
    pending:orders.filter(o=>o.status==='Pending').length,
    confirmed:orders.filter(o=>o.status==='Confirmed').length,
    shipping:orders.filter(o=>o.status==='Shipped').length,
    low:products.filter(p=>Number(p.stock_quantity)<=5).length
  }),[orders,products]);
  const selected=orders.find(o=>o.id===expanded);
  const selectedLines=selected?(itemsByOrder.get(selected.id)||[]):[];

  const setOrderStatus=async(next)=>{
    if(!selected||busy)return;
    const label=next==='Cancelled'?'cancel this order':('change this order to '+next);
    if(!window.confirm('Are you sure you want to '+label+'?'))return;
    setBusy(selected.id);setError('');setSuccess('');
    const {error:rpcError}=await supabase.rpc('admin_set_order_status',{
      p_order_id:selected.id,p_status:next,p_note:note.trim()||null
    });
    if(rpcError){setError(rpcError.message);setBusy('');return;}
    setSuccess('Order '+selected.order_number+' updated to '+next+'.');
    setNote('');setBusy('');setRevision(v=>v+1);
  };
  const adjustStock=async e=>{
    e.preventDefault();
    if(busy)return;
    const qty=Number(adjust.quantity);
    if(!Number.isSafeInteger(qty)||qty<1||qty>100000){setError('Enter a quantity between 1 and 100,000.');return;}
    if(adjust.reason.trim().length<4){setError('Enter a meaningful reason for the stock adjustment.');return;}
    const p=products.find(x=>x.id===adjust.product);
    if(!p){setError('Choose a product first.');return;}
    const delta=adjust.direction==='remove'?-qty:qty;
    if(Number(p.stock_quantity)+delta<0){setError('This adjustment would make inventory negative.');return;}
    if(!window.confirm('Adjust '+p.name+' by '+(delta>0?'+':'')+delta+' units?'))return;
    setBusy('stock');setError('');setSuccess('');
    const {data,error:rpcError}=await supabase.rpc('admin_adjust_stock',{
      p_product_id:p.id,p_delta:delta,p_reason:adjust.reason.trim()
    });
    if(rpcError){setError(rpcError.message);setBusy('');return;}
    setSuccess(p.name+' stock updated to '+data+' units. Adjustment recorded in history.');
    setAdjust(initialAdjust);setBusy('');setRevision(v=>v+1);
  };

  if(access==='checking'||(access==='owner'&&loading&&!orders.length&&!products.length)){
    return <main className={styles.gate}><div className={styles.loadingRing}/><h1>Loading operations…</h1><p>Validating owner access and retrieving live records.</p></main>;
  }
  if(access!=='owner'){
    return <main className={styles.gate}><span className={styles.bh}>BH</span><h1>{access==='restricted'?'Owner access required.':'Admin sign-in required.'}</h1><p>{error||'Only the website owner may manage orders and inventory.'}</p><Link href="/admin" className={styles.darkLink}>RETURN TO ADMIN →</Link></main>;
  }

  return <main className={styles.page}><div className={styles.wrap}>
    <header className={styles.header}>
      <div className={styles.brand}><span className={styles.bh}>BH</span><span><b>BABA HAKEEM</b><small>HERBAL PRODUCTS / ADMIN</small></span></div>
      
    </header>

    <section className={styles.hero}>
      <div><small>ADMIN / FULFILLMENT & STOCK CONTROL</small><h1>ORDER <em>OPERATIONS.</em></h1><p>Process orders, inspect every line item and track stock movement history.</p></div>
      <button type="button" disabled={loading||!!busy} onClick={()=>setRevision(n=>n+1)}>{loading?'Refreshing…':<><RefreshIcon size={13} style={{marginRight:'5px'}}/> Refresh records</>}</button>
    </section>

    {error&&<div className={styles.error} role="alert">{error}<button type="button" onClick={()=>setError('')}>Dismiss</button></div>}
    {success&&<div className={styles.success} role="status">{success}<button type="button" onClick={()=>setSuccess('')}>Dismiss</button></div>}

    <div className={styles.stats}>
      {[
        ['PENDING',counts.pending,'Awaiting confirmation'],
        ['CONFIRMED',counts.confirmed,'Preparing for shipment'],
        ['SHIPPED',counts.shipping,'In transit'],
        ['LOW / ZERO STOCK',counts.low,'Review inventory levels']
      ].map(([title,value,subtitle])=><article key={title}><small>{title}</small><strong>{value}</strong><p>{subtitle}</p></article>)}
    </div>

    <div className={styles.columns}>
      <section className={styles.card}>
        <div className={styles.panelHeader}><div><small>01 / ORDER QUEUE</small><h2>Customer orders</h2></div><span>{visibleOrders.length} shown</span></div>
        <div className={styles.controls}>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order, customer, product…"/>
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            {['All','Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div className={styles.orderList}>
          {visibleOrders.map(o=><button type="button" key={o.id} className={styles.orderRow+' '+(expanded===o.id?styles.selected:'')}
            onClick={()=>{setExpanded(o.id);setNote('');setError('');}}>
            <span><b>{o.order_number}</b><small>{stamp(o.created_at)}</small></span>
            <span><strong>{o.customer_name}</strong><small>{o.city}</small></span>
            <span><b>{money(o.total_amount)}</b><small>{o.status}</small></span>
          </button>)}
          {!visibleOrders.length&&<div className={styles.empty}>No orders match this selection.</div>}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.panelHeader}><div><small>02 / ORDER DETAILS</small><h2>{selected?selected.order_number:'Select an order'}</h2></div>{selected&&<span className={styles.pill}>{selected.status}</span>}</div>
        {selected?<div className={styles.detail}>
          <div className={styles.detailGrid}>
            <div><small>CUSTOMER</small><b>{selected.customer_name}</b></div>
            <div><small>PHONE</small><b>{selected.phone}</b></div>
            <div><small>CITY</small><b>{selected.city}</b></div>
            <div><small>ORDER DATE</small><b>{stamp(selected.created_at)}</b></div>
            <div><small>PAYMENT METHOD</small><b>{selected.payment_method||'Not recorded'}</b></div>
            <div><small>STOCK RESERVATION</small><b>{selected.stock_reserved?'Reserved':'Legacy / not reserved'}</b></div>
          </div>
          <div className={styles.address}><small>DELIVERY ADDRESS</small><p>{selected.address}</p></div>
          {selected.customer_email&&<div className={styles.address}><small>EMAIL</small><p>{selected.customer_email}</p></div>}
          {selected.notes&&<div className={styles.address}><small>ORDER NOTES</small><p>{selected.notes}</p></div>}
          <h3>Purchased items</h3>
          <div className={styles.items}>
            {(selectedLines.length?selectedLines:[{
              id:'legacy',product_name:selected.product_name,quantity:selected.quantity,
              unit_price:selected.unit_price,line_total:selected.total_amount
            }]).map(line=><div key={line.id}>
              <span><b>{line.product_name||'Product'}</b><small>{line.quantity} × {money(line.unit_price)}</small></span>
              <strong>{money(line.line_total)}</strong>
            </div>)}
          </div>
          <div className={styles.total}><span>ORDER TOTAL</span><b>{money(selected.total_amount)}</b></div>
          <div className={styles.transition}><h3>Process order</h3>
            {transitions[selected.status]?.length?<><label>OPTIONAL STATUS NOTE
              <textarea value={note} maxLength={500} rows={2} onChange={e=>setNote(e.target.value)} placeholder="e.g. Confirmed by phone, courier handed over"/>
            </label><div className={styles.actions}>
              {transitions[selected.status].map(next=><button key={next} type="button" disabled={!!busy}
                className={next==='Cancelled'?styles.dangerButton:styles.primaryButton}
                onClick={()=>setOrderStatus(next)}>{busy?'Processing…':next==='Cancelled'?'CANCEL ORDER':'MARK '+next.toUpperCase()}</button>)}
            </div></>:<p className={styles.smallNote}>This order is {selected.status.toLowerCase()} and its status is final.</p>}
          </div>
          <div className={styles.audit}><h3>Status history</h3>
            {orderEvents.filter(ev=>ev.order_id===selected.id).map(ev=><div key={ev.id}>
              <span><b>{ev.previous_status||'Created'} → {ev.new_status}</b><small>{stamp(ev.created_at)}</small></span>
              {ev.note&&<p>{ev.note}</p>}
            </div>)}
            {!orderEvents.some(ev=>ev.order_id===selected.id)&&<p className={styles.smallNote}>This order predates status history tracking. Current status: {selected.status}.</p>}
          </div>
        </div>:<div className={styles.empty}>Choose an order to view its customer details, purchased items, and processing actions.</div>}
      </section>
    </div>

    <div className={styles.columns}>
      <section className={styles.card}>
        <div className={styles.panelHeader}><div><small>03 / INVENTORY ADJUSTMENTS</small><h2>Manage stock safely</h2></div></div>
        <form className={styles.stockForm} onSubmit={adjustStock}>
          <label>PRODUCT<select required value={adjust.product} onChange={e=>setAdjust(v=>({...v,product:e.target.value}))}>
            <option value="">Choose product</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} — {p.stock_quantity} in stock</option>)}
          </select></label>
          <div className={styles.stockFields}>
            <label>CHANGE TYPE<select value={adjust.direction} onChange={e=>setAdjust(v=>({...v,direction:e.target.value}))}><option value="add">Add stock (+)</option><option value="remove">Remove stock (−)</option></select></label>
            <label>UNITS<input required type="number" min="1" max="100000" value={adjust.quantity} onChange={e=>setAdjust(v=>({...v,quantity:e.target.value}))} placeholder="0"/></label>
          </div>
          <label>REASON *<textarea required minLength={4} maxLength={160} rows={3} value={adjust.reason} onChange={e=>setAdjust(v=>({...v,reason:e.target.value}))} placeholder="New shipment, damaged stock, inventory recount…"/></label>
          <p>All adjustments are saved atomically, never reduce inventory below zero, and create an audit record. Draft products remain Draft until published separately.</p>
          <button className={styles.primaryButton} type="submit" disabled={!!busy||!products.length}>{busy==='stock'?'UPDATING INVENTORY…':'SAVE STOCK ADJUSTMENT →'}</button>
        </form>
      </section>
      <section className={styles.card}>
        <div className={styles.panelHeader}><div><small>04 / STOCK HISTORY</small><h2>Inventory activity</h2></div><span>{stockEvents.length} entries</span></div>
        <div className={styles.history}>
          {stockEvents.slice(0,100).map(ev=><article key={ev.id}>
            <span className={styles.delta+' '+(ev.quantity_change>=0?styles.increase:styles.decrease)}>{ev.quantity_change>0?'+':''}{ev.quantity_change}</span>
            <span><b>{ev.product_name}</b><small>{ev.previous_quantity} → {ev.new_quantity} units</small><small>{ev.reason}</small></span>
            <time>{stamp(ev.created_at)}</time>
          </article>)}
          {!stockEvents.length&&<div className={styles.empty}>No inventory changes have been recorded yet. Future checkout, admin and cancellation changes appear here.</div>}
        </div>
        {stockEvents.length>100&&<p className={styles.smallNote}>Showing the most recent 100 movements. All records remain stored in Supabase.</p>}
      </section>
    </div>

    <footer className={styles.footer}>BABA HAKEEM / OWNER-ONLY OPERATIONS <span>Historical orders are preserved · All inventory changes are recorded</span></footer>
  </div></main>;
}

