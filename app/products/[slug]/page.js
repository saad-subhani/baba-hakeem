'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import './product.css';

export default function ProductPage(){
  const {slug}=useParams();
  const [product,setProduct]=useState(null);
  const [loading,setLoading]=useState(true);
  const [showOrder,setShowOrder]=useState(false);
  const [orderForm,setOrderForm]=useState({name:'',email:'',phone:'',city:'',address:'',quantity:1,notes:''});
  const [orderState,setOrderState]=useState({busy:false,error:'',success:null});
  useEffect(()=>{let alive=true;(async()=>{const {data}=await supabase.from('products').select('*').eq('slug',slug).eq('status','Published').maybeSingle();if(alive){setProduct(data||null);setLoading(false)}})();return()=>{alive=false}},[slug]);
  if(loading)return <main className="product-page"><div className="product-loading">LOADING COLLECTION...</div></main>;
  if(!product)return <main className="product-page product-missing"><div><span>404 / PRODUCT</span><h1>Product not found.</h1><Link href="/#shop">← RETURN TO COLLECTION</Link></div></main>;
  let number=(product.whatsapp_number||'').replace(/\D/g,'');
  if(number.startsWith('0'))number='92'+number.slice(1);
  const contactNumber=number||'923239992203';
  const message=encodeURIComponent(`Hello Baba Hakeem, I would like to order ${product.name}${product.price?' ('+product.price+')':''}.`);
  const order=`https://wa.me/${contactNumber}?text=${message}`;
  const priceNumber=Number(String(product.price||'0').replace(/[^0-9.]/g,''))||0;
  const trackedStock=Number(product.stock_quantity||0);
  const maxQty=trackedStock>0?trackedStock:99;
  const soldOut=product.stock_status==='Out of Stock'||(trackedStock===0&&product.stock_status!=='In Stock');
  const submitOrder=async(e)=>{
    e.preventDefault();
    if(soldOut){setOrderState({busy:false,error:'This product is currently out of stock.',success:null});return;}
    const requested=Number(orderForm.quantity)||1;
    if(requested<1||requested>maxQty){setOrderState({busy:false,error:`Please choose a quantity between 1 and ${maxQty}.`,success:null});return;}
    setOrderState({busy:true,error:'',success:null});
    try{
      const response=await fetch('/api/orders',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          customer:{name:orderForm.name.trim(),email:orderForm.email.trim(),
            phone:orderForm.phone.trim(),city:orderForm.city.trim(),
            address:orderForm.address.trim(),notes:orderForm.notes.trim()},
          items:[{id:product.id,name:product.name,quantity:requested}]
        })
      });
      const result=await response.json();
      if(!response.ok||!result.success)throw new Error(result.error||'Unable to place the order.');
      setOrderState({busy:false,error:'',success:result.order_number});
    }catch(err){
      setOrderState({busy:false,error:err?.message||'Unable to place the order.',success:null});
    }
  }
  return <main className="product-page">
    <header className="product-nav"><Link href="/" className="product-logo">BABA HAKEEM <span>HERBAL PRODUCTS</span></Link><Link href="/#shop">← COLLECTION</Link></header>
    <section className="product-detail">
      <div className="product-detail-art"><span>{product.featured?'FEATURED / ':''}{product.category}</span><img src={product.image} alt={product.name}/></div>
      <div className="product-detail-copy"><small>BABA HAKEEM / {product.type||'HERBAL PRODUCT'}</small><h1>{product.name}</h1><p>{product.description||'A product from the Baba Hakeem Herbal Products collection.'}</p>
        <div className="product-facts"><div><span>AVAILABILITY</span><b>{soldOut?'Out of Stock':product.stock_status||'In Stock'}</b>{trackedStock>0&&<small>{trackedStock} available</small>}</div>{product.price&&<div><span>PRICE</span><b>{product.price}</b></div>}</div>
        {soldOut?<button className="order-disabled" disabled>OUT OF STOCK</button>:<><button className="buy-now" onClick={()=>setShowOrder(true)}>BUY NOW <b>→</b></button><a className="order-whatsapp secondary-whatsapp" href={order} target="_blank" rel="noopener noreferrer">ORDER ON WHATSAPP <b>↗</b></a></>}
        <p className="product-disclaimer">Product information is presented as supplied in the catalogue. No medical claims are implied.</p>
      </div>
    </section>
    {showOrder&&<div className="order-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowOrder(false)}}><section className="order-modal" role="dialog" aria-modal="true" aria-label={'Order '+product.name}><button className="order-close" aria-label="Close order form" onClick={()=>setShowOrder(false)}>×</button>{orderState.success?<div className="order-success"><small>ORDER RECEIVED</small><h2>Thank you.</h2><p>Your order <b>{orderState.success}</b> is a Cash on Delivery request. It is awaiting confirmation from Baba Hakeem. Pay cash when the order is delivered; any delivery charges will be confirmed before dispatch.</p><a href={`https://wa.me/${contactNumber}?text=${encodeURIComponent('Hello Baba Hakeem, I just placed order '+orderState.success+' for '+product.name+'.')}`} target="_blank" rel="noopener noreferrer">SEND WHATSAPP CONFIRMATION ↗</a></div>:<><small>CASH ON DELIVERY / NO ADVANCE PAYMENT</small><h2>Order {product.name}</h2><p>Enter your delivery details. Pay in cash when your order arrives. Baba Hakeem will review the request and confirm any delivery charges before dispatch.</p><form onSubmit={submitOrder}><div className="order-form-row"><label><span>NAME *</span><input required value={orderForm.name} onChange={e=>setOrderForm({...orderForm,name:e.target.value})}/></label><label><span>PHONE *</span><input required value={orderForm.phone} onChange={e=>setOrderForm({...orderForm,phone:e.target.value})}/></label></div><div className="order-form-row"><label><span>CITY *</span><input required value={orderForm.city} onChange={e=>setOrderForm({...orderForm,city:e.target.value})}/></label><label><span>QUANTITY *</span><input type="number" min="1" max={maxQty} required value={orderForm.quantity} onChange={e=>setOrderForm({...orderForm,quantity:e.target.value})}/></label></div><label><span>DELIVERY ADDRESS *</span><textarea required rows="3" value={orderForm.address} onChange={e=>setOrderForm({...orderForm,address:e.target.value})}/></label><label><span>EMAIL (OPTIONAL — FOR CONFIRMATION)</span><input type="email" value={orderForm.email} onChange={e=>setOrderForm({...orderForm,email:e.target.value})}/></label><label><span>NOTES</span><textarea rows="2" value={orderForm.notes} onChange={e=>setOrderForm({...orderForm,notes:e.target.value})}/></label>{trackedStock>0&&<div className="checkout-stock">{trackedStock} units currently available</div>}<div className="order-total"><span>PRODUCT SUBTOTAL (COD)</span><b>{priceNumber?'Rs. '+(priceNumber*(Number(orderForm.quantity)||1)).toLocaleString('en-PK'):'Price to be confirmed'}</b></div>{orderState.error&&<div className="order-error">{orderState.error}</div>}<button className="place-order" disabled={orderState.busy}>{orderState.busy?'PLACING ORDER...' :'PLACE COD ORDER'} <b>→</b></button></form></>}</section></div>}
    <footer className="product-footer"><span>BABA HAKEEM HERBAL PRODUCTS © 2026</span><Link href="/#shop">EXPLORE MORE PRODUCTS →</Link></footer>
  </main>
}
