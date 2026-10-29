// Tests the CMS RPCs: save_product (simple + variable), categories, page SEO.
const base=process.env.BASE||'http://localhost:3002';

async function rpc(cookie,name,args){
  const r=await fetch(base+'/api/local/rpc',{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify({name,args})});
  return {status:r.status,body:await r.json().catch(()=>null)};
}

const login=await fetch(base+'/api/local/auth',{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({action:'login',email:'admin@baba-hakeem.com',password:'admin123'})});
const cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
console.log('login:',login.status);

// 1. list categories
const q1=await fetch(base+'/api/local/query',{method:'POST',headers:{'Content-Type':'application/json',cookie},
  body:JSON.stringify({table:'categories',select:'*',order:{column:'name',ascending:true}})});
const cats=(await q1.json()).data;
console.log('categories:',cats.map(c=>c.name).join(', '));

// 2. save a NEW simple product with no slug/description/SEO -> auto-generated
const simple=await rpc(cookie,'save_product',{p_product:{name:'Test Herbal Balm',
  sell_price:'999',regular_price:'1200',status:'Draft',type:'BALM',stock_quantity:12,
  kind:'simple',product_type:'simple',image:'/products/test.png',image_path:'test.png'},
  p_variations:[],p_id:null});
console.log('new simple product:',JSON.stringify(simple.body));

const productId=simple.body?.data?.[0]?.id;
const productSlug=simple.body?.data?.[0]?.slug;
if(productId){
  // read back to verify auto fields
  const r=await fetch(base+'/api/local/query',{method:'POST',headers:{'Content-Type':'application/json',cookie},
    body:JSON.stringify({table:'products',select:'*',filters:[{column:'id',value:productId}]})});
  const p=(await r.json()).data?.[0];
  console.log('auto slug →',p.slug,'| auto desc →',String(p.description||'').slice(0,60),'| meta →',p.meta_title,'| sell:',p.sell_price,'regular:',p.regular_price);

  // 3. duplicate slug test: saving another product with same title should get a unique slug
  const dup=await rpc(cookie,'save_product',{p_product:{name:'Test Herbal Balm',sell_price:'101',product_type:'simple',status:'Draft',type:'BALM',image:'/products/test.png'},p_variations:[],p_id:null});
  console.log('duplicate slug avoided →',(dup.body?.data?.[0]?.slug)!==productSlug,dup.body?.data?.[0]?.slug);

  // 4. update the first product into a VARIABLE product with 2 variations
  const variable=await rpc(cookie,'save_product',{p_product:{name:'Test Herbal Balm',
    product_type:'variable',category_id:cats[0]?.id,type:'BALM',status:'Published',
    sell_price:'',registrar:'',image:'/products/test.png',image_path:'test.png',
    meta_title:'',meta_description:''},p_variations:[
      {label:'10 ml',sell_price:'40',regular_price:'50',stock_quantity:20},
      {label:'30 ml',sell_price:'90',stock_quantity:10,image:'/products/30ml.png',image_path:'30ml.png'}
    ],p_id:productId});
  console.log('variable save:',variable.status,variable.body?.error?.message||variable.body?.data?.[0]?.slug);
  const rv=await fetch(base+'/api/local/query',{method:'POST',headers:{'Content-Type':'application/json',cookie},
    body:JSON.stringify({table:'product_variations',select:'*',filters:[{column:'product_id',value:productId}],order:{column:'sort_order',ascending:true}})});
  const vrows=(await rv.json()).data||[];
  console.log('variations stored:',vrows.map(v=>v.label+':'+v.sell_price+':'+(v.image||'-')).join(' | '));

  /// 5. categories CRUD
  const newCat=await rpc(cookie,'upsert_category',{p_name:'Test Range'});
  console.log('category created:',JSON.stringify(newCat.body?.data?.[0]));
  const catId=newCat.body?.data?.[0]?.id;
  const dupeCat=await rpc(cookie,'upsert_category',{p_name:'Test Range'});
  console.log('duplicate category slug unique →',(dupeCat.body?.data?.[0]?.slug!=='test-range'),dupeCat.body?.data?.[0]?.slug);
  const delCat=await rpc(cookie,'delete_category',{p_id:catId});
  console.log('category deleted:',delCat.body?.data===true,delCat.body?.error?.message||'');

  // 6. page SEO upsert & list
  const seo=await rpc(cookie,'upsert_page_seo',{p_page_key:'home',p_html_title:'Baba Hakeem Herbal Products',p_meta_description:'Pure herbal oils and blends.'});
  console.log('seo upsert:',seo.status,JSON.stringify(seo.body?.data?.[0]||seo.body?.error));
  const seoAbout=await rpc(cookie,'upsert_page_seo',{p_page_key:'about',p_html_title:'About us',p_meta_description:'Our story.'});
  console.log('seo about:',seoAbout.status);
  const delSeo=await rpc(cookie,'delete_page_seo',{p_id:seoAbout.body?.data?.[0]?.id});
  console.log('seo about deleted:',delSeo.body?.data===true);

  // cleanup test products
  for(const pid of [productId])
    await fetch(base+'/api/local/write',{method:'POST',headers:{'Content-Type':'application/json',cookie},
      body:JSON.stringify({table:'products',action:'delete',values:{},filters:[{column:'id',value:pid}]})});
  const dupId=(await (await fetch(base+'/api/local/query',{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify({table:'products',select:'id',filters:[{column:'slug',value:dup.body?.data?.[0]?.slug}]})})).json()).data?.[0]?.id;
  if(dupId)await fetch(base+'/api/local/write',{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify({table:'products',action:'delete',values:{},filters:[{column:'id',value:dupId}]})});
  const after=await fetch(base+'/api/local/query',{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify({table:'products',select:'id',filters:[{column:'slug',value:'test-herbal-balm'}]})});
  console.log('cleanup done, remaining test products:',((await after.json()).data||[]).length);
}
