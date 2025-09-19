import { TestClient, testProducts, validateVietnamesePrice, validateResponseFormat } from './test-utils';

describe('K) Format and Display Tests', () => {
  let client: TestClient;

  beforeAll(async () => {
    client = new TestClient();
    
    // Wait for service to be ready
    const isReady = await client.waitForService();
    if (!isReady) {
      throw new Error('Service is not ready for testing');
    }

    // Clean up and ingest test products
    try {
      await client.deleteCollection();
    } catch (error) {
      // Collection might not exist, ignore
    }
    
    await client.ingestProducts(testProducts);
  });

  afterAll(async () => {
    // Clean up test collection
    try {
      await client.deleteCollection();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('K1 - Vietnamese Price Format', () => {
    it('should display prices in Vietnamese format with VND', async () => {
      const response = await client.chat('Đầm công sở');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Check that prices are mentioned in Vietnamese format
      const hasVietnamesePrice = response.data.products.some(product => {
        const expectedPrice = validateVietnamesePrice(product.price);
        return response.data.reply.includes(expectedPrice);
      });
      
      expect(hasVietnamesePrice).toBe(true);
      
      // Should include "VND" in the response
      const includesVND = response.data.reply.includes('VND') || 
                         response.data.reply.includes('đồng');
      expect(includesVND).toBe(true);
    });

    it('should format large numbers correctly', async () => {
      const response = await client.chat('Đầm xòe dự tiệc ren');
      
      expect(response.status).toBe(200);
      
      // Check for properly formatted large numbers (e.g., 720.000 VND)
      const hasFormattedPrice = response.data.reply.includes('720.000') ||
                               response.data.reply.includes('590.000') ||
                               response.data.reply.includes('650.000');
      expect(hasFormattedPrice).toBe(true);
    });

    it('should handle price ranges correctly', async () => {
      const response = await client.chat('Đồ giá 300-600k');
      
      expect(response.status).toBe(200);
      
      // Should mention price range in Vietnamese format
      const mentionsPriceRange = response.data.reply.includes('300.000') ||
                                response.data.reply.includes('600.000') ||
                                response.data.reply.includes('300k') ||
                                response.data.reply.includes('600k');
      expect(mentionsPriceRange).toBe(true);
    });
  });

  describe('K2 - Product Links', () => {
    it('should display product links when available', async () => {
      const response = await client.chat('Đầm đen ôm công sở');
      
      expect(response.status).toBe(200);
      
      // Check if any returned products have URLs
      const productsWithUrls = response.data.products.filter(p => p.url);
      
      if (productsWithUrls.length > 0) {
        // Should mention links in the response
        const mentionsLinks = response.data.reply.includes('http') ||
                             response.data.reply.includes('link') ||
                             response.data.reply.includes('mua') ||
                             response.data.reply.includes('đặt hàng');
        expect(mentionsLinks).toBe(true);
      }
    });

    it('should handle products without links gracefully', async () => {
      // Create a product without URL
      const productWithoutUrl = {
        ...testProducts[0],
        url: undefined
      };
      
      await client.ingestProducts([productWithoutUrl]);
      
      const response = await client.chat('Đầm đen ôm công sở');
      
      expect(response.status).toBe(200);
      
      // Should not fabricate URLs
      const fabricatesURLs = response.data.reply.includes('https://') ||
                            response.data.reply.includes('http://');
      expect(fabricatesURLs).toBe(false);
      
      // Should mention alternative ways to order
      const mentionsAlternativeOrdering = response.data.reply.toLowerCase().includes('liên hệ') ||
                                         response.data.reply.toLowerCase().includes('đặt hàng') ||
                                         response.data.reply.toLowerCase().includes('cách mua');
      expect(mentionsAlternativeOrdering).toBe(true);
    });

    it('should provide clear purchase instructions', async () => {
      const response = await client.chat('Áo sơ mi trắng');
      
      expect(response.status).toBe(200);
      
      // Should provide clear instructions on how to purchase
      const providesPurchaseInstructions = response.data.reply.toLowerCase().includes('mua') ||
                                         response.data.reply.toLowerCase().includes('đặt') ||
                                         response.data.reply.toLowerCase().includes('liên hệ') ||
                                         response.data.reply.toLowerCase().includes('link');
      expect(providesPurchaseInstructions).toBe(true);
    });
  });

  describe('K3 - Description Length Limits', () => {
    it('should limit product descriptions in responses', async () => {
      const response = await client.chat('Đầm công sở');
      
      expect(response.status).toBe(200);
      
      // Check that descriptions are truncated appropriately
      // The system should not include full long descriptions in the response
      const hasLongDescriptions = response.data.products.some(product => {
        const descriptionInResponse = response.data.reply.includes(product.description);
        return descriptionInResponse && product.description.length > 400;
      });
      
      // Should not include full long descriptions
      expect(hasLongDescriptions).toBe(false);
    });

    it('should provide concise but informative descriptions', async () => {
      const response = await client.chat('Áo sơ mi trắng');
      
      expect(response.status).toBe(200);
      
      // Should mention key product features without being too verbose
      const mentionsKeyFeatures = response.data.reply.toLowerCase().includes('cotton') ||
                                 response.data.reply.toLowerCase().includes('cổ điển') ||
                                 response.data.reply.toLowerCase().includes('form dáng');
      expect(mentionsKeyFeatures).toBe(true);
      
      // Response should not be excessively long
      expect(response.data.reply.length).toBeLessThan(2000);
    });
  });

  describe('K4 - Suggestion Quantity', () => {
    it('should provide 1-3 product suggestions', async () => {
      const testQueries = [
        'Đầm công sở',
        'Áo sơ mi trắng',
        'Quần tây xám',
        'Đầm dự tiệc'
      ];
      
      for (const query of testQueries) {
        const response = await client.chat(query);
        
        expect(response.status).toBe(200);
        expect(response.data.products.length).toBeGreaterThanOrEqual(1);
        expect(response.data.products.length).toBeLessThanOrEqual(3);
      }
    });

    it('should not overwhelm users with too many suggestions', async () => {
      const response = await client.chat('Đồ công sở');
      
      expect(response.status).toBe(200);
      
      // Should not return more than 3 products
      expect(response.data.products.length).toBeLessThanOrEqual(3);
      
      // Response should be concise and not spam
      expect(response.data.reply.length).toBeLessThan(1500);
    });

    it('should prioritize most relevant suggestions', async () => {
      const response = await client.chat('Đầm đen size M dưới 600k');
      
      expect(response.status).toBe(200);
      
      // Should return products that match the specific criteria
      const matchingProducts = response.data.products.filter(p => 
        p.colors?.includes('đen') &&
        p.sizes?.includes('M') &&
        p.price <= 600000
      );
      
      // Should prioritize exact matches
      expect(matchingProducts.length).toBeGreaterThan(0);
    });
  });

  describe('Response Structure and Readability', () => {
    it('should provide well-structured responses', async () => {
      const response = await client.chat('Đầm công sở đen');
      
      expect(response.status).toBe(200);
      
      // Response should be well-formatted and readable
      const isReadable = response.data.reply.length > 50 &&
                        response.data.reply.length < 1500 &&
                        !response.data.reply.includes('undefined') &&
                        !response.data.reply.includes('null');
      expect(isReadable).toBe(true);
    });

    it('should include product numbers in suggestions', async () => {
      const response = await client.chat('Đầm công sở');
      
      expect(response.status).toBe(200);
      
      // Should number the suggestions (e.g., [1], [2], [3])
      const hasNumberedSuggestions = response.data.reply.includes('[1]') ||
                                    response.data.reply.includes('[2]') ||
                                    response.data.reply.includes('[3]');
      expect(hasNumberedSuggestions).toBe(true);
    });

    it('should provide clear product information', async () => {
      const response = await client.chat('Áo sơ mi trắng');
      
      expect(response.status).toBe(200);
      
      // Should include essential product information
      const includesEssentialInfo = response.data.reply.toLowerCase().includes('giá') ||
                                   response.data.reply.toLowerCase().includes('size') ||
                                   response.data.reply.toLowerCase().includes('màu') ||
                                   response.data.reply.toLowerCase().includes('vnd');
      expect(includesEssentialInfo).toBe(true);
    });
  });

  describe('Vietnamese Language Quality', () => {
    it('should respond in proper Vietnamese', async () => {
      const response = await client.chat('Đầm công sở');
      
      expect(response.status).toBe(200);
      
      // Should use proper Vietnamese grammar and vocabulary
      const usesProperVietnamese = !response.data.reply.includes('undefined') &&
                                 !response.data.reply.includes('null') &&
                                 response.data.reply.length > 0;
      expect(usesProperVietnamese).toBe(true);
    });

    it('should use appropriate Vietnamese fashion terminology', async () => {
      const response = await client.chat('Đầm dự tiệc');
      
      expect(response.status).toBe(200);
      
      // Should use appropriate Vietnamese fashion terms
      const usesFashionTerms = response.data.reply.toLowerCase().includes('đầm') ||
                              response.data.reply.toLowerCase().includes('dự tiệc') ||
                              response.data.reply.toLowerCase().includes('nữ tính') ||
                              response.data.reply.toLowerCase().includes('thanh lịch');
      expect(usesFashionTerms).toBe(true);
    });

    it('should ask questions in natural Vietnamese', async () => {
      const response = await client.chat('Mình muốn mua đầm');
      
      expect(response.status).toBe(200);
      
      // Should ask clarifying questions in natural Vietnamese
      const asksNaturalQuestions = response.data.reply.includes('?') &&
                                 (response.data.reply.toLowerCase().includes('size') ||
                                  response.data.reply.toLowerCase().includes('dịp') ||
                                  response.data.reply.toLowerCase().includes('ngân sách'));
      expect(asksNaturalQuestions).toBe(true);
    });
  });

  describe('Error Message Formatting', () => {
    it('should format error messages appropriately', async () => {
      const response = await client.chat('Đồ không tồn tại');
      
      expect(response.status).toBe(200);
      
      // Error messages should be user-friendly
      const isUserFriendly = !response.data.reply.toLowerCase().includes('error') &&
                            !response.data.reply.toLowerCase().includes('exception') &&
                            !response.data.reply.toLowerCase().includes('failed') &&
                            response.data.reply.length > 10;
      expect(isUserFriendly).toBe(true);
    });

    it('should provide helpful suggestions when no products found', async () => {
      const response = await client.chat('Đầm tím than dưới 200k');
      
      expect(response.status).toBe(200);
      
      // Should provide helpful suggestions
      const providesHelpfulSuggestions = response.data.reply.toLowerCase().includes('gợi ý') ||
                                        response.data.reply.toLowerCase().includes('thử') ||
                                        response.data.reply.toLowerCase().includes('tăng') ||
                                        response.data.reply.toLowerCase().includes('ngân sách');
      expect(providesHelpfulSuggestions).toBe(true);
    });
  });
});
