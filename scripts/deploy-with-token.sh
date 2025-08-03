#!/bin/bash
set -e

echo "🚀 Railway Deployment with Token"
echo "================================"

# Set Railway token from provided API key
export RAILWAY_TOKEN="ddb369a4-2885-4f11-ab02-c2ef14821d85"

# Create new project
echo "📦 Creating Railway project..."
cd ~/parallel-ai-agents-railway

# Initialize Railway project
railway init --name "parallel-ai-agents-prod" <<EOF
1
EOF

echo "✅ Project initialized"

# Link and deploy services
echo "🔧 Deploying services..."

# Deploy frontend
echo "Deploying frontend..."
cd services/frontend
railway link parallel-ai-agents-prod
railway service create frontend
railway up -d

# Deploy backend
echo "Deploying backend..."
cd ../backend
railway service create backend
railway up -d

# Deploy API Gateway
echo "Deploying API Gateway..."
cd ../api-gateway
railway service create api-gateway
railway up -d

cd ../../

echo "✅ All services deployed!"
echo ""
echo "📌 Next steps:"
echo "1. Go to https://railway.app/dashboard"
echo "2. Find your project 'parallel-ai-agents-prod'"
echo "3. Add environment variables to each service"
echo ""
echo "Required environment variables:"
echo "- OPENAI_KEY"
echo "- ANTHROPIC_KEY"
echo "- DEEPSEEK_API_KEY"
echo "- LITELLM_MASTER_KEY"