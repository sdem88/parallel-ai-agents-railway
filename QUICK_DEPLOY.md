# Quick Deploy to Railway

## 1-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/github/sdem88/parallel-ai-agents-railway)

## Manual Deploy Steps

1. **Go to Railway**: https://railway.app/new

2. **Select "Deploy from GitHub repo"**

3. **Choose**: `sdem88/parallel-ai-agents-railway`

4. **Railway will detect 3 services automatically**

## Environment Variables

After deployment, add these to each service:

### Frontend
```
NEXT_PUBLIC_API_URL=${{RAILWAY_PUBLIC_DOMAIN}}
BACKEND_URL=http://backend.railway.internal:8080
API_GATEWAY_URL=http://api-gateway.railway.internal:4000
```

### Backend
```
OPENAI_KEY=your-key
ANTHROPIC_KEY=your-key
GATEWAY_URL=http://api-gateway.railway.internal:4000
WATCH_MODE=true
NODE_ENV=production
```

### API Gateway
```
OPENAI_KEY=your-key
ANTHROPIC_KEY=your-key
DEEPSEEK_API_KEY=your-key
LITELLM_MASTER_KEY=generate-random-string
GATEWAY_URL=http://0.0.0.0:4000
```

## Verify Deployment

Check health endpoints:
- Frontend: `https://[your-domain]/api/health`
- Backend: `https://[your-domain]/health`
- API Gateway: `https://[your-domain]/health`

## Support

Issues: https://github.com/sdem88/parallel-ai-agents-railway/issues