import { describe, expect, it } from 'vitest';
import { sanitizeMention } from './mention-sanitizer';

describe('sanitizeMention', () => {
  it('should sanitize valid mention data', () => {
    const result = sanitizeMention({
      name: 'John',
      slug: 'john',
      'end-point': '/users',
      class: 'mention-link',
      target: '_blank',
    });
    expect(result).toEqual({
      name: 'John',
      slug: 'john',
      'end-point': '/users',
      class: 'mention-link',
      target: '_blank',
    });
  });

  it('should return null for null input', () => {
    expect(sanitizeMention(null)).toBeNull();
  });

  it('should return null for non-object input', () => {
    expect(sanitizeMention('string')).toBeNull();
    expect(sanitizeMention(123)).toBeNull();
  });

  it('should return null when name is missing', () => {
    expect(sanitizeMention({ slug: 'john' })).toBeNull();
  });

  it('should return null when name is empty', () => {
    expect(sanitizeMention({ name: '' })).toBeNull();
  });

  it('should strip non-string fields', () => {
    const result = sanitizeMention({
      name: 'John',
      slug: 123,
      target: true,
    });
    expect(result).toEqual({ name: 'John' });
  });

  it('should strip empty string fields', () => {
    const result = sanitizeMention({
      name: 'John',
      slug: '',
      target: '',
    });
    expect(result).toEqual({ name: 'John' });
  });

  it('should only include known fields', () => {
    const result = sanitizeMention({
      name: 'John',
      slug: 'john',
      unknownField: 'hack',
    });
    expect(result).toEqual({ name: 'John', slug: 'john' });
    expect(result).not.toHaveProperty('unknownField');
  });
});
