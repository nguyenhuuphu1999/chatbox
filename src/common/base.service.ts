import { InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ClsService } from '../context/cls.service';
import { SYSTEM_CODE } from '../constants/system-code.constants';
import { DbErrorMapper } from './db-error.mapper';

export abstract class BaseService {
  protected constructor(
    protected readonly logger: LoggerService,
    protected readonly cls: ClsService,
  ) {}

  protected getCorrelationId(fallbackPrefix: string): string {
    return this.cls.getId() ?? `${fallbackPrefix}_${Date.now()}`;
  }

  protected logStart(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  protected logDone(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, meta);
  }

  protected handleErrorAndThrow(
    error: unknown,
    correlationId: string,
    defaultSystemCode: typeof SYSTEM_CODE[keyof typeof SYSTEM_CODE]
  ): never {
    // First map known DB/Mongo-like errors to 4xx
    const mapped = DbErrorMapper.mapToHttpException(error);
    if (mapped) {
      throw mapped;
    }

    // Otherwise log and throw generic 500 with system code
    const errObj = error as { name?: string; message?: string; codeName?: string; stack?: string };
    this.logger.error('Service error', {
      correlationId,
      error: {
        name: errObj?.name,
        message: errObj?.message,
        codeName: errObj?.codeName,
        stack: errObj?.stack,
      },
    });
    throw new InternalServerErrorException(defaultSystemCode);
  }
}
