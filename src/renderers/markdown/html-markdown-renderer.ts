import type { BlockDescriptor, MarkHandler, SimpleTagMark, TNode } from '../../core/ast-types';
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

function isSimpleTagMark(m: unknown): m is SimpleTagMark {
  return typeof m === 'object' && m !== null && 'tag' in m;
}

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

  /**
   * Override so attributors (color, font, etc.) wrap outside element marks.
   * Element marks output Markdown (**bold**, _italic_, etc.); then we wrap
   * with <span color="..." ...> for a result like <span color="red">**text**</span>.
   */
  protected override renderTextNode(node: TNode): string {
    let output = this.renderText(typeof node.data === 'string' ? node.data : '');

    let collectedAttrs = this.emptyAttrs();
    for (const [attrName, attrValue] of Object.entries(node.attributes)) {
      const handler = this.attributors[attrName];
      if (handler) {
        const contribution = handler(attrValue, node);
        if (this.hasAttrs(contribution)) {
          collectedAttrs = this.hasAttrs(collectedAttrs)
            ? this.mergeAttrs(collectedAttrs, contribution)
            : contribution;
        }
      }
    }
    const hasCollected = this.hasAttrs(collectedAttrs);

    const elementMarks: Array<{
      mark: MarkHandler<string, MarkdownHtmlAttrs> | SimpleTagMark;
      value: unknown;
      priority: number;
    }> = [];
    for (const [attrName, attrValue] of Object.entries(node.attributes)) {
      const mark = this.marks[attrName];
      if (mark) {
        elementMarks.push({
          mark,
          value: attrValue,
          priority: this.markPriorities[attrName] ?? 0,
        });
      }
    }
    elementMarks.sort((a, b) => a.priority - b.priority);

    for (const { mark, value } of elementMarks) {
      if (isSimpleTagMark(mark)) {
        const tag = typeof mark.tag === 'function' ? mark.tag(value) : mark.tag;
        output = this.renderSimpleTag(tag, output, undefined);
      } else {
        output = (mark as MarkHandler<string, MarkdownHtmlAttrs>)(output, value, node, undefined);
      }
    }

    if (hasCollected) {
      output = this.wrapWithAttrs(output, collectedAttrs);
    }

    return output;
  }
}
