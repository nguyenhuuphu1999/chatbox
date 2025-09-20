import { Module, MiddlewareConsumer } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatController } from "./chat/chat.controller";
import { ChatService } from "./chat/services/chat.service";
import { ChatHistoryService } from "./chat/services/chat-history.service";
import { HealthController } from "./health/health.controller";
import { RagService } from "./rag/rag.service";
import { GeminiService } from "./ai/gemini.service";
import { LoggerModule } from "./logger/logger.module";
import { CorrelationMiddleware } from "./context/correlation.middleware";
import { ClsService } from "./context/cls.service";
import { AuditInterceptor } from "./logger/audit.interceptor";
import { HttpLoggerInterceptor } from "./logger/http-logger.interceptor";
import { GeminiClient } from "./clients/gemini.client";
import { QdrantClient } from "./clients/qdrant.client";
import { Customer } from "./entities/customer.entity";
import { Conversation } from "./entities/conversation.entity";
import { Message } from "./entities/message.entity";
import { MemorySummary } from "./entities/memory-summary.entity";
import { ProductModule } from "./products/product.module";

@Module({
  imports: [
    LoggerModule,
    ProductModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '6432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'chatbox',
      entities: [Customer, Conversation, Message, MemorySummary],
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Customer, Conversation, Message, MemorySummary]),
  ],
  controllers: [ChatController, HealthController],
  providers: [
    // Core services
    ClsService,
    GeminiClient,
    QdrantClient,
    RagService,
    GeminiService,
    ChatService,
    ChatHistoryService,
    
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
