import { IsOptional, IsString, IsNumber, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BaseDTO } from "../base.dto";
import { SearchFilters } from "../../types/product.types";

export class FiltersDto implements SearchFilters {
  @IsNumber() @IsOptional() price_min?: number;
  @IsNumber() @IsOptional() price_max?: number;
  @IsString() @IsOptional() size?: string;
  @IsString() @IsOptional() color?: string;
  @IsString() @IsOptional() category?: string;
  @IsArray() @IsOptional() style_tags?: string[];
  @IsArray() @IsOptional() materials?: string[];
}

export class ChatBodyDto {
  @IsString() message!: string;
  @IsOptional() @ValidateNested() @Type(() => FiltersDto) filters?: FiltersDto;
}

export class ChatDto extends BaseDTO {
  public readonly url = '/chat';
  
  public static readonly url = '/chat';
}

export class ChatResponseDto {
  reply!: string;
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
