import { Injectable, Logger } from '@nestjs/common';
import { createHttp } from '../utils/http.util';
import { mask } from '../utils/format.util';

const API = 'https://generativelanguage.googleapis.com/v1beta';

@Injectable()
export class GeminiClient {
  private readonly logger = new Logger(GeminiClient.name);
  private key = process.env.GOOGLE_API_KEY!;
  private http = createHttp(API);

  public async embed(text: string): Promise<number[]> {
    this.logger.debug(`embed start: text=${mask(text, 20)}`);
    try {
      const { data } = await this.http.post(`/models/text-embedding-004:embedContent?key=${this.key}`, {
        content: { parts: [{ text }] }
      });
      this.logger.debug(`embed done: vector_size=${data.embedding.values.length}`);
      return data.embedding.values;
    } catch (error) {
      this.logger.error(`embed error: ${error}`);
      throw error;
    }
  }

  public async chat(prompt: string): Promise<string> {
    this.logger.debug(`chat start: prompt=${mask(prompt, 50)}`);
    try {
      const { data } = await this.http.post(`/models/gemini-1.5-flash:generateContent?key=${this.key}`, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4 }
      });
      const parts = data.candidates?.[0]?.content?.parts || [];
      const result = parts.map((p: any) => p.text).join('\n').trim();
      this.logger.debug(`chat done: response_length=${result.length}`);
      return result;
    } catch (error) {
      this.logger.error(`chat error: ${error}`);
      throw error;
    }
  }

  public async describeImage(imageBase64: string, mimeType: string, userMessage: string): Promise<string> {
    this.logger.debug(`describeImage start: mimeType=${mimeType}, message=${mask(userMessage, 30)}`);
    try {
      const { data } = await this.http.post(`/models/gemini-1.5-flash:generateContent?key=${this.key}`, {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${userMessage}\n\nHãy mô tả chi tiết về màu sắc, kiểu dáng, phong cách của sản phẩm trong ảnh để tôi có thể tìm kiếm sản phẩm tương tự.`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
          topP: 0.8,
          topK: 40
        }
      });

      const parts = data.candidates?.[0]?.content?.parts || [];
      const result = parts.map((p: any) => p.text).join('\n').trim();
      this.logger.debug(`describeImage done: description_length=${result.length}`);
      return result;
    } catch (error) {
      this.logger.error(`describeImage error: ${error}`);
      throw error;
    }
  }
}
