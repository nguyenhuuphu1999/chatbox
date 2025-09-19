import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  mixin,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import * as fs from 'fs';
import * as path from 'path';
import { ClsService } from '../context/cls.service';

export interface AuditConfig {
  action: string;
  resource?: string;
  includeRequestBody?: boolean;
  includeResponseBody?: boolean;
}

export function AuditInterceptor(config: AuditConfig): Type<NestInterceptor> {
  @Injectable()
  class MixinAuditInterceptor implements NestInterceptor {
    private readonly auditFile = process.env.AUDIT_LOG_FILE || path.join(process.cwd(), 'logs/audit.log');

    constructor(private readonly cls: ClsService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const ctx: HttpArgumentsHost = context.switchToHttp();
      const request = ctx.getRequest();
      const response = ctx.getResponse();
      const correlationId = this.cls.getId() || 'unknown';

      const startTime = Date.now();
      const { method, url, body, headers, user } = request;

      // Prepare audit entry
      const auditEntry: any = {
        timestamp: new Date().toISOString(),
        correlationId,
        action: config.action,
        resource: config.resource || url,
        method,
        url,
        userAgent: headers['user-agent'],
        ip: request.ip || headers['x-forwarded-for'] || 'unknown',
        userId: user?.id || user?.userId || 'anonymous',
      };

      // Include request body if configured
      if (config.includeRequestBody && body) {
        auditEntry.requestBody = this.sanitizeBody(body);
      }

      return next.handle().pipe(
        tap({
          next: (responseData) => {
            const duration = Date.now() - startTime;
            const auditLog = {
              ...auditEntry,
              status: 'SUCCESS',
              statusCode: response.statusCode,
              duration,
              responseSize: JSON.stringify(responseData).length,
            };

            // Include response body if configured
            if (config.includeResponseBody && responseData) {
              auditLog.responseBody = this.sanitizeBody(responseData);
            }

            this.writeAuditLog(auditLog);
          },
          error: (error) => {
            const duration = Date.now() - startTime;
            const auditLog = {
              ...auditEntry,
              status: 'ERROR',
              statusCode: error.status || 500,
              duration,
              error: {
                message: error.message,
                stack: error.stack,
                name: error.name,
              },
            };

            this.writeAuditLog(auditLog);
          },
        }),
      );
    }

    private sanitizeBody(body: any): any {
      if (!body || typeof body !== 'object') {
        return body;
      }

      const sanitized = { ...body };
      
      // Remove sensitive fields
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '***REDACTED***';
        }
      });

      // Truncate large fields
      Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
          sanitized[key] = sanitized[key].substring(0, 1000) + '... [TRUNCATED]';
        }
      });

      return sanitized;
    }

    private writeAuditLog(auditLog: any): void {
      try {
        // Ensure directory exists
        const dir = path.dirname(this.auditFile);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // Write to audit log file (JSONL format)
        fs.appendFileSync(this.auditFile, JSON.stringify(auditLog) + '\n', { encoding: 'utf8' });
      } catch (error) {
        console.error('Failed to write audit log:', error);
      }
    }
  }

  return mixin(MixinAuditInterceptor);
}
