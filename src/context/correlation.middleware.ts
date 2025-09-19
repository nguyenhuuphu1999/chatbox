import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ClsService } from './cls.service';

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  public use(req: any, res: any, next: () => void): void {
    const incoming = req.headers['x-correlation-id'] as string | undefined;
    const id = incoming && incoming.length < 128 ? incoming : randomUUID();
    
    res.setHeader('x-correlation-id', id);
    this.cls.runWith(id, next);
  }
}
