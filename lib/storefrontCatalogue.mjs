// Shared, read-only helpers for the admin-published storefront catalogue.
// A marketing placeholder is never a source of selling price or stock.
export const normalizeProductName=value=>String(value||'').trim().replace(/\s+/g,' ').toLowerCase();
export const verifiedProductPrice=value=>{
  const normalized=String(value??'').toLowerCase().replace(/rs[.]?|pkr|,|[[:space:]]/g,'');
  return /^[0-9]+([.][0-9]{1,2})?$/.test(normalized)&&Number(normalized)>0?Number(normalized):null;
};
export const publishedProductByName=(products,name)=>{
  if(!Array.isArray(products))return null;
  const key=normalizeProductName(name);
  if(!key)return null;
  return products
    .filter(p=>p?.status==='Published'&&normalizeProductName(p.name)===key)
    .sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0))[0]||null;
};
export const productStock=product=>{
  if(!product||product.stock_status==='Out of Stock')return 0;
  const quantity=Number(product.stock_quantity);
  return Number.isSafeInteger(quantity)&&quantity>0?quantity:0;
};
export const productCanOrder=(product,quantity=1)=>product?.status==='Published'
  &&verifiedProductPrice(product.price)!==null
  &&productStock(product)>=quantity;
