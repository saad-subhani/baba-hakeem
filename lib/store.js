import crypto from 'crypto';
import {cookies} from 'next/headers';
import pool from './mysql';
import {COOKIE_NAME,readSessionToken} from './session';
import {dispatchOrderEmails} from './orderEmailDispatch';

export {hashPassword,verifyPassword} from './passwordHash';
import {hashPassword,verifyPassword} from './passwordHash';

const uuid=()=>crypto.randomUUID();
const nowSql=()=>new Date();

/* ------------------------------------------------------------------ */
/* SESSION / CURRENT ADMIN                                             */
/* ------------------------------------------------------------------ */
export async function currentAdmin(){
  const store=await cookies();
  return readSessionToken(store.get(COOKIE_NAME)?.value);
}
/** owner status used by admin_owner_status rpc */
export async function ownerStatus(){
  const [admins]=await pool.query('SELECT id,email FROM admins ORDER BY id ASC');
  const owner=admins[0]||null;
  const me=await currentAdmin();
  return {
    has_owner:!!owner,
    is_owner:!!owner&&!!me&&me.email.toLowerCase()===String(owner.email).toLowerCase(),
    owner_email:owner?.email||''
  };
}

/* ------------------------------------------------------------------ */
/* GENERIC QUERY ENGINE (mirrors the supabase-js subset this app uses) */
/* ------------------------------------------------------------------ */
const TABLES=new Set(['products','product_variations','seo_pages','orders','order_items','contact_inquiries','order_email_outbox','inventory_movements','order_status_events']);
const PUBLIC_TABLES=new Set(['products','product_variations','seo_pages']);
const ident=value=>/^[a-z_][a-z0-9_]*$/i.test(value)?value:null;

export async function runQuery({table,select,filters=[],order=null,limit=null,range=null}){
  if(!ident(table)||!TABLES.has(table))return {data:null,error:{message:'Unknown table.'}};
  if(!PUBLIC_TABLES.has(table)){
    const admin=await currentAdmin();
    if(!admin)return {data:null,error:{message:'Owner session required to read '+table+'.'}};
  }
  let cols='*';
  if(typeof select==='string'&&select.trim()&&select.trim()!=='*'){
    const requested=select.split(',').map(c=>c.trim()).filter(Boolean);
    const valid=requested.map(ident);
    if(valid.some(c=>!c))return {data:null,error:{message:'Invalid select columns.'}};
    cols=valid.map(c=>'`'+c+'`').join(',');
  }
  const where=[];
  const catalog=[];
  for(const f of Array.isArray(filters)?filters:[]){
    const col=ident(f.column);
    if(!col)return {data:null,error:{message:'Invalid filter column.'}};
    where.push('`'+col+'` = ?');
    catalog.push(f.value);
  }
  const orderCol=order?ident(order.column):null;
  if(order&&!orderCol)return {data:null,error:{message:'Invalid order column.'}};
  let sql='SELECT '+cols+' FROM `'+table+'`';
  if(where.length)sql+=' WHERE '+where.join(' AND ');
  if(orderCol)sql+=' ORDER BY `'+orderCol+'` '+(order.ascending?'ASC':'DESC');
  const args=[...catalog];
  if(range){
    sql+=' LIMIT ?, ?';args.push(Number(range.from),Number(range.to)-Number(range.from)+1);
  }else if(limit!=null){
    sql+=' LIMIT ?';args.push(Number(limit));
  }
  try{
    const [rows]=await pool.query(sql,args);
    return {data:rows,error:null};
  }catch(err){
    console.error('Local query failed:',table,err.message);
    return {data:null,error:{message:'Query failed on '+table+'.'}};
  }
}

const WRITABLE=new Set(['products','product_variations','seo_pages','orders','order_items','contact_inquiries','order_email_outbox','inventory_movements','order_status_events']);

export async function runWrite({table,action,values,filters=[]}){
  const admin=await currentAdmin();
  if(!admin)return {data:null,error:{message:'Owner session required.'}};
  if(!ident(table)||!WRITABLE.has(table))return {data:null,error:{message:'Unknown table for '+action+'.'}};
  const setCols=Object.keys(values||{}).filter(k=>values[k]!==undefined);
  if(!setCols.length||!setCols.every(ident))return {data:null,error:{message:'Invalid values.'}};
  const filterCols=filters.map(f=>ident(f.column));
  if(filterCols.some(c=>!c))return {data:null,error:{message:'Invalid filter column.'}};
  try{
    if(action==='insert'){
      const [result]=await pool.query(
        'INSERT INTO `'+table+'` ('+setCols.map(c=>'`'+c+'`').join(',')+') VALUES ('+setCols.map(()=>'?').join(',')+')',
        setCols.map(c=>values[c])
      );
      return {data:{id:values.id??result.insertId},error:null};
    }
    if(action==='update'){
      if(!filterCols.length)return {data:null,error:{message:'Update requires a filter.'}};
      const [result]=await pool.query(
        'UPDATE `'+table+'` SET '+setCols.map(c=>'`'+c+'` = ?').join(',')+' WHERE '+filterCols.map(c=>'`'+c+'` = ?').join(' AND '),
        [...setCols.map(c=>values[c]),...filters.map(f=>f.value)]
      );
      return {data:{affected:result.affectedRows},error:null};
    }
    if(action==='delete'){
      if(!filterCols.length)return {data:null,error:{message:'Delete requires a filter.'}};
      const [result]=await pool.query(
        'DELETE FROM `'+table+'` WHERE '+filterCols.map(c=>'`'+c+'` = ?').join(' AND '),
        filters.map(f=>f.value)
      );
      return {data:{affected:result.affectedRows},error:null};
    }
    return {data:null,error:{message:'Unsupported write action.'}};
  }catch(err){
    console.error('Local write failed:',table,action,err.message);
    return {data:null,error:{message:'Database write failed.'}};
  }
}

/* ------------------------------------------------------------------ */
/* RPC IMPLEMENTATIONS (server-authoritative replacements)             */
/* ------------------------------------------------------------------ */
const TRANSITIONS={
  Pending:['Confirmed','Cancelled'],
  Confirmed:['Shipped','Cancelled'],
  Shipped:['Delivered'],
  Delivered:[],
  Cancelled:[]
};
const orderNumber=()=>'BH'+Date.now().toString(36).toUpperCase()+crypto.randomInt(100,999);

export async function runRpc(name,args={}){
  switch(name){
    case 'admin_owner_status':{
      const status=await ownerStatus();
      return {data:[status],error:null};
    }
    case 'admin_set_order_status':{
      const admin=await currentAdmin();
      if(!admin)return {data:null,error:{message:'Owner session required.'}};
      return adminSetOrderStatus(args);
    }
    case 'admin_adjust_stock':{
      const admin=await currentAdmin();
      if(!admin)return {data:null,error:{message:'Owner session required.'}};
      return adminAdjustStock(args);
    }
    case 'submit_contact_enquiry':return submitContactEnquiry(args);
    case 'save_product':{
      const admin=await currentAdmin();
      if(!admin)return {data:null,error:{message:'Owner session required.'}};
      return saveProduct(args);
    }
    case 'upsert_page_seo':{
      const admin=await currentAdmin();
      if(!admin)return {data:null,error:{message:'Owner session required.'}};
      return upsertPageSeo(args);
    }
    case 'delete_page_seo':{
      const admin=await currentAdmin();
      if(!admin)return {data:null,error:{message:'Owner session required.'}};
      return deletePageSeo(args);
    }
    case 'place_store_order':return placeStoreOrder(args);
    case 'claim_admin_ownership':{
      const status=await ownerStatus();
      if(status.has_owner)return {data:null,error:{message:'A local owner account already exists. Manage it in the admins table.'}};
      const admin=await currentAdmin();
      if(!admin)return {data:null,error:{message:'Sign in first to claim ownership.'}};
      await pool.query('INSERT INTO admins (email,password,created_at) VALUES (?,?,NOW()) ON DUPLICATE KEY UPDATE password=VALUES(password)',[admin.email,hashPassword('changeme123')]);
      return {data:admin.email,error:null};
    }
    case 'get_admin_transfer_invite':
    case 'accept_admin_transfer_invite':
    case 'create_admin_transfer_invite':
    case 'cancel_admin_transfer_invite':
    case 'current_admin_transfer_invite':
      return {data:null,error:{message:'Ownership transfer by email is not available in local database mode. Manage the admins table directly.'}};
    default:
      return {data:null,error:{message:'Unknown RPC '+name+'.'}};
  }
}

async function adminSetOrderStatus({p_order_id:id,p_status:next,p_note:note=null}){
  const allowed=TRANSITIONS;
  try{
    await pool.query('START TRANSACTION');
    const [[order]]=await pool.query('SELECT * FROM orders WHERE id=? FOR UPDATE',[id]);
    if(!order){await pool.query('ROLLBACK');return {data:null,error:{message:'Order not found.'}};}
    const options=allowed[order.status]||[];
    if(!options.includes(next)){await pool.query('ROLLBACK');return {data:null,error:{message:'This order is '+order.status+' and its status is final.'}};}
    if(next==='Cancelled'&&order.stock_reserved){
      const [lines]=await pool.query('SELECT product_id,quantity FROM order_items WHERE order_id=?',[id]);
      for(const line of lines){
        const [[product]]=await pool.query('SELECT stock_quantity FROM products WHERE id=? FOR UPDATE',[line.product_id]);
        if(!product)continue;
        const restored=Number(product.stock_quantity||0)+Number(line.quantity||0);
        await pool.query('UPDATE products SET stock_quantity=?, stock_status=CASE WHEN stock_status=? THEN ? ELSE stock_status END WHERE id=?',[restored,'Out of Stock','In Stock',line.product_id]);
        await pool.query('INSERT INTO inventory_movements (id,product_id,product_name,previous_quantity,new_quantity,quantity_change,reason,changed_by,created_at) VALUES (?,?,?,?,?,?,?,?,NOW())',[uuid(),line.product_id,'Restored stock for cancelled order',product.stock_quantity,restored,line.quantity,'Cancellation of order '+order.order_number,order.customer_name]);
      }
      await pool.query('UPDATE orders SET stock_reserved=0 WHERE id=?',[id]);
    }
    await pool.query('UPDATE orders SET status=?, updated_at=NOW() WHERE id=?',[next,id]);
    await pool.query('INSERT INTO order_status_events (id,order_id,order_number,previous_status,new_status,note,changed_by,created_at) VALUES (?,?,?,?,?,?,?,NOW())',[uuid(),id,order.order_number,order.status,next,note||null,'admin']);
    await pool.query('COMMIT');
    return {data:{success:true},error:null};
  }catch(err){
    await pool.query('ROLLBACK').catch(()=>{});
    console.error('Order status change failed:',err.message);
    return {data:null,error:{message:'Order status change failed.'}};
  }
}

async function adminAdjustStock({p_product_id:id,p_delta:delta,p_reason:reason='Stock adjustment'}){
  const admin=await currentAdmin();
  try{
    await pool.query('START TRANSACTION');
    const [[product]]=await pool.query('SELECT * FROM products WHERE id=? FOR UPDATE',[id]);
    if(!product){await pool.query('ROLLBACK');return {data:null,error:{message:'Product not found.'}};}
    const previous=Number(product.stock_quantity||0);
    const next=previous+Number(delta||0);
    if(next<0){await pool.query('ROLLBACK');return {data:null,error:{message:'This adjustment would make inventory negative.'}};}
    await pool.query('UPDATE products SET stock_quantity=?, stock_status=?, updated_at=NOW() WHERE id=?',[next,next===0?'Out of Stock':'In Stock',id]);
    await pool.query('INSERT INTO inventory_movements (id,product_id,product_name,previous_quantity,new_quantity,quantity_change,reason,changed_by,created_at) VALUES (?,?,?,?,?,?,?,?,NOW())',[uuid(),id,product.name,previous,next,delta,reason,admin.email]);
    await pool.query('COMMIT');
    return {data:next,error:null};
  }catch(err){
    await pool.query('ROLLBACK').catch(()=>{});
    console.error('Stock adjustment failed:',err.message);
    return {data:null,error:{message:'Stock adjustment failed.'}};
  }
}

async function submitContactEnquiry({p_name:name,p_email:email='',p_phone:phone='',p_category:category,p_reference:reference='',p_message:message}){
  if(!name||name.length<2||message.length<15)return {data:null,error:{message:'Please complete all required enquiry fields.'}};
  try{
    const [[{recent}]] = await pool.query(
      'SELECT COUNT(*) AS recent FROM contact_inquiries WHERE (customer_email=? OR customer_phone=?) AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
      [email,phone]
    );
    if(recent>=3)return {data:null,error:{message:'Please wait before submitting another enquiry.'}};
    await pool.query(
      'INSERT INTO contact_inquiries (id,customer_name,customer_email,customer_phone,category,order_reference,message,status,created_at) VALUES (?,?,?,?,?,?,?,\'New\',NOW())',
      [uuid(),name,email,phone,category,reference,message]
    );
    return {data:true,error:null};
  }catch(err){
    console.error('Contact enquiry failed:',err.message);
    return {data:null,error:{message:'Please check the enquiry details and try again.'}};
  }
}

async function placeStoreOrder({p_customer:customer,p_items:items}){
  const c=customer||{};
  const list=Array.isArray(items)?items:[];
  try{
    await pool.query('START TRANSACTION');
    let total=0;
    const prepared=[];
    for(const item of list){
      const [[product]]=await pool.query(
        'SELECT * FROM products WHERE id=? OR slug=? LIMIT 1 FOR UPDATE',
        [String(item.id||''),String(item.id||'')]
      );
      if(!product){await pool.query('ROLLBACK');return {data:null,error:{message:'Cart item '+item.name+' is no longer available.'}};}
      // New CMS pricing: sell_price first, legacy string price as fallback.
      let price=Number(String(product.price||'').toLowerCase().replace(/rs\.?|pkr|,|\s/g,''));
      if(product.sell_price!=null)price=Number(product.sell_price);
      const quantity=Number(item.quantity||0);
      const variation=item.p_variation_id||item.variation_id?await (async()=>{
        const [[v]]=await pool.query('SELECT * FROM product_variations WHERE id=? AND product_id=? FOR UPDATE',[String(item.p_variation_id||item.variation_id||''),product.id]);
        return v||null;
      })():null;
      if(product.status!=='Published'||!Number.isFinite(price)||price<=0){await pool.query('ROLLBACK');return {data:null,error:{message:'Checkout for '+product.name+' is not yet available. Please use WhatsApp ordering.'}};}
      if(variation){
        if(variation.sell_price!=null)price=Number(variation.sell_price);
        const vstock=Number(variation.stock_quantity||0);
        if(vstock<quantity){await pool.query('ROLLBACK');return {data:null,error:{message:'Not enough stock for '+product.name+' ('+variation.label+').'}};}
      }else{
        const stock=Number(product.stock_quantity||0);
        if(stock<quantity){await pool.query('ROLLBACK');return {data:null,error:{message:'Not enough stock for '+product.name+'.'}};}
      }
      const line=Number(price)*quantity;
      total+=line;
      prepared.push({product,quantity,line,variation});
    }
    const first=prepared[0];
    const orderId=uuid();
    const number=orderNumber();
    await pool.query(
      'INSERT INTO orders (id,order_number,product_id,product_name,unit_price,quantity,total_amount,customer_name,phone,city,address,notes,status,created_at,updated_at,customer_email,payment_method,transaction_id,stock_reserved) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [orderId,number,first.product.id,first.product.name,first.product.price,first.quantity,total,String(c.name||''),String(c.phone||''),String(c.city||''),String(c.address||''),String(c.notes||'')||null,'Pending',nowSql(),nowSql(),String(c.email||'')||null,String(c.payment_method||'Cash on Delivery'),String(c.transaction_id||''),1]
    );
    for(const row of prepared){
      await pool.query(
        'INSERT INTO order_items (order_id,product_id,product_name,unit_price,quantity,line_total) VALUES (?,?,?,?,?,?)',
        [orderId,row.product.id,row.product.name,row.product.price,row.quantity,row.line]
      );
      const newStock=Number(row.product.stock_quantity)-row.quantity;
      await pool.query('UPDATE products SET stock_quantity=?, stock_status=?, updated_at=NOW() WHERE id=?',[newStock,newStock===0?'Out of Stock':'In Stock',row.product.id]);
      await pool.query(
        'INSERT INTO inventory_movements (id,product_id,product_name,previous_quantity,new_quantity,quantity_change,reason,changed_by,created_at) VALUES (?,?,?,?,?,?,?,?,NOW())',
        [uuid(),row.product.id,row.product.name,row.product.stock_quantity,newStock,-row.quantity,'Reserved for COD order '+number,number]
      );
    }
    if(String(c.email||'').trim())await pool.query(
      'INSERT INTO order_email_outbox (id,order_id,kind,recipient_email,status,attempts,created_at) VALUES (?,?,?,?,?,?,NOW())',
      [uuid(),orderId,'customer',String(c.email).trim(),'pending',0]
    );
    await pool.query('INSERT INTO order_email_outbox (id,order_id,kind,recipient_email,status,attempts,created_at) VALUES (?,?,?,?,?,?,NOW())',[uuid(),orderId,'store','','pending',0]);
    await pool.query('COMMIT');
    dispatchOrderEmails({orderNumber:number,limit:2}).catch(()=>{});
    return {data:[{order_number:number,total_amount:total}],error:null};
  }catch(err){
    await pool.query('ROLLBACK').catch(()=>{});
    console.error('Checkout failed:',err.message);
    if(/stock|unavailable|not yet available|no longer/i.test(err.message))return {data:null,error:{message:err.message}};
    return {data:null,error:{message:'Could not place your order. Please try again.'}};
  }
}

/* ------------------------------------------------------------------ */
/* CMS RPCs: products (slug/SEO/variations), page SEO                  */
/* ------------------------------------------------------------------ */
const slugify=value=>String(value||'').toLowerCase()
  .replace(/&/g,'and').replace(/['"]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

async function uniqueSlugFallback(){return null;}
async function ensureUniqueSlug(table,column,desired,fallbackPart,excludeId=null){
  let slug=slugify(desired)||slugify(fallbackPart);
  if(!slug)slug='item';
  let candidate=slug,n=2;
  while(true){
    const [hit]=await pool.query('SELECT id FROM `'+table+'` WHERE `'+column+'`=? LIMIT 1',[candidate]);
    if(!hit.length||hit[0].id===excludeId)return {slug:candidate};
    candidate=slug+'-'+n++;
  }
}

const autoDescription=({name,type}) =>
  'Baba Hakeem '+name+' is a premium '+String(type||'herbal').toLowerCase()+
  ' crafted under the Baba Hakeem tradition'+
  '. Pure herbal quality you can trust.';

async function saveProduct({p_product:input,p_variations:variations,p_id:id=null}){
  try{
    await pool.query('START TRANSACTION');
    const name=String(input.name||'').trim();
    if(name.length<2){await pool.query('ROLLBACK');return {data:null,error:{message:'Product name is required.'}};}
    const type=String(input.product_type||'simple').toLowerCase()==='variable'?'variable':'simple';
    const numPrice=value=>{const n=Number(String(value??'').replace(/[^0-9.]/g,''));return Number.isFinite(n)&&n>0?n:null;};
    let sellPrice=numPrice(input.sell_price);
    let regularPrice=numPrice(input.regular_price);
    if(type==='simple'&&!sellPrice){await pool.query('ROLLBACK');return {data:null,error:{message:'A valid sell price is required for simple products.'}};}
    if(regularPrice&&sellPrice&&regularPrice<sellPrice){const t=regularPrice;regularPrice=sellPrice;sellPrice=t;}

    if(!id){
      // Slug is auto-generated from the title unless a custom slug is passed.
      const {slug}=await ensureUniqueSlug('products','slug',input.slug||name,name);
      const description=String(input.description||'').trim()||autoDescription({name:name,type:input.type});
      const metaTitle=String(input.meta_title||'').trim()||name+' | Baba Hakeem';
      const metaDescription=String(input.meta_description||'').trim()||String(description).replace(/\s+/g,' ').trim().slice(0,160);
      const stock=Number(input.stock_quantity||0)||0;
      const stockStatus=type==='variable'?'In Stock':(stock<=0?'Out of Stock':(stock<=5?'Low Stock':'In Stock'));
      const faqs=JSON.stringify((Array.isArray(input.faqs)?input.faqs:[]).map(item=>({question:String(item.question||'').trim().slice(0,500),answer:String(item.answer||'').trim().slice(0,3000)})).filter(item=>item.question&&item.answer).slice(0,30));
      await pool.query(
        'INSERT INTO products (id,name,slug,type,product_type,description,price,regular_price,sell_price,status,image,image_path,meta_title,meta_description,overview,`usage`,faqs,stock_status,featured,sort_order,whatsapp_number,stock_quantity,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())',
        [uuid(),name,slug,String(input.type||'').slice(0,50),type,description,
         sellPrice?String(sellPrice):'',regularPrice,sellPrice,String(input.status||'Draft'),String(input.image||''),String(input.image_path||'')||null,
         metaTitle.slice(0,200),metaDescription.slice(0,320),String(input.overview||'').trim()||null,String(input.usage||'').trim()||null,faqs,stockStatus,input.featured?1:0,Number(input.sort_order||0)||0,
         String(input.whatsapp_number||''),stock]
      );
      const [[created]]=await pool.query('SELECT id,slug FROM products WHERE slug=? LIMIT 1',[slug]);
      const productId=created.id;
      if(type==='variable'){
        const result=await replaceVariations(productId,variations);
        if(result?.error){await pool.query('ROLLBACK');return result;}
      }
      await pool.query('COMMIT');
      return {data:[{id:productId,slug:created.slug,name}],error:null};
    }
    // existing product update: keep requested slug but ensure uniqueness
    const [[existing]]=await pool.query('SELECT * FROM products WHERE id=? FOR UPDATE',[id]);
    if(!existing){await pool.query('ROLLBACK');return {data:null,error:{message:'Product not found.'}};}
    const {slug}=await ensureUniqueSlug('products','slug',input.slug||existing.slug||name,name,id===existing.id?id:null);
    const description=String(input.description||'').trim()||autoDescription({name:name,type:existing.type});
    const metaTitle=String(input.meta_title||'').trim()||name+' | Baba Hakeem';
    const metaDescription=String(input.meta_description||'').trim()||String(description).replace(/\s+/g,' ').trim().slice(0,160);
    const stock=Number(input.stock_quantity||0)||0;
    const stockStatus=type==='variable'?'In Stock':(stock<=0?'Out of Stock':(stock<=5&&existing.stock_status!=='Out of Stock'?'Low Stock':'In Stock'));
    const effectiveType=existing.product_type&&existing.product_type==='variable'?existing.product_type:type;
    const finalStockStatus=effectiveType==='variable'?'In Stock':stockStatus;
    const legacyPrice=type==='simple'&&sellPrice?String(sellPrice):existing.price;
    const faqs=JSON.stringify((Array.isArray(input.faqs)?input.faqs:[]).map(item=>({question:String(item.question||'').trim().slice(0,500),answer:String(item.answer||'').trim().slice(0,3000)})).filter(item=>item.question&&item.answer).slice(0,30));
    await pool.query(
      'UPDATE products SET name=?,slug=?,type=?,product_type=?,description=?,price=?,regular_price=?,sell_price=?,status=?,image=?,image_path=COALESCE(NULLIF(? ,""),image_path),meta_title=?,meta_description=?,overview=?,`usage`=?,faqs=?,stock_status=?,featured=?,sort_order=?,whatsapp_number=?,stock_quantity=?,updated_at=NOW() WHERE id=?',
      [name,slug,String(input.type||existing.type||'').slice(0,50),effectiveType,description,
       legacyPrice,regularPrice,sellPrice,String(input.status||existing.status||'Draft'),String(input.image||''),String(input.image_path||''),metaTitle.slice(0,200),metaDescription.slice(0,320),String(input.overview||'').trim()||null,String(input.usage||'').trim()||null,faqs,finalStockStatus,input.featured?1:0,Number(input.sort_order||0)||0,String(input.whatsapp_number||''),stock,id]
    );
    await pool.query('DELETE FROM product_variations WHERE product_id=?',[id]);
    if(effectiveType==='variable'){
      const result=await replaceVariations(id,variations);
      if(result?.error){await pool.query('ROLLBACK');return result;}
    }
    await pool.query('COMMIT');
    return {data:[{id,slug,name}],error:null};
  }catch(err){
    await pool.query('ROLLBACK').catch(()=>{});
    console.error('save_product failed:',err.message);
    return {data:null,error:{message:'Could not save the product.'}};
  }
}

async function replaceVariations(productId,variations){
  const rows=Array.isArray(variations)?variations.filter(v=>v&&String(v.label||'').trim()):[];
  let sort=0;
  for(const row of rows){
    const label=String(row.label).trim().slice(0,120);
    const num=value=>{const n=Number(String(value??'').replace(/[^0-9.]/g,''));return Number.isFinite(n)&&n>0?n:null;};
    const sell=num(row.sell_price);
    const regular=num(row.regular_price);
    await pool.query(
      'INSERT INTO product_variations (id,product_id,label,regular_price,sell_price,image,image_path,stock_quantity,sort_order,created_at) VALUES (?,?,?,?,?,?,?,?,?,NOW())',
      [uuid(),productId,label,regular,sell,
       String(row.image||'')||null,String(row.image_path||'')||null,Math.max(0,Number(row.stock_quantity||0)||0),sort++]
    );
  }
  return {error:null};
}

async function upsertPageSeo({p_id:id=null,p_page_key:pageKey,p_html_title:htmlTitle,p_meta_description:metaDescription}){
  const key=String(pageKey||'').trim().toLowerCase().replace(/\s+/g,'-').slice(0,80);
  if(!key)return {data:null,error:{message:'A page key (e.g. home, about) is required.'}};
  try{
    if(id){
      const [r]=await pool.query('UPDATE seo_pages SET html_title=?,meta_description=?,updated_at=NOW() WHERE id=?',[String(htmlTitle||'').slice(0,200),String(metaDescription||'').slice(0,320),id]);
      if(!r.affectedRows)return {data:null,error:{message:'SEO entry not found.'}};
      return {data:[{id,page_key:key}],error:null};
    }
    const [[dupe]]=await pool.query('SELECT id FROM seo_pages WHERE page_key=?',[key]);
    if(dupe){
      await pool.query('UPDATE seo_pages SET html_title=?,meta_description=?,updated_at=NOW() WHERE id=?',[String(htmlTitle||'').slice(0,200),String(metaDescription||'').slice(0,320),dupe.id]);
      return {data:[{id:dupe.id,page_key:key}],error:null};
    }
    const seoId=uuid();
    await pool.query('INSERT INTO seo_pages (id,page_key,html_title,meta_description,created_at) VALUES (?,?,?,?,NOW())',[seoId,key,String(htmlTitle||'').slice(0,200),String(metaDescription||'').slice(0,320)]);
    return {data:[{id:seoId,page_key:key}],error:null};
  }catch(err){
    console.error('upsert_page_seo failed:',err.message);
    return {data:null,error:{message:'Could not save the page SEO settings.'}};
  }
}

async function deletePageSeo({p_id:id}){
  try{
    const [r]=await pool.query('DELETE FROM seo_pages WHERE id=?',[id]);
    if(!r.affectedRows)return {data:null,error:{message:'SEO entry not found.'}};
    return {data:true,error:null};
  }catch(err){
    console.error('delete_page_seo failed:',err.message);
    return {data:null,error:{message:'Could not delete the SEO entry.'}};
  }
}
