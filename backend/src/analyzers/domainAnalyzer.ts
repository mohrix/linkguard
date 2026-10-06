import type { AnalyzerResult, Finding } from '../types/analysis.js';
import type { ParsedUrl } from '../security/urlValidator.js';
const BRANDS = ['paypal','apple','google','microsoft','amazon','facebook','instagram','netflix','whatsapp','telegram','binance','coinbase','metamask','dhl','fedex','ups','usps','chase','wellsfargo','hsbc'];
const HOMO: Record<string, string> = { '0': 'o', '1': 'l', '3': 'e', '5': 's', '$': 's', '@': 'a' };
export function analyzeDomain(p: ParsedUrl): AnalyzerResult {
  const findings: Finding[] = [];
  let score = 0;
  const labels = p.hostname.split('.');
  const reg = labels.slice(-2).join('.');
  const sub = labels.slice(0, Math.max(0, labels.length - 2)).join('.');
  const tld = labels[labels.length - 1] ?? '';
  const subL = sub.toLowerCase();
  const regL = reg.toLowerCase();
  const brandInSub = BRANDS.find(b => subL.includes(b));
  const brandIsReg = BRANDS.find(b => regL === `${b}.${tld}`);
  if (brandInSub && !brandIsReg) {
    score += 30;
    findings.push({ category: 'domain', severity: 'high', title: 'Possible brand impersonation in subdomain', description: `Subdomain mentions "${brandInSub}" but registrable is "${reg}".`, evidence: p.hostname });
  }
  const lookalike = BRANDS.find(b => regL.includes(b) && !brandIsReg && regL !== `${b}.${tld}`);
  if (lookalike && !brandInSub) {
    score += 20;
    findings.push({ category: 'domain', severity: 'medium', title: 'Lookalike domain pattern', description: `Registrable "${reg}" contains brand token "${lookalike}".`, evidence: reg });
  }
  const stripped = regL.replace(/[^a-z0-9]/g, '');
  const norm = stripped.split('').map(c => HOMO[c] ?? c).join('');
  if (stripped !== norm && BRANDS.some(b => norm.includes(b))) {
    score += 25;
    findings.push({ category: 'domain', severity: 'high', title: 'Homograph / character substitution', description: 'Domain uses substitutions to mimic a brand.', evidence: reg });
  }
  score = Math.min(100, score);
  return {
    name: 'Domain Analyzer', score,
    status: score >= 60 ? 'danger' : score >= 25 ? 'warning' : 'safe',
    weight: 0.2, findings,
    metadata: { domain: p.hostname, registrableDomain: reg, subdomainCount: Math.max(0, labels.length - 2), hasHomograph: findings.some(f => f.title.toLowerCase().includes('homograph')), tld, isNewlyRegistered: null, ageDays: null }
  };
}
