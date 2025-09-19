import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpLoggerInterceptor } from "./logger/http-logger.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  
  // Enable CORS for all origins (adjust as needed for production)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Add HTTP logging interceptor
  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 RAG Product Consultation API is running on port ${port}`);
  console.log(`📊 Qdrant URL: ${process.env.QDRANT_URL || 'http://localhost:6333'}`);
  console.log(`🔍 Collection: ${process.env.QDRANT_COLLECTION || 'products'}`);
  console.log(`📝 Logs: ${process.env.LOG_DIR || './logs'}`);
  console.log(`🔍 Audit: ${process.env.AUDIT_LOG_FILE || './logs/audit.log'}`);
}

bootstrap();
