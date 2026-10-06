import type { ThreatIntelProvider, ThreatIntelQuery, ThreatIntelVerdict } from './provider.js';
const BLOCK = new Set(['malware.test', 'phishing.test']);
export class LocalProvider implements ThreatIntelProvider {
  name = 'Local Blocklist';
  enabled = true;
  async check(q: ThreatIntelQuery): Promise<ThreatIntelVerdict> {
    const t = (q.domain ?? q.url ?? '').toLowerCase();
    if (!t) return { provider: this.name, verdict: 'unknown' };
    const host = t.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
    if (BLOCK.has(host)) return { provider: this.name, verdict: 'malicious', details: 'Matched local blocklist', score: 90 };
    return { provider: this.name, verdict: 'clean', score: 0 };
  }
}
