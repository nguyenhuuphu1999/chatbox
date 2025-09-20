import { IngestBodyDto } from '../shared/dto/products/ingest.dto';

export interface ProductCreateInput {
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
  searchable?: string;
  createdById: string;
  isDeleted?: boolean;
}

export class ProductMapper {
  static toCreateInputs(body: IngestBodyDto, userId: string): ProductCreateInput[] {
    return body.items.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      currency: item.currency || 'VND',
      sizes: item.sizes || [],
      colors: item.colors || [],
      stock: item.stock || 0,
      url: item.url,
      description: item.description,
      tags: item.tags || [],
      searchable: `${item.title}\n${item.description}`,
      createdById: userId,
      isDeleted: false,
    }));
  }

  static toGetProductsItem(product: any) {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      url: product.url,
      description: product.description,
      tags: product.tags,
      createdAt: product.createdAt!,
    };
  }

  static toGetProductResponse(product: any) {
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      currency: product.currency,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      url: product.url,
      description: product.description,
      tags: product.tags,
      createdAt: product.createdAt!,
      updatedAt: product.updatedAt!,
    };
  }
}
