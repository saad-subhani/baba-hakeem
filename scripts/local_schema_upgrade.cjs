// One-time local schema upgrade for the MySQL conversion.
const mysql=require('mysql2/promise');
(async()=>{
  const p=await mysql.createPool({host:'localhost',user:'root',password:'',database:'babahakeem',multipleStatements:true});
  await p.query(`
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id VARCHAR(36) PRIMARY KEY,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(254) DEFAULT '',
  customer_phone VARCHAR(24) DEFAULT '',
  category VARCHAR(50) NOT NULL,
  order_reference VARCHAR(50) DEFAULT '',
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'New',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
);
CREATE TABLE IF NOT EXISTS order_email_outbox (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  kind VARCHAR(20) NOT NULL DEFAULT 'customer',
  recipient_email VARCHAR(254) DEFAULT '',
  status VARCHAR(20) DEFAULT 'pending',
  attempts INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  claimed_at DATETIME NULL,
  sent_at DATETIME NULL,
  next_attempt_at DATETIME NULL,
  last_error TEXT NULL,
  provider_message_id VARCHAR(255) NULL
);
CREATE TABLE IF NOT EXISTS inventory_movements (
  id VARCHAR(36) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  previous_quantity INT NOT NULL,
  new_quantity INT NOT NULL,
  quantity_change INT NOT NULL,
  reason VARCHAR(200) DEFAULT '',
  changed_by VARCHAR(255) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS order_status_events (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  previous_status VARCHAR(20) DEFAULT NULL,
  new_status VARCHAR(20) NOT NULL,
  note TEXT NULL,
  changed_by VARCHAR(255) DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS store_bank_details (
  id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
  account_title VARCHAR(160) NOT NULL DEFAULT '',
  bank_name VARCHAR(120) NOT NULL DEFAULT '',
  logo_url VARCHAR(700) NOT NULL DEFAULT '',
  iban VARCHAR(80) NOT NULL DEFAULT '',
  account_number VARCHAR(80) NOT NULL DEFAULT '',
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  updated_at DATETIME NULL
)`);
  await p.query('INSERT IGNORE INTO store_bank_details (id,enabled) VALUES (1,0)');
  for(const col of [
    "stock_reserved TINYINT(1) DEFAULT 0",
    "customer_email VARCHAR(254) DEFAULT ''",
    "payment_method VARCHAR(30) DEFAULT ''",
    "transaction_id VARCHAR(120) DEFAULT ''"
  ]){
    try{
      await p.query('ALTER TABLE orders ADD COLUMN '+col);
      console.log('orders: added',col.split(' ')[0]);
    }catch(e){
      if(e.code!=='ER_DUP_FIELDNAME'&&e.errno!==1060){
        console.error('orders alter failed for',col,e.message);
      }
    }
  }
  console.log('schema ready');
  await p.end();
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
