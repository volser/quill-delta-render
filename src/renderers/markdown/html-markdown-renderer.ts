import type { BlockDescriptor, TNode } from '../../core/ast-types';
import { BaseRenderer } from '../../core/base-renderer';
import { buildHtmlRendererConfig } from './functions/build-html-renderer-config';
import {
  emptyMarkdownHtmlAttrs,
  hasMarkdownHtmlAttrs,
  mergeMarkdownHtmlAttrs,
  serializeMarkdownHtmlAttrs,
} from './functions/markdown-html-attrs';
import { resolveConfig } from './functions/resolve-config';
import type { MarkdownConfig } from './types/markdown-config';
import type { MarkdownHtmlAttrs } from './types/markdown-html-attrs';

/**
 * Markdown renderer that uses HTML for formats with no standard Markdown syntax.
 * Same blocks and standard marks as {@link MarkdownRenderer}, plus:
 *
 * - **Underline** → `<u>...</u>`
 * - **Script (subscript)** → `<sub>...</sub>`
 * - **Script (superscript)** → `<sup>...</sup>`
 * - **Color, background, font, size** → single `<span color="..." ...>` with all attributes
 *
 * Use when the output is rendered by a Markdown processor that allows inline
 * HTML (e.g. GitHub Flavored Markdown, CommonMark). Use {@link MarkdownRenderer}
 * for strict standard Markdown only.
 *
 * @example
 * ```ts
 * const renderer = new HtmlMarkdownRenderer();
 * const md = renderer.render(ast);
 * // Underline and script appear as <u>, <sub>, <sup>; color/font etc. in one <span>
 * ```
 */
export class HtmlMarkdownRenderer extends BaseRenderer<string, MarkdownHtmlAttrs> {
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

  protected emptyAttrs(): MarkdownHtmlAttrs {
    return emptyMarkdownHtmlAttrs();
  }

  protected mergeAttrs(target: MarkdownHtmlAttrs, source: MarkdownHtmlAttrs): MarkdownHtmlAttrs {
    return mergeMarkdownHtmlAttrs(target, source);
  }

  protected hasAttrs(attrs: MarkdownHtmlAttrs): boolean {
    return hasMarkdownHtmlAttrs(attrs);
  }

  protected wrapWithAttrs(content: string, attrs: MarkdownHtmlAttrs): string {
    const attrStr = serializeMarkdownHtmlAttrs(attrs.attrs);
    return attrStr ? `<span ${attrStr}>${content}</span>` : content;
  }

  protected renderSimpleTag(
    tag: string,
    content: string,
    collectedAttrs?: MarkdownHtmlAttrs,
  ): string {
    const attrStr = collectedAttrs ? serializeMarkdownHtmlAttrs(collectedAttrs.attrs) : '';
    return attrStr ? `<${tag} ${attrStr}>${content}</${tag}>` : `<${tag}>${content}</${tag}>`;
  }

  protected renderBlockFromDescriptor(
    _descriptor: BlockDescriptor,
    _node: TNode,
    childrenOutput: string,
    _resolvedAttrs: MarkdownHtmlAttrs,
  ): string {
    return childrenOutput;
  }
}
