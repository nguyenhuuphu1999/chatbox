import { Body, Controller, Post } from "@nestjs/common";
import { RagService } from "../rag/rag.service";
import { GeminiService } from "../ai/gemini.service";
import { LoggerService } from "../logger/logger.service";
import { SYSTEM_CODE } from '../constants/system-code.constants';
import { ROLES, Roles } from '../decorator/auth/roles.decorator';
import { Response } from '../decorator/response/response.decorator';
import { User } from '../decorator/auth/auth.decorator';
import { AuditSearch } from '../decorator/audit/audit.decorator';
import { nowMs, durationMs } from "../utils/time.util";
import { 
  ChatDto, 
  ChatBodyDto, 
  ChatResponseDto 
} from '../shared/dto/chat/chat.dto';
import { 
  ChatImageDto, 
  ChatImageBodyDto, 
  ChatImageResponseDto 
} from '../shared/dto/chat/chat-image.dto';

@Controller()
export class ChatController {
  constructor(
    private readonly rag: RagService,
    private readonly gemini: GeminiService,
    private readonly logger: LoggerService,
  ) {}

  @Response(SYSTEM_CODE.CHAT_SUCCESS)
  @AuditSearch('chat')
  @Post(ChatDto.url)
  @Roles(ROLES.ADMIN, ROLES.USER, ROLES.GUEST)
  public async chat(
    @Body() body: ChatBodyDto,
    @User("id") userId: string
  ): Promise<ChatResponseDto> {
    const t0 = nowMs();
    this.logger.info("ChatController.chat.start", { userId, q: body.message, filters: body.filters });

    try {
      const hits = await this.rag.search(body.message, body.filters, 5);
      const hitIds = hits.map((h) => h.id);

      const mid = durationMs(t0);
      this.logger.debug("ChatController.chat.searchDone", { hitCount: hits.length, tMs: mid });

      const reply = await this.gemini.answer(body.message, hits);
      const total = durationMs(t0);

      this.logger.info("ChatController.chat.done", { tMs: total, used: hitIds });

      return { reply, products: hits };
    } catch (e: unknown) {
      const total = durationMs(t0);
      this.logger.error("ChatController.chat.error", { err: (e as Error).message, tMs: total });
      throw e;
    }
  }

  @Response(SYSTEM_CODE.CHAT_IMAGE_SUCCESS)
  @AuditSearch('chat-image')
  @Post(ChatImageDto.url)
  @Roles(ROLES.ADMIN, ROLES.USER, ROLES.GUEST)
  public async chatWithImage(
    @Body() body: ChatImageBodyDto,
    @User("id") userId: string
  ): Promise<ChatImageResponseDto> {
    const t0 = nowMs();
    this.logger.info("ChatController.chatWithImage.start", { userId, q: body.message, hasImage: !!body.imageBase64 });

    try {
      if (!body.imageBase64 || !body.mimeType) {
        return {
          reply: "Vui lòng cung cấp ảnh để tôi có thể phân tích và tìm sản phẩm tương tự.",
          products: []
        };
      }

      // Mô tả ảnh bằng Gemini Vision
      const imageDescription = await this.gemini.describeImage(
        body.imageBase64, 
        body.mimeType, 
        body.message
      );

      // Tạo câu hỏi tìm kiếm từ mô tả ảnh
      const searchQuery = await this.gemini.generateSimilarProductQuery(imageDescription);

      // Tìm kiếm sản phẩm tương tự
      const hits = await this.rag.search(searchQuery, undefined, 5);
      const hitIds = hits.map((h) => h.id);

      // Tạo câu trả lời
      const reply = await this.gemini.answer(
        `Dựa trên ảnh bạn gửi, tôi đã phân tích và tìm được các sản phẩm tương tự. ${body.message}`,
        hits
      );

      const total = durationMs(t0);
      this.logger.info("ChatController.chatWithImage.done", { tMs: total, hitCount: hits.length });

      return { 
        reply: `${reply}\n\n*Mô tả ảnh: ${imageDescription}*`, 
        products: hits 
      };
    } catch (e: unknown) {
      const total = durationMs(t0);
      this.logger.error("ChatController.chatWithImage.error", { err: (e as Error).message, tMs: total });
      throw e;
    }
  }
}