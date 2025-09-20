import { Module, OnModuleInit } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService, LlmDeps } from './product.service';
import { QdrantClient } from './qdrant.client';

// ví dụ LLM deps đơn giản (bạn thay bằng OpenAI/…)
const llmDepsFactory = (): LlmDeps => ({
  embed: async (text: string) => {
    // TODO: thay bằng embed thật (OpenAI text-embedding-3-large, v.v.)
    // TẠM: giả lập vector 768 = 0
    const size = 768;
    const v = new Array(size).fill(0);
    // Simple hash để đỡ toàn zero (demo)
    let h = 0; for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    v[h % size] = 1;
    return v;
  },
});

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    { provide: QdrantClient, useFactory: () => new QdrantClient(process.env.QDRANT_URL) },
    { provide: 'LLM_DEPS', useFactory: llmDepsFactory },
    { provide: 'LlmDeps', useExisting: 'LLM_DEPS' },
  ],
  exports: [ProductService],
})
export class ProductModule implements OnModuleInit {
  constructor(private readonly productService: ProductService) {}
  async onModuleInit() {
    await this.productService.ensureCollection();
  }
}
