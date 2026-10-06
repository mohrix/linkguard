# LinkGuard

> **Analyze Before You Trust.**
> **افحص قبل أن تثق.**

AI-Powered Website & URL Security Analyzer — defensive, educational, deterministic.

## Features
- URL Analysis (structure, length, keywords, TLD, punycode)
- Domain Intelligence (subdomain abuse, lookalike, homograph)
- TLS / Certificate Inspection
- Security Headers Review
- Phishing Detection
- Tor / .onion awareness (safe mode)
- Threat Intelligence (pluggable)
- Weighted, transparent risk scoring

## Architecture

Frontend (React+Vite) ──/api/v1/*──► Backend (Fastify+TS)
                                       ├─ URL Validator + Zod
                                       ├─ SSRF Guard (DNS/IP/redirect)
                                       ├─ Safe Fetch (limits)
                                       ├─ Analyzers: URL/Domain/TLS/Headers/Phishing/Tor
                                       ├─ Risk Scorer (weighted)
                                       └─ Threat Intel Layer + JSON store

## Security Model
- Blocks private ranges, loopback, link-local, metadata endpoints
- DNS re-checked on every redirect hop (rebinding protection)
- Request timeout, response-size cap, redirect cap
- No cookies, no Authorization, no POST bodies stored
- Rate limiting + Helmet + CORS + Zod validation

## Quick Start (Termux / Linux / macOS)
```

npm install
npm run dev

```
Open http://localhost:5173

## API
- POST /api/v1/analyze
- GET  /api/v1/analysis/:id
- GET  /api/v1/history
- GET  /api/v1/stats
- GET  /api/v1/health
- POST /api/v1/report

## Risk Scoring
Weighted average. Default weights: URL 0.20, Domain 0.20, TLS 0.15, Headers 0.15, Phishing 0.20.
Classification: 0–20 SAFE · 21–40 LOW_RISK · 41–60 SUSPICIOUS · 61–80 HIGH_RISK · 81–100 CRITICAL · UNKNOWN for .onion.

## Testing
```

cd backend && npm test

```

## License
MIT — defensive / educational use only.
