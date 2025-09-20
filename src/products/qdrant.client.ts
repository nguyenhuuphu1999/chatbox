import axios, { AxiosInstance } from 'axios';

export class QdrantClient {
  private http: AxiosInstance;
  constructor(baseURL = process.env.QDRANT_URL || 'http://127.0.0.1:6333') {
    this.http = axios.create({ baseURL, timeout: 10000 });
  }

  async ready() {
    const { data } = await this.http.get('/readyz');
    return data === 'ok';
  }

  async ensureCollection(name: string, size = 768) {
    try {
      await this.http.put(`/collections/${name}`, {
        vectors: { size, distance: 'Cosine' },
        optimizers_config: { default_segment_number: 1 },
      });
    } catch (error: any) {
      // Collection might already exist, ignore 409 errors
      if (error.response?.status !== 409) {
        throw error;
      }
    }
  }

  async upsert(collection: string, points: Array<{ id?: string | number; vector: number[]; payload: any }>) {
    return this.http.put(`/collections/${collection}/points?wait=true`, { points });
  }

  async search(collection: string, vector: number[], filter: any, limit = 12, offset = 0, scoreThreshold?: number) {
    const body: any = {
      vector,
      with_payload: true,
      limit,
      offset,
      filter,
    };
    if (typeof scoreThreshold === 'number') body.score_threshold = scoreThreshold;
    const { data } = await this.http.post(`/collections/${collection}/points/search`, body);
    return data?.result ?? [];
  }
}
