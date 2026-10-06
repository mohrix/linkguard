export interface ThreatIntelQuery { url?: string; domain?: string; ip?: string; }
export interface ThreatIntelVerdict {
  provider: string;
  verdict: 'clean' | 'suspicious' | 'malicious' | 'unknown' | 'unavailable';
  details?: string;
  score?: number;
}
export interface ThreatIntelProvider {
  name: string;
  enabled: boolean;
  check(q: ThreatIntelQuery): Promise<ThreatIntelVerdict>;
}
