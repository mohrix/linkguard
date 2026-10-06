import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
const EX = [
  { label: 'Safe', value: 'https://example.com' },
  { label: 'Google', value: 'https://google.com' },
  { label: 'Login page', value: 'https://example.com/login' },
  { label: 'Onion', value: 'http://example.onion' }
];
export default function Scanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const nav = useNavigate();
  const steps = ['Analyzing URL...','Checking domain...','Inspecting TLS...','Checking reputation...','Analyzing phishing indicators...','Calculating risk...'];
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setError(null); setLoading(true); setStep(0);
    const timer = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 550);
    try {
      const r = await api.analyze(url.trim());
      nav(`/result/${r.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : 'Analysis failed'); }
    finally { clearInterval(timer); setLoading(false); }
  }
  async function onPaste() {
    try { const t = await navigator.clipboard.readText(); if (t) setUrl(t.trim()); }
    catch { setError('Clipboard access denied'); }
  }
  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text" inputMode="url" autoComplete="off" spellCheck={false}
          aria-label="URL to analyze" value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 rounded-lg bg-card border border-border px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-primary focus:outline-none"
        />
        <button type="button" onClick={onPaste} className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-slate-300 hover:text-white hover:border-primary/60">Paste</button>
        <button type="submit" disabled={loading || !url.trim()} className="rounded-lg bg-primary text-bg font-semibold px-5 py-3 hover:bg-cyan-400 disabled:opacity-50">
          {loading ? 'Scanning…' : 'Analyze URL'}
        </button>
      </form>
      {error && <div className="mt-3 rounded-lg border border-danger/40 bg-danger/10 text-danger px-3 py-2 text-sm">{error}</div>}
      {loading && (
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>{steps[step]}</span><span>{step + 1}/{steps.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-border overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 py-1.5 mr-1">Quick examples:</span>
        {EX.map(x => (
          <button key={x.value} type="button" onClick={() => setUrl(x.value)}
            className="text-xs rounded-full border border-border bg-card px-3 py-1.5 text-slate-300 hover:border-primary/60 hover:text-white">{x.label}</button>
        ))}
      </div>
    </div>
  );
}
