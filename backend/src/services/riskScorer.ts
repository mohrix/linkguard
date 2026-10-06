import type { AnalyzerResult, Classification } from '../types/analysis.js';
export interface ScoredResult { riskScore: number; classification: Classification; confidence: number; }
export function computeRisk(analyzers: AnalyzerResult[], isTor: boolean): ScoredResult {
  const active = analyzers.filter(a => a.weight > 0);
  const total = active.reduce((s, a) => s + a.weight, 0);
  if (total === 0) return { riskScore: 0, classification: 'SAFE', confidence: 0.5 };
  const weighted = active.reduce((s, a) => s + a.score * a.weight, 0) / total;
  const riskScore = Math.round(Math.max(0, Math.min(100, weighted)));
  let classification: Classification;
  if (riskScore <= 20) classification = 'SAFE';
  else if (riskScore <= 40) classification = 'LOW_RISK';
  else if (riskScore <= 60) classification = 'SUSPICIOUS';
  else if (riskScore <= 80) classification = 'HIGH_RISK';
  else classification = 'CRITICAL';
  const unknown = active.filter(a => a.status === 'unknown').length;
  let confidence = 0.95 - (unknown / active.length) * 0.4;
  if (isTor) { classification = 'UNKNOWN'; confidence = 0.3; }
  confidence = Math.max(0.1, Math.min(0.99, Number(confidence.toFixed(2))));
  return { riskScore, classification, confidence };
}
