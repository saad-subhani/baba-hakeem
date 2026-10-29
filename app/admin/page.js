'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import './admin.css';
import { supabase } from '../../lib/supabase';
import AdminBankSettings from '../../components/AdminBankSettings';

const orderTransitions={Pending:['Confirmed','Cancelled'],Confirmed:['Shipped','Cancelled'],Shipped:['Delivered'],Delivered:[],Cancelled:[]};

const empty={name:'',slug:'',slugTouched:false,type:'OIL',product_type:'simple',description:'',overview:'',usage:'',faqs:[{question:'',answer:''}],regular_price:'',sell_price:'',image:'',image_path:'',stock_status:'Out of Stock',stock_quantity:0,featured:false,sort_order:0,whatsapp_number:'',meta_title:'',meta_description:''};
const slugify=v=>String(v||'').toLowerCase().replace(/&/g,'and').replace(/['"]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const initialVariation={label:'',regular_price:'',sell_price:'',stock_quantity:0,image:'',image_path:'',localImage:null};

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
  const [variations,setVariations]=useState([]);

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
    const matchesText=!q||[p.name,p.type,p.description].some(v=>String(v||'').toLowerCase().includes(q));
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

  const readVariationImage=(index,file)=>{
    if(!file)return;
    if(!file.type.startsWith('image/')){setNotice('Variation image must be an image file.');return;}
    if(file.size>4*1024*1024){setNotice('Variation image must be smaller than 4 MB.');return;}
    setVariations(list=>list.map((v,i)=>i===index?{...v,image:'',localImage:file}:v));
  };

  const submit=async(e)=>{
    e.preventDefault();
    if(!form.name.trim()){setNotice('Product name is required.');return;}
    if(!form.image&&editingId==null){setNotice('Please upload a featured image.');return;}
    if(form.product_type==='simple'){
      const verified=Number(String(form.sell_price||'').replace(/[^0-9.]/g,''));
      if(!Number.isFinite(verified)||verified<=0){setNotice('Please enter a valid sell price before publishing.');return;}
      if(form.regular_price&&Number(String(form.regular_price).replace(/[^0-9.]/g,''))<verified){setNotice('Regular price cannot be lower than the sell price.');return;}
    }
    if(form.product_type==='variable'){
      if(!variations.some(v=>String(v.label||'').trim())){setNotice('Variable products need at least one variation with a label.');return;}
      for(const v of variations.filter(v=>String(v.label||'').trim())){
        if(Number(String(v.sell_price||'').replace(/[^0-9.]/g,''))<=0){setNotice('Each variation needs a valid sell price.');return;}
      }
    }
    if(form.product_type==='simple'&&form.status==='Published'){
      const verified=String(form.sell_price||'').toLowerCase().replace(/rs\.?|pkr|,|\s/g,'');
      if(!/^[0-9]+(\.[0-9]{1,2})?$/.test(verified)||Number(verified)<=0){setNotice('Please confirm a valid sell price before publishing.');return;}
    }
    try{
      setNotice(editingId?'Saving changes...':'Uploading product...');
      const uploaded=await uploadImage(form.image);
      const variationRows=[];
      for(const v of variations.filter(v=>String(v.label||'').trim())){
        let vImage=v.image,vPath=v.image_path;
        if(v.localImage){
          const vUpload=await uploadImage(v.localImage);
          vImage=vUpload.url;vPath=vUpload.path;
        }
        variationRows.push({label:v.label,regular_price:v.regular_price,sell_price:v.sell_price,stock_quantity:Number(v.stock_quantity||0)||0,image:vImage,image_path:vPath});
      }
      const payload={...form,image:uploaded.url,image_path:uploaded.path};
      if(typeof uploaded==='string')payload.image=uploaded;
      const {data,error}=await supabase.rpc('save_product',{
        p_product:payload,
        p_variations:form.product_type==='variable'?variationRows:[],
        p_id:editingId
      });
      if(error)throw error;
      const saved=Array.isArray(data)?data[0]:data;
      const old=editingId?products.find(p=>p.id===editingId):null;
      if(old?.image_path&&uploaded.path&&old.image_path!==uploaded.path)await supabase.storage.from('product-images').remove([old.image_path]);
      const refreshedNotice=editingId?'Product updated successfully.':'Product added successfully ('+(saved?.slug||'')+(form.product_type==='variable'?' / variable':'')+')';
      setEditingId(null);setForm(empty);setVariations([]);
      await Promise.all([refreshProducts()]);
      setNotice(refreshedNotice);
      document.getElementById('products')?.scrollIntoView({behavior:'smooth'});
    }catch(err){setNotice(err?.message||'Could not save the product.');}
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
  const setField=(key,value)=>{
    setForm(prev=>{
      if(key==='name'&&!prev.slugTouched)return {...prev,name:value,slug:slugify(value)};
      return {...prev,[key]:value};
    });
  };
  const edit=async(p)=>{
    let savedFaqs=p.faqs;
    if(typeof savedFaqs==='string'){try{savedFaqs=JSON.parse(savedFaqs);}catch{savedFaqs=[];}}
    setForm({name:p.name||'',slug:p.slug||'',slugTouched:true,type:p.type||'',product_type:p.product_type||'simple',description:p.description||'',overview:p.overview||'',usage:p.usage||'',faqs:Array.isArray(savedFaqs)&&savedFaqs.length?savedFaqs:[{question:'',answer:''}],regular_price:p.regular_price!=null?String(p.regular_price):'',sell_price:p.sell_price!=null?String(p.sell_price):'',image:p.image||'',image_path:p.image_path||'',status:p.status||'Draft',featured:!!p.featured,sort_order:p.sort_order||0,whatsapp_number:p.whatsapp_number||'',stock_quantity:p.stock_quantity||0,meta_title:p.meta_title||'',meta_description:p.meta_description||''});
    setEditingId(p.id);
    setVariations([]);
    const {data}=await supabase.from('product_variations').select('*').eq('product_id',p.id).order('sort_order',{ascending:true});
    setVariations((data||[]).map(v=>({label:v.label||'',regular_price:v.regular_price!=null?String(v.regular_price):'',sell_price:v.sell_price!=null?String(v.sell_price):'',stock_quantity:v.stock_quantity||0,image:v.image||'',image_path:v.image_path||'',localImage:null})));
    setNotice('Editing '+p.name);
    document.getElementById('add-product')?.scrollIntoView({behavior:'smooth'});
  };
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

  return <section className="admin-main" id="dashboard">
    <header className="admin-top"><div><small>ADMIN CONSOLE / BABA HAKEEM</small><h2>Product Management</h2><p>Manage your catalogue, product visuals and publishing status from one place.</p></div><div className="top-actions"><span className="live-pill"><i/> CMS READY</span><Link href="/admin/seo">Page SEO ↗</Link></div></header>

      <div className="admin-stats commerce-stats">
        <article><div className="stat-icon">◇</div><small>TOTAL PRODUCTS</small><strong>{products.length}</strong><span>{published} published</span></article>
        <article><div className="stat-icon">◎</div><small>TOTAL ORDERS</small><strong>{orders.length}</strong><span>{pendingOrders} pending</span></article>
        <article><div className="stat-icon">↗</div><small>DELIVERED REVENUE</small><strong>{revenue.toLocaleString()}</strong><span>From delivered orders</span></article>
        <article><div className="stat-icon">!</div><small>LOW STOCK</small><strong>{lowStock}</strong><span>Products need attention</span></article>
      </div>
      <nav className="admin-shortcuts" aria-label="Quick admin actions">
        <Link href="/admin/operations"><span className="shortcut-icon">↗</span><span><b>Manage orders</b><small>{pendingOrders} awaiting confirmation</small></span><span aria-hidden="true">→</span></Link>
        <Link href="/admin/reports"><span className="shortcut-icon">↗</span><span><b>Sales insights</b><small>Revenue, trends &amp; exports</small></span><span aria-hidden="true">→</span></Link>
        <Link href="/admin/inquiries"><span className="shortcut-icon">✉</span><span><b>Customer inbox</b><small>Messages &amp; support</small></span><span aria-hidden="true">→</span></Link>
      </nav>

      <AdminBankSettings />
      <section className="admin-panel orders-panel" id="orders"><div className="panel-heading"><div><small>ORDERS / LIVE</small><h3>Customer orders</h3><p>Track incoming orders from request to delivery.</p></div><span>{orders.length} orders</span></div><div className="order-summary"><span><b>{pendingOrders}</b> Pending</span><span><b>{confirmedOrders}</b> Confirmed</span><span><b>{shippedOrders}</b> Shipped</span><span><b>{deliveredOrders}</b> Delivered</span><span><b>{unitsSold}</b> Units sold</span></div><div className="orders-toolbar"><label className="order-search"><span>⌕</span><input value={orderQuery} onChange={e=>setOrderQuery(e.target.value)} placeholder="Search order, customer, phone, city..."/></label><select value={orderSort} onChange={e=>setOrderSort(e.target.value)}><option>Newest</option><option>Oldest</option><option>Amount</option></select></div><div className="order-filter-tabs">{['All','Pending','Confirmed','Shipped','Delivered','Cancelled'].map(x=><button key={x} className={orderFilter===x?'active':''} onClick={()=>setOrderFilter(x)}>{x}</button>)}</div>{visibleOrders.length===0?<div className="empty-state"><b>◎</b><h4>No orders here</h4><p>No orders match the current search/filter.</p></div>:<div className="orders-list">{visibleOrders.map(o=><article key={o.id}><div className="order-id"><small>{o.order_number}</small><b>{o.product_name}</b><span>{new Date(o.created_at).toLocaleString()}</span></div><div className="order-customer"><b>{o.customer_name}</b><span><a href={'tel:'+o.phone}>{o.phone}</a> · {o.city}</span><p>{o.address}</p>{o.notes&&<em>{o.notes}</em>}</div><div className="order-money"><span>{o.quantity} × {Number(o.unit_price||0).toLocaleString()}</span><b>{Number(o.total_amount||0).toLocaleString()}</b>{o.payment_method&&<small>Payment: {o.payment_method}</small>}{o.transaction_id&&<small>Transaction ID: {o.transaction_id}</small>}</div><div className="order-actions"><a className="order-wa" href={'https://wa.me/'+String(o.phone||'').replace(/\D/g,'').replace(/^0/,'92')+'?text='+encodeURIComponent('Hello '+o.customer_name+', regarding your Baba Hakeem order '+o.order_number+'.')} target="_blank" rel="noopener noreferrer">WHATSAPP ↗</a><select value={o.status} onChange={e=>updateOrderStatus(o,e.target.value)}>{[o.status,...(orderTransitions[o.status]||[])].map(x=><option key={x}>{x}</option>)}</select><button onClick={()=>deleteOrder(o.id)}>DELETE</button></div></article>)}</div>}</section>

      <section className="admin-panel" id="add-product">
        <div className="panel-heading"><div><small>{editingId?'PRODUCT / EDIT':'NEW PRODUCT / CREATE'}</small><h3>{editingId?'Edit product':'Add to collection'}</h3><p>{editingId?'Update the product including its variations and SEO fields.':'Build a product with pricing, variations and SEO in one place.'}</p></div><div className="heading-actions">{editingId&&<button type="button" onClick={()=>{setEditingId(null);setForm(empty);setVariations([]);}}>Cancel edit</button>}<span>Required fields are marked *</span></div></div>
        <form className="product-form" onSubmit={submit}>
          <div className="form-fields">
            <label><span>PRODUCT NAME *</span><input value={form.name} onChange={e=>setField('name',e.target.value)} placeholder="e.g. Herbal Hair Oil" required/></label>
            <div className="form-row">
              <label><span>SLUG (URL) — AUTO FROM TITLE</span><div className="slug-row"><input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value,slugTouched:true})} placeholder="auto-generated"/><button type="button" title="Regenerate from title" onClick={()=>setForm({...form,slug:slugify(form.name)})}>↻</button></div></label>
              <label><span>PRODUCT TYPE *</span><select value={form.product_type} onChange={e=>setForm({...form,product_type:e.target.value})}><option value="simple">Simple product</option><option value="variable">Variable product</option></select></label>
            </div>
            <div className="form-row">
              <label><span>TYPE TAG</span><input value={form.type} onChange={e=>setForm({...form,type:e.target.value})} placeholder="OIL / POWDER / SAFFRON"/></label>
            </div>
            <label><span>DESCRIPTION (AUTO-GENERATED IF LEFT EMPTY)</span><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Leave empty to auto-generate, or write your own" rows="4"/></label>
            <div className="seo-block">
              <b>PRODUCT OVERVIEW &amp; BENEFITS</b>
              <p className="hint">Shown in the “Product Overview &amp; Benefits” accordion on the single product page.</p>
              <label><span>OVERVIEW / BENEFITS</span><textarea value={form.overview} onChange={e=>setForm({...form,overview:e.target.value})} placeholder="Describe the product overview and its key benefits" rows="4"/></label>
            </div>
            <div className="seo-block">
              <b>HOW TO USE / DAILY RITUAL</b>
              <p className="hint">Shown in the “How to Use / Daily Ritual” accordion on the single product page.</p>
              <label><span>USAGE INSTRUCTIONS</span><textarea value={form.usage} onChange={e=>setForm({...form,usage:e.target.value})} placeholder="e.g. Take 5 drops with warm milk every morning" rows="4"/></label>
            </div>
            <div className="seo-block product-faq-editor">
              <div className="variations-head"><div><b>PRODUCT FAQs</b><p className="hint">Answers appear in this product page FAQ section. Add product-specific questions and answers.</p></div><button type="button" onClick={()=>setForm(prev=>({...prev,faqs:[...(prev.faqs||[]),{question:'',answer:''}]}))}>+ Add question</button></div>
              {(form.faqs||[]).map((faq,index)=><div className="product-faq-editor__row" key={index}>
                <label><span>QUESTION {index+1}</span><input maxLength="500" value={faq.question} onChange={e=>setForm(prev=>({...prev,faqs:prev.faqs.map((item,i)=>i===index?{...item,question:e.target.value}:item)}))} placeholder="e.g. How do I use this product?"/></label>
                <label><span>ANSWER</span><textarea maxLength="3000" rows="3" value={faq.answer} onChange={e=>setForm(prev=>({...prev,faqs:prev.faqs.map((item,i)=>i===index?{...item,answer:e.target.value}:item)}))} placeholder="Write a clear answer for customers"/></label>
                <button type="button" aria-label={`Remove FAQ ${index+1}`} onClick={()=>setForm(prev=>({...prev,faqs:prev.faqs.filter((_,i)=>i!==index)}))}>Remove</button>
              </div>)}
            </div>
            {form.product_type==='variable'?(
              <div className="variations-block">
                <div className="variations-head"><b>VARIATIONS</b><button type="button" onClick={()=>setVariations(list=>[...list,{...initialVariation}])}>+ Add variation</button></div>
                {variations.length===0&&<p className="hint">A variable product lets customers choose among options (e.g. 10ml / 30ml) with their own price, image and stock.</p>}
                {variations.map((v,index)=><div className="variation-row" key={index}>
                  <label><span>LABEL *</span><input value={v.label} onChange={e=>{const value=e.target.value;setVariations(list=>list.map((x,i)=>i===index?{...x,label:value}:x))}} placeholder="e.g. 10 ml" required/></label>
                  <label><span>REGULAR PRICE</span><input type="number" min="0" step="any" value={v.regular_price} onChange={e=>{const value=e.target.value;setVariations(list=>list.map((x,i)=>i===index?{...x,regular_price:value}:x))}} placeholder="Raw price"/></label>
                  <label><span>SELL PRICE *</span><input type="number" min="0" step="any" value={v.sell_price} onChange={e=>{const value=e.target.value;setVariations(list=>list.map((x,i)=>i===index?{...x,sell_price:value}:x))}} required/></label>
                  <label><span>STOCK</span><input type="number" min="0" value={v.stock_quantity} onChange={e=>{const value=e.target.value;setVariations(list=>list.map((x,i)=>i===index?{...x,stock_quantity:value}:x))}}/></label>
                  <div className="variation-image">
                    {v.image?<img src={typeof v.image==='string'?v.image:URL.createObjectURL(v.localImage)} alt=""/>:<span>no image</span>}
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>readVariationImage(index,e.target.files?.[0])} title="Optional variation image"/>
                    <button type="button" onClick={()=>setVariations(list=>list.filter((_,i)=>i!==index))}>×</button>
                  </div>
                </div>)}
              </div>
            ):(
              <div className="form-row">
                <label><span>SELL PRICE *</span><input type="number" min="0" step="any" value={form.sell_price} onChange={e=>setForm({...form,sell_price:e.target.value})} placeholder="e.g. 1300"/></label>
                <label><span>REGULAR PRICE (SHOWS AS CROSSED OUT)</span><input type="number" min="0" step="any" value={form.regular_price} onChange={e=>setForm({...form,regular_price:e.target.value})} placeholder="e.g. 1500"/></label>
              </div>
            )}
            <div className="form-row">
              <label><span>PUBLISH STATUS *</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Published</option><option>Draft</option></select></label>
              <label><span>{form.product_type==='variable'?'VARIATION STOCK COUNTED ON ROWS ABOVE':'STOCK QUANTITY'}</span><input type="number" min="0" disabled={form.product_type==='variable'} value={form.product_type==='variable'?'':form.stock_quantity} onChange={e=>setForm({...form,stock_quantity:e.target.value})}/></label>
            </div>
            <div className="form-row">
              <label><span>WHATSAPP NUMBER (OPTIONAL)</span><input value={form.whatsapp_number} onChange={e=>setForm({...form,whatsapp_number:e.target.value})} placeholder="e.g. 923001234567"/></label>
              <label><span>DISPLAY ORDER</span><input type="number" value={form.sort_order} onChange={e=>setForm({...form,sort_order:e.target.value})} placeholder="0"/></label>
            </div>
            <div className="seo-block">
              <b>PRODUCT PAGE SEO</b>
              <p className="hint">Used as the product page title &amp; meta description on the storefront. Auto-generated from the name/description when left empty.</p>
              <label><span>META TITLE</span><input value={form.meta_title} onChange={e=>setForm({...form,meta_title:e.target.value})} placeholder={'Auto: '+((form.name||'Product')+' | Baba Hakeem')}/></label>
              <label><span>META DESCRIPTION</span><textarea rows="2" maxLength="320" value={form.meta_description} onChange={e=>setForm({...form,meta_description:e.target.value})} placeholder="Auto-generated from the description when left empty"/></label>
            </div>
            <label className="feature-check"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/><span>FEATURE THIS PRODUCT</span></label>
          </div>
          <div className="upload-column">
            <label className={'upload-box '+(dragging?'dragging':'')} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);readImage(e.dataTransfer.files[0])}}>
              {form.image?<img src={typeof form.image==='string'?form.image:URL.createObjectURL(form.image)} alt="Product preview"/>:<><b>＋</b><strong>UPLOAD FEATURED IMAGE</strong><span>Drop image here or click to browse<br/>PNG / JPG / WEBP · max 4 MB</span></>}
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
          <div className="admin-product-copy"><small>{p.type||'—'} / {p.stock_status||'In Stock'}{p.featured?' / FEATURED':''}</small><h4>{p.name} {p.product_type==='variable'&&<span className="admin-type-badge">VARIABLE</span>}</h4><p>{p.description||'No description added.'}</p></div>
          <div className="admin-product-meta">{Number(p.sell_price)>0&&<b className="admin-price-new">{Number(p.sell_price).toLocaleString()}</b>}{Number(p.regular_price)>0&&Number(p.regular_price)!==Number(p.sell_price)&&<span className="admin-price-was">{Number(p.regular_price).toLocaleString()}</span>}<span className={(Number(p.stock_quantity)<=5?'stock-alert ':'')+'stock-count'}>{Number(p.stock_quantity||0)} in stock</span><button className={p.status==='Published'?'published':'draft'} onClick={()=>toggle(p.id)}>{p.status}</button></div>
          <div className="row-actions"><button className="edit-product" onClick={()=>edit(p)} aria-label={'Edit '+p.name}>EDIT</button><button className="delete-product" onClick={()=>remove(p.id)} aria-label={'Delete '+p.name}>×</button></div>
        </article>)}</div>}
      </section>

      <section className="admin-panel ownership-panel"><div className="panel-heading"><div><small>SINGLE OWNER / CONTROL</small><h3>Admin ownership</h3><p>Only one account can administer this website. Transfer ownership when handing the website to another person.</p></div><span>SOLE OWNER</span></div><div className="owner-current"><small>CURRENT ADMIN</small><b>{owner.email||'Signed-in owner'}</b></div>{pendingTransfer?<div className="pending-transfer"><small>OWNERSHIP INVITATION PENDING</small><b>{pendingTransfer.email}</b><span>You remain the sole owner until this person accepts the invitation.</span><div><button type="button" onClick={resendOwnershipInvite}>RESEND EMAIL</button><button type="button" className="cancel-invite" onClick={cancelOwnershipInvite}>CANCEL INVITE</button></div></div>:<form className="transfer-form" onSubmit={sendOwnershipInvite}><label><span>NEW OWNER EMAIL</span><input type="email" required value={transferEmail} onChange={e=>setTransferEmail(e.target.value)} placeholder="Enter the new owner's email"/></label><button className="transfer-btn" type="submit">SEND OWNERSHIP INVITE <span>→</span></button></form>}<p className="ownership-warning">The invited person receives a secure email, confirms/creates their account, then accepts ownership. You remain the admin until acceptance; products, orders and inventory stay unchanged.</p>{transferNotice&&<p className="admin-notice">{transferNotice}</p>}</section>

      <section className="admin-panel security-panel" id="security"><div className="panel-heading"><div><small>ACCOUNT / SECURITY</small><h3>Change password</h3><p>Update the password for the currently signed-in Supabase administrator.</p></div></div><form className="security-form" onSubmit={changePassword}><label><span>CURRENT PASSWORD</span><input type="password" value={passwordForm.current} onChange={e=>setPasswordForm({...passwordForm,current:e.target.value})} required/></label><label><span>NEW PASSWORD</span><input type="password" value={passwordForm.next} onChange={e=>setPasswordForm({...passwordForm,next:e.target.value})} minLength="8" required/></label><label><span>CONFIRM NEW PASSWORD</span><input type="password" value={passwordForm.confirm} onChange={e=>setPasswordForm({...passwordForm,confirm:e.target.value})} minLength="8" required/></label><button className="publish-btn" type="submit">CHANGE PASSWORD <span>→</span></button>{securityNotice&&<p className="admin-notice">{securityNotice}</p>}</form></section>

      <p className="storage-note"><b>Live storage:</b> products, variations and page SEO are stored in the local MySQL database. Changes made here are shared across devices once a storefront is connected.</p>
    </section>
  }
