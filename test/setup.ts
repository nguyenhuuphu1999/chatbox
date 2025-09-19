import 'reflect-metadata';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.PORT = '3001';
  process.env.QDRANT_URL = 'http://localhost:6333';
  process.env.QDRANT_COLLECTION = 'test_products';
  
  // Use a test API key (will be mocked in tests)
  if (!process.env.GOOGLE_API_KEY) {
    process.env.GOOGLE_API_KEY = 'test_api_key';
  }
});

afterAll(async () => {
  // Cleanup after all tests
});

// Global test timeout
jest.setTimeout(30000);
