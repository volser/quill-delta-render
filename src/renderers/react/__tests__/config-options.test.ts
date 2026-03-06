import { d, renderDelta } from './test-helpers';

describe('ReactRenderer – config options', () => {
  it('should support custom classPrefix', () => {
    const html = renderDelta(
      d({ insert: 'mono', attributes: { font: 'monospace' } }, { insert: '\n' }),
      { classPrefix: 'article' },
    );
    expect(html).toContain('class="article-font-monospace"');
  });

  it('should support custom linkTarget', () => {
    const html = renderDelta(
      d({ insert: 'link', attributes: { link: 'https://example.com' } }, { insert: '\n' }),
      { linkTarget: '_self' },
    );
    expect(html).toContain('target="_self"');
  });

  it('should support empty linkTarget (omit target)', () => {
    const html = renderDelta(
      d({ insert: 'link', attributes: { link: 'https://example.com' } }, { insert: '\n' }),
      { linkTarget: '' },
    );
    expect(html).not.toContain('target=');
  });

  it('should support linkRel', () => {
    const html = renderDelta(
      d({ insert: 'link', attributes: { link: 'https://example.com' } }, { insert: '\n' }),
      { linkRel: 'noopener noreferrer' },
    );
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
