import { Agent, request } from 'undici';
import { config } from '../config.js';
import { resolveAndCheck } from './ssrfGuard.js';
export interface SafeFetchResult {
  status: number; headers: Record<string, string>; bodyText: string;
  bytes: number; finalUrl: string; redirects: number; elapsedMs: number;
}
const agent = new Agent({
  connect: { timeout: 8000 },
  headersTimeout: config.fetchTimeoutMs,
  bodyTimeout: config.fetchTimeoutMs,
  keepAliveTimeout: 1000,
  keepAliveMaxTimeout: 5000
});
async function readLimited(body: NodeJS.ReadableStream, maxBytes: number) {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of body as AsyncIterable<Buffer | string>) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > maxBytes) { chunks.push(buf.subarray(0, buf.length - (total - maxBytes))); break; }
    chunks.push(buf);
  }
  return { text: Buffer.concat(chunks).toString('utf8'), bytes: total };
}
export interface SafeFetchOptions {
  method?: 'GET' | 'HEAD'; maxBytes?: number; timeoutMs?: number;
  maxRedirects?: number; userAgent?: string;
}
export async function safeFetch(url: URL, opts: SafeFetchOptions = {}): Promise<SafeFetchResult> {
  const method = opts.method ?? 'GET';
  const maxBytes = opts.maxBytes ?? config.fetchMaxBytes;
  const timeoutMs = opts.timeoutMs ?? config.fetchTimeoutMs;
  const maxRedirects = opts.maxRedirects ?? config.fetchMaxRedirects;
  const userAgent = opts.userAgent ?? 'LinkGuard/0.1 (+https://linkguard.local)';
  const started = Date.now();
  let current = url;
  let redirects = 0;
  while (true) {
    await resolveAndCheck(current.hostname);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    let res;
    try {
      res = await request(current, {
        method, dispatcher: agent, maxRedirections: 0,
        headers: {
          'user-agent': userAgent,
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5',
          'accept-language': 'en-US,en;q=0.8',
          'accept-encoding': 'identity'
        },
        signal: controller.signal
      });
    } finally { clearTimeout(t); }
    const status = res.statusCode;
    const headers: Record<string, string> = {};
    for (const [k, v] of Object.entries(res.headers)) {
      headers[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v ?? '');
    }
    if (status >= 300 && status < 400 && headers.location) {
      if (redirects >= maxRedirects) {
        await readLimited(res.body, 1024).catch(() => undefined);
        throw new Error(`Too many redirects (>${maxRedirects})`);
      }
      await readLimited(res.body, 1024).catch(() => undefined);
      current = new URL(headers.location, current);
      redirects++;
      continue;
    }
    const { text, bytes } = await readLimited(res.body, maxBytes);
    return {
      status, headers, bodyText: text, bytes,
      finalUrl: current.toString(), redirects, elapsedMs: Date.now() - started
    };
  }
}
