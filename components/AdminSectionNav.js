'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const sections=[
  ['/admin','Overview'],
  ['/admin/operations','Orders & Stock'],
  ['/admin/reports','Sales Reports'],
  ['/admin/emails','Order Emails'],
  ['/admin/inquiries','Enquiries']
];
export default function AdminSectionNav(){
  const pathname=usePathname();
  return <nav className="admin-design-links" aria-label="Admin navigation">
    {sections.map(([href,label])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined}
      className={pathname===href?'admin-design-link-current':''}>{label}</Link>)}
    <Link className="admin-design-external" href="/">Storefront ↗</Link>
  </nav>;
}
