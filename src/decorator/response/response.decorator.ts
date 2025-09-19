import { applyDecorators, UseFilters, UseInterceptors } from '@nestjs/common';
import { ResponseDefaultInterceptor } from '../../interceptors/response.default.interceptor';
import { ResponsePagingInterceptor } from '../../interceptors/response.paging.interceptor';
import { ErrorHttpFilter } from '../../filters/error.http.filter';
import { SystemCode } from '../../constants/system-code.constants';

export function Response(
  messagePath: SystemCode,
  statusCode?: number
): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponseDefaultInterceptor(messagePath, statusCode)),
    UseFilters(ErrorHttpFilter)
  );
}

export function ResponsePaging(
  messagePath: SystemCode,
  statusCode?: number
): MethodDecorator {
  return applyDecorators(
    UseInterceptors(ResponsePagingInterceptor(messagePath, statusCode)),
    UseFilters(ErrorHttpFilter)
  );
}
