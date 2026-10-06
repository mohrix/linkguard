import type { Classification } from '../types';
export function classColor(c: Classification): string {
  switch (c) {
    case 'SAFE': return 'text-ok border-ok/40 bg-ok/10';
    case 'LOW_RISK': return 'text-primary border-primary/40 bg-primary/10';
    case 'SUSPICIOUS': return 'text-warn border-warn/40 bg-warn/10';
    case 'HIGH_RISK': return 'text-danger border-danger/40 bg-danger/10';
    case 'CRITICAL': return 'text-danger border-danger/60 bg-danger/20';
    default: return 'text-slate-300 border-slate-500/40 bg-slate-500/10';
  }
}
export function riskBarColor(s: number): string {
  if (s <= 20) return 'bg-ok';
  if (s <= 40) return 'bg-primary';
  if (s <= 60) return 'bg-warn';
  return 'bg-danger';
}
export function severityColor(s: string): string {
  if (s === 'critical' || s === 'high') return 'text-danger';
  if (s === 'medium') return 'text-warn';
  if (s === 'low') return 'text-primary';
  return 'text-slate-400';
}
export function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
