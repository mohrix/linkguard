import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import type { AnalysisReport } from '../types/analysis.js';
interface DB { analyses: AnalysisReport[]; reports: Array<{ id: string; analysisId: string; message: string; createdAt: string }>; }
const P = path.resolve(process.cwd(), config.dataDir, 'linkguard.json');
let cache: DB | null = null;
function load(): DB {
  if (cache) return cache;
  try {
    fs.mkdirSync(path.dirname(P), { recursive: true });
    cache = fs.existsSync(P) ? JSON.parse(fs.readFileSync(P, 'utf8')) : { analyses: [], reports: [] };
  } catch { cache = { analyses: [], reports: [] }; }
  return cache;
}
function save() { if (cache) try { fs.writeFileSync(P, JSON.stringify(cache, null, 2)); } catch {} }
export const db = {
  saveAnalysis(r: AnalysisReport) { const d = load(); d.analyses.push(r); if (d.analyses.length > 500) d.analyses.splice(0, d.analyses.length - 500); save(); },
  getAnalysis(id: string) { return load().analyses.find(a => a.id === id) ?? null; },
  listHistory(limit = 50) { return load().analyses.slice().sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, limit); },
  stats() {
    const d = load(); const byClass: Record<string, number> = {}; let tor = 0;
    const tlds: Record<string, number> = {};
    for (const a of d.analyses) { byClass[a.classification] = (byClass[a.classification] ?? 0) + 1; if (a.isTor) tor++; const t = a.host.split('.').pop() ?? ''; if (t) tlds[t] = (tlds[t] ?? 0) + 1; }
    return { total: d.analyses.length, byClass, tor, topTlds: Object.entries(tlds).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([tld, count]) => ({ tld, count })), reports: d.reports.length };
  },
  saveReport(r: { id: string; analysisId: string; message: string; createdAt: string }) { const d = load(); d.reports.push(r); save(); }
};
