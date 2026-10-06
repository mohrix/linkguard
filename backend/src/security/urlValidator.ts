import { z } from 'zod';
export interface ParsedUrl {
  raw: string; normalized: string; protocol: string; host: string;
  hostname: string; port: number | null; path: string; query: string;
  hash: string; isOnion: boolean;
}
const SUPPORTED = new Set(['http:', 'https:']);
export const AnalyzeBodySchema = z.object({ url: z.string().trim().min(1).max(2048) });
export class UrlValidationError extends Error {
  code: string;
  constructor(m: string, c: string) { super(m); this.name = 'UrlValidationError'; this.code = c; }
}
export function parseAndValidateUrl(input: string): ParsedUrl {
  const raw = input.trim();
  if (!raw) throw new UrlValidationError('Empty URL', 'EMPTY_URL');
  const pre = raw.replace(/^hxxp/i, 'http');
  let u: URL;
  try { u = new URL(pre.includes('://') ? pre : `http://${pre}`); }
  catch { throw new UrlValidationError('Invalid URL', 'INVALID_URL'); }
  if (!SUPPORTED.has(u.protocol))
    throw new UrlValidationError(`Unsupported protocol: ${u.protocol}`, 'UNSUPPORTED_PROTOCOL');
  const hostname = u.hostname.toLowerCase();
  if (!hostname || hostname.length > 253)
    throw new UrlValidationError('Invalid hostname', 'INVALID_HOSTNAME');
  if (hostname.includes('..') || hostname.startsWith('.') || hostname.endsWith('.'))
    throw new UrlValidationError('Malformed hostname', 'MALFORMED_HOSTNAME');
  return {
    raw, normalized: u.toString(), protocol: u.protocol.replace(':', ''),
    host: u.host, hostname, port: u.port ? Number(u.port) : null,
    path: u.pathname, query: u.search, hash: u.hash, isOnion: hostname.endsWith('.onion')
  };
}
