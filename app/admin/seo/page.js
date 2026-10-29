'use client';

import {useEffect,useState} from 'react';
import {supabase} from '../../../lib/supabase';

const KNOWN_PAGES=['home','about','contact','faq','ingredients','care-guide','process','privacy','terms','shipping-returns'];

export default function SeoPage(){
  const [rows,setRows]=useState([]);
  const [form,setForm]=useState({id:null,page_key:'',html_title:'',meta_description:''});
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');

  const load=async()=>{
    const {data}=await supabase.from('seo_pages').select('*').order('page_key',{ascending:true});
    setRows(data||[]);
  };
  useEffect(()=>{load();},[]);

  const save=async(e)=>{
    e.preventDefault();
    if(busy)return;
    setBusy(true);setError('');setNotice('');
    const {error:rpcError}=await supabase.rpc('upsert_page_seo',{
      p_id:form.id,p_page_key:form.page_key,
      p_html_title:form.html_title,p_meta_description:form.meta_description
    });
    if(rpcError)setError(rpcError.message);
    else{setNotice('SEO settings saved for page "'+form.page_key+'".');setForm({id:null,page_key:'',html_title:'',meta_description:''});await load();}
    setBusy(false);
  };
  const remove=async(row)=>{
    if(!confirm('Remove SEO override for page "'+row.page_key+'"?'))return;
    setBusy(true);setError('');setNotice('');
    const {error:rpcError}=await supabase.rpc('delete_page_seo',{p_id:row.id});
    if(rpcError)setError(rpcError.message);
    else{setNotice('SEO entry removed.');await load();}
    setBusy(false);
  };

  const knownKeys=new Set(rows.map(r=>r.page_key));
  return <main className="admin-main" style={{minHeight:'100vh'}}>
    <header className="admin-top"><div><small>ADMIN / SEARCH OPTIMISATION</small><h2>Page SEO settings</h2><p>Set the browser tab title and meta description per page. A future storefront reads these automatically.</p></div><span>{rows.length} overrides</span></header>
    {(error||notice)&&<p className="admin-notice">{error||notice}</p>}
    <section className="admin-panel">
      <div className="panel-heading"><div><small>{form.id?'EDIT SEO ENTRY':'SET / CREATE SEO ENTRY'}</small><h3>{form.id?form.page_key:'Add page SEO'}</h3><p>Product SEO lives on the product editor; this controls other pages.</p></div></div>
      <form className="product-form" onSubmit={save}>
        <div className="form-fields" style={{maxWidth:620}}>
          <label><span>PAGE *</span><div className="slug-row">
            <input value={form.page_key} onChange={e=>setForm({...form,page_key:e.target.value})} required disabled={!!form.id} placeholder="e.g. home, about, contact"/>
          </div></label>
          {!form.id&&<div className="form-row">{KNOWN_PAGES.filter(k=>!knownKeys.has(k)).length?KNOWN_PAGES.filter(k=>!knownKeys.has(k)).map(k=><button type="button" key={k} className="admin-type-badge" onClick={()=>setForm({...form,page_key:k})} style={{cursor:'pointer',justifySelf:'start'}}>{k}</button>):<small className="hint">All known pages already have entries — type any custom key.</small>}</div>}
          <label><span>BROWSER / META TITLE</span><input value={form.html_title} onChange={e=>setForm({...form,html_title:e.target.value})} placeholder="e.g. Baba Hakeem Herbal Products — Pure Herbal Oils & Blends"/></label>
          <label><span>META DESCRIPTION</span><textarea rows="3" maxLength="320" value={form.meta_description} onChange={e=>setForm({...form,meta_description:e.target.value})} placeholder="Shown in search engine results (up to ~160 characters works best)"/></label>
          <div className="form-row">
            <button className="publish-btn" type="submit" disabled={busy}>{busy?'SAVING…':'SAVE SEO SETTINGS'} <span>→</span></button>
            {form.id&&<button type="button" onClick={()=>setForm({id:null,page_key:'',html_title:'',meta_description:''})}>Cancel</button>}
          </div>
        </div>
      </form>
    </section>
    <section className="admin-panel">
      <div className="panel-heading"><div><small>CURRENT OVERRIDES</small><h3>Configured pages</h3><p>Edit or remove existing SEO entries.</p></div></div>
      <div className="admin-product-list">{rows.map(row=><article key={row.id}>
        <div className="admin-product-copy"><small>{row.page_key}</small><h4>{row.html_title||row.page_key}</h4><p>{row.meta_description||'No meta description set.'}</p></div>
        <div className="row-actions">
          <button className="edit-product" onClick={()=>setForm({id:row.id,page_key:row.page_key,html_title:row.html_title||'',meta_description:row.meta_description||''})}>EDIT</button>
          <button className="delete-product" onClick={()=>remove(row)} aria-label={'Remove '+row.page_key}>×</button>
        </div>
      </article>)}</div>
    </section>
  </main>;
}
