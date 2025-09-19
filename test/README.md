# RAG Product Consultation System - Test Suite

This comprehensive test suite validates the entire RAG product consultation system using NestJS, Qdrant, and Gemini.

## Test Coverage

### ✅ Implemented Test Categories

| Category | Test File | Coverage | Status |
|----------|-----------|----------|---------|
| **A) Basic Discovery** | `basic-discovery.e2e-spec.ts` | A1-A5 | ✅ Complete |
| **B) Advanced Filtering** | `advanced-filtering.e2e-spec.ts` | B1-B4 | ✅ Complete |
| **H) Edge Cases** | `edge-cases.e2e-spec.ts` | H1-H4 | ✅ Complete |
| **I) Anti-Hallucination** | `anti-hallucination.e2e-spec.ts` | I1-I4 | ✅ Complete |
| **J) Performance** | `performance.performance-spec.ts` | J1-J5 | ✅ Complete |
| **K) Format & Display** | `format-display.e2e-spec.ts` | K1-K4 | ✅ Complete |

### 🔄 Additional Test Categories (Can be implemented)

| Category | Description | Priority |
|----------|-------------|----------|
| **C) Occasion & Style** | C1-C3: Wedding, office, casual contexts | Medium |
| **D) Comparison** | D1-D3: Product comparison and decision support | Medium |
| **E) FAQ & Policies** | E1-E3: Return policy, shipping, VAT | Low |
| **F) Multi-turn Chat** | F1-F3: Context preservation across conversations | High |
| **G) Image Analysis** | G1-G3: Vision-based product search | Medium |
| **L) Data Updates** | L1-L3: Real-time data synchronization | Low |

## Test Execution

### Prerequisites

1. **Application Running**: `pnpm run start:dev`
2. **Qdrant Running**: `docker compose up -d`
3. **Test Data Ingested**: Products loaded into Qdrant

### Running Tests

```bash
# Run all implemented tests
./test/run-tests.sh

# Run specific test categories
pnpm run test test/basic-discovery.e2e-spec.ts
pnpm run test test/advanced-filtering.e2e-spec.ts
pnpm run test test/edge-cases.e2e-spec.ts
pnpm run test test/anti-hallucination.e2e-spec.ts
pnpm run test test/format-display.e2e-spec.ts

# Run performance tests
pnpm run test:performance test/performance.performance-spec.ts

# Run with coverage
pnpm run test:cov
```

## Test Results Criteria

### ✅ Pass Criteria

- **Accuracy**: ≥80% of test cases provide reasonable suggestions
- **Latency**: P95 ≤4s for end-to-end requests
- **No Hallucination**: 100% of responses use only database data
- **Context Preservation**: ≥90% accuracy in multi-turn conversations
- **Stability**: No crashes during error conditions

### 📊 Performance Benchmarks

| Metric | Target | Test |
|--------|--------|------|
| P95 Latency | ≤4s | J1 |
| Concurrent Users | 5 users × 20 requests | J2 |
| Error Rate | ≤1% | J2 |
| Memory Usage | <100MB increase | J3 |
| Response Consistency | 100% | J5 |

## Test Data

### Sample Products
- 10 diverse products with various attributes
- Price range: 120k - 720k VND
- Sizes: S, M, L, XL
- Colors: đen, trắng, be, xanh navy, hồng nhạt, etc.
- Categories: đầm, áo sơ mi, quần tây, áo len, etc.

### Test Scenarios

#### A) Basic Discovery (A1-A5)
- Office dresses under 700k
- White long-sleeve shirts
- Elegant party dresses
- Breathable wide-leg pants
- Beach outfits

#### B) Advanced Filtering (B1-B4)
- Price range + color + size filtering
- Category + style + color filtering
- Size availability checking
- Color-specific queries

#### H) Edge Cases (H1-H4)
- No results found scenarios
- Vague requests requiring clarification
- Non-existent sizes
- Inappropriate product categories

#### I) Anti-Hallucination (I1-I4)
- FAQ information not in database
- Missing product links
- Prompt injection resistance
- Sensitive information protection

#### J) Performance (J1-J5)
- End-to-end latency testing
- Throughput under load
- Memory usage monitoring
- Error recovery testing
- Response consistency

#### K) Format & Display (K1-K4)
- Vietnamese price formatting
- Product link handling
- Description length limits
- Suggestion quantity control

## Test Utilities

### TestClient
- HTTP client for API testing
- Service readiness checking
- Product ingestion
- Chat and image analysis endpoints

### Validation Functions
- `validateVietnamesePrice()`: Price format validation
- `validateResponseFormat()`: Response structure validation
- `validateNoHallucination()`: Data integrity validation
- `measureResponseTime()`: Performance measurement

### Mock Data
- `testProducts`: 10 sample products
- `mockGeminiResponse`: AI response simulation
- `mockEmbeddingResponse`: Vector embedding simulation
- `mockQdrantSearchResponse`: Search result simulation

## Continuous Integration

### GitHub Actions (Recommended)
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: docker compose up -d
      - run: pnpm run start:dev &
      - run: sleep 10
      - run: ./test/run-tests.sh
```

## Troubleshooting

### Common Issues

1. **Service Not Ready**
   ```bash
   # Check if application is running
   curl http://localhost:3000/products/collection-info
   
   # Check if Qdrant is running
   curl http://localhost:6333/collections
   ```

2. **Test Timeouts**
   - Increase timeout in Jest configuration
   - Check network connectivity
   - Verify API key configuration

3. **Mock Failures**
   - Ensure test data is properly ingested
   - Check Qdrant collection status
   - Verify Gemini API key

### Debug Mode
```bash
# Run tests with debug output
pnpm run test:debug test/basic-discovery.e2e-spec.ts

# Run with verbose output
pnpm run test --verbose
```

## Test Maintenance

### Adding New Tests
1. Create test file in `test/` directory
2. Follow naming convention: `category.e2e-spec.ts`
3. Use existing test utilities and patterns
4. Update this README with new coverage

### Updating Test Data
1. Modify `testProducts` in `test-utils.ts`
2. Re-run ingestion tests
3. Update test expectations if needed

### Performance Monitoring
- Monitor test execution times
- Track memory usage trends
- Alert on performance regressions
- Update benchmarks as system improves

## Success Metrics

- **Test Coverage**: 100% of critical user journeys
- **Pass Rate**: 100% for all implemented tests
- **Performance**: All benchmarks met
- **Reliability**: No flaky tests
- **Maintainability**: Clear, readable test code

---

*This test suite ensures the RAG product consultation system meets production quality standards for accuracy, performance, and reliability.*
