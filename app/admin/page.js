'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import './admin.css';
import { supabase } from '../../lib/supabase';

const empty={name:'',category:'Hair Care',type:'OIL',description:'',price:'',status:'Published',image:'',stock_status:'In Stock',stock_quantity:0,featured:false,sort_order:0,whatsapp_number:''};

export default function AdminPage(){
  const [products,setProducts]=useState([]);
  const [orders,setOrders]=useState([]);
  const [orderFilter,setOrderFilter]=useState('All');
  const [orderQuery,setOrderQuery]=useState('');
  const [orderSort,setOrderSort]=useState('Newest');
  const [form,setForm]=useState(empty);
  const [notice,setNotice]=useState('');
  const [dragging,setDragging]=useState(false);
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState('All');
  const [sort,setSort]=useState('Newest');
  const [editingId,setEditingId]=useState(null);
  const [authReady,setAuthReady]=useState(false);
  const [authenticated,setAuthenticated]=useState(false);
  const [login,setLogin]=useState({email:'',password:''});
  const [loginError,setLoginError]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [recovery,setRecovery]=useState({open:false,busy:false,message:'',error:''});
  const [resetMode,setResetMode]=useState(false);
  const [resetForm,setResetForm]=useState({password:'',confirm:''});
  const [passwordForm,setPasswordForm]=useState({current:'',next:'',confirm:''});
  const [securityNotice,setSecurityNotice]=useState('');

  useEffect(()=>{
    let mounted=true;
    const loadOrders=async()=>{const {data,error}=await supabase.from('orders').select('*').order('created_at',{ascending:false});if(mounted&&!error)setOrders(data||[]);};
    const loadProducts=async()=>{
      const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});
      if(mounted){if(error)setNotice(error.message);else setProducts(data||[]);}
    };
    supabase.auth.getSession().then(({data})=>{if(!mounted)return;const ok=!!data.session;setAuthenticated(ok);setAuthReady(true);if(ok){loadProducts();loadOrders();}});
    const {data:listener}=supabase.auth.onAuthStateChange((event,session)=>{if(!mounted)return;if(event==='PASSWORD_RECOVERY'){setResetMode(true);setAuthenticated(false);setAuthReady(true);return;}setAuthenticated(!!session);setAuthReady(true);if(session){loadProducts();loadOrders();}else{setProducts([]);setOrders([]);}});
    return()=>{mounted=false;listener.subscription.unsubscribe();};
  },[]);

  const pendingOrders=useMemo(()=>orders.filter(o=>o.status==='Pending').length,[orders]);
  const revenue=useMemo(()=>orders.filter(o=>o.status==='Delivered').reduce((sum,o)=>sum+Number(o.total_amount||0),0),[orders]);
  const lowStock=useMemo(()=>products.filter(p=>p.stock_status==='Low Stock'||(Number(p.stock_quantity)>0&&Number(p.stock_quantity)<=5)).length,[products]);
  const visibleOrders=useMemo(()=>orders.filter(o=>{
    const q=orderQuery.trim().toLowerCase();
    const matchesStatus=orderFilter==='All'||o.status===orderFilter;
    const matchesText=!q||[o.order_number,o.product_name,o.customer_name,o.phone,o.city,o.address].some(v=>String(v||'').toLowerCase().includes(q));
    return matchesStatus&&matchesText;
  }).sort((a,b)=>orderSort==='Oldest'?new Date(a.created_at)-new Date(b.created_at):orderSort==='Amount'?Number(b.total_amount||0)-Number(a.total_amount||0):new Date(b.created_at)-new Date(a.created_at)),[orders,orderFilter,orderQuery,orderSort]);
  const refreshOrders=async()=>{const {data,error}=await supabase.from('orders').select('*').order('created_at',{ascending:false});if(error){setNotice(error.message);return;}setOrders(data||[]);};
  const updateOrderStatus=async(order,status)=>{const previous=order.status;const {error}=await supabase.from('orders').update({status,updated_at:new Date().toISOString()}).eq('id',order.id);if(error){setNotice(error.message);return;}if(status==='Confirmed'&&previous==='Pending'&&order.product_id){const p=products.find(x=>x.id===order.product_id);if(p&&Number(p.stock_quantity)>0){const qty=Math.max(0,Number(p.stock_quantity)-Number(order.quantity));await supabase.from('products').update({stock_quantity:qty,stock_status:qty===0?'Out of Stock':qty<=5?'Low Stock':'In Stock',updated_at:new Date().toISOString()}).eq('id',p.id);await refreshProducts();}}await refreshOrders();};
  const deleteOrder=async(id)=>{if(!confirm('Delete this order record?'))return;const {error}=await supabase.from('orders').delete().eq('id',id);if(error)setNotice(error.message);else refreshOrders();};

  const confirmedOrders=useMemo(()=>orders.filter(o=>o.status==='Confirmed').length,[orders]);
  const shippedOrders=useMemo(()=>orders.filter(o=>o.status==='Shipped').length,[orders]);
  const deliveredOrders=useMemo(()=>orders.filter(o=>o.status==='Delivered').length,[orders]);
  const unitsSold=useMemo(()=>orders.filter(o=>o.status==='Delivered').reduce((sum,o)=>sum+Number(o.quantity||0),0),[orders]);

  const published=useMemo(()=>products.filter(p=>p.status==='Published').length,[products]);
  const filtered=useMemo(()=>products.filter(p=>{
    const q=query.trim().toLowerCase();
    const matchesText=!q||[p.name,p.category,p.type,p.description].some(v=>String(v||'').toLowerCase().includes(q));
    return matchesText&&(filter==='All'||p.status===filter);
  }).sort((a,b)=>{
    if(sort==='Name')return String(a.name).localeCompare(String(b.name));
    if(sort==='Order')return Number(a.sort_order||0)-Number(b.sort_order||0);
    return new Date(b.created_at)-new Date(a.created_at);
  }),[products,query,filter,sort]);

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
      const slug=(form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||'product')+'-'+(editingId?String(editingId).slice(0,8):(crypto.randomUUID?.()||Date.now()).toString().slice(0,8));
      const payload={name:form.name.trim(),slug,category:form.category,type:form.type,description:form.description,price:form.price,status:form.status,image:uploaded.url,stock_status:form.stock_status,featured:!!form.featured,sort_order:Number(form.sort_order||0),whatsapp_number:form.whatsapp_number.trim(),stock_quantity:Math.max(0,Number(form.stock_quantity||0)),updated_at:new Date().toISOString()};
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
  const edit=(p)=>{setForm({name:p.name||'',category:p.category||'Other',type:p.type||'',description:p.description||'',price:p.price||'',status:p.status||'Draft',image:p.image||'',stock_status:p.stock_status||'In Stock',featured:!!p.featured,sort_order:p.sort_order||0,whatsapp_number:p.whatsapp_number||'',stock_quantity:p.stock_quantity||0});setEditingId(p.id);setNotice('Editing '+p.name);document.getElementById('add-product')?.scrollIntoView({behavior:'smooth'});};
  const cancelEdit=()=>{setEditingId(null);setForm(empty);setNotice('');};
  const signIn=async(e)=>{e.preventDefault();setLoginError('');const {error}=await supabase.auth.signInWithPassword({email:login.email.trim(),password:login.password});if(error)setLoginError(error.message);};
  const requestReset=async()=>{const email=login.email.trim();if(!email){setRecovery({open:true,busy:false,message:'',error:'Enter your admin email above first.'});return;}setRecovery({open:true,busy:true,message:'',error:''});const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/admin'});setRecovery({open:true,busy:false,message:error?'':'Password reset email sent. Check your inbox and open the secure reset link.',error:error?.message||''});};
  const finishReset=async(e)=>{e.preventDefault();if(resetForm.password.length<8){setRecovery(v=>({...v,error:'New password must be at least 8 characters.',message:''}));return;}if(resetForm.password!==resetForm.confirm){setRecovery(v=>({...v,error:'Passwords do not match.',message:''}));return;}setRecovery(v=>({...v,busy:true,error:'',message:''}));const {error}=await supabase.auth.updateUser({password:resetForm.password});if(error){setRecovery(v=>({...v,busy:false,error:error.message}));return;}setResetForm({password:'',confirm:''});setResetMode(false);setAuthenticated(true);setRecovery({open:false,busy:false,error:'',message:''});};
  const signOut=async()=>{await supabase.auth.signOut();setAuthenticated(false);};
  const changePassword=async(e)=>{e.preventDefault();setSecurityNotice('');if(passwordForm.next.length<8){setSecurityNotice('New password must be at least 8 characters.');return;}if(passwordForm.next!==passwordForm.confirm){setSecurityNotice('New passwords do not match.');return;}const {data:{user}}=await supabase.auth.getUser();if(!user?.email){setSecurityNotice('Could not verify the signed-in admin.');return;}const {error:verifyError}=await supabase.auth.signInWithPassword({email:user.email,password:passwordForm.current});if(verifyError){setSecurityNotice('Current password is incorrect.');return;}const {error}=await supabase.auth.updateUser({password:passwordForm.next});if(error){setSecurityNotice(error.message);return;}setPasswordForm({current:'',next:'',confirm:''});setSecurityNotice('Password changed successfully.');};

  if(!authReady)return <main className="admin-auth-screen"/>;
  if(resetMode)return <main className="admin-auth-screen reset-auth-screen"><section className="login-panel reset-panel"><div className="login-card"><div className="login-card-top"><span className="secure-icon">⌾</span><small>SECURE PASSWORD RESET</small></div><h2>Create new password.</h2><p>Choose a new password for your Baba Hakeem admin account.</p><form onSubmit={finishReset}><label><span>NEW PASSWORD</span><input type="password" autoFocus minLength="8" required value={resetForm.password} onChange={e=>setResetForm({...resetForm,password:e.target.value})} placeholder="Minimum 8 characters"/></label><label><span>CONFIRM PASSWORD</span><input type="password" minLength="8" required value={resetForm.confirm} onChange={e=>setResetForm({...resetForm,confirm:e.target.value})} placeholder="Repeat new password"/></label>{recovery.error&&<div className="login-error">{recovery.error}</div>}<button className="login-submit" disabled={recovery.busy} type="submit"><span>{recovery.busy?'UPDATING...':'SET NEW PASSWORD'}</span><b>→</b></button></form></div></section></main>;
  if(!authenticated)return <main className="admin-auth-screen"><section className="login-visual"><div className="login-brand"><span className="login-mark">BH</span><small>PRIVATE ADMINISTRATION</small><h1>Baba Hakeem<br/><em>Herbal Products</em></h1><p>Secure catalogue management for the Baba Hakeem product collection.</p></div><div className="login-quote"><span>EST. / HERBAL TRADITION</span><p>Rooted in nature.<br/>Managed with care.</p></div></section><section className="login-panel"><div className="login-card"><div className="login-card-top"><span className="secure-icon">⌾</span><small>AUTHORIZED ACCESS ONLY</small></div><h2>Welcome back.</h2><p>Sign in to access product management.</p><form onSubmit={signIn}><label><span>EMAIL</span><input autoFocus autoComplete="username" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} placeholder="admin@company.com"/></label><label><span>PASSWORD</span><div className="password-field"><input type={showPassword?'text':'password'} autoComplete="current-password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} placeholder="Enter password"/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?'HIDE':'SHOW'}</button></div></label>{loginError&&<div className="login-error">{loginError}</div>}<button className="login-submit" type="submit"><span>SIGN IN TO DASHBOARD</span><b>→</b></button><button className="forgot-password" type="button" onClick={requestReset}>FORGOT PASSWORD?</button>{recovery.open&&(recovery.error||recovery.message)&&<div className={recovery.error?'login-error':'recovery-success'}>{recovery.error||recovery.message}</div>}</form><div className="login-footer"><span>SECURE ADMIN PORTAL</span><Link href="/">← Return to storefront</Link></div></div></section></main>;

  return <main className="admin-shell">
    <aside className="admin-side">
      <div><span className="admin-mark">BH</span><h1>BABA HAKEEM</h1><small>HERBAL PRODUCTS / ADMIN</small></div>
      <nav><a className="active" href="#dashboard">Dashboard</a><a href="#orders">Orders</a><a href="#add-product">Add Product</a><a href="#products">Products</a><a href="#security">Security</a></nav>
      <div className="side-bottom"><button className="logout-btn" onClick={signOut}>↪ Sign out</button><Link href="/">← View storefront</Link></div>
    </aside>

    <section className="admin-main" id="dashboard">
      <header className="admin-top"><div><small>ADMIN CONSOLE / BABA HAKEEM</small><h2>Product Management</h2><p>Manage your catalogue, product visuals and publishing status from one place.</p></div><div className="top-actions"><span className="live-pill"><i/> STOREFRONT LIVE</span><Link href="/">Open website ↗</Link></div></header>

      <div className="admin-stats commerce-stats">
        <article><div className="stat-icon">◇</div><small>TOTAL PRODUCTS</small><strong>{products.length}</strong><span>{published} published</span></article>
        <article><div className="stat-icon">◎</div><small>TOTAL ORDERS</small><strong>{orders.length}</strong><span>{pendingOrders} pending</span></article>
        <article><div className="stat-icon">↗</div><small>DELIVERED REVENUE</small><strong>{revenue.toLocaleString()}</strong><span>From delivered orders</span></article>
        <article><div className="stat-icon">!</div><small>LOW STOCK</small><strong>{lowStock}</strong><span>Products need attention</span></article>
      </div>
      <section className="admin-panel orders-panel" id="orders"><div className="panel-heading"><div><small>ORDERS / LIVE</small><h3>Customer orders</h3><p>Track incoming orders from request to delivery.</p></div><span>{orders.length} orders</span></div><div className="order-summary"><span><b>{pendingOrders}</b> Pending</span><span><b>{confirmedOrders}</b> Confirmed</span><span><b>{shippedOrders}</b> Shipped</span><span><b>{deliveredOrders}</b> Delivered</span><span><b>{unitsSold}</b> Units sold</span></div><div className="orders-toolbar"><label className="order-search"><span>⌕</span><input value={orderQuery} onChange={e=>setOrderQuery(e.target.value)} placeholder="Search order, customer, phone, city..."/></label><select value={orderSort} onChange={e=>setOrderSort(e.target.value)}><option>Newest</option><option>Oldest</option><option>Amount</option></select></div><div className="order-filter-tabs">{['All','Pending','Confirmed','Shipped','Delivered','Cancelled'].map(x=><button key={x} className={orderFilter===x?'active':''} onClick={()=>setOrderFilter(x)}>{x}</button>)}</div>{visibleOrders.length===0?<div className="empty-state"><b>◎</b><h4>No orders here</h4><p>No orders match the current search/filter.</p></div>:<div className="orders-list">{visibleOrders.map(o=><article key={o.id}><div className="order-id"><small>{o.order_number}</small><b>{o.product_name}</b><span>{new Date(o.created_at).toLocaleString()}</span></div><div className="order-customer"><b>{o.customer_name}</b><span><a href={'tel:'+o.phone}>{o.phone}</a> · {o.city}</span><p>{o.address}</p>{o.notes&&<em>{o.notes}</em>}</div><div className="order-money"><span>{o.quantity} × {Number(o.unit_price||0).toLocaleString()}</span><b>{Number(o.total_amount||0).toLocaleString()}</b></div><div className="order-actions"><a className="order-wa" href={'https://wa.me/'+String(o.phone||'').replace(/\D/g,'').replace(/^0/,'92')+'?text='+encodeURIComponent('Hello '+o.customer_name+', regarding your Baba Hakeem order '+o.order_number+'.')} target="_blank" rel="noopener noreferrer">WHATSAPP ↗</a><select value={o.status} onChange={e=>updateOrderStatus(o,e.target.value)}>{['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(x=><option key={x}>{x}</option>)}</select><button onClick={()=>deleteOrder(o.id)}>DELETE</button></div></article>)}</div>}</section>

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
            <div className="form-row">
              <label><span>STOCK</span><select value={form.stock_status} onChange={e=>setForm({...form,stock_status:e.target.value})}><option>In Stock</option><option>Low Stock</option><option>Out of Stock</option></select></label>
              <label><span>DISPLAY ORDER</span><input type="number" value={form.sort_order} onChange={e=>setForm({...form,sort_order:e.target.value})} placeholder="0"/></label>
            </div>
            <div className="form-row"><label><span>STOCK QUANTITY</span><input type="number" min="0" value={form.stock_quantity} onChange={e=>setForm({...form,stock_quantity:e.target.value})}/></label><label><span>WHATSAPP NUMBER (OPTIONAL)</span><input value={form.whatsapp_number} onChange={e=>setForm({...form,whatsapp_number:e.target.value})} placeholder="e.g. 923001234567"/></label></div>
            <label className="feature-check"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/><span>FEATURE THIS PRODUCT</span></label>
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
        <div className="panel-heading catalogue-heading"><div><small>CATALOGUE / MANAGE</small><h3>Uploaded products</h3><p>Search products or switch their publishing status instantly.</p></div><span>{products.length} items</span></div><div className="catalogue-tools"><label className="admin-search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..."/></label><div className="filter-tabs">{['All','Published','Draft'].map(x=><button type="button" className={filter===x?'active':''} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div><select className="admin-sort" value={sort} onChange={e=>setSort(e.target.value)}><option>Newest</option><option>Name</option><option>Order</option></select></div>
        {products.length===0?<div className="empty-state"><b>＋</b><h4>No admin products yet</h4><p>Use the form above to upload the first product.</p></div>:
        <div className="admin-product-list">{filtered.length===0?<div className="no-results">No products match your search.</div>:filtered.map(p=><article key={p.id}>
          <div className="admin-thumb"><img src={p.image} alt=""/></div>
          <div className="admin-product-copy"><small>{p.category} / {p.type} / {p.stock_status||'In Stock'}{p.featured?' / FEATURED':''}</small><h4>{p.name}</h4><p>{p.description||'No description added.'}</p></div>
          <div className="admin-product-meta">{p.price&&<b>{p.price}</b>}<span className={(Number(p.stock_quantity)<=5?'stock-alert ':'')+'stock-count'}>{Number(p.stock_quantity||0)} in stock</span><button className={p.status==='Published'?'published':'draft'} onClick={()=>toggle(p.id)}>{p.status}</button></div>
          <div className="row-actions"><button className="edit-product" onClick={()=>edit(p)} aria-label={'Edit '+p.name}>EDIT</button><button className="delete-product" onClick={()=>remove(p.id)} aria-label={'Delete '+p.name}>×</button></div>
        </article>)}</div>}
      </section>

      <section className="admin-panel security-panel" id="security"><div className="panel-heading"><div><small>ACCOUNT / SECURITY</small><h3>Change password</h3><p>Update the password for the currently signed-in Supabase administrator.</p></div></div><form className="security-form" onSubmit={changePassword}><label><span>CURRENT PASSWORD</span><input type="password" value={passwordForm.current} onChange={e=>setPasswordForm({...passwordForm,current:e.target.value})} required/></label><label><span>NEW PASSWORD</span><input type="password" value={passwordForm.next} onChange={e=>setPasswordForm({...passwordForm,next:e.target.value})} minLength="8" required/></label><label><span>CONFIRM NEW PASSWORD</span><input type="password" value={passwordForm.confirm} onChange={e=>setPasswordForm({...passwordForm,confirm:e.target.value})} minLength="8" required/></label><button className="publish-btn" type="submit">CHANGE PASSWORD <span>→</span></button>{securityNotice&&<p className="admin-notice">{securityNotice}</p>}</form></section>

      <p className="storage-note"><b>Live storage:</b> products are stored in Supabase Database and product images in Supabase Storage. Changes made here are shared across devices and the live storefront.</p>
    </section>
  </main>
}
