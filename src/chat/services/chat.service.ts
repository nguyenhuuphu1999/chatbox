import { Injectable } from '@nestjs/common';
import { RagService } from '../../rag/rag.service';
import { GeminiService } from '../../ai/gemini.service';
import { LoggerService } from '../../logger/logger.service';
import { ChatHistoryService } from './chat-history.service';
import { nowMs, durationMs } from '../../utils/time.util';
import { ChatRequest, ChatResponse } from '../../shared/dto/chat/chat.dto';
import { ChatRequestDto } from '../dto/chat-request.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly rag: RagService,
    private readonly gemini: GeminiService,
    private readonly logger: LoggerService,
    private readonly chatHistory: ChatHistoryService,
  ) {}

  public async handleChat(request: ChatRequestDto, userId: string): Promise<ChatResponse> {
    const t0 = nowMs();
    this.logger.info("ChatService.handleChat.start", { 
      userId, 
      q: request.message, 
      hasImage: !!request.imageBase64,
      filters: request.filters 
    });

    try {
      // Lưu tin nhắn của user
      await this.chatHistory.saveChatMessage(
        userId,
        'user',
        request.message,
        {
          hasImage: !!request.imageBase64,
          filters: request.filters,
          timestamp: new Date().toISOString()
        }
      );

      // Check if this is a greeting message
      const isGreeting = this.isGreetingMessage(request.message);
      
      if (isGreeting) {
        const greetingReply = this.generateGreetingResponse();
        
        // Lưu phản hồi của assistant
        await this.chatHistory.saveChatMessage(
          userId,
          'assistant',
          greetingReply,
          { type: 'greeting' }
        );

        const total = durationMs(t0);
        this.logger.info("ChatService.handleChat.greeting", { tMs: total });
        return { reply: greetingReply, products: [] };
      }

      let searchQuery = request.message;
      let imageDescription = '';

      // If image is provided, analyze it first
      if (request.imageBase64 && request.mimeType) {
        imageDescription = await this.gemini.describeImage(
          request.imageBase64, 
          request.mimeType, 
          request.message
        );
        
        // Generate search query from image description
        searchQuery = await this.gemini.generateSimilarProductQuery(imageDescription);
        this.logger.info("ChatService.handleChat.imageAnalyzed", { 
          imageDescription: imageDescription.substring(0, 100),
          searchQuery: searchQuery.substring(0, 100)
        });
      }

      // Search for products
      const hits = await this.rag.search(searchQuery, request.filters, 5);
      const mid = durationMs(t0);
      this.logger.debug("ChatService.handleChat.searchDone", { hitCount: hits.length, tMs: mid });

      // Generate response
      let reply: string;
      if (request.imageBase64 && imageDescription) {
        reply = await this.gemini.answer(
          `Dựa trên ảnh bạn gửi, tôi đã phân tích và tìm được các sản phẩm tương tự. ${request.message}`,
          hits
        );
        reply += `\n\n*Mô tả ảnh: ${imageDescription}*`;
      } else {
        reply = await this.gemini.answer(request.message, hits);
      }

      // Lưu phản hồi của assistant
      await this.chatHistory.saveChatMessage(
        userId,
        'assistant',
        reply,
        {
          productCount: hits.length,
          hasImage: !!request.imageBase64,
          imageDescription: imageDescription || null
        }
      );

      const total = durationMs(t0);
      this.logger.info("ChatService.handleChat.done", { tMs: total, hitCount: hits.length });

      return { reply, products: hits };
    } catch (e: unknown) {
      const total = durationMs(t0);
      this.logger.error("ChatService.handleChat.error", { err: (e as Error).message, tMs: total });
      throw e;
    }
  }

  private isGreetingMessage(message: string): boolean {
    const greetingPatterns = [
      /^(xin chào|chào|hello|hi|hey|chào bạn|chào anh|chào chị|chào em)$/i,
      /^(good morning|good afternoon|good evening)$/i,
      /^(chào buổi sáng|chào buổi chiều|chào buổi tối)$/i,
      /^(hế lô|hê lô|alo)$/i
    ];
    
    const cleanMessage = message.trim().toLowerCase();
    return greetingPatterns.some(pattern => pattern.test(cleanMessage));
  }

  private generateGreetingResponse(): string {
    const responses = [
      "Xin chào! 👋 Chào mừng bạn đến với cửa hàng thời trang của chúng tôi! Tôi rất vui được hỗ trợ bạn tìm những sản phẩm phù hợp. Bạn đang tìm kiếm gì hôm nay?",
      "Chào bạn! 😊 Cảm ơn bạn đã ghé thăm cửa hàng! Tôi là nhân viên tư vấn và sẵn sàng giúp bạn tìm những bộ trang phục đẹp nhất. Bạn có nhu cầu gì đặc biệt không?",
      "Hello! 🌟 Chào mừng bạn! Tôi rất hân hạnh được phục vụ bạn tại cửa hàng thời trang. Hãy cho tôi biết bạn đang tìm kiếm loại trang phục nào nhé!",
      "Xin chào! 💕 Chào mừng bạn đến với không gian thời trang của chúng tôi! Tôi sẽ giúp bạn tìm được những sản phẩm phù hợp với phong cách và ngân sách. Bạn có gì cần tư vấn không?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
