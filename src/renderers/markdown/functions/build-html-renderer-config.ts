import type { TNode } from '../../../core/ast-types';
import { isEmbedNode } from '../../../core/ast-types';
import type { SimpleRendererConfig } from '../../../core/simple-renderer';
import type { ResolvedMarkdownConfig } from '../types/markdown-config';
import { buildRendererConfig } from './build-renderer-config';

function htmlEscape(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Build config for Markdown with HTML fallbacks: same as standard but underline
 * and script are rendered as HTML (`<u>`, `<sub>`, `<sup>`). Supports
 * embedAttributesHandler for attribute-only embed output.
 */
export function buildHtmlRendererConfig(cfg: ResolvedMarkdownConfig): SimpleRendererConfig<string> {
  const base = buildRendererConfig(cfg);
  return {
    ...base,
    onUnknownNode: (node: TNode) => {
      if (isEmbedNode(node)) {
        const custom = cfg.embedHandler?.(node);
        if (custom !== undefined) return custom;
        const attrs = cfg.embedAttributesHandler?.(node);
        if (attrs && typeof attrs === 'object' && Object.keys(attrs).length > 0) {
          const attrStr = Object.entries(attrs)
            .map(([k, v]) => `data-${k}="${htmlEscape(String(v))}"`)
            .join(' ');
          return `<embed data-embed-type="${htmlEscape(node.type)}" ${attrStr} />`;
        }
        return '';
      }
      return base.onUnknownNode?.(node);
    },
    marks: {
      ...base.marks,
      underline: (content) => `<u>${content}</u>`,
      script: (content, value) =>
        value === 'super' ? `<sup>${content}</sup>` : `<sub>${content}</sub>`,
    },
  };
}
