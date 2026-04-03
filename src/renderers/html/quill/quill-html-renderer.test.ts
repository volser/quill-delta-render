import { describe, expect, it } from 'vitest';
import { DEFAULT_BLOCK_ATTRIBUTES } from '../../../common/default-block-attributes';
import { DeltaParser } from '../../../core/parser';
import { QuillHtmlRenderer } from './quill-html-renderer';

const QUILL_CONFIG = { blockAttributes: DEFAULT_BLOCK_ATTRIBUTES };

describe('QuillHtmlRenderer: renderDelta', () => {
  it('should produce separate <p> per paragraph (no merging)', () => {
    const renderer = new QuillHtmlRenderer();
    const html = renderer.renderDelta({ ops: [{ insert: 'Line 1\nLine 2\nLine 3\n' }] });
    expect(html).toContain('<p>Line 1</p>');
    expect(html).toContain('<p>Line 2</p>');
    expect(html).toContain('<p>Line 3</p>');
    expect(html).not.toContain('<br/>');
  });

  it('should produce separate <p> for multiple ops each ending with \\n', () => {
    const renderer = new QuillHtmlRenderer();
    const html = renderer.renderDelta({
      ops: [{ insert: 'A\n' }, { insert: 'B\n' }, { insert: 'C\n' }],
    });
    expect(html).toBe('<p>A</p><p>B</p><p>C</p>');
  });

  it('should still merge other block types (blockquotes, headers, code)', () => {
    const renderer = new QuillHtmlRenderer();
    const html = renderer.renderDelta({
      ops: [
        { insert: 'q1' },
        { insert: '\n', attributes: { blockquote: true } },
        { insert: 'q2' },
        { insert: '\n', attributes: { blockquote: true } },
      ],
    });
    expect(html).toContain('q1');
    expect(html).toContain('q2');
    expect(html.match(/<blockquote/g)?.length).toBe(1);
  });

  it('should allow overriding blockMerger via options', () => {
    const renderer = new QuillHtmlRenderer();
    const html = renderer.renderDelta(
      { ops: [{ insert: 'A\nB\n' }] },
      { blockMerger: { multiLineParagraph: true } },
    );
    expect(html).toContain('<br/>');
  });
});

describe('QuillHtmlRenderer: extensibility', () => {
  it('should allow overriding block handlers via withBlock()', () => {
    const renderer = new QuillHtmlRenderer().withBlock(
      'paragraph',
      (_node, children) => `<div>${children}</div>`,
    );

    const ast = new DeltaParser({ ops: [{ insert: 'text\n' }] }, QUILL_CONFIG).toAST();
    expect(renderer.render(ast)).toBe('<div>text</div>');
  });

  it('should allow overriding mark handlers via withMark()', () => {
    const renderer = new QuillHtmlRenderer().withMark('bold', (content) => `<b>${content}</b>`);

    const ast = new DeltaParser(
      { ops: [{ insert: 'bold', attributes: { bold: true } }, { insert: '\n' }] },
      QUILL_CONFIG,
    ).toAST();
    expect(renderer.render(ast)).toBe('<p><b>bold</b></p>');
  });

  it('should allow adding custom block handler', () => {
    const renderer = new QuillHtmlRenderer().withBlock(
      'custom-embed',
      (node) => `<div class="custom">${node.data}</div>`,
    );

    const ast = new DeltaParser({ ops: [{ insert: 'text\n' }] }, QUILL_CONFIG).toAST();
    // Custom handler is registered but not triggered by this delta
    expect(renderer.render(ast)).toBe('<p>text</p>');
  });

  it('should allow adding custom mark handler', () => {
    const renderer = new QuillHtmlRenderer().withMark(
      'highlight',
      (content) => `<mark>${content}</mark>`,
    );

    const ast = new DeltaParser(
      { ops: [{ insert: 'hi', attributes: { highlight: true } }, { insert: '\n' }] },
      QUILL_CONFIG,
    ).toAST();
    expect(renderer.render(ast)).toBe('<p><mark>hi</mark></p>');
  });
});
