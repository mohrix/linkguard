export type Classification = 'SAFE' | 'LOW_RISK' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL' | 'UNKNOWN';
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export interface Finding { category: string; severity: Severity; title: string; description: string; evidence?: string; }
export interface AnalyzerSummary { name: string; score: number; status: 'safe'|'warning'|'danger'|'unknown'; weight: number; }
export interface AnalysisReport {
  id: string; url: string; host: string; riskScore: number;
  classification: Classification; confidence: number; isTor: boolean;
  findings: Finding[];
  urlAnalysis: Record<string, unknown> | null;
  domainAnalysis: Record<string, unknown> | null;
  tlsAnalysis: Record<string, unknown> | null;
  headerAnalysis: Record<string, unknown> | null;
  torAnalysis: Record<string, unknown> | null;
  analyzers: AnalyzerSummary[];
  threatIntel: { providers: Array<{ name: string; verdict: string; details?: string }> };
  timestamp: string;
}
