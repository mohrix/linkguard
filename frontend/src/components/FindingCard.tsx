import type { Finding } from '../types';
import { severityColor } from '../utils/format';
const ICON: Record<string, string> = { info: 'ℹ️', low: '🟦', medium: '🟧', high: '🟥', critical: '☠️' };
export default function FindingCard({ f }: { f: Finding }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="text-lg leading-none pt-0.5">{ICON[f.severity] ?? '•'}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-slate-100">{f.title}</h4>
            <span className={`text-xs uppercase tracking-wider ${severityColor(f.severity)}`}>{f.severity}</span>
            <span className="text-xs text-slate-500">· {f.category}</span>
          </div>
          <p className="text-sm text-slate-400 mt-1">{f.description}</p>
          {f.evidence && <pre className="mt-2 text-xs text-slate-500 bg-bg border border-border rounded-md px-2 py-1 overflow-x-auto whitespace-pre-wrap break-all">{f.evidence}</pre>}
        </div>
      </div>
    </div>
  );
}
