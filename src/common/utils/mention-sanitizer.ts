/**
 * Sanitized mention data structure.
 */
export interface SanitizedMention {
  name: string;
  target?: string;
  slug?: string;
  class?: string;
  'end-point'?: string;
}

/**
 * Sanitizes mention data from a Quill delta.
 *
 * Ensures all fields are strings and strips unexpected properties.
 * This is opt-in — call it before passing mention data to the renderer
 * if you want strict validation.
 *
 * @example
 * ```ts
 * const safe = sanitizeMention(rawMentionData);
 * if (safe) {
 *   // use safe.name, safe.slug, etc.
 * }
 * ```
 */
export function sanitizeMention(data: unknown): SanitizedMention | null {
  if (!data || typeof data !== 'object') return null;

  const obj = data as Record<string, unknown>;
  const name = typeof obj.name === 'string' ? obj.name : '';

  if (!name) return null;

  const result: SanitizedMention = { name };

  if (typeof obj.target === 'string' && obj.target) {
    result.target = obj.target;
  }
  if (typeof obj.slug === 'string' && obj.slug) {
    result.slug = obj.slug;
  }
  if (typeof obj.class === 'string' && obj.class) {
    result.class = obj.class;
  }
  if (typeof obj['end-point'] === 'string' && obj['end-point']) {
    result['end-point'] = obj['end-point'];
  }

  return result;
}
