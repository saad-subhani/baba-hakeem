'use client';

import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../lib/supabase';
import styles from './AdminEmailQueue.module.css';

const stamp=value=>value?new Date(value).toLocaleString('en-PK',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'}):'—';
const FILTERS=['All','pending','processing','failed','sent'];

export default function AdminEmailQueue(){
  const [access,setAccess]=useState('checking');
  const [rows,setRows]=useState([]);
  const [orders,setOrders]=useState([]);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [refresh,setRefresh]=useState(0);
  const [filter,setFilter]=useState('All');

  useEffect(()=>{
    let alive=true;
    const load=async()=>{
      setError('');setLoading(true);
      try{
        const {data:{user},error:authError}=await supabase.auth.getUser();
        if(authError||!user){if(alive)setAccess('login');return;}
        const {data,error:ownerError}=await supabase.rpc('admin_owner_status');
        if(ownerError)throw new Error('Unable to verify admin ownership.');
        const owner=Array.isArray(data)?data[0]:data;
        if(!owner?.is_owner){if(alive)setAccess('restricted');return;}
        if(alive)setAccess('owner');
        const [emailsResult,ordersResult]=await Promise.all([
          supabase.from('order_email_outbox')
            .select('id,order_id,kind,recipient_email,status,attempts,created_at,claimed_at,sent_at,next_attempt_at,last_error,provider_message_id')
            .order('created_at',{ascending:false}).limit(500),
          supabase.from('orders').select('id,order_number,customer_name').order('created_at',{ascending:false}).limit(500)
        ]);
        if(emailsResult.error)throw new Error('Email queue: '+emailsResult.error.message);
        if(ordersResult.error)throw new Error('Order references: '+ordersResult.error.message);
        if(alive){setRows(emailsResult.data||[]);setOrders(ordersResult.data||[]);}
      }catch(err){if(alive){setError(err?.message||'Unable to load notification status.');setAccess(s=>s==='checking'?'error':s);}}
      finally{if(alive)setLoading(false);}
    };
    load();
    const {data:listener}=supabase.auth.onAuthStateChange(event=>{
      if(alive&&event==='SIGNED_OUT'){setAccess('login');setRows([]);}
    });
    return()=>{alive=false;listener.subscription.unsubscribe();};
  },[refresh]);

  const orderById=useMemo(()=>new Map(orders.map(o=>[o.id,o])),[orders]);
  const totals=useMemo(()=>{
    const map={pending:0,processing:0,failed:0,sent:0};
    rows.forEach(o=>{if(Object.hasOwn(map,o.status))map[o.status]++;});
    return map;
  },[rows]);
  const visible=useMemo(()=>filter==='All'?rows:rows.filter(r=>r.status===filter),[rows,filter]);

  const retry=async()=>{
    if(busy)return;
    setBusy(true);setError('');setMessage('');
    try{
      const {data:{session},error:authError}=await supabase.auth.getSession();
      if(authError||!session?.access_token)throw new Error('Please sign in again.');
      const response=await fetch('/api/admin/email-dispatch',{
        method:'POST',
        headers:{Authorization:'Bearer '+session.access_token}
      });
      const result=await response.json();
      if(!response.ok||!result.success)throw new Error(result.error||'Dispatch failed.');
      setMessage(result.accepted+' email(s) accepted by the provider; '+result.failed+' failed for later retry. Sent status means provider acceptance, not delivery.');
      setRefresh(n=>n+1);
    }catch(err){setError(err?.message||'Could not retry email jobs.');}
    finally{setBusy(false);}
  };

  if(access==='checking'||(access==='owner'&&loading&&!rows.length)){
    return <main className={styles.gate}><h1>Loading order notifications…</h1><p>Checking administrator access.</p></main>;
  }
  if(access!=='owner'){
    return <main className={styles.gate}><h1>{access==='restricted'?'Owner access only.':'Administrator sign-in required.'}</h1>
      <p>{error||'Sign in with the approved Baba Hakeem owner account.'}</p><Link href="/admin">RETURN TO ADMIN →</Link></main>;
  }

  return <main className={styles.screen}><div className={styles.wrap}>
    <header className={styles.nav}>
      <div className={styles.brand}><span>BH</span><div><b>BABA HAKEEM</b><small>HERBAL PRODUCTS / ADMIN</small></div></div>
      <div className={styles.navLinks}><Link href="/admin">← Admin</Link><Link href="/admin/operations">Order Operations</Link><Link href="/admin/reports">Sales Reports</Link></div>
    </header>

    <section className={styles.intro}>
      <div><small>04 / TRANSACTIONAL EMAIL AUTOMATION</small><h1>ORDER <em>EMAILS.</em></h1>
        <p>Monitor customer confirmations and store order alerts without changing the customer checkout.</p></div>
      <button type="button" disabled={busy||loading} onClick={()=>setRefresh(n=>n+1)}>↻ Refresh</button>
    </section>

    <section className={styles.notice}>
      <strong>Delivery setup</strong>
      <p>The sending domain, store notification inbox, Resend API key, and Cloudflare Worker secrets must be configured before emails can be sent. New orders are queued safely even while sending is disabled. Emails for older orders are not backfilled automatically.</p>
    </section>

    {error&&<p className={styles.error} role="alert">{error}</p>}
    {message&&<p className={styles.message} role="status">{message}</p>}

    <div className={styles.stats}>
      {[
        ['QUEUED',totals.pending],['PROCESSING',totals.processing],
        ['RETRY NEEDED',totals.failed],['PROVIDER ACCEPTED',totals.sent]
      ].map(([name,value])=><article key={name}><small>{name}</small><strong>{value}</strong></article>)}
    </div>

    <section className={styles.panel}>
      <div className={styles.panelTop}><div><small>OUTBOX / SUPABASE</small><h2>Notification history</h2>
        <p>{rows.length===500?'Showing the latest 500 notifications.':'Showing '+rows.length+' tracked notifications.'} Customer and store messages are tracked separately.</p>
      </div>
        <div className={styles.actions}>
          <select value={filter} onChange={e=>setFilter(e.target.value)}>{FILTERS.map(x=><option key={x} value={x}>{x==='All'?'All statuses':x}</option>)}</select>
          <button type="button" onClick={retry} disabled={busy}>{busy?'Processing…':'↻ Process pending / retry'}</button>
        </div>
      </div>
      <div className={styles.tableOuter}><table><thead><tr><th>ORDER</th><th>RECIPIENT</th><th>CREATED</th><th>STATUS</th><th>ATTEMPTS</th><th>LAST ACTIVITY</th></tr></thead><tbody>
        {visible.map(row=><tr key={row.id}>
          <td><b>{orderById.get(row.order_id)?.order_number||'Order'}</b><small>{orderById.get(row.order_id)?.customer_name||''}</small></td>
          <td><b>{row.kind==='store'?'STORE ALERT':'CUSTOMER CONFIRMATION'}</b><small>{row.kind==='store'?'Configured business inbox':row.recipient_email||'Not provided'}</small></td>
          <td>{stamp(row.created_at)}</td>
          <td><span className={styles.tag}>{row.status==='sent'?'Accepted by provider':row.status}</span>{row.last_error&&<small className={styles.problem}>{row.last_error}</small>}</td>
          <td>{row.attempts}</td><td>{stamp(row.sent_at||row.claimed_at||row.created_at)}</td>
        </tr>)}
        {!visible.length&&<tr><td className={styles.empty} colSpan={6}>No email notifications match this selection yet.</td></tr>}
      </tbody></table></div>
    </section>
    <footer className={styles.footer}>BABA HAKEEM / ORDER COMMUNICATIONS <span>Private administrative delivery log · Provider acceptance is not proof of inbox delivery</span></footer>
  </div></main>;
}
