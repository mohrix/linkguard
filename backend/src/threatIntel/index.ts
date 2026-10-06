import type { ThreatIntelProvider } from './provider.js';
import { LocalProvider } from './localProvider.js';
export function getProviders(): ThreatIntelProvider[] {
  return [new LocalProvider()].filter(p => p.enabled);
}
