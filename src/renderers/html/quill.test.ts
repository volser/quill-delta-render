import { describe, expect, it } from 'vitest';
import { DEFAULT_BLOCK_ATTRIBUTES } from '../../common/default-block-attributes';
import { listGrouper } from '../../common/transformers/list-grouper';
import { tableGrouper } from '../../common/transformers/table-grouper';
import type { Delta } from '../../core/ast-types';
import { DeltaParser } from '../../core/parser';
import { QuillHtmlRenderer } from './quill';

const QUILL_CONFIG = { blockAttributes: DEFAULT_BLOCK_ATTRIBUTES };

function renderDelta(delta: Delta): string {
  const ast = new DeltaParser(delta, QUILL_CONFIG).use(listGrouper).use(tableGrouper).toAST();
  const renderer = new QuillHtmlRenderer();
  return renderer.render(ast);
}

describe('QuillHtmlRenderer', () => {
  describe('basic blocks', () => {
    it('should render a paragraph', () => {
      const html = renderDelta({
        ops: [{ insert: 'Hello world\n' }],
      });
      expect(html).toBe('<p>Hello world</p>');
    });

    it('should render a header', () => {
      const html = renderDelta({
        ops: [{ insert: 'Title' }, { insert: '\n', attributes: { header: 1 } }],
      });
      expect(html).toBe('<h1>Title</h1>');
    });

    it('should render a blockquote', () => {
      const html = renderDelta({
        ops: [{ insert: 'A quote' }, { insert: '\n', attributes: { blockquote: true } }],
      });
      expect(html).toBe('<blockquote>A quote</blockquote>');
    });

    it('should render a code block with ql-syntax class', () => {
      const html = renderDelta({
        ops: [{ insert: 'const x = 1;' }, { insert: '\n', attributes: { 'code-block': true } }],
      });
      expect(html).toBe('<pre class="ql-syntax">const x = 1;</pre>');
    });

    it('should render a code block with language class', () => {
      const html = renderDelta({
        ops: [
          { insert: 'const x = 1;' },
          { insert: '\n', attributes: { 'code-block': 'javascript' } },
        ],
      });
      expect(html).toBe('<pre class="ql-syntax language-javascript">const x = 1;</pre>');
    });
  });

  describe('ql-* classes', () => {
    it('should add ql-indent class for indented paragraphs', () => {
      const html = renderDelta({
        ops: [{ insert: 'indented' }, { insert: '\n', attributes: { indent: 2 } }],
      });
      expect(html).toBe('<p class="ql-indent-2">indented</p>');
    });

    it('should add ql-align class', () => {
      const html = renderDelta({
        ops: [{ insert: 'centered' }, { insert: '\n', attributes: { align: 'center' } }],
      });
      expect(html).toBe('<p class="ql-align-center">centered</p>');
    });

    it('should add ql-direction class', () => {
      const html = renderDelta({
        ops: [{ insert: 'rtl text' }, { insert: '\n', attributes: { direction: 'rtl' } }],
      });
      expect(html).toBe('<p class="ql-direction-rtl">rtl text</p>');
    });

    it('should combine multiple classes', () => {
      const html = renderDelta({
        ops: [{ insert: 'text' }, { insert: '\n', attributes: { indent: 1, align: 'right' } }],
      });
      expect(html).toBe('<p class="ql-indent-1 ql-align-right">text</p>');
    });
  });

  describe('inline marks', () => {
    it('should render bold', () => {
      const html = renderDelta({
        ops: [{ insert: 'bold', attributes: { bold: true } }, { insert: '\n' }],
      });
      expect(html).toBe('<p><strong>bold</strong></p>');
    });

    it('should render link with target="_blank"', () => {
      const html = renderDelta({
        ops: [{ insert: 'click', attributes: { link: 'https://example.com' } }, { insert: '\n' }],
      });
      expect(html).toBe('<p><a href="https://example.com" target="_blank">click</a></p>');
    });

    it('should render font class', () => {
      const html = renderDelta({
        ops: [{ insert: 'serif', attributes: { font: 'serif' } }, { insert: '\n' }],
      });
      expect(html).toBe('<p><span class="ql-font-serif">serif</span></p>');
    });

    it('should render size class', () => {
      const html = renderDelta({
        ops: [{ insert: 'big', attributes: { size: 'large' } }, { insert: '\n' }],
      });
      expect(html).toBe('<p><span class="ql-size-large">big</span></p>');
    });
  });

  describe('lists', () => {
    it('should render a bullet list', () => {
      const html = renderDelta({
        ops: [
          { insert: 'Item 1' },
          { insert: '\n', attributes: { list: 'bullet' } },
          { insert: 'Item 2' },
          { insert: '\n', attributes: { list: 'bullet' } },
        ],
      });
      expect(html).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
    });

    it('should render checked/unchecked items with data-list attribute', () => {
      const html = renderDelta({
        ops: [
          { insert: 'Done' },
          { insert: '\n', attributes: { list: 'checked' } },
          { insert: 'Not done' },
          { insert: '\n', attributes: { list: 'unchecked' } },
        ],
      });
      expect(html).toBe(
        '<ul><li data-list="checked">Done</li><li data-list="unchecked">Not done</li></ul>',
      );
    });
  });

  describe('tables', () => {
    it('should render a table with rows and cells', () => {
      const html = renderDelta({
        ops: [
          { insert: 'A' },
          { insert: '\n', attributes: { table: 'row-1' } },
          { insert: 'B' },
          { insert: '\n', attributes: { table: 'row-1' } },
          { insert: 'C' },
          { insert: '\n', attributes: { table: 'row-2' } },
          { insert: 'D' },
          { insert: '\n', attributes: { table: 'row-2' } },
        ],
      });
      expect(html).toBe(
        '<table><tbody><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></tbody></table>',
      );
    });
  });

  describe('extensibility', () => {
    it('should allow overriding block handlers at runtime', () => {
      const renderer = new QuillHtmlRenderer();
      renderer.extendBlock('paragraph', (_node, children) => `<div>${children}</div>`);

      const ast = new DeltaParser({ ops: [{ insert: 'text\n' }] }, QUILL_CONFIG).toAST();

      expect(renderer.render(ast)).toBe('<div>text</div>');
    });

    it('should allow overriding mark handlers at runtime', () => {
      const renderer = new QuillHtmlRenderer();
      renderer.extendMark('bold', (content) => `<b>${content}</b>`);

      const ast = new DeltaParser(
        { ops: [{ insert: 'bold', attributes: { bold: true } }, { insert: '\n' }] },
        QUILL_CONFIG,
      ).toAST();

      expect(renderer.render(ast)).toBe('<p><b>bold</b></p>');
    });
  });
});
