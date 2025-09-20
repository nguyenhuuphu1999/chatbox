import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ProductSearchDto {
  @ApiProperty({ 
    description: 'Từ khóa tìm kiếm', 
    example: 'vay den' 
  })
  @IsString()
  q!: string;

  @ApiPropertyOptional({ 
    description: 'Số kết quả', 
    example: 12,
    default: 12
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ 
    description: 'Vị trí bắt đầu', 
    example: 0,
    default: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number;

  @ApiPropertyOptional({ 
    description: 'Giá tối thiểu', 
    example: 200000
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @ApiPropertyOptional({ 
    description: 'Giá tối đa', 
    example: 500000
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  @ApiPropertyOptional({ 
    description: 'Thương hiệu', 
    example: 'YourBrand'
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ 
    description: 'Tags (comma-separated)', 
    example: 'den,cong so'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined)
  tags?: string[];

  @ApiPropertyOptional({ 
    description: 'Danh mục (comma-separated)', 
    example: 'dress,shirt'
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined)
  categories?: string[];

  @ApiPropertyOptional({ 
    description: 'ID người dùng (scope)', 
    example: 'merchant-1'
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Ngưỡng similarity score', 
    example: 0.5
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  scoreThreshold?: number;
}
