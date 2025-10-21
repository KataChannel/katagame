-- Create demo pages for E-commerce blocks
-- Run this script in PostgreSQL to create demo pages with blocks

-- ============================================================================
-- 1. CREATE PRODUCT LIST PAGE
-- ============================================================================

INSERT INTO "Page" (id, title, slug, description, status, "seoTitle", "seoDescription", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Cửa hàng sản phẩm',
  'products',
  'Danh sách tất cả sản phẩm',
  'PUBLISHED',
  'Cửa hàng - Sản phẩm chất lượng cao',
  'Khám phá các sản phẩm rau củ quả tươi ngon, chất lượng cao từ các nông trại uy tín',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "seoTitle" = EXCLUDED."seoTitle",
  "seoDescription" = EXCLUDED."seoDescription",
  "updatedAt" = NOW()
RETURNING id;

-- Add Product List Block to products page
INSERT INTO "PageBlock" (id, "pageId", type, content, style, "order", "isVisible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  p.id,
  'PRODUCT_LIST',
  jsonb_build_object(
    'title', 'Sản phẩm nổi bật',
    'subtitle', 'Khám phá các sản phẩm chất lượng cao',
    'limit', 12,
    'filters', jsonb_build_object('isFeatured', true),
    'layout', 'grid',
    'columns', 3,
    'showPrice', true,
    'showCategory', true,
    'showDescription', false,
    'showAddToCart', true,
    'cardVariant', 'default'
  ),
  '{}'::jsonb,
  0,
  true,
  NOW(),
  NOW()
FROM "Page" p
WHERE p.slug = 'products'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. CREATE PRODUCT DETAIL PAGE TEMPLATE
-- ============================================================================

INSERT INTO "Page" (id, title, slug, description, status, "seoTitle", "seoDescription", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Chi tiết sản phẩm',
  'product-detail',
  'Template page for product details',
  'PUBLISHED',
  'Chi tiết sản phẩm - Xem thông tin đầy đủ',
  'Xem chi tiết sản phẩm với giá tốt nhất, thông tin đầy đủ',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  "updatedAt" = NOW()
RETURNING id;

-- Add Product Detail Block
INSERT INTO "PageBlock" (id, "pageId", type, content, style, "order", "isVisible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  p.id,
  'PRODUCT_DETAIL',
  jsonb_build_object(
    'showGallery', true,
    'showDescription', true,
    'showSpecs', true,
    'showReviews', false,
    'showRelated', false,
    'layout', 'default'
  ),
  '{}'::jsonb,
  0,
  true,
  NOW(),
  NOW()
FROM "Page" p
WHERE p.slug = 'product-detail'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. CREATE FEATURED PRODUCTS PAGE
-- ============================================================================

INSERT INTO "Page" (id, title, slug, description, status, "seoTitle", "seoDescription", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Sản phẩm nổi bật',
  'featured-products',
  'Các sản phẩm nổi bật được khách hàng yêu thích',
  'PUBLISHED',
  'Sản phẩm nổi bật - Best Sellers',
  'Khám phá các sản phẩm nổi bật được khách hàng yêu thích nhất',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  "updatedAt" = NOW()
RETURNING id;

-- Add Hero Section
INSERT INTO "PageBlock" (id, "pageId", type, content, style, "order", "isVisible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  p.id,
  'HERO',
  jsonb_build_object(
    'title', 'Sản phẩm nổi bật',
    'subtitle', 'Best Sellers',
    'description', 'Những sản phẩm được khách hàng tin tưởng và lựa chọn nhiều nhất',
    'textAlign', 'center',
    'backgroundColor', '#f8fafc'
  ),
  jsonb_build_object(
    'padding', '60px 20px',
    'backgroundColor', '#f8fafc'
  ),
  0,
  true,
  NOW(),
  NOW()
FROM "Page" p
WHERE p.slug = 'featured-products'
ON CONFLICT DO NOTHING;

-- Add Product List Block
INSERT INTO "PageBlock" (id, "pageId", type, content, style, "order", "isVisible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  p.id,
  'PRODUCT_LIST',
  jsonb_build_object(
    'limit', 16,
    'filters', jsonb_build_object('isFeatured', true),
    'layout', 'grid',
    'columns', 4,
    'showPrice', true,
    'showCategory', true,
    'showDescription', true,
    'showAddToCart', true,
    'cardVariant', 'detailed'
  ),
  '{}'::jsonb,
  1,
  true,
  NOW(),
  NOW()
FROM "Page" p
WHERE p.slug = 'featured-products'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. CREATE NEW ARRIVALS PAGE
-- ============================================================================

INSERT INTO "Page" (id, title, slug, description, status, "seoTitle", "seoDescription", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Hàng mới về',
  'new-arrivals',
  'Sản phẩm mới nhất vừa cập nhật',
  'PUBLISHED',
  'Hàng mới về - New Arrivals',
  'Khám phá các sản phẩm mới nhất vừa được cập nhật',
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  "updatedAt" = NOW()
RETURNING id;

-- Add Product List Block for new products
INSERT INTO "PageBlock" (id, "pageId", type, content, style, "order", "isVisible", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  p.id,
  'PRODUCT_LIST',
  jsonb_build_object(
    'title', 'Hàng mới về',
    'subtitle', 'Cập nhật hàng tuần',
    'limit', 12,
    'filters', jsonb_build_object('isNew', true),
    'layout', 'grid',
    'columns', 3,
    'showPrice', true,
    'showCategory', true,
    'showDescription', false,
    'showAddToCart', true,
    'cardVariant', 'default'
  ),
  '{}'::jsonb,
  0,
  true,
  NOW(),
  NOW()
FROM "Page" p
WHERE p.slug = 'new-arrivals'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFY CREATION
-- ============================================================================

-- Show created pages
SELECT 
  p.id,
  p.title,
  p.slug,
  p.status,
  COUNT(pb.id) as block_count
FROM "Page" p
LEFT JOIN "PageBlock" pb ON pb."pageId" = p.id
WHERE p.slug IN ('products', 'product-detail', 'featured-products', 'new-arrivals')
GROUP BY p.id, p.title, p.slug, p.status;

-- Show blocks
SELECT 
  p.slug as page_slug,
  pb.type as block_type,
  pb."order",
  jsonb_pretty(pb.content) as content_preview
FROM "Page" p
JOIN "PageBlock" pb ON pb."pageId" = p.id
WHERE p.slug IN ('products', 'product-detail', 'featured-products', 'new-arrivals')
ORDER BY p.slug, pb."order";
