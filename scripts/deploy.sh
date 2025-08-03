#!/bin/bash
set -e

echo "🚀 Starting Railway deployment..."

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install: npm install -g @railway/cli"
    exit 1
fi

# Check authentication
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building services..."
npm run build:frontend || echo "Frontend build skipped"
npm run build:backend || echo "Backend build skipped"

echo "🚄 Deploying to Railway..."

# Deploy each service
echo "Deploying frontend..."
cd services/frontend && railway up -d && cd ../..

echo "Deploying backend..."
cd services/backend && railway up -d && cd ../..

echo "Deploying API Gateway..."
cd services/api-gateway && railway up -d && cd ../..

echo "✅ Deployment complete!"
railway status || true