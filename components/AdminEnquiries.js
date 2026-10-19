'use client';

import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../lib/supabase';
import styles from './AdminEmailQueue.module.css';

const moment=value=>new Date(value).toLocaleString('en-PK',{dateStyle:'medium',timeStyle:'short'});
const states=['New','In progress','Resolved'];

export default function AdminEnquiries(){
  const [access,setAccess]=useState('checking');
  const [rows,setRows]=useState([]);
  const [error,setError]=useState('');
  const [filter,setFilter]=useState('All');
  const [busy,setBusy]=useState(null);
  const [refresh,setRefresh]=useState(0);

  useEffect(()=>{
    let live=true;
    const load=async()=>{
      try{
        const {data:{user},error:authError}=await supabase.auth.getUser();
        if(authError||!user){if(live)setAccess('login');return;}
        const {data,error:ownerError}=await supabase.rpc('admin_owner_status');
        if(ownerError)throw new Error('Unable to verify administrator status.');
        const owner=Array.isArray(data)?data[0]:data;
        if(!owner?.is_owner){if(live)setAccess('restricted');return;}
        if(live)setAccess('owner');
        const {data:inbox,error:loadError}=await supabase.from('contact_inquiries')
          .select('id,category,customer_name,customer_email,customer_phone,order_reference,message,status,created_at')
          .order('created_at',{ascending:false}).limit(500);
        if(loadError)throw new Error(loadError.message);
        if(live)setRows(inbox||[]);
      }catch(err){if(live){setError(err?.message||'Unable to load enquiries.');setAccess(s=>s==='checking'?'error':s);}}
    };
    load();
    const {data:listener}=supabase.auth.onAuthStateChange(event=>{
      if(live&&event==='SIGNED_OUT'){setRows([]);setAccess('login');}
    });
    return()=>{live=false;listener.subscription.unsubscribe();};
  },[refresh]);

  const counts=useMemo(()=>Object.fromEntries(states.map(s=>[s,rows.filter(r=>r.status===s).length])),[rows]);
  const visible=useMemo(()=>filter==='All'?rows:rows.filter(r=>r.status===filter),[rows,filter]);
  const update=async(item,status)=>{
    if(busy)return;
    setBusy(item.id);setError('');
    const {error:saveError}=await supabase.from('contact_inquiries')
      .update({status,updated_at:new Date().toISOString()})
      .eq('id',item.id);
    if(saveError)setError(saveError.message);
    else setRows(list=>list.map(r=>r.id===item.id?{...r,status}:r));
    setBusy(null);
  };
  if(access!=='owner')return <main className={styles.gate}><h1>{access==='checking'?'Loading enquiries…':access==='restricted'?'Owner access only.':'Admin sign-in required.'}</h1>
    <p>{error||'The enquiry inbox is private to the approved store owner.'}</p><Link href="/admin">RETURN TO ADMIN →</Link></main>;

  return <main className={styles.screen}><div className={styles.wrap}>
    <header className={styles.nav}><div className={styles.brand}><span>BH</span><div><b>BABA HAKEEM</b><small>HERBAL PRODUCTS / ADMIN</small></div></div>
      <div className={styles.navLinks}><Link href="/admin">← Dashboard</Link><Link href="/admin/emails">Order Emails</Link><Link href="/admin/operations">Order Operations</Link></div>
    </header>
    <section className={styles.intro}><div><small>05 / CONTACT ENQUIRIES</small><h1>YOUR <em>INBOX.</em></h1><p>Product questions, order support and business enquiries from the live Contact page.</p></div>
      <button type="button" onClick={()=>setRefresh(n=>n+1)}>↻ Refresh</button></section>
    {error&&<div className={styles.error} role="alert">{error}</div>}
    <div className={styles.stats}>{[
      ['TOTAL',rows.length],['NEW',counts['New']],['IN PROGRESS',counts['In progress']],['RESOLVED',counts['Resolved']]
    ].map(([label,count])=><article key={label}><small>{label}</small><strong>{count}</strong></article>)}</div>
    <section className={styles.panel}>
      <div className={styles.panelTop}><div><small>PRIVATE / SUPABASE INBOX</small><h2>Customer enquiries</h2><p>Reply using the contact information provided. No automatic email is sent by this form.</p></div>
        <div className={styles.actions}><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option>{states.map(s=><option key={s}>{s}</option>)}</select></div>
      </div>
      <div className={styles.tableOuter}><table><thead><tr><th>RECEIVED</th><th>CUSTOMER / REPLY</th><th>SUBJECT</th><th>MESSAGE</th><th>STATUS</th></tr></thead><tbody>
        {visible.map(item=><tr key={item.id}>
          <td>{moment(item.created_at)}</td>
          <td><b>{item.customer_name}</b>
            {item.customer_email&&<small><a href={'mailto:'+item.customer_email}>{item.customer_email}</a></small>}
            {item.customer_phone&&<small><a href={'tel:'+item.customer_phone}>{item.customer_phone}</a></small>}
          </td>
          <td><b>{item.category}</b>{item.order_reference&&<small>Order: {item.order_reference}</small>}</td>
          <td style={{minWidth:240,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{item.message}</td>
          <td><select style={{maxWidth:145,padding:8,border:'1px solid #17322655',background:'#eeeede'}}
            value={item.status} disabled={busy===item.id} onChange={e=>update(item,e.target.value)}>
            {states.map(s=><option key={s}>{s}</option>)}</select></td>
        </tr>)}
        {!visible.length&&<tr><td colSpan={5} className={styles.empty}>No enquiries match this filter.</td></tr>}
      </tbody></table></div>
    </section>
    <footer className={styles.footer}>BABA HAKEEM / PRIVATE CONTACT INBOX <span>New enquiries are saved securely; email/domain setup may follow later.</span></footer>
  </div></main>;
}
