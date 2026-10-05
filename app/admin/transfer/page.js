'use client';

import { useEffect,useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import './transfer.css';

export default function OwnershipTransferPage(){
  const [state,setState]=useState({loading:true,email:'',token:'',valid:false,user:null,message:'',error:''});
  const [form,setForm]=useState({password:'',confirm:''});
  useEffect(()=>{(async()=>{
    const token=new URLSearchParams(window.location.search).get('token')||'';
    if(!token){setState(s=>({...s,loading:false,error:'This ownership invitation link is incomplete.'}));return;}
    const {data,error}=await supabase.rpc('get_admin_transfer_invite',{invite_token:token});
    const row=Array.isArray(data)?data[0]:data;
    const {data:{user}}=await supabase.auth.getUser();
    if(error||!row){setState({loading:false,email:'',token,valid:false,user,error:error?.message||'This invitation is invalid or expired.',message:''});return;}
    setState({loading:false,email:row.email,token,valid:!!row.valid,user,error:row.valid?'':'This invitation has expired.',message:''});
  })();},[]);
  const createAccount=async(e)=>{e.preventDefault();if(form.password.length<8){setState(s=>({...s,error:'Password must be at least 8 characters.'}));return;}if(form.password!==form.confirm){setState(s=>({...s,error:'Passwords do not match.'}));return;}setState(s=>({...s,error:'',message:'Creating your account...'}));const redirect=window.location.origin+'/admin/transfer?token='+encodeURIComponent(state.token);const {error}=await supabase.auth.signUp({email:state.email,password:form.password,options:{emailRedirectTo:redirect}});if(error){setState(s=>({...s,error:error.message,message:''}));return;}setState(s=>({...s,message:'Confirmation email sent. Open it to return here and accept ownership.'}));};
  const accept=async()=>{setState(s=>({...s,error:'',message:'Accepting ownership...'}));const {data,error}=await supabase.rpc('accept_admin_transfer_invite',{invite_token:state.token});if(error){setState(s=>({...s,error:error.message,message:''}));return;}setState(s=>({...s,message:'Ownership transferred to '+data+'. Opening your dashboard...'}));setTimeout(()=>window.location.href='/admin',900);};
  if(state.loading)return <main className="transfer-screen"><section><small>BABA HAKEEM / OWNERSHIP</small><h1>Checking invitation…</h1></section></main>;
  return <main className="transfer-screen"><section><small>BABA HAKEEM / SECURE HANDOVER</small><h1>Website ownership invitation.</h1><p>You have been invited to become the one and only administrator of Baba Hakeem Herbal Products.</p><div className="invite-email"><span>INVITED EMAIL</span><b>{state.email||'Unavailable'}</b></div>{state.error&&<div className="transfer-error">{state.error}</div>}{state.message&&<div className="transfer-success">{state.message}</div>}{state.valid&&!state.user&&<form onSubmit={createAccount}><label><span>CREATE PASSWORD</span><input type="password" minLength="8" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><label><span>CONFIRM PASSWORD</span><input type="password" minLength="8" required value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})}/></label><button type="submit">CREATE ACCOUNT & SEND CONFIRMATION <b>→</b></button><p className="transfer-help">Already registered with this email? <Link href={'/admin?next='+encodeURIComponent('/admin/transfer?token='+state.token)}>Sign in first</Link>, then reopen this invitation.</p></form>}{state.valid&&state.user&&<><div className="signed-user">Signed in as <b>{state.user.email}</b></div><button className="accept-owner" onClick={accept}>ACCEPT OWNERSHIP <b>→</b></button><p className="transfer-help">Ownership changes only when you press Accept. Existing products, orders and inventory stay with the website.</p></>}<Link className="back-site" href="/">← Return to storefront</Link></section></main>;
}
