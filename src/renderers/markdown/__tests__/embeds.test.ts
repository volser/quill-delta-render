import { d, renderDelta } from './test-helpers';

describe('MarkdownRenderer – embeds', () => {
  it('should render an image', () => {
    const md = renderDelta(
      d({ insert: { image: 'https://example.com/img.png' } }, { insert: '\n' }),
    );
    expect(md).toBe('![](https://example.com/img.png)');
  });

  it('should render a horizontal rule (divider)', () => {
    const md = renderDelta(
      d(
        { insert: 'Before' },
        { insert: '\n' },
        { insert: { divider: true } },
        { insert: 'After' },
        { insert: '\n' },
      ),
    );
    expect(md).toBe('Before\n* * *\nAfter');
  });

  it('should return empty for unknown embed types when no embedHandler', () => {
    const md = renderDelta(d({ insert: { unknown_embed: { data: 'test' } } }, { insert: '\n' }));
    expect(md).toBe('');
  });

  it('should render custom embed via embedHandler', () => {
    const md = renderDelta(
      d({ insert: { myEmbed: { id: '42', title: 'Custom' } } }, { insert: '\n' }),
      {
        embedHandler: (node) => {
          if (node.type === 'myEmbed' && node.data && typeof node.data === 'object') {
            const d = node.data as Record<string, unknown>;
            return `[${String(d.title)}](#embed/${d.id})`;
          }
          return undefined;
        },
      },
    );
    expect(md).toBe('[Custom](#embed/42)');
  });
});
