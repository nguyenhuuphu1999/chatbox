export interface ProductDoc {
  id: string;
  title: string;
  price: number;
  currency?: string;
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

export interface IngestResponse {
  ok: boolean;
  count: number;
}

export interface ChatResponse {
  reply: string;
  products: ProductDoc[];
}

// Legacy alias for backward compatibility
export type ProductFilters = SearchFilters;

// Base response interface
export interface BaseResponse<T = unknown> {
  code: string;
  message: string;
  data?: T;
  timestamp: string;
}

// Paging interface
export interface PagingInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResponse<T> extends BaseResponse<T[]> {
  paging: PagingInfo;
}
