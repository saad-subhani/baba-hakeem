'use client';

import { useEffect, useState } from 'react';
import './testimonials.css';

const emptyForm={customer_name:'',location:'',product_name:'',quote:'',video_url:'',poster_url:'',status:'Published',sort_order:'0'};

export default function AdminVideoTestimonialsPage(){
  const [items,setItems]=useState([]);
  const [form,setForm]=useState(emptyForm);
  const [editingId,setEditingId]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [uploadType,setUploadType]=useState('');
  const [notice,setNotice]=useState('');
  const [error,setError]=useState('');

  const load=async()=>{
    setLoading(true);
    try{const response=await fetch('/api/admin/testimonials',{credentials:'same-origin',cache:'no-store'});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not load video testimonials.');setItems(result.testimonials||[]);setError('');}
    catch(reason){setError(reason.message);}
    finally{setLoading(false);}
  };
  useEffect(()=>{load();},[]);

  const upload=async(file,kind)=>{
    if(!file)return;
    const video=kind==='video';
    const permitted=video?['video/mp4','video/webm','video/quicktime']:['image/png','image/jpeg','image/webp','image/gif'];
    if(!permitted.includes(file.type)){setError(video?'Choose an MP4, WEBM, or MOV video.':'Choose a PNG, JPG, WEBP, or GIF image.');return;}
    if(file.size>(video?100:4)*1024*1024){setError(video?'Video must be under 100 MB.':'Poster image must be under 4 MB.');return;}
    setUploadType(kind);setError('');setNotice('');
    try{
      const payload=new FormData();payload.set('file',file);payload.set('kind',kind);
      const response=await fetch('/api/local/upload',{method:'POST',body:payload,credentials:'same-origin'});const result=await response.json();
      if(!response.ok||!result.url)throw new Error(result?.error?.message||'Upload failed.');
      setForm((previous)=>({...previous,[video?'video_url':'poster_url']:result.url}));
      setNotice(video?'Video uploaded. Save the testimonial to publish or keep it as a draft.':'Poster image uploaded.');
    }catch(reason){setError(reason.message);}
    finally{setUploadType('');}
  };

  const edit=async(item)=>{
    setError('');setNotice('');
    try{const response=await fetch(`/api/admin/testimonials/${item.id}`,{credentials:'same-origin',cache:'no-store'});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not load this testimonial.');const data=result.testimonial;setForm({customer_name:data.customer_name||'',location:data.location||'',product_name:data.product_name||'',quote:data.quote||'',video_url:data.video_url||'',poster_url:data.poster_url||'',status:data.status||'Draft',sort_order:String(data.sort_order||0)});setEditingId(data.id);document.getElementById('video-testimonial-editor')?.scrollIntoView({behavior:'smooth'});}
    catch(reason){setError(reason.message);}
  };

  const reset=()=>{setForm(emptyForm);setEditingId(null);setError('');setNotice('');};
  const save=async(event)=>{
    event.preventDefault();if(saving)return;
    setSaving(true);setError('');setNotice('');
    try{
      const response=await fetch(editingId?`/api/admin/testimonials/${editingId}`:'/api/admin/testimonials',{method:editingId?'PATCH':'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not save this testimonial.');
      const message=form.status==='Published'?'Video testimonial published.':'Video testimonial saved as a draft.';reset();setNotice(message);await load();
    }catch(reason){setError(reason.message);}
    finally{setSaving(false);}
  };

  const remove=async(item)=>{
    if(!confirm(`Delete the video testimonial for ${item.customer_name}? The uploaded media will also be deleted.`))return;
    setError('');setNotice('');
    try{const response=await fetch(`/api/admin/testimonials/${item.id}`,{method:'DELETE',credentials:'same-origin'});const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not delete this testimonial.');setNotice('Video testimonial deleted.');await load();}
    catch(reason){setError(reason.message);}
  };

  return <main className="admin-main testimonial-admin">
    <header className="admin-top"><div><small>ADMIN / CUSTOMER STORIES</small><h2>Video Testimonials</h2><p>Upload customer videos and control which testimonials appear on the storefront.</p></div><span>{items.length} videos</span></header>
    {(error||notice)&&<p className={`admin-notice ${error?'is-error':''}`} role="status">{error||notice}</p>}

    <section className="admin-panel" id="video-testimonial-editor">
      <div className="panel-heading"><div><small>{editingId?'VIDEO / EDIT':'VIDEO / CREATE'}</small><h3>{editingId?'Edit testimonial':'Add a video testimonial'}</h3><p>Published videos appear in the home page testimonial section.</p></div>{editingId&&<button type="button" onClick={reset}>Cancel edit</button>}</div>
      <form className="testimonial-form" onSubmit={save}>
        <div className="testimonial-form__fields">
          <div className="testimonial-form__row">
            <label>Customer name<input required maxLength="160" value={form.customer_name} onChange={(event)=>setForm({...form,customer_name:event.target.value})} placeholder="Name to show with the video"/></label>
            <label>City / location<input maxLength="120" value={form.location} onChange={(event)=>setForm({...form,location:event.target.value})} placeholder="e.g. Lahore"/></label>
          </div>
          <div className="testimonial-form__row">
            <label>Product<input maxLength="180" value={form.product_name} onChange={(event)=>setForm({...form,product_name:event.target.value})} placeholder="Product featured in the video"/></label>
            <label>Display order<input type="number" min="0" max="9999" value={form.sort_order} onChange={(event)=>setForm({...form,sort_order:event.target.value})}/></label>
          </div>
          <label>Customer quote / caption<textarea rows="3" maxLength="600" value={form.quote} onChange={(event)=>setForm({...form,quote:event.target.value})} placeholder="Optional caption shown over the video"/></label>
          <label>Status<select value={form.status} onChange={(event)=>setForm({...form,status:event.target.value})}><option>Draft</option><option>Published</option></select></label>
        </div>
        <aside className="testimonial-form__media">
          <div className="testimonial-video-uploader">
            {form.video_url&&<video className="testimonial-form__video-preview" src={form.video_url} controls preload="metadata" />}
            <label className="testimonial-upload">
              <span>VIDEO FILE *</span>
              <b>{uploadType==='video'?'Uploading video...':form.video_url?'Replace video':'Choose video (MP4 / WEBM / MOV)'}</b>
              <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event)=>{const file=event.target.files?.[0];event.target.value='';upload(file,'video');}}/>
            </label>
          </div>
          <label className="testimonial-upload testimonial-upload--poster">
            <span>POSTER IMAGE (OPTIONAL)</span>
            {form.poster_url?<img src={form.poster_url} alt="Video poster preview"/>:<b>{uploadType==='poster'?'Uploading poster...':'Choose poster image'}</b>}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event)=>{const file=event.target.files?.[0];event.target.value='';upload(file,'poster');}}/>
          </label>
          <small className="testimonial-form__hint">Videos up to 100 MB. Published testimonials are visible to everyone.</small>
          <button className="testimonial-save" type="submit" disabled={saving||!!uploadType}>{saving?'Saving...':form.status==='Published'?'Publish testimonial':'Save draft'}</button>
        </aside>
      </form>
    </section>

    <section className="admin-panel">
      <div className="panel-heading"><div><small>TESTIMONIAL LIBRARY</small><h3>Uploaded videos</h3><p>Drafts are only visible here. Published videos appear on the storefront.</p></div><span>{items.length} total</span></div>
      {loading?<p className="testimonial-empty">Loading testimonials...</p>:items.length?<div className="testimonial-admin-list">{items.map((item)=><article key={item.id}>
        <video src={item.video_url} poster={item.poster_url||undefined} controls preload="metadata" />
        <div className="testimonial-admin-list__copy"><small>{item.status} {item.product_name&&`· ${item.product_name}`}</small><h4>{item.customer_name}{item.location&&` · ${item.location}`}</h4>{item.quote&&<p>{item.quote}</p>}</div>
        <div className="testimonial-admin-list__actions"><button type="button" onClick={()=>edit(item)}>Edit</button><button type="button" onClick={()=>remove(item)}>Delete</button></div>
      </article>)}</div>:<p className="testimonial-empty">No customer videos yet. Upload the first testimonial above.</p>}
    </section>
  </main>;
}
