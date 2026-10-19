import {supabase} from '../../../lib/supabase';

export const dynamic='force-dynamic';
export async function generateMetadata({params}){
  const slug=String(params?.slug||'');
  if(!/^[a-z0-9-]{1,160}$/.test(slug))return {
    title:'Product not found | Baba Hakeem',robots:{index:false,follow:false}
  };
  const {data,error}=await supabase.from('products')
    .select('name,description,status').eq('slug',slug).eq('status','Published').maybeSingle();
  if(error||!data)return {title:'Product not found | Baba Hakeem',robots:{index:false,follow:false}};
  const description=String(data.description||'Explore herbal products from the Baba Hakeem collection.')
    .replace(/\s+/g,' ').trim().slice(0,160);
  return {title:data.name+' | Baba Hakeem',description,openGraph:{title:data.name+' | Baba Hakeem',description,type:'website'}};
}
export default function ProductLayout({children}){return children;}
