'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommerceHeader from '../../components/CommerceHeader';
import CommerceFooter from '../../components/CommerceFooter';
import useStoreContactSettings, { buildWhatsAppUrl } from '../../components/useStoreContactSettings';
import { MailIcon, PhoneIcon, WhatsAppIcon } from '../../components/Icons';
import './contact.css';

const initialForm = { name:'', email:'', phone:'', category:'Product question', reference:'', message:'', website:'' };

export default function ContactPage() {
  const contact = useStoreContactSettings();
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState({ busy:false, message:'', error:false });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]:event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setState({ busy:true, message:'', error:false });
    try {
      const response = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send your message. Please try again.');
      setForm(initialForm); setState({ busy:false, message:'Thank you. Your message has been received and our team will get back to you.', error:false });
    } catch (error) { setState({ busy:false, message:error.message || 'Please try again or contact us on WhatsApp.', error:true }); }
  };
  return <main className="bh-commerce-page"><CommerceHeader />
    <section className="bh-commerce-hero"><div className="bh-commerce-wrap"><nav className="bh-commerce-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Contact</span></nav><p className="bh-commerce-eyebrow">WE’RE HERE TO HELP</p><h1>Contact Baba Hakeem</h1><p>Ask us about a product, an order, or delivery anywhere in Pakistan.</p></div></section>
    <section className="bh-contact-layout"><div className="bh-contact-info"><p className="bh-commerce-eyebrow">CUSTOMER SUPPORT</p><h2>How can we help?</h2><p>Send us a message and include your order number if your question is about an existing order.</p><div className="bh-contact-methods">{contact.phone_number&&<a className="bh-contact-method" href={`tel:${contact.phone_number.replace(/[^+\d]/g,'')}`}><span className="bh-contact-method-icon"><PhoneIcon size={18}/></span><span className="bh-contact-method-label">Phone</span><strong>{contact.phone_number}</strong></a>}{contact.whatsapp_number&&<a className="bh-contact-method" href={buildWhatsAppUrl(contact.whatsapp_number)} target="_blank" rel="noreferrer"><span className="bh-contact-method-icon"><WhatsAppIcon size={18}/></span><span className="bh-contact-method-label">WhatsApp</span><strong>{contact.whatsapp_number}</strong></a>}{contact.email&&<a className="bh-contact-method" href={`mailto:${contact.email}`}><span className="bh-contact-method-icon"><MailIcon size={18}/></span><span className="bh-contact-method-label">Email</span><strong>{contact.email}</strong></a>}</div>{contact.address&&<p className="bh-contact-address">{contact.address}</p>}</div>
      <form className="bh-contact-form" onSubmit={submit}><h2>Send us a message</h2><div className="bh-contact-fields"><label>Your name *<input name="name" value={form.name} onChange={update} required minLength={2} maxLength={120} autoComplete="name" /></label><label>Email address *<input name="email" type="email" value={form.email} onChange={update} required maxLength={254} autoComplete="email" /></label><label>Phone number<input name="phone" type="tel" value={form.phone} onChange={update} maxLength={24} autoComplete="tel" /></label><label>What is this about? *<select name="category" value={form.category} onChange={update}><option>Product question</option><option>Order support</option><option>Retail enquiry</option><option>Collaboration</option><option>Other</option></select></label><label className="bh-contact-wide">Order or product reference<input name="reference" value={form.reference} onChange={update} maxLength={50} /></label><label className="bh-contact-wide">Your message *<textarea name="message" value={form.message} onChange={update} required minLength={15} maxLength={2500} rows={5} /></label><label className="bh-contact-honeypot" aria-hidden="true">Website<input name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" /></label></div>{state.message&&<p className={`bh-contact-status${state.error?' is-error':''}`} role="status">{state.message}</p>}<button className="bh-contact-submit" type="submit" disabled={state.busy}>{state.busy?'Sending…':'Send message'}</button></form>
    </section><CommerceFooter /></main>;
}
