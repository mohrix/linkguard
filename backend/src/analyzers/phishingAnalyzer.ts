import type { AnalyzerResult, Finding } from '../types/analysis.js';
import type { ParsedUrl } from '../security/urlValidator.js';
import { safeFetch } from '../security/safeFetch.js';
const HINTS = ['type="password"','name="password"','id="password"','sign in','signin','log in','login'];
const BRANDS = ['paypal','apple','google','microsoft','amazon','facebook','instagram','netflix','whatsapp','binance','coinbase','metamask'];
export async function analyzePhishing(p: ParsedUrl): Promise<AnalyzerResult> {
  const findings: Finding[] = [];
  let score = 0;
  if (p.isOnion) return { name: 'Phishing Analyzer', score: 0, status: 'unknown', weight: 0.2, findings: [], metadata: { skipped: true, reason: 'onion' } };
  let res;
  try { res = await safeFetch(new URL(p.normalized), { method: 'GET', maxBytes: 524288 }); }
  catch { return { name: 'Phishing Analyzer', score: 0, status: 'unknown', weight: 0.2, findings: [], metadata: { skipped: true, reason: 'unreachable' } }; }
  const html = res.bodyText;
  const lower = html.toLowerCase();
  const signals = HINTS.filter(s => lower.includes(s));
  if (signals.length >= 2) {
    score += 25;
    findings.push({ category: 'phishing', severity: 'medium', title: 'Login form detected', description: 'Page contains fields commonly used for credential entry.', evidence: signals.slice(0, 3).join(', ') });
  }
  const host = p.hostname.toLowerCase();
  const brandMention = BRANDS.find(b => lower.includes(b));
  const brandInHost = BRANDS.find(b => host.includes(b));
  if (brandMention && !brandInHost) {
    score += 30;
    findings.push({ category: 'phishing', severity: 'high', title: 'Off-domain brand impersonation', description: `Page mentions "${brandMention}" but host is "${host}".`, evidence: brandMention });
  }
  const formMatch = /<form[^>]+action=["'](https?:\/\/[^"']+)["']/i.exec(html);
  if (formMatch) {
    try {
      const a = new URL(formMatch[1], p.normalized);
      if (a.hostname !== host) {
        score += 20;
        findings.push({ category: 'phishing', severity: 'high', title: 'Form submits to external domain', description: `Form action → ${a.hostname}.`, evidence: a.hostname });
      }
    } catch {}
  }
  if (/<iframe[^>]*(display\s*:\s*none|visibility\s*:\s*hidden)/i.test(html)) {
    score += 15;
    findings.push({ category: 'phishing', severity: 'medium', title: 'Hidden iframe', description: 'Hidden iframe found.' });
  }
  const obf = [/eval\s*\(\s*atob/i, /document\.write\s*\(\s*unescape/i, /fromCharCode\s*\(\s*\d+/i];
  if (obf.some(r => r.test(html))) {
    score += 15;
    findings.push({ category: 'phishing', severity: 'medium', title: 'Obfuscated JavaScript', description: 'Common obfuscation patterns found.' });
  }
  score = Math.min(100, score);
  return {
    name: 'Phishing Analyzer', score,
    status: score >= 60 ? 'danger' : score >= 25 ? 'warning' : 'safe',
    weight: 0.2, findings,
    metadata: { htmlBytes: res.bytes, status: res.status, loginSignals: signals.length, brandMentioned: brandMention ?? null, brandInHost: brandInHost ?? null }
  };
}
