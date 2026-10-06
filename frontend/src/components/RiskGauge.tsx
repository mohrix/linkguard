import type { Classification } from '../types';
import { classColor, riskBarColor } from '../utils/format';
export default function RiskGauge({ score, classification }: { score: number; classification: Classification }) {
  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-slate-500">Risk Score</div>
          <div className="text-4xl font-semibold text-slate-100">{score}<span className="text-slate-500 text-xl font-normal"> / 100</span></div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${classColor(classification)}`}>{classification.replace('_', ' ')}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
        <div className={`h-full ${riskBarColor(score)} transition-all duration-700`} style={{ width: `${Math.max(4, score)}%` }} />
      </div>
    </div>
  );
}
