import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatProductDto {
  @ApiProperty({ description: 'ID sản phẩm' })
  id!: string;

  @ApiProperty({ description: 'Tên sản phẩm' })
  title!: string;

  @ApiProperty({ description: 'Giá sản phẩm' })
  price!: number;

  @ApiPropertyOptional({ description: 'Đơn vị tiền tệ' })
  currency?: string;

  @ApiPropertyOptional({ description: 'Kích thước có sẵn' })
  sizes?: string[];

  @ApiPropertyOptional({ description: 'Màu sắc có sẵn' })
  colors?: string[];

  @ApiPropertyOptional({ description: 'Số lượng tồn kho' })
  stock?: number;

  @ApiPropertyOptional({ description: 'URL sản phẩm' })
  url?: string;

  @ApiProperty({ description: 'Mô tả sản phẩm' })
  description!: string;

  @ApiPropertyOptional({ description: 'Tags sản phẩm' })
  tags?: string[];
}

export class ChatResponseDto {
  @ApiProperty({ 
    description: 'Phản hồi từ AI assistant',
    example: 'Dạ chị có thể cho em xin hình mẫu của chị có để em tìm kiếm chính xác cho chị được không ạ'
  })
  reply!: string;

  @ApiProperty({ 
    description: 'Danh sách sản phẩm tìm được',
    type: [ChatProductDto]
  })
  products!: ChatProductDto[];
}
