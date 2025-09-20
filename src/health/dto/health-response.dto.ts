import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ 
    description: 'Trạng thái service',
    example: 'ok' 
  })
  status!: string;

  @ApiProperty({ 
    description: 'Thời gian kiểm tra',
    example: '2025-09-20T17:28:06.470Z' 
  })
  timestamp!: string;

  @ApiProperty({ 
    description: 'Tên service',
    example: 'RAG Product Consultation' 
  })
  service!: string;
}
