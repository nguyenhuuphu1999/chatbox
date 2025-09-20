import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseDTO } from "../base.dto";
import { ProductDoc } from "../../types/product.types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProductItemDto implements ProductDoc {
  @ApiProperty({ description: 'External product ID', example: 'd001' })
  @IsString() @IsNotEmpty() id!: string;

  @ApiProperty({ description: 'Product title' })
  @IsString() @IsNotEmpty() title!: string;

  @ApiProperty({ description: 'Product price (VND)', example: 590000 })
  @IsNumber() price!: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'VND' })
  @IsString() @IsOptional() currency?: string;

  @ApiPropertyOptional({ description: 'Available sizes', example: ['S','M','L'] })
  @IsArray() @IsOptional() sizes?: string[];

  @ApiPropertyOptional({ description: 'Available colors', example: ['đen','be'] })
  @IsArray() @IsOptional() colors?: string[];

  @ApiPropertyOptional({ description: 'Stock quantity', example: 10 })
  @IsNumber() @IsOptional() stock?: number;

  @ApiPropertyOptional({ description: 'Product URL', example: 'https://shop.example.com/x' })
  @IsString() @IsOptional() url?: string;

  @ApiProperty({ description: 'Product description' })
  @IsString() @IsNotEmpty() description!: string;

  @ApiPropertyOptional({ description: 'Tags', example: ['công sở','đầm'] })
  @IsArray() @IsOptional() tags?: string[];
}

export class IngestBodyDto {
  @ApiProperty({ type: [ProductItemDto] })
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
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ description: 'Number of ingested products', example: 10 })
  count!: number;
}
