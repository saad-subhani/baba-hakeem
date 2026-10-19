import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {publicPages,blockedPaths,xmlEscape,sitemapXml,robotsText} from '../lib/siteSeo.mjs';
const source=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('Sitemap includes public pages and excludes unapproved product slugs',()=>{
  const origin='https://example.org';
  const result=sitemapXml(origin,[
    {slug:'hair-oil',updated_at:'2026-10-19T08:00:00Z'},
    {slug:'../private'},
    {slug:'mens-oil'},
    {slug:'hair-oil'}
  ]);
  assert.ok(result.startsWith('<?xml version="1.0"'));
  for(const path of publicPages)assert.ok(result.includes('<loc>'+origin+path+'</loc>'));
  assert.ok(result.includes('<loc>'+origin+'/products/hair-oil</loc>'));
  assert.ok(result.includes('<lastmod>2026-10-19T08:00:00.000Z</lastmod>'));
  assert.equal(result.match(/<loc>https:\/\/example.org\/products\/hair-oil<\/loc>/g).length,1);
  assert.ok(!result.includes('../private'));
  assert.ok(!result.includes('/admin/'));
  assert.ok(!result.includes('/checkout'));
});
test('Robots links the actual serving origin, while restricting non-public routes',()=>{
  const robots=robotsText('https://example.org');
  assert.ok(robots.includes('Sitemap: https://example.org/sitemap.xml'));
  for(const p of blockedPaths)assert.ok(robots.includes('Disallow: '+p));
  assert.ok(robots.includes('Disallow: /privacy'));
  assert.ok(!robots.includes('your-future-domain'));
});
test('XML escaping does not leave markup characters unescaped',()=>{
  assert.equal(xmlEscape("A&B<>\"'"),'A&amp;B&lt;&gt;&quot;&apos;');
});
test('Enquiries are validated by the server, stored through an RPC, and owner readable',()=>{
  const api=source('app/api/contact/route.js');
  const component=source('components/ContactEnquiryForm.js');
  const migration=source('supabase/migrations/20261019_contact_enquiries.sql');
  assert.ok(api.includes("supabase.rpc('submit_contact_enquiry'"));
  assert.ok(api.includes('request.headers.get'));
  assert.ok(api.includes('raw.length>8192'));
  assert.ok(component.includes("fetch('/api/contact'"));
  assert.ok(migration.includes('enable row level security'));
  assert.ok(migration.includes("char_length(v_message) not between 15 and 2500"));
  assert.ok(migration.includes('pg_advisory_xact_lock'));
});
test('Locked storefront animation implementation remains present',()=>{
  const home=source('app/page.js');
  assert.ok(home.includes("from 'gsap'"));
  assert.ok(home.includes('targetScale=window.innerWidth<760?1.95:2.12'));
  assert.ok(home.includes('handsRect.height*.83'));
});


test('Admin redesign is scoped to admin layout and keeps storefront layout unchanged',()=>{
  const layout=source('app/admin/layout.js');
  const stylesheet=source('app/admin/admin-design.css');
  const home=source('app/page.js');
  const root=source('app/layout.js');
  assert.ok(layout.includes('id="baba-admin-root"'));
  assert.ok(layout.includes("import './admin-design.css'"));
  assert.ok(stylesheet.includes('#baba-admin-root .admin-design-links'));
  assert.ok(stylesheet.includes('body:has(#baba-admin-root)'));
  assert.ok(stylesheet.includes('CartExperience_floatingCart'));
  assert.ok(stylesheet.includes('.bh-language-toggle'));
  assert.ok(home.includes('handsRect.height*.83'));
  assert.ok(root.includes('<CartExperience/>'));
  assert.ok(root.includes('<LanguageToggle/>'));
});

test('Every admin workspace subpage has shared navigation and responsive CSS',()=>{
  const names=[
    ['components/AdminOperations.js','components/AdminOperations.module.css'],
    ['components/AdminSalesReports.js','components/AdminSalesReports.module.css'],
    ['components/AdminEmailQueue.js','components/AdminEmailQueue.module.css'],
    ['components/AdminEnquiries.js','components/AdminEmailQueue.module.css']
  ];
  for(const [component,css] of names){
    assert.ok(source(component).includes('<AdminSectionNav/>'),component+' missing nav');
    assert.ok(source(component).includes("import AdminSectionNav from './AdminSectionNav'"),component+' missing import');
    assert.ok(source(css).includes('@media(max-width:650px)')||source(css).includes('@media(max-width:640px)'),css+' mobile layout missing');
  }
  const nav=source('components/AdminSectionNav.js');
  for(const route of ['/admin/operations','/admin/reports','/admin/emails','/admin/inquiries'])assert.ok(nav.includes(route));
});

test('Admin order detail is immediately useful, and admin quick actions are real routes',()=>{
  const operations=source('components/AdminOperations.js');
  const dashboard=source('app/admin/page.js');
  const styles=source('app/admin/admin.css');
  assert.ok(operations.includes('setExpanded(current=>current&&o.some(item=>item.id===current)'));
  assert.ok(dashboard.includes('className="admin-shortcuts"'));
  assert.ok(dashboard.includes('href="/admin/operations"'));
  assert.ok(dashboard.includes('href="/admin/reports"'));
  assert.ok(dashboard.includes('href="/admin/inquiries"'));
  assert.ok(styles.includes('#baba-admin-root .admin-shortcuts'));
  assert.ok(styles.includes('@media(max-width:620px)'));
});


test('COD checkout is the verified server-side default for all new customer orders',()=>{
  const migration=source('supabase/migrations/20261019_cod_checkout.sql');
  const api=source('app/api/orders/route.js');
  assert.ok(migration.includes("alter column payment_method set default 'Cash on Delivery'"));
  assert.ok(migration.includes("v_address,v_notes,'Cash on Delivery','Pending',true)"));
  assert.ok(migration.includes("v_price_raw := regexp_replace"));
  assert.ok(migration.includes("stock_quantity=stock_quantity-"));
  assert.ok(!migration.includes("update public.orders set payment_method"));
  assert.ok(api.includes("supabase.rpc('place_store_order'"));
  assert.ok(!api.includes("payment_method:body"));
});

test('COD messaging is consistent on cart, address checkout, receipt and single-product order',()=>{
  const checkout=source('components/StoreCheckout.js');
  const product=source('app/products/[slug]/page.js');
  assert.ok(checkout.includes("Cash on Delivery (COD)"));
  assert.ok(checkout.includes("PLACE COD ORDER"));
  assert.ok(checkout.includes("Price pending"));
  assert.ok(checkout.includes("COMPLETE DELIVERY ADDRESS *"));
  assert.ok(checkout.includes("Your COD order request was received."));
  assert.ok(checkout.includes("Any delivery charges"));
  assert.ok(product.includes("CASH ON DELIVERY / NO ADVANCE PAYMENT"));
  assert.ok(product.includes("DELIVERY ADDRESS *"));
  assert.ok(product.includes("PLACE COD ORDER"));
  assert.ok(product.includes("PRODUCT SUBTOTAL (COD)"));
});
