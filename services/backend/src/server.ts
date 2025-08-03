import express from 'express';
import path from 'path';
import { PaperIngestor } from './ingestor';

const app = express();
const PORT = process.env.PORT || 8080;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    openai_configured: !!process.env.OPENAI_KEY,
    anthropic_configured: !!process.env.ANTHROPIC_KEY
  });
});

// Initialize paper ingestor
const watchPath = process.env.WATCH_PATH || path.join(process.cwd(), 'papers');
const outputPath = process.env.OUTPUT_PATH || path.join(process.cwd(), 'docs', 'research-insights.md');
const ingestor = new PaperIngestor(watchPath, outputPath);

// Start watching for papers
if (process.env.WATCH_MODE === 'true') {
  ingestor.watch();
  console.log(`Watching for papers in: ${watchPath}`);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Backend service running on port ${PORT}`);
});