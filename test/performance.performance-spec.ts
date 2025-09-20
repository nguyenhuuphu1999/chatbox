import { TestClient, testProducts, measureResponseTime } from './test-utils';

describe('J) Performance and Stability Tests', () => {
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

  describe('J1 - End-to-End Latency', () => {
    it('should respond within 4 seconds for 95% of requests', async () => {
      const testQueries = [
        'Đầm công sở đen',
        'Áo sơ mi trắng',
        'Quần tây xám',
        'Đầm dự tiệc',
        'Áo len mùa đông',
        'Chân váy chữ A',
        'Áo khoác blazer',
        'Quần jean skinny',
        'Đầm maxi hoa',
        'Áo thun basic'
      ];

      const responseTimes: number[] = [];
      const errors: any[] = [];

      // Test 100 random queries
      for (let i = 0; i < 100; i++) {
        const randomQuery = testQueries[Math.floor(Math.random() * testQueries.length)];
        
        try {
          const { time } = await measureResponseTime(() => client.chat(randomQuery));
          responseTimes.push(time);
        } catch (error) {
          errors.push(error);
        }
      }

      // Calculate p95 latency
      responseTimes.sort((a, b) => a - b);
      const p95Index = Math.floor(responseTimes.length * 0.95);
      const p95Latency = responseTimes[p95Index];

      console.log(`P95 Latency: ${p95Latency}ms`);
      console.log(`Average Latency: ${responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length}ms`);
      console.log(`Error Rate: ${(errors.length / 100) * 100}%`);

      // P95 should be <= 4000ms (4 seconds)
      expect(p95Latency).toBeLessThanOrEqual(4000);
      
      // Error rate should be <= 1%
      expect(errors.length).toBeLessThanOrEqual(1);
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10;
      const promises = [];

      const startTime = Date.now();

      // Send 10 concurrent requests
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(client.chat(`Đầm công sở ${i}`));
      }

      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.reply).toBeDefined();
      });

      // Total time should be reasonable (not 10x individual request time)
      expect(totalTime).toBeLessThan(20000); // 20 seconds for 10 concurrent requests
    });
  });

  describe('J2 - Throughput Testing', () => {
    it('should handle 5 concurrent users with 20 requests each', async () => {
      const numUsers = 5;
      const requestsPerUser = 20;
      const testQueries = [
        'Đầm công sở', 'Áo sơ mi', 'Quần tây', 'Đầm dự tiệc', 'Áo len'
      ];

      const userPromises = [];

      for (let user = 0; user < numUsers; user++) {
        const userRequests = [];
        
        for (let req = 0; req < requestsPerUser; req++) {
          const randomQuery = testQueries[Math.floor(Math.random() * testQueries.length)];
          userRequests.push(client.chat(`${randomQuery} user${user}`));
        }
        
        userPromises.push(Promise.all(userRequests));
      }

      const startTime = Date.now();
      const allUserResponses = await Promise.all(userPromises);
      const totalTime = Date.now() - startTime;

      // Count successful responses
      let successCount = 0;
      let errorCount = 0;

      allUserResponses.forEach(userResponses => {
        userResponses.forEach(response => {
          if (response.status === 200) {
            successCount++;
          } else {
            errorCount++;
          }
        });
      });

      const totalRequests = numUsers * requestsPerUser;
      const successRate = (successCount / totalRequests) * 100;
      const errorRate = (errorCount / totalRequests) * 100;

      console.log(`Total Requests: ${totalRequests}`);
      console.log(`Success Rate: ${successRate}%`);
      console.log(`Error Rate: ${errorRate}%`);
      console.log(`Total Time: ${totalTime}ms`);
      console.log(`Requests per second: ${(totalRequests / totalTime) * 1000}`);

      // Error rate should be <= 1%
      expect(errorRate).toBeLessThanOrEqual(1);
      
      // Should not timeout
      expect(totalTime).toBeLessThan(60000); // 1 minute max
    });
  });

  describe('J3 - Memory Usage', () => {
    it('should not have memory leaks during extended usage', async () => {
      const initialMemory = process.memoryUsage();
      
      // Make many requests to test for memory leaks
      for (let i = 0; i < 50; i++) {
        await client.chat(`Test request ${i}`);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      console.log(`Initial Memory: ${initialMemory.heapUsed / 1024 / 1024}MB`);
      console.log(`Final Memory: ${finalMemory.heapUsed / 1024 / 1024}MB`);
      console.log(`Memory Increase: ${memoryIncrease / 1024 / 1024}MB`);

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });

  describe('J4 - Error Recovery', () => {
    it('should recover gracefully from temporary service errors', async () => {
      // This test simulates temporary errors by making requests that might fail
      const problematicQueries = [
        '', // Empty query
        '!@#$%^&*()', // Special characters
        'A'.repeat(1000), // Very long query
        'Đồ không tồn tại xyz abc def' // Non-existent products
      ];

      const results = [];

      for (const query of problematicQueries) {
        try {
          const response = await client.chat(query);
          results.push({ query, success: true, status: response.status });
        } catch (error) {
          results.push({ query, success: false, error: error.message });
        }
      }

      // All requests should either succeed or fail gracefully
      results.forEach(result => {
        if (result.success) {
          expect(result.status).toBe(200);
        } else {
          // Should not crash the service
          expect(result.error).toBeDefined();
        }
      });

      // Service should still work after problematic requests
      const recoveryResponse = await client.chat('Đầm công sở');
      expect(recoveryResponse.status).toBe(200);
    });
  });

  describe('J5 - Response Consistency Under Load', () => {
    it('should maintain response quality under load', async () => {
      const testQuery = 'Đầm công sở đen';
      // const responses = [];

      // Make the same request multiple times under load
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(client.chat(testQuery));
      }

      const results = await Promise.all(promises);
      
      // All responses should be successful
      results.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data.reply).toBeDefined();
        expect(Array.isArray(response.data.products)).toBe(true);
      });

      // Check consistency of product IDs returned
      const firstResponseProductIds = results[0].data.products.map(p => p.id).sort();
      
      for (let i = 1; i < results.length; i++) {
        const currentProductIds = results[i].data.products.map(p => p.id).sort();
        // Should return the same products (allowing for some variation in order)
        expect(currentProductIds).toEqual(firstResponseProductIds);
      }
    });
  });

  describe('J6 - Database Performance', () => {
    it('should handle large product datasets efficiently', async () => {
      // Create a larger dataset for testing
      const largeProductSet = [];
      for (let i = 0; i < 100; i++) {
        largeProductSet.push({
          id: `test_${i}`,
          title: `Sản phẩm test ${i}`,
          price: 100000 + (i * 10000),
          description: `Mô tả sản phẩm test ${i} với nhiều từ khóa để test hiệu suất tìm kiếm`,
          tags: [`tag${i}`, 'test', 'performance'],
          colors: ['đỏ', 'xanh', 'vàng'],
          sizes: ['S', 'M', 'L']
        });
      }

      // Ingest large dataset
      const ingestStart = Date.now();
      await client.ingestProducts(largeProductSet);
      const ingestTime = Date.now() - ingestStart;

      console.log(`Ingest time for 100 products: ${ingestTime}ms`);

      // Test search performance on large dataset
      const searchStart = Date.now();
      const response = await client.chat('Sản phẩm test');
      const searchTime = Date.now() - searchStart;

      console.log(`Search time on large dataset: ${searchTime}ms`);

      expect(response.status).toBe(200);
      expect(response.data.products.length).toBeGreaterThan(0);
      
      // Search should still be fast even with large dataset
      expect(searchTime).toBeLessThan(2000); // 2 seconds max
    });
  });

  describe('J7 - Concurrent User Simulation', () => {
    it('should handle realistic user load patterns', async () => {
      const userSessions = [];
      const sessionQueries = [
        'Đầm công sở',
        'Đầm công sở đen',
        'Đầm công sở đen size M',
        'Đầm công sở đen size M dưới 600k'
      ];

      // Simulate 3 users with different session patterns
      for (let user = 0; user < 3; user++) {
        const userSession = [];
        
        for (let i = 0; i < sessionQueries.length; i++) {
          // Add some delay between requests to simulate real user behavior
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          const response = await client.chat(sessionQueries[i]);
          userSession.push(response);
        }
        
        userSessions.push(userSession);
      }

      // All sessions should complete successfully
      userSessions.forEach(session => {
        session.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.data.reply).toBeDefined();
        });
      });

      // Later queries in the session should show context awareness
      const lastSession = userSessions[0];
      const lastResponse = lastSession[lastSession.length - 1];
      
      // Should show refined results based on accumulated filters
      expect(lastResponse.data.products.length).toBeGreaterThan(0);
    });
  });
});
