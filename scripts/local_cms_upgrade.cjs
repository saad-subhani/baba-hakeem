// CMS upgrade: categories, product variations, SEO pages, product price/meta columns.
const mysql=require('mysql2/promise');
const slugify=s=>String(s||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/(^)(-|-$)/g,'').replace(/^-+|-+$/g,'');

(async()=>{
  const p=await mysql.createPool({host:'localhost',user:'root',password:'',database:'babahakeem'});
  const ddl=[
`CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  slug_base VARCHAR(140) NOT NULL DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_cat_slug (slug)
)`,
`CREATE TABLE IF NOT EXISTS product_variations (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  label VARCHAR(120) NOT NULL,
  regular_price DECIMAL(12,2) NULL,
  sell_price DECIMAL(12,2) NULL,
  image VARCHAR(600) NULL,
  image_path VARCHAR(300) NULL,
  stock_quantity INT DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pv_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)`,
`CREATE TABLE IF NOT EXISTS seo_pages (
  id VARCHAR(36) PRIMARY KEY,
  page_key VARCHAR(80) NOT NULL,
  html_title VARCHAR(200) NULL,
  meta_description VARCHAR(320) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL,
  UNIQUE KEY uniq_page_key (page_key)
)`];
  for(const sql of ddl)await p.query(sql);

  const addColumn=async(col,ddl)=>{
    try{await p.query('ALTER TABLE products ADD COLUMN '+ddl);console.log('products: added',col);}
    catch(e){if(e.errno!==1060)console.error('fail',col,e.message);}
  };
  await addColumn('product_type',"product_type VARCHAR(10) NOT NULL DEFAULT 'simple'");
  await addColumn('regular_price','regular_price DECIMAL(12,2) NULL');
  await addColumn('sell_price','sell_price DECIMAL(12,2) NULL');
  await addColumn('meta_title','meta_title VARCHAR(200) NULL');
  await addColumn('meta_description','meta_description VARCHAR(320) NULL');
  await addColumn('category_id','category_id VARCHAR(36) NULL');
  await addColumn('overview','`overview` TEXT NULL');
  await addColumn('usage','`usage` TEXT NULL');

  // Seed categories from the existing string category values.
  const [products]=await p.query('SELECT id,category,price,description,meta_title,meta_description,name FROM products');
  const names=[...new Set(products.map(x=>x.category).filter(c=>c&&String(c).trim()))];
  let created=0;
  for(const raw of names){
    const name=String(raw).trim();
    const base=slugify(name)||'category';
    let slug=base,n=2;
    while(true){
      const [hit]=await p.query('SELECT id FROM categories WHERE slug=? LIMIT 1',[slug]);
      if(!hit.length)break;
      slug=base+'-'+n++;
    }
    await p.query('INSERT INTO categories (id,name,slug,slug_base,created_at) VALUES (?,?,?,?,NOW())',[require('crypto').randomUUID(),name,slug,base]);
    created++;
  }
  const [cats]=await p.query('SELECT id,name FROM categories');
  const catByName=new Map(cats.map(c=>[c.name.toLowerCase(),c.id]));
  let priced=0,linked=0,meta=0;
  for(const prod of products){
    const parsed=Number(String(prod.price||'').toLowerCase().replace(/rs\.?|pkr|,|\s/g,''));
    await p.query('UPDATE products SET sell_price=?, regular_price=NULL WHERE id=?',[Number.isFinite(parsed)&&parsed>0?parsed:null,prod.id]);
    if(Number.isFinite(parsed)&&parsed>0)priced++;
    if(prod.category&&catByName.has(String(prod.category).toLowerCase())){
      await p.query('UPDATE products SET category_id=? WHERE id=?',[catByName.get(String(prod.category).toLowerCase()),prod.id]);
      linked++;
    }
    if(!prod.meta_title&&prod.name){
      await p.query('UPDATE products SET meta_title=? WHERE id=?',(prod.meta_title=prod.name+' | Baba Hakeem',[prod.meta_title,prod.id]));
      meta++;
    }
    if(!prod.meta_description&&prod.description){
      const d=String(prod.description).replace(/\s+/g,' ').trim().slice(0,160);
      if(d){await p.query('UPDATE products SET meta_description=? WHERE id=?',[d,prod.id]);meta++;}
    }
  }
  await p.query("UPDATE products SET regular_price=sell_price WHERE regular_price IS NULL AND sell_price IS NOT NULL").catch(()=>{});
  // SEO seed rows for the known core pages.
  for(const key of ['home']){
    await p.query('INSERT IGNORE INTO seo_pages (id,page_key,created_at) VALUES (UUID(),?,NOW())',[key]);
  }
  console.log('categories seeded:',created,'| products priced:',priced,'| linked:',linked,'| meta filled:',meta);
  await p.end();
})().catch(e=>{console.error('ERR',e);process.exit(1)});
