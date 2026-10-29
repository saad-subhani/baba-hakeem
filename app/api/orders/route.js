import { NextResponse } from 'next/server';
import { runRpc } from '../../../lib/store';
import {dispatchOrderEmails} from '../../../lib/orderEmailDispatch';
import pool from '../../../lib/mysql';

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
  const paymentMethod=String(customer.payment_method||'Cash on Delivery').trim();
  const transactionId=String(customer.transaction_id||'').trim();
  if(name.length<2||name.length>120||phone.length<7||phone.length>24||
     city.length<2||city.length>120||address.length<8||address.length>500||
     notes.length>1000||email.length>254||
     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return fail('Please enter a valid email along with your customer and delivery information.',400);
  }
  const items=body.items.map(item=>({
    id:String(item?.id||'').slice(0,80),
    name:String(item?.name||'').slice(0,160),
    quantity:Number(item?.quantity)
  }));
  if(items.some(item=>!item.id||!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>99))
    return fail('Please check cart quantities.',400);
  if(!['Cash on Delivery','Bank Transfer'].includes(paymentMethod))return fail('Choose a valid payment method.',400);
  if(paymentMethod==='Bank Transfer'){
    if(transactionId.length<3||transactionId.length>120)return fail('Enter the transaction ID or reference from your bank receipt.',400);
    try{
      const [[bank]] = await pool.query('SELECT enabled FROM store_bank_details WHERE id=1 LIMIT 1');
      if(!bank||!Number(bank.enabled))return fail('Bank transfer is currently unavailable. Please choose Cash on Delivery.',422);
    }catch{return fail('Bank transfer is temporarily unavailable. Please choose Cash on Delivery.',503);}
  }else if(transactionId)return fail('A transaction ID is only needed for bank transfer.',400);
  try{
    // The database function uses the live product price and locks inventory.
    // No price, total, order status or payment decision is accepted from the browser.
    const {data,error}=await runRpc('place_store_order',{
      p_customer:{name,email,phone,city,address,notes,payment_method:paymentMethod,transaction_id:transactionId},
      p_items:items
    });
    if(error){
      console.error('Checkout error:',error.message);
      if(/stock|unavailable|price|quantity|duplicate|details|checkout request|cart item|no longer|not yet available/i.test(error.message||''))
        return fail(error.message,422);
      return fail('Could not place your order. Please try again or contact support.',500);
    }
    const order=Array.isArray(data)?data[0]:data;
    if(!order?.order_number)return fail('The order could not be confirmed.',500);
    // The order remains successful even if email delivery is delayed or unavailable.
    // Emails are queued transactionally in Supabase and dispatch is server-only.
    const notification=await dispatchOrderEmails({orderNumber:order.order_number,limit:2});
    return NextResponse.json({success:true,order_number:order.order_number,total_amount:Number(order.total_amount||0),payment_method:paymentMethod,transaction_id:transactionId,email_status:notification.status},{
      headers:{'Cache-Control':'no-store'}
    });
  }catch(error){
    console.error('Checkout error:',error);
    return fail('Checkout is temporarily unavailable. Please try again later.',503);
  }
}
