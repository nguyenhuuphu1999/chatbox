import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FiltersDto } from './chat.dto';

export class ChatImageDto {
  @IsString() message!: string;
  @IsString() imageBase64!: string;
  @IsString() mimeType!: string;
  @IsOptional() @ValidateNested() @Type(() => FiltersDto) filters?: FiltersDto;
}
