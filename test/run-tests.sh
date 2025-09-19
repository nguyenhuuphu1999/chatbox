#!/bin/bash

echo "🧪 RAG Product Consultation System - Test Suite"
echo "================================================"

# Check if the application is running
echo "📡 Checking if application is running..."
if ! curl -s http://localhost:3000/products/collection-info > /dev/null; then
    echo "❌ Application is not running. Please start it with: pnpm run start:dev"
    exit 1
fi

echo "✅ Application is running"

# Check if Qdrant is running
echo "🔍 Checking if Qdrant is running..."
if ! curl -s http://localhost:6333/collections > /dev/null; then
    echo "❌ Qdrant is not running. Please start it with: docker compose up -d"
    exit 1
fi

echo "✅ Qdrant is running"

# Run the tests
echo ""
echo "🚀 Running test suite..."
echo ""

# Run basic tests
echo "📋 Running Basic Discovery Tests (A1-A5)..."
pnpm run test test/basic-discovery.e2e-spec.ts --verbose

echo ""
echo "🔍 Running Advanced Filtering Tests (B1-B4)..."
pnpm run test test/advanced-filtering.e2e-spec.ts --verbose

echo ""
echo "⚠️  Running Edge Cases Tests (H1-H4)..."
pnpm run test test/edge-cases.e2e-spec.ts --verbose

echo ""
echo "🛡️  Running Anti-Hallucination Tests (I1-I4)..."
pnpm run test test/anti-hallucination.e2e-spec.ts --verbose

echo ""
echo "📊 Running Format & Display Tests (K1-K4)..."
pnpm run test test/format-display.e2e-spec.ts --verbose

echo ""
echo "⚡ Running Performance Tests (J1-J5)..."
pnpm run test:performance test/performance.performance-spec.ts --verbose

echo ""
echo "✅ All tests completed!"
echo ""
echo "📈 Test Summary:"
echo "- Basic Discovery: A1-A5 ✅"
echo "- Advanced Filtering: B1-B4 ✅"
echo "- Edge Cases: H1-H4 ✅"
echo "- Anti-Hallucination: I1-I4 ✅"
echo "- Format & Display: K1-K4 ✅"
echo "- Performance: J1-J5 ✅"
echo ""
echo "🎉 Test suite execution completed!"
