import {NextResponse} from 'next/server';
import {supabase} from '../../../lib/supabase';

export const runtime='nodejs';
const reply=(data,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
const CATEGORIES=new Set(['Product question','Order support','Retail enquiry','Collaboration','Other']);

export async function POST(request){
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)
    return reply({success:false,error:'Request origin is not allowed.'},403);
  if(!String(request.headers.get('content-type')||'').includes('application/json'))
    return reply({success:false,error:'Please submit the enquiry form.'},415);
  let input;
  try{
    if(Number(request.headers.get('content-length')||0)>8192)
      return reply({success:false,error:'Enquiry is too long.'},413);
    const raw=await request.text();
    if(raw.length>8192)return reply({success:false,error:'Enquiry is too long.'},413);
    input=JSON.parse(raw);
  }catch{return reply({success:false,error:'Invalid enquiry request.'},400);}
  if(!input||typeof input!=='object'||Array.isArray(input))
    return reply({success:false,error:'Invalid enquiry details.'},400);
  // Honeypot for automated spam; no database write on suspicious submissions.
  if(input.website)return reply({success:true},200);
  const fields=['name','email','phone','category','reference','message'];
  if(fields.some(k=>input[k]!=null&&typeof input[k]!=='string'))
    return reply({success:false,error:'Please check your enquiry fields.'},400);
  const v=Object.fromEntries(fields.map(k=>[k,String(input[k]||'').trim()]));
  if(v.name.length<2||v.name.length>120||v.message.length<15||v.message.length>2500||
     v.email.length>254||v.phone.length>24||v.reference.length>50||
     !CATEGORIES.has(v.category)||(!v.email&&!v.phone))
    return reply({success:false,error:'Enter your name, message, and an email or phone number.'},422);
  if(v.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
    return reply({success:false,error:'Please check your email address.'},422);
  try{
    const {error}=await supabase.rpc('submit_contact_enquiry',{
      p_name:v.name,p_email:v.email,p_phone:v.phone,
      p_category:v.category,p_reference:v.reference,p_message:v.message
    });
    if(error){
      if(/wait before/i.test(error.message||''))return reply({success:false,error:'Too many enquiries. Please try again later.'},429);
      if(/valid|fields|required|complete/i.test(error.message||''))
        return reply({success:false,error:'Please check the enquiry details and try again.'},422);
      console.error('Enquiry submission failed',error.code||'unknown');
      return reply({success:false,error:'Unable to receive the enquiry right now. Please contact us via WhatsApp.'},503);
    }
    return reply({success:true,message:'Your enquiry has been received.'});
  }catch{
    return reply({success:false,error:'Enquiries are temporarily unavailable. Please use WhatsApp.'},503);
  }
}
