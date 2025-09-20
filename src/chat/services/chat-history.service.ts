import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { Conversation } from '../../entities/conversation.entity';
import { Message, MessageRole } from '../../entities/message.entity';
import { MemorySummary } from '../../entities/memory-summary.entity';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class ChatHistoryService {
  constructor(
    @InjectRepository(Customer)
    private readonly customers: Repository<Customer>,
    @InjectRepository(Conversation)
    private readonly conversations: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messages: Repository<Message>,
    @InjectRepository(MemorySummary)
    private readonly summaries: Repository<MemorySummary>,
    private readonly logger: LoggerService,
  ) {}

  async saveChatMessage(
    externalId: string,
    role: MessageRole,
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      // Tìm hoặc tạo customer
      let customer = await this.customers.findOne({ where: { externalId } });
      if (!customer) {
        customer = await this.customers.save(
          this.customers.create({ 
            externalId, 
            profile: {} 
          })
        );
        this.logger.info("ChatHistoryService.saveChatMessage.customerCreated", { externalId });
      }

      // Tìm hoặc tạo conversation
      let conversation = await this.conversations.findOne({ 
        where: { 
          customerId: customer.id, 
          status: 'open' 
        } 
      });
      
      if (!conversation) {
        conversation = await this.conversations.save(
          this.conversations.create({ 
            customerId: customer.id, 
            channel: 'web', 
            status: 'open' 
          })
        );
        this.logger.info("ChatHistoryService.saveChatMessage.conversationCreated", { 
          customerId: customer.id 
        });
      }

      // Lưu message
      await this.messages.save(
        this.messages.create({
          conversationId: conversation.id,
          customerId: customer.id,
          role,
          content,
          metadata,
          tokenCount: content.length, // Simple token estimation
        })
      );

      this.logger.info("ChatHistoryService.saveChatMessage.messageSaved", { 
        customerId: customer.id,
        conversationId: conversation.id,
        role,
        contentLength: content.length
      });
    } catch (error) {
      this.logger.error("ChatHistoryService.saveChatMessage.error", { 
        externalId, 
        error: error.message 
      });
      throw error;
    }
  }

  async getChatHistory(
    externalId: string, 
    limit: number = 20
  ): Promise<Message[]> {
    try {
      const customer = await this.customers.findOne({ where: { externalId } });
      if (!customer) {
        return [];
      }

      const messages = await this.messages.find({
        where: { customerId: customer.id },
        order: { createdAt: 'DESC' },
        take: limit,
      });

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      this.logger.error("ChatHistoryService.getChatHistory.error", { 
        externalId, 
        error: error.message 
      });
      return [];
    }
  }

  async getCustomerSummary(externalId: string): Promise<string> {
    try {
      const customer = await this.customers.findOne({ where: { externalId } });
      if (!customer) {
        return '';
      }

      const summary = await this.summaries.findOne({ 
        where: { customerId: customer.id } 
      });
      
      return summary?.summary || '';
    } catch (error) {
      this.logger.error("ChatHistoryService.getCustomerSummary.error", { 
        externalId, 
        error: error.message 
      });
      return '';
    }
  }

  async updateCustomerSummary(
    externalId: string, 
    summary: string
  ): Promise<void> {
    try {
      const customer = await this.customers.findOne({ where: { externalId } });
      if (!customer) {
        return;
      }

      const existingSummary = await this.summaries.findOne({ 
        where: { customerId: customer.id } 
      });

      if (existingSummary) {
        existingSummary.summary = summary;
        existingSummary.tokenCount = summary.length;
        await this.summaries.save(existingSummary);
      } else {
        await this.summaries.save(
          this.summaries.create({
            customerId: customer.id,
            summary,
            tokenCount: summary.length,
            turnsCovered: 0,
          })
        );
      }

      this.logger.info("ChatHistoryService.updateCustomerSummary.updated", { 
        customerId: customer.id 
      });
    } catch (error) {
      this.logger.error("ChatHistoryService.updateCustomerSummary.error", { 
        externalId, 
        error: error.message 
      });
    }
  }
}
