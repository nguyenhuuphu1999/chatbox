import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDTO } from '../base.dto';
import { FiltersDto } from './chat.dto';

export class ChatImageBodyDto {
  @IsString() message!: string;
  @IsString() imageBase64!: string;
  @IsString() mimeType!: string;
  @IsOptional() @ValidateNested() @Type(() => FiltersDto) filters?: FiltersDto;
}

export class ChatImageDto extends BaseDTO {
  public readonly url = '/chat/image';
  
  public static readonly url = '/chat/image';
}

export class ChatImageResponseDto {
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
