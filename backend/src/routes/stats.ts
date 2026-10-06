import type { FastifyInstance } from 'fastify';
import { db } from '../database/db.js';
export async function statsRoute(app: FastifyInstance) {
  app.get('/stats', async () => db.stats());
}
