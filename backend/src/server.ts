import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { analyzeRoute } from './routes/analyze.js';
import { healthRoute } from './routes/health.js';
import { statsRoute } from './routes/stats.js';
import { historyRoute } from './routes/history.js';
async function build() {
  const app = Fastify({ logger: false, trustProxy: false, bodyLimit: 32768, disableRequestLogging: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: config.corsOrigin.split(','), methods: ['GET', 'POST'], credentials: false });
  await app.register(rateLimit, { max: config.rateLimitMax, timeWindow: config.rateLimitWindowMs, ban: 0 });
  app.setErrorHandler(errorHandler);
  await app.register(async api => {
    await api.register(healthRoute);
    await api.register(analyzeRoute);
    await api.register(statsRoute);
    await api.register(historyRoute);
  }, { prefix: '/api/v1' });
  app.get('/', async () => ({
    name: 'LinkGuard API', version: '0.1.0',
    endpoints: ['POST /api/v1/analyze','GET /api/v1/analysis/:id','GET /api/v1/history','GET /api/v1/stats','GET /api/v1/health','POST /api/v1/report']
  }));
  return app;
}
async function main() {
  const app = await build();
  try {
    await app.listen({ port: config.port, host: config.host });
    logger.info('LinkGuard API listening', { port: config.port, host: config.host });
  } catch (err) { logger.error('failed', { err: String(err) }); process.exit(1); }
}
main();
