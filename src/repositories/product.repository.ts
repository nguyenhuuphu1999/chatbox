import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseMongooseRepository } from './base-mongoose.repository';
import { Product, ProductDocument } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends BaseMongooseRepository<ProductDocument> {
  constructor(@InjectModel(Product.name) model: Model<ProductDocument>) {
    super(model);
  }

  public async findByExternalId(id: string): Promise<ProductDocument | null> {
    return this.model.findOne({ id, isDeleted: { $ne: true } }).exec();
  }

  public async findByIds(ids: string[]): Promise<ProductDocument[]> {
    return this.model.find({ id: { $in: ids }, isDeleted: { $ne: true } }).exec();
  }

  public async searchByText(searchText: string, limit: number = 10): Promise<ProductDocument[]> {
    return this.model.find({
      $text: { $search: searchText },
      isDeleted: { $ne: true }
    }).limit(limit).exec();
  }

  public async findActiveProducts(): Promise<ProductDocument[]> {
    return this.model.find({ isDeleted: { $ne: true } }).exec();
  }

  public async countActiveProducts(): Promise<number> {
    return this.model.countDocuments({ isDeleted: { $ne: true } }).exec();
  }
}