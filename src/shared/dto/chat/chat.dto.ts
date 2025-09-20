import { IsString, IsOptional, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatFiltersDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @IsNumber()
  priceMax?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  brand?: string;
}

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ChatFiltersDto)
  filters?: ChatFiltersDto;
}

export class ChatResponseDto {
  @IsString()
  reply: string;

  @IsObject({ each: true })
  products: any[];
}

// Legacy interfaces for backward compatibility
export interface ChatRequest {
  message: string;
  imageBase64?: string;
  mimeType?: string;
  filters?: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    color?: string;
    size?: string;
    brand?: string;
  };
}

export interface ChatResponse {
  reply: string;
  products: any[];
}