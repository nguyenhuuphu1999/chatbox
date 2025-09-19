import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseDTO } from "../base.dto";
import { ProductDoc } from "../../types/product.types";

export class ProductItemDto implements ProductDoc {
  @IsString() @IsNotEmpty() id!: string;
  @IsString() @IsNotEmpty() title!: string;
  @IsNumber() price!: number;
  @IsString() @IsOptional() currency?: string;
  @IsArray() @IsOptional() sizes?: string[];
  @IsArray() @IsOptional() colors?: string[];
  @IsNumber() @IsOptional() stock?: number;
  @IsString() @IsOptional() url?: string;
  @IsString() @IsNotEmpty() description!: string;
  @IsArray() @IsOptional() tags?: string[];
}

export class IngestBodyDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  items!: ProductItemDto[];
}

export class IngestDto extends BaseDTO {
  public readonly url = '/products/ingest';
  
  public static readonly url = '/products/ingest';
}

export class IngestResponseDto {
  ok!: boolean;
  count!: number;
}
