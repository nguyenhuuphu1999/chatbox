import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import * as fs from 'fs';
import * as path from 'path';
import { ClsService } from '../context/cls.service';

interface AuditEntry {
  ts: string;
  type: 'HTTP';
  method: string;
  url: string;
  status?: number;
  correlationId: string;
  reqBody?: unknown;
  resBody?: unknown;
  err?: string;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private file = process.env.AUDIT_LOG_FILE || path.join(process.cwd(), 'logs/audit.log');
  
  constructor(private readonly cls: ClsService) {}

  public intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = ctx.switchToHttp();
    const req = http.getRequest<Request & any>();
    const { method, url } = req;
    const correlationId = this.cls.getId() || 'n/a';
    
    const base: AuditEntry = {
      ts: new Date().toISOString(),
      type: 'HTTP',
      method,
      url,
      correlationId,
      reqBody: req.body
    };

    return next.handle().pipe(
      map((resBody) => {
        this.write({
          ...base,
          status: http.getResponse<any>()?.statusCode ?? 200,
          resBody
        });
        return resBody;
      }),
      catchError((err) => {
        this.write({
          ...base,
          status: http.getResponse<any>()?.statusCode ?? err?.status ?? 500,
          err: String(err?.message || err)
        });
        throw err;
      })
    );
  }

  private write(entry: AuditEntry): void {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      fs.appendFileSync(this.file, JSON.stringify(entry) + '\n', 'utf8');
    } catch (e) {
      // Silent fail for audit logging
    }
  }
}
