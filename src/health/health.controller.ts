import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  public getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'RAG Product Consultation'
    };
  }
}
