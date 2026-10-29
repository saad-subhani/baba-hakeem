-- Idempotent source-data bootstrap for Baba Hakeem admin review.
-- Existing storefront imagery, not verified commercial data.
-- No product is published or orderable; admin must confirm final prices/stock.
insert into public.products(name,slug,category,type,description,image,sort_order,status,stock_status,stock_quantity,price)
select seed.name,seed.slug,seed.category,seed.type,seed.description,seed.image,seed.sort_order,'Draft','Out of Stock',0,null
from (values
  ('Hair Oil', 'hair-oil', 'Hair Care', 'Oil', 'Herbal hair care for a considered everyday routine.', '/products/hair%20oil%20mockup%20png.png', 10),
  ('Joint Oil', 'joint-oil', 'Topical Care', 'Oil', 'Focused massage oil for a simple everyday care ritual.', '/joint-oil-4k.png', 20),
  ('Herbal Phakki', 'herbal-phakki', 'Herbal Wellness', 'Powder', 'A familiar herbal blend from the Baba Hakeem collection.', '/products/phakii.png', 40),
  ('Men''s Oil', 'mens-oil', 'Men''s Care', 'Oil', 'Personal care oil presented with a simple daily ritual.', '/products/mens-oil-new.png', 50),
  ('Wedding Course', 'wedding-course', 'Premium Personal Care', 'Collection', 'A premium personal-care collection prepared for gifting and everyday routines.', '/products/wedding-course.webp.png', 60),
  ('Zafran', 'zafran', 'Premium Saffron', 'Saffron', 'Premium saffron; confirm official product details before publishing.', '/products/zafran/IMG_20241002_133606.webp', 70)
) as seed(name,slug,category,type,description,image,sort_order)
where not exists (select 1 from public.products p where lower(p.name)=lower(seed.name) or p.slug=seed.slug);
