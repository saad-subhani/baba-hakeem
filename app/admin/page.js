'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import './admin.css';

const STORAGE_KEY='baba-hakeem-admin-products-v1';
const empty={name:'',category:'Hair Care',type:'OIL',description:'',price:'',status:'Published',image:''};
const ADMIN_USER='admin';
const ADMIN_PASS='BabaHakeem@2026';
const AUTH_KEY='baba-hakeem-admin-auth-v1';

export default function AdminPage(){
  const [products,setProducts]=useState([]);
  const [form,setForm]=useState(empty);
  const [notice,setNotice]=useState('');
  const [dragging,setDragging]=useState(false);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('All');
  const [editingId,setEditingId]=useState(null);
  const [authReady,setAuthReady]=useState(false);
  const [authenticated,setAuthenticated]=useState(false);
  const [login,setLogin]=useState({username:'',password:''});
  const [loginError,setLoginError]=useState('');
  const [showPassword,setShowPassword]=useState(false);

  useEffect(()=>{
    try{
      setAuthenticated(sessionStorage.getItem(AUTH_KEY)==='true');
      setProducts(JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'));
    }catch{ setProducts([]); }
    setAuthReady(true);
  },[]);

  const published=useMemo(()=>products.filter(p=>p.status==='Published').length,[products]);
  const filtered=useMemo(()=>products.filter(p=>{
    const q=query.trim().toLowerCase();
    const matchesText=!q||[p.name,p.category,p.type,p.description].some(v=>String(v||'').toLowerCase().includes(q));
    return matchesText&&(filter==='All'||p.status===filter);
  }),[products,query,filter]);

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
    if(editingId){
      save(products.map(p=>p.id===editingId?{...p,...form,updatedAt:new Date().toISOString()}:p));
      setEditingId(null); setForm(empty); setNotice('Product updated successfully.'); return;
    }
    const item={...form,id:crypto.randomUUID?.()||String(Date.now()),createdAt:new Date().toISOString()};
    save([item,...products]);
    setForm(empty);
    setNotice('Product added successfully and is ready for the storefront on this browser.');
  };

  const remove=(id)=>{if(confirm('Delete this product?'))save(products.filter(p=>p.id!==id));};
  const toggle=(id)=>save(products.map(p=>p.id===id?{...p,status:p.status==='Published'?'Draft':'Published'}:p));
  const edit=(p)=>{setForm({name:p.name||'',category:p.category||'Other',type:p.type||'',description:p.description||'',price:p.price||'',status:p.status||'Draft',image:p.image||''});setEditingId(p.id);setNotice('Editing '+p.name);document.getElementById('add-product')?.scrollIntoView({behavior:'smooth'});};
  const cancelEdit=()=>{setEditingId(null);setForm(empty);setNotice('');};
  const signIn=(e)=>{e.preventDefault();if(login.username===ADMIN_USER&&login.password===ADMIN_PASS){sessionStorage.setItem(AUTH_KEY,'true');setAuthenticated(true);setLoginError('');setLogin({username:'',password:''});}else{setLoginError('Incorrect username or password.');}};
  const signOut=()=>{sessionStorage.removeItem(AUTH_KEY);setAuthenticated(false);setLogin({username:'',password:''});};

  if(!authReady)return <main className="admin-auth-screen"/>;
  if(!authenticated)return <main className="admin-auth-screen"><section className="login-visual"><div className="login-brand"><span className="login-mark">BH</span><small>PRIVATE ADMINISTRATION</small><h1>Baba Hakeem<br/><em>Herbal Products</em></h1><p>Secure catalogue management for the Baba Hakeem product collection.</p></div><div className="login-quote"><span>EST. / HERBAL TRADITION</span><p>Rooted in nature.<br/>Managed with care.</p></div></section><section className="login-panel"><div className="login-card"><div className="login-card-top"><span className="secure-icon">⌾</span><small>AUTHORIZED ACCESS ONLY</small></div><h2>Welcome back.</h2><p>Sign in to access product management.</p><form onSubmit={signIn}><label><span>USERNAME</span><input autoFocus autoComplete="username" value={login.username} onChange={e=>setLogin({...login,username:e.target.value})} placeholder="Enter username"/></label><label><span>PASSWORD</span><div className="password-field"><input type={showPassword?'text':'password'} autoComplete="current-password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} placeholder="Enter password"/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?'HIDE':'SHOW'}</button></div></label>{loginError&&<div className="login-error">{loginError}</div>}<button className="login-submit" type="submit"><span>SIGN IN TO DASHBOARD</span><b>→</b></button></form><div className="login-footer"><span>SECURE ADMIN PORTAL</span><Link href="/">← Return to storefront</Link></div></div></section></main>;

  return <main className="admin-shell">
    <aside className="admin-side">
      <div><span className="admin-mark">BH</span><h1>BABA HAKEEM</h1><small>HERBAL PRODUCTS / ADMIN</small></div>
      <nav><a className="active" href="#dashboard">Dashboard</a><a href="#add-product">Add Product</a><a href="#products">Products</a></nav>
      <div className="side-bottom"><button className="logout-btn" onClick={signOut}>↪ Sign out</button><Link href="/">← View storefront</Link></div>
    </aside>

    <section className="admin-main" id="dashboard">
      <header className="admin-top"><div><small>ADMIN CONSOLE / BABA HAKEEM</small><h2>Product Management</h2><p>Manage your catalogue, product visuals and publishing status from one place.</p></div><div className="top-actions"><span className="live-pill"><i/> STOREFRONT LIVE</span><Link href="/">Open website ↗</Link></div></header>

      <div className="admin-stats">
        <article><div className="stat-icon">◇</div><small>TOTAL PRODUCTS</small><strong>{products.length}</strong><span>Admin-added products</span></article>
        <article><div className="stat-icon">✓</div><small>PUBLISHED</small><strong>{published}</strong><span>Visible on storefront</span></article>
        <article><div className="stat-icon">○</div><small>DRAFTS</small><strong>{products.length-published}</strong><span>Saved, not displayed</span></article>
      </div>

      <section className="admin-panel" id="add-product">
        <div className="panel-heading"><div><small>{editingId?'PRODUCT / EDIT':'NEW PRODUCT / CREATE'}</small><h3>{editingId?'Edit product':'Add to collection'}</h3><p>{editingId?'Update the selected product and save your changes.':'Build a polished storefront product card in a few fields.'}</p></div><div className="heading-actions">{editingId&&<button type="button" onClick={cancelEdit}>Cancel edit</button>}<span>Required fields are marked *</span></div></div>
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
            <button className="publish-btn" type="submit">{editingId?'SAVE CHANGES':'ADD PRODUCT'} <span>→</span></button>
            {notice&&<p className="admin-notice">{notice}</p>}
          </div>
        </form>
      </section>

      <section className="admin-panel products-panel" id="products">
        <div className="panel-heading catalogue-heading"><div><small>CATALOGUE / MANAGE</small><h3>Uploaded products</h3><p>Search products or switch their publishing status instantly.</p></div><span>{products.length} items</span></div><div className="catalogue-tools"><label className="admin-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..."/></label><div className="filter-tabs">{['All','Published','Draft'].map(x=><button type="button" className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div></div>
        {products.length===0?<div className="empty-state"><b>＋</b><h4>No admin products yet</h4><p>Use the form above to upload the first product.</p></div>:
        <div className="admin-product-list">{filtered.length===0?<div className="no-results">No products match your search.</div>:filtered.map(p=><article key={p.id}>
          <div className="admin-thumb"><img src={p.image} alt=""/></div>
          <div className="admin-product-copy"><small>{p.category} / {p.type}</small><h4>{p.name}</h4><p>{p.description||'No description added.'}</p></div>
          <div className="admin-product-meta">{p.price&&<b>{p.price}</b>}<button className={p.status==='Published'?'published':'draft'} onClick={()=>toggle(p.id)}>{p.status}</button></div>
          <div className="row-actions"><button className="edit-product" onClick={()=>edit(p)} aria-label={'Edit '+p.name}>EDIT</button><button className="delete-product" onClick={()=>remove(p.id)} aria-label={'Delete '+p.name}>×</button></div>
        </article>)}</div>}
      </section>

      <p className="storage-note"><b>Storage note:</b> this dashboard currently stores uploaded products in the browser, so it works immediately without changing the Cloudflare deployment. A shared company-wide admin requires connecting cloud database/image storage.</p>
    </section>
  </main>
}
