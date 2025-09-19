import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request & any>();
    const { method, url } = req;
    const start = Date.now();
    
    return next.handle().pipe(
      tap({
        next: () => {
          const res = (context.switchToHttp().getResponse<any>()) || {};
          const status = res.statusCode || 200;
          const t = Date.now() - start;
          console.log(`[${new Date().toISOString()}] HTTP: ${method} ${url} ${status} ${t}ms`);
        },
        error: (err) => {
          const res = (context.switchToHttp().getResponse<any>()) || {};
          const status = res.statusCode || err?.status || 500;
          const t = Date.now() - start;
          console.error(`[${new Date().toISOString()}] HTTP ERROR: ${method} ${url} ${status} ${t}ms - ${err?.message || err}`);
        }
      })
    );
  }
}
