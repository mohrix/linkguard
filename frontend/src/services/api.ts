import type { AnalysisReport } from '../types';
const BASE = '/api/v1';
async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let m = `HTTP ${res.status}`;
    try { const b = await res.json(); if (b?.error) m = b.error; } catch {}
    throw new Error(m);
  }
  return res.json() as Promise<T>;
}
export const api = {
  analyze(url: string) {
    return fetch(`${BASE}/analyze`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) }).then(j<AnalysisReport>);
  },
  history() { return fetch(`${BASE}/history`).then(j<{ items: AnalysisReport[] }>); },
  get(id: string) { return fetch(`${BASE}/analysis/${id}`).then(j<AnalysisReport>); },
  stats() { return fetch(`${BASE}/stats`).then(j<any>); }
};
