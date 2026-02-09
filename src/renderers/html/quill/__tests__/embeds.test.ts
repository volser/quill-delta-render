import { describe, expect, it } from 'vitest';
import { renderDelta } from './test-helpers';

describe('QuillHtmlRenderer integration: embeds', () => {
  describe('image', () => {
    it('should render a basic image', () => {
      const html = renderDelta({
        ops: [{ insert: { image: 'https://example.com/img.png' } }, { insert: '\n' }],
      });
      expect(html).toContain('<img src="https://example.com/img.png" alt="" />');
    });

    it('should render image with alt text', () => {
      const html = renderDelta({
        ops: [
          { insert: { image: 'https://example.com/img.png' }, attributes: { alt: 'Photo' } },
          { insert: '\n' },
        ],
      });
      expect(html).toContain('alt="Photo"');
    });

    it('should render image with width', () => {
      const html = renderDelta({
        ops: [
          { insert: { image: 'https://example.com/img.png' }, attributes: { width: '200' } },
          { insert: '\n' },
        ],
      });
      expect(html).toContain('width="200"');
    });

    it('should HTML-encode image src', () => {
      const html = renderDelta({
        ops: [{ insert: { image: 'https://example.com/img.png?a=1&b=2' } }, { insert: '\n' }],
      });
      expect(html).toContain('src="https://example.com/img.png?a=1&amp;b=2"');
    });
  });

  describe('video', () => {
    it('should render an iframe with ql-video class', () => {
      const html = renderDelta({
        ops: [{ insert: { video: 'https://example.com/v.mp4' } }, { insert: '\n' }],
      });
      expect(html).toContain('class="ql-video"');
      expect(html).toContain('src="https://example.com/v.mp4"');
      expect(html).toContain('frameborder="0"');
      expect(html).toContain('allowfullscreen="true"');
    });

    it('should HTML-encode video src', () => {
      const html = renderDelta({
        ops: [{ insert: { video: 'https://example.com/v.mp4?a=1&b=2' } }, { insert: '\n' }],
      });
      expect(html).toContain('src="https://example.com/v.mp4?a=1&amp;b=2"');
    });
  });

  describe('formula', () => {
    it('should render formula with ql-formula class and data-value', () => {
      const html = renderDelta({
        ops: [{ insert: { formula: 'e=mc^2' } }, { insert: '\n' }],
      });
      expect(html).toContain('class="ql-formula"');
      expect(html).toContain('data-value="e=mc^2"');
      expect(html).toContain('>e=mc^2</span>');
    });

    it('should HTML-encode formula text', () => {
      const html = renderDelta({
        ops: [{ insert: { formula: 'x < y & z > w' } }, { insert: '\n' }],
      });
      expect(html).toContain('data-value="x &lt; y &amp; z &gt; w"');
      expect(html).toContain('>x &lt; y &amp; z &gt; w</span>');
    });
  });
});
