import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { LoggerService } from "../logger/logger.service";
import { SYSTEM_CODE } from "../constants/system-code.constants";
import { GeminiClient } from "../clients/gemini.client";
import { ClsService } from "../context/cls.service";
import { formatPriceVND, truncate } from "../utils/format.util";
import { ProductDoc } from "../shared/types/product.types";

@Injectable()
export class GeminiService {
  public constructor(
    private readonly logger: LoggerService,
    private readonly client: GeminiClient,
    private readonly cls: ClsService,
  ) {}

  public formatProducts(items: ProductDoc[]): string {
    const correlationId = this.cls.getId() ?? `FORMAT_PRODUCTS_${Date.now()}`;
    this.logger.debug("Format products start", { correlationId, items_count: items.length });

    if (items.length === 0) {
      return "Không tìm thấy sản phẩm phù hợp.";
    }

    const result = items.map((p: ProductDoc, i: number) =>
      `[${i + 1}] ${p.title} — ${formatPriceVND(p.price)}${
        p.sizes?.length ? ` — size: ${p.sizes.join(', ')}` : ''
      }${p.colors?.length ? ` — màu: ${p.colors.join(', ')}` : ''}${
        p.url ? ` — ${p.url}` : ''
      }\nMô tả: ${truncate(String(p.description || ''), 400)}`
    ).join('\n\n');

    this.logger.debug("Format products done", { correlationId, result_length: result.length });
    return result;
  }

  public async answer(userMsg: string, products: ProductDoc[]): Promise<string> {
    const correlationId = this.cls.getId() ?? `GEMINI_ANSWER_${Date.now()}`;
    this.logger.info("Gemini answer start", { correlationId, 
      userMsg: userMsg.substring(0, 50), 
      products_count: products.length 
    });

    try {
      const ctx = this.formatProducts(products);
      const prompt = `Khách hỏi: ${userMsg}

Sản phẩm liên quan (chỉ dùng thông tin dưới đây, không bịa):
${ctx}

Yêu cầu phản hồi:
- Nếu có sản phẩm phù hợp: Đề xuất 1–3 lựa chọn phù hợp, nêu lý do ngắn (phong cách/size/dịp). Ghi rõ giá (VND) và link (nếu có).
- Nếu thiếu thông tin (ngân sách/size/màu/dịp): Hỏi lại đúng 1 câu.
- Nếu không có sản phẩm phù hợp: BẮT BUỘC trả lời chính xác câu này: "Dạ chị có thể cho em xin hình mẫu của chị có để em tìm kiếm chính xác cho chị được không ạ"`;

      this.logger.debug("Calling Gemini chat API", { correlationId });
      const result = await this.client.chat(prompt);
      
      this.logger.info("Gemini answer done", { correlationId, result_length: result.length });
      return result;
    } catch (error) {
      this.logger.error("Error Gemini answer", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.CHAT_ERROR);
    }
  }

  public async describeImage(imageBase64: string, mimeType: string, userMessage: string): Promise<string> {
    const correlationId = this.cls.getId() ?? `GEMINI_DESCRIBE_IMAGE_${Date.now()}`;
    this.logger.info("Gemini describe image start", { correlationId, 
      mimeType, 
      userMessage: userMessage.substring(0, 30) 
    });

    try {
      this.logger.debug("Calling Gemini vision API", { correlationId });
      const result = await this.client.describeImage(imageBase64, mimeType, userMessage);
      
      this.logger.info("Gemini describe image done", { correlationId, result_length: result.length });
      return result;
    } catch (error) {
      this.logger.error("Error Gemini describe image", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.IMAGE_ANALYSIS_ERROR);
    }
  }

  public async generateSimilarProductQuery(imageDescription: string): Promise<string> {
    const correlationId = this.cls.getId() ?? `GEMINI_GENERATE_QUERY_${Date.now()}`;
    this.logger.info("Gemini generate query start", { correlationId, 
      description: imageDescription.substring(0, 50) 
    });

    try {
      const prompt = `Dựa trên mô tả sản phẩm sau: "${imageDescription}"

Hãy tạo ra một câu hỏi tìm kiếm ngắn gọn (1-2 câu) để tìm sản phẩm tương tự trong cửa hàng thời trang. Chỉ trả về câu hỏi, không giải thích thêm.`;

      this.logger.debug("Calling Gemini chat API for query generation", { correlationId });
      const result = await this.client.chat(prompt);
      
      this.logger.info("Gemini generate query done", { correlationId, result_length: result.length });
      return result;
    } catch (error) {
      this.logger.error("Error Gemini generate query", { correlationId, error });
      throw new InternalServerErrorException(SYSTEM_CODE.CHAT_ERROR);
    }
  }
}
