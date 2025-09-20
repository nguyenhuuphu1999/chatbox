#!/bin/bash

BASE_URL="http://localhost:3000"

echo "🧪 Testing Product API endpoints..."

# Test 1: Seed sample products
echo "1. Seeding sample products..."
curl -X POST "$BASE_URL/products/seed" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "productId": "SKU-001",
      "title": "Váy xòe đen dáng A",
      "description": "Chất liệu tuyết mưa, phù hợp công sở",
      "price": 350000,
      "currency": "VND",
      "brand": "YourBrand",
      "categories": ["dress"],
      "tags": ["den", "cong so", "size M"],
      "stock": 12,
      "metadata": { "color": "black", "sizes": ["S","M","L"] },
      "userId": "merchant-1"
    },
    {
      "productId": "SKU-002",
      "title": "Áo sơ mi trắng công sở",
      "description": "Chất liệu cotton cao cấp, form dáng chuẩn",
      "price": 280000,
      "currency": "VND",
      "brand": "OfficeStyle",
      "categories": ["shirt"],
      "tags": ["trang", "cong so", "cotton"],
      "stock": 25,
      "metadata": { "color": "white", "sizes": ["S","M","L","XL"] },
      "userId": "merchant-1"
    }
  ]' | jq '.'

echo -e "\n2. Testing product search..."
# Test 2: Search products
curl -X GET "$BASE_URL/products/search?q=vay%20den&limit=5" | jq '.'

echo -e "\n3. Testing product search with filters..."
# Test 3: Search with filters
curl -X GET "$BASE_URL/products/search?q=ao%20cong%20so&priceMin=200000&priceMax=400000&brand=OfficeStyle" | jq '.'

echo -e "\n4. Testing product search by tags..."
# Test 4: Search by tags
curl -X GET "$BASE_URL/products/search?q=quan%20ao&tags=den,cong%20so" | jq '.'

echo -e "\n✅ Product API tests completed!"
