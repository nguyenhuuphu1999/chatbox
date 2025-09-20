# Product API Documentation

## 🚀 ProductModule - Tìm kiếm sản phẩm với Qdrant

### **📡 API Endpoints**

#### 1. **POST** `/products/seed` - Insert sản phẩm vào Qdrant

**Mô tả:** Thêm/cập nhật sản phẩm vào vector database Qdrant

**Request Body:**
```json
[
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
  }
]
```

**Response:**
```json
{
  "upserted": 5
}
```

**Ví dụ sử dụng:**
```bash
curl -X POST "http://localhost:3010/products/seed" \
  -H "Content-Type: application/json" \
  -d '[{"productId": "SKU-001", "title": "Váy xòe đen dáng A", ...}]'
```

---

#### 2. **GET** `/products/search` - Tìm kiếm sản phẩm

**Mô tả:** Tìm kiếm sản phẩm bằng vector similarity với filters

**Query Parameters:**
- `q` (required): Từ khóa tìm kiếm
- `limit` (optional): Số kết quả (default: 12)
- `offset` (optional): Vị trí bắt đầu (default: 0)
- `priceMin` (optional): Giá tối thiểu
- `priceMax` (optional): Giá tối đa
- `brand` (optional): Thương hiệu
- `tags` (optional): Tags (comma-separated)
- `categories` (optional): Danh mục (comma-separated)
- `userId` (optional): ID người dùng (scope)
- `scoreThreshold` (optional): Ngưỡng similarity score

**Response:**
```json
{
  "items": [
    {
      "id": "8ae7fbeb-5fa6-4fe2-877b-0eef07a8ed58",
      "score": 0.95,
      "payload": {
        "product_id": "SKU-001",
        "title": "Váy xòe đen dáng A",
        "description": "Chất liệu tuyết mưa, phù hợp công sở",
        "price": 350000,
        "currency": "VND",
        "brand": "YourBrand",
        "categories": ["dress"],
        "tags": ["den", "cong so", "size M"],
        "stock": 12,
        "metadata": { "color": "black", "sizes": ["S","M","L"] },
        "user_id": "merchant-1",
        "indexed_at": "2025-09-20T17:28:06.470Z"
      }
    }
  ],
  "limit": 12,
  "offset": 0,
  "hasMore": true,
  "totalEst": 25
}
```

---

### **🔍 Ví dụ sử dụng**

#### 1. Tìm kiếm cơ bản
```bash
curl -X GET "http://localhost:3010/products/search?q=vay%20den&limit=5"
```

#### 2. Tìm kiếm với filters
```bash
curl -X GET "http://localhost:3010/products/search?q=ao%20cong%20so&priceMin=200000&priceMax=400000&brand=OfficeStyle"
```

#### 3. Tìm kiếm theo tags
```bash
curl -X GET "http://localhost:3010/products/search?q=quan%20ao&tags=den,cong%20so"
```

#### 4. Tìm kiếm theo categories
```bash
curl -X GET "http://localhost:3010/products/search?q=giay&categories=shoes"
```

#### 5. Tìm kiếm với pagination
```bash
curl -X GET "http://localhost:3010/products/search?q=ao&limit=5&offset=10"
```

---

### **📊 Cấu trúc dữ liệu**

#### ProductInput (Input)
```typescript
interface ProductInput {
  productId: string;           // ID sản phẩm
  title: string;              // Tên sản phẩm
  description?: string;       // Mô tả
  price?: number;             // Giá
  currency?: string;          // Đơn vị tiền tệ
  brand?: string;             // Thương hiệu
  categories?: string[];      // Danh mục
  tags?: string[];            // Tags
  stock?: number;             // Số lượng
  metadata?: Record<string, any>; // Metadata bổ sung
  userId?: string;            // ID người dùng (scope)
}
```

#### ProductPayload (Lưu trong Qdrant)
```typescript
interface ProductPayload {
  product_id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  brand?: string;
  categories?: string[];
  tags?: string[];
  stock?: number;
  metadata?: Record<string, any>;
  user_id?: string;
  indexed_at: string;         // ISO timestamp
}
```

#### ProductSearchResult (Kết quả tìm kiếm)
```typescript
interface ProductSearchResult {
  items: ProductHit[];        // Danh sách sản phẩm
  limit: number;              // Số kết quả
  offset: number;             // Vị trí bắt đầu
  hasMore: boolean;           // Có thêm kết quả
  totalEst: number;           // Ước lượng tổng số
}
```

---

### **⚙️ Cấu hình**

#### Environment Variables
```bash
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=products
```

#### Collection Settings
- **Vector size:** 768 dimensions
- **Distance metric:** Cosine similarity
- **Collection name:** `products`

---

### **🔧 Technical Details**

#### Embedding Process
1. **Text combination:** `title + description + tags.join(' ')`
2. **Vector generation:** Mock embedding (hash-based)
3. **Storage:** Qdrant vector database

#### Search Process
1. **Query embedding:** Convert search query to vector
2. **Filter building:** Apply price, brand, tags, categories filters
3. **Vector search:** Cosine similarity search in Qdrant
4. **Result formatting:** Return with pagination info

#### Filter Types
- **Must filters:** AND logic (userId, price range, brand)
- **Should filters:** OR logic (tags, categories)

---

### **📝 Notes**

- **Mock Embedding:** Hiện tại sử dụng hash-based embedding. Cần thay bằng Gemini/OpenAI embedding thật
- **Error Handling:** 409 Conflict được ignore khi collection đã tồn tại
- **Performance:** Vector search với cosine similarity
- **Scalability:** Hỗ trợ pagination và filtering

---

### **🚀 Quick Start**

```bash
# 1. Khởi động ứng dụng
pnpm start:dev

# 2. Insert sản phẩm
curl -X POST "http://localhost:3010/products/seed" \
  -H "Content-Type: application/json" \
  -d '[{"productId": "SKU-001", "title": "Váy xòe đen", ...}]'

# 3. Tìm kiếm
curl -X GET "http://localhost:3010/products/search?q=vay%20den"
```
