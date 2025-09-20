import { ApiProperty } from '@nestjs/swagger';

export class ProductHitDto {
  @ApiProperty({ description: 'ID của sản phẩm' })
  id!: string | number;

  @ApiProperty({ description: 'Similarity score' })
  score!: number;

  @ApiProperty({ 
    description: 'Thông tin sản phẩm',
    type: 'object',
    properties: {
      product_id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      price: { type: 'number' },
      currency: { type: 'string' },
      brand: { type: 'string' },
      categories: { type: 'array', items: { type: 'string' } },
      tags: { type: 'array', items: { type: 'string' } },
      stock: { type: 'number' },
      metadata: { type: 'object', additionalProperties: true },
      user_id: { type: 'string' },
      indexed_at: { type: 'string' }
    }
  })
  payload!: {
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
    user_id?: string;
    indexed_at: string;
  };
}

export class ProductSearchResponseDto {
  @ApiProperty({ 
    description: 'Danh sách sản phẩm tìm được',
    type: [ProductHitDto]
  })
  items!: ProductHitDto[];

  @ApiProperty({ description: 'Số kết quả trả về' })
  limit!: number;

  @ApiProperty({ description: 'Vị trí bắt đầu' })
  offset!: number;

  @ApiProperty({ description: 'Có thêm kết quả không' })
  hasMore!: boolean;

  @ApiProperty({ description: 'Ước lượng tổng số kết quả' })
  totalEst!: number;
}

export class ProductSeedResponseDto {
  @ApiProperty({ 
    description: 'Số sản phẩm đã được insert',
    example: 5
  })
  upserted!: number;
}
