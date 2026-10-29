import { NextResponse } from 'next/server';
import pool from '../../../../lib/mysql';
import { currentAdmin } from '../../../../lib/store';
import { saveTestimonial } from '../../../../lib/testimonials';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const reply=(body,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
async function authorized(){try{return !!(await currentAdmin());}catch{return false;}}

export async function GET(){
  if(!await authorized())return reply({error:'Admin sign-in required.'},401);
  try{const [testimonials]=await pool.query('SELECT * FROM video_testimonials ORDER BY sort_order ASC,created_at DESC');return reply({testimonials});}
  catch(error){console.error('Admin video testimonials list failed:',error.message);return reply({error:'Could not load video testimonials.'},503);}
}

export async function POST(request){
  if(!await authorized())return reply({error:'Admin sign-in required.'},401);
  let body;try{body=await request.json();}catch{return reply({error:'Invalid request.'},400);}
  try{const result=await saveTestimonial(body);return result.error?reply({error:result.error},400):reply({success:true,testimonial:result},201);}
  catch(error){console.error('Video testimonial create failed:',error.message);return reply({error:'Could not save this video testimonial.'},503);}
}
