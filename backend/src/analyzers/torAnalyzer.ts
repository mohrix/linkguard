import type { AnalyzerResult } from '../types/analysis.js';
import type { ParsedUrl } from '../security/urlValidator.js';
export function analyzeTor(p: ParsedUrl): AnalyzerResult {
  if (!p.isOnion) {
    return { name: 'Tor Analyzer', score: 0, status: 'safe', weight: 0, findings: [], metadata: { isOnion: false } };
  }
  return {
    name: 'Tor Analyzer',
    score: 40,
    status: 'unknown',
    weight: 0.2,
    findings: [{ category: 'tor', severity: 'info', title: 'Onion service detected', description: 'Direct content analysis is unavailable in safe mode. UNKNOWN does not mean SAFE.', evidence: p.hostname }],
    metadata: { isOnion: true, address: p.hostname, type: 'Onion Service', reputation: 'unknown', threatIntel: 'no known reports' }
  };
}
