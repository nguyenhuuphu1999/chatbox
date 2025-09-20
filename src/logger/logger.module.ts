import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { LoggerService } from './logger.service';

const logDir = process.env.LOG_DIR || './logs';
const level = process.env.LOG_LEVEL || 'info';

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  // Print meta in console to aid debugging (disabled in tests by log level)
  winston.format.printf((info) => {
    const { level, message, timestamp, ...meta } = info as any;
    let metaStr = '';
    try {
      const safeMeta = { ...meta };
      // winston adds circular refs; remove obvious ones
      if (safeMeta['level']) delete (safeMeta as any)['level'];
      if (safeMeta['message']) delete (safeMeta as any)['message'];
      if (safeMeta['timestamp']) delete (safeMeta as any)['timestamp'];
      metaStr = Object.keys(safeMeta).length ? ` ${JSON.stringify(safeMeta)}` : '';
    } catch {
      metaStr = '';
    }
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({ 
          level:level, 
          format: consoleFormat 
        }),
        new (winston.transports as any).DailyRotateFile({
          dirname: logDir,
          filename: 'app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '10m',
          maxFiles: '14d',
          level,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
