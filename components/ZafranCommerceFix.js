'use client';

import { useEffect } from 'react';

const STORAGE_KEY='baba-hakeem-cart-v1';
const ZAFRAN_PRICE=2800;
const formatted=`Rs. ${ZAFRAN_PRICE.toLocaleString('en-PK')}`;

export default function ZafranCommerceFix(){
  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
      if(Array.isArray(saved)){
        let changed=false;
        const next=saved.map(item=>{
          if(item&&(item.id==='zafran'||item.name==='Zafran')&&item.price!==ZAFRAN_PRICE){
            changed=true;
            return {...item,price:ZAFRAN_PRICE};
          }
          return item;
        });
        if(changed)localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
      }
    }catch{}

    let frame=0;
    let observer=null;
    const apply=()=>{
      frame=0;
      const meta=document.querySelector('.static-reference-site .ref-commerce-meta[data-cart-name="Zafran"]');
      if(!meta)return false;
      meta.dataset.cartPrice=String(ZAFRAN_PRICE);
      const value=meta.querySelector('.ref-commerce-price strong');
      if(value)value.textContent=formatted;
      return true;
    };
    const schedule=()=>{
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        if(apply()&&observer){observer.disconnect();observer=null;}
      });
    };

    if(!apply()){
      observer=new MutationObserver(schedule);
      observer.observe(document.body,{childList:true,subtree:true});
    }
    const timeout=window.setTimeout(()=>observer?.disconnect(),7000);
    return()=>{
      window.clearTimeout(timeout);
      observer?.disconnect();
      if(frame)cancelAnimationFrame(frame);
    };
  },[]);
  return null;
}
