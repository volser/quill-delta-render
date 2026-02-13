/**
 * Collected attributes for HTML markdown inline spans (color, background, font, size).
 * Used so multiple formats merge into one <span> tag instead of nested spans.
 * @internal
 */
export interface MarkdownHtmlAttrs {
  attrs?: Record<string, string>;
}
