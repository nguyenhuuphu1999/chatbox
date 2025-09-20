import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  /** web | facebook | zalo | telegram | ... */
  @Column({ type: 'varchar', length: 64, default: 'web' })
  channel: string;

  /** open | closed (tùy use-case) */
  @Column({ type: 'varchar', length: 32, default: 'open' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}