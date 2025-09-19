import { testProducts, validateVietnamesePrice, validateResponseFormat, validateNoHallucination } from './test-utils';

describe('Test Structure Validation', () => {
  describe('Test Utilities', () => {
    it('should have test products data', () => {
      expect(testProducts).toBeDefined();
      expect(Array.isArray(testProducts)).toBe(true);
      expect(testProducts.length).toBeGreaterThan(0);
      
      // Check product structure
      const firstProduct = testProducts[0];
      expect(firstProduct.id).toBeDefined();
      expect(firstProduct.title).toBeDefined();
      expect(firstProduct.price).toBeDefined();
      expect(firstProduct.description).toBeDefined();
    });

    it('should validate Vietnamese price format correctly', () => {
      const price = 590000;
      const formatted = validateVietnamesePrice(price);
      expect(formatted).toBe('590.000 VND');
    });

    it('should validate response format correctly', () => {
      const validResponse = {
        reply: 'Test reply',
        products: [{ id: '1', title: 'Test', price: 100000, description: 'Test' }]
      };
      
      const invalidResponse = {
        reply: '',
        products: 'not an array'
      };
      
      expect(validateResponseFormat(validResponse)).toBe(true);
      expect(validateResponseFormat(invalidResponse as any)).toBe(false);
    });

    it('should validate no hallucination correctly', () => {
      const availableProducts = testProducts;
      const validResponse = {
        reply: 'Test reply',
        products: [testProducts[0]]
      };
      
      const invalidResponse = {
        reply: 'Test reply',
        products: [{ id: 'fake_id', title: 'Fake Product', price: 100000, description: 'Fake' }]
      };
      
      expect(validateNoHallucination(validResponse, availableProducts)).toBe(true);
      expect(validateNoHallucination(invalidResponse, availableProducts)).toBe(false);
    });
  });

  describe('Test Data Quality', () => {
    it('should have diverse product data', () => {
      const prices = testProducts.map(p => p.price);
      const colors = testProducts.flatMap(p => p.colors || []);
      const sizes = testProducts.flatMap(p => p.sizes || []);
      const tags = testProducts.flatMap(p => p.tags || []);
      
      // Should have price variety
      expect(Math.max(...prices) - Math.min(...prices)).toBeGreaterThan(100000);
      
      // Should have color variety
      expect(new Set(colors).size).toBeGreaterThan(3);
      
      // Should have size variety
      expect(new Set(sizes).size).toBeGreaterThan(2);
      
      // Should have tag variety
      expect(new Set(tags).size).toBeGreaterThan(5);
    });

    it('should have proper Vietnamese product names', () => {
      const vietnameseProducts = testProducts.filter(product => 
        /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(product.title)
      );
      
      // At least 80% of products should have Vietnamese characters
      expect(vietnameseProducts.length / testProducts.length).toBeGreaterThan(0.8);
    });

    it('should have reasonable price ranges', () => {
      testProducts.forEach(product => {
        expect(product.price).toBeGreaterThan(50000); // Minimum 50k VND
        expect(product.price).toBeLessThan(2000000); // Maximum 2M VND
      });
    });
  });

  describe('Test Configuration', () => {
    it('should have proper test environment setup', () => {
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.PORT).toBe('3001');
      expect(process.env.QDRANT_URL).toBe('http://localhost:6333');
      expect(process.env.QDRANT_COLLECTION).toBe('test_products');
    });
  });
});
