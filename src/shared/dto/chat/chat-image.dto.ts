import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseDTO } from '../base.dto';
import { ChatFiltersDto } from './chat.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatImageBodyDto {
  @ApiProperty({ description: 'User message', example: 'Tìm sản phẩm tương tự theo ảnh này' })
  @IsString() message!: string;

  @ApiProperty({ description: 'Base64-encoded image' })
  @IsString() imageBase64!: string;

  @ApiProperty({ description: 'MIME type of the image', example: 'image/jpeg' })
  @IsString() mimeType!: string;

  @ApiPropertyOptional({ type: ChatFiltersDto })
  @IsOptional() @ValidateNested() @Type(() => ChatFiltersDto) filters?: ChatFiltersDto;
}

export class ChatImageDto extends BaseDTO {
  public readonly url = '/chat/image';
  
  public static readonly url = '/chat/image';
}

export class ChatImageResponseDto {
  @ApiProperty({ description: 'Assistant reply' })
  reply!: string;

  @ApiProperty({ description: 'Matched products', type: [Object] })
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
