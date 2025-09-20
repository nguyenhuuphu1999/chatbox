import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { SYSTEM_CODE } from '../constants/system-code.constants';

export function ResponsePagingInterceptor(
  messagePath: string,
  customStatusCode?: number,
): Type<NestInterceptor> {
  @Injectable()
  class MixinResponsePagingInterceptor
    implements NestInterceptor<Promise<any>>
  {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const ctx: HttpArgumentsHost = context.switchToHttp();
      const responseExpress: any = ctx.getResponse();
      const request = ctx.getRequest();
      const acceptLanguage = request.headers['accept-language'] || 'en';
      const lang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();

      return next.handle().pipe(
        map(async (response: Promise<Record<string, any>>) => {
          const statusCode: number =
            customStatusCode || responseExpress.statusCode;
          const responseData: Record<string, any> = await response;

          // Extract paging information from response
          const {
            paging,
            list,
            data
          } = responseData;

          // Get message from SYSTEM_CODE or use default
          const messageKey =
            messagePath in SYSTEM_CODE
              ? messagePath
              : SYSTEM_CODE.SUCCESS;
          
          const message: string = this.getMessage(messageKey, lang);

          // Handle different response structures
          if (paging && list) {
            // Standard paging response structure
            return {
              statusCode,
              message,
              totalData: paging.total,
              totalPage: paging.totalPages,
              currentPage: paging.page,
              perPage: paging.pageSize,
              data: list,
              timestamp: new Date().toISOString(),
            };
          } else if (data && typeof data === 'object' && 'paging' in data) {
            // Nested paging structure
            const { paging: nestedPaging, list: nestedList, ...restData } = data;
            return {
              statusCode,
              message,
              totalData: nestedPaging.total,
              totalPage: nestedPaging.totalPages,
              currentPage: nestedPaging.page,
              perPage: nestedPaging.pageSize,
              data: nestedList,
              ...restData,
              timestamp: new Date().toISOString(),
            };
          } else {
            // Fallback for non-paging responses
            return {
              statusCode,
              message,
              data: responseData,
              timestamp: new Date().toISOString(),
            };
          }
        }),
      );
    }

    private getMessage(messageKey: string, lang: string): string {
      // Simple message mapping - you can replace this with a proper translation service
      const messages: Record<string, Record<string, string>> = {
        [SYSTEM_CODE.GET_PRODUCTS_SUCCESS]: {
          en: 'Products retrieved successfully',
          vi: 'Lấy danh sách sản phẩm thành công',
        },
        [SYSTEM_CODE.GET_DEVICE_TYPES_SUCCESS]: {
          en: 'Device types retrieved successfully',
          vi: 'Lấy danh sách loại thiết bị thành công',
        },
        [SYSTEM_CODE.SUCCESS]: {
          en: 'Data retrieved successfully',
          vi: 'Lấy dữ liệu thành công',
        },
      };

      const messageMap = messages[messageKey] || messages[SYSTEM_CODE.SUCCESS];
      return messageMap[lang] || messageMap['en'];
    }
  }

  return mixin(MixinResponsePagingInterceptor);
}
