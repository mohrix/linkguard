import type { FastifyReply, FastifyRequest } from 'fastify';
import { UrlValidationError } from '../security/urlValidator.js';
import { SsrfError } from '../security/ssrfGuard.js';
import { logger } from '../utils/logger.js';
export function errorHandler(err: Error, _req: FastifyRequest, reply: FastifyReply) {
  if (err instanceof UrlValidationError || err instanceof SsrfError)
    return reply.status(400).send({ error: err.message, code: (err as any).code });
  logger.error('unhandled', { err: err.message });
  return reply.status(500).send({ error: 'Internal server error' });
}
