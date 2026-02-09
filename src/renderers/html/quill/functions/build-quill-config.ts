import { DEFAULT_MARK_PRIORITIES } from '../../../../common/default-mark-priorities';
import type { RendererConfig } from '../../../../core/ast-types';
import { escapeHtml } from '../../base-html-renderer';
import { buildAttrString, buildClassAttr } from '../../common/build-attr-string';
import { getLayoutClasses } from '../../common/get-layout-classes';
import {
  boldMark,
  codeMark,
  italicMark,
  scriptMark,
  strikeMark,
  underlineMark,
} from '../../common/simple-marks';

const PREFIX = 'ql';

/**
 * Build the full `RendererConfig` for the Quill-native HTML renderer.
 *
 * Produces markup that exactly matches Quill editor's output, including:
 * - `ql-*` CSS classes for indentation, alignment, direction, fonts, sizes
 * - `<br>` for empty blocks (matching Quill's behavior)
 * - `spellcheck="false"` on code blocks
 * - `rel="noopener noreferrer"` on links
 * - `data-row` on table cells
 * - `data-list` for checked/unchecked list items
 * - `data-language` on code blocks with a specified language
 */
export function buildQuillConfig(): RendererConfig<string> {
  return {
    markPriorities: DEFAULT_MARK_PRIORITIES,
    blocks: {
      paragraph: (node, children) => {
        const cls = buildClassAttr(getLayoutClasses(node, PREFIX));
        const content = children || '<br>';
        return `<p${cls}>${content}</p>`;
      },

      header: (node, children) => {
        const level = node.attributes.header as number;
        const tag = `h${level}`;
        const cls = buildClassAttr(getLayoutClasses(node, PREFIX));
        const content = children || '<br>';
        return `<${tag}${cls}>${content}</${tag}>`;
      },

      blockquote: (node, children) => {
        const cls = buildClassAttr(getLayoutClasses(node, PREFIX));
        const content = children || '<br>';
        return `<blockquote${cls}>${content}</blockquote>`;
      },

      'code-block': (node, children) => {
        const lang = node.attributes['code-block'];
        const langClass =
          typeof lang === 'string' && lang !== 'true'
            ? `${PREFIX}-syntax language-${lang}`
            : `${PREFIX}-syntax`;

        const classes = [langClass, ...getLayoutClasses(node, PREFIX)];
        const attrs: Record<string, string> = {
          class: classes.filter(Boolean).join(' '),
          spellcheck: 'false',
        };

        if (typeof lang === 'string' && lang !== 'true') {
          attrs['data-language'] = lang;
        }

        const content = children || '<br>';
        return `<pre${buildAttrString(attrs)}>${content}</pre>`;
      },

      'list-item': (node, children) => {
        const listType = node.attributes.list as string;
        const content = children || '<br>';
        const layoutClasses = getLayoutClasses(node, PREFIX);

        const attrs: Record<string, string> = {};
        if (layoutClasses.length > 0) {
          attrs.class = layoutClasses.join(' ');
        }
        if (listType === 'checked' || listType === 'unchecked') {
          attrs['data-list'] = listType;
        }

        return `<li${buildAttrString(attrs)}>${content}</li>`;
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

      'table-cell': (node, children) => {
        const row = node.attributes.table as string | undefined;
        const attrs: Record<string, string> = {};
        if (row) {
          attrs['data-row'] = row;
        }
        return `<td${buildAttrString(attrs)}>${children}</td>`;
      },

      image: (node) => {
        const src = escapeHtml(String(node.data));
        const alt = escapeHtml((node.attributes.alt as string) ?? '');
        const width = node.attributes.width as string | undefined;
        const height = node.attributes.height as string | undefined;

        let imgAttrs = `src="${src}"`;
        if (width) {
          imgAttrs += ` width="${escapeHtml(width)}"`;
        }
        if (height) {
          imgAttrs += ` height="${escapeHtml(height)}"`;
        }
        imgAttrs += ` alt="${alt}"`;

        return `<img ${imgAttrs} />`;
      },

      video: (node) => {
        const src = escapeHtml(String(node.data));
        const width = node.attributes.width as string | undefined;
        const height = node.attributes.height as string | undefined;

        let attrs = `class="${PREFIX}-video" src="${src}" frameborder="0" allowfullscreen="true"`;
        if (width) {
          attrs += ` width="${escapeHtml(width)}"`;
        }
        if (height) {
          attrs += ` height="${escapeHtml(height)}"`;
        }

        return `<iframe ${attrs}></iframe>`;
      },

      formula: (node) => {
        const data = node.data as string | Record<string, unknown>;
        const text = typeof data === 'string' ? data : String(data);
        return `<span class="${PREFIX}-formula" data-value="${escapeHtml(text)}">${escapeHtml(text)}</span>`;
      },
    },

    marks: {
      bold: boldMark,
      italic: italicMark,
      underline: underlineMark,
      strike: strikeMark,
      script: scriptMark,
      code: codeMark,

      link: (content, value) => {
        const href = escapeHtml(String(value));
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${content}</a>`;
      },

      color: (content, value) => {
        return `<span style="color: ${escapeHtml(String(value))}">${content}</span>`;
      },

      background: (content, value) => {
        return `<span style="background-color: ${escapeHtml(String(value))}">${content}</span>`;
      },

      font: (content, value) => {
        return `<span class="${PREFIX}-font-${escapeHtml(String(value))}">${content}</span>`;
      },

      size: (content, value) => {
        return `<span class="${PREFIX}-size-${escapeHtml(String(value))}">${content}</span>`;
      },
    },
  };
}
