# Chatbox - AI Shopping Assistant

Hệ thống chat AI hỗ trợ tìm kiếm sản phẩm thời trang với khả năng phân tích hình ảnh và lưu trữ lịch sử chat.

## 🚀 Tính năng

- **Chat AI**: Trò chuyện thông minh với khách hàng
- **Phân tích hình ảnh**: Tìm sản phẩm tương tự từ ảnh
- **Lọc sản phẩm**: Theo danh mục, giá, màu sắc, size, thương hiệu
- **Lưu trữ chat**: Lịch sử chat được lưu trong PostgreSQL
- **Tìm kiếm ngữ nghĩa**: Sử dụng Qdrant vector database

## 🛠️ Cài đặt

### 1. Cài đặt dependencies

```bash
pnpm install
```

### 2. Khởi động databases

```bash
# Khởi động PostgreSQL và Qdrant
./scripts/start-db.sh

# Hoặc thủ công
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Cấu hình environment

```bash
cp env.example .env
```

Cập nhật các biến trong `.env`:
- `GOOGLE_API_KEY`: API key của Gemini
- `DB_*`: Thông tin kết nối PostgreSQL
- `QDRANT_URL`: URL của Qdrant

### 4. Chạy ứng dụng

```bash
# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

## 📡 API Endpoints

### Chat Endpoint

**POST** `/chat`

```json
{
  "message": "Tôi cần tìm đầm đi làm",
  "imageBase64": "data:image/jpeg;base64,...", // Optional
  "mimeType": "image/jpeg", // Optional
  "filters": { // Optional
    "category": "dress",
    "priceMin": 100000,
    "priceMax": 500000,
    "color": "black",
    "size": "M",
    "brand": "Zara"
  }
}
```

**Response:**
```json
{
  "reply": "Dạ chị có thể cho em xin hình mẫu...",
  "products": []
}
```

### Health Check

**GET** `/health`

## 🗄️ Database Schema

### Customers
- `id`: UUID primary key
- `externalId`: ID từ hệ thống bên ngoài
- `name`: Tên khách hàng
- `profile`: Thông tin profile (JSON)

### Conversations
- `id`: UUID primary key
- `customerId`: ID khách hàng
- `channel`: Kênh chat (web, facebook, etc.)
- `status`: Trạng thái (open, closed)

### Messages
- `id`: UUID primary key
- `conversationId`: ID cuộc trò chuyện
- `customerId`: ID khách hàng
- `role`: Vai trò (user, assistant, system)
- `content`: Nội dung tin nhắn
- `metadata`: Thông tin bổ sung (JSON)

### Memory Summaries
- `id`: UUID primary key
- `customerId`: ID khách hàng
- `summary`: Tóm tắt cuộc trò chuyện
- `turnsCovered`: Số lượt đã tóm tắt
- `tokenCount`: Số token

## 🔧 Development

### Cấu trúc thư mục

```
src/
├── chat/
│   ├── services/
│   │   ├── chat.service.ts          # Logic xử lý chat
│   │   └── chat-history.service.ts  # Quản lý lịch sử chat
│   └── chat.controller.ts           # HTTP controller
├── entities/                        # Database entities
├── shared/dto/                      # Data Transfer Objects
├── clients/                         # External API clients
├── rag/                            # RAG service
└── ai/                             # AI services
```

### Scripts

```bash
# Build
pnpm build

# Lint
pnpm lint

# Test
pnpm test

# Start databases
./scripts/start-db.sh

# Stop databases
docker-compose -f docker-compose.dev.yml down
```

## 📝 Logs

- **Application logs**: `./logs/app.log`
- **Audit logs**: `./logs/audit.log`
- **Error logs**: `./logs/error.log`

## 🐳 Docker

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Stop
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```
