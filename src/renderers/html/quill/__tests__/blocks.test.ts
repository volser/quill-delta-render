import { describe, expect, it } from 'vitest';
import { renderDelta, renderDeltaWithMerger } from './test-helpers';

describe('QuillHtmlRenderer integration: blocks', () => {
  it('should render a paragraph', () => {
    expect(renderDelta({ ops: [{ insert: 'Hello world\n' }] })).toBe('<p>Hello world</p>');
  });

  it('should render empty paragraph with <br>', () => {
    expect(renderDelta({ ops: [{ insert: '\n' }] })).toBe('<p><br></p>');
  });

  it('should render multiple blank lines', () => {
    expect(renderDelta({ ops: [{ insert: '\n\n' }] })).toBe('<p><br></p><p><br></p>');
  });

  it('should render newlines as separate paragraphs', () => {
    expect(renderDelta({ ops: [{ insert: 'line1\nline2\n' }] })).toBe('<p>line1</p><p>line2</p>');
  });

  it('should render header levels 1-6', () => {
    for (let level = 1; level <= 6; level++) {
      const html = renderDelta({
        ops: [{ insert: 'H' }, { insert: '\n', attributes: { header: level } }],
      });
      expect(html).toBe(`<h${level}>H</h${level}>`);
    }
  });

  it('should render empty header with <br>', () => {
    const html = renderDelta({
      ops: [{ insert: '\n', attributes: { header: 2 } }],
    });
    expect(html).toBe('<h2><br></h2>');
  });

  it('should render a blockquote', () => {
    const html = renderDelta({
      ops: [{ insert: 'A quote' }, { insert: '\n', attributes: { blockquote: true } }],
    });
    expect(html).toBe('<blockquote>A quote</blockquote>');
  });

  it('should render empty blockquote with <br>', () => {
    const html = renderDelta({
      ops: [{ insert: '\n', attributes: { blockquote: true } }],
    });
    expect(html).toBe('<blockquote><br></blockquote>');
  });

  it('should render a code block with ql-syntax and spellcheck="false"', () => {
    const html = renderDelta({
      ops: [{ insert: 'const x = 1;' }, { insert: '\n', attributes: { 'code-block': true } }],
    });
    expect(html).toBe('<pre class="ql-syntax" spellcheck="false">const x = 1;</pre>');
  });

  it('should render a code block with language class and data-language', () => {
    const html = renderDelta({
      ops: [
        { insert: 'const x = 1;' },
        { insert: '\n', attributes: { 'code-block': 'javascript' } },
      ],
    });
    expect(html).toContain('class="ql-syntax language-javascript"');
    expect(html).toContain('data-language="javascript"');
    expect(html).toContain('spellcheck="false"');
    expect(html).toContain('const x = 1;');
  });

  it('should render empty code block with <br>', () => {
    const html = renderDelta({
      ops: [{ insert: '\n', attributes: { 'code-block': true } }],
    });
    expect(html).toBe('<pre class="ql-syntax" spellcheck="false"><br></pre>');
  });
});

describe('QuillHtmlRenderer integration: ql-* layout classes', () => {
  it('should add ql-indent class', () => {
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
      ops: [{ insert: 'rtl' }, { insert: '\n', attributes: { direction: 'rtl' } }],
    });
    expect(html).toBe('<p class="ql-direction-rtl">rtl</p>');
  });

  it('should combine multiple layout classes', () => {
    const html = renderDelta({
      ops: [{ insert: 'text' }, { insert: '\n', attributes: { indent: 1, align: 'right' } }],
    });
    expect(html).toBe('<p class="ql-indent-1 ql-align-right">text</p>');
  });

  it('should add layout classes to headers', () => {
    const html = renderDelta({
      ops: [{ insert: 'Title' }, { insert: '\n', attributes: { header: 1, align: 'center' } }],
    });
    expect(html).toBe('<h1 class="ql-align-center">Title</h1>');
  });

  it('should add layout classes to blockquotes', () => {
    const html = renderDelta({
      ops: [{ insert: 'Quote' }, { insert: '\n', attributes: { blockquote: true, indent: 1 } }],
    });
    expect(html).toBe('<blockquote class="ql-indent-1">Quote</blockquote>');
  });
});

describe('QuillHtmlRenderer integration: multi-line code block merging', () => {
  it('should merge consecutive code blocks into one pre', () => {
    const html = renderDeltaWithMerger({
      ops: [
        { insert: 'line 1' },
        { insert: '\n', attributes: { 'code-block': true } },
        { insert: 'line 2' },
        { insert: '\n', attributes: { 'code-block': true } },
        { insert: 'line 3' },
        { insert: '\n', attributes: { 'code-block': true } },
      ],
    });
    expect(html.match(/<pre/g)?.length).toBe(1);
    expect(html).toContain('line 1');
    expect(html).toContain('line 2');
    expect(html).toContain('line 3');
  });

  it('should HTML-encode content inside code blocks', () => {
    const html = renderDeltaWithMerger({
      ops: [{ insert: '<p>hello</p>' }, { insert: '\n', attributes: { 'code-block': true } }],
    });
    expect(html).toContain('&lt;p&gt;hello&lt;/p&gt;');
  });
});
