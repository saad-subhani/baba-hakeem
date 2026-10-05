'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import './admin.css';
import { supabase } from '../../lib/supabase';

const empty={name:'',category:'Hair Care',type:'OIL',description:'',price:'',status:'Published',image:''};

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
  const [login,setLogin]=useState({email:'',password:''});
  const [loginError,setLoginError]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [passwordForm,setPasswordForm]=useState({current:'',next:'',confirm:''});
  const [securityNotice,setSecurityNotice]=useState('');

  useEffect(()=>{
    let mounted=true;
    const loadProducts=async()=>{
      const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});
      if(mounted){if(error)setNotice(error.message);else setProducts(data||[]);}
    };
    supabase.auth.getSession().then(({data})=>{if(!mounted)return;const ok=!!data.session;setAuthenticated(ok);setAuthReady(true);if(ok)loadProducts();});
    const {data:listener}=supabase.auth.onAuthStateChange((_event,session)=>{if(!mounted)return;setAuthenticated(!!session);setAuthReady(true);if(session)loadProducts();else setProducts([]);});
    return()=>{mounted=false;listener.subscription.unsubscribe();};
  },[]);

  const published=useMemo(()=>products.filter(p=>p.status==='Published').length,[products]);
  const filtered=useMemo(()=>products.filter(p=>{
    const q=query.trim().toLowerCase();
    const matchesText=!q||[p.name,p.category,p.type,p.description].some(v=>String(v||'').toLowerCase().includes(q));
    return matchesText&&(filter==='All'||p.status===filter);
  }),[products,query,filter]);

  const refreshProducts=async()=>{
    const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});
    if(error){setNotice(error.message);return false;}
    setProducts(data||[]);return true;
  };

  const readImage=(file)=>{
    if(!file)return;
    if(!file.type.startsWith('image/')){setNotice('Please choose an image file.');return;}
    if(file.size>4*1024*1024){setNotice('Please use an image smaller than 4 MB.');return;}
    const reader=new FileReader();
    setForm(v=>({...v,image:file}));setNotice('Image ready to upload.');
  };

  const uploadImage=async(file)=>{
    if(typeof file==='string')return {url:file,path:null};
    const ext=(file.name.split('.').pop()||'webp').toLowerCase();
    const path=`${crypto.randomUUID?.()||Date.now()}.${ext}`;
    const {error}=await supabase.storage.from('product-images').upload(path,file,{cacheControl:'3600',upsert:false});
    if(error)throw error;
    return {url:supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl,path};
  };

  const submit=async(e)=>{
    e.preventDefault();
    if(!form.name.trim()||!form.image){setNotice('Product name and image are required.');return;}
    try{
      setNotice(editingId?'Saving changes...':'Uploading product...');
      const uploaded=await uploadImage(form.image);
      const payload={name:form.name.trim(),category:form.category,type:form.type,description:form.description,price:form.price,status:form.status,image:uploaded.url,updated_at:new Date().toISOString()};
      if(uploaded.path)payload.image_path=uploaded.path;
      if(editingId){
        const old=products.find(p=>p.id===editingId);
        const {error}=await supabase.from('products').update(payload).eq('id',editingId);
        if(error)throw error;
        if(uploaded.path&&old?.image_path)await supabase.storage.from('product-images').remove([old.image_path]);
        setEditingId(null);setForm(empty);await refreshProducts();setNotice('Product updated successfully on the live database.');return;
      }
      const {error}=await supabase.from('products').insert(payload);
      if(error)throw error;
      setForm(empty);await refreshProducts();setNotice('Product added successfully to the live storefront.');
    }catch(err){setNotice(err?.message||'Could not save product.');}
  };

  const remove=async(id)=>{
    if(!confirm('Delete this product?'))return;
    const old=products.find(p=>p.id===id);
    const {error}=await supabase.from('products').delete().eq('id',id);
    if(error){setNotice(error.message);return;}
    if(old?.image_path)await supabase.storage.from('product-images').remove([old.image_path]);
    await refreshProducts();setNotice('Product deleted.');
  };
  const toggle=async(id)=>{
    const p=products.find(x=>x.id===id);if(!p)return;
    const {error}=await supabase.from('products').update({status:p.status==='Published'?'Draft':'Published',updated_at:new Date().toISOString()}).eq('id',id);
    if(error){setNotice(error.message);return;}await refreshProducts();
  };
  const edit=(p)=>{setForm({name:p.name||'',category:p.category||'Other',type:p.type||'',description:p.description||'',price:p.price||'',status:p.status||'Draft',image:p.image||''});setEditingId(p.id);setNotice('Editing '+p.name);document.getElementById('add-product')?.scrollIntoView({behavior:'smooth'});};
  const cancelEdit=()=>{setEditingId(null);setForm(empty);setNotice('');};
  const signIn=async(e)=>{e.preventDefault();setLoginError('');const {error}=await supabase.auth.signInWithPassword({email:login.email.trim(),password:login.password});if(error)setLoginError(error.message);};
  const signOut=async()=>{await supabase.auth.signOut();setAuthenticated(false);};
  const changePassword=async(e)=>{e.preventDefault();setSecurityNotice('');if(passwordForm.next.length<8){setSecurityNotice('New password must be at least 8 characters.');return;}if(passwordForm.next!==passwordForm.confirm){setSecurityNotice('New passwords do not match.');return;}const {data:{user}}=await supabase.auth.getUser();if(!user?.email){setSecurityNotice('Could not verify the signed-in admin.');return;}const {error:verifyError}=await supabase.auth.signInWithPassword({email:user.email,password:passwordForm.current});if(verifyError){setSecurityNotice('Current password is incorrect.');return;}const {error}=await supabase.auth.updateUser({password:passwordForm.next});if(error){setSecurityNotice(error.message);return;}setPasswordForm({current:'',next:'',confirm:''});setSecurityNotice('Password changed successfully.');};

  if(!authReady)return <main className="admin-auth-screen"/>;
  if(!authenticated)return <main className="admin-auth-screen"><section className="login-visual"><div className="login-brand"><span className="login-mark">BH</span><small>PRIVATE ADMINISTRATION</small><h1>Baba Hakeem<br/><em>Herbal Products</em></h1><p>Secure catalogue management for the Baba Hakeem product collection.</p></div><div className="login-quote"><span>EST. / HERBAL TRADITION</span><p>Rooted in nature.<br/>Managed with care.</p></div></section><section className="login-panel"><div className="login-card"><div className="login-card-top"><span className="secure-icon">⌾</span><small>AUTHORIZED ACCESS ONLY</small></div><h2>Welcome back.</h2><p>Sign in to access product management.</p><form onSubmit={signIn}><label><span>EMAIL</span><input autoFocus autoComplete="username" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} placeholder="admin@company.com"/></label><label><span>PASSWORD</span><div className="password-field"><input type={showPassword?'text':'password'} autoComplete="current-password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} placeholder="Enter password"/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?'HIDE':'SHOW'}</button></div></label>{loginError&&<div className="login-error">{loginError}</div>}<button className="login-submit" type="submit"><span>SIGN IN TO DASHBOARD</span><b>→</b></button></form><div className="login-footer"><span>SECURE ADMIN PORTAL</span><Link href="/">← Return to storefront</Link></div></div></section></main>;

  return <main className="admin-shell">
    <aside className="admin-side">
      <div><span className="admin-mark">BH</span><h1>BABA HAKEEM</h1><small>HERBAL PRODUCTS / ADMIN</small></div>
      <nav><a className="active" href="#dashboard">Dashboard</a><a href="#add-product">Add Product</a><a href="#products">Products</a><a href="#security">Security</a></nav>
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
              {form.image?<img src={typeof form.image==='string'?form.image:URL.createObjectURL(form.image)} alt="Product preview"/>:<><b>＋</b><strong>UPLOAD PRODUCT IMAGE</strong><span>Drop image here or click to browse<br/>PNG / JPG / WEBP · max 4 MB</span></>}
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

      <section className="admin-panel security-panel" id="security"><div className="panel-heading"><div><small>ACCOUNT / SECURITY</small><h3>Change password</h3><p>Update the password for the currently signed-in Supabase administrator.</p></div></div><form className="security-form" onSubmit={changePassword}><label><span>CURRENT PASSWORD</span><input type="password" value={passwordForm.current} onChange={e=>setPasswordForm({...passwordForm,current:e.target.value})} required/></label><label><span>NEW PASSWORD</span><input type="password" value={passwordForm.next} onChange={e=>setPasswordForm({...passwordForm,next:e.target.value})} minLength="8" required/></label><label><span>CONFIRM NEW PASSWORD</span><input type="password" value={passwordForm.confirm} onChange={e=>setPasswordForm({...passwordForm,confirm:e.target.value})} minLength="8" required/></label><button className="publish-btn" type="submit">CHANGE PASSWORD <span>→</span></button>{securityNotice&&<p className="admin-notice">{securityNotice}</p>}</form></section>

      <p className="storage-note"><b>Live storage:</b> products are stored in Supabase Database and product images in Supabase Storage. Changes made here are shared across devices and the live storefront.</p>
    </section>
  </main>
}
