import { Injectable, Logger } from '@nestjs/common';
import { createHttp } from '../utils/http.util';

@Injectable()
export class QdrantClient {
  private readonly logger = new Logger(QdrantClient.name);
  private url = process.env.QDRANT_URL || 'http://localhost:6333';
  private collection = process.env.QDRANT_COLLECTION || 'products';
  private http = createHttp(this.url);
  // Allow forcing real Qdrant usage via USE_QDRANT=true
  private readonly isTest: boolean = process.env.USE_QDRANT !== 'true';

  // In-memory storage for test mode
  private inMemoryPoints: Array<{ id: string; vector: number[]; payload: Record<string, unknown> }> = [];

  public async ensure(size = 768): Promise<void> {
    this.logger.debug(`ensure start: collection=${this.collection}, size=${size}`);
    try {
      await this.http.put(`/collections/${this.collection}`, {
        vectors: { size, distance: 'Cosine' },
        optimizers_config: { default_segment_number: 1 },
      });
      this.logger.debug(`ensure done: collection created/verified`);
    } catch (error: any) {
      // Collection might already exist, ignore 409 errors
      if (error.response?.status !== 409) {
        this.logger.error(`ensure error: ${error}`);
        throw error;
      }
      this.logger.debug(`ensure done: collection already exists`);
    }
  }

  public async upsert(points: any[]): Promise<any> {
    this.logger.debug(`upsert start: points_count=${points.length}`);
    try {
      // Coerce numeric IDs if present
      const normalized = points.map(p => ({
        ...p,
        id: typeof p.id === 'string' && /^\d+$/.test(p.id) ? Number(p.id) : p.id
      }));
      const result = await this.http.put(`/collections/${this.collection}/points?wait=true`, { points: normalized });
      this.logger.debug(`upsert done: points_count=${points.length}`);
      return result;
    } catch (error) {
      this.logger.error(`upsert error: ${error}`);
      throw error;
    }
  }

  public async search(vector: number[], filter: unknown, limit = 5): Promise<any[]> {
    this.logger.debug(`search start: vector_size=${vector.length}, limit=${limit}, has_filter=${!!filter}`);
    if (this.isTest) {
      // Very simple cosine similarity on in-memory data, with basic filter on payload
      const normV = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
      const fitsFilter = (payload: Record<string, unknown>): boolean => {
        if (!filter || typeof filter !== 'object') return true;
        const f = filter as { must?: Array<{ key: string; range?: { gte?: number; lte?: number }; match?: { any: string[] } }> };
        if (!f.must) return true;
        return f.must.every(cond => {
          const val = payload[cond.key as keyof typeof payload] as unknown;
          if (cond.range && typeof val === 'number') {
            if (cond.range.gte != null && val < cond.range.gte) return false;
            if (cond.range.lte != null && val > cond.range.lte) return false;
            return true;
          }
          if (cond.match && Array.isArray(val)) {
            return cond.match.any.some(x => (val as unknown[]).includes(x));
          }
          return true;
        });
      };
      const ranked = this.inMemoryPoints
        .filter(p => fitsFilter(p.payload))
        .map(p => {
          const dot = p.vector.reduce((s, v, i) => s + v * (vector[i] || 0), 0);
          const normP = Math.sqrt(p.vector.reduce((s, v) => s + v * v, 0)) || 1;
          const score = dot / (normV * normP);
          return { payload: p.payload, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      this.logger.debug(`search done (test mode): results_count=${ranked.length}`);
      return ranked;
    }
    try {
      const { data } = await this.http.post(`/collections/${this.collection}/points/search`, {
        vector, 
        filter, 
        limit, 
        with_payload: true,
      });
      const results = data.result || [];
      this.logger.debug(`search done: results_count=${results.length}`);
      return results;
    } catch (error) {
      this.logger.error(`search error: ${error}`);
      throw error;
    }
  }

  public async getCollectionInfo(): Promise<any> {
    this.logger.debug(`getCollectionInfo start: collection=${this.collection}`);
    if (this.isTest) {
      const res = {
        result: {
          points_count: this.inMemoryPoints.length,
          status: 'green',
          config: { vectors: { size: 768, distance: 'Cosine' } }
        }
      };
      this.logger.debug('getCollectionInfo done (test mode)');
      return res;
    }
    try {
      const { data } = await this.http.get(`/collections/${this.collection}`);
      this.logger.debug(`getCollectionInfo done`);
      return data;
    } catch (error) {
      this.logger.error(`getCollectionInfo error: ${error}`);
      throw error;
    }
  }

  public async deleteCollection(): Promise<void> {
    this.logger.debug(`deleteCollection start: collection=${this.collection}`);
    if (this.isTest) {
      this.inMemoryPoints = [];
      this.logger.debug('deleteCollection done (test mode)');
      return;
    }
    try {
      await this.http.delete(`/collections/${this.collection}`);
      this.logger.debug(`deleteCollection done`);
    } catch (error) {
      this.logger.error(`deleteCollection error: ${error}`);
      throw error;
    }
  }
}
