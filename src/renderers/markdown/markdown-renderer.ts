import { SimpleRenderer } from '../../core/simple-renderer';
import { buildRendererConfig } from './functions/build-renderer-config';
import { resolveConfig } from './functions/resolve-config';
import type { MarkdownConfig } from './types/markdown-config';

/**
 * Renders an AST into Markdown text.
 *
 * Supports all standard Quill block types (paragraphs, headers, blockquotes,
 * code blocks, lists, images, video, horizontal rules) and inline marks
 * (bold, italic, strike, code, link, underline as HTML `<u>`, script as `<sub>`/`<sup>`).
 *
 * Markdown has no concept of inline styling, so color, background, font,
 * and size are silently ignored; underline and script are rendered as HTML `<u>`, `<sub>`, `<sup>`.
 *
 * The renderer is designed for extensibility — use `withBlock()` and
 * `withMark()` to add handlers for custom embed types (e.g. mentions,
 * link previews, formulas).
 *
 * @example
 * ```ts
 * const renderer = new MarkdownRenderer();
 * const md = renderer.render(ast);
 * ```
 *
 * @example
 * ```ts
 * // Customized output
 * const renderer = new MarkdownRenderer({
 *   bulletChar: '-',
 *   hrString: '---',
 *   fenceChar: '~~~',
 * });
 * ```
 *
 * @example
 * ```ts
 * // Extend with custom embed
 * const renderer = new MarkdownRenderer().withBlock('user_mention', (node) => {
 *   const data = node.data as Record<string, unknown>;
 *   return `[@${data.name}](#user_mention#${data.id})`;
 * });
 * ```
 */
export class MarkdownRenderer extends SimpleRenderer<string> {
  constructor(config?: MarkdownConfig) {
    const cfg = resolveConfig(config);
    super(buildRendererConfig(cfg));
  }

  // ─── SimpleRenderer Abstract Methods ─────────────────────────────────────

  protected joinChildren(children: string[]): string {
    return children.join('');
  }

  protected renderText(text: string): string {
    return text;
  }
}
