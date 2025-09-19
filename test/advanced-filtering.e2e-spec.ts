import { TestClient, testProducts, validateResponseFormat, validateNoHallucination } from './test-utils';

describe('B) Advanced Filtering Tests', () => {
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

  describe('B1 - Đầm đen size M, 500-800k', () => {
    it('should filter by price range, color, and size', async () => {
      const filters = {
        price_min: 500000,
        price_max: 800000,
        color: 'đen',
        size: 'M'
      };
      
      const response = await client.chat('Đầm đen size M, 500-800k', filters);
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Check that all returned products match the filters
      const filteredProducts = response.data.products.filter(p => 
        p.price >= 500000 && 
        p.price <= 800000 &&
        p.colors?.includes('đen') &&
        p.sizes?.includes('M')
      );
      
      // Should have at least one product matching all criteria
      expect(filteredProducts.length).toBeGreaterThan(0);
      
      // If no products match size M, should suggest alternative sizes
      if (filteredProducts.length === 0) {
        const suggestsAlternatives = response.data.reply.toLowerCase().includes('size') ||
                                   response.data.reply.toLowerCase().includes('cỡ khác');
        expect(suggestsAlternatives).toBe(true);
      }
      
      expect(validateNoHallucination(response.data, testProducts)).toBe(true);
    });
  });

  describe('B2 - Chân váy chữ A, màu be, dưới 400k', () => {
    it('should filter by category, style, color, and price', async () => {
      const filters = {
        price_max: 400000,
        color: 'be',
        category: 'chân váy'
      };
      
      const response = await client.chat('Chân váy chữ A, màu be, dưới 400k', filters);
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Check that all returned products match the filters
      const filteredProducts = response.data.products.filter(p => 
        p.price <= 400000 &&
        p.colors?.includes('be') &&
        (p.tags?.includes('chân váy') || p.title.toLowerCase().includes('chân váy'))
      );
      
      expect(filteredProducts.length).toBeGreaterThan(0);
      
      // Should provide purchase links
      const hasLinks = response.data.products.some(p => p.url);
      if (hasLinks) {
        const mentionsLinks = response.data.reply.includes('http') || 
                             response.data.reply.includes('link');
        expect(mentionsLinks).toBe(true);
      }
      
      // Should mention stock availability
      const mentionsStock = response.data.reply.toLowerCase().includes('còn') ||
                           response.data.reply.toLowerCase().includes('hàng') ||
                           response.data.reply.toLowerCase().includes('stock');
      expect(mentionsStock).toBe(true);
    });
  });

  describe('B3 - Áo khoác nữ, size S', () => {
    it('should filter by size and suggest alternatives if not available', async () => {
      const filters = {
        size: 'S',
        category: 'áo khoác'
      };
      
      const response = await client.chat('Áo khoác nữ, size S', filters);
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Check if any products have size S
      const productsWithSizeS = response.data.products.filter(p => 
        p.sizes?.includes('S') &&
        (p.tags?.includes('áo khoác') || p.title.toLowerCase().includes('khoác'))
      );
      
      if (productsWithSizeS.length > 0) {
        // If size S is available, should show those products
        expect(productsWithSizeS.length).toBeGreaterThan(0);
      } else {
        // If size S is not available, should suggest nearest sizes
        const suggestsAlternatives = response.data.reply.toLowerCase().includes('size') ||
                                   response.data.reply.toLowerCase().includes('cỡ gần') ||
                                   response.data.reply.toLowerCase().includes('không có');
        expect(suggestsAlternatives).toBe(true);
      }
      
      expect(validateNoHallucination(response.data, testProducts)).toBe(true);
    });
  });

  describe('B4 - Màu hồng nhạt có không?', () => {
    it('should find products with light pink color', async () => {
      const filters = {
        color: 'hồng nhạt'
      };
      
      const response = await client.chat('Màu hồng nhạt có không?', filters);
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Check if any products have light pink color
      const lightPinkProducts = response.data.products.filter(p => 
        p.colors?.includes('hồng nhạt')
      );
      
      if (lightPinkProducts.length > 0) {
        // Should list 1-3 products with light pink
        expect(lightPinkProducts.length).toBeGreaterThan(0);
        expect(lightPinkProducts.length).toBeLessThanOrEqual(3);
        
        // Should ask about budget
        const asksAboutBudget = response.data.reply.toLowerCase().includes('ngân sách') ||
                               response.data.reply.toLowerCase().includes('giá') ||
                               response.data.reply.toLowerCase().includes('budget');
        expect(asksAboutBudget).toBe(true);
      } else {
        // If no light pink products, should say so
        const saysNotAvailable = response.data.reply.toLowerCase().includes('không có') ||
                                response.data.reply.toLowerCase().includes('chưa có') ||
                                response.data.reply.toLowerCase().includes('hiện tại');
        expect(saysNotAvailable).toBe(true);
      }
      
      expect(validateNoHallucination(response.data, testProducts)).toBe(true);
    });
  });

  describe('Complex Filter Combinations', () => {
    it('should handle multiple filters simultaneously', async () => {
      const filters = {
        price_min: 300000,
        price_max: 600000,
        size: 'M',
        color: 'đen'
      };
      
      const response = await client.chat('Quần áo đen size M, giá 300-600k', filters);
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // All returned products should match at least some criteria
      const matchingProducts = response.data.products.filter(p => 
        p.price >= 300000 && 
        p.price <= 600000 &&
        p.colors?.includes('đen') &&
        p.sizes?.includes('M')
      );
      
      // Should have some products matching the criteria
      expect(matchingProducts.length).toBeGreaterThan(0);
    });

    it('should handle conflicting filters gracefully', async () => {
      const filters = {
        price_max: 100000, // Very low price
        size: 'XXL' // Size that might not exist
      };
      
      const response = await client.chat('Đồ rẻ dưới 100k size XXL', filters);
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should handle gracefully when no products match
      if (response.data.products.length === 0) {
        const suggestsAlternatives = response.data.reply.toLowerCase().includes('không có') ||
                                   response.data.reply.toLowerCase().includes('thử') ||
                                   response.data.reply.toLowerCase().includes('gợi ý');
        expect(suggestsAlternatives).toBe(true);
      }
    });
  });

  describe('Filter Validation', () => {
    it('should validate price range filters', async () => {
      const filters = {
        price_min: 500000,
        price_max: 300000 // Invalid: min > max
      };
      
      const response = await client.chat('Đồ giá 500-300k', filters);
      
      expect(response.status).toBe(200);
      // Should handle invalid range gracefully
      expect(validateResponseFormat(response.data)).toBe(true);
    });

    it('should handle non-existent colors gracefully', async () => {
      const filters = {
        color: 'màu không tồn tại'
      };
      
      const response = await client.chat('Đồ màu không tồn tại', filters);
      
      expect(response.status).toBe(200);
      expect(validateResponseFormat(response.data)).toBe(true);
      
      // Should indicate no products found for that color
      const indicatesNoResults = response.data.products.length === 0 ||
                                response.data.reply.toLowerCase().includes('không có') ||
                                response.data.reply.toLowerCase().includes('chưa có');
      expect(indicatesNoResults).toBe(true);
    });
  });
});
