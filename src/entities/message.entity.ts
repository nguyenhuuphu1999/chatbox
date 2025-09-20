import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index
} from 'typeorm';

export type MessageRole = 'user' | 'assistant' | 'system';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  conversationId: string;

  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  @Column({ type: 'varchar', length: 16 })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  /** Lưu debug/intent/productId… nếu cần */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /** (optional) để kiểm soát tóm tắt theo token */
  @Column({ type: 'int', default: 0 })
  tokenCount: number;

  @CreateDateColumn()
  createdAt: Date;
}