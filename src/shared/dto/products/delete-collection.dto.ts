import { BaseDTO } from "../base.dto";

export class DeleteCollectionDto extends BaseDTO {
  public readonly url = '/products/collection';
  
  public static readonly url = '/products/collection';
}

export class DeleteCollectionResponseDto {
  ok!: boolean;
}
