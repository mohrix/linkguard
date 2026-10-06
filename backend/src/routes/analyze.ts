import type { FastifyInstance } from 'fastify';
import { AnalyzeBodySchema } from '../security/urlValidator.js';
import { runAnalysis } from '../services/analysisEngine.js';
import { db } from '../database/db.js';
export async function analyzeRoute(app: FastifyInstance) {
  app.post('/analyze', async (req, reply) => {
    const p = AnalyzeBodySchema.safeParse(req.body);
    if (!p.success) return reply.status(400).send({ error: 'Invalid body', code: 'BAD_BODY' });
    const report = await runAnalysis(p.data.url);
    db.saveAnalysis(report);
    return report;
  });
}
