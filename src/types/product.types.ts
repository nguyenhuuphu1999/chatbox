export interface ProductDoc {
  id: string;
  title: string;
  price: number;
  currency?: string; // mặc định VND
  sizes?: string[];
  colors?: string[];
  stock?: number;
  url?: string;
  description: string;
  tags?: string[];
}

export interface SearchFilters {
  price_min?: number;
  price_max?: number;
  size?: string;
  color?: string;
  category?: string;
  style_tags?: string[];
  materials?: string[];
}

// Legacy alias for backward compatibility
export type ProductFilters = SearchFilters;

export interface ChatResponse {
  reply: string;
  products: ProductDoc[];
}

export interface IngestResponse {
  ok: boolean;
  count: number;
}
