'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import './admin.css';
import { supabase } from '../../lib/supabase';

const orderTransitions={Pending:['Confirmed','Cancelled'],Confirmed:['Shipped','Cancelled'],Shipped:['Delivered'],Delivered:[],Cancelled:[]};

const empty={name:'',category:'Hair Care',type:'OIL',description:'',price:'',status:'Draft',image:'',stock_status:'Out of Stock',stock_quantity:0,featured:false,sort_order:0,whatsapp_number:''};

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
  const [authMode,setAuthMode]=useState('login');
  const [register,setRegister]=useState({email:'',password:'',confirm:''});
  const [registerState,setRegisterState]=useState({busy:false,error:'',message:''});
  const [loginError,setLoginError]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [recovery,setRecovery]=useState({open:false,busy:false,message:'',error:''});
  const [resetMode,setResetMode]=useState(false);
  const [resetForm,setResetForm]=useState({password:'',confirm:''});
  const [passwordForm,setPasswordForm]=useState({current:'',next:'',confirm:''});
  const [securityNotice,setSecurityNotice]=useState('');
  const [owner,setOwner]=useState({checked:false,hasOwner:false,isOwner:false,email:''});
  const [transferEmail,setTransferEmail]=useState('');
  const [transferNotice,setTransferNotice]=useState('');
  const [pendingTransfer,setPendingTransfer]=useState(null);

  useEffect(()=>{
    let mounted=true;
    const checkOwner=async(session)=>{const {data,error}=await supabase.rpc('admin_owner_status');if(!mounted)return false;if(error){setOwner({checked:true,hasOwner:true,isOwner:false,email:''});return false;}const row=Array.isArray(data)?data[0]:data;const next={checked:true,hasOwner:!!row?.has_owner,isOwner:!!row?.is_owner,email:row?.owner_email||''};setOwner(next);if(next.isOwner){const {data:inv}=await supabase.rpc('current_admin_transfer_invite');setPendingTransfer(Array.isArray(inv)?inv[0]||null:inv||null);}return next.isOwner;};
    const loadOrders=async()=>{const {data,error}=await supabase.from('orders').select('*').order('created_at',{ascending:false});if(mounted&&!error)setOrders(data||[]);};
    const loadProducts=async()=>{
      const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false});
      if(mounted){if(error)setNotice(error.message);else setProducts(data||[]);}
    };
    supabase.auth.getSession().then(async({data})=>{if(!mounted)return;const ok=!!data.session;setAuthenticated(ok);if(ok){const allowed=await checkOwner(data.session);if(allowed){loadProducts();loadOrders();}}else await checkOwner(null);setAuthReady(true);});
    const {data:listener}=supabase.auth.onAuthStateChange(async(event,session)=>{if(!mounted)return;if(event==='PASSWORD_RECOVERY'){setResetMode(true);setAuthenticated(false);setAuthReady(true);return;}setAuthenticated(!!session);if(session){const allowed=await checkOwner(session);if(allowed){loadProducts();loadOrders();}}else{await checkOwner(null);setProducts([]);setOrders([]);}setAuthReady(true);});
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
  const updateOrderStatus=async(order,status)=>{if(order.status===status)return;const {error}=await supabase.rpc('admin_set_order_status',{p_order_id:order.id,p_status:status,p_note:null});if(error){setNotice(error.message);await refreshOrders();return;}await Promise.all([refreshOrders(),refreshProducts()]);setNotice('Order '+order.order_number+' updated to '+status+'.');};
  const deleteOrder=async(id)=>{const existing=orders.find(o=>o.id===id);if(existing?.stock_reserved&&existing.status!=='Cancelled'){setNotice('Cancel this order before deleting it to safely restore reserved stock.');return;}if(!confirm('Delete this order record?'))return;const {error}=await supabase.from('orders').delete().eq('id',id);if(error)setNotice(error.message);else refreshOrders();};

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
    if(form.status==='Published'){const verified=String(form.price||'').toLowerCase().replace(/rs\.?|pkr|,|\s/g,'');if(!/^[0-9]+(\.[0-9]{1,2})?$/.test(verified)||Number(verified)<=0){setNotice('Please confirm a valid official price before publishing.');return;}}
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
  const claimOwnership=async()=>{setRegisterState(v=>({...v,busy:true,error:'',message:''}));const {data,error}=await supabase.rpc('claim_admin_ownership');if(error){setRegisterState({busy:false,error:error.message,message:''});return;}if(!data){setRegisterState({busy:false,error:'This website already has an owner.',message:''});return;}window.location.reload();};
  const sendOwnershipInvite=async(e)=>{e.preventDefault();const email=transferEmail.trim().toLowerCase();if(!email)return;setTransferNotice('Creating secure ownership invitation...');const {data,error}=await supabase.rpc('create_admin_transfer_invite',{target_email:email});if(error){setTransferNotice(error.message);return;}const inv=Array.isArray(data)?data[0]:data;if(!inv?.token){setTransferNotice('Could not create invitation.');return;}const inviteUrl=window.location.origin+'/admin/transfer?token='+inv.token;const {error:mailError}=await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:inviteUrl}});if(mailError){setPendingTransfer(inv);setTransferNotice('Invite created, but Supabase could not send the email: '+mailError.message);return;}setPendingTransfer(inv);setTransferEmail('');setTransferNotice('Ownership invitation sent to '+email+'. You remain the owner until they accept.');};
  const cancelOwnershipInvite=async()=>{if(!confirm('Cancel the pending ownership invitation?'))return;const {error}=await supabase.rpc('cancel_admin_transfer_invite');if(error){setTransferNotice(error.message);return;}setPendingTransfer(null);setTransferNotice('Ownership invitation cancelled.');};
  const resendOwnershipInvite=async()=>{if(!pendingTransfer?.email||!pendingTransfer?.token)return;const inviteUrl=window.location.origin+'/admin/transfer?token='+pendingTransfer.token;const {error}=await supabase.auth.signInWithOtp({email:pendingTransfer.email,options:{shouldCreateUser:true,emailRedirectTo:inviteUrl}});setTransferNotice(error?error.message:'Invitation email resent to '+pendingTransfer.email+'.');};
  const signUp=async(e)=>{e.preventDefault();setRegisterState({busy:false,error:'',message:''});const email=register.email.trim().toLowerCase();if(!email){setRegisterState({busy:false,error:'Enter an email address.',message:''});return;}if(register.password.length<8){setRegisterState({busy:false,error:'Password must be at least 8 characters.',message:''});return;}if(register.password!==register.confirm){setRegisterState({busy:false,error:'Passwords do not match.',message:''});return;}setRegisterState({busy:true,error:'',message:''});const {data,error}=await supabase.auth.signUp({email,password:register.password,options:{emailRedirectTo:window.location.origin+'/admin'}});if(error){setRegisterState({busy:false,error:error.message,message:''});return;}setRegisterState({busy:false,error:'',message:data.session?'Account created. This account still needs admin approval before dashboard access.':'Registration received. Check your email to confirm the account; admin approval is still required.'});setRegister({email:'',password:'',confirm:''});};
  const requestReset=async()=>{const email=login.email.trim();if(!email){setRecovery({open:true,busy:false,message:'',error:'Enter your admin email above first.'});return;}setRecovery({open:true,busy:true,message:'',error:''});const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/admin'});setRecovery({open:true,busy:false,message:error?'':'Password reset email sent. Check your inbox and open the secure reset link.',error:error?.message||''});};
  const finishReset=async(e)=>{e.preventDefault();if(resetForm.password.length<8){setRecovery(v=>({...v,error:'New password must be at least 8 characters.',message:''}));return;}if(resetForm.password!==resetForm.confirm){setRecovery(v=>({...v,error:'Passwords do not match.',message:''}));return;}setRecovery(v=>({...v,busy:true,error:'',message:''}));const {error}=await supabase.auth.updateUser({password:resetForm.password});if(error){setRecovery(v=>({...v,busy:false,error:error.message}));return;}setResetForm({password:'',confirm:''});setResetMode(false);setAuthenticated(true);setRecovery({open:false,busy:false,error:'',message:''});};
  const signOut=async()=>{await supabase.auth.signOut();setAuthenticated(false);};
  const changePassword=async(e)=>{e.preventDefault();setSecurityNotice('');if(passwordForm.next.length<8){setSecurityNotice('New password must be at least 8 characters.');return;}if(passwordForm.next!==passwordForm.confirm){setSecurityNotice('New passwords do not match.');return;}const {data:{user}}=await supabase.auth.getUser();if(!user?.email){setSecurityNotice('Could not verify the signed-in admin.');return;}const {error:verifyError}=await supabase.auth.signInWithPassword({email:user.email,password:passwordForm.current});if(verifyError){setSecurityNotice('Current password is incorrect.');return;}const {error}=await supabase.auth.updateUser({password:passwordForm.next});if(error){setSecurityNotice(error.message);return;}setPasswordForm({current:'',next:'',confirm:''});setSecurityNotice('Password changed successfully.');};

  if(!authReady)return <main className="admin-auth-screen"/>;
  if(resetMode)return <main className="admin-auth-screen reset-auth-screen"><section className="login-panel reset-panel"><div className="login-card"><div className="login-card-top"><span className="secure-icon">⌾</span><small>SECURE PASSWORD RESET</small></div><h2>Create new password.</h2><p>Choose a new password for your Baba Hakeem admin account.</p><form onSubmit={finishReset}><label><span>NEW PASSWORD</span><input type="password" autoFocus minLength="8" required value={resetForm.password} onChange={e=>setResetForm({...resetForm,password:e.target.value})} placeholder="Minimum 8 characters"/></label><label><span>CONFIRM PASSWORD</span><input type="password" minLength="8" required value={resetForm.confirm} onChange={e=>setResetForm({...resetForm,confirm:e.target.value})} placeholder="Repeat new password"/></label>{recovery.error&&<div className="login-error">{recovery.error}</div>}<button className="login-submit" disabled={recovery.busy} type="submit"><span>{recovery.busy?'UPDATING...':'SET NEW PASSWORD'}</span><b>→</b></button></form></div></section></main>;
  if(!authenticated)return <main className="admin-auth-screen"><section className="login-visual"><div className="login-brand"><span className="login-mark">BH</span><small>PRIVATE ADMINISTRATION</small><h1>Baba Hakeem<br/><em>Herbal Products</em></h1><p>Secure catalogue management for the Baba Hakeem product collection.</p></div><div className="login-quote"><span>EST. / HERBAL TRADITION</span><p>Rooted in nature.<br/>Managed with care.</p></div></section><section className="login-panel"><div className="login-card"><div className="login-card-top"><span className="secure-icon">⌾</span><small>AUTHORIZED ACCESS ONLY</small></div><div className={'auth-tabs '+(owner.hasOwner?'single-tab':'')}><button type="button" className={authMode==='login'?'active':''} onClick={()=>setAuthMode('login')}>LOGIN</button>{!owner.hasOwner&&<button type="button" className={authMode==='register'?'active':''} onClick={()=>setAuthMode('register')}>REGISTER</button>}</div>{authMode==='login'?<><h2>Welcome back.</h2><p>Sign in to access product management.</p><form onSubmit={signIn}><label><span>EMAIL</span><input autoFocus autoComplete="username" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} placeholder="admin@company.com"/></label><label><span>PASSWORD</span><div className="password-field"><input type={showPassword?'text':'password'} autoComplete="current-password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})} placeholder="Enter password"/><button type="button" onClick={()=>setShowPassword(!showPassword)}>{showPassword?'HIDE':'SHOW'}</button></div></label>{loginError&&<div className="login-error">{loginError}</div>}<button className="login-submit" type="submit"><span>SIGN IN TO DASHBOARD</span><b>→</b></button><button className="forgot-password" type="button" onClick={requestReset}>FORGOT PASSWORD?</button>{recovery.open&&(recovery.error||recovery.message)&&<div className={recovery.error?'login-error':'recovery-success'}>{recovery.error||recovery.message}</div>}</form></>:<><h2>Create account.</h2><p>Register a secure account. New accounts require admin approval before they can manage the dashboard.</p><form onSubmit={signUp}><label><span>EMAIL</span><input type="email" autoFocus autoComplete="email" required value={register.email} onChange={e=>setRegister({...register,email:e.target.value})} placeholder="name@example.com"/></label><label><span>PASSWORD</span><input type="password" minLength="8" autoComplete="new-password" required value={register.password} onChange={e=>setRegister({...register,password:e.target.value})} placeholder="Minimum 8 characters"/></label><label><span>CONFIRM PASSWORD</span><input type="password" minLength="8" autoComplete="new-password" required value={register.confirm} onChange={e=>setRegister({...register,confirm:e.target.value})} placeholder="Repeat password"/></label>{registerState.error&&<div className="login-error">{registerState.error}</div>}{registerState.message&&<div className="recovery-success">{registerState.message}</div>}<button className="login-submit" disabled={registerState.busy} type="submit"><span>{registerState.busy?'CREATING ACCOUNT...':'REGISTER ACCOUNT'}</span><b>→</b></button></form></>}<div className="login-footer"><span>SECURE ADMIN PORTAL</span><Link href="/">← Return to storefront</Link></div></div></section></main>;

  if(authenticated&&owner.checked&&!owner.isOwner)return <main className="admin-auth-screen owner-gate"><section className="login-panel reset-panel"><div className="login-card"><div className="login-card-top"><span className="secure-icon">⌾</span><small>SINGLE OWNER SECURITY</small></div><h2>{owner.hasOwner?'Access restricted.':'Claim ownership.'}</h2><p>{owner.hasOwner?'This account is registered, but this website already has one administrator. Only the current owner can transfer control to another registered account.':'No administrator currently owns this website. Claim ownership to become its one and only administrator.'}</p>{!owner.hasOwner&&<button className="login-submit" onClick={claimOwnership} disabled={registerState.busy}><span>{registerState.busy?'CLAIMING...':'BECOME WEBSITE OWNER'}</span><b>→</b></button>}{registerState.error&&<div className="login-error">{registerState.error}</div>}<button className="forgot-password" onClick={signOut}>SIGN OUT</button></div></section></main>;

  return <main className="admin-shell">
    <aside className="admin-side">
      <div><span className="admin-mark">BH</span><h1>BABA HAKEEM</h1><small>HERBAL PRODUCTS / ADMIN</small></div>
      <nav><a className="active" href="#dashboard">Dashboard</a><a href="#orders">Orders</a><Link href="/admin/operations">Order Operations ↗</Link><Link href="/admin/reports">Sales Reports ↗</Link><Link href="/admin/emails">Order Emails ↗</Link><Link href="/admin/inquiries">Contact Enquiries ↗</Link><a href="#add-product">Add Product</a><a href="#products">Products</a><a href="#security">Security</a></nav>
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
      <section className="admin-panel orders-panel" id="orders"><div className="panel-heading"><div><small>ORDERS / LIVE</small><h3>Customer orders</h3><p>Track incoming orders from request to delivery.</p></div><span>{orders.length} orders</span></div><div className="order-summary"><span><b>{pendingOrders}</b> Pending</span><span><b>{confirmedOrders}</b> Confirmed</span><span><b>{shippedOrders}</b> Shipped</span><span><b>{deliveredOrders}</b> Delivered</span><span><b>{unitsSold}</b> Units sold</span></div><div className="orders-toolbar"><label className="order-search"><span>⌕</span><input value={orderQuery} onChange={e=>setOrderQuery(e.target.value)} placeholder="Search order, customer, phone, city..."/></label><select value={orderSort} onChange={e=>setOrderSort(e.target.value)}><option>Newest</option><option>Oldest</option><option>Amount</option></select></div><div className="order-filter-tabs">{['All','Pending','Confirmed','Shipped','Delivered','Cancelled'].map(x=><button key={x} className={orderFilter===x?'active':''} onClick={()=>setOrderFilter(x)}>{x}</button>)}</div>{visibleOrders.length===0?<div className="empty-state"><b>◎</b><h4>No orders here</h4><p>No orders match the current search/filter.</p></div>:<div className="orders-list">{visibleOrders.map(o=><article key={o.id}><div className="order-id"><small>{o.order_number}</small><b>{o.product_name}</b><span>{new Date(o.created_at).toLocaleString()}</span></div><div className="order-customer"><b>{o.customer_name}</b><span><a href={'tel:'+o.phone}>{o.phone}</a> · {o.city}</span><p>{o.address}</p>{o.notes&&<em>{o.notes}</em>}</div><div className="order-money"><span>{o.quantity} × {Number(o.unit_price||0).toLocaleString()}</span><b>{Number(o.total_amount||0).toLocaleString()}</b></div><div className="order-actions"><a className="order-wa" href={'https://wa.me/'+String(o.phone||'').replace(/\D/g,'').replace(/^0/,'92')+'?text='+encodeURIComponent('Hello '+o.customer_name+', regarding your Baba Hakeem order '+o.order_number+'.')} target="_blank" rel="noopener noreferrer">WHATSAPP ↗</a><select value={o.status} onChange={e=>updateOrderStatus(o,e.target.value)}>{[o.status,...(orderTransitions[o.status]||[])].map(x=><option key={x}>{x}</option>)}</select><button onClick={()=>deleteOrder(o.id)}>DELETE</button></div></article>)}</div>}</section>

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

      <section className="admin-panel ownership-panel"><div className="panel-heading"><div><small>SINGLE OWNER / CONTROL</small><h3>Admin ownership</h3><p>Only one account can administer this website. Transfer ownership when handing the website to another person.</p></div><span>SOLE OWNER</span></div><div className="owner-current"><small>CURRENT ADMIN</small><b>{owner.email||'Signed-in owner'}</b></div>{pendingTransfer?<div className="pending-transfer"><small>OWNERSHIP INVITATION PENDING</small><b>{pendingTransfer.email}</b><span>You remain the sole owner until this person accepts the invitation.</span><div><button type="button" onClick={resendOwnershipInvite}>RESEND EMAIL</button><button type="button" className="cancel-invite" onClick={cancelOwnershipInvite}>CANCEL INVITE</button></div></div>:<form className="transfer-form" onSubmit={sendOwnershipInvite}><label><span>NEW OWNER EMAIL</span><input type="email" required value={transferEmail} onChange={e=>setTransferEmail(e.target.value)} placeholder="Enter the new owner's email"/></label><button className="transfer-btn" type="submit">SEND OWNERSHIP INVITE <span>→</span></button></form>}<p className="ownership-warning">The invited person receives a secure email, confirms/creates their account, then accepts ownership. You remain the admin until acceptance; products, orders and inventory stay unchanged.</p>{transferNotice&&<p className="admin-notice">{transferNotice}</p>}</section>

      <section className="admin-panel security-panel" id="security"><div className="panel-heading"><div><small>ACCOUNT / SECURITY</small><h3>Change password</h3><p>Update the password for the currently signed-in Supabase administrator.</p></div></div><form className="security-form" onSubmit={changePassword}><label><span>CURRENT PASSWORD</span><input type="password" value={passwordForm.current} onChange={e=>setPasswordForm({...passwordForm,current:e.target.value})} required/></label><label><span>NEW PASSWORD</span><input type="password" value={passwordForm.next} onChange={e=>setPasswordForm({...passwordForm,next:e.target.value})} minLength="8" required/></label><label><span>CONFIRM NEW PASSWORD</span><input type="password" value={passwordForm.confirm} onChange={e=>setPasswordForm({...passwordForm,confirm:e.target.value})} minLength="8" required/></label><button className="publish-btn" type="submit">CHANGE PASSWORD <span>→</span></button>{securityNotice&&<p className="admin-notice">{securityNotice}</p>}</form></section>

      <p className="storage-note"><b>Live storage:</b> products are stored in Supabase Database and product images in Supabase Storage. Changes made here are shared across devices and the live storefront.</p>
    </section>
  </main>
}
