import { describe, it, expect } from 'vitest';
import { computeRisk } from '../services/riskScorer.js';
import type { AnalyzerResult } from '../types/analysis.js';
function mk(name: string, score: number, weight: number, status: AnalyzerResult['status'] = 'safe'): AnalyzerResult {
  return { name, score, weight, status, findings: [], metadata: {} };
}
describe('computeRisk', () => {
  it('low => SAFE', () => {
    const r = computeRisk([mk('a', 5, 0.5), mk('b', 10, 0.5)], false);
    expect(r.classification).toBe('SAFE');
  });
  it('high => HIGH_RISK', () => {
    const r = computeRisk([mk('a', 70, 0.5, 'danger'), mk('b', 90, 0.5, 'danger')], false);
    expect(r.classification).toBe('HIGH_RISK');
  });
  it('tor => UNKNOWN', () => expect(computeRisk([mk('a', 40, 0.2)], true).classification).toBe('UNKNOWN'));
  it('critical', () => expect(computeRisk([mk('a', 95, 1, 'danger')], false).classification).toBe('CRITICAL'));
});
