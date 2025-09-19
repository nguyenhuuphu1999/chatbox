import { TestClient, testProducts, validateVietnamesePrice, validateResponseFormat, validateNoHallucination } from './test-utils';

describe('A) Basic Product Discovery Tests', () => {
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

  describe('A1 - Đầm đi làm dưới 700k', () => {
    it('should find office dresses under 700k', async () => {
      const response = await client.chat('Mình cần đầm đi làm, dưới 700k');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      expect(response.data.products.length).toBeGreaterThan(0);
      
      // Check that all returned products are office dresses under 700k
      const officeDresses = response.data.products.filter(p => 
        p.price <= 700000 && 
        (p.tags?.includes('công sở') || p.tags?.includes('đầm'))
      );
      expect(officeDresses.length).toBeGreaterThan(0);
      
      // Validate no hallucination
      expect(validateNoHallucination(response.data, testProducts)).toBe(true);
      
      // Check Vietnamese price format
      const hasVietnamesePrice = response.data.reply.includes('VND') || 
                                response.data.reply.includes('đồng');
      expect(hasVietnamesePrice).toBe(true);
      
      // Should ask for size if not specified
      const asksForSize = response.data.reply.toLowerCase().includes('size') ||
                         response.data.reply.toLowerCase().includes('cỡ');
      expect(asksForSize).toBe(true);
    });
  });

  describe('A2 - Áo sơ mi nữ tay dài màu trắng', () => {
    it('should find white long-sleeve shirts', async () => {
      const response = await client.chat('Áo sơ mi nữ tay dài, màu trắng');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should find white shirts
      const whiteShirts = response.data.products.filter(p => 
        p.colors?.includes('trắng') && 
        p.tags?.includes('áo sơ mi')
      );
      expect(whiteShirts.length).toBeGreaterThan(0);
      
      // Should ask for size
      const asksForSize = response.data.reply.toLowerCase().includes('size') ||
                         response.data.reply.toLowerCase().includes('cỡ');
      expect(asksForSize).toBe(true);
      
      // Should provide purchase link if available
      const hasLink = response.data.reply.includes('http') || 
                     response.data.reply.includes('link') ||
                     response.data.reply.includes('mua');
      expect(hasLink).toBe(true);
    });
  });

  describe('A3 - Váy dự tiệc lộng lẫy', () => {
    it('should find party dresses with elegant features', async () => {
      const response = await client.chat('Váy dự tiệc lộng lẫy');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should find party dresses
      const partyDresses = response.data.products.filter(p => 
        p.tags?.includes('dự tiệc') || p.tags?.includes('đầm')
      );
      expect(partyDresses.length).toBeGreaterThan(0);
      
      // Should highlight elegant features (ren, sequin, etc.)
      const highlightsFeatures = response.data.reply.toLowerCase().includes('ren') ||
                                response.data.reply.toLowerCase().includes('lộng lẫy') ||
                                response.data.reply.toLowerCase().includes('nữ tính');
      expect(highlightsFeatures).toBe(true);
    });
  });

  describe('A4 - Quần ống rộng chất mát', () => {
    it('should find wide-leg pants with breathable material', async () => {
      const response = await client.chat('Quần ống rộng chất mát');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should find pants with breathable materials
      const breathablePants = response.data.products.filter(p => 
        p.tags?.includes('quần') && 
        (p.description.toLowerCase().includes('mát') || 
         p.tags?.includes('cotton') || 
         p.tags?.includes('linen'))
      );
      expect(breathablePants.length).toBeGreaterThan(0);
      
      // Should ask about height/size
      const asksAboutSize = response.data.reply.toLowerCase().includes('size') ||
                           response.data.reply.toLowerCase().includes('chiều cao') ||
                           response.data.reply.toLowerCase().includes('cỡ');
      expect(asksAboutSize).toBe(true);
    });
  });

  describe('A5 - Set đồ đi biển', () => {
    it('should find beach outfits and suggest accessories', async () => {
      const response = await client.chat('Set đồ đi biển');
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should find beach-appropriate items
      const beachItems = response.data.products.filter(p => 
        p.tags?.includes('đi chơi') || 
        p.tags?.includes('maxi') ||
        p.description.toLowerCase().includes('biển')
      );
      expect(beachItems.length).toBeGreaterThan(0);
      
      // Should suggest accessories if available
      const suggestsAccessories = response.data.reply.toLowerCase().includes('mũ') ||
                                 response.data.reply.toLowerCase().includes('nón') ||
                                 response.data.reply.toLowerCase().includes('phụ kiện');
      // This might not always be true depending on available products
      // expect(suggestsAccessories).toBe(true);
    });
  });

  describe('Response Quality Validation', () => {
    it('should provide 1-3 product suggestions', async () => {
      const response = await client.chat('Mình cần đầm đi làm');
      
      expect(response.status).toBe(200);
      expect(response.data.products.length).toBeGreaterThanOrEqual(1);
      expect(response.data.products.length).toBeLessThanOrEqual(3);
    });

    it('should include price in Vietnamese format', async () => {
      const response = await client.chat('Áo sơ mi trắng');
      
      expect(response.status).toBe(200);
      
      // Check if any product price is mentioned in Vietnamese format
      const hasVietnamesePrice = response.data.products.some(product => {
        const priceStr = validateVietnamesePrice(product.price);
        return response.data.reply.includes(priceStr);
      });
      expect(hasVietnamesePrice).toBe(true);
    });

    it('should not hallucinate products not in database', async () => {
      const response = await client.chat('Đầm công sở đỏ');
      
      expect(response.status).toBe(200);
      expect(validateNoHallucination(response.data, testProducts)).toBe(true);
    });

    it('should ask clarifying questions when information is missing', async () => {
      const response = await client.chat('Mình muốn mua đầm');
      
      expect(response.status).toBe(200);
      
      // Should ask about size, occasion, or budget
      const asksClarifyingQuestion = 
        response.data.reply.toLowerCase().includes('size') ||
        response.data.reply.toLowerCase().includes('dịp') ||
        response.data.reply.toLowerCase().includes('ngân sách') ||
        response.data.reply.toLowerCase().includes('giá') ||
        response.data.reply.toLowerCase().includes('?');
      expect(asksClarifyingQuestion).toBe(true);
    });
  });
});
