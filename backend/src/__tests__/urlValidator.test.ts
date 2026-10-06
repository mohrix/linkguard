import { describe, it, expect } from 'vitest';
import { parseAndValidateUrl, UrlValidationError } from '../security/urlValidator.js';
describe('parseAndValidateUrl', () => {
  it('parses https', () => {
    const u = parseAndValidateUrl('https://example.com/path?x=1');
    expect(u.protocol).toBe('https'); expect(u.hostname).toBe('example.com'); expect(u.path).toBe('/path');
  });
  it('parses bare domain', () => expect(parseAndValidateUrl('example.com').hostname).toBe('example.com'));
  it('detects onion', () => expect(parseAndValidateUrl('http://example.onion').isOnion).toBe(true));
  it('rejects ftp', () => expect(() => parseAndValidateUrl('ftp://x.com')).toThrow(UrlValidationError));
  it('rejects empty', () => expect(() => parseAndValidateUrl('  ')).toThrow(UrlValidationError));
  it('handles hxxp', () => expect(parseAndValidateUrl('hxxp://example.com').protocol).toBe('http'));
});
