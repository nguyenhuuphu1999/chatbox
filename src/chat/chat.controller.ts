import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ROLES, Roles } from '../decorator/auth/roles.decorator';
import { User } from '../decorator/auth/auth.decorator';
import { AuditSearch } from '../decorator/audit/audit.decorator';
import { ChatService } from './services/chat.service';
import { ChatRequest, ChatResponse } from '../shared/dto/chat/chat.dto';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

@ApiTags('Chat')
@Controller()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
  ) {}

  @AuditSearch('chat')
  @Post('/chat')
  @HttpCode(200)
  @Roles(ROLES.ADMIN, ROLES.USER, ROLES.GUEST)
  @ApiOperation({ 
    summary: 'Chat với AI assistant',
    description: 'Chat với AI assistant, hỗ trợ tìm kiếm sản phẩm và phân tích hình ảnh'
  })
  @ApiBody({
    type: ChatRequestDto,
    description: 'Tin nhắn chat từ user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Phản hồi từ AI assistant',
    type: ChatResponseDto
  })
  public async chat(
    @Body() body: ChatRequestDto,
    @User("id") userId: string
  ): Promise<ChatResponseDto> {
    return this.chatService.handleChat(body, userId);
  }
}