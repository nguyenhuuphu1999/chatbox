import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatFiltersDto {
  @ApiPropertyOptional({ 
    description: 'Danh mục sản phẩm', 
    example: 'dress' 
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Giá tối thiểu', 
    example: 100000 
  })
  @IsOptional()
  @IsString()
  priceMin?: string;

  @ApiPropertyOptional({ 
    description: 'Giá tối đa', 
    example: 500000 
  })
  @IsOptional()
  @IsString()
  priceMax?: string;

  @ApiPropertyOptional({ 
    description: 'Màu sắc', 
    example: 'black' 
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ 
    description: 'Kích thước', 
    example: 'M' 
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ 
    description: 'Thương hiệu', 
    example: 'Zara' 
  })
  @IsOptional()
  @IsString()
  brand?: string;
}

export class ChatRequestDto {
  @ApiProperty({ 
    description: 'Tin nhắn từ user', 
    example: 'Tôi cần tìm đầm đi làm' 
  })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ 
    description: 'Hình ảnh base64', 
    example: 'data:image/jpeg;base64,...' 
  })
  @IsOptional()
  @IsString()
  imageBase64?: string;

  @ApiPropertyOptional({ 
    description: 'MIME type của hình ảnh', 
    example: 'image/jpeg' 
  })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ 
    description: 'Bộ lọc sản phẩm',
    type: ChatFiltersDto
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ChatFiltersDto)
  filters?: ChatFiltersDto;
}
