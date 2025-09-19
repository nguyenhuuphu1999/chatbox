export abstract class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
