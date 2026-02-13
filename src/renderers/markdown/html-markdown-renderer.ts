import { SimpleRenderer } from '../../core/simple-renderer';
import { buildHtmlRendererConfig } from './functions/build-html-renderer-config';
import { resolveConfig } from './functions/resolve-config';
import type { MarkdownConfig } from './types/markdown-config';

/**
 * Markdown renderer that uses HTML for formats with no standard Markdown syntax.
 * Same blocks and standard marks as {@link MarkdownRenderer}, plus:
 *
 * - **Underline** → `<u>...</u>`
 * - **Script (subscript)** → `<sub>...</sub>`
 * - **Script (superscript)** → `<sup>...</sup>`
 *
 * Use when the output is rendered by a Markdown processor that allows inline
 * HTML (e.g. GitHub Flavored Markdown, CommonMark). Use {@link MarkdownRenderer}
 * for strict standard Markdown only.
 *
 * @example
 * ```ts
 * const renderer = new HtmlMarkdownRenderer();
 * const md = renderer.render(ast);
 * // Underline and script appear as <u>, <sub>, <sup>
 * ```
 */
export class HtmlMarkdownRenderer extends SimpleRenderer<string> {
  constructor(config?: MarkdownConfig) {
    const cfg = resolveConfig(config);
    super(buildHtmlRendererConfig(cfg));
  }

  protected joinChildren(children: string[]): string {
    return children.join('');
  }

  protected renderText(text: string): string {
    return text;
  }
}
