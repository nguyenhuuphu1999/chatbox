import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private file = process.env.AUDIT_LOG_FILE || path.join(process.cwd(), 'logs/audit.log');

  private write(entry: any): void {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      fs.appendFileSync(this.file, JSON.stringify(entry) + '\n', { encoding: 'utf8' });
    } catch (e) {
      this.logger.error('Write audit failed', e as any);
    }
  }

  logIngest(payload: { count: number; ids: string[]; actor?: string }): void {
    this.write({
      ts: new Date().toISOString(), 
      type: 'INGEST', 
      ...payload,
    });
  }

  logSearch(payload: { 
    query: string; 
    filters?: any; 
    hitIds: string[]; 
    durationMs: number; 
    actor?: string 
  }): void {
    this.write({ 
      ts: new Date().toISOString(), 
      type: 'SEARCH', 
      ...payload 
    });
  }

  logChat(payload: { 
    query: string; 
    model: string; 
    usedIds: string[]; 
    durationMs: number; 
    actor?: string 
  }): void {
    this.write({ 
      ts: new Date().toISOString(), 
      type: 'CHAT', 
      ...payload 
    });
  }

  logImageAnalysis(payload: {
    query: string;
    mimeType: string;
    description: string;
    hitIds: string[];
    durationMs: number;
    actor?: string;
  }): void {
    this.write({
      ts: new Date().toISOString(),
      type: 'IMAGE_ANALYSIS',
      ...payload
    });
  }
}
