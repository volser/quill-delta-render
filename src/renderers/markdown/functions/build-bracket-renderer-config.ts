import type { TNode } from '../../../core/ast-types';
import { isEmbedNode } from '../../../core/ast-types';
import type { SimpleRendererConfig } from '../../../core/simple-renderer';
import type { ResolvedMarkdownConfig } from '../types/markdown-config';
import { buildRendererConfig } from './build-renderer-config';

/** Build opening [STYLE attr=value ...] tag. Values are stringified; avoid ] in values. */
function styleTag(attrs: Record<string, string | boolean>): string {
  const parts = Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== '' && v !== false)
    .map(([k, v]) => `${k}=${v === true ? 'true' : String(v)}`);
  return parts.length ? `[STYLE ${parts.join(' ')}]` : '';
}

/**
 * Build config for bracket markdown ([STYLE] and other [TAG]...[/TAG] formats).
 * Same as standard but underline, script, color, background, font and size are
 * rendered as [STYLE attr=value ...]content[/STYLE]. Supports embedAttributesHandler
 * for attribute-only embed output as a self-closing tag [EMBED type=... attr=val ... /].
 * The "type" attribute is always the embed node type; handler provides the rest.
 */
export function buildBracketRendererConfig(
  cfg: ResolvedMarkdownConfig,
): SimpleRendererConfig<string> {
  const base = buildRendererConfig(cfg);
  return {
    ...base,
    onUnknownNode: (node: TNode) => {
      if (isEmbedNode(node)) {
        const custom = cfg.embedHandler?.(node);
        if (custom !== undefined) return custom;
        const attrs = cfg.embedAttributesHandler?.(node);
        if (attrs && typeof attrs === 'object') {
          const { type: _reserved, ...rest } = attrs;
          const merged = { type: node.type, ...rest };
          const attrStr = Object.entries(merged)
            .filter(([, v]) => v !== undefined && v !== '')
            .map(([k, v]) => `${k}=${String(v)}`)
            .join(' ');
          return `[EMBED ${attrStr} /]`;
        }
        return '';
      }
      return base.onUnknownNode?.(node);
    },
    marks: {
      ...base.marks,
      underline: (content) => {
        const open = styleTag({ underline: true });
        return open ? `${open}${content}[/STYLE]` : content;
      },
      script: (content, value) => {
        const attrs = value === 'super' ? { sup: true } : { sub: true };
        const open = styleTag(attrs);
        return open ? `${open}${content}[/STYLE]` : content;
      },
      color: (content, value) => {
        if (value == null || value === '') return content;
        const open = styleTag({ color: String(value) });
        return `${open}${content}[/STYLE]`;
      },
      background: (content, value) => {
        if (value == null || value === '') return content;
        const open = styleTag({ bg: String(value) });
        return `${open}${content}[/STYLE]`;
      },
      font: (content, value) => {
        if (value == null || value === '') return content;
        const open = styleTag({ font: String(value) });
        return `${open}${content}[/STYLE]`;
      },
      size: (content, value) => {
        if (value == null || value === '') return content;
        const open = styleTag({ size: String(value) });
        return `${open}${content}[/STYLE]`;
      },
    },
  };
}
