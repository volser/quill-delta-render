import { describe, expect, it } from 'vitest';
import type { Delta } from '../../core/ast-types';
import { DeltaParser } from '../../core/parser';
import { SemanticHtmlRenderer } from '../../renderers/html/semantic/semantic-html-renderer';
import { DEFAULT_BLOCK_ATTRIBUTES } from '../default-block-attributes';
import { blockMerger } from './block-merger';
import { listGrouper } from './list-grouper';

const QUILL_CONFIG = { blockAttributes: DEFAULT_BLOCK_ATTRIBUTES };

function renderWithMerger(delta: Delta, mergerConfig?: Parameters<typeof blockMerger>[0]): string {
  const ast = new DeltaParser(delta, QUILL_CONFIG)
    .use(listGrouper)
    .use(blockMerger(mergerConfig))
    .toAST();
  return new SemanticHtmlRenderer().render(ast);
}

describe('blockMerger', () => {
  describe('blockquotes', () => {
    it('should merge consecutive blockquotes by default', () => {
      const html = renderWithMerger({
        ops: [
          { insert: 'line 1' },
          { insert: '\n', attributes: { blockquote: true } },
          { insert: 'line 2' },
          { insert: '\n', attributes: { blockquote: true } },
        ],
      });
      expect(html).toBe('<blockquote>line 1\nline 2</blockquote>');
    });

    it('should not merge blockquotes when disabled', () => {
      const html = renderWithMerger(
        {
          ops: [
            { insert: 'line 1' },
            { insert: '\n', attributes: { blockquote: true } },
            { insert: 'line 2' },
            { insert: '\n', attributes: { blockquote: true } },
          ],
        },
        { multiLineBlockquote: false },
      );
      expect(html).toBe('<blockquote>line 1</blockquote><blockquote>line 2</blockquote>');
    });
  });

  describe('headers', () => {
    it('should merge consecutive same-level headers by default', () => {
      const html = renderWithMerger({
        ops: [
          { insert: 'Title A' },
          { insert: '\n', attributes: { header: 2 } },
          { insert: 'Title B' },
          { insert: '\n', attributes: { header: 2 } },
        ],
      });
      expect(html).toBe('<h2>Title A\nTitle B</h2>');
    });

    it('should not merge different header levels', () => {
      const html = renderWithMerger({
        ops: [
          { insert: 'H1' },
          { insert: '\n', attributes: { header: 1 } },
          { insert: 'H2' },
          { insert: '\n', attributes: { header: 2 } },
        ],
      });
      expect(html).toBe('<h1>H1</h1><h2>H2</h2>');
    });

    it('should not merge headers when disabled', () => {
      const html = renderWithMerger(
        {
          ops: [
            { insert: 'A' },
            { insert: '\n', attributes: { header: 1 } },
            { insert: 'B' },
            { insert: '\n', attributes: { header: 1 } },
          ],
        },
        { multiLineHeader: false },
      );
      expect(html).toBe('<h1>A</h1><h1>B</h1>');
    });
  });

  describe('code blocks', () => {
    it('should merge consecutive code blocks by default', () => {
      const html = renderWithMerger({
        ops: [
          { insert: 'line 1' },
          { insert: '\n', attributes: { 'code-block': true } },
          { insert: 'line 2' },
          { insert: '\n', attributes: { 'code-block': true } },
        ],
      });
      // One <pre> with merged content
      expect(html).toContain('line 1\nline 2');
      expect(html.match(/<pre/g)?.length).toBe(1);
    });

    it('should not merge code blocks with different languages', () => {
      const html = renderWithMerger({
        ops: [
          { insert: 'js code' },
          { insert: '\n', attributes: { 'code-block': 'javascript' } },
          { insert: 'py code' },
          { insert: '\n', attributes: { 'code-block': 'python' } },
        ],
      });
      expect(html.match(/<pre/g)?.length).toBe(2);
    });

    it('should not merge code blocks when disabled', () => {
      const html = renderWithMerger(
        {
          ops: [
            { insert: 'a' },
            { insert: '\n', attributes: { 'code-block': true } },
            { insert: 'b' },
            { insert: '\n', attributes: { 'code-block': true } },
          ],
        },
        { multiLineCodeblock: false },
      );
      expect(html.match(/<pre/g)?.length).toBe(2);
    });
  });

  describe('paragraphs', () => {
    it('should NOT merge paragraphs by default', () => {
      const html = renderWithMerger({
        ops: [{ insert: 'line 1\nline 2\n' }],
      });
      expect(html).toBe('<p>line 1</p><p>line 2</p>');
    });

    it('should merge paragraphs when enabled', () => {
      const html = renderWithMerger(
        { ops: [{ insert: 'line 1\nline 2\n' }] },
        { multiLineParagraph: true },
      );
      expect(html).toBe('<p>line 1\nline 2</p>');
    });

    it('should not merge paragraphs with different alignments', () => {
      const html = renderWithMerger(
        {
          ops: [
            { insert: 'left' },
            { insert: '\n' },
            { insert: 'center' },
            { insert: '\n', attributes: { align: 'center' } },
          ],
        },
        { multiLineParagraph: true },
      );
      // Different styles, should stay separate
      expect(html).toContain('<p>left</p>');
      expect(html).toContain('center');
    });
  });

  describe('mixed content', () => {
    it('should not merge different block types', () => {
      const html = renderWithMerger({
        ops: [
          { insert: 'quote' },
          { insert: '\n', attributes: { blockquote: true } },
          { insert: 'heading' },
          { insert: '\n', attributes: { header: 1 } },
        ],
      });
      expect(html).toBe('<blockquote>quote</blockquote><h1>heading</h1>');
    });

    it('should not affect non-mergeable blocks', () => {
      const html = renderWithMerger({
        ops: [
          { insert: 'item 1' },
          { insert: '\n', attributes: { list: 'bullet' } },
          { insert: 'item 2' },
          { insert: '\n', attributes: { list: 'bullet' } },
        ],
      });
      // Lists should not be affected by block merger
      expect(html).toBe('<ul><li>item 1</li><li>item 2</li></ul>');
    });

    it('should merge blockquotes around non-mergeable blocks', () => {
      const html = renderWithMerger({
        ops: [
          { insert: 'q1' },
          { insert: '\n', attributes: { blockquote: true } },
          { insert: 'q2' },
          { insert: '\n', attributes: { blockquote: true } },
          { insert: 'para' },
          { insert: '\n' },
          { insert: 'q3' },
          { insert: '\n', attributes: { blockquote: true } },
        ],
      });
      expect(html).toBe('<blockquote>q1\nq2</blockquote><p>para</p><blockquote>q3</blockquote>');
    });
  });
});
