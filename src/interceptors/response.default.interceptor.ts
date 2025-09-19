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

export function ResponseDefaultInterceptor(
  messagePath: string,
  customStatusCode?: number,
): Type<NestInterceptor> {
  @Injectable()
  class MixinResponseDefaultInterceptor
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
          const data: Record<string, any> = await response;

          // Get message from SYSTEM_CODE or use default
          const messageKey =
            messagePath in SYSTEM_CODE
              ? messagePath
              : SYSTEM_CODE.SUCCESS;
          
          // Simple message mapping (you can extend this with a translation service)
          const message: string = this.getMessage(messageKey, lang);

          return {
            statusCode,
            message,
            data,
            timestamp: new Date().toISOString(),
          };
        }),
      );
    }

    private getMessage(messageKey: string, lang: string): string {
      // Simple message mapping - you can replace this with a proper translation service
      const messages: Record<string, Record<string, string>> = {
        [SYSTEM_CODE.CREATE_PRODUCT_SUCCESS]: {
          en: 'Product created successfully',
          vi: 'Tạo sản phẩm thành công',
        },
        [SYSTEM_CODE.UPDATE_PRODUCT_SUCCESS]: {
          en: 'Product updated successfully',
          vi: 'Cập nhật sản phẩm thành công',
        },
        [SYSTEM_CODE.GET_PRODUCT_SUCCESS]: {
          en: 'Product retrieved successfully',
          vi: 'Lấy thông tin sản phẩm thành công',
        },
        [SYSTEM_CODE.GET_PRODUCTS_SUCCESS]: {
          en: 'Products retrieved successfully',
          vi: 'Lấy danh sách sản phẩm thành công',
        },
        [SYSTEM_CODE.DELETE_PRODUCT_SUCCESS]: {
          en: 'Product deleted successfully',
          vi: 'Xóa sản phẩm thành công',
        },
        [SYSTEM_CODE.INGEST_PRODUCTS_SUCCESS]: {
          en: 'Products ingested successfully',
          vi: 'Nhập dữ liệu sản phẩm thành công',
        },
        [SYSTEM_CODE.GET_COLLECTION_INFO_SUCCESS]: {
          en: 'Collection info retrieved successfully',
          vi: 'Lấy thông tin collection thành công',
        },
        [SYSTEM_CODE.DELETE_COLLECTION_SUCCESS]: {
          en: 'Collection deleted successfully',
          vi: 'Xóa collection thành công',
        },
        [SYSTEM_CODE.CHAT_SUCCESS]: {
          en: 'Chat response generated successfully',
          vi: 'Tạo phản hồi chat thành công',
        },
        [SYSTEM_CODE.CHAT_IMAGE_SUCCESS]: {
          en: 'Image analysis completed successfully',
          vi: 'Phân tích ảnh thành công',
        },
        [SYSTEM_CODE.SUCCESS]: {
          en: 'Operation completed successfully',
          vi: 'Thao tác hoàn thành thành công',
        },
      };

      const messageMap = messages[messageKey] || messages[SYSTEM_CODE.SUCCESS];
      return messageMap[lang] || messageMap['en'];
    }
  }

  return mixin(MixinResponseDefaultInterceptor);
}
