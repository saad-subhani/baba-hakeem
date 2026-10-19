export const publicPages=['/','/about','/contact','/care-guide','/faq','/ingredients','/process'];
export const blockedPaths=['/admin','/api/','/cart','/checkout','/thank-you'];

export function xmlEscape(value){
  return String(value??'').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'
  })[c]);
}
export function sitemapXml(origin,products=[]){
  const pages=publicPages.map(p=>({loc:origin+p}));
  const productPages=products.filter(p=>p&&/^[a-z0-9-]{1,160}$/.test(String(p.slug||'')))
    .map(p=>({loc:origin+'/products/'+encodeURIComponent(p.slug),
      lastmod:p.updated_at&&Number.isFinite(Date.parse(p.updated_at))
        ?new Date(p.updated_at).toISOString():undefined}));
  const seen=new Set();
  const body=[...pages,...productPages].filter(p=>{
    if(seen.has(p.loc))return false;
    seen.add(p.loc);return true;
  }).map(p=>'<url><loc>'+xmlEscape(p.loc)+'</loc>'+
    (p.lastmod?'<lastmod>'+p.lastmod+'</lastmod>':'')+'</url>').join('');
  return '<?xml version="1.0" encoding="UTF-8"?>'+
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+body+'</urlset>';
}
export function robotsText(origin){
  return [
    'User-agent: *','Allow: /',...blockedPaths.map(path=>'Disallow: '+path),
    'Disallow: /shipping-returns',
    'Disallow: /privacy',
    'Disallow: /terms',
    '',
    'Sitemap: '+origin+'/sitemap.xml',''
  ].join('\n');
}
