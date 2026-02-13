import type { RendererConfig, TNode } from '../../../core/ast-types';
import { isEmbedNode } from '../../../core/ast-types';
import { escapeHtml } from '../../html/base-html-renderer';
import type { ResolvedMarkdownConfig } from '../types/markdown-config';
import type { MarkdownHtmlAttrs } from '../types/markdown-html-attrs';
import { buildRendererConfig } from './build-renderer-config';
import { serializeMarkdownHtmlAttrs } from './markdown-html-attrs';

/** Wrap content in a tag with optional collected attributor attrs (one span/tag). */
function tagWithAttrs(tag: string, content: string, attrs: MarkdownHtmlAttrs | undefined): string {
  const attrStr = attrs ? serializeMarkdownHtmlAttrs(attrs.attrs) : '';
  return attrStr ? `<${tag} ${attrStr}>${content}</${tag}>` : `<${tag}>${content}</${tag}>`;
}

/**
 * Build config for Markdown with HTML fallbacks. Underline and script are HTML
 * tags; color, background, font and size are **attributors** (like the HTML
 * renderers) so they merge into a single <span> tag. Supports embedAttributesHandler.
 */
export function buildHtmlRendererConfig(
  cfg: ResolvedMarkdownConfig,
): RendererConfig<string, MarkdownHtmlAttrs> {
  const base = buildRendererConfig(cfg);
  const {
    bold,
    italic,
    strike,
    code,
    link,
    underline,
    script,
    color: _color,
    background: _background,
    font: _font,
    size: _size,
    ...restMarks
  } = base.marks;

  return {
    blocks: base.blocks,
    nodeOverrides: base.nodeOverrides,
    onUnknownNode: (node: TNode) => {
      if (isEmbedNode(node)) {
        const custom = cfg.embedHandler?.(node);
        if (custom !== undefined) return custom;
        const attrs = cfg.embedAttributesHandler?.(node);
        if (attrs && typeof attrs === 'object' && Object.keys(attrs).length > 0) {
          const attrStr = Object.entries(attrs)
            .map(([k, v]) => `data-${k}="${escapeHtml(String(v))}"`)
            .join(' ');
          return `<embed data-embed-type="${escapeHtml(node.type)}" ${attrStr} />`;
        }
        return '';
      }
      return base.onUnknownNode?.(node);
    },
    attributors: {
      color: (value) =>
        value != null && value !== '' ? { attrs: { color: String(value).trim() } } : {},
      background: (value) =>
        value != null && value !== ''
          ? { attrs: { 'background-color': String(value).trim() } }
          : {},
      font: (value) =>
        value != null && value !== '' ? { attrs: { font: String(value).trim() } } : {},
      size: (value) =>
        value != null && value !== '' ? { attrs: { size: String(value).trim() } } : {},
    },
    marks: {
      ...restMarks,
      bold: (content, _v, _n, a) => tagWithAttrs('strong', content, a),
      italic: (content, _v, _n, a) => tagWithAttrs('em', content, a),
      strike: (content, _v, _n, a) => tagWithAttrs('s', content, a),
      code: (content, _v, _n, a) => tagWithAttrs('code', content, a),
      link: (content, value, _n, a) => {
        const href = String(value);
        const attrStr = a ? serializeMarkdownHtmlAttrs(a.attrs) : '';
        return attrStr
          ? `<a href="${escapeHtml(href)}" ${attrStr}>${content}</a>`
          : `<a href="${escapeHtml(href)}">${content}</a>`;
      },
      underline: (content, _v, _n, a) => tagWithAttrs('u', content, a),
      script: (content, value, _n, a) => {
        const tag = value === 'super' ? 'sup' : 'sub';
        return tagWithAttrs(tag, content, a);
      },
    },
  };
}
