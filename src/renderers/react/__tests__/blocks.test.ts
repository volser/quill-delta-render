import { d, renderDelta } from './test-helpers';

describe('ReactRenderer – blocks', () => {
  describe('headers', () => {
    it('should render h1', () => {
      const html = renderDelta(d({ insert: 'Title' }, { insert: '\n', attributes: { header: 1 } }));
      expect(html).toBe('<div><h1>Title</h1></div>');
    });

    it('should render h2', () => {
      const html = renderDelta(
        d({ insert: 'Subtitle' }, { insert: '\n', attributes: { header: 2 } }),
      );
      expect(html).toBe('<div><h2>Subtitle</h2></div>');
    });

    it('should render h3 through h6', () => {
      for (let level = 3; level <= 6; level++) {
        const html = renderDelta(
          d({ insert: `Heading ${level}` }, { insert: '\n', attributes: { header: level } }),
        );
        expect(html).toBe(`<div><h${level}>Heading ${level}</h${level}></div>`);
      }
    });
  });

  describe('blockquotes', () => {
    it('should render a blockquote', () => {
      const html = renderDelta(
        d({ insert: 'A quote' }, { insert: '\n', attributes: { blockquote: true } }),
      );
      expect(html).toBe('<div><blockquote>A quote</blockquote></div>');
    });
  });

  describe('code blocks', () => {
    it('should render a single-line code block', () => {
      const html = renderDelta(
        d({ insert: 'const x = 1;' }, { insert: '\n', attributes: { 'code-block': true } }),
      );
      expect(html).toBe('<div><pre><code class="ql-syntax">const x = 1;</code></pre></div>');
    });

    it('should render a multi-line code block', () => {
      const html = renderDelta(
        d(
          { insert: 'const x = 1;' },
          { insert: '\n', attributes: { 'code-block': true } },
          { insert: 'const y = 2;' },
          { insert: '\n', attributes: { 'code-block': true } },
        ),
      );
      expect(html).toBe(
        '<div><pre><code class="ql-syntax">const x = 1;\nconst y = 2;</code></pre></div>',
      );
    });

    it('should render a code block with language', () => {
      const html = renderDelta(
        d({ insert: 'const x = 1;' }, { insert: '\n', attributes: { 'code-block': 'javascript' } }),
      );
      expect(html).toBe(
        '<div><pre><code class="ql-syntax language-javascript">const x = 1;</code></pre></div>',
      );
    });
  });

  describe('paragraphs', () => {
    it('should render a paragraph', () => {
      const html = renderDelta(d({ insert: 'Hello world\n' }));
      expect(html).toBe('<div><p>Hello world</p></div>');
    });

    it('should render multiple paragraphs', () => {
      const html = renderDelta(
        d({ insert: 'First paragraph\n' }, { insert: 'Second paragraph\n' }),
      );
      expect(html).toBe('<div><p>First paragraph</p><p>Second paragraph</p></div>');
    });
  });
});
