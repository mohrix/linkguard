import { randomUUID } from 'node:crypto';
import type { AnalyzerResult, AnalysisReport, Finding } from '../types/analysis.js';
import { parseAndValidateUrl } from '../security/urlValidator.js';
import { analyzeUrl } from '../analyzers/urlAnalyzer.js';
import { analyzeDomain } from '../analyzers/domainAnalyzer.js';
import { analyzeTls } from '../analyzers/tlsAnalyzer.js';
import { analyzeHeaders } from '../analyzers/headerAnalyzer.js';
import { analyzePhishing } from '../analyzers/phishingAnalyzer.js';
import { analyzeTor } from '../analyzers/torAnalyzer.js';
import { computeRisk } from './riskScorer.js';
import { getProviders } from '../threatIntel/index.js';
import type { ThreatIntelVerdict } from '../threatIntel/provider.js';
import { logger } from '../utils/logger.js';

export async function runAnalysis(rawUrl: string): Promise<AnalysisReport> {
  const parsed = parseAndValidateUrl(rawUrl);
  const id = randomUUID();

  const analyzers: AnalyzerResult[] = [];
  analyzers.push(analyzeUrl(parsed));
  analyzers.push(analyzeDomain(parsed));
  analyzers.push(analyzeTor(parsed));

  if (!parsed.isOnion) {
    analyzers.push(await analyzeTls(parsed));
    try {
      analyzers.push(await analyzeHeaders(new URL(parsed.normalized)));
    } catch (e) {
      logger.debug('header analyzer failed', { err: String(e) });
    }
    analyzers.push(await analyzePhishing(parsed));
  }

  const providers = getProviders();
  const intel: ThreatIntelVerdict[] = await Promise.all(
    providers.map((p) =>
      p.check({ url: parsed.normalized, domain: parsed.hostname }).catch(
        (): ThreatIntelVerdict => ({
          provider: p.name,
          verdict: 'unavailable',
          details: 'Provider error',
        })
      )
    )
  );

  const malicious = intel.find((r) => r.verdict === 'malicious');
  if (malicious) {
    analyzers.push({
      name: 'Threat Intelligence',
      score: 90,
      status: 'danger',
      weight: 0.3,
      findings: [
        {
          category: 'threat-intel',
          severity: 'critical',
          title: `Malicious hit: ${malicious.provider}`,
          description: malicious.details ?? 'Reported as malicious.',
        },
      ],
      metadata: { providers: intel },
    });
  }

  const { riskScore, classification, confidence } = computeRisk(analyzers, parsed.isOnion);
  const findings: Finding[] = analyzers.flatMap((a) => a.findings);

  const pick = (n: string) =>
    (analyzers.find((a) => a.name === n)?.metadata ?? null) as Record<string, unknown> | null;

  return {
    id,
    url: parsed.normalized,
    host: parsed.hostname,
    riskScore,
    classification,
    confidence,
    isTor: parsed.isOnion,
    findings,
    urlAnalysis: pick('URL Analyzer'),
    domainAnalysis: pick('Domain Analyzer'),
    tlsAnalysis: pick('TLS Analyzer'),
    headerAnalysis: pick('Header Analyzer'),
    torAnalysis: pick('Tor Analyzer'),
    analyzers: analyzers.map((a) => ({ name: a.name, score: a.score, status: a.status, weight: a.weight })),
    threatIntel: {
      providers: intel.map((r) => ({ name: r.provider, verdict: r.verdict, details: r.details })),
    },
    timestamp: new Date().toISOString(),
  };
}
