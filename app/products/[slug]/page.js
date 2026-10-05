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
  useEffect(()=>{let alive=true;(async()=>{const {data}=await supabase.from('products').select('*').eq('slug',slug).eq('status','Published').maybeSingle();if(alive){setProduct(data||null);setLoading(false)}})();return()=>{alive=false}},[slug]);
  if(loading)return <main className="product-page"><div className="product-loading">LOADING COLLECTION...</div></main>;
  if(!product)return <main className="product-page product-missing"><div><span>404 / PRODUCT</span><h1>Product not found.</h1><Link href="/#shop">← RETURN TO COLLECTION</Link></div></main>;
  let number=(product.whatsapp_number||'').replace(/\D/g,'');
  if(number.startsWith('0'))number='92'+number.slice(1);
  const contactNumber=number||'923239992203';
  const message=encodeURIComponent(`Hello Baba Hakeem, I would like to order ${product.name}${product.price?' ('+product.price+')':''}.`);
  const order=`https://wa.me/${contactNumber}?text=${message}`;
  return <main className="product-page">
    <header className="product-nav"><Link href="/" className="product-logo">BABA HAKEEM <span>HERBAL PRODUCTS</span></Link><Link href="/#shop">← COLLECTION</Link></header>
    <section className="product-detail">
      <div className="product-detail-art"><span>{product.featured?'FEATURED / ':''}{product.category}</span><img src={product.image} alt={product.name}/></div>
      <div className="product-detail-copy"><small>BABA HAKEEM / {product.type||'HERBAL PRODUCT'}</small><h1>{product.name}</h1><p>{product.description||'A product from the Baba Hakeem Herbal Products collection.'}</p>
        <div className="product-facts"><div><span>AVAILABILITY</span><b>{product.stock_status||'In Stock'}</b></div>{product.price&&<div><span>PRICE</span><b>{product.price}</b></div>}</div>
        {product.stock_status==='Out of Stock'?<button className="order-disabled" disabled>OUT OF STOCK</button>:<a className="order-whatsapp" href={order} target="_blank" rel="noopener noreferrer">ORDER ON WHATSAPP <b>↗</b></a>}
        <p className="product-disclaimer">Product information is presented as supplied in the catalogue. No medical claims are implied.</p>
      </div>
    </section>
    <footer className="product-footer"><span>BABA HAKEEM HERBAL PRODUCTS © 2026</span><Link href="/#shop">EXPLORE MORE PRODUCTS →</Link></footer>
  </main>
}
