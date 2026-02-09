/**
 * Build an HTML attribute string from a key-value record.
 * Empty values are skipped. Returns a leading space if non-empty.
 */
export function buildAttrString(attrs: Record<string, string>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== '') {
      parts.push(`${key}="${value}"`);
    }
  }
  return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

/**
 * Build an HTML class attribute string from an array of class names.
 * Falsy/empty values are filtered. Returns a leading space if non-empty.
 */
export function buildClassAttr(classes: string[]): string {
  const filtered = classes.filter(Boolean);
  return filtered.length > 0 ? ` class="${filtered.join(' ')}"` : '';
}
