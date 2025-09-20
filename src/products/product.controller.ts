import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { ProductSearchParams, ProductInput } from './product.types';
import { ProductSearchDto } from './dto/product-search.dto';
import { ProductSeedDto } from './dto/product-seed.dto';
import { ProductSearchResponseDto, ProductSeedResponseDto } from './dto/product-response.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly products: ProductService) {}

  @Get('search')
  @ApiOperation({ 
    summary: 'Tìm kiếm sản phẩm',
    description: 'Tìm kiếm sản phẩm bằng vector similarity với filters'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Kết quả tìm kiếm sản phẩm',
    type: ProductSearchResponseDto
  })
  async search(@Query() query: ProductSearchDto): Promise<ProductSearchResponseDto> {
    const params: ProductSearchParams = {
      query: query.q,
      limit: query.limit,
      offset: query.offset,
      priceMin: query.priceMin,
      priceMax: query.priceMax,
      brand: query.brand,
      tags: query.tags,
      categories: query.categories,
      userId: query.userId,
      scoreThreshold: query.scoreThreshold,
    };
    return this.products.searchProducts(params);
  }

  @Post('seed')
  @ApiOperation({ 
    summary: 'Insert sản phẩm vào Qdrant',
    description: 'Thêm/cập nhật sản phẩm vào vector database Qdrant'
  })
  @ApiBody({
    type: [ProductSeedDto],
    description: 'Danh sách sản phẩm cần insert'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Sản phẩm đã được insert thành công',
    type: ProductSeedResponseDto
  })
  async seedProducts(@Body() products: ProductSeedDto[]): Promise<ProductSeedResponseDto> {
    return this.products.upsertProducts(products);
  }
}
