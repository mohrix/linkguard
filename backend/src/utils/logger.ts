import { config } from '../config.js';
type L = 'debug' | 'info' | 'warn' | 'error';
const ord: Record<L, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const cur = ord[config.logLevel as L] ?? 20;
function log(level: L, msg: string, meta?: Record<string, unknown>) {
  if (ord[level] < cur) return;
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...(meta ?? {}) });
  (level === 'error' ? process.stderr : process.stdout).write(line + '\n');
}
export const logger = {
  debug: (m: string, x?: Record<string, unknown>) => log('debug', m, x),
  info: (m: string, x?: Record<string, unknown>) => log('info', m, x),
  warn: (m: string, x?: Record<string, unknown>) => log('warn', m, x),
  error: (m: string, x?: Record<string, unknown>) => log('error', m, x)
};
