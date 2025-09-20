import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { LoggerService } from './logger.service';

const logDir = process.env.LOG_DIR || './logs';
const level = process.env.LOG_LEVEL || 'info';

const isTest = process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true';
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ level, message, timestamp }) => {
    // Avoid printing meta to prevent circular structures during Jest runs
    return `[${timestamp}] ${level}: ${message}`;
  })
);

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({ 
          level: isTest ? 'error' : level, 
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
