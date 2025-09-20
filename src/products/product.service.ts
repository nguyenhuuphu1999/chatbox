import { Injectable, Logger, Inject } from '@nestjs/common';
import { QdrantClient } from './qdrant.client';
import { ProductInput, ProductPayload, ProductSearchParams, ProductSearchResult, ProductHit } from './product.types';
import { randomUUID } from 'crypto';

export interface LlmDeps {
  embed: (text: string) => Promise<number[]>; // trả vector 768
}

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly COLLECTION = 'products';

  constructor(
    private readonly qdrant: QdrantClient,
    @Inject('LlmDeps') private readonly llm: LlmDeps,
  ) {}

  /** Gọi lúc bootstrap */
  async ensureCollection() {
    await this.qdrant.ensureCollection(this.COLLECTION, 768);
  }

  /** Upsert nhiều sản phẩm vào Qdrant */
  async upsertProducts(items: ProductInput[]) {
    if (!items?.length) return { upserted: 0 };

    const points = await Promise.all(items.map(async (p) => {
      const textual = `${p.title}\n${p.description ?? ''}\n${(p.tags ?? []).join(' ')}`;
      const vector = await this.llm.embed(textual);
      const payload: ProductPayload = {
        product_id: p.productId,
        title: p.title,
        description: p.description,
        price: p.price,
        currency: p.currency,
        brand: p.brand,
        categories: p.categories,
        tags: p.tags,
        stock: p.stock,
        metadata: p.metadata,
        user_id: p.userId,
        indexed_at: new Date().toISOString(),
      };
      return { id: randomUUID(), vector, payload };
    }));

    await this.qdrant.upsert(this.COLLECTION, points);
    return { upserted: points.length };
  }

  /** Tìm kiếm sản phẩm theo vector + filter payload */
  async searchProducts(params: ProductSearchParams): Promise<ProductSearchResult> {
    const {
      query,
      limit = 12,
      offset = 0,
      priceMin,
      priceMax,
      tags,
      brand,
      categories,
      userId,
      scoreThreshold,
    } = params;

    // 1) tạo embedding cho query
    const vector = await this.llm.embed(query);

    // 2) build filter (Qdrant payload filter)
    const must: any[] = [];
    const should: any[] = [];

    if (userId) must.push({ key: 'user_id', match: { value: userId } });
    if (typeof priceMin === 'number' || typeof priceMax === 'number') {
      const range: any = {};
      if (typeof priceMin === 'number') range.gte = priceMin;
      if (typeof priceMax === 'number') range.lte = priceMax;
      must.push({ key: 'price', range });
    }
    if (brand) must.push({ key: 'brand', match: { value: brand } });
    if (tags?.length) should.push({ key: 'tags', match: { any: tags } });
    if (categories?.length) should.push({ key: 'categories', match: { any: categories } });

    const filter: any = {};
    if (must.length) filter.must = must;
    if (should.length) filter.should = should;

    // 3) gọi Qdrant search
    const result = await this.qdrant.search(this.COLLECTION, vector, filter, limit, offset, scoreThreshold);

    // 4) map kết quả
    const hits: ProductHit[] = (result || []).map((r: any) => ({
      id: r.id,
      score: r.score,
      payload: r.payload as ProductPayload,
    }));

    const hasMore = hits.length === limit; // ước lượng đơn giản
    const totalEst = offset + hits.length + (hasMore ? limit : 0);

    return { items: hits, limit, offset, hasMore, totalEst };
  }
}
