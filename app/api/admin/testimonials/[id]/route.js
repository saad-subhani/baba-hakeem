import { NextResponse } from 'next/server';
import pool from '../../../../../lib/mysql';
import { currentAdmin } from '../../../../../lib/store';
import { removeTestimonialMedia, saveTestimonial } from '../../../../../lib/testimonials';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
async function authorized(){try{return !!(await currentAdmin());}catch{return false;}}

export async function GET(_request,{params}){
  if(!await authorized())return reply({error:'Admin sign-in required.'},401);
  try{const [[testimonial]]=await pool.query('SELECT * FROM video_testimonials WHERE id=? LIMIT 1',[String(params.id||'')]);return testimonial?reply({testimonial}):reply({error:'Video testimonial not found.'},404);}
  catch(error){console.error('Video testimonial read failed:',error.message);return reply({error:'Could not load this video testimonial.'},503);}
}

export async function PATCH(request,{params}){
  if(!await authorized())return reply({error:'Admin sign-in required.'},401);
  let body;try{body=await request.json();}catch{return reply({error:'Invalid request.'},400);}
  try{const result=await saveTestimonial(body,String(params.id||''));return result.error?reply({error:result.error},result.error==='Video testimonial not found.'?404:400):reply({success:true,testimonial:result});}
  catch(error){console.error('Video testimonial update failed:',error.message);return reply({error:'Could not update this video testimonial.'},503);}
}

export async function DELETE(_request,{params}){
  if(!await authorized())return reply({error:'Admin sign-in required.'},401);
  try{
    const [[item]]=await pool.query('SELECT video_url,poster_url FROM video_testimonials WHERE id=? LIMIT 1',[String(params.id||'')]);
    if(!item)return reply({error:'Video testimonial not found.'},404);
    await pool.query('DELETE FROM video_testimonials WHERE id=?',[String(params.id||'')]);
    await Promise.all([removeTestimonialMedia(item.video_url),removeTestimonialMedia(item.poster_url)]);
    return reply({success:true});
  }catch(error){console.error('Video testimonial delete failed:',error.message);return reply({error:'Could not delete this video testimonial.'},503);}
}
