import { type ComponentType, createElement, type ReactNode } from 'react';
import { DEFAULT_MARK_PRIORITIES } from '../../../common/default-mark-priorities';
import type { RendererConfig, TNode } from '../../../core/ast-types';
import {
  boldMark,
  codeMark,
  italicMark,
  scriptMark,
  strikeMark,
  underlineMark,
} from '../../html/common/simple-marks';
import type { BlockComponentProps, ResolvedReactConfig } from '../types/react-config';
import type { ReactProps } from '../types/react-props';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * If a custom component is registered for the given block type, render it.
 * Otherwise return `undefined` to fall through to the default element.
 */
function tryCustomComponent(
  cfg: ResolvedReactConfig,
  type: string,
  node: TNode,
  children: ReactNode,
  extraProps?: Record<string, unknown>,
): ReactNode | undefined {
  const Component: ComponentType<BlockComponentProps> | undefined = cfg.components[type];
  if (!Component) return undefined;

  return createElement(Component, { node, children, ...extraProps });
}

/**
 * Resolve the tag name for a block, checking customTag first.
 */
function resolveTag(
  cfg: ResolvedReactConfig,
  format: string,
  node: TNode,
  defaultTag: string,
): string {
  return cfg.customTag?.(format, node) ?? defaultTag;
}

// ─── Builder ────────────────────────────────────────────────────────────────

/**
 * Build a full `RendererConfig<ReactNode, ReactProps>` from the resolved config.
 *
 * Defines all block handlers (paragraph, header, blockquote, code-block,
 * list, list-item, table, image, video, formula, mention) and mark handlers
 * (bold, italic, underline, strike, link, script, code, font, size).
 *
 * Marks reuse the framework-agnostic `SimpleTagMark` descriptors from
 * `html/common/simple-marks.ts` — the `BaseRenderer` calls `renderSimpleTag()`
 * which the React renderer implements with `createElement`.
 *
 * Color and background are defined as `attributors` — they contribute
 * styles to the nearest element mark rather than wrapping.
 */
export function buildRendererConfig(
  cfg: ResolvedReactConfig,
): RendererConfig<ReactNode, ReactProps> {
  return {
    markPriorities: DEFAULT_MARK_PRIORITIES,

    blocks: {
      paragraph: (node, children) => {
        const custom = tryCustomComponent(cfg, 'paragraph', node, children);
        if (custom !== undefined) return custom;

        const tag = resolveTag(cfg, 'paragraph', node, 'p');
        return createElement(tag, null, children || null);
      },

      header: (node, children) => {
        const level = node.attributes.header as number;
        const custom = tryCustomComponent(cfg, 'header', node, children);
        if (custom !== undefined) return custom;

        const tag = resolveTag(cfg, 'header', node, `h${level}`);
        return createElement(tag, null, children || null);
      },

      blockquote: (node, children) => {
        const custom = tryCustomComponent(cfg, 'blockquote', node, children);
        if (custom !== undefined) return custom;

        const tag = resolveTag(cfg, 'blockquote', node, 'blockquote');
        return createElement(tag, null, children || null);
      },

      'code-block': (node, children) => {
        const lang = node.attributes['code-block'];
        const syntaxClass = `${cfg.classPrefix}-syntax`;
        const className =
          typeof lang === 'string' && lang !== 'true'
            ? `${syntaxClass} language-${lang}`
            : syntaxClass;

        const extraProps: Record<string, unknown> = { className };
        if (typeof lang === 'string' && lang !== 'true') {
          extraProps['data-language'] = lang;
        }

        const custom = tryCustomComponent(cfg, 'code-block', node, children, extraProps);
        if (custom !== undefined) return custom;

        const tag = resolveTag(cfg, 'code-block', node, 'pre');
        return createElement(tag, extraProps, children || null);
      },

      'list-item': (node, children) => {
        const listType = node.attributes.list as string;
        const extraProps: Record<string, unknown> = {};
        if (listType === 'checked') {
          extraProps['data-checked'] = 'true';
        } else if (listType === 'unchecked') {
          extraProps['data-checked'] = 'false';
        }

        const custom = tryCustomComponent(cfg, 'list-item', node, children, extraProps);
        if (custom !== undefined) return custom;

        const tag = resolveTag(cfg, 'list-item', node, 'li');
        return createElement(
          tag,
          Object.keys(extraProps).length > 0 ? extraProps : null,
          children || null,
        );
      },

      list: (node, children) => {
        const listType = node.attributes.list as string;
        const custom = tryCustomComponent(cfg, 'list', node, children);
        if (custom !== undefined) return custom;

        const tag = listType === 'ordered' ? 'ol' : 'ul';
        return createElement(tag, null, children);
      },

      table: (node, children) => {
        const custom = tryCustomComponent(cfg, 'table', node, children);
        if (custom !== undefined) return custom;

        return createElement('table', null, createElement('tbody', null, children));
      },

      'table-row': (node, children) => {
        const custom = tryCustomComponent(cfg, 'table-row', node, children);
        if (custom !== undefined) return custom;

        return createElement('tr', null, children);
      },

      'table-cell': (node, children) => {
        const row = node.attributes.table as string | undefined;
        const extraProps: Record<string, unknown> = {};
        if (row) {
          extraProps['data-row'] = row;
        }

        const custom = tryCustomComponent(cfg, 'table-cell', node, children, extraProps);
        if (custom !== undefined) return custom;

        return createElement(
          'td',
          Object.keys(extraProps).length > 0 ? extraProps : null,
          children,
        );
      },

      image: (node) => {
        const data = node.data;
        const src =
          typeof data === 'string'
            ? data
            : String((data as Record<string, unknown>)?.url ?? data ?? '');
        if (!src) return null;

        const alt = (node.attributes.alt as string) ?? '';
        const width = node.attributes.width as string | undefined;
        const height = node.attributes.height as string | undefined;
        const linkHref = node.attributes.link as string | undefined;

        const imgProps: Record<string, unknown> = { src, alt };
        if (width) imgProps.width = width;
        if (height) imgProps.height = height;

        const custom = tryCustomComponent(cfg, 'image', node, null, imgProps);
        if (custom !== undefined) return custom;

        const imgElement = createElement('img', imgProps);

        if (linkHref) {
          const linkProps: Record<string, unknown> = { href: linkHref };
          if (cfg.linkTarget) linkProps.target = cfg.linkTarget;
          if (cfg.linkRel) linkProps.rel = cfg.linkRel;
          return createElement('a', linkProps, imgElement);
        }

        return imgElement;
      },

      video: (node) => {
        const data = node.data;
        const src =
          typeof data === 'string'
            ? data
            : String((data as Record<string, unknown>)?.url ?? data ?? '');
        if (!src) return null;

        const videoClass = `${cfg.classPrefix}-video`;

        const custom = tryCustomComponent(cfg, 'video', node, null, { src, className: videoClass });
        if (custom !== undefined) return custom;

        return createElement('iframe', {
          className: videoClass,
          src,
          frameBorder: '0',
          allowFullScreen: true,
        });
      },

      formula: (node) => {
        const formulaClass = `${cfg.classPrefix}-formula`;
        const data = node.data as string | Record<string, unknown>;
        const text = typeof data === 'string' ? data : String(data);

        const custom = tryCustomComponent(cfg, 'formula', node, text, { className: formulaClass });
        if (custom !== undefined) return custom;

        return createElement('span', { className: formulaClass }, text);
      },

      mention: (node) => {
        const mentionData = (node.data ?? node.attributes.mention ?? {}) as Record<string, unknown>;
        const name = String(mentionData.name ?? '');
        const slug = mentionData.slug as string | undefined;
        const endpoint = mentionData['end-point'] as string | undefined;
        const mentionClass = mentionData.class as string | undefined;
        const target = mentionData.target as string | undefined;

        const linkProps: Record<string, unknown> = {};
        if (mentionClass) linkProps.className = mentionClass;
        if (endpoint && slug) {
          linkProps.href = `${endpoint}/${slug}`;
        } else {
          linkProps.href = 'about:blank';
        }
        if (target) linkProps.target = target;

        const custom = tryCustomComponent(cfg, 'mention', node, name, linkProps);
        if (custom !== undefined) return custom;

        return createElement('a', linkProps, name);
      },
    },

    // ─── Element Marks (create wrapper elements) ─────────────────────────
    // Reuse SimpleTagMark descriptors — BaseRenderer calls renderSimpleTag()
    marks: {
      bold: boldMark,
      italic: italicMark,
      underline: underlineMark,
      strike: strikeMark,
      code: codeMark,
      script: scriptMark,

      link: (content, value, node) => {
        const href = String(value);
        if (!href) return content;

        const linkProps: Record<string, unknown> = { href };

        // Per-op target/rel override global config
        const target =
          typeof node.attributes.target === 'string' ? node.attributes.target : cfg.linkTarget;
        const rel = typeof node.attributes.rel === 'string' ? node.attributes.rel : cfg.linkRel;

        if (target) linkProps.target = target;
        if (rel) linkProps.rel = rel;

        return createElement('a', linkProps, content);
      },

      font: (content, value) => {
        const className = `${cfg.classPrefix}-font-${String(value)}`;
        return createElement('span', { className }, content);
      },

      size: (content, value) => {
        const className = `${cfg.classPrefix}-size-${String(value)}`;
        return createElement('span', { className }, content);
      },
    },

    // ─── Attributor Marks (contribute attrs to parent element) ───────────
    attributors: {
      color: (value) => ({
        style: { color: String(value) },
      }),

      background: (value) => ({
        style: { backgroundColor: String(value) },
      }),
    },
  };
}
