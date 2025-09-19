import { applyDecorators, UseFilters, UseInterceptors } from '@nestjs/common';
import { ResponseDefaultInterceptor } from './response.default.interceptor';
import { ResponsePagingInterceptor } from './response.paging.interceptor';
import { ErrorHttpFilter } from '../filters/error.http.filter';

export function Response(
  messagePath: string,
  statusCode?: number
): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponseDefaultInterceptor(messagePath, statusCode)),
    UseFilters(ErrorHttpFilter)
  );
}

export function ResponsePaging(
  messagePath: string,
  statusCode?: number
): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponsePagingInterceptor(messagePath, statusCode)),
    UseFilters(ErrorHttpFilter)
  );
}
