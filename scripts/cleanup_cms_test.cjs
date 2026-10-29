const mysql=require('mysql2/promise');
(async()=>{
  const p=await mysql.createPool({host:'localhost',user:'root',password:'',database:'babahakeem'});
  const [ords]=await p.query("SELECT id FROM products WHERE name='Test Herbal Balm'");
  for(const o of ords){await p.query('DELETE FROM products WHERE id=?',[o.id]);}
  const [t]=await p.query("SELECT COUNT(*) AS c FROM products WHERE name LIKE 'Test%'");
  console.log('remaining test products:',t[0].c);
  const [c]=await p.query('SELECT COUNT(*) AS c FROM categories');
  console.log('categories now:',c[0].c);
  const [s]=await p.query('SELECT page_key FROM seo_pages');
  console.log('seo pages:',s.map(x=>x.page_key).join(','));
  await p.end();
})().catch(e=>{console.error(e.message);process.exit(1)});
