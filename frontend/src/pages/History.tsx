import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { AnalysisReport, Classification } from '../types';
import { classColor, fmtDate } from '../utils/format';
const FILTERS: Array<{ label: string; value: 'ALL' | Classification | 'TOR' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Safe', value: 'SAFE' },
  { label: 'Suspicious', value: 'SUSPICIOUS' },
  { label: 'Dangerous', value: 'HIGH_RISK' },
  { label: 'Tor', value: 'TOR' }
];
export default function History() {
  const [items, setItems] = useState<AnalysisReport[]>([]);
  const [filter, setFilter] = useState<'ALL' | Classification | 'TOR'>('ALL');
  const [q, setQ] = useState('');
  useEffect(() => { api.history().then(r => setItems(r.items)).catch(() => setItems([])); }, []);
  const filtered = useMemo(() => {
    let out = items;
    if (filter === 'TOR') out = out.filter(i => i.isTor);
    else if (filter !== 'ALL') out = out.filter(i => i.classification === filter);
    if (q.trim()) { const s = q.trim().toLowerCase(); out = out.filter(i => i.url.toLowerCase().includes(s) || i.host.toLowerCase().includes(s)); }
    return out;
  }, [items, filter, q]);
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-100">History</h1>
      <p className="text-slate-400 mt-1 text-sm">Locally-stored analyses.</p>
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search host or URL…"
          className="flex-1 rounded-lg bg-card border border-border px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none" />
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`text-xs rounded-full border px-3 py-1.5 ${filter === f.value ? 'border-primary/60 text-primary bg-primary/10' : 'border-border bg-card text-slate-300 hover:text-white'}`}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {filtered.length === 0 && <div className="rounded-xl border border-border bg-card p-6 text-slate-400 text-sm">No analyses yet.</div>}
        {filtered.map(item => (
          <Link key={item.id} to={`/result/${item.id}`} className="block rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="text-slate-100 truncate">{item.url}</div>
                <div className="text-xs text-slate-500 mt-1">{fmtDate(item.timestamp)}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-sm">{item.riskScore}/100</span>
                <span className={`px-2 py-1 rounded-full text-xs border ${classColor(item.classification)}`}>{item.classification.replace('_', ' ')}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
