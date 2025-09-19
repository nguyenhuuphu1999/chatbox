import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { AuditInterceptor, AuditConfig } from '../../interceptors/audit.interceptor';

export function Audit(config: AuditConfig): MethodDecorator {
  return applyDecorators(
    UseInterceptors(AuditInterceptor(config))
  );
}

// Convenience decorators for common audit actions
export function AuditCreate(resource: string): MethodDecorator {
  return Audit({
    action: 'CREATE',
    resource,
    includeRequestBody: true,
    includeResponseBody: true,
  });
}

export function AuditRead(resource: string): MethodDecorator {
  return Audit({
    action: 'READ',
    resource,
    includeRequestBody: false,
    includeResponseBody: false,
  });
}

export function AuditUpdate(resource: string): MethodDecorator {
  return Audit({
    action: 'UPDATE',
    resource,
    includeRequestBody: true,
    includeResponseBody: true,
  });
}

export function AuditDelete(resource: string): MethodDecorator {
  return Audit({
    action: 'DELETE',
    resource,
    includeRequestBody: true,
    includeResponseBody: true,
  });
}

export function AuditSearch(resource: string): MethodDecorator {
  return Audit({
    action: 'SEARCH',
    resource,
    includeRequestBody: true,
    includeResponseBody: false,
  });
}

export function AuditIngest(resource: string): MethodDecorator {
  return Audit({
    action: 'INGEST',
    resource,
    includeRequestBody: true,
    includeResponseBody: true,
  });
}
