import { d, renderDeltaHtml } from './test-helpers';

describe('HtmlMarkdownRenderer – inline formatting', () => {
  it('should render underline as HTML <u>', () => {
    const md = renderDeltaHtml(
      d(
        { insert: 'Hello ' },
        { insert: 'underlined', attributes: { underline: true } },
        { insert: '\n' },
      ),
    );
    expect(md).toBe('Hello <u>underlined</u>');
  });

  it('should render subscript as HTML <sub>', () => {
    const md = renderDeltaHtml(
      d({ insert: 'H' }, { insert: '2', attributes: { script: 'sub' } }, { insert: 'O\n' }),
    );
    expect(md).toBe('H<sub>2</sub>O');
  });

  it('should render superscript as HTML <sup>', () => {
    const md = renderDeltaHtml(
      d({ insert: 'E=mc' }, { insert: '2', attributes: { script: 'super' } }, { insert: '\n' }),
    );
    expect(md).toBe('E=mc<sup>2</sup>');
  });

  it('should render color as <span color="...">', () => {
    const md = renderDeltaHtml(
      d({ insert: 'red text', attributes: { color: '#e60000' } }, { insert: '\n' }),
    );
    expect(md).toBe('<span color="#e60000">red text</span>');
  });

  it('should render background as <span background-color="...">', () => {
    const md = renderDeltaHtml(
      d({ insert: 'highlighted', attributes: { background: '#ffebcc' } }, { insert: '\n' }),
    );
    expect(md).toBe('<span background-color="#ffebcc">highlighted</span>');
  });

  it('should render font as <span font="...">', () => {
    const md = renderDeltaHtml(
      d({ insert: 'mono', attributes: { font: 'monospace' } }, { insert: '\n' }),
    );
    expect(md).toBe('<span font="monospace">mono</span>');
  });

  it('should render size as <span size="...">', () => {
    const md = renderDeltaHtml(
      d({ insert: 'large', attributes: { size: 'large' } }, { insert: '\n' }),
    );
    expect(md).toBe('<span size="large">large</span>');
  });

  it('should output one span with all attributes when color and font apply', () => {
    const md = renderDeltaHtml(
      d({ insert: 'styled', attributes: { color: 'red', font: 'mono' } }, { insert: '\n' }),
    );
    expect(md).toBe('<span color="red" font="mono">styled</span>');
  });

  it('should output one span when color, background, font and size apply', () => {
    const md = renderDeltaHtml(
      d(
        {
          insert: 'all',
          attributes: {
            color: '#e60000',
            background: '#ffebcc',
            font: 'monospace',
            size: 'large',
          },
        },
        { insert: '\n' },
      ),
    );
    expect(md).toContain('<span ');
    expect(md).toContain('color="#e60000"');
    expect(md).toContain('background-color="#ffebcc"');
    expect(md).toContain('font="monospace"');
    expect(md).toContain('size="large"');
    expect(md).toContain('>all</span>');
  });

  it('should wrap Markdown syntax in span when color and bold apply', () => {
    const md = renderDeltaHtml(
      d({ insert: 'bold red', attributes: { bold: true, color: 'red' } }, { insert: '\n' }),
    );
    expect(md).toBe('<span color="red">**bold red**</span>');
  });

  it('should render mixed format: underline, color, font, bold and italic in one span', () => {
    const md = renderDeltaHtml(
      d(
        {
          insert: 'mixed',
          attributes: {
            underline: true,
            color: 'red',
            font: 'monospace',
            bold: true,
            italic: true,
          },
        },
        { insert: '\n' },
      ),
    );
    expect(md).toBe('<span color="red" font="monospace">**_<u>mixed</u>_**</span>');
  });

  it('should render custom embed via embedHandler (HTML)', () => {
    const md = renderDeltaHtml(
      d({ insert: { widget: { type: 'chart', id: 'c1' } } }, { insert: '\n' }),
      {
        embedHandler: (node) => {
          if (node.type === 'widget' && node.data && typeof node.data === 'object') {
            const data = node.data as Record<string, unknown>;
            return `<div class="embed" data-type="${data.type}" data-id="${data.id}"></div>`;
          }
          return undefined;
        },
      },
    );
    expect(md).toBe('<div class="embed" data-type="chart" data-id="c1"></div>');
  });

  it('should render embed via embedAttributesHandler only (HTML)', () => {
    const md = renderDeltaHtml(
      d({ insert: { widget: { type: 'chart', id: 'c1' } } }, { insert: '\n' }),
      {
        embedAttributesHandler: (node) => {
          if (node.type === 'widget' && node.data && typeof node.data === 'object') {
            const data = node.data as Record<string, unknown>;
            return { type: String(data.type), id: String(data.id) };
          }
          return undefined;
        },
      },
    );
    expect(md).toBe('<embed data-embed-type="widget" data-type="chart" data-id="c1" />');
  });

  it('should prefer embedHandler over embedAttributesHandler (HTML)', () => {
    const md = renderDeltaHtml(d({ insert: { widget: { id: 'c1' } } }, { insert: '\n' }), {
      embedHandler: () => '<custom/>',
      embedAttributesHandler: () => ({ id: 'c1' }),
    });
    expect(md).toBe('<custom/>');
  });
});
