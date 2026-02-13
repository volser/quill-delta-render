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
});
