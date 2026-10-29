const mysql=require('mysql2/promise');
(async()=>{
  const p=await mysql.createPool({host:'localhost',user:'root',password:'',database:'babahakeem'});
  const [r]=await p.query("DELETE FROM categories WHERE name LIKE 'Test%'");
  console.log('deleted',r.affectedRows);
  const [c]=await p.query('SELECT COUNT(*) AS c FROM categories');
  console.log('categories:',c[0].c);
  await p.end();
})().catch(e=>console.error(e.message));
