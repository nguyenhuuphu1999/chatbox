import { GeminiClient } from "../src/clients/gemini.client";
import { QdrantClient } from "../src/clients/qdrant.client";
import { ProductDoc } from "../src/shared/types/product.types";

export class SimpleRagService {
  private gemini: GeminiClient;
  private qdrant: QdrantClient;

  constructor() {
    this.gemini = new GeminiClient();
    this.qdrant = new QdrantClient();
  }

  public async upsertProducts(docs: ProductDoc[]): Promise<void> {
    console.log(`Starting to ingest ${docs.length} products...`);
    
    await this.qdrant.ensure(768);
    const points: Array<{
      id: string;
      vector: number[];
      payload: Record<string, unknown>;
    }> = [];

    for (const doc of docs) {
      console.log(`Generating embedding for product: ${doc.id}`);
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

    console.log(`Upserting ${points.length} points to Qdrant...`);
    await this.qdrant.upsert(points);
    console.log(`Successfully ingested ${docs.length} products!`);
  }

  public async getCollectionInfo(): Promise<{
    vectors_count: number;
    status: string;
    config: Record<string, unknown>;
  }> {
    return this.qdrant.getCollectionInfo();
  }
}
