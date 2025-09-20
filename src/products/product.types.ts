export interface ProductInput {
  productId: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  brand?: string;
  categories?: string[];
  tags?: string[];
  stock?: number;
  metadata?: Record<string, any>;
  userId?: string; // nếu bạn muốn scope theo từng merchant/user
}

export interface ProductHit {
  id: string | number;
  score: number;
  payload: ProductPayload;
}

export interface ProductPayload {
  product_id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  brand?: string;
  categories?: string[];
  tags?: string[];
  stock?: number;
  metadata?: Record<string, any>;
  user_id?: string;      // scope (optional)
  indexed_at: string;    // ISO
}

export interface ProductSearchParams {
  query: string;
  limit?: number;   // default 12
  offset?: number;  // default 0
  priceMin?: number;
  priceMax?: number;
  tags?: string[];        // match any
  brand?: string;
  categories?: string[];  // match any
  userId?: string;        // filter scope
  scoreThreshold?: number; // optional
}

export interface ProductSearchResult {
  items: ProductHit[];
  limit: number;
  offset: number;
  hasMore: boolean;
  totalEst: number;
}
