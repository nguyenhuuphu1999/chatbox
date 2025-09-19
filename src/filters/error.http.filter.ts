import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SYSTEM_CODE } from '../constants/system-code.constants';

@Catch()
export class ErrorHttpFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorHttpFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.headers['x-correlation-id'] as string;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let systemCode = SYSTEM_CODE.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        systemCode = responseObj.systemCode || systemCode;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      systemCode = SYSTEM_CODE.INTERNAL_SERVER_ERROR;
    }

    // Log the error
    this.logger.error(
      `HTTP Error: ${status} - ${message}`,
      {
        correlationId,
        url: request.url,
        method: request.method,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
        error: exception instanceof Error ? exception.stack : exception,
      }
    );

    // Send error response
    response.status(status).json({
      statusCode: status,
      message,
      systemCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
    });
  }
}
