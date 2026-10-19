import {supabase} from '../../lib/supabase';
import {sitemapXml} from '../../lib/siteSeo.mjs';
export const dynamic='force-dynamic';
export async function GET(request){
  const origin=new URL(request.url).origin;
  const {data,error}=await supabase.from('products')
    .select('slug,updated_at').eq('status','Published')
    .order('updated_at',{ascending:false}).limit(1000);
  if(error)console.error('Sitemap product lookup failed:',error.code||'unknown');
  const xml=sitemapXml(origin,error?[]:(data||[]));
  return new Response(xml,{headers:{
    'Content-Type':'application/xml; charset=utf-8',
    'Cache-Control':'public, max-age=300',
    'X-Content-Type-Options':'nosniff'
  }});
}
