import { describe, expect, it } from 'vitest';
import { DEFAULT_BLOCK_ATTRIBUTES } from '../../../common/default-block-attributes';
import { DeltaParser } from '../../../core/parser';
import { QuillHtmlRenderer } from './quill-html-renderer';

const QUILL_CONFIG = { blockAttributes: DEFAULT_BLOCK_ATTRIBUTES };

describe('QuillHtmlRenderer: extensibility', () => {
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

  it('should allow adding custom block handler', () => {
    const renderer = new QuillHtmlRenderer();
    renderer.extendBlock('custom-embed', (node) => `<div class="custom">${node.data}</div>`);

    const ast = new DeltaParser({ ops: [{ insert: 'text\n' }] }, QUILL_CONFIG).toAST();
    // Custom handler is registered but not triggered by this delta
    expect(renderer.render(ast)).toBe('<p>text</p>');
  });

  it('should allow adding custom mark handler', () => {
    const renderer = new QuillHtmlRenderer();
    renderer.extendMark('highlight', (content) => `<mark>${content}</mark>`);

    const ast = new DeltaParser(
      { ops: [{ insert: 'hi', attributes: { highlight: true } }, { insert: '\n' }] },
      QUILL_CONFIG,
    ).toAST();
    expect(renderer.render(ast)).toBe('<p><mark>hi</mark></p>');
  });
});
