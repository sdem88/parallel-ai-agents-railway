#!/bin/bash
set -e

echo "🚀 Automated Railway Deployment"
echo "=============================="
echo ""
echo "This script will deploy the project to Railway using the web interface"
echo ""

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "✅ Loaded production environment variables"
fi

# Generate deployment URL
DEPLOY_URL="https://railway.app/new/github/sdem88/parallel-ai-agents-railway"

echo "📋 Deployment Steps:"
echo ""
echo "1. Click the link below to deploy to Railway:"
echo "   ${DEPLOY_URL}"
echo ""
echo "2. Railway will automatically detect 3 services:"
echo "   - Frontend (Next.js)"
echo "   - Backend (Node.js)"
echo "   - API Gateway (Python/FastAPI)"
echo ""
echo "3. After deployment, add these environment variables:"
echo ""
echo "   FRONTEND:"
echo "   - No additional variables needed (uses Railway defaults)"
echo ""
echo "   BACKEND:"
echo "   - OPENAI_KEY=${OPENAI_KEY}"
echo "   - ANTHROPIC_KEY=${ANTHROPIC_KEY}"
echo "   - WATCH_MODE=true"
echo "   - NODE_ENV=production"
echo ""
echo "   API GATEWAY:"
echo "   - OPENAI_KEY=${OPENAI_KEY}"
echo "   - ANTHROPIC_KEY=${ANTHROPIC_KEY}"
echo "   - DEEPSEEK_API_KEY=${DEEPSEEK_API_KEY}"
echo "   - LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}"
echo ""
echo "4. Services will redeploy automatically after adding variables"
echo ""
echo "5. Check health endpoints:"
echo "   - Frontend: /api/health"
echo "   - Backend: /health"
echo "   - API Gateway: /health"
echo ""

# Open deployment URL
if command -v open &> /dev/null; then
    echo "Opening Railway deployment page..."
    open "${DEPLOY_URL}"
elif command -v xdg-open &> /dev/null; then
    xdg-open "${DEPLOY_URL}"
else
    echo "Please open this URL manually: ${DEPLOY_URL}"
fi

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "Repository: https://github.com/sdem88/parallel-ai-agents-railway"
echo "Documentation: https://github.com/sdem88/parallel-ai-agents-railway/blob/main/DEPLOY.md"