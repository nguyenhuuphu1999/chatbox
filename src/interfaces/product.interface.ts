import { Types } from 'mongoose';

export interface IProduct {
  _id: Types.ObjectId;
  id: string;
  title: string;
  price: number;
  currency?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  url?: string;
  description: string;
  tags?: string[];
  embedding?: number[];
  searchable?: string;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  updatedById?: string;
  deletedAt?: Date;
  deletedById?: string;
  isDeleted?: boolean;
}

export interface IProductCreate {
  id: string;
  title: string;
  price: number;
  currency?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  url?: string;
  description: string;
  tags?: string[];
  embedding?: number[];
  searchable?: string;
  createdById: string;
}

export interface IProductUpdate {
  title?: string;
  price?: number;
  currency?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  url?: string;
  description?: string;
  tags?: string[];
  embedding?: number[];
  searchable?: string;
  updatedById: string;
}