import { BadRequestException } from '@nestjs/common';
import { SYSTEM_CODE } from '../constants/system-code.constants';

// Centralizes mapping of low-level DB errors to HTTP exceptions with business codes.
export class DbErrorMapper {
  static mapToHttpException(error: unknown) {
    const err = error as { message?: string; name?: string; code?: number; codeName?: string; keyValue?: Record<string, unknown> };
    const message = (err?.message || '').toLowerCase();

    // Duplicate key (Mongo-style)
    if (message.includes('e11000 duplicate key') || message.includes('duplicate key error')) {
      return new BadRequestException(SYSTEM_CODE.PRODUCT_ID_DUPLICATE);
    }

    // Validation errors (Mongo/Mongoose-style)
    if (err?.name === 'ValidationError' || message.includes('validation failed')) {
      return new BadRequestException(SYSTEM_CODE.VALIDATION_ERROR);
    }

    // Unauthorized DB access (we treat elsewhere typically, but safe to map if needed)
    if (err?.codeName === 'Unauthorized' || message.includes('requires authentication')) {
      // leave to service policy, return undefined to let caller decide
      return undefined;
    }

    return undefined;
  }
}
