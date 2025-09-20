import {
  Entity, PrimaryGeneratedColumn, Column,
  UpdateDateColumn, Index
} from 'typeorm';

@Entity('memory_summaries')
export class MemorySummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  /** Tóm tắt dài hạn đã cô đọng cho riêng khách */
  @Column({ type: 'text' })
  summary: string;

  /** Đếm bao nhiêu turn đã gộp */
  @Column({ type: 'int', default: 0 })
  turnsCovered: number;

  /** (optional) token của summary để kiểm soát kích cỡ prompt */
  @Column({ type: 'int', default: 0 })
  tokenCount: number;

  @UpdateDateColumn()
  updatedAt: Date;
}