import { d, renderDelta } from './test-helpers';

describe('ReactRenderer – embeds', () => {
  it('should render an image', () => {
    const html = renderDelta(
      d({ insert: { image: 'https://example.com/img.png' } }, { insert: '\n' }),
    );
    // React 19 may prepend a <link rel="preload"> for img elements
    expect(html).toContain('<img src="https://example.com/img.png" alt=""/>');
    expect(html).toContain('<div><p>');
  });

  it('should render an image wrapped in a link', () => {
    const html = renderDelta(
      d(
        {
          insert: { image: 'https://example.com/img.png' },
          attributes: { link: 'https://example.com' },
        },
        { insert: '\n' },
      ),
    );
    expect(html).toContain('<a href="https://example.com" target="_blank">');
    expect(html).toContain('<img src="https://example.com/img.png" alt=""/>');
  });

  it('should render a video iframe', () => {
    const html = renderDelta(
      d({ insert: { video: 'https://youtube.com/embed/abc' } }, { insert: '\n' }),
    );
    expect(html).toContain('iframe');
    expect(html).toContain('class="ql-video"');
    expect(html).toContain('src="https://youtube.com/embed/abc"');
  });

  it('should render a formula', () => {
    const html = renderDelta(d({ insert: { formula: 'E=mc^2' } }, { insert: '\n' }));
    expect(html).toBe('<div><p><span class="ql-formula">E=mc^2</span></p></div>');
  });
});
