# RAG Product Consultation System

A complete RAG (Retrieval-Augmented Generation) system for product consultation using NestJS, Qdrant, and Google Gemini.

## Features

- **Product Ingestion**: Upload and index products with vector embeddings
- **Smart Chat**: AI-powered product consultation with natural language
- **Image Analysis**: Upload product images for visual similarity search
- **Advanced Filtering**: Filter by price, size, color, category, and more
- **Vector Search**: Semantic search using Gemini embeddings and Qdrant

## Architecture

```
Client -> NestJS (ChatController)
      -> RagService.embed (Gemini Embedding: text-embedding-004)
      -> Qdrant search (vector + filter)
      -> GeminiService.answer (gemini-1.5-flash) -> trả lời
```

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Google Gemini API Key

## Quick Start

### 1. Setup Environment

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your Google Gemini API key
GOOGLE_API_KEY=your_gemini_key_here
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=products
PORT=3000
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Qdrant

```bash
docker-compose up -d
```

### 4. Start the Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

### 5. Ingest Sample Products

```bash
pnpm run ingest
```

## API Endpoints

### Products

#### `POST /products/ingest`
Ingest products into the vector database.

```bash
curl -X POST http://localhost:3000/products/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "d001",
        "title": "Đầm đen ôm công sở",
        "price": 590000,
        "description": "Chất liệu cotton co giãn, phù hợp đi làm",
        "sizes": ["S", "M", "L"],
        "colors": ["đen"]
      }
    ]
  }'
```

#### `GET /products/collection-info`
Get information about the Qdrant collection.

#### `DELETE /products/collection`
Delete the entire collection (use with caution).

### Chat

#### `POST /chat`
Chat with the AI consultant.

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mình cần đầm dự tiệc dưới 700k, size M",
    "filters": {
      "price_max": 700000,
      "size": "M"
    }
  }'
```

#### `POST /chat/image`
Chat with image analysis.

```bash
curl -X POST http://localhost:3000/chat/image \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tìm sản phẩm tương tự",
    "imageBase64": "data:image/jpeg;base64,/9j/4AAQ...",
    "mimeType": "image/jpeg"
  }'
```

## Data Structure

### Product Schema

```typescript
interface ProductDoc {
  id: string;
  title: string;
  price: number;
  currency?: string; // default: VND
  sizes?: string[];
  colors?: string[];
  stock?: number;
  url?: string;
  description: string;
  tags?: string[];
}
```

### Chat Filters

```typescript
interface ProductFilters {
  price_min?: number;
  price_max?: number;
  size?: string;
  color?: string;
  category?: string;
  style_tags?: string[];
  materials?: string[];
}
```

## Development

### Project Structure

```
src/
├── ai/                    # AI services (Gemini)
├── chat/                  # Chat controllers
├── common/                # Base classes
├── dto/                   # Data Transfer Objects
├── entities/              # Domain entities
├── interfaces/            # TypeScript interfaces
├── products/              # Product controllers
├── rag/                   # RAG services (Qdrant)
├── repositories/          # Data repositories
├── types/                 # Type definitions
├── app.module.ts          # Main module
└── main.ts               # Application entry point
```

### Key Components

- **RagService**: Handles vector embeddings and Qdrant operations
- **GeminiService**: Manages AI responses and image analysis
- **ProductRepository**: Extends BaseRepository for product operations
- **BaseEntity**: Base class for all entities
- **Validation**: Uses class-validator for DTO validation

### Adding New Features

1. Create interfaces in `src/interfaces/`
2. Implement services extending base classes
3. Add DTOs with validation in `src/dto/`
4. Create controllers following the existing pattern
5. Update `AppModule` to register new components

## Performance Notes

- **Qdrant**: ~1ms search latency
- **Embedding**: 100-300ms per request
- **Chat Generation**: 1-2.5s response time
- **Memory Usage**: Optimized for 2GB server

## Security

- API keys are loaded from environment variables
- CORS is enabled for development (configure for production)
- Input validation on all endpoints
- No sensitive data in logs

## Troubleshooting

### Common Issues

1. **Qdrant Connection Error**
   ```bash
   # Check if Qdrant is running
   docker ps
   # Restart if needed
   docker-compose restart
   ```

2. **Gemini API Error**
   - Verify API key in `.env`
   - Check API quota and billing

3. **Collection Not Found**
   ```bash
   # Check collection info
   curl http://localhost:3000/products/collection-info
   ```

### Logs

```bash
# View application logs
pnpm run start:dev

# View Qdrant logs
docker-compose logs qdrant
```

## License

MIT License
