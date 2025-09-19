import { BaseDTO } from "../base.dto";

export class GetCollectionInfoDto extends BaseDTO {
  public readonly url = '/products/collection-info';
  
  public static readonly url = '/products/collection-info';
}

export class CollectionInfoResponseDto {
  vectors_count!: number;
  status!: string;
  config!: Record<string, unknown>;
}
