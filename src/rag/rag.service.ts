import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";
import { SYSTEM_CODE } from "../constants/system-code.constants";
import { GeminiClient } from "../clients/gemini.client";
import { QdrantClient } from "../clients/qdrant.client";
import { ClsService } from "../context/cls.service";
import { ProductDoc, SearchFilters } from "../shared/types/product.types";

@Injectable()
export class RagService {
  public constructor(
    private readonly logger: LoggerService,
    private readonly gemini: GeminiClient,
    private readonly qdrant: QdrantClient,
    private readonly cls: ClsService,
  ) {}

  public async upsertProducts(docs: ProductDoc[]): Promise<void> {
    const correlationId = this.cls.getId() ?? `RAG_INGEST_${Date.now()}`;
    this.logger.info("RAG upsert products start", { correlationId, docs_count: docs.length });

    try {
      await this.qdrant.ensure(768);
      const points: Array<{
        id: string;
        vector: number[];
        payload: Record<string, unknown>;
      }> = [];

      for (const doc of docs) {
        this.logger.debug("Generating embedding for product", { correlationId, productId: doc.id });
        const vec = await this.gemini.embed(`${doc.title}\n${doc.description}`);
        
        points.push({
          id: doc.id,
          vector: vec,
          payload: {
            ...doc,
            searchable: `${doc.title}\n${doc.description}`,
            sizes: doc.sizes || [],
            colors: doc.colors || [],
            tags: doc.tags || []
          }
        });
      }

      this.logger.debug("Upserting points to Qdrant", { correlationId, points_count: points.length });
      await this.qdrant.upsert(points);
      
      this.logger.info("RAG upsert products done", { correlationId, docs_count: docs.length });
    } catch (error) {
      this.logger.error("Error RAG upsert products", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.RAG_INGEST_ERROR);
    }
  }

  public async search(
    query: string,
    filters?: SearchFilters,
    k: number = 5
  ): Promise<ProductDoc[]> {
    const correlationId = this.cls.getId() ?? `RAG_SEARCH_${Date.now()}`;
    this.logger.info("RAG search start", { 
      correlationId,
      query: query.substring(0, 50), 
      filters, 
      k 
    });

    try {
      this.logger.debug("Generating query embedding", { correlationId });
      const vec = await this.gemini.embed(query);
      
      const must: Array<{
        key: string;
        range?: { gte?: number; lte?: number };
        match?: { any: string[] };
      }> = [];

      if (filters?.price_min != null || filters?.price_max != null) {
        const range: { gte?: number; lte?: number } = {};
        if (filters.price_min != null) range.gte = filters.price_min;
        if (filters.price_max != null) range.lte = filters.price_max;
        must.push({ key: "price", range });
      }

      if (filters?.size) {
        must.push({ key: "sizes", match: { any: [filters.size] } });
      }

      if (filters?.color) {
        must.push({ key: "colors", match: { any: [filters.color] } });
      }

      if (filters?.category) {
        must.push({ key: "tags", match: { any: [filters.category] } });
      }

      if (filters?.style_tags && filters.style_tags.length > 0) {
        must.push({ key: "tags", match: { any: filters.style_tags } });
      }

      if (filters?.materials && filters.materials.length > 0) {
        must.push({ key: "tags", match: { any: filters.materials } });
      }

      const filter = must.length ? { must } : undefined;
      
      this.logger.debug("Searching in Qdrant", { correlationId, hasFilter: !!filter });
      const hits = await this.qdrant.search(vec, filter, k);
      
      const results = hits.map((h: { payload: ProductDoc }) => h.payload);
      
      this.logger.info("RAG search done", { correlationId, results_count: results.length });
      return results;
    } catch (error) {
      this.logger.error("Error RAG search", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.RAG_SEARCH_ERROR);
    }
  }

  public async getCollectionInfo(): Promise<{
    vectors_count: number;
    status: string;
    config: Record<string, unknown>;
  }> {
    const correlationId = this.cls.getId() ?? `RAG_COLLECTION_INFO_${Date.now()}`;
    this.logger.info("RAG get collection info start", { correlationId });

    try {
      const result = await this.qdrant.getCollectionInfo();
      this.logger.info("RAG get collection info done", { correlationId });
      return result;
    } catch (error) {
      this.logger.error("Error RAG get collection info", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.QDRANT_ERROR);
    }
  }

  public async deleteCollection(): Promise<void> {
    const correlationId = this.cls.getId() ?? `RAG_DELETE_COLLECTION_${Date.now()}`;
    this.logger.info("RAG delete collection start", { correlationId });

    try {
      await this.qdrant.deleteCollection();
      this.logger.info("RAG delete collection done", { correlationId });
    } catch (error) {
      this.logger.error("Error RAG delete collection", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.QDRANT_ERROR);
    }
  }
}
