import { Module, MiddlewareConsumer } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { ProductsController } from "./products/products.controller";
import { ChatController } from "./chat/chat.controller";
import { HealthController } from "./health/health.controller";
import { RagService } from "./rag/rag.service";
import { GeminiService } from "./ai/gemini.service";
import { ProductRepository } from "./repositories/product.repository";
import { LoggerModule } from "./logger/logger.module";
import { LoggerService } from "./logger/logger.service";
import { CorrelationMiddleware } from "./context/correlation.middleware";
import { ClsService } from "./context/cls.service";
import { AuditInterceptor } from "./logger/audit.interceptor";
import { HttpLoggerInterceptor } from "./logger/http-logger.interceptor";
import { GeminiClient } from "./clients/gemini.client";
import { QdrantClient } from "./clients/qdrant.client";
import { Product, ProductSchema } from "./entities/product.entity";
import { CreateProductService } from "./services/products/create-product.service";
import { GetProductService } from "./services/products/get-product.service";
import { GetProductsService } from "./services/products/get-products.service";
import { UpdateProductService } from "./services/products/update-product.service";
import { DeleteProductService } from "./services/products/delete-product.service";

@Module({
  imports: [
    LoggerModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/rag-products'),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])
  ],
  controllers: [ProductsController, ChatController, HealthController],
  providers: [
    // Core services
    ClsService,
    GeminiClient,
    QdrantClient,
    RagService,
    GeminiService,
    
    // Repositories
    ProductRepository,
    
    // Product services
    CreateProductService,
    GetProductService,
    GetProductsService,
    UpdateProductService,
    DeleteProductService,
    
    // Interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggerInterceptor
    }
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes('*');
  }
}
