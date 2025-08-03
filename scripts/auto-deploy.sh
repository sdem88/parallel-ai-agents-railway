#!/bin/bash
set -e

echo "🚀 Automated Railway Deployment Script"
echo "======================================"

# Check if RAILWAY_TOKEN is set
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ RAILWAY_TOKEN not set. Please set it first:"
    echo "export RAILWAY_TOKEN=your-railway-token"
    exit 1
fi

# Create project with Railway API
echo "📦 Creating Railway project..."

PROJECT_NAME="parallel-ai-agents-$(date +%s)"

# Create project using Railway API
PROJECT_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$PROJECT_NAME\"}" \
  https://backboard.railway.app/v1/projects)

PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.id')

if [ "$PROJECT_ID" == "null" ]; then
    echo "❌ Failed to create project"
    echo $PROJECT_RESPONSE
    exit 1
fi

echo "✅ Project created: $PROJECT_ID"

# Create services
echo "🔧 Creating services..."

# Frontend service
FRONTEND_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"name\": \"frontend\",
    \"source\": {
      \"type\": \"github\",
      \"repo\": \"sdem88/parallel-ai-agents-railway\",
      \"branch\": \"main\",
      \"rootDirectory\": \"services/frontend\"
    }
  }" \
  https://backboard.railway.app/v1/services)

# Backend service
BACKEND_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"name\": \"backend\",
    \"source\": {
      \"type\": \"github\",
      \"repo\": \"sdem88/parallel-ai-agents-railway\",
      \"branch\": \"main\",
      \"rootDirectory\": \"services/backend\"
    }
  }" \
  https://backboard.railway.app/v1/services)

# API Gateway service
GATEWAY_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"name\": \"api-gateway\",
    \"source\": {
      \"type\": \"github\",
      \"repo\": \"sdem88/parallel-ai-agents-railway\",
      \"branch\": \"main\",
      \"rootDirectory\": \"services/api-gateway\"
    }
  }" \
  https://backboard.railway.app/v1/services)

echo "✅ Services created"

# Set environment variables
echo "🔐 Setting environment variables..."

# Add your API keys here
cat > env-vars.json << EOF
{
  "OPENAI_KEY": "${OPENAI_KEY:-sk-...}",
  "ANTHROPIC_KEY": "${ANTHROPIC_KEY:-sk-ant-api03-...}",
  "DEEPSEEK_API_KEY": "${DEEPSEEK_API_KEY:-sk-...}",
  "LITELLM_MASTER_KEY": "${LITELLM_MASTER_KEY:-$(openssl rand -base64 32)}"
}
EOF

echo "✅ Deployment initiated!"
echo ""
echo "📌 Next steps:"
echo "1. Go to https://railway.app/projects/$PROJECT_ID"
echo "2. Add environment variables for each service"
echo "3. Services will deploy automatically"
echo ""
echo "🔗 Project URL: https://railway.app/projects/$PROJECT_ID"