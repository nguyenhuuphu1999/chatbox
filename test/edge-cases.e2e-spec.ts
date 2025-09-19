import { TestClient, testProducts, validateResponseFormat, validateNoHallucination } from './test-utils';

describe('H) Edge Cases and Error Handling Tests', () => {
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

  describe('H1 - No Results Found', () => {
    it('should handle requests with no matching products', async () => {
      const response = await client.chat('Đầm tím than dưới 200k');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should return empty products array
      expect(response.data.products.length).toBe(0);
      
      // Should indicate no products found
      const indicatesNoResults = response.data.reply.toLowerCase().includes('không có') ||
                                response.data.reply.toLowerCase().includes('chưa có') ||
                                response.data.reply.toLowerCase().includes('không tìm thấy') ||
                                response.data.reply.toLowerCase().includes('hiện chưa có');
      expect(indicatesNoResults).toBe(true);
      
      // Should suggest alternatives (increase budget or similar colors)
      const suggestsAlternatives = response.data.reply.toLowerCase().includes('tăng') ||
                                 response.data.reply.toLowerCase().includes('ngân sách') ||
                                 response.data.reply.toLowerCase().includes('màu gần') ||
                                 response.data.reply.toLowerCase().includes('gợi ý');
      expect(suggestsAlternatives).toBe(true);
    });

    it('should handle very specific requests with no matches', async () => {
      const response = await client.chat('Áo sơ mi xanh lá cỡ XXXS');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should indicate size doesn't exist
      const indicatesSizeIssue = response.data.reply.toLowerCase().includes('size') ||
                                response.data.reply.toLowerCase().includes('cỡ') ||
                                response.data.reply.toLowerCase().includes('không có');
      expect(indicatesSizeIssue).toBe(true);
      
      // Should suggest nearest available sizes
      const suggestsNearestSizes = response.data.reply.toLowerCase().includes('gần nhất') ||
                                 response.data.reply.toLowerCase().includes('có sẵn') ||
                                 response.data.reply.toLowerCase().includes('S, M, L');
      expect(suggestsNearestSizes).toBe(true);
    });
  });

  describe('H2 - Vague Requests', () => {
    it('should ask clarifying questions for vague requests', async () => {
      const response = await client.chat('Mình muốn cái xinh xinh');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should ask for clarification
      const asksForClarification = response.data.reply.toLowerCase().includes('?') &&
                                 (response.data.reply.toLowerCase().includes('dịp') ||
                                  response.data.reply.toLowerCase().includes('size') ||
                                  response.data.reply.toLowerCase().includes('ngân sách') ||
                                  response.data.reply.toLowerCase().includes('màu'));
      expect(asksForClarification).toBe(true);
      
      // Should ask only one clear question
      const questionCount = (response.data.reply.match(/\?/g) || []).length;
      expect(questionCount).toBeLessThanOrEqual(2); // Allow for one follow-up
    });

    it('should handle very broad requests', async () => {
      const response = await client.chat('Tôi cần quần áo');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should ask for more specific information
      const asksForSpecifics = response.data.reply.toLowerCase().includes('?') &&
                             (response.data.reply.toLowerCase().includes('dịp') ||
                              response.data.reply.toLowerCase().includes('phong cách') ||
                              response.data.reply.toLowerCase().includes('màu'));
      expect(asksForSpecifics).toBe(true);
    });
  });

  describe('H3 - Non-existent Sizes', () => {
    it('should handle requests for non-existent sizes', async () => {
      const response = await client.chat('Áo sơ mi size XXXL');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should indicate size doesn't exist
      const indicatesSizeNotAvailable = response.data.reply.toLowerCase().includes('size') ||
                                       response.data.reply.toLowerCase().includes('cỡ') ||
                                       response.data.reply.toLowerCase().includes('không có');
      expect(indicatesSizeNotAvailable).toBe(true);
      
      // Should suggest available sizes
      const suggestsAvailableSizes = response.data.reply.toLowerCase().includes('S') ||
                                    response.data.reply.toLowerCase().includes('M') ||
                                    response.data.reply.toLowerCase().includes('L');
      expect(suggestsAvailableSizes).toBe(true);
    });
  });

  describe('H4 - Inappropriate Product Categories', () => {
    it('should handle requests for products not in the store', async () => {
      const response = await client.chat('Váy cưới cho bé 2 tuổi');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should indicate the store doesn't carry that category
      const indicatesNotAvailable = response.data.reply.toLowerCase().includes('không') ||
                                   response.data.reply.toLowerCase().includes('chưa') ||
                                   response.data.reply.toLowerCase().includes('không kinh doanh');
      expect(indicatesNotAvailable).toBe(true);
      
      // Should suggest alternative categories
      const suggestsAlternatives = response.data.reply.toLowerCase().includes('gợi ý') ||
                                 response.data.reply.toLowerCase().includes('danh mục') ||
                                 response.data.reply.toLowerCase().includes('khác');
      expect(suggestsAlternatives).toBe(true);
    });

    it('should handle requests for men\'s clothing in women\'s store', async () => {
      const response = await client.chat('Áo sơ mi nam công sở');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should indicate this is a women's store
      const indicatesWomensStore = response.data.reply.toLowerCase().includes('nữ') ||
                                  response.data.reply.toLowerCase().includes('phụ nữ') ||
                                  response.data.reply.toLowerCase().includes('không có');
      expect(indicatesWomensStore).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await client.chat('!@#$%^&*()');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should ask for clarification or provide general help
      const providesHelp = response.data.reply.toLowerCase().includes('giúp') ||
                          response.data.reply.toLowerCase().includes('hỗ trợ') ||
                          response.data.reply.toLowerCase().includes('?');
      expect(providesHelp).toBe(true);
    });

    it('should handle empty requests', async () => {
      const response = await client.chat('');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should ask what the user is looking for
      const asksWhatLookingFor = response.data.reply.toLowerCase().includes('tìm') ||
                                response.data.reply.toLowerCase().includes('cần') ||
                                response.data.reply.toLowerCase().includes('?');
      expect(asksWhatLookingFor).toBe(true);
    });

    it('should handle very long requests', async () => {
      const longMessage = 'Mình cần '.repeat(100) + 'đầm đẹp';
      const response = await client.chat(longMessage);
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should still provide a reasonable response
      expect(response.data.reply.length).toBeGreaterThan(10);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle very low price requests', async () => {
      const response = await client.chat('Đồ dưới 50k');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should indicate no products in that price range
      if (response.data.products.length === 0) {
        const indicatesNoProducts = response.data.reply.toLowerCase().includes('không có') ||
                                   response.data.reply.toLowerCase().includes('chưa có');
        expect(indicatesNoProducts).toBe(true);
      }
    });

    it('should handle very high price requests', async () => {
      const response = await client.chat('Đồ trên 10 triệu');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should handle gracefully
      expect(response.data.reply.length).toBeGreaterThan(10);
    });

    it('should handle requests with special characters', async () => {
      const response = await client.chat('Đầm "đẹp" & rẻ < 500k');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should still provide a reasonable response
      expect(response.data.reply.length).toBeGreaterThan(10);
    });
  });

  describe('Response Quality for Edge Cases', () => {
    it('should maintain response quality even with no results', async () => {
      const response = await client.chat('Đồ không tồn tại');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Response should be helpful and not just say "no results"
      expect(response.data.reply.length).toBeGreaterThan(20);
      
      // Should not contain error messages
      const hasErrorMessages = response.data.reply.toLowerCase().includes('error') ||
                              response.data.reply.toLowerCase().includes('lỗi') ||
                              response.data.reply.toLowerCase().includes('exception');
      expect(hasErrorMessages).toBe(false);
    });

    it('should provide consistent response format for all edge cases', async () => {
      const testCases = [
        'Đồ không tồn tại',
        'Mình muốn cái xinh xinh',
        'Áo size XXXL',
        'Váy cưới cho bé'
      ];
      
      for (const testCase of testCases) {
        const response = await client.chat(testCase);
        
        expect(response.status).toBe(200);
        expect(validateResponseFormat(response.data)).toBe(true);
        expect(typeof response.data.reply).toBe('string');
        expect(Array.isArray(response.data.products)).toBe(true);
      }
    });
  });
});
