import { NextResponse } from 'next/server';
import pool from '../../../lib/mysql';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(){
  try{
    const [testimonials]=await pool.query(`SELECT id,customer_name,location,product_name,quote,video_url,poster_url,created_at
      FROM video_testimonials WHERE status='Published' ORDER BY sort_order ASC,created_at DESC`);
    return NextResponse.json({testimonials},{headers:{'Cache-Control':'public, max-age=60, stale-while-revalidate=300'}});
  }catch(error){
    console.error('Public video testimonials list failed:',error.message);
    return NextResponse.json({error:'Video testimonials are temporarily unavailable.'},{status:503});
  }
}
