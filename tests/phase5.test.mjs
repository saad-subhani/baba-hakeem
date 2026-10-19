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
