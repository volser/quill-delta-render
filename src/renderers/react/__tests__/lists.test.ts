import { d, renderDelta } from './test-helpers';

describe('ReactRenderer – lists', () => {
  it('should render bullet list', () => {
    const html = renderDelta(
      d(
        { insert: 'Item one' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'Item two' },
        { insert: '\n', attributes: { list: 'bullet' } },
      ),
    );
    expect(html).toBe('<div><ul><li>Item one</li><li>Item two</li></ul></div>');
  });

  it('should render ordered list', () => {
    const html = renderDelta(
      d(
        { insert: 'First' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'Second' },
        { insert: '\n', attributes: { list: 'ordered' } },
      ),
    );
    expect(html).toBe('<div><ol><li>First</li><li>Second</li></ol></div>');
  });

  it('should render checklist', () => {
    const html = renderDelta(
      d(
        { insert: 'Done' },
        { insert: '\n', attributes: { list: 'checked' } },
        { insert: 'Not done' },
        { insert: '\n', attributes: { list: 'unchecked' } },
      ),
    );
    expect(html).toBe(
      '<div><ul><li data-checked="true">Done</li><li data-checked="false">Not done</li></ul></div>',
    );
  });

  it('should render nested bullet lists', () => {
    const html = renderDelta(
      d(
        { insert: 'root' },
        { insert: '\n', attributes: { list: 'bullet' } },
        { insert: 'nested' },
        { insert: '\n', attributes: { list: 'bullet', indent: 1 } },
      ),
    );
    expect(html).toBe('<div><ul><li>root<ul><li>nested</li></ul></li></ul></div>');
  });

  it('should render nested ordered lists', () => {
    const html = renderDelta(
      d(
        { insert: 'root' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'nested' },
        { insert: '\n', attributes: { list: 'ordered', indent: 1 } },
      ),
    );
    expect(html).toBe('<div><ol><li>root<ol><li>nested</li></ol></li></ol></div>');
  });

  it('should render mixed lists', () => {
    const html = renderDelta(
      d(
        { insert: 'ordered root' },
        { insert: '\n', attributes: { list: 'ordered' } },
        { insert: 'bullet child' },
        { insert: '\n', attributes: { list: 'bullet', indent: 1 } },
      ),
    );
    expect(html).toBe('<div><ol><li>ordered root<ul><li>bullet child</li></ul></li></ol></div>');
  });
});
