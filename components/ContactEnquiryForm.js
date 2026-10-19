'use client';

import {useState} from 'react';
import styles from './PremiumPage.module.css';

const blank={name:'',email:'',phone:'',category:'Product question',reference:'',message:'',website:''};
const whatsApp='https://wa.me/923239992203';

export default function ContactEnquiryForm(){
  const [form,setForm]=useState(blank);
  const [state,setState]=useState({busy:false,error:'',success:false});
  const change=(key,value)=>setForm(v=>({...v,[key]:value}));
  const send=async event=>{
    event.preventDefault();
    if(state.busy)return;
    if(!form.email.trim()&&!form.phone.trim()){
      setState({busy:false,error:'Please enter an email address or phone number.',success:false});
      return;
    }
    setState({busy:true,error:'',success:false});
    try{
      const response=await fetch('/api/contact',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)
      });
      const data=await response.json();
      if(!response.ok||!data.success)throw new Error(data.error||'Could not send the enquiry.');
      setForm(blank);setState({busy:false,error:'',success:true});
    }catch(err){
      setState({busy:false,error:err?.message||'Please try again.',success:false});
    }
  };
  return <div className={styles.contactGrid} data-reveal>
    <div className={styles.contactPanel} data-reveal>
      <small className={styles.kicker}>DIRECT ENQUIRIES</small>
      <h2>START A CONVERSATION.</h2>
      <p>Send a product question, order-support request or business enquiry directly to the Baba Hakeem admin inbox. We’ll review it and contact you using the details you provide.</p>
      <p style={{marginTop:22}}><a href={whatsApp} target="_blank" rel="noopener noreferrer"
        style={{display:'inline-block',color:'#f3f3ef',borderBottom:'1px solid currentColor',textDecoration:'none',paddingBottom:5}}>MESSAGE ON WHATSAPP ↗</a></p>
    </div>
    <form className={styles.form} onSubmit={send} aria-label="Send an enquiry">
      <div className={styles.field}><label htmlFor="bh-enquiry-name">YOUR NAME *</label>
        <input id="bh-enquiry-name" required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={e=>change('name',e.target.value)}/></div>
      <div className={styles.field}><label htmlFor="bh-enquiry-email">EMAIL (OPTIONAL)</label>
        <input id="bh-enquiry-email" type="email" maxLength={254} autoComplete="email" value={form.email} onChange={e=>change('email',e.target.value)}/></div>
      <div className={styles.field}><label htmlFor="bh-enquiry-phone">PHONE / WHATSAPP (OPTIONAL)</label>
        <input id="bh-enquiry-phone" type="tel" maxLength={24} autoComplete="tel" value={form.phone} onChange={e=>change('phone',e.target.value)}/></div>
      <p className={styles.formNote}>Provide at least one way we can contact you: email or phone number.</p>
      <div className={styles.field}><label htmlFor="bh-enquiry-type">TYPE OF ENQUIRY *</label>
        <select id="bh-enquiry-type" required value={form.category} onChange={e=>change('category',e.target.value)}>
          {['Product question','Order support','Retail enquiry','Collaboration','Other'].map(v=><option key={v}>{v}</option>)}
        </select></div>
      <div className={styles.field}><label htmlFor="bh-enquiry-ref">ORDER REFERENCE (IF APPLICABLE)</label>
        <input id="bh-enquiry-ref" maxLength={50} value={form.reference} onChange={e=>change('reference',e.target.value)}/></div>
      <div className={styles.field}><label htmlFor="bh-enquiry-message">YOUR MESSAGE *</label>
        <textarea id="bh-enquiry-message" required minLength={15} maxLength={2500} value={form.message} onChange={e=>change('message',e.target.value)} placeholder="Tell us how we can help…" /></div>
      <div style={{position:'absolute',width:1,height:1,overflow:'hidden',clipPath:'inset(50%)'}} aria-hidden="true">
        <label htmlFor="bh-enquiry-website">Website</label><input id="bh-enquiry-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>change('website',e.target.value)}/>
      </div>
      {state.error&&<p role="alert" style={{color:'#8c2519',fontSize:12}}>{state.error}</p>}
      {state.success&&<p role="status" style={{color:'#285d36',fontSize:12}}>Enquiry received. Our team can review it in the admin inbox.</p>}
      <button type="submit" className={styles.button} disabled={state.busy}>{state.busy?'SENDING…':'SEND ENQUIRY →'}</button>
    </form>
  </div>;
}
