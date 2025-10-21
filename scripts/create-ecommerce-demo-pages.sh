#!/bin/bash

# Create demo pages for E-commerce blocks
# 1. Product List page
# 2. Product Detail page

echo "📦 Creating E-commerce demo pages..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get auth token (replace with your JWT token)
# You need to be logged in to create pages
TOKEN=${1:-""}

if [ -z "$TOKEN" ]; then
  echo "⚠️  No auth token provided. Pages will be created but you need JWT token."
  echo "Usage: ./create-ecommerce-demo-pages.sh YOUR_JWT_TOKEN"
  echo "Or get token from localStorage after login in browser"
  echo ""
fi

API_URL="http://localhost:3000/graphql"

echo ""
echo "${BLUE}📄 Creating Product List Page...${NC}"

# Create Product List Page
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreatePage($input: CreatePageInput!) { createPage(input: $input) { id title slug } }",
    "variables": {
      "input": {
        "title": "Cửa hàng sản phẩm",
        "slug": "products",
        "description": "Danh sách tất cả sản phẩm",
        "status": "PUBLISHED",
        "seoTitle": "Cửa hàng - Sản phẩm chất lượng cao",
        "seoDescription": "Khám phá các sản phẩm rau củ quả tươi ngon, chất lượng cao từ các nông trại uy tín"
      }
    }
  }' | jq '.'

echo ""
echo "${GREEN}✅ Product List page created at: /products${NC}"

echo ""
echo "${BLUE}📄 Creating Product Detail Template Page...${NC}"

# Create Product Detail Page (template with dynamic slug)
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "query": "mutation CreatePage($input: CreatePageInput!) { createPage(input: $input) { id title slug } }",
    "variables": {
      "input": {
        "title": "Chi tiết sản phẩm",
        "slug": "product-detail-template",
        "description": "Template page for product details",
        "status": "PUBLISHED",
        "seoTitle": "{{product.name}} - Sản phẩm chất lượng",
        "seoDescription": "Xem chi tiết {{product.name}} với giá tốt nhất"
      }
    }
  }' | jq '.'

echo ""
echo "${GREEN}✅ Product Detail template created${NC}"

echo ""
echo "${BLUE}🧱 Now add blocks to these pages in Page Builder:${NC}"
echo ""
echo "📋 For Product List page (/products):"
echo "   1. Open Page Builder for 'products' page"
echo "   2. Add 'Product List' block from E-commerce category"
echo "   3. Configure:"
echo "      - Title: 'Sản phẩm nổi bật'"
echo "      - Filters: isFeatured = true"
echo "      - Columns: 3"
echo "      - Show price, category, add to cart"
echo "   4. Save page"
echo ""
echo "📋 For Product Detail page:"
echo "   1. Open Page Builder for 'product-detail-template' page"
echo "   2. Add 'Product Detail' block from E-commerce category"
echo "   3. Configure:"
echo "      - Leave productSlug empty (will use URL slug)"
echo "      - Enable all display options"
echo "      - Layout: default"
echo "   4. Save page"
echo "   5. Visit /products/rau-muong (or any product slug)"
echo ""

echo "${GREEN}🎉 Demo pages setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Login to admin panel: http://localhost:3001/login"
echo "2. Go to Page Builder"
echo "3. Edit 'products' and 'product-detail-template' pages"
echo "4. Add Product List and Product Detail blocks"
echo "5. Configure and save"
echo ""
echo "Test URLs:"
echo "- Product List: http://localhost:3001/products"
echo "- Product Detail: http://localhost:3001/products/[slug]"
echo "  Example: http://localhost:3001/products/rau-muong"
echo ""
