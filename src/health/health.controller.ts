import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ 
    summary: 'Health check',
    description: 'Kiểm tra trạng thái hoạt động của service'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service đang hoạt động bình thường',
    type: HealthResponseDto
  })
  public getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'RAG Product Consultation'
    };
  }
}
