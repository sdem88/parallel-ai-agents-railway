# Railway Deployment Guide

## Prerequisites

1. Railway account: https://railway.app
2. API Keys:
   - OpenAI API Key
   - Anthropic API Key
   - Deepseek API Key
   - LiteLLM Master Key (generate secure random string)

## Deployment Steps

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new project
railway init
```

### 2. Connect GitHub Repository

1. Go to Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `sdem88/parallel-ai-agents-railway`
5. Railway will create 3 services automatically

### 3. Configure Services

Each service needs to be configured separately:

#### Frontend Service
1. Click on frontend service
2. Go to Settings → Domains
3. Generate domain or add custom domain
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   BACKEND_URL=http://${{backend.RAILWAY_PRIVATE_DOMAIN}}:8080
   API_GATEWAY_URL=http://${{api-gateway.RAILWAY_PRIVATE_DOMAIN}}:4000
   ```

#### Backend Service
1. Click on backend service
2. Add environment variables:
   ```
   OPENAI_KEY=sk-...
   ANTHROPIC_KEY=sk-ant-api03-...
   GATEWAY_URL=http://${{api-gateway.RAILWAY_PRIVATE_DOMAIN}}:4000
   WATCH_MODE=true
   ```
3. Add volume mount:
   - Mount path: `/app/docs`
   - Name: `research-insights`

#### API Gateway Service
1. Click on api-gateway service
2. Add environment variables:
   ```
   OPENAI_KEY=sk-...
   ANTHROPIC_KEY=sk-ant-api03-...
   DEEPSEEK_API_KEY=sk-...
   LITELLM_MASTER_KEY=your-secure-key-here
   GATEWAY_URL=http://0.0.0.0:4000
   ```

### 4. Add Additional Services

#### PostgreSQL (Optional)
```bash
railway add postgresql
```

#### Redis (Optional)
```bash
railway add redis
```

### 5. Deploy

Services will deploy automatically when connected to GitHub.

For manual deploy:
```bash
cd ~/parallel-ai-agents-railway
./scripts/deploy.sh
```

### 6. Verify Deployment

Check health endpoints:
- Frontend: `https://your-frontend-domain.railway.app/api/health`
- Backend: `https://your-backend-domain.railway.app/health`
- API Gateway: `https://your-api-gateway-domain.railway.app/health`

## Environment Variables Reference

### Required
- `OPENAI_KEY`: OpenAI API key
- `ANTHROPIC_KEY`: Anthropic API key
- `DEEPSEEK_API_KEY`: Deepseek API key
- `LITELLM_MASTER_KEY`: Secure master key for LiteLLM

### Optional
- `LOG_LEVEL`: Logging level (info, debug, error)
- `NODE_ENV`: Environment (production, staging)
- `RAILWAY_ENVIRONMENT`: Railway environment name

## Troubleshooting

### Service not starting
1. Check logs: `railway logs -s service-name`
2. Verify environment variables
3. Check health endpoint

### Connection issues between services
1. Use Railway private networking
2. Format: `http://service-name.railway.internal:PORT`
3. Ensure services are in same project

### Build failures
1. Check `railway.json` configuration
2. Verify package.json scripts
3. Check Nixpacks compatibility

## Support

- Railway Docs: https://docs.railway.app
- GitHub Issues: https://github.com/sdem88/parallel-ai-agents-railway/issues