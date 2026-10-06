import tls from 'node:tls';
import type { AnalyzerResult, Finding } from '../types/analysis.js';
import type { ParsedUrl } from '../security/urlValidator.js';
import { resolveAndCheck, SsrfError } from '../security/ssrfGuard.js';
export async function analyzeTls(p: ParsedUrl): Promise<AnalyzerResult> {
  const findings: Finding[] = [];
  if (p.isOnion || p.protocol === 'http') {
    return {
      name: 'TLS Analyzer',
      score: p.protocol === 'http' ? 20 : 0,
      status: p.protocol === 'http' ? 'warning' : 'unknown',
      weight: 0.15,
      findings: p.protocol === 'http' ? [{ category: 'tls', severity: 'low', title: 'No TLS', description: 'Connection is not encrypted.' }] : [],
      metadata: { https: false, valid: null, issuer: null, validFrom: null, validTo: null, daysUntilExpiry: null, subject: null, error: p.isOnion ? 'onion — skipped' : 'http' }
    };
  }
  let ip: string;
  try { ip = (await resolveAndCheck(p.hostname)).ip; }
  catch (e) {
    return {
      name: 'TLS Analyzer', score: 0, status: 'unknown', weight: 0.15, findings: [],
      metadata: { https: true, valid: null, issuer: null, validFrom: null, validTo: null, daysUntilExpiry: null, subject: null, error: e instanceof SsrfError ? e.code : 'dns-failure' }
    };
  }
  return new Promise<AnalyzerResult>(resolve => {
    const port = p.port ?? 443;
    const socket = tls.connect({ host: ip, port, servername: p.hostname, rejectUnauthorized: false, timeout: 8000 }, () => {
      const cert = socket.getPeerCertificate();
      const authorized = socket.authorized;
      const authErr = socket.authorizationError;
      let days: number | null = null;
      if (cert?.valid_to) days = Math.round((new Date(cert.valid_to).getTime() - Date.now()) / 86400000);
      if (!authorized) findings.push({ category: 'tls', severity: 'high', title: 'Invalid TLS certificate', description: `Validation failed: ${String(authErr)}` });
      if (days !== null && days < 0) findings.push({ category: 'tls', severity: 'high', title: 'Certificate expired', description: `Expired ${-days} days ago.` });
      else if (days !== null && days < 14) findings.push({ category: 'tls', severity: 'medium', title: 'Certificate expiring soon', description: `Expires in ${days} days.` });
      const score = !authorized ? 60 : 0;
      socket.end();
      resolve({
        name: 'TLS Analyzer', score,
        status: score >= 60 ? 'danger' : findings.length ? 'warning' : 'safe',
        weight: 0.15, findings,
        metadata: { https: true, valid: authorized, issuer: cert?.issuer ? Object.values(cert.issuer).join(', ') : null, validFrom: cert?.valid_from ?? null, validTo: cert?.valid_to ?? null, daysUntilExpiry: days, subject: cert?.subject ? Object.values(cert.subject).join(', ') : null, error: authorized ? null : String(authErr ?? 'unknown') }
      });
    });
    socket.on('error', err => resolve({
      name: 'TLS Analyzer', score: 20, status: 'unknown', weight: 0.15, findings: [],
      metadata: { https: true, valid: null, issuer: null, validFrom: null, validTo: null, daysUntilExpiry: null, subject: null, error: err.message }
    }));
    socket.on('timeout', () => socket.destroy());
  });
}
