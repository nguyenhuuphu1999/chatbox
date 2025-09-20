import { Injectable } from '@nestjs/common';

export interface InMemoryProductRecord {
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
  searchable?: string;
  createdById?: string;
  isDeleted?: boolean;
}

@Injectable()
export class InMemoryProductRepository {
  private readonly storage: Map<string, InMemoryProductRecord> = new Map();

  public async findByIds(ids: string[]): Promise<InMemoryProductRecord[]> {
    const results: InMemoryProductRecord[] = [];
    for (const id of ids) {
      const found = this.storage.get(id);
      if (found && found.isDeleted !== true) {
        results.push(found);
      }
    }
    return results;
  }

  public async create(data: InMemoryProductRecord): Promise<InMemoryProductRecord> {
    this.storage.set(data.id, { ...data, isDeleted: false });
    return data;
  }
}



