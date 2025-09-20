#!/bin/bash

echo "🚀 Starting PostgreSQL and Qdrant for development..."

# Start databases
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for databases to be ready..."

# Wait for PostgreSQL
echo "Waiting for PostgreSQL..."
until docker exec chatbox-postgres pg_isready -U postgres; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Wait for Qdrant
echo "Waiting for Qdrant..."
until curl -f http://localhost:6333/readyz > /dev/null 2>&1; do
  echo "Qdrant is unavailable - sleeping"
  sleep 2
done
echo "✅ Qdrant is ready!"

echo "🎉 All databases are ready!"
echo "📊 PostgreSQL: localhost:5432"
echo "🔍 Qdrant: localhost:6333"
