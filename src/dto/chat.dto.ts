import { IsOptional, IsString, IsNumber, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { SearchFilters } from "../types/product.types";

export class FiltersDto implements SearchFilters {
  @IsNumber() @IsOptional() price_min?: number;
  @IsNumber() @IsOptional() price_max?: number;
  @IsString() @IsOptional() size?: string;
  @IsString() @IsOptional() color?: string;
  @IsString() @IsOptional() category?: string;
  @IsArray() @IsOptional() style_tags?: string[];
  @IsArray() @IsOptional() materials?: string[];
}

export class ChatDto {
  @IsString() message!: string;
  @IsOptional() @ValidateNested() @Type(() => FiltersDto) filters?: FiltersDto;
}
