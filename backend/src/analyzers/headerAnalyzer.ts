import type { AnalyzerResult, Finding } from '../types/analysis.js';
import { safeFetch } from '../security/safeFetch.js';
const SEC = ['content-security-policy','strict-transport-security','x-content-type-options','x-frame-options','referrer-policy','permissions-policy'];
export async function analyzeHeaders(url: URL): Promise<AnalyzerResult> {
  const findings: Finding[] = [];
  let score = 0;
  let res;
  try { res = await safeFetch(url, { method: 'GET', maxBytes: 65536 }); }
  catch (e) {
    return {
      name: 'Header Analyzer', score: 0, status: 'unknown', weight: 0.15, findings: [],
      metadata: { status: null, server: null, contentType: null, headers: {}, present: [], missing: SEC, reachable: false, error: e instanceof Error ? e.message : 'fetch-error' }
    };
  }
  const h = res.headers;
  const present = SEC.filter(k => h[k]);
  const missing = SEC.filter(k => !h[k]);
  if (missing.length >= 4) {
    score += 15;
    findings.push({ category: 'headers', severity: 'low', title: 'Missing security headers', description: `Absent: ${missing.join(', ')}.` });
  } else if (missing.length >= 2) score += 6;
  if (!h['strict-transport-security']) {
    score += 6;
    findings.push({ category: 'headers', severity: 'low', title: 'No HSTS', description: 'Strict-Transport-Security header is missing.' });
  }
  if (res.status >= 500) score += 5;
  score = Math.min(100, score);
  return {
    name: 'Header Analyzer', score,
    status: score >= 60 ? 'danger' : score >= 25 ? 'warning' : 'safe',
    weight: 0.15, findings,
    metadata: { status: res.status, server: h['server'] ?? null, contentType: h['content-type'] ?? null, headers: { 'content-security-policy': h['content-security-policy'] ?? null, 'strict-transport-security': h['strict-transport-security'] ?? null, 'x-content-type-options': h['x-content-type-options'] ?? null, 'x-frame-options': h['x-frame-options'] ?? null, 'referrer-policy': h['referrer-policy'] ?? null }, present, missing, reachable: true, redirects: res.redirects, finalUrl: res.finalUrl }
  };
}
