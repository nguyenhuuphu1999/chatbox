import { Model, FilterQuery, Types } from 'mongoose';

export interface FindOptions {
  skip?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export abstract class BaseMongooseRepository<TDoc> {
  constructor(protected readonly model: Model<TDoc>) {}

  public async findOne(filter: FilterQuery<TDoc>): Promise<TDoc | null> {
    return this.model.findOne(filter).exec();
  }

  public async find(filter: FilterQuery<TDoc>, options?: FindOptions): Promise<TDoc[]> {
    let query = this.model.find(filter);
    
    if (options?.skip) {
      query = query.skip(options.skip);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.sort) {
      query = query.sort(options.sort);
    }
    
    return query.exec();
  }

  public async count(filter: FilterQuery<TDoc>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  public async create(data: Partial<TDoc>): Promise<TDoc> {
    const document = new this.model(data);
    return document.save() as Promise<TDoc>;
  }

  public async updateOne(filter: FilterQuery<TDoc>, update: Record<string, unknown>): Promise<void> {
    await this.model.updateOne(filter, update).exec();
  }

  public async softDelete({ id, deletedById }: { id: Types.ObjectId; deletedById: string }): Promise<void> {
    await this.model.updateOne(
      { _id: id },
      { 
        $set: { 
          deletedAt: new Date(),
          deletedById,
          isDeleted: true
        }
      }
    ).exec();
  }

  public async deleteOne(filter: FilterQuery<TDoc>): Promise<void> {
    await this.model.deleteOne(filter).exec();
  }

  public async findById(id: Types.ObjectId): Promise<TDoc | null> {
    return this.model.findById(id).exec();
  }

  public async exists(filter: FilterQuery<TDoc>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).exec();
    return count > 0;
  }
}
