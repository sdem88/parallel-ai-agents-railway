# Parallel AI Agents - Railway Optimized

A multi-service AI agent framework optimized for deployment on Railway.

## Architecture

- **Frontend**: Next.js application for UI
- **Backend**: Node.js service for paper processing  
- **API Gateway**: FastAPI service with LiteLLM integration

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run all services in development
npm run dev
```

### Railway Deployment

1. Fork this repository
2. Connect to Railway
3. Add required environment variables:
   - `OPENAI_KEY`
   - `ANTHROPIC_KEY` 
   - `DEEPSEEK_API_KEY`
   - `LITELLM_MASTER_KEY`

Each service will deploy automatically with proper health checks and configurations.

## Services

### Frontend (Port 3000)
- Next.js 14
- Research paper insights UI
- Health check: `/api/health`

### Backend (Port 8080)
- Paper ingestion and processing
- OpenAI/Anthropic integration
- Health check: `/health`

### API Gateway (Port 4000)
- LiteLLM proxy
- Cost estimation
- Model management
- Health check: `/health`

## Environment Variables

See `.env.example` for all required variables.

## Railway Configuration

Each service includes a `railway.json` for automatic configuration.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

MIT