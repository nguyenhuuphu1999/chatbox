import { IsOptional, IsString, IsNumber, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseDTO } from "../base.dto";
import { SearchFilters } from "../../types/product.types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FiltersDto implements SearchFilters {
  @ApiPropertyOptional({ description: "Minimum price (inclusive)", example: 300000 })
  @IsNumber() @IsOptional() price_min?: number;

  @ApiPropertyOptional({ description: "Maximum price (inclusive)", example: 800000 })
  @IsNumber() @IsOptional() price_max?: number;

  @ApiPropertyOptional({ description: "Desired size", example: "M" })
  @IsString() @IsOptional() size?: string;

  @ApiPropertyOptional({ description: "Desired color", example: "đen" })
  @IsString() @IsOptional() color?: string;

  @ApiPropertyOptional({ description: "Category or collection tag", example: "chân váy" })
  @IsString() @IsOptional() category?: string;

  @ApiPropertyOptional({ description: "Style tags", example: ["nữ tính", "công sở"] })
  @IsArray() @IsOptional() style_tags?: string[];

  @ApiPropertyOptional({ description: "Material tags", example: ["cotton", "linen"] })
  @IsArray() @IsOptional() materials?: string[];
}

export class ChatBodyDto {
  @ApiProperty({ description: "User message or query", example: "Đầm đen size M, 500-800k" })
  @IsString() message!: string;

  @ApiPropertyOptional({ type: FiltersDto })
  @IsOptional() @ValidateNested() @Type(() => FiltersDto) filters?: FiltersDto;
}

export class ChatDto extends BaseDTO {
  public readonly url = '/chat';

  public static readonly url = '/chat';
}

export class ChatResponseDto {
  @ApiProperty({ description: "Assistant reply" })
  reply!: string;

  @ApiProperty({
    description: "Matched products", type: [
      Object
    ]
  })
  products!: Array<{
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
  }>;
}
