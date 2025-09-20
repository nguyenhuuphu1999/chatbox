import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index, Unique
} from 'typeorm';

@Entity('customers')
@Unique(['externalId'])
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ID đến từ kênh/CRM ngoài (fb/zalo/web/telegram/pos/...) */
  @Index()
  @Column({ type: 'varchar', length: 191 })
  externalId: string;

  @Column({ type: 'varchar', length: 191, nullable: true })
  name?: string;

  /** Hồ sơ mở rộng: ngôn ngữ, sở thích, tags... */
  @Column({ type: 'jsonb', default: {} })
  profile: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}