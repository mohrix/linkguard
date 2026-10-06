import type { AnalysisReport } from '../types';

// في production (Railway): VITE_API_URL يشير إلى backend URL
// في development: يمر عبر proxy /api إلى localhost:3000
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

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
    return fetch(`${BASE}/analyze`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url }),
    }).then(j<AnalysisReport>);
  },
  history() { return fetch(`${BASE}/history`).then(j<{ items: AnalysisReport[] }>); },
  get(id: string) { return fetch(`${BASE}/analysis/${id}`).then(j<AnalysisReport>); },
  stats() { return fetch(`${BASE}/stats`).then(j<any>); },
};
