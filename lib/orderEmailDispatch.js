import {createClient} from '@supabase/supabase-js';

const PROJECT_URL='https://ffgwbgosxgvinwlmeeqo.supabase.co';
const MONEY=n=>'Rs. '+Number(n||0).toLocaleString('en-PK',{maximumFractionDigits:2});
const EMAIL=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const clean=value=>String(value??'').replace(/[\r\n]+/g,' ').trim();
const html=value=>String(value??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
})[c]);
const safeFrom=value=>{
  const from=clean(value);
  if(from.length>240||!from)return null;
  const match=from.match(/^(?:[^<>]+<)?([^<>\s]+@[^<>\s]+)>?$/);
  return match&&EMAIL.test(match[1])?from:null;
};
const config=()=>{
  const env=process.env;
  const from=safeFrom(env.ORDER_EMAIL_FROM);
  const inbox=clean(env.ORDER_EMAIL_NOTIFY_TO);
  const reply=clean(env.ORDER_EMAIL_REPLY_TO);
  const key=env.RESEND_API_KEY||'';
  const serviceKey=env.SUPABASE_SERVICE_ROLE_KEY||'';
  const enabled=env.ORDER_EMAIL_ENABLED==='true'&&!!from&&EMAIL.test(inbox)
    &&(!reply||EMAIL.test(reply))&&key.startsWith('re_')&&!!serviceKey;
  return {enabled,from,inbox,reply,key,serviceKey};
};
const serverClient=secret=>createClient(PROJECT_URL,secret,{
  auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
  global:{headers:{'X-Client-Info':'baba-hakeem-email-dispatch'}}
});
const normalizedItems=items=>Array.isArray(items)?items.slice(0,20).map(item=>({
  name:clean(item.name||'Product').slice(0,160),
  qty:Number(item.quantity)||0,
  price:Number(item.unit_price)||0,
  lineTotal:Number(item.line_total)||0
})):[];
const compose=job=>{
  const items=normalizedItems(job.items);
  const ref=clean(job.order_number);
  const name=clean(job.customer_name);
  const isCustomer=job.job_kind==='customer';
  const headline=isCustomer?'Your order request was received':'New order request received';
  const intro=isCustomer
    ?'Thank you for choosing Baba Hakeem. Your order request has been saved. Our team will confirm product availability, delivery and payment before fulfillment.'
    :'A new order request has been saved in the Baba Hakeem admin dashboard. Review the order and confirm payment and delivery details with the customer.';
  const lines=items.map(item=>item.name+' × '+item.qty+' — '+MONEY(item.lineTotal));
  const delivery=[
    'Customer: '+name,
    'Phone: '+clean(job.phone),
    'City: '+clean(job.city),
    'Delivery address: '+clean(job.address)
  ];
  const note=clean(job.notes);
  const text=[
    headline,'',
    intro,'',
    'Order reference: '+ref,
    '',
    ...lines,
    '',
    'Product subtotal: '+MONEY(job.total_amount),
    'Payment: '+clean(job.payment_method||'To Be Confirmed'),
    'Delivery: To Be Confirmed','',
    ...(isCustomer?[]:[...delivery,...(job.customer_email?['Email: '+clean(job.customer_email)]:[])]),
    ...(note?['Order notes: '+note]:[]),
    '',
    'Baba Hakeem Herbal Products',
    'This is an order request, not a payment receipt.'
  ].filter(Boolean).join('\n');
  const table=items.map(item=>'<tr><td style="padding:10px 0;border-bottom:1px solid #e7e9df;">'+
    html(item.name)+' × '+html(item.qty)+'</td><td style="text-align:right;border-bottom:1px solid #e7e9df;">'+
    html(MONEY(item.lineTotal))+'</td></tr>').join('');
  const info=delivery.map(s=>'<div style="margin:5px 0;">'+html(s)+'</div>').join('');
  const document='<!DOCTYPE html><html><body style="margin:0;background:#f1eee5;color:#173226;font-family:Arial,Helvetica,sans-serif;">'+
    '<div style="max-width:600px;margin:24px auto;background:#faf9f3;padding:32px;border:1px solid #d4dbd2;">'+
    '<p style="font-size:11px;letter-spacing:2px;font-weight:bold;">BABA HAKEEM · HERBAL PRODUCTS</p>'+
    '<h1 style="font:normal 32px Georgia,serif;margin:24px 0 10px;">'+html(headline)+'</h1>'+
    '<p style="color:#4a6050;line-height:1.65;">'+html(intro)+'</p>'+
    '<div style="background:#e6eadd;padding:17px;margin:20px 0;">Order reference <strong>'+html(ref)+'</strong></div>'+
    '<table style="width:100%;border-collapse:collapse;font-size:14px;">'+table+'</table>'+
    '<p style="text-align:right;font-weight:bold;margin-top:18px;">Product subtotal: '+html(MONEY(job.total_amount))+'</p>'+
    '<p style="font-size:12px;color:#57705f;line-height:1.8;">Payment method: '+html(job.payment_method||'To Be Confirmed')+'<br/>Delivery details: To Be Confirmed</p>'+
    (isCustomer?'':('<div style="padding-top:15px;border-top:1px solid #d4dbd2;font-size:13px;">'+info+
      (job.customer_email?'<div>Email: '+html(job.customer_email)+'</div>':'')+'</div>'))+
    (note?'<p style="font-size:13px;">Order notes: '+html(note)+'</p>':'')+
    '<p style="color:#708071;font-size:11px;border-top:1px solid #d4dbd2;margin-top:24px;padding-top:18px;">This is an order request, not a payment receipt. Baba Hakeem Herbal Products.</p>'+
    '</div></body></html>';
  return {subject:(isCustomer?'Order request received · ':'New order · ')+ref,
    text,html:document};
};

const send=async(job,settings)=>{
  const to=job.job_kind==='store'?settings.inbox:clean(job.recipient_email);
  if(!EMAIL.test(to))return {id:null,error:'Recipient email has not been configured'};
  const content=compose(job);
  const message={from:settings.from,to:[to],subject:content.subject,html:content.html,text:content.text};
  if(settings.reply)message.reply_to=settings.reply;
  try{
    const response=await fetch('https://api.resend.com/emails',{
      method:'POST',
      headers:{
        Authorization:'Bearer '+settings.key,
        'Content-Type':'application/json',
        'Idempotency-Key':'baba-hakeem-'+job.job_id
      },
      body:JSON.stringify(message),
      signal:AbortSignal.timeout(6500)
    });
    const answer=await response.json().catch(()=>({}));
    if(response.ok&&typeof answer.id==='string'&&answer.id){
      return {id:answer.id,error:null};
    }
    // Return safe provider status only; do not save full response (may contain PII).
    return {id:null,error:'Email provider rejected the request (HTTP '+response.status+')'};
  }catch(error){
    return {id:null,error:'Email provider could not be reached'};
  }
};

export function orderEmailConfigured(){return config().enabled;}

/**
 * Called only from trusted server routes after a successful database order.
 * Uses a private SERVICE ROLE key. Returns aggregate status, never recipient data.
 * No outbound calls or claims occur until explicit email configuration is present.
 */
export async function dispatchOrderEmails({orderNumber=null,limit=6}={}){
  const settings=config();
  if(!settings.enabled)return {status:'not_configured',accepted:0,failed:0};
  const client=serverClient(settings.serviceKey);
  try{
    const {data:jobs,error}=await client.rpc('claim_order_email_jobs',{
      p_order_number:orderNumber,p_limit:Math.min(10,Math.max(1,limit))
    });
    if(error){
      console.error('Order email claim failed:',error.code||'unknown');
      return {status:'queue_error',accepted:0,failed:0};
    }
    let accepted=0,failed=0;
    for(const job of jobs||[]){
      const result=await send(job,settings);
      const {error:finishError}=await client.rpc('complete_order_email_job',{
        p_job_id:job.job_id,p_provider_id:result.id,p_error:result.error
      });
      if(finishError)console.error('Order email status update failed:',finishError.code||'unknown');
      if(result.id)accepted++;else failed++;
    }
    return {status:failed?'retry_pending':'processed',accepted,failed};
  }catch(error){
    console.error('Order email dispatcher unavailable');
    return {status:'queue_error',accepted:0,failed:0};
  }
}

/** Validate owner access before allowing the optional manual retry endpoint. */
export async function verifyEmailAdminAccess(token){
  const settings=config();
  if(!settings.enabled)return {ok:false,status:503,reason:'Order email delivery is not configured.'};
  if(!token||token.length>4096)return {ok:false,status:401,reason:'Admin sign-in required.'};
  try{
    const client=serverClient(settings.serviceKey);
    const {data:{user},error}=await client.auth.getUser(token);
    if(error||!user)return {ok:false,status:401,reason:'Invalid admin session.'};
    const {data,error:ownerError}=await client.from('admin_users')
      .select('user_id').eq('user_id',user.id).maybeSingle();
    if(ownerError||!data)return {ok:false,status:403,reason:'Owner access only.'};
    return {ok:true};
  }catch{return {ok:false,status:503,reason:'Could not verify owner access.'};}
}
