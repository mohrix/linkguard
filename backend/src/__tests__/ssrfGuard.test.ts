import { describe, it, expect } from 'vitest';
import { isBlockedIp, resolveAndCheck, SsrfError } from '../security/ssrfGuard.js';
describe('isBlockedIp', () => {
  it('blocks 127.0.0.1', () => expect(isBlockedIp('127.0.0.1')).toBe(true));
  it('blocks 10.x', () => expect(isBlockedIp('10.0.0.1')).toBe(true));
  it('blocks 192.168', () => expect(isBlockedIp('192.168.1.1')).toBe(true));
  it('blocks 172.16', () => expect(isBlockedIp('172.16.0.1')).toBe(true));
  it('blocks 169.254', () => expect(isBlockedIp('169.254.169.254')).toBe(true));
  it('blocks ::1', () => expect(isBlockedIp('::1')).toBe(true));
  it('allows 8.8.8.8', () => expect(isBlockedIp('8.8.8.8')).toBe(false));
});
describe('resolveAndCheck', () => {
  it('blocks localhost', async () => { await expect(resolveAndCheck('localhost')).rejects.toBeInstanceOf(SsrfError); });
  it('blocks 127.0.0.1', async () => { await expect(resolveAndCheck('127.0.0.1')).rejects.toBeInstanceOf(SsrfError); });
  it('blocks metadata', async () => { await expect(resolveAndCheck('metadata.google.internal')).rejects.toBeInstanceOf(SsrfError); });
  it('blocks .onion', async () => { await expect(resolveAndCheck('example.onion')).rejects.toBeInstanceOf(SsrfError); });
});
