/**
 * Default-safe protocols for URL sanitization.
 */
const DEFAULT_SAFE_PROTOCOLS = [
  'http:',
  'https:',
  'mailto:',
  'tel:',
  'ftp:',
  'ftps:',
  'data:image/',
];

/**
 * URL sanitizer config.
 */
export interface UrlSanitizerConfig {
  /** Additional protocols to allow beyond the defaults. */
  extraProtocols?: string[];
  /** Replace the default protocol whitelist entirely. */
  protocols?: string[];
}

/**
 * Creates a URL sanitizer function.
 *
 * The sanitizer checks the URL against a protocol whitelist.
 * Relative URLs (starting with `/`, `#`, or no protocol) are always allowed.
 * Returns `undefined` for unsafe URLs, or the original URL if safe.
 *
 * This is opt-in — not required by any renderer, but can be passed
 * as the `urlSanitizer` config option to `SemanticHtmlRenderer`.
 *
 * @example
 * ```ts
 * const sanitize = createUrlSanitizer();
 * sanitize('https://example.com'); // 'https://example.com'
 * sanitize('javascript:alert(1)'); // undefined
 * ```
 *
 * @example
 * ```ts
 * const renderer = new SemanticHtmlRenderer({
 *   urlSanitizer: createUrlSanitizer(),
 * });
 * ```
 */
export function createUrlSanitizer(
  config?: UrlSanitizerConfig,
): (url: string) => string | undefined {
  const protocols = config?.protocols ?? [
    ...DEFAULT_SAFE_PROTOCOLS,
    ...(config?.extraProtocols ?? []),
  ];

  return (url: string): string | undefined => {
    const trimmed = url.trim();

    // Relative URLs are always safe
    if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('?')) {
      return url;
    }

    // Check for protocol
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      // No protocol means it's relative (e.g. "page.html")
      return url;
    }

    // Check against whitelist
    const lower = trimmed.toLowerCase();
    for (const protocol of protocols) {
      if (lower.startsWith(protocol)) {
        return url;
      }
    }

    // Unsafe URL
    return undefined;
  };
}
