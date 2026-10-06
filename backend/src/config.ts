import 'dotenv/config';
function num(v: string | undefined, f: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : f;
}
export const config = {
  port: num(process.env.PORT, 3000),
  host: process.env.HOST ?? '0.0.0.0',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  rateLimitMax: num(process.env.RATE_LIMIT_MAX, 30),
  rateLimitWindowMs: num(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  fetchTimeoutMs: num(process.env.FETCH_TIMEOUT_MS, 10000),
  fetchMaxBytes: num(process.env.FETCH_MAX_BYTES, 2097152),
  fetchMaxRedirects: num(process.env.FETCH_MAX_REDIRECTS, 5),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  dataDir: process.env.DATA_DIR ?? './data',
  threatIntel: {
    virusTotal: process.env.VIRUSTOTAL_API_KEY ?? '',
    googleSafeBrowsing: process.env.GOOGLE_SAFE_BROWSING_API_KEY ?? '',
    abuseIpDb: process.env.ABUSEIPDB_API_KEY ?? ''
  }
};
