import { describe, expect, it } from 'vitest';
import { createUrlSanitizer } from './url-sanitizer';

describe('createUrlSanitizer', () => {
  const sanitize = createUrlSanitizer();

  describe('safe URLs', () => {
    it('should allow http URLs', () => {
      expect(sanitize('http://example.com')).toBe('http://example.com');
    });

    it('should allow https URLs', () => {
      expect(sanitize('https://example.com')).toBe('https://example.com');
    });

    it('should allow mailto URLs', () => {
      expect(sanitize('mailto:test@example.com')).toBe('mailto:test@example.com');
    });

    it('should allow tel URLs', () => {
      expect(sanitize('tel:+1234567890')).toBe('tel:+1234567890');
    });

    it('should allow ftp URLs', () => {
      expect(sanitize('ftp://files.example.com')).toBe('ftp://files.example.com');
    });

    it('should allow data:image URLs', () => {
      expect(sanitize('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    });
  });

  describe('relative URLs', () => {
    it('should allow root-relative URLs', () => {
      expect(sanitize('/path/to/page')).toBe('/path/to/page');
    });

    it('should allow hash URLs', () => {
      expect(sanitize('#section')).toBe('#section');
    });

    it('should allow query string URLs', () => {
      expect(sanitize('?query=1')).toBe('?query=1');
    });

    it('should allow relative path URLs', () => {
      expect(sanitize('page.html')).toBe('page.html');
    });
  });

  describe('unsafe URLs', () => {
    it('should reject javascript: URLs', () => {
      expect(sanitize('javascript:alert(1)')).toBeUndefined();
    });

    it('should reject javascript: with mixed case', () => {
      expect(sanitize('JavaScript:alert(1)')).toBeUndefined();
    });

    it('should reject vbscript: URLs', () => {
      expect(sanitize('vbscript:something')).toBeUndefined();
    });

    it('should reject data:text URLs', () => {
      expect(sanitize('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    });
  });

  describe('config', () => {
    it('should allow extra protocols', () => {
      const custom = createUrlSanitizer({ extraProtocols: ['custom:'] });
      expect(custom('custom:something')).toBe('custom:something');
      expect(custom('https://ok')).toBe('https://ok');
    });

    it('should support replacing protocols entirely', () => {
      const strict = createUrlSanitizer({ protocols: ['https:'] });
      expect(strict('https://ok')).toBe('https://ok');
      expect(strict('http://nope')).toBeUndefined();
    });
  });
});
