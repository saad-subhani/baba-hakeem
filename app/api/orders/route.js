import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const runtime = 'nodejs';

const fail=(message,status)=>NextResponse.json({success:false,error:message},{status,headers:{'Cache-Control':'no-store'}});

export async function POST(request){
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return fail('Invalid checkout origin.',403);
  let body;
  try{
    if(Number(request.headers.get('content-length')||0)>20000)return fail('Request is too large.',413);
    body=await request.json();
  }catch{return fail('Invalid request.',400);}
  if(!body||typeof body!=='object'||!Array.isArray(body.items)||body.items.length<1||body.items.length>20)
    return fail('Please add products to your cart.',400);

  const customer=body.customer||{};
  const name=String(customer.name||'').trim();
  const email=String(customer.email||'').trim();
  const phone=String(customer.phone||'').trim();
  const city=String(customer.city||'').trim();
  const address=String(customer.address||'').trim();
  const notes=String(customer.notes||'').trim();
  if(name.length<2||name.length>120||phone.length<7||phone.length>24||
     city.length<2||city.length>120||address.length<8||address.length>500||
     notes.length>1000||email.length>254||
     (email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))){
    return fail('Please enter valid customer and delivery information.',400);
  }
  const items=body.items.map(item=>({
    id:String(item?.id||'').slice(0,80),
    name:String(item?.name||'').slice(0,160),
    quantity:Number(item?.quantity)
  }));
  if(items.some(item=>!item.id||!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>99))
    return fail('Please check cart quantities.',400);
  try{
    // The database function uses the live product price and locks inventory.
    // No price, total, order status or payment decision is accepted from the browser.
    const {data,error}=await supabase.rpc('place_store_order',{
      p_customer:{name,email,phone,city,address,notes},
      p_items:items
    });
    if(error){
      console.error('Checkout RPC error:',error.code,error.message);
      if(error.code==='PGRST202'||error.code==='42883')
        return fail('Checkout is being configured. Please use WhatsApp ordering for now.',503);
      if(/stock|unavailable|price|quantity|duplicate|details|checkout request|cart item/i.test(error.message||''))
        return fail(error.message,422);
      return fail('Could not place your order. Please try again or contact support.',500);
    }
    const order=Array.isArray(data)?data[0]:data;
    if(!order?.order_number)return fail('The order could not be confirmed.',500);
    return NextResponse.json({success:true,order_number:order.order_number,total_amount:Number(order.total_amount||0)},{
      headers:{'Cache-Control':'no-store'}
    });
  }catch(error){
    console.error('Checkout error:',error);
    return fail('Checkout is temporarily unavailable. Please try again later.',503);
  }
}
