import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductSeedDto {
  @ApiProperty({ 
    description: 'ID sản phẩm', 
    example: 'SKU-001' 
  })
  @IsString()
  productId!: string;

  @ApiProperty({ 
    description: 'Tên sản phẩm', 
    example: 'Váy xòe đen dáng A' 
  })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ 
    description: 'Mô tả sản phẩm', 
    example: 'Chất liệu tuyết mưa, phù hợp công sở' 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Giá sản phẩm', 
    example: 350000 
  })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({ 
    description: 'Đơn vị tiền tệ', 
    example: 'VND' 
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ 
    description: 'Thương hiệu', 
    example: 'YourBrand' 
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ 
    description: 'Danh mục sản phẩm', 
    example: ['dress'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ 
    description: 'Tags sản phẩm', 
    example: ['den', 'cong so'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Số lượng tồn kho', 
    example: 12 
  })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiPropertyOptional({ 
    description: 'Metadata bổ sung', 
    example: { color: 'black', sizes: ['S','M','L'] } 
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'ID người dùng (scope)', 
    example: 'merchant-1' 
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
