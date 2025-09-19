import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  correlationId: string;
}

@Injectable()
export class ClsService {
  private readonly als = new AsyncLocalStorage<RequestContext>();

  public runWith(correlationId: string, cb: () => void): void {
    this.als.run({ correlationId }, cb);
  }

  public getId(): string | undefined {
    return this.als.getStore()?.correlationId;
  }

  public getContext(): RequestContext | undefined {
    return this.als.getStore();
  }
}
