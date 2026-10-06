import { promises as dns } from 'node:dns';
import net from 'node:net';
const BLOCKED = new Set(['localhost','localhost.localdomain','metadata.google.internal','metadata.google','instance-data']);
export class SsrfError extends Error {
  code: string;
  constructor(m: string, c: string) { super(m); this.name = 'SsrfError'; this.code = c; }
}
export function isBlockedIp(ip: string): boolean {
  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  const v = net.isIP(ip);
  if (v === 4) return blocked4(ip);
  if (v === 6) return blocked6(ip);
  return false;
}
function blocked4(ip: string): boolean {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;
  const [a,b] = p;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
}
function blocked6(ip: string): boolean {
  const l = ip.toLowerCase();
  if (l === '::1' || l === '::') return true;
  if (/^fe[89ab]/.test(l)) return true;
  if (l.startsWith('fc') || l.startsWith('fd')) return true;
  if (l.startsWith('ff')) return true;
  return false;
}
export interface ResolvedTarget { hostname: string; ip: string; family: 4 | 6; }
export async function resolveAndCheck(hostname: string): Promise<ResolvedTarget> {
  const lower = hostname.toLowerCase();
  if (BLOCKED.has(lower)) throw new SsrfError(`Blocked hostname: ${lower}`, 'BLOCKED_HOSTNAME');
  if (lower.endsWith('.local') || lower.endsWith('.internal') || lower.endsWith('.localhost'))
    throw new SsrfError(`Blocked internal hostname: ${lower}`, 'BLOCKED_HOSTNAME');
  if (net.isIP(lower)) {
    if (isBlockedIp(lower)) throw new SsrfError(`Blocked IP: ${lower}`, 'BLOCKED_IP');
    return { hostname: lower, ip: lower, family: net.isIP(lower) as 4 | 6 };
  }
  if (lower.endsWith('.onion'))
    throw new SsrfError('Onion addresses cannot be resolved on clearnet', 'ONION_NO_RESOLVE');
  let records: { address: string; family: number }[];
  try {
    records = (await Promise.race([
      dns.lookup(lower, { all: true, verbatim: false }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('DNS timeout')), 4000))
    ])) as any;
  } catch { throw new SsrfError(`DNS resolution failed for ${lower}`, 'DNS_FAILURE'); }
  if (!records || records.length === 0) throw new SsrfError(`No DNS records for ${lower}`, 'DNS_EMPTY');
  for (const r of records) {
    if (isBlockedIp(r.address))
      throw new SsrfError(`DNS points to blocked IP: ${r.address}`, 'BLOCKED_IP');
  }
  const first = records[0];
  return { hostname: lower, ip: first.address, family: first.family as 4 | 6 };
}
