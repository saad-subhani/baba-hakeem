'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import './admin.css';

const STORAGE_KEY='baba-hakeem-admin-products-v1';
const empty={name:'',category:'Hair Care',type:'OIL',description:'',price:'',status:'Published',image:''};

export default function AdminPage(){
  const [products,setProducts]=useState([]);
  const [form,setForm]=useState(empty);
  const [notice,setNotice]=useState('');
  const [dragging,setDragging]=useState(false);

  useEffect(()=>{
    try{ setProducts(JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')); }catch{ setProducts([]); }
  },[]);

  const published=useMemo(()=>products.filter(p=>p.status==='Published').length,[products]);

  const save=(next)=>{
    setProducts(next);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
    window.dispatchEvent(new Event('baba-products-updated'));
  };

  const readImage=(file)=>{
    if(!file)return;
    if(!file.type.startsWith('image/')){setNotice('Please choose an image file.');return;}
    if(file.size>4*1024*1024){setNotice('Please use an image smaller than 4 MB.');return;}
    const reader=new FileReader();
    reader.onload=()=>{setForm(v=>({...v,image:reader.result}));setNotice('Image ready.');};
    reader.readAsDataURL(file);
  };

  const submit=(e)=>{
    e.preventDefault();
    if(!form.name.trim()||!form.image){setNotice('Product name and image are required.');return;}
    const item={...form,id:crypto.randomUUID?.()||String(Date.now()),createdAt:new Date().toISOString()};
    save([item,...products]);
    setForm(empty);
    setNotice('Product added successfully and is ready for the storefront on this browser.');
  };

  const remove=(id)=>{if(confirm('Delete this product?'))save(products.filter(p=>p.id!==id));};
  const toggle=(id)=>save(products.map(p=>p.id===id?{...p,status:p.status==='Published'?'Draft':'Published'}:p));

  return <main className="admin-shell">
    <aside className="admin-side">
      <div><span className="admin-mark">BH</span><h1>BABA HAKEEM</h1><small>HERBAL PRODUCTS / ADMIN</small></div>
      <nav><a className="active" href="#dashboard">Dashboard</a><a href="#add-product">Add Product</a><a href="#products">Products</a></nav>
      <Link href="/">← View storefront</Link>
    </aside>

    <section className="admin-main" id="dashboard">
      <header className="admin-top"><div><small>ADMIN CONSOLE</small><h2>Product Management</h2></div><Link href="/">Open website ↗</Link></header>

      <div className="admin-stats">
        <article><small>TOTAL PRODUCTS</small><strong>{products.length}</strong><span>Admin-added products</span></article>
        <article><small>PUBLISHED</small><strong>{published}</strong><span>Visible on storefront</span></article>
        <article><small>DRAFTS</small><strong>{products.length-published}</strong><span>Saved, not displayed</span></article>
      </div>

      <section className="admin-panel" id="add-product">
        <div className="panel-heading"><div><small>NEW PRODUCT</small><h3>Add to collection</h3></div><span>Required fields are marked *</span></div>
        <form className="product-form" onSubmit={submit}>
          <div className="form-fields">
            <label><span>PRODUCT NAME *</span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Herbal Hair Oil" required/></label>
            <div className="form-row">
              <label><span>CATEGORY</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Hair Care</option><option>Joint Care</option><option>Men's Care</option><option>Herbal Blend</option><option>Saffron</option><option>Other</option></select></label>
              <label><span>TYPE</span><input value={form.type} onChange={e=>setForm({...form,type:e.target.value})} placeholder="OIL / POWDER / SAFFRON"/></label>
            </div>
            <label><span>DESCRIPTION</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Short product description" rows="4"/></label>
            <div className="form-row">
              <label><span>PRICE (OPTIONAL)</span><input value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="e.g. Rs 1,250"/></label>
              <label><span>STATUS</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Published</option><option>Draft</option></select></label>
            </div>
          </div>
          <div className="upload-column">
            <label className={'upload-box '+(dragging?'dragging':'')} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);readImage(e.dataTransfer.files[0])}}>
              {form.image?<img src={form.image} alt="Product preview"/>:<><b>＋</b><strong>UPLOAD PRODUCT IMAGE</strong><span>Drop image here or click to browse<br/>PNG / JPG / WEBP · max 4 MB</span></>}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>readImage(e.target.files?.[0])}/>
            </label>
            {form.image&&<button className="replace-image" type="button" onClick={()=>setForm({...form,image:''})}>Remove image</button>}
            <button className="publish-btn" type="submit">ADD PRODUCT <span>→</span></button>
            {notice&&<p className="admin-notice">{notice}</p>}
          </div>
        </form>
      </section>

      <section className="admin-panel products-panel" id="products">
        <div className="panel-heading"><div><small>CATALOGUE</small><h3>Uploaded products</h3></div><span>{products.length} items</span></div>
        {products.length===0?<div className="empty-state"><b>＋</b><h4>No admin products yet</h4><p>Use the form above to upload the first product.</p></div>:
        <div className="admin-product-list">{products.map(p=><article key={p.id}>
          <div className="admin-thumb"><img src={p.image} alt=""/></div>
          <div className="admin-product-copy"><small>{p.category} / {p.type}</small><h4>{p.name}</h4><p>{p.description||'No description added.'}</p></div>
          <div className="admin-product-meta">{p.price&&<b>{p.price}</b>}<button className={p.status==='Published'?'published':'draft'} onClick={()=>toggle(p.id)}>{p.status}</button></div>
          <button className="delete-product" onClick={()=>remove(p.id)} aria-label={'Delete '+p.name}>×</button>
        </article>)}</div>}
      </section>

      <p className="storage-note"><b>Storage note:</b> this dashboard currently stores uploaded products in the browser, so it works immediately without changing the Cloudflare deployment. A shared company-wide admin requires connecting cloud database/image storage.</p>
    </section>
  </main>
}
