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


test('Published Admin product overrides matching static collection card, never an old draft',async()=>{
  const catalogue=await import('../lib/storefrontCatalogue.mjs');
  const products=[
    {id:'draft-old',name:'Hair Oil',status:'Draft',created_at:'2026-10-19T08:00:00Z',price:null,stock_quantity:0,stock_status:'Out of Stock'},
    {id:'new-hair',name:'Hair oil',status:'Published',created_at:'2026-10-19T11:00:00Z',price:'2000',stock_quantity:1,stock_status:'In Stock',
      image:'https://example.org/storage/hair-green.png'},
    {id:'older-hair',name:'HAIR OIL',status:'Published',created_at:'2026-10-19T09:00:00Z',price:'1200',stock_quantity:6,stock_status:'In Stock'},
    {id:'other',name:'Joint Oil',status:'Draft',created_at:'2026-10-19T09:00:00Z',price:'1800',stock_quantity:2,stock_status:'In Stock'}
  ];
  const actual=catalogue.publishedProductByName(products,' HAIR   OIL ');
  assert.equal(actual.id,'new-hair');
  assert.equal(actual.image,'https://example.org/storage/hair-green.png');
  assert.equal(catalogue.verifiedProductPrice(actual.price),2000);
  assert.equal(catalogue.productStock(actual),1);
  assert.equal(catalogue.productCanOrder(actual),true);
  assert.equal(catalogue.productCanOrder(actual,2),false);
  assert.equal(catalogue.publishedProductByName(products,'Joint Oil'),null);
});

test('No draft or out-of-stock product can be added at a demo price',async()=>{
  const catalogue=await import('../lib/storefrontCatalogue.mjs');
  assert.equal(catalogue.verifiedProductPrice(null),null);
  assert.equal(catalogue.verifiedProductPrice('Rs. 2,000'),2000);
  assert.equal(catalogue.verifiedProductPrice('not approved'),null);
  assert.equal(catalogue.productStock({stock_status:'Out of Stock',stock_quantity:1}),0);
  assert.equal(catalogue.productCanOrder({status:'Published',price:'2000',stock_status:'Out of Stock',stock_quantity:0}),false);
  const cart=source('components/CartExperience.js');
  assert.ok(!cart.includes('price:1200'));
  assert.ok(!cart.includes('price:1800'));
  assert.ok(cart.includes(".eq('status','Published')"));
  assert.ok(cart.includes('publishedProductByName(publishedProducts,name)'));
  assert.ok(cart.includes("meta.dataset.cartAvailable==='true'"));
  assert.ok(cart.includes('Out of stock'));
  assert.ok(cart.includes('baba-catalogue-cards-changed'));
  assert.ok(cart.includes("imageTag.dataset.originalCatalogueSrc"));
  assert.ok(cart.includes("visual.classList.contains('ref-joint-target')"));
  assert.ok(cart.includes("imageTag?.classList.contains('ref-mens-moving')"));
  const checkout=source('components/StoreCheckout.js');
  assert.ok(checkout.includes(".eq('status','Published').order('created_at',{ascending:false})"));
});

test('Locked GSAP and six fixed product anchors remain in their original homepage',()=>{
  const home=source('app/page.js');
  assert.ok(home.includes("const HAIR_OIL='/products/hair%20oil%20mockup%20png.png'"));
  assert.ok(home.includes('<article className="ref-mens-source">'));
  assert.ok(home.includes('ref={jointTargetRef}'));
  assert.ok(home.includes('ref={mensOilRef}'));
  assert.ok(home.includes('scrub:1.15'));
  assert.ok(home.includes('scrub:1.2'));
  assert.ok(home.includes('targetScale=window.innerWidth<760?1.95:2.12'));
  assert.ok(home.includes('handsRect.height*.83'));
});


test('Cart, checkout and thank-you headers stay above page titles without overlap',()=>{
  const css=source('components/StoreCheckout.module.css');
  const jsx=source('components/StoreCheckout.js');
  const global=source('app/globals.css');
  assert.ok(global.includes('header{position:absolute;'), 'Regression fixture: global cinematic header is positioned');
  const headerRule=css.split('.header{')[1]?.split('}')[0]||'';
  assert.ok(headerRule.includes('position:relative'), 'Shop header should stay in document flow');
  assert.ok(headerRule.includes('inset:auto'), 'Reset inherited global header offsets');
  assert.ok(headerRule.includes('padding:0'), 'Reset cinematic header padding');
  assert.ok(headerRule.includes('display:flex'), 'Preserve cart header navigation layout');
  assert.ok(jsx.indexOf('<header className={styles.header}')<jsx.indexOf('<h1 className={styles.title}'), 'Shop brand header precedes heading');
  assert.ok(css.includes('@media(max-width:530px)'), 'Keep existing mobile spacing');
});


test('Premium Thank You presentation is scoped and never changes stored order status',()=>{
  const page=source('components/StoreCheckout.js');
  const css=source('components/StoreCheckout.module.css');
  const publicLayout=source('app/layout.js');
  assert.ok(page.includes("variant==='thank-you'?"), 'Thank You page styling must be opt-in');
  assert.ok(page.includes('variant="thank-you"'), 'Only the confirmation uses the premium variant');
  assert.ok(page.includes("saved.order_number===order"), 'Reference only shown for matching session receipt');
  assert.ok(page.includes('receipt?<div className={styles.thankYouGrid}>'), 'Successful receipt is distinct from missing receipt');
  assert.ok(page.includes('!checked?<section'), 'No flash of false confirmation before session is checked');
  assert.ok(page.includes('Cash on Delivery'), 'Confirmed payment method remains COD');
  assert.ok(page.includes('AWAITING CONFIRMATION'), 'Order status must not be shown as paid or fulfilled');
  assert.ok(page.includes('Any delivery charges will be confirmed'), 'No invented shipping rates');
  assert.ok(page.includes('navigator.clipboard.writeText(receipt.order_number)'), 'Order reference can be copied');
  assert.ok(page.includes('aria-live="polite"'), 'Copy feedback is announced accessibly');
  assert.ok(css.includes('.thankYouScreen'), 'All premium styles opt into the Thank You screen');
  assert.ok(css.includes('.thankYouGrid'), 'Premium two-column layout exists');
  assert.ok(css.includes('@media(max-width:600px)'), 'Confirmation stacks on small screens');
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'), 'Animations respect reduced motion');
  assert.ok(css.includes('stroke-dashoffset:0!important'), 'Checkmark remains visible in reduced motion');
  assert.ok(publicLayout.includes('<CartExperience/>'), 'Storefront cart is untouched');
});

test('Existing Cart and Checkout remain on the original shared styles and order flow',()=>{
  const page=source('components/StoreCheckout.js');
  const css=source('components/StoreCheckout.module.css');
  const beforeThankYou=page.split('export function ThankYouPage(){')[0];
  assert.ok(beforeThankYou.includes('export function CartPage(){'));
  assert.ok(beforeThankYou.includes('export function CheckoutPage(){'));
  assert.ok(beforeThankYou.includes("supabase.from('products').select"));
  assert.ok(beforeThankYou.includes("fetch('/api/orders'"));
  assert.ok(beforeThankYou.includes("window.location.assign('/thank-you?order='"));
  assert.ok(beforeThankYou.includes('PLACE COD ORDER'));
  assert.ok(beforeThankYou.includes(':styles.screen}>'), 'Ordinary cart/checkout still use base style');
  assert.ok(css.includes('.header{height:100px;position:relative;inset:auto;'), 'Previously fixed nonoverlapping header is retained');
  assert.ok(css.includes('.formRow{display:grid;grid-template-columns:1fr 1fr;'), 'Checkout layout preserved');
});
