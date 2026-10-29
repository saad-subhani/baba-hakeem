'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import BrandLogo from './BrandLogo';
import {supabase} from '../lib/supabase';
import {
  DashboardIcon,
  ProductsIcon,
  AddProductIcon,
  SeoIcon,
  OrdersIcon,
  ReportsIcon,
  EnquiriesIcon,
  EmailsIcon,
  StarIcon,
  InstagramIcon,
  SignOutIcon
} from './Icons';

const LINKS=[
  {href:'/admin',label:'Dashboard',Icon:DashboardIcon},
  {href:'/admin#products',label:'Products',Icon:ProductsIcon},
  {href:'/admin#add-product',label:'Add Product',Icon:AddProductIcon},
  {href:'/admin/seo',label:'Page SEO',Icon:SeoIcon},
  {href:'/admin/operations',label:'Order Operations',Icon:OrdersIcon},
  {href:'/admin/reports',label:'Sales Reports',Icon:ReportsIcon},
  {href:'/admin/reviews',label:'Product Reviews',Icon:StarIcon},
  {href:'/admin/blogs',label:'Blog Posts',Icon:SeoIcon},
  {href:'/admin/testimonials',label:'Video Testimonials',Icon:SeoIcon},
  {href:'/admin/inquiries',label:'Contact Enquiries',Icon:EnquiriesIcon},
  {href:'/admin/social',label:'Social & Contact',Icon:InstagramIcon},
  {href:'/admin/emails',label:'Order Emails',Icon:EmailsIcon}
];

export default function AdminSidebar(){
  const pathname=usePathname();
  const [authenticated,setAuthenticated]=useState(null);
  useEffect(()=>{
    let live=true;
    supabase.auth.getUser().then(({data})=>{if(live)setAuthenticated(!!data.user)});
    const {data:listener}=supabase.auth.onAuthStateChange(event=>{
      if(live)setAuthenticated(event==='SIGNED_OUT'?false:!!event);
    });
    return()=>{live=false;listener.subscription.unsubscribe();};
  },[]);
  const signOut=async()=>{await supabase.auth.signOut().catch(()=>{});window.location.href='/admin';};
  if(authenticated===null)return null;
  if(!authenticated)return null;
  return <aside className="admin-side">
    <div><Link href="/admin" className="side-brand side-brand-logo" aria-label="Baba Hakeem Admin"><BrandLogo className="admin-brand-logo" /></Link></div>
    <nav>
      {LINKS.map(link=>(
        <Link key={link.href} href={link.href} className={pathname===link.href?'active':''}>
          <link.Icon size={15} style={{marginRight:'8px',flexShrink:0}} /> {link.label}
        </Link>
      ))}
      <a href="#security" className="side-anchor">Security</a>
    </nav>
    <div className="side-bottom">
      <button className="logout-btn" onClick={signOut}><SignOutIcon size={14} style={{marginRight:'6px'}} /> Sign out</button>
    </div>
  </aside>;
}
