// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpLoggerInterceptor } from "./logger/http-logger.interceptor";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as net from "net";
import "dotenv/config";

async function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const srv = net
      .createServer()
      .once("error", () => resolve(false))
      .once("listening", () => srv.close(() => resolve(true)))
      .listen(port, "0.0.0.0");
  });
}

async function pickPort(base: number, attempts = 20): Promise<number> {
  let p = base;
  for (let i = 0; i < attempts; i++, p++) {
    if (await isPortFree(p)) return p;
  }
  throw new Error(`No free port in range ${base}..${p - 1}`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // CORS
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Access log
  app.useGlobalInterceptors(new HttpLoggerInterceptor());

  // (Tuỳ chọn) Nếu bạn có global prefix:
  // const globalPrefix = "api";
  // app.setGlobalPrefix(globalPrefix);

  // Swagger: enabled by default, can be disabled with ENABLE_SWAGGER=false
  const enableSwagger = process.env.ENABLE_SWAGGER !== "false";
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle("RAG Product Consultation API")
      .setDescription("Endpoints for products, chat, and health checks")
      .setVersion("1.0.0")
      .build();
    const document = SwaggerModule.createDocument(app, config);

    // Nếu có globalPrefix ở trên, path đúng nên là `/${globalPrefix}/docs`
    SwaggerModule.setup("docs", app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // Chọn port rảnh rồi listen 1 lần
  const basePort = Number(process.env.PORT) || 3000;
  const port = await pickPort(basePort, 20);
  await app.listen(port);

  const url = (await app.getUrl()).replace(/\/$/, "");
  console.log(`🚀 RAG Product Consultation API is running: ${url}`);

  if (enableSwagger) {
    // Nếu có globalPrefix:
    // console.log(`📘 Swagger Docs: ${url}/${globalPrefix}/docs`);
    console.log(`📘 Swagger Docs: ${url}/docs`);
  }

  console.log(`📊 Qdrant URL: ${process.env.QDRANT_URL || "http://localhost:6333"}`);
  console.log(`🔍 Collection: ${process.env.QDRANT_COLLECTION || "products"}`);
  console.log(`📝 Logs: ${process.env.LOG_DIR || "./logs"}`);
  console.log(`🔍 Audit: ${process.env.AUDIT_LOG_FILE || "./logs/audit.log"}`);
}

bootstrap();
