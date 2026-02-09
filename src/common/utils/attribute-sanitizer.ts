/**
 * Validates a CSS color value.
 *
 * Accepts hex colors (`#fff`, `#ffffff`), named colors (`red`, `transparent`),
 * and CSS color functions (`rgb(...)`, `rgba(...)`, `hsl(...)`, `hsla(...)`).
 */
export function isValidColor(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;

  // Hex color
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)) return true;

  // Named colors (common subset + transparent + inherit)
  if (/^[a-zA-Z]+$/.test(v)) return true;

  // rgb/rgba/hsl/hsla functions
  if (/^(rgb|rgba|hsl|hsla)\([\d\s,%.]+\)$/.test(v)) return true;

  return false;
}

/**
 * Validates a CSS color literal (named color only, no hex or functions).
 * Used specifically for `allowBackgroundClasses` — only named colors
 * should be used as CSS class names.
 */
export function isValidColorLiteral(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return /^[a-zA-Z]+$/.test(value.trim());
}

/**
 * Validates a CSS font-family value.
 * Allows letters, spaces, hyphens, and commas.
 */
export function isValidFontFamily(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return /^[a-zA-Z\s,'-]+$/.test(value.trim());
}

/**
 * Validates a CSS size value.
 * Accepts common size keywords (small, large, huge, etc.)
 * and numeric values with units (px, em, rem, %, pt).
 */
export function isValidSize(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim();

  // Size keywords
  if (
    ['small', 'large', 'huge', 'normal', 'x-small', 'x-large', 'xx-small', 'xx-large'].includes(v)
  ) {
    return true;
  }

  // Numeric with unit
  if (/^\d+(\.\d+)?(px|em|rem|%|pt|ex|ch|vw|vh|vmin|vmax)$/.test(v)) return true;

  return false;
}

/**
 * Validates a CSS width value.
 * Accepts numeric values with units (px, em, rem, %, auto).
 */
export function isValidWidth(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const v = value.trim();

  if (v === 'auto') return true;
  if (/^\d+(\.\d+)?(px|em|rem|%|pt)?$/.test(v)) return true;

  return false;
}
