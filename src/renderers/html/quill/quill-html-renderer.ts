import { DEFAULT_MARK_PRIORITIES } from '../../../common/default-mark-priorities';
import type { RendererConfig, TNode } from '../../../core/ast-types';
import { BaseHtmlRenderer, escapeHtml } from '../base-html-renderer';

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildClassAttr(classes: string[]): string {
  const filtered = classes.filter(Boolean);
  return filtered.length > 0 ? ` class="${filtered.join(' ')}"` : '';
}

function getBlockClasses(node: TNode): string[] {
  const classes: string[] = [];

  const indent = node.attributes.indent as number | undefined;
  if (indent != null && indent > 0) {
    classes.push(`ql-indent-${indent}`);
  }

  const align = node.attributes.align as string | undefined;
  if (align) {
    classes.push(`ql-align-${align}`);
  }

  const direction = node.attributes.direction as string | undefined;
  if (direction) {
    classes.push(`ql-direction-${direction}`);
  }

  return classes;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const QUILL_HTML_CONFIG: RendererConfig<string> = {
  markPriorities: DEFAULT_MARK_PRIORITIES,
  blocks: {
    paragraph: (node, children) => {
      if (!children) return '';
      const cls = buildClassAttr(getBlockClasses(node));
      return `<p${cls}>${children}</p>`;
    },

    header: (node, children) => {
      const level = node.attributes.header as number;
      const tag = `h${level}`;
      const cls = buildClassAttr(getBlockClasses(node));
      return `<${tag}${cls}>${children}</${tag}>`;
    },

    blockquote: (node, children) => {
      const cls = buildClassAttr(getBlockClasses(node));
      return `<blockquote${cls}>${children}</blockquote>`;
    },

    'code-block': (node, children) => {
      const lang = node.attributes['code-block'];
      const langClass =
        typeof lang === 'string' && lang !== 'true' ? `ql-syntax language-${lang}` : 'ql-syntax';
      const cls = buildClassAttr([langClass, ...getBlockClasses(node)]);
      return `<pre${cls}>${children}</pre>`;
    },

    'list-item': (node, children) => {
      const cls = buildClassAttr(getBlockClasses(node));
      const listType = node.attributes.list as string;

      if (listType === 'checked') {
        return `<li${cls} data-list="checked">${children}</li>`;
      }
      if (listType === 'unchecked') {
        return `<li${cls} data-list="unchecked">${children}</li>`;
      }

      return `<li${cls}>${children}</li>`;
    },

    list: (node, children) => {
      const listType = node.attributes.list;
      const tag = listType === 'ordered' ? 'ol' : 'ul';
      return `<${tag}>${children}</${tag}>`;
    },

    table: (_node, children) => {
      return `<table><tbody>${children}</tbody></table>`;
    },

    'table-row': (_node, children) => {
      return `<tr>${children}</tr>`;
    },

    'table-cell': (_node, children) => {
      return `<td>${children}</td>`;
    },

    image: (node) => {
      const src = node.data as string;
      const alt = (node.attributes.alt as string) ?? '';
      return `<img src="${escapeHtml(String(src))}" alt="${escapeHtml(alt)}" />`;
    },

    video: (node) => {
      const src = node.data as string;
      return `<iframe class="ql-video" src="${escapeHtml(String(src))}" frameborder="0" allowfullscreen></iframe>`;
    },
  },

  marks: {
    bold: (content) => `<strong>${content}</strong>`,
    italic: (content) => `<em>${content}</em>`,
    underline: (content) => `<u>${content}</u>`,
    strike: (content) => `<s>${content}</s>`,

    link: (content, value) => {
      const href = escapeHtml(String(value));
      return `<a href="${href}" target="_blank">${content}</a>`;
    },

    color: (content, value) => {
      return `<span style="color: ${escapeHtml(String(value))}">${content}</span>`;
    },

    background: (content, value) => {
      return `<span style="background-color: ${escapeHtml(String(value))}">${content}</span>`;
    },

    script: (content, value) => {
      const tag = value === 'super' ? 'sup' : 'sub';
      return `<${tag}>${content}</${tag}>`;
    },

    code: (content) => `<code>${content}</code>`,

    font: (content, value) => {
      return `<span class="ql-font-${escapeHtml(String(value))}">${content}</span>`;
    },

    size: (content, value) => {
      return `<span class="ql-size-${escapeHtml(String(value))}">${content}</span>`;
    },
  },
};

/**
 * Renders an AST into Quill-compatible HTML.
 *
 * Produces markup that matches Quill's native output format, including
 * `ql-*` CSS classes for indentation, alignment, direction, fonts, and sizes.
 * Suitable for rendering inside a Quill editor or Quill-styled containers.
 *
 * @example
 * ```ts
 * const renderer = new QuillHtmlRenderer();
 * const html = renderer.render(ast);
 * ```
 */
export class QuillHtmlRenderer extends BaseHtmlRenderer {
  constructor() {
    super(QUILL_HTML_CONFIG);
  }
}
