import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { AnalysisReport } from '../types';
import RiskGauge from '../components/RiskGauge';
import FindingCard from '../components/FindingCard';
import { fmtDate } from '../utils/format';
export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (id) api.get(id).then(setReport).catch(e => setError(e.message)); }, [id]);
  if (error) return <div className="mx-auto max-w-3xl p-6 text-danger">{error}</div>;
  if (!report) return <div className="mx-auto max-w-3xl p-6 text-slate-400">Loading…</div>;
  const tls = (report.tlsAnalysis ?? {}) as any;
  const dom = (report.domainAnalysis ?? {}) as any;
  const ua = (report.urlAnalysis ?? {}) as any;
  const hd = (report.headerAnalysis ?? {}) as any;
  const meta = (label: string, value: unknown) => (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 text-slate-100 break-all">{String(value ?? '—')}</div>
    </div>
  );
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Link to="/" className="text-sm text-slate-400 hover:text-white">← Back to Scanner</Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-100 break-all">{report.url}</h1>
          <div className="text-xs text-slate-500 mt-1">{fmtDate(report.timestamp)} · ID {report.id.slice(0, 8)} · Confidence {(report.confidence * 100).toFixed(0)}%</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigator.clipboard.writeText(JSON.stringify(report, null, 2))} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-slate-300 hover:text-white">Copy JSON</button>
          <button onClick={() => window.print()} className="rounded-lg bg-primary text-bg font-semibold px-3 py-2 text-sm hover:bg-cyan-400">Print / Save PDF</button>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <RiskGauge score={report.riskScore} classification={report.classification} />
        {report.isTor && <div className="mt-3 text-sm text-warn">⚠ Tor onion service detected. UNKNOWN does not mean SAFE.</div>}
      </div>
      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Security Overview</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {meta('HTTPS', tls.https ? 'Yes' : 'No')}
          {meta('Certificate', tls.valid === true ? 'Valid' : tls.valid === false ? 'Invalid' : 'Unknown')}
          {meta('Issuer', tls.issuer ?? '—')}
          {meta('Expires in', tls.daysUntilExpiry != null ? `${tls.daysUntilExpiry} days` : '—')}
          {meta('Registrable Domain', dom.registrableDomain ?? '—')}
          {meta('Subdomains', dom.subdomainCount ?? '—')}
          {meta('Protocol', ua.protocol ?? '—')}
          {meta('Server', hd.server ?? '—')}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Findings ({report.findings.length})</h2>
        {report.findings.length === 0
          ? <div className="rounded-xl border border-border bg-card p-4 text-slate-400">No risk factors detected.</div>
          : <div className="space-y-3">{report.findings.map((f, i) => <FindingCard key={i} f={f} />)}</div>}
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Analyzer Scores</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {report.analyzers.map(a => (
            <div key={a.name} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-100">{a.name}</span>
                <span className="text-slate-400 text-sm">{a.score}/100</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.max(2, a.score)}%` }} />
              </div>
              <div className="mt-2 text-xs text-slate-500">status: {a.status} · weight: {a.weight}</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Threat Intelligence</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {report.threatIntel.providers.map(p => (
            <div key={p.name} className="rounded-xl border border-border bg-card p-4">
              <div className="text-slate-100">{p.name}</div>
              <div className="text-sm text-slate-400 mt-1">verdict: {p.verdict}</div>
              {p.details && <div className="text-xs text-slate-500 mt-1">{p.details}</div>}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Technical Details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <pre className="rounded-xl border border-border bg-card p-4 text-xs text-slate-300 overflow-x-auto">{JSON.stringify({ urlAnalysis: report.urlAnalysis, domainAnalysis: report.domainAnalysis }, null, 2)}</pre>
          <pre className="rounded-xl border border-border bg-card p-4 text-xs text-slate-300 overflow-x-auto">{JSON.stringify({ tlsAnalysis: report.tlsAnalysis, headerAnalysis: report.headerAnalysis }, null, 2)}</pre>
        </div>
      </section>
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">Recommendations</h2>
        <ul className="list-disc pl-5 text-slate-300 space-y-1 text-sm">
          <li>Do not enter credentials on pages with brand impersonation or off-domain forms.</li>
          <li>Never trust links based on appearance alone — check the domain carefully.</li>
          <li>Treat .onion addresses as UNKNOWN — not as safe.</li>
          <li>If in doubt, close the page and reach the official site from a trusted source.</li>
        </ul>
      </section>
    </div>
  );
}
