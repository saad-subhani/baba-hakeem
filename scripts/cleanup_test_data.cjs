// Removes the data created by test_local_flow.mjs and restores reserved stock.
const mysql=require('mysql2/promise');
(async()=>{
  const p=await mysql.createPool({host:'localhost',user:'root',password:'',database:'babahakeem'});
  const [ords]=await p.query("SELECT id,stock_reserved FROM orders WHERE customer_name='Test Buyer'");
  for(const o of ords){
    if(o.stock_reserved){
      const [lines]=await p.query('SELECT product_id,quantity FROM order_items WHERE order_id=?',[o.id]);
      for(const l of lines){
        await p.query('UPDATE products SET stock_quantity=stock_quantity+? WHERE id=?',[l.quantity,l.product_id]);
      }
    }
    await p.query('DELETE FROM order_items WHERE order_id=?',[o.id]);
    await p.query('DELETE FROM order_email_outbox WHERE order_id=?',[o.id]);
    await p.query('DELETE FROM order_status_events WHERE order_id=?',[o.id]);
  }
  await p.query("DELETE FROM orders WHERE customer_name='Test Buyer'");
  await p.query("DELETE FROM contact_inquiries WHERE customer_name='Test Person' OR customer_email='c@test.com'");
  await p.query("DELETE FROM inventory_movements WHERE reason LIKE 'test%' OR reason LIKE '%test recount%'");
  const [[pr]]=await p.query('SELECT stock_quantity FROM products WHERE id=?',['e978fe07-f215-415b-a49d-02af598e3ff0']);
  console.log('cleanup done; Herbal Hair Oil stock:',pr.stock_quantity);
  await p.end();
})().catch(e=>{console.error(e.message);process.exit(1)});
