import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { BaseEntity } from '../common/base.entity';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product extends BaseEntity {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ default: 'VND' })
  currency?: string;

  @Prop({ type: [String], default: [] })
  sizes?: string[];

  @Prop({ type: [String], default: [] })
  colors?: string[];

  @Prop({ default: 0 })
  stock?: number;

  @Prop()
  url?: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ type: [Number], default: [] })
  embedding?: number[];

  @Prop({ default: '' })
  searchable?: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);