import type { AnalyzerResult, Finding } from '../types/analysis.js';
import type { ParsedUrl } from '../security/urlValidator.js';
const KEYWORDS = ['login','signin','verify','account','update','secure','bank','paypal','wallet','confirm','password','recover','unlock','alert','urgent','reset','billing','invoice','payment','support','helpdesk','auth'];
const BAD_TLDS = new Set(['zip','mov','top','xyz','club','work','click','link','live','tk','ml','ga','cf','gq','icu','rest','cyou']);
export function analyzeUrl(p: ParsedUrl): AnalyzerResult {
  const findings: Finding[] = [];
  let score = 0;
  const { hostname, path, query, protocol, normalized } = p;
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':');
  if (isIp) {
    score += 30;
    findings.push({ category: 'url', severity: 'high', title: 'IP address used instead of a domain', description: 'Legitimate services rarely expose raw IPs in public links.', evidence: hostname });
  }
  const urlLen = normalized.length;
  if (urlLen > 200) {
    score += 15;
    findings.push({ category: 'url', severity: 'medium', title: 'Unusually long URL', description: `Length is ${urlLen} characters.`, evidence: `length=${urlLen}` });
  } else if (urlLen > 120) score += 6;
  const hay = (path + query).toLowerCase();
  const matched = KEYWORDS.filter(k => hay.includes(k));
  if (matched.length >= 3) {
    score += 12;
    findings.push({ category: 'url', severity: 'medium', title: 'Multiple credential-harvest keywords', description: 'URL contains several keywords used by phishing pages.', evidence: matched.join(', ') });
  } else if (matched.length >= 1) score += 4;
  const labels = hostname.split('.');
  const subCount = Math.max(0, labels.length - 2);
  if (subCount >= 4) {
    score += 15;
    findings.push({ category: 'url', severity: 'medium', title: 'Excessive subdomains', description: `Hostname has ${subCount} subdomain levels.`, evidence: hostname });
  } else if (subCount === 3) score += 5;
  if (p.raw.includes('@')) {
    score += 20;
    findings.push({ category: 'url', severity: 'high', title: '@ symbol in URL', description: 'An "@" can hide the real destination.', evidence: normalized });
  }
  const tld = labels[labels.length - 1] ?? '';
  if (BAD_TLDS.has(tld)) {
    score += 12;
    findings.push({ category: 'url', severity: 'medium', title: 'Suspicious top-level domain', description: `.${tld} has a higher-than-average abuse rate.`, evidence: tld });
  }
  const isPuny = hostname.startsWith('xn--') || hostname.includes('.xn--');
  if (isPuny) {
    score += 15;
    findings.push({ category: 'url', severity: 'medium', title: 'Punycode hostname', description: 'Punycode can create lookalike domains.', evidence: hostname });
  }
  if (protocol === 'http') {
    score += 8;
    findings.push({ category: 'url', severity: 'low', title: 'Unencrypted HTTP', description: 'Traffic over HTTP is not encrypted.' });
  }
  score = Math.min(100, score);
  return {
    name: 'URL Analyzer', score,
    status: score >= 60 ? 'danger' : score >= 25 ? 'warning' : 'safe',
    weight: 0.2, findings,
    metadata: { protocol, host: p.host, port: p.port, path, query, hash: p.hash, domain: labels.slice(-2).join('.'), subdomain: labels.slice(0, Math.max(0, labels.length - 2)).join('.'), tld, isIp, isPunycode: isPuny, length: urlLen }
  };
}
