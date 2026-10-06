import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../database/db.js';
const LQ = z.object({ limit: z.coerce.number().min(1).max(200).optional() });
export async function historyRoute(app: FastifyInstance) {
  app.get('/history', async (req, reply) => {
    const q = LQ.safeParse(req.query);
    if (!q.success) return reply.status(400).send({ error: 'Invalid query' });
    return { items: db.listHistory(q.data.limit ?? 50) };
  });
  app.get('/analysis/:id', async (req, reply) => {
    const p = z.object({ id: z.string().min(1) }).safeParse(req.params);
    if (!p.success) return reply.status(400).send({ error: 'Invalid id' });
    const f = db.getAnalysis(p.data.id);
    if (!f) return reply.status(404).send({ error: 'Not found' });
    return f;
  });
  app.post('/report', async (req, reply) => {
    const B = z.object({ analysisId: z.string().min(1), message: z.string().min(1).max(2000) });
    const p = B.safeParse(req.body);
    if (!p.success) return reply.status(400).send({ error: 'Invalid body' });
    if (!db.getAnalysis(p.data.analysisId)) return reply.status(404).send({ error: 'Analysis not found' });
    const id = Math.random().toString(36).slice(2);
    db.saveReport({ id, analysisId: p.data.analysisId, message: p.data.message, createdAt: new Date().toISOString() });
    return { id, ok: true };
  });
}
