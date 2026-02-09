import { d, renderDelta } from './test-helpers';

describe('ReactRenderer – inline formatting', () => {
  it('should render bold text', () => {
    const html = renderDelta(
      d({ insert: 'Hello ' }, { insert: 'world', attributes: { bold: true } }, { insert: '\n' }),
    );
    expect(html).toBe('<div><p>Hello <strong>world</strong></p></div>');
  });

  it('should render italic text', () => {
    const html = renderDelta(
      d({ insert: 'Hello ' }, { insert: 'world', attributes: { italic: true } }, { insert: '\n' }),
    );
    expect(html).toBe('<div><p>Hello <em>world</em></p></div>');
  });

  it('should render strikethrough text', () => {
    const html = renderDelta(
      d({ insert: 'Hello ' }, { insert: 'world', attributes: { strike: true } }, { insert: '\n' }),
    );
    expect(html).toBe('<div><p>Hello <s>world</s></p></div>');
  });

  it('should render underline text', () => {
    const html = renderDelta(
      d(
        { insert: 'Hello ' },
        { insert: 'world', attributes: { underline: true } },
        { insert: '\n' },
      ),
    );
    expect(html).toBe('<div><p>Hello <u>world</u></p></div>');
  });

  it('should render inline code', () => {
    const html = renderDelta(
      d(
        { insert: 'Use ' },
        { insert: 'const', attributes: { code: true } },
        { insert: ' keyword\n' },
      ),
    );
    expect(html).toBe('<div><p>Use <code>const</code> keyword</p></div>');
  });

  it('should render superscript', () => {
    const html = renderDelta(
      d({ insert: 'E=mc' }, { insert: '2', attributes: { script: 'super' } }, { insert: '\n' }),
    );
    expect(html).toBe('<div><p>E=mc<sup>2</sup></p></div>');
  });

  it('should render subscript', () => {
    const html = renderDelta(
      d({ insert: 'H' }, { insert: '2', attributes: { script: 'sub' } }, { insert: 'O\n' }),
    );
    expect(html).toBe('<div><p>H<sub>2</sub>O</p></div>');
  });

  it('should render a link', () => {
    const html = renderDelta(
      d({ insert: 'Click here', attributes: { link: 'https://example.com' } }, { insert: '\n' }),
    );
    expect(html).toBe(
      '<div><p><a href="https://example.com" target="_blank">Click here</a></p></div>',
    );
  });

  it('should render bold text inside a link', () => {
    const html = renderDelta(
      d(
        { insert: 'bold link', attributes: { bold: true, link: 'https://example.com' } },
        { insert: '\n' },
      ),
    );
    expect(html).toBe(
      '<div><p><a href="https://example.com" target="_blank"><strong>bold link</strong></a></p></div>',
    );
  });

  it('should render color as inline style via attributor', () => {
    const html = renderDelta(
      d({ insert: 'red text', attributes: { color: '#ff0000' } }, { insert: '\n' }),
    );
    expect(html).toBe('<div><p><span style="color:#ff0000">red text</span></p></div>');
  });

  it('should render background as inline style via attributor', () => {
    const html = renderDelta(
      d({ insert: 'highlighted', attributes: { background: '#ffff00' } }, { insert: '\n' }),
    );
    expect(html).toBe(
      '<div><p><span style="background-color:#ffff00">highlighted</span></p></div>',
    );
  });

  it('should render font class', () => {
    const html = renderDelta(
      d({ insert: 'serif text', attributes: { font: 'serif' } }, { insert: '\n' }),
    );
    expect(html).toBe('<div><p><span class="ql-font-serif">serif text</span></p></div>');
  });

  it('should render size class', () => {
    const html = renderDelta(
      d({ insert: 'large text', attributes: { size: 'large' } }, { insert: '\n' }),
    );
    expect(html).toBe('<div><p><span class="ql-size-large">large text</span></p></div>');
  });
});
