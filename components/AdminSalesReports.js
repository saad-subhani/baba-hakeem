'use client';

import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../lib/supabase';
import AdminSectionNav from './AdminSectionNav';
import styles from './AdminSalesReports.module.css';

const STATUSES=['All','Pending','Confirmed','Shipped','Delivered','Cancelled'];
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const money=v=>'Rs. '+num(v).toLocaleString('en-PK',{maximumFractionDigits:2});
const day=value=>{
  const d=new Date(value);
  if(!Number.isFinite(d.getTime()))return '';
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
const niceDate=value=>new Date(value).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'});
const csvValue=value=>{
  const raw=String(value??'').replace(/[\r\n]+/g,' ').trim();
  const safe=/^[=+\-@]/.test(raw)?"'"+raw:raw;
  return '"'+safe.replace(/"/g,'""')+'"';
};
const exportCSV=(filename,headers,rows)=>{
  const content='\uFEFF'+[headers,...rows].map(row=>row.map(csvValue).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=filename;
  document.body.appendChild(link);link.click();link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),2000);
};
async function loadAll(table,columns){
  const all=[];
  for(let page=0;page<100;page++){
    const {data,error}=await supabase.from(table).select(columns)
      .order('created_at',{ascending:false}).range(page*500,page*500+499);
    if(error)throw new Error('Unable to load '+table+': '+error.message);
    all.push(...(data||[]));
    if(!data||data.length<500)return all;
  }
  throw new Error('Report exceeds 50,000 rows. Please use a server-side reporting endpoint.');
}
function joinOrders(orders,items){
  const map=new Map();
  for(const line of items){
    const arr=map.get(line.order_id)||[];
    arr.push({name:line.product_name||'Product',units:num(line.quantity),amount:num(line.line_total)});
    map.set(line.order_id,arr);
  }
  return orders.map(o=>({
    ...o,
    lines:map.get(o.id)||[{name:o.product_name||'Product',units:num(o.quantity),amount:num(o.total_amount)}]
  }));
}
function trendData(rows){
  if(!rows.length)return [];
  const times=rows.map(o=>new Date(o.created_at).getTime()).filter(Number.isFinite);
  if(!times.length)return [];
  const start=Math.min(...times),end=Math.max(...times);
  const span=Math.max(86400000,end-start);
  const columns=Array.from({length:8},(_,i)=>({label:niceDate(start+span*i/8),amount:0}));
  rows.filter(o=>o.status==='Delivered').forEach(o=>{
    const idx=Math.min(7,Math.floor((new Date(o.created_at).getTime()-start)/span*8));
    columns[Math.max(0,idx)].amount+=o.reportAmount;
  });
  return columns;
}

export default function AdminSalesReports(){
  const [access,setAccess]=useState('checking');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [orders,setOrders]=useState([]);
  const [items,setItems]=useState([]);
  const [refresh,setRefresh]=useState(0);
  const [period,setPeriod]=useState('all');
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [status,setStatus]=useState('All');
  const [product,setProduct]=useState('All');
  const [search,setSearch]=useState('');

  useEffect(()=>{
    let active=true;
    const run=async()=>{
      setLoading(true);setError('');
      try{
        const {data:{user},error:authError}=await supabase.auth.getUser();
        if(authError||!user){if(active)setAccess('login');return;}
        const {data,error:ownerError}=await supabase.rpc('admin_owner_status');
        if(ownerError)throw new Error('Could not verify administrator ownership.');
        const owner=Array.isArray(data)?data[0]:data;
        if(!owner?.is_owner){if(active)setAccess('restricted');return;}
        if(active)setAccess('owner');
        const [allOrders,allItems]=await Promise.all([
          loadAll('orders','id,order_number,created_at,status,total_amount,quantity,product_id,product_name,unit_price,customer_name,phone,city,customer_email,payment_method'),
          loadAll('order_items','order_id,product_name,quantity,line_total,created_at')
        ]);
        if(active){setOrders(allOrders);setItems(allItems);}
      }catch(e){if(active){setError(e.message||'Could not load reports.');setAccess(v=>v==='checking'?'error':v);}}
      finally{if(active)setLoading(false);}
    };
    run();
    const {data:listener}=supabase.auth.onAuthStateChange(event=>{
      if(event==='SIGNED_OUT'&&active){setOrders([]);setItems([]);setAccess('login');}
    });
    return()=>{active=false;listener.subscription.unsubscribe();};
  },[refresh]);

  const source=useMemo(()=>joinOrders(orders,items),[orders,items]);
  const products=useMemo(()=>[...new Set(source.flatMap(o=>o.lines.map(l=>l.name)))].sort(),[source]);
  const bounds=useMemo(()=>{
    const today=new Date();
    if(period==='all')return {start:'',end:''};
    if(period==='custom')return {start:from,end:to};
    if(period==='month')return {start:day(new Date(today.getFullYear(),today.getMonth(),1)),end:day(today)};
    const days=period==='week'?7:30;
    return {start:day(new Date(today.getFullYear(),today.getMonth(),today.getDate()-days+1)),end:day(today)};
  },[period,from,to]);

  const filtered=useMemo(()=>{
    const term=search.trim().toLowerCase();
    return source.flatMap(order=>{
      const created=day(order.created_at);
      if(bounds.start&&created<bounds.start)return [];
      if(bounds.end&&created>bounds.end)return [];
      if(status!=='All'&&order.status!==status)return [];
      const lines=product==='All'?order.lines:order.lines.filter(line=>line.name===product);
      if(!lines.length)return [];
      if(term&&![
        order.order_number,order.customer_name,order.phone,order.city,...order.lines.map(l=>l.name)
      ].join(' ').toLowerCase().includes(term))return [];
      const reportUnits=lines.reduce((n,l)=>n+l.units,0);
      const reportAmount=product==='All'?num(order.total_amount):lines.reduce((n,l)=>n+l.amount,0);
      return [{...order,reportLines:lines,reportUnits,reportAmount}];
    });
  },[source,bounds,status,product,search]);

  const delivered=useMemo(()=>filtered.filter(o=>o.status==='Delivered'),[filtered]);
  const totals=useMemo(()=>{
    const revenue=delivered.reduce((n,o)=>n+o.reportAmount,0);
    const units=delivered.reduce((n,o)=>n+o.reportUnits,0);
    const pending=filtered.filter(o=>o.status==='Pending');
    return {
      orders:filtered.length,
      revenue,units,delivered:delivered.length,
      average:delivered.length?revenue/delivered.length:0,
      pending:pending.length,
      pipeline:pending.reduce((n,o)=>n+o.reportAmount,0)
    };
  },[filtered,delivered]);

  const trend=useMemo(()=>trendData(filtered),[filtered]);
  const tops=useMemo(()=>{
    const result=new Map();
    for(const order of delivered)for(const line of order.reportLines){
      const old=result.get(line.name)||{name:line.name,units:0,amount:0};
      result.set(line.name,{name:line.name,units:old.units+line.units,amount:old.amount+line.amount});
    }
    return [...result.values()].sort((a,b)=>b.units-a.units||b.amount-a.amount).slice(0,6);
  },[delivered]);

  const download=kind=>{
    const suffix=(bounds.start||'all')+'_'+(bounds.end||'all')+'_'+status.toLowerCase();
    if(kind==='summary'){
      exportCSV('baba-hakeem-summary_'+suffix+'.csv',['Metric','Value','Notes'],[
        ['Matching orders',totals.orders,'All selected statuses'],
        ['Delivered revenue PKR',totals.revenue,'Delivered only'],
        ['Delivered orders',totals.delivered,'Completed deliveries'],
        ['Units sold',totals.units,'Delivered units'],
        ['Average delivered order PKR',totals.average,'Revenue / delivered orders'],
        ['Pending orders',totals.pending,'Not revenue'],
        ['Pending value PKR',totals.pipeline,'Not revenue'],
        ...tops.map(p=>['Product: '+p.name,p.amount,p.units+' delivered units'])
      ]);
    }else{
      exportCSV('baba-hakeem-orders_'+suffix+'.csv',
        ['Order number','Date','Customer','Phone','City','Status','Products','Units','Filtered amount PKR','Payment method'],
        filtered.map(o=>[o.order_number,new Date(o.created_at).toISOString(),o.customer_name,o.phone,
          o.city,o.status,o.reportLines.map(l=>l.name+' x'+l.units).join('; '),o.reportUnits,
          o.reportAmount,o.payment_method||'Not recorded']));
    }
  };

  if(access==='checking'||(access==='owner'&&loading&&!orders.length))
    return <main className={styles.gate}><div className={styles.spinner}/><h1>Loading sales reports…</h1><p>Checking owner access and retrieving real order data.</p></main>;
  if(access!=='owner')
    return <main className={styles.gate}><span className={styles.mark}>BH</span>
      <h1>{access==='restricted'?'Owner access only.':'Admin sign-in required.'}</h1>
      <p>{error||'Sign in to your approved Baba Hakeem administrator account.'}</p>
      <Link className={styles.action} href="/admin">RETURN TO ADMIN →</Link></main>;

  const chartMax=Math.max(1,...trend.map(t=>t.amount));
  const bestMax=Math.max(1,...tops.map(p=>p.units));
  return <main className={styles.screen}><div className={styles.wrap}>
    <header className={styles.header}>
      <div className={styles.brand}><span className={styles.mark}>BH</span><span><b>BABA HAKEEM</b><small>HERBAL PRODUCTS / ADMIN</small></span></div>
      <AdminSectionNav/>
    </header>
    <section className={styles.intro}>
      <div><small>ADMIN / REAL SUPABASE ORDER DATA</small><h1>SALES <em>OVERVIEW.</em></h1><p>Revenue intelligence, product performance and filtered order records.</p></div>
      <button type="button" onClick={()=>setRefresh(r=>r+1)} disabled={loading}>{loading?'Refreshing…':'↻ Refresh data'}</button>
    </section>
    {error&&<div className={styles.error} role="alert">{error} <button type="button" onClick={()=>setRefresh(r=>r+1)}>Retry</button></div>}
    <section className={styles.filters}>
      <div className={styles.filterTitle}><div><h2>Report filters</h2><p>Cards, charts, orders and exports reflect these filters.</p></div>
        <button type="button" onClick={()=>{setPeriod('all');setFrom('');setTo('');setStatus('All');setProduct('All');setSearch('');}}>Clear filters</button>
      </div>
      <div className={styles.fields}>
        <label>DATE RANGE<select value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">All time</option><option value="week">Last 7 days</option><option value="month30">Last 30 days</option><option value="month">This month</option><option value="custom">Custom range</option></select></label>
        <label>ORDER STATUS<select value={status} onChange={e=>setStatus(e.target.value)}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
        <label>PRODUCT<select value={product} onChange={e=>setProduct(e.target.value)}><option value="All">All products</option>{products.map(p=><option key={p} value={p}>{p}</option>)}</select></label>
        <label>SEARCH<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Order, customer, city…"/></label>
      </div>
      {period==='custom'&&<div className={styles.dates}><label>FROM<input type="date" value={from} max={to||undefined} onChange={e=>setFrom(e.target.value)}/></label><label>TO<input type="date" value={to} min={from||undefined} onChange={e=>setTo(e.target.value)}/></label></div>}
    </section>
    <section className={styles.stats} aria-label="Live sales key performance indicators">
      {[
        ['DELIVERED REVENUE',money(totals.revenue),'Completed deliveries only'],
        ['MATCHED ORDERS',totals.orders,'All selected statuses'],
        ['UNITS SOLD',totals.units,'Delivered items only'],
        ['AVERAGE ORDER',money(totals.average),'Delivered orders only'],
        ['PENDING ORDERS',totals.pending,'Awaiting processing'],
        ['PENDING VALUE',money(totals.pipeline),'Pipeline, not revenue']
      ].map(([label,value,note],i)=><article className={styles.stat} key={label}>
        <div><small>{label}</small><span>0{i+1}</span></div><strong>{value}</strong><p>{note}</p>
      </article>)}
    </section>
    <div className={styles.charts}>
      <section className={styles.panel}>
        <header><div><small>01 / SALES TREND</small><h2>Delivered revenue</h2></div><span>Filtered timeline</span></header>
        {trend.length?<div className={styles.chart} role="img" aria-label="Delivered revenue across the selected order date range">
          {trend.map((v,i)=><div className={styles.chartItem} key={i}>
            <div className={styles.barTrack} title={v.label+': '+money(v.amount)}>
              <i style={{height:(v.amount?Math.max(4,Math.round(v.amount/chartMax*100)):0)+'%'}}/>
            </div>
            <small>{v.label}</small>
          </div>)}
        </div>:<div className={styles.empty}>No orders match the selected date range.</div>}
        <p className={styles.panelHint}>Pending and cancelled orders never count as delivered revenue.</p>
      </section>
      <section className={styles.panel}>
        <header><div><small>02 / PRODUCT PERFORMANCE</small><h2>Best-selling products</h2></div><span>By units</span></header>
        {tops.length?<div className={styles.topProducts}>{tops.map((p,i)=><div className={styles.topProduct} key={p.name}>
          <div><span><b>{String(i+1).padStart(2,'0')}</b> {p.name}</span><strong>{p.units} units</strong></div>
          <div className={styles.productTrack}><i style={{width:Math.round(p.units/bestMax*100)+'%'}}/></div>
          <small>{money(p.amount)} delivered revenue</small>
        </div>)}</div>:<div className={styles.empty}>No delivered sales in this selection.</div>}
      </section>
    </div>
    <section className={styles.report}>
      <header><div><small>03 / FILTERED SALES RECORDS</small><h2>Order report</h2><p>{filtered.length} matching orders · export uses the same filters and product-level amounts.</p></div>
        <div className={styles.download}><button type="button" disabled={!filtered.length||loading} onClick={()=>download('orders')}>↓ Orders CSV</button><button type="button" disabled={!filtered.length||loading} onClick={()=>download('summary')}>↓ Summary CSV</button></div>
      </header>
      <div className={styles.tableScroll}><table><thead><tr><th>ORDER</th><th>DATE</th><th>CUSTOMER</th><th>PRODUCTS</th><th>STATUS</th><th>UNITS</th><th>AMOUNT</th></tr></thead><tbody>
        {filtered.map(o=><tr key={o.id}>
          <td className={styles.orderNo}>{o.order_number}</td><td>{niceDate(o.created_at)}</td>
          <td>{o.customer_name||'—'}<small>{o.city||''}</small></td>
          <td>{o.reportLines.map(l=>l.name+' × '+l.units).join(', ')}</td>
          <td><span className={styles.status}>{o.status}</span></td>
          <td>{o.reportUnits}</td><td className={styles.amount}>{money(o.reportAmount)}</td>
        </tr>)}
        {!filtered.length&&<tr><td className={styles.emptyRow} colSpan={7}>No matching orders. Adjust the filters to see results.</td></tr>}
      </tbody></table></div>
      <footer><span>Showing {filtered.length.toLocaleString()} orders</span><span>CSV exports open in Excel and spreadsheet apps</span></footer>
    </section>
    <footer className={styles.pageFooter}>BABA HAKEEM / OWNER-ONLY REPORTING <span>Existing single-product and newer multi-product orders supported · PKR</span></footer>
  </div></main>;
}
