import Scanner from '../components/Scanner';
const FEATURES = [
  { title: 'URL Intelligence', desc: 'Structure, length, keywords, TLD, encoding.' },
  { title: 'Phishing Detection', desc: 'Login forms, off-domain forms, brand impersonation.' },
  { title: 'Domain Analysis', desc: 'Subdomain abuse, homograph, lookalike.' },
  { title: 'TLS Analysis', desc: 'Certificate validity, issuer, expiration.' },
  { title: 'Security Headers', desc: 'CSP, HSTS, X-Frame-Options and more.' },
  { title: 'Threat Intelligence', desc: 'Pluggable providers (VirusTotal, URLhaus, …).' },
  { title: 'Tor / .onion', desc: 'Safe-mode awareness of onion services.' },
  { title: 'Explainable Scoring', desc: 'Weighted, transparent, deterministic.' }
];
const STEPS = [
  { n: 1, t: 'Paste URL', d: 'Paste any http/https link or .onion address.' },
  { n: 2, t: 'Analyze', d: 'Multiple analyzers run in a hardened sandbox.' },
  { n: 3, t: 'Understand Risk', d: 'Get a clear score and every contributing factor.' },
  { n: 4, t: 'Stay Safe', d: 'Decide before you click, log in, or pay.' }
];
export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-100">Check Any Link Before You Trust It.</h1>
        <p className="mt-2 text-lg text-primary" dir="rtl">افحص الرابط قبل أن تثق به.</p>
        <p className="mt-4 text-slate-400">Analyze websites, URLs and suspicious domains with multiple security signals.</p>
      </section>
      <section className="mt-10">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-lg shadow-black/30">
          <Scanner />
        </div>
      </section>
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-100 mb-6">How It Works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(s => (
            <div key={s.n} className="rounded-xl border border-border bg-card p-4">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary font-bold flex items-center justify-center">{s.n}</div>
              <h3 className="mt-3 font-medium text-slate-100">{s.t}</h3>
              <p className="text-sm text-slate-400 mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-100 mb-6">Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-medium text-slate-100">{f.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-14 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-slate-100">Built for Security Awareness</h2>
        <p className="mt-2 text-slate-400 max-w-3xl">LinkGuard is a defensive, educational analyzer. It never exploits targets, never bypasses protections, and never stores credentials, cookies, or sensitive query parameters.</p>
      </section>
      <footer className="mt-14 text-center text-xs text-slate-500">LinkGuard · Analyze Before You Trust · افحص قبل أن تثق</footer>
    </div>
  );
}
